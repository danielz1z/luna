import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { convex } from './setup';
import { createTestUser, cleanupTestUser, setTestUserCredits, getTestUserCredits } from './helpers';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';

const COST_PER_IMAGE = 50;

describe('Image Generation', () => {
  let testUserId: Id<'users'>;

  beforeAll(async () => {
    const testUser = await createTestUser();
    testUserId = testUser.userId;
  });

  afterAll(async () => {
    await cleanupTestUser(testUserId);
  });

  it('should create image job successfully', async () => {
    const jobId = await convex.mutation(api.imageJobs.create, {
      prompt: 'A beautiful sunset over mountains',
      resolution: '512',
    });

    expect(jobId).toBeDefined();

    const job = await convex.query(api.imageJobs.get, { jobId });
    expect(job).toBeDefined();
    expect(job?.prompt).toBe('A beautiful sunset over mountains');
    expect(job?.resolution).toBe('512');
    expect(job?.status).toBe('pending');
    expect(job?.userId).toBe(testUserId);
  });

  it('should deduct credits on job creation', async () => {
    const initialCredits = await getTestUserCredits(testUserId);

    const jobId = await convex.mutation(api.imageJobs.create, {
      prompt: 'A serene lake at dawn',
      resolution: '768',
    });

    expect(jobId).toBeDefined();

    const finalCredits = await getTestUserCredits(testUserId);
    expect(finalCredits).toBe(initialCredits - COST_PER_IMAGE);
  });

  it('should reject job creation when insufficient credits', async () => {
    await setTestUserCredits(testUserId, COST_PER_IMAGE - 1);

    await expect(
      convex.mutation(api.imageJobs.create, {
        prompt: 'A starry night sky',
        resolution: '1024',
      })
    ).rejects.toThrow('Insufficient credits');

    const credits = await getTestUserCredits(testUserId);
    expect(credits).toBe(COST_PER_IMAGE - 1);
  });

  it('should validate prompt is not empty', async () => {
    await setTestUserCredits(testUserId, 1000);

    await expect(
      convex.mutation(api.imageJobs.create, {
        prompt: '',
        resolution: '512',
      })
    ).rejects.toThrow('Prompt cannot be empty');

    await expect(
      convex.mutation(api.imageJobs.create, {
        prompt: '   ',
        resolution: '512',
      })
    ).rejects.toThrow('Prompt cannot be empty');
  });

  it('should validate prompt length', async () => {
    await setTestUserCredits(testUserId, 1000);

    const longPrompt = 'a'.repeat(1001);

    await expect(
      convex.mutation(api.imageJobs.create, {
        prompt: longPrompt,
        resolution: '512',
      })
    ).rejects.toThrow('Prompt too long');
  });

  it('should list user image jobs', async () => {
    await setTestUserCredits(testUserId, 1000);

    const jobId1 = await convex.mutation(api.imageJobs.create, {
      prompt: 'First image',
      resolution: '512',
    });

    const jobId2 = await convex.mutation(api.imageJobs.create, {
      prompt: 'Second image',
      resolution: '768',
    });

    const jobs = await convex.query(api.imageJobs.list, {});

    expect(jobs.length).toBeGreaterThanOrEqual(2);

    const jobIds = jobs.map((job: { _id: Id<'imageJobs'> }) => job._id);
    expect(jobIds).toContain(jobId1);
    expect(jobIds).toContain(jobId2);
  });

  it('should support different resolutions', async () => {
    await setTestUserCredits(testUserId, 1000);

    const resolutions = ['512', '768', '1024'] as const;

    for (const resolution of resolutions) {
      const jobId = await convex.mutation(api.imageJobs.create, {
        prompt: `Test image at ${resolution}`,
        resolution,
      });

      const job = await convex.query(api.imageJobs.get, { jobId });
      expect(job?.resolution).toBe(resolution);
    }
  });

  it('should trim whitespace from prompt', async () => {
    await setTestUserCredits(testUserId, 1000);

    const jobId = await convex.mutation(api.imageJobs.create, {
      prompt: '  A prompt with whitespace  ',
      resolution: '512',
    });

    const job = await convex.query(api.imageJobs.get, { jobId });
    expect(job?.prompt).toBe('A prompt with whitespace');
  });
});
