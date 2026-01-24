import type { AuthConfig } from 'convex/server';

export default {
  providers: [
    {
      // Clerk JWT issuer domain - set CLERK_JWT_ISSUER_DOMAIN in Convex dashboard
      // Format: https://your-clerk-domain.clerk.accounts.dev
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: 'convex',
    },
  ],
} satisfies AuthConfig;
