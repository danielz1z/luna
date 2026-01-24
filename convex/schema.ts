import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    credits: v.number(),
  }).index('by_clerk_id', ['clerkId']),

  conversations: defineTable({
    userId: v.id('users'),
    title: v.string(),
    modelId: v.id('models'),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  messages: defineTable({
    conversationId: v.id('conversations'),
    role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
    content: v.string(),
    tokenCount: v.optional(v.number()),
    status: v.optional(v.union(v.literal('streaming'), v.literal('complete'), v.literal('error'))),
  }).index('by_conversation', ['conversationId']),

  models: defineTable({
    name: v.string(),
    provider: v.string(),
    modelId: v.string(),
    costPerToken: v.number(),
    maxTokens: v.number(),
    isActive: v.boolean(),
  }),

  imageJobs: defineTable({
    userId: v.id('users'),
    conversationId: v.optional(v.id('conversations')),
    prompt: v.string(),
    resolution: v.union(v.literal('512'), v.literal('768'), v.literal('1024')),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('completed'),
      v.literal('failed')
    ),
    resultStorageId: v.optional(v.id('_storage')),
    error: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index('by_user', ['userId']),
});
