'use node';

import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';

const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 300000; // 5 minutes

// Resolution to pixel dimensions mapping
const RESOLUTION_MAP: Record<string, { width: number; height: number }> = {
  '512': { width: 512, height: 512 },
  '768': { width: 768, height: 768 },
  '1024': { width: 1024, height: 1024 },
};

/**
 * Creates a FLUX workflow JSON for ComfyUI.
 * This is a simplified workflow structure - actual FLUX workflows may vary.
 */
function createFluxWorkflow(prompt: string, resolution: string): Record<string, unknown> {
  const { width, height } = RESOLUTION_MAP[resolution] || RESOLUTION_MAP['512'];
  const seed = Math.floor(Math.random() * 2147483647);

  return {
    '3': {
      class_type: 'KSampler',
      inputs: {
        seed,
        steps: 20,
        cfg: 7,
        sampler_name: 'euler',
        scheduler: 'normal',
        denoise: 1,
        model: ['4', 0],
        positive: ['6', 0],
        negative: ['7', 0],
        latent_image: ['5', 0],
      },
    },
    '4': {
      class_type: 'CheckpointLoaderSimple',
      inputs: {
        ckpt_name: 'flux1-dev.safetensors',
      },
    },
    '5': {
      class_type: 'EmptyLatentImage',
      inputs: {
        width,
        height,
        batch_size: 1,
      },
    },
    '6': {
      class_type: 'CLIPTextEncode',
      inputs: {
        text: prompt,
        clip: ['4', 1],
      },
    },
    '7': {
      class_type: 'CLIPTextEncode',
      inputs: {
        text: '',
        clip: ['4', 1],
      },
    },
    '8': {
      class_type: 'VAEDecode',
      inputs: {
        samples: ['3', 0],
        vae: ['4', 2],
      },
    },
    '9': {
      class_type: 'SaveImage',
      inputs: {
        filename_prefix: 'ComfyUI',
        images: ['8', 0],
      },
    },
  };
}

interface ComfyUISubmitResponse {
  prompt_id: string;
  number?: number;
  node_errors?: Record<string, unknown>;
}

interface ComfyUIHistoryOutput {
  images?: Array<{
    filename: string;
    subfolder: string;
    type: string;
  }>;
}

interface ComfyUIHistoryEntry {
  status?: {
    status_str?: string;
    completed?: boolean;
  };
  outputs?: Record<string, ComfyUIHistoryOutput>;
}

type ComfyUIHistory = Record<string, ComfyUIHistoryEntry>;

/**
 * Submits a workflow to ComfyUI and returns the prompt_id.
 */
async function submitWorkflow(
  endpoint: string,
  workflow: Record<string, unknown>
): Promise<string> {
  const response = await fetch(`${endpoint}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ComfyUI submit error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as ComfyUISubmitResponse;

  if (data.node_errors && Object.keys(data.node_errors).length > 0) {
    throw new Error(`ComfyUI workflow errors: ${JSON.stringify(data.node_errors)}`);
  }

  return data.prompt_id;
}

/**
 * Polls ComfyUI history for job completion.
 * Returns the output image info when complete, or null if still processing.
 */
async function checkCompletion(
  endpoint: string,
  promptId: string
): Promise<{ filename: string; subfolder: string; type: string } | null> {
  const response = await fetch(`${endpoint}/history/${promptId}`);

  if (!response.ok) {
    // History not ready yet
    if (response.status === 404) {
      return null;
    }
    throw new Error(`ComfyUI history error (${response.status})`);
  }

  const history = (await response.json()) as ComfyUIHistory;
  const entry = history[promptId];

  if (!entry) {
    return null;
  }

  // Check if completed
  if (!entry.outputs) {
    return null;
  }

  // Find the SaveImage output node (node '9' in our workflow)
  for (const nodeId of Object.keys(entry.outputs)) {
    const output = entry.outputs[nodeId];
    if (output.images && output.images.length > 0) {
      return output.images[0];
    }
  }

  return null;
}

/**
 * Downloads an image from ComfyUI.
 */
async function downloadImage(
  endpoint: string,
  filename: string,
  subfolder: string,
  type: string
): Promise<Blob> {
  const params = new URLSearchParams({
    filename,
    subfolder,
    type,
  });

  const response = await fetch(`${endpoint}/view?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`ComfyUI download error (${response.status})`);
  }

  return await response.blob();
}

/**
 * Sleeps for the specified duration.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const processJob = internalAction({
  args: {
    jobId: v.id('imageJobs'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const endpoint = process.env.COMFYUI_ENDPOINT_URL;

    if (!endpoint) {
      await ctx.runMutation(internal.imageJobs.updateStatus, {
        jobId: args.jobId,
        status: 'failed',
        error: 'Missing COMFYUI_ENDPOINT_URL environment variable',
      });
      return null;
    }

    const job = await ctx.runQuery(internal.imageJobs.getInternal, {
      jobId: args.jobId,
    });

    if (!job) {
      return null;
    }

    await ctx.runMutation(internal.imageJobs.updateStatus, {
      jobId: args.jobId,
      status: 'processing',
    });

    try {
      const workflow = createFluxWorkflow(job.prompt, job.resolution);
      const promptId = await submitWorkflow(endpoint, workflow);

      const startTime = Date.now();
      let imageInfo: { filename: string; subfolder: string; type: string } | null = null;

      while (Date.now() - startTime < TIMEOUT_MS) {
        imageInfo = await checkCompletion(endpoint, promptId);

        if (imageInfo) {
          break;
        }

        await sleep(POLL_INTERVAL_MS);
      }

      if (!imageInfo) {
        throw new Error('Image generation timed out after 5 minutes');
      }

      const imageBlob = await downloadImage(
        endpoint,
        imageInfo.filename,
        imageInfo.subfolder,
        imageInfo.type
      );

      const storageId = await ctx.storage.store(imageBlob);

      await ctx.runMutation(internal.imageJobs.updateStatus, {
        jobId: args.jobId,
        status: 'completed',
        resultStorageId: storageId,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await ctx.runMutation(internal.imageJobs.updateStatus, {
        jobId: args.jobId,
        status: 'failed',
        error: errorMessage,
      });
    }

    return null;
  },
});
