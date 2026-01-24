import {
  mutation,
  query,
  internalMutation,
  type QueryCtx,
  type MutationCtx,
} from './_generated/server';
import { v, ConvexError } from 'convex/values';
import type { Id } from './_generated/dataModel';

export const COST_PER_100_TOKENS = 1;
export const COST_PER_IMAGE = 50;

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

function generateReservationId(): string {
  return `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const getBalance = query({
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

/**
 * Deducts credits optimistically and returns a reservation ID.
 * Call releaseCredits(reservationId, amount) to refund if operation fails.
 */
export const reserveCredits = mutation({
  args: { amount: v.number() },
  returns: v.string(),
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) {
      throw new ConvexError('User not authenticated');
    }

    if (args.amount <= 0) {
      throw new ConvexError('Amount must be positive');
    }

    if (user.credits < args.amount) {
      throw new ConvexError('Insufficient credits');
    }

    await ctx.db.patch(user._id, {
      credits: user.credits - args.amount,
    });

    return generateReservationId();
  },
});

/**
 * No-op: credits already deducted during reservation.
 * Kept for API completeness and potential audit logging.
 */
export const confirmCredits = mutation({
  args: { reservationId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) {
      throw new ConvexError('User not authenticated');
    }
    return null;
  },
});

/**
 * Refunds credits when an operation fails after reservation.
 */
export const releaseCredits = mutation({
  args: {
    reservationId: v.string(),
    amount: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) {
      throw new ConvexError('User not authenticated');
    }

    if (args.amount <= 0) {
      throw new ConvexError('Amount must be positive');
    }

    await ctx.db.patch(user._id, {
      credits: user.credits + args.amount,
    });

    return null;
  },
});

export const deductCredits = mutation({
  args: { amount: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) {
      throw new ConvexError('User not authenticated');
    }

    if (args.amount <= 0) {
      throw new ConvexError('Amount must be positive');
    }

    if (user.credits < args.amount) {
      throw new ConvexError('Insufficient credits');
    }

    await ctx.db.patch(user._id, {
      credits: user.credits - args.amount,
    });

    return null;
  },
});

// ============================================================================
// Internal mutations for use by actions (no auth check - caller must verify)
// ============================================================================

/**
 * Internal: Reserve credits for a user by userId.
 * Used by actions that have already verified the user.
 */
export const reserveCreditsInternal = internalMutation({
  args: {
    userId: v.id('users'),
    amount: v.number(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError('User not found');
    }

    if (args.amount <= 0) {
      throw new ConvexError('Amount must be positive');
    }

    if (user.credits < args.amount) {
      throw new ConvexError('Insufficient credits');
    }

    await ctx.db.patch(args.userId, {
      credits: user.credits - args.amount,
    });

    return generateReservationId();
  },
});

/**
 * Internal: Confirm credits after successful operation.
 * If actualCost differs from reserved, adjusts the balance.
 */
export const confirmCreditsInternal = internalMutation({
  args: {
    userId: v.id('users'),
    reservationId: v.string(),
    reservedAmount: v.number(),
    actualCost: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError('User not found');
    }

    // If actual cost is less than reserved, refund the difference
    const refund = args.reservedAmount - args.actualCost;
    if (refund > 0) {
      await ctx.db.patch(args.userId, {
        credits: user.credits + refund,
      });
    }

    return null;
  },
});

/**
 * Internal: Release reserved credits on failure.
 */
export const releaseCreditsInternal = internalMutation({
  args: {
    userId: v.id('users'),
    reservationId: v.string(),
    amount: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError('User not found');
    }

    if (args.amount <= 0) {
      throw new ConvexError('Amount must be positive');
    }

    await ctx.db.patch(args.userId, {
      credits: user.credits + args.amount,
    });

    return null;
  },
});
