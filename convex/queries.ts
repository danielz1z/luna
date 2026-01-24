import { query, type QueryCtx } from './_generated/server';
import { v, ConvexError } from 'convex/values';

async function getCurrentUserInternal(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
    .unique();
}

const messageValidator = v.object({
  _id: v.id('messages'),
  _creationTime: v.number(),
  conversationId: v.id('conversations'),
  role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
  content: v.string(),
  tokenCount: v.optional(v.number()),
  status: v.optional(v.union(v.literal('streaming'), v.literal('complete'), v.literal('error'))),
});

const conversationWithMessagesValidator = v.object({
  _id: v.id('conversations'),
  _creationTime: v.number(),
  userId: v.id('users'),
  title: v.string(),
  modelId: v.id('models'),
  updatedAt: v.number(),
  messages: v.array(messageValidator),
});

const modelValidator = v.object({
  _id: v.id('models'),
  _creationTime: v.number(),
  name: v.string(),
  provider: v.string(),
  modelId: v.string(),
  costPerToken: v.number(),
  maxTokens: v.number(),
  isActive: v.boolean(),
});

export const getConversation = query({
  args: { conversationId: v.id('conversations') },
  returns: v.union(conversationWithMessagesValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) {
      return null;
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return null;
    }

    if (conversation.userId !== user._id) {
      return null;
    }

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .collect();

    return {
      ...conversation,
      messages,
    };
  },
});

export const getStreamingMessage = query({
  args: { conversationId: v.id('conversations') },
  returns: v.union(messageValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) {
      return null;
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return null;
    }

    if (conversation.userId !== user._id) {
      return null;
    }

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .collect();

    const streamingMessage = messages.find((m) => m.status === 'streaming');
    return streamingMessage ?? null;
  },
});

export const getUserCredits = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) {
      throw new ConvexError('User not authenticated');
    }
    return user.credits;
  },
});

export const getModels = query({
  args: {},
  returns: v.array(modelValidator),
  handler: async (ctx) => {
    const allModels = await ctx.db.query('models').collect();
    return allModels.filter((model) => model.isActive);
  },
});

const imageJobValidator = v.object({
  _id: v.id('imageJobs'),
  _creationTime: v.number(),
  userId: v.id('users'),
  prompt: v.string(),
  resolution: v.union(v.literal('512'), v.literal('768'), v.literal('1024')),
  status: v.union(
    v.literal('pending'),
    v.literal('processing'),
    v.literal('completed'),
    v.literal('failed')
  ),
  imageUrl: v.union(v.string(), v.null()),
  error: v.optional(v.string()),
  createdAt: v.number(),
  completedAt: v.optional(v.number()),
});

export const getImageJob = query({
  args: { jobId: v.id('imageJobs') },
  returns: v.union(imageJobValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) {
      return null;
    }

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      return null;
    }

    if (job.userId !== user._id) {
      return null;
    }

    let imageUrl: string | null = null;
    if (job.resultStorageId) {
      imageUrl = await ctx.storage.getUrl(job.resultStorageId);
    }

    return {
      _id: job._id,
      _creationTime: job._creationTime,
      userId: job.userId,
      prompt: job.prompt,
      resolution: job.resolution,
      status: job.status,
      imageUrl,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    };
  },
});

export const listUserImages = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(imageJobValidator),
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) {
      return [];
    }

    const limit = args.limit ?? 50;

    const jobs = await ctx.db
      .query('imageJobs')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .take(limit);

    const completedJobs = jobs.filter((job) => job.status === 'completed');

    const jobsWithUrls = await Promise.all(
      completedJobs.map(async (job) => {
        let imageUrl: string | null = null;
        if (job.resultStorageId) {
          imageUrl = await ctx.storage.getUrl(job.resultStorageId);
        }

        return {
          _id: job._id,
          _creationTime: job._creationTime,
          userId: job.userId,
          prompt: job.prompt,
          resolution: job.resolution,
          status: job.status,
          imageUrl,
          error: job.error,
          createdAt: job.createdAt,
          completedAt: job.completedAt,
        };
      })
    );

    return jobsWithUrls;
  },
});
