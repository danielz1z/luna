import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { convex } from './setup';
import { createTestUser, cleanupTestUser, getTestUserCredits } from './helpers';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';

describe('Auth Flow Integration', () => {
  let testUserId: Id<'users'>;
  let testClerkId: string;

  beforeAll(async () => {
    const testUser = await createTestUser();
    testUserId = testUser.userId;
    testClerkId = testUser.clerkId;
  });

  afterAll(async () => {
    await cleanupTestUser(testUserId);
  });

  it('should create user with correct data', async () => {
    const user = await convex.query(api.users.getUser, { userId: testUserId });

    expect(user).toBeDefined();
    expect(user).not.toBeNull();
    expect(user?.clerkId).toBe(testClerkId);
    expect(user?.email).toContain('@example.com');
    expect(user?.name).toBe('Test User');
  });

  it('should create user with 1000 initial credits', async () => {
    const credits = await getTestUserCredits(testUserId);
    expect(credits).toBe(1000);
  });

  it('should retrieve user data via getUser query', async () => {
    const user = await convex.query(api.users.getUser, { userId: testUserId });

    expect(user).toBeDefined();
    expect(user?._id).toBe(testUserId);
    expect(user?.credits).toBe(1000);
  });

  it('should allow updating user credits via test helper', async () => {
    const initialCredits = await getTestUserCredits(testUserId);
    expect(initialCredits).toBe(1000);

    const newCredits = 1500;
    await convex.mutation(api.users.setCreditsForTesting, {
      userId: testUserId,
      credits: newCredits,
    });

    const updatedCredits = await getTestUserCredits(testUserId);
    expect(updatedCredits).toBe(newCredits);

    await convex.mutation(api.users.setCreditsForTesting, {
      userId: testUserId,
      credits: 1000,
    });
  });

  it('should return null for non-existent user', async () => {
    const fakeUserId = 'jd7abc123456789012345678' as Id<'users'>;
    const user = await convex.query(api.users.getUser, { userId: fakeUserId });

    expect(user).toBeNull();
  });
});
