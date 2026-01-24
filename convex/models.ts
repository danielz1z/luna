import { internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';

export const listInternal = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('models'),
      _creationTime: v.number(),
      name: v.string(),
      provider: v.string(),
      modelId: v.string(),
      costPerToken: v.number(),
      maxTokens: v.number(),
      isActive: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query('models').collect();
  },
});

export const createTestModel = internalMutation({
  args: {
    name: v.string(),
    provider: v.string(),
    modelId: v.string(),
    costPerToken: v.number(),
    maxTokens: v.number(),
    isActive: v.boolean(),
  },
  returns: v.id('models'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('models', {
      name: args.name,
      provider: args.provider,
      modelId: args.modelId,
      costPerToken: args.costPerToken,
      maxTokens: args.maxTokens,
      isActive: args.isActive,
    });
  },
});

export const fixModelId = internalMutation({
  args: {
    modelId: v.id('models'),
    newModelId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.modelId, {
      modelId: args.newModelId,
    });
    return null;
  },
});

export const deleteModel = internalMutation({
  args: {
    modelId: v.id('models'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.modelId);
    return null;
  },
});
