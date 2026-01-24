import { ConvexHttpClient } from 'convex/browser';

if (!process.env.CONVEX_URL) {
  throw new Error('CONVEX_URL environment variable is required for testing');
}

export const convex = new ConvexHttpClient(process.env.CONVEX_URL);
