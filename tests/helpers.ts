import { convex } from './setup';
import { api, internal } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';

export interface TestUser {
  userId: Id<'users'>;
  clerkId: string;
  email: string;
  name: string;
}

export async function createTestUser(
  clerkId: string = `test_${Date.now()}`,
  email: string = `test_${Date.now()}@example.com`,
  name: string = 'Test User'
): Promise<TestUser> {
  const userId = await convex.mutation(internal.users.createUser, {
    clerkId,
    email,
    name,
  });

  return {
    userId,
    clerkId,
    email,
    name,
  };
}

export async function cleanupTestUser(userId: Id<'users'>): Promise<void> {
  await convex.mutation(internal.users.deleteUser, { userId });
}

export async function cleanupTestConversation(conversationId: Id<'conversations'>): Promise<void> {
  await convex.mutation(internal.conversations.deleteConversation, {
    conversationId,
  });
}

export async function setTestUserCredits(userId: Id<'users'>, credits: number): Promise<void> {
  await convex.mutation(internal.users.setCredits, { userId, credits });
}

export async function getTestUserCredits(userId: Id<'users'>): Promise<number> {
  const user = await convex.query(api.users.getUser, { userId });
  return user?.credits ?? 0;
}

export async function getOrCreateTestModel(): Promise<Id<'models'>> {
  const models = await convex.query(internal.models.listInternal, {});

  if (models.length > 0) {
    return models[0]._id;
  }

  return await convex.mutation(internal.models.createTestModel, {
    name: 'Test Model',
    provider: 'test',
    modelId: 'test-model-1',
    costPerToken: 0.01,
    maxTokens: 2048,
    isActive: true,
  });
}
