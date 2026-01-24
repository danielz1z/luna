import { internalMutation, mutation, query, type QueryCtx } from './_generated/server';
import { v } from 'convex/values';

const INITIAL_CREDITS = 1000;

export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
      });
    } else {
      await ctx.db.insert('users', {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        credits: INITIAL_CREDITS,
      });
    }

    return null;
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(`Cannot delete user: no user found for Clerk ID ${args.clerkId}`);
    }

    return null;
  },
});

export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      clerkId: v.string(),
      email: v.string(),
      name: v.string(),
      credits: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    return await getCurrentUserInternal(ctx);
  },
});

export const grantCredits = mutation({
  args: {
    amount: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) {
      throw new Error('User not authenticated');
    }

    await ctx.db.patch(user._id, {
      credits: user.credits + args.amount,
    });

    return null;
  },
});

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

// ============================================================================
// Test helpers (mutations for testing - only use in test environment)
// ============================================================================

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  returns: v.id('users'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('users', {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      credits: INITIAL_CREDITS,
    });
  },
});

export const deleteUser = mutation({
  args: { userId: v.id('users') },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
    return null;
  },
});

export const getUser = query({
  args: { userId: v.id('users') },
  returns: v.union(
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      clerkId: v.string(),
      email: v.string(),
      name: v.string(),
      credits: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const setCreditsForTesting = mutation({
  args: {
    userId: v.id('users'),
    credits: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      credits: args.credits,
    });
    return null;
  },
});
