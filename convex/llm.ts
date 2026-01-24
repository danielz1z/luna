'use node';

import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { COST_PER_100_TOKENS } from './credits';

const CHARS_PER_TOKEN_ESTIMATE = 4;
const UPDATE_INTERVAL_MS = 500;
const UPDATE_TOKEN_THRESHOLD = 50;
const MAX_RETRIES = 1;
const DEFAULT_MAX_TOKENS = 2048;
const CONTEXT_TOKEN_LIMIT = 4096;

function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN_ESTIMATE);
}

function calculateCreditCost(tokenCount: number): number {
  return Math.ceil((tokenCount / 100) * COST_PER_100_TOKENS);
}

interface StreamDelta {
  content?: string;
}

interface StreamChoice {
  delta: StreamDelta;
  finish_reason?: string | null;
}

interface StreamChunk {
  choices: StreamChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

async function* parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<StreamChunk> {
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const data = trimmed.slice(6);
      if (data === '[DONE]') return;

      try {
        yield JSON.parse(data) as StreamChunk;
      } catch {
        continue;
      }
    }
  }
}

async function callVLLMWithStreaming(
  endpoint: string,
  apiKey: string,
  modelId: string,
  messages: Array<{ role: string; content: string }>,
  maxTokens: number
): Promise<Response> {
  const response = await fetch(`${endpoint}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      stream: true,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`vLLM API error (${response.status}): ${errorText}`);
  }

  return response;
}

export const generateResponse = internalAction({
  args: {
    conversationId: v.id('conversations'),
    userMessageId: v.id('messages'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const endpoint = process.env.VLLM_ENDPOINT_URL;
    const apiKey = process.env.RUNPOD_API_KEY;

    if (!endpoint || !apiKey) {
      throw new Error('Missing VLLM_ENDPOINT_URL or RUNPOD_API_KEY environment variables');
    }

    const conversation = await ctx.runQuery(internal.conversations.getInternal, {
      conversationId: args.conversationId,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (!conversation.model) {
      throw new Error('Model not found for conversation');
    }

    const messages = await ctx.runQuery(internal.messages.listForContextInternal, {
      conversationId: args.conversationId,
      maxTokens: CONTEXT_TOKEN_LIMIT,
    });

    const maxTokens = conversation.model.maxTokens || DEFAULT_MAX_TOKENS;
    const estimatedCost = calculateCreditCost(maxTokens);

    const reservationId = await ctx.runMutation(internal.credits.reserveCreditsInternal, {
      userId: conversation.userId,
      amount: estimatedCost,
    });

    const assistantMessageId = await ctx.runMutation(internal.messages.createAssistantInternal, {
      conversationId: args.conversationId,
      status: 'streaming',
    });

    let accumulatedContent = '';
    let totalTokens = 0;
    let lastUpdateTime = Date.now();
    let tokensSinceLastUpdate = 0;
    let retryCount = 0;

    const attemptGeneration = async (): Promise<void> => {
      const response = await callVLLMWithStreaming(
        endpoint,
        apiKey,
        conversation.model!.modelId,
        messages,
        maxTokens
      );

      const body = response.body;
      if (!body) {
        throw new Error('No response body from vLLM');
      }

      const reader = body.getReader();

      try {
        for await (const chunk of parseSSEStream(reader)) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            accumulatedContent += delta;
            tokensSinceLastUpdate += estimateTokenCount(delta);

            const now = Date.now();
            const shouldUpdate =
              now - lastUpdateTime >= UPDATE_INTERVAL_MS ||
              tokensSinceLastUpdate >= UPDATE_TOKEN_THRESHOLD;

            if (shouldUpdate) {
              await ctx.runMutation(internal.messages.updateContentInternal, {
                messageId: assistantMessageId,
                content: accumulatedContent,
                status: 'streaming',
              });
              lastUpdateTime = now;
              tokensSinceLastUpdate = 0;
            }
          }

          if (chunk.usage) {
            totalTokens = chunk.usage.completion_tokens;
          }
        }
      } finally {
        reader.releaseLock();
      }
    };

    try {
      try {
        await attemptGeneration();
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          accumulatedContent = '';
          tokensSinceLastUpdate = 0;
          await attemptGeneration();
        } else {
          throw error;
        }
      }

      if (totalTokens === 0) {
        totalTokens = estimateTokenCount(accumulatedContent);
      }

      await ctx.runMutation(internal.messages.updateContentInternal, {
        messageId: assistantMessageId,
        content: accumulatedContent,
        status: 'complete',
        tokenCount: totalTokens,
      });

      const actualCost = calculateCreditCost(totalTokens);
      await ctx.runMutation(internal.credits.confirmCreditsInternal, {
        userId: conversation.userId,
        reservationId,
        reservedAmount: estimatedCost,
        actualCost,
      });

      await ctx.runMutation(internal.conversations.updateTimestamp, {
        conversationId: args.conversationId,
      });
    } catch (error) {
      await ctx.runMutation(internal.credits.releaseCreditsInternal, {
        userId: conversation.userId,
        reservationId,
        amount: estimatedCost,
      });

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await ctx.runMutation(internal.messages.updateContentInternal, {
        messageId: assistantMessageId,
        content: `Error: ${errorMessage}`,
        status: 'error',
      });
    }

    return null;
  },
});
