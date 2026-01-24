import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { convex } from './setup';
import {
  createTestUser,
  cleanupTestUser,
  cleanupTestConversation,
  getTestUserCredits,
  setTestUserCredits,
  getOrCreateTestModel,
} from './helpers';
import { internal } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';

describe('Chat Flow', () => {
  let testUserId: Id<'users'>;
  let modelId: Id<'models'>;
  let conversationId: Id<'conversations'>;

  beforeAll(async () => {
    const testUser = await createTestUser();
    testUserId = testUser.userId;
    modelId = await getOrCreateTestModel();
  });

  afterAll(async () => {
    if (conversationId) {
      await cleanupTestConversation(conversationId);
    }
    await cleanupTestUser(testUserId);
  });

  it('should create conversation with model selection', async () => {
    conversationId = await convex.mutation(internal.conversations.createForUser, {
      userId: testUserId,
      modelId,
      title: 'Test Conversation',
    });

    expect(conversationId).toBeDefined();
    expect(typeof conversationId).toBe('string');

    const conversation = await convex.query(internal.conversations.getInternal, {
      conversationId,
    });

    expect(conversation).toBeDefined();
    expect(conversation?.title).toBe('Test Conversation');
    expect(conversation?.modelId).toBe(modelId);
    expect(conversation?.userId).toBe(testUserId);
  });

  it('should send message and trigger LLM response', async () => {
    const initialCredits = await getTestUserCredits(testUserId);

    const messageId = await convex.mutation(internal.messages.sendForUser, {
      userId: testUserId,
      conversationId,
      content: 'Hello, this is a test message',
    });

    expect(messageId).toBeDefined();

    const messages = await convex.query(internal.messages.listInternal, {
      conversationId,
    });

    expect(messages.length).toBeGreaterThanOrEqual(1);

    const userMessage = messages.find((m) => m._id === messageId);
    expect(userMessage).toBeDefined();
    expect(userMessage?.role).toBe('user');
    expect(userMessage?.content).toBe('Hello, this is a test message');
    expect(userMessage?.status).toBe('complete');

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const updatedMessages = await convex.query(internal.messages.listInternal, {
      conversationId,
    });

    const assistantMessage = updatedMessages.find((m) => m.role === 'assistant');
    expect(assistantMessage).toBeDefined();

    const finalCredits = await getTestUserCredits(testUserId);
    expect(finalCredits).toBeLessThan(initialCredits);
  });

  it('should deduct credits after response', async () => {
    await setTestUserCredits(testUserId, 500);

    const initialCredits = await getTestUserCredits(testUserId);
    expect(initialCredits).toBe(500);

    await convex.mutation(internal.messages.sendForUser, {
      userId: testUserId,
      conversationId,
      content: 'Another test message',
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const finalCredits = await getTestUserCredits(testUserId);
    expect(finalCredits).toBeLessThan(initialCredits);
    expect(finalCredits).toBeGreaterThanOrEqual(0);
  });

  it('should reject request when insufficient credits', async () => {
    await setTestUserCredits(testUserId, 0);

    const credits = await getTestUserCredits(testUserId);
    expect(credits).toBe(0);

    await expect(
      convex.mutation(internal.messages.sendForUser, {
        userId: testUserId,
        conversationId,
        content: 'This should fail',
      })
    ).rejects.toThrow();

    const messages = await convex.query(internal.messages.listInternal, {
      conversationId,
    });

    const failedMessage = messages.find((m) => m.content === 'This should fail');
    expect(failedMessage).toBeUndefined();
  });
});
