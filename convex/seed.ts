import { mutation } from './_generated/server';
import { v } from 'convex/values';

const INITIAL_MODELS = [
  {
    name: 'Llama 3 8B Abliterated',
    provider: 'vllm',
    modelId: 'failspy/meta-llama-3-8b-instruct-abliterated-v3',
    costPerToken: 0.01,
    maxTokens: 4096,
    isActive: true,
  },
  {
    name: 'Mistral Small 3.1',
    provider: 'vllm',
    modelId: 'mistralai/Mistral-Small-3.1-24B-Instruct-2503',
    costPerToken: 0.02,
    maxTokens: 32768,
    isActive: false,
  },
];

export const seedModels = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const existingModels = await ctx.db.query('models').collect();
    if (existingModels.length > 0) {
      return 0;
    }

    for (const model of INITIAL_MODELS) {
      await ctx.db.insert('models', model);
    }

    return INITIAL_MODELS.length;
  },
});
