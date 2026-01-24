import {
  mutation,
  query,
  internalMutation,
  internalQuery,
  type QueryCtx,
} from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';

const CHARS_PER_TOKEN_ESTIMATE = 4;

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

async function verifyConversationOwnership(ctx: QueryCtx, conversationId: Id<'conversations'>) {
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

function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN_ESTIMATE);
}

export async function getMessagesForContext(
  ctx: QueryCtx,
  conversationId: Id<'conversations'>,
  maxTokens: number
): Promise<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>> {
  const messages = await ctx.db
    .query('messages')
    .withIndex('by_conversation', (q) => q.eq('conversationId', conversationId))
    .collect();

  messages.sort((a, b) => a._creationTime - b._creationTime);

  const result: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];
  let totalTokens = 0;

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const tokenCount = msg.tokenCount ?? estimateTokenCount(msg.content);

    if (totalTokens + tokenCount > maxTokens) {
      break;
    }

    result.unshift({ role: msg.role, content: msg.content });
    totalTokens += tokenCount;
  }

  return result;
}

export const send = mutation({
  args: {
    conversationId: v.id('conversations'),
    content: v.string(),
  },
  returns: v.id('messages'),
  handler: async (ctx, args) => {
    const { user, conversation } = await verifyConversationOwnership(ctx, args.conversationId);

    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    const trimmedContent = args.content.trim();
    if (trimmedContent.length === 0) {
      throw new Error('Message cannot be empty');
    }

    const tokenCount = estimateTokenCount(trimmedContent);

    const messageId = await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      role: 'user',
      content: trimmedContent,
      tokenCount,
      status: 'complete',
    });

    await ctx.db.patch(args.conversationId, {
      updatedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.llm.generateResponse, {
      conversationId: args.conversationId,
      userMessageId: messageId,
    });

    return messageId;
  },
});

export const list = query({
  args: {
    conversationId: v.id('conversations'),
    limit: v.optional(v.number()),
  },
  returns: v.array(
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
  handler: async (ctx, args) => {
    const { user, conversation } = await verifyConversationOwnership(ctx, args.conversationId);

    if (!user || !conversation) {
      return [];
    }

    const limit = args.limit ?? 100;

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .collect();

    messages.sort((a, b) => a._creationTime - b._creationTime);

    return messages.slice(-limit);
  },
});

export const getStreaming = query({
  args: {
    conversationId: v.id('conversations'),
  },
  returns: v.union(
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const { user, conversation } = await verifyConversationOwnership(ctx, args.conversationId);

    if (!user || !conversation) {
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

export const createAssistantInternal = internalMutation({
  args: {
    conversationId: v.id('conversations'),
    status: v.union(v.literal('streaming'), v.literal('complete'), v.literal('error')),
  },
  returns: v.id('messages'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      role: 'assistant',
      content: '',
      status: args.status,
    });
  },
});

export const updateContentInternal = internalMutation({
  args: {
    messageId: v.id('messages'),
    content: v.string(),
    status: v.union(v.literal('streaming'), v.literal('complete'), v.literal('error')),
    tokenCount: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const update: {
      content: string;
      status: 'streaming' | 'complete' | 'error';
      tokenCount?: number;
    } = {
      content: args.content,
      status: args.status,
    };

    if (args.tokenCount !== undefined) {
      update.tokenCount = args.tokenCount;
    }

    await ctx.db.patch(args.messageId, update);
    return null;
  },
});

export const listForContextInternal = internalQuery({
  args: {
    conversationId: v.id('conversations'),
    maxTokens: v.number(),
  },
  returns: v.array(
    v.object({
      role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
      content: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    return await getMessagesForContext(ctx, args.conversationId, args.maxTokens);
  },
});

export const listInternal = internalQuery({
  args: {
    conversationId: v.id('conversations'),
    limit: v.optional(v.number()),
  },
  returns: v.array(
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
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .collect();

    messages.sort((a, b) => a._creationTime - b._creationTime);

    return messages.slice(-limit);
  },
});

export const sendForUser = internalMutation({
  args: {
    userId: v.id('users'),
    conversationId: v.id('conversations'),
    content: v.string(),
  },
  returns: v.id('messages'),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.userId !== args.userId) {
      throw new Error('Access denied');
    }

    const trimmedContent = args.content.trim();
    if (trimmedContent.length === 0) {
      throw new Error('Message cannot be empty');
    }

    const tokenCount = estimateTokenCount(trimmedContent);

    const messageId = await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      role: 'user',
      content: trimmedContent,
      tokenCount,
      status: 'complete',
    });

    await ctx.db.patch(args.conversationId, {
      updatedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.llm.generateResponse, {
      conversationId: args.conversationId,
      userMessageId: messageId,
    });

    return messageId;
  },
});
