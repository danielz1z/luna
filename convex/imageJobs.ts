import {
  mutation,
  query,
  internalMutation,
  internalQuery,
  type QueryCtx,
  type MutationCtx,
} from './_generated/server';
import { v, ConvexError } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { internal } from './_generated/api';
import { COST_PER_IMAGE } from './credits';

async function getCurrentUserInternal(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
    .unique();
}

const resolutionValidator = v.union(v.literal('512'), v.literal('768'), v.literal('1024'));

const statusValidator = v.union(
  v.literal('pending'),
  v.literal('processing'),
  v.literal('completed'),
  v.literal('failed')
);

const imageJobValidator = v.object({
  _id: v.id('imageJobs'),
  _creationTime: v.number(),
  userId: v.id('users'),
  conversationId: v.optional(v.id('conversations')),
  prompt: v.string(),
  resolution: resolutionValidator,
  status: statusValidator,
  resultStorageId: v.optional(v.id('_storage')),
  error: v.optional(v.string()),
  createdAt: v.number(),
  completedAt: v.optional(v.number()),
});

export const create = mutation({
  args: {
    prompt: v.string(),
    resolution: resolutionValidator,
    conversationId: v.optional(v.id('conversations')),
  },
  returns: v.id('imageJobs'),
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) {
      throw new ConvexError('User not authenticated');
    }

    if (args.prompt.trim().length === 0) {
      throw new ConvexError('Prompt cannot be empty');
    }

    if (args.prompt.length > 1000) {
      throw new ConvexError('Prompt too long (max 1000 characters)');
    }

    if (args.conversationId) {
      const conversation = await ctx.db.get(args.conversationId);
      if (!conversation || conversation.userId !== user._id) {
        throw new ConvexError('Conversation not found or access denied');
      }
    }

    if (user.credits < COST_PER_IMAGE) {
      throw new ConvexError('Insufficient credits');
    }

    await ctx.db.patch(user._id, {
      credits: user.credits - COST_PER_IMAGE,
    });

    const now = Date.now();
    const jobId = await ctx.db.insert('imageJobs', {
      userId: user._id,
      conversationId: args.conversationId,
      prompt: args.prompt.trim(),
      resolution: args.resolution,
      status: 'pending',
      createdAt: now,
    });

    await ctx.scheduler.runAfter(0, internal.imageGeneration.processJob, {
      jobId,
    });

    return jobId;
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(imageJobValidator),
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) {
      return [];
    }

    const limit = args.limit ?? 20;

    const jobs = await ctx.db
      .query('imageJobs')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .take(limit);

    return jobs;
  },
});

export const get = query({
  args: {
    jobId: v.id('imageJobs'),
  },
  returns: v.union(imageJobValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) {
      return null;
    }

    const job = await ctx.db.get(args.jobId);
    if (!job || job.userId !== user._id) {
      return null;
    }

    return job;
  },
});

export const getInternal = internalQuery({
  args: { jobId: v.id('imageJobs') },
  returns: v.union(imageJobValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

export const updateStatus = internalMutation({
  args: {
    jobId: v.id('imageJobs'),
    status: statusValidator,
    resultStorageId: v.optional(v.id('_storage')),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new ConvexError('Job not found');
    }

    const updates: {
      status: 'pending' | 'processing' | 'completed' | 'failed';
      resultStorageId?: Id<'_storage'>;
      error?: string;
      completedAt?: number;
    } = {
      status: args.status,
    };

    if (args.resultStorageId !== undefined) {
      updates.resultStorageId = args.resultStorageId;
    }

    if (args.error !== undefined) {
      updates.error = args.error;
    }

    if (args.status === 'completed' || args.status === 'failed') {
      updates.completedAt = Date.now();
    }

    if (args.status === 'failed') {
      const user = await ctx.db.get(job.userId);
      if (user) {
        await ctx.db.patch(job.userId, {
          credits: user.credits + COST_PER_IMAGE,
        });
      }
    }

    await ctx.db.patch(args.jobId, updates);
    return null;
  },
});
