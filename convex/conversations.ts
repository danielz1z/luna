import {
  mutation,
  query,
  internalQuery,
  internalMutation,
  type QueryCtx,
} from './_generated/server';
import { v } from 'convex/values';
import type { Id, Doc } from './_generated/dataModel';

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

async function verifyConversationOwnership(
  ctx: QueryCtx,
  conversationId: Id<'conversations'>
): Promise<{ user: Doc<'users'> | null; conversation: Doc<'conversations'> | null }> {
  const user = await getCurrentUserInternal(ctx);
  if (!user) {
    return { user: null, conversation: null };
  }

  const conversation = await ctx.db.get(conversationId);
  if (!conversation || conversation.userId !== user._id) {
    return { user, conversation: null };
  }

  return { user, conversation };
}

export const create = mutation({
  args: {
    modelId: v.id('models'),
    title: v.optional(v.string()),
  },
  returns: v.id('conversations'),
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) {
      throw new Error('User not authenticated');
    }

    const model = await ctx.db.get(args.modelId);
    if (!model) {
      throw new Error('Model not found');
    }
    if (!model.isActive) {
      throw new Error('Model is not available');
    }

    const now = Date.now();
    const conversationId = await ctx.db.insert('conversations', {
      userId: user._id,
      title: args.title ?? 'New conversation',
      modelId: args.modelId,
      updatedAt: now,
    });

    return conversationId;
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id('conversations'),
      _creationTime: v.number(),
      userId: v.id('users'),
      title: v.string(),
      modelId: v.id('models'),
      updatedAt: v.number(),
      model: v.union(
        v.object({
          _id: v.id('models'),
          name: v.string(),
          provider: v.string(),
        }),
        v.null()
      ),
    })
  ),
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) {
      return [];
    }

    const limit = args.limit ?? 50;

    const conversations = await ctx.db
      .query('conversations')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect();

    conversations.sort((a, b) => b.updatedAt - a.updatedAt);

    const limited = conversations.slice(0, limit);

    const enriched = await Promise.all(
      limited.map(async (conv) => {
        const model = await ctx.db.get(conv.modelId);
        return {
          ...conv,
          model: model
            ? {
                _id: model._id,
                name: model.name,
                provider: model.provider,
              }
            : null,
        };
      })
    );

    return enriched;
  },
});

export const get = query({
  args: {
    conversationId: v.id('conversations'),
  },
  returns: v.union(
    v.object({
      _id: v.id('conversations'),
      _creationTime: v.number(),
      userId: v.id('users'),
      title: v.string(),
      modelId: v.id('models'),
      updatedAt: v.number(),
      model: v.union(
        v.object({
          _id: v.id('models'),
          _creationTime: v.number(),
          name: v.string(),
          provider: v.string(),
          modelId: v.string(),
          costPerToken: v.number(),
          maxTokens: v.number(),
          isActive: v.boolean(),
        }),
        v.null()
      ),
      messages: v.array(
        v.object({
          _id: v.id('messages'),
          _creationTime: v.number(),
          conversationId: v.id('conversations'),
          role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
          content: v.string(),
          tokenCount: v.optional(v.number()),
          status: v.optional(
            v.union(v.literal('streaming'), v.literal('complete'), v.literal('error'))
          ),
        })
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const { user, conversation } = await verifyConversationOwnership(ctx, args.conversationId);

    if (!user || !conversation) {
      return null;
    }

    const model = await ctx.db.get(conversation.modelId);

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .collect();

    messages.sort((a, b) => a._creationTime - b._creationTime);

    const recentMessages = messages.slice(-100);

    return {
      _id: conversation._id,
      _creationTime: conversation._creationTime,
      userId: conversation.userId,
      title: conversation.title,
      modelId: conversation.modelId,
      updatedAt: conversation.updatedAt,
      model: model ?? null,
      messages: recentMessages,
    };
  },
});

export const updateTitle = mutation({
  args: {
    conversationId: v.id('conversations'),
    title: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { user, conversation } = await verifyConversationOwnership(ctx, args.conversationId);

    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    await ctx.db.patch(args.conversationId, {
      title: args.title,
    });

    return null;
  },
});

export const getInternal = internalQuery({
  args: {
    conversationId: v.id('conversations'),
  },
  returns: v.union(
    v.object({
      _id: v.id('conversations'),
      _creationTime: v.number(),
      userId: v.id('users'),
      title: v.string(),
      modelId: v.id('models'),
      updatedAt: v.number(),
      model: v.union(
        v.object({
          _id: v.id('models'),
          _creationTime: v.number(),
          name: v.string(),
          provider: v.string(),
          modelId: v.string(),
          costPerToken: v.number(),
          maxTokens: v.number(),
          isActive: v.boolean(),
        }),
        v.null()
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return null;
    }

    const model = await ctx.db.get(conversation.modelId);

    return {
      ...conversation,
      model: model ?? null,
    };
  },
});

export const updateTimestamp = internalMutation({
  args: {
    conversationId: v.id('conversations'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const deleteConversation = internalMutation({
  args: {
    conversationId: v.id('conversations'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(args.conversationId);
    return null;
  },
});

export const createForUser = internalMutation({
  args: {
    userId: v.id('users'),
    modelId: v.id('models'),
    title: v.optional(v.string()),
  },
  returns: v.id('conversations'),
  handler: async (ctx, args) => {
    const model = await ctx.db.get(args.modelId);
    if (!model) {
      throw new Error('Model not found');
    }
    if (!model.isActive) {
      throw new Error('Model is not available');
    }

    const now = Date.now();
    const conversationId = await ctx.db.insert('conversations', {
      userId: args.userId,
      title: args.title ?? 'New conversation',
      modelId: args.modelId,
      updatedAt: now,
    });

    return conversationId;
  },
});
