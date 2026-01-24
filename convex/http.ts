import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { internal } from './_generated/api';
import type { WebhookEvent } from '@clerk/backend';
import { Webhook } from 'svix';

const http = httpRouter();

http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const event = await validateClerkWebhook(request);
    if (!event) {
      return new Response('Invalid webhook signature', { status: 400 });
    }

    switch (event.type) {
      case 'user.created':
      case 'user.updated':
        await ctx.runMutation(internal.users.upsertFromClerk, {
          clerkId: event.data.id,
          email: event.data.email_addresses[0]?.email_address ?? '',
          name:
            `${event.data.first_name ?? ''} ${event.data.last_name ?? ''}`.trim() || 'Anonymous',
        });
        break;

      case 'user.deleted': {
        const clerkUserId = event.data.id;
        if (clerkUserId) {
          await ctx.runMutation(internal.users.deleteFromClerk, { clerkId: clerkUserId });
        }
        break;
      }

      default:
        console.log('Unhandled Clerk webhook event:', event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateClerkWebhook(request: Request): Promise<WebhookEvent | null> {
  const payload = await request.text();
  const svixHeaders = {
    'svix-id': request.headers.get('svix-id') ?? '',
    'svix-timestamp': request.headers.get('svix-timestamp') ?? '',
    'svix-signature': request.headers.get('svix-signature') ?? '',
  };

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET not configured');
    return null;
  }

  const wh = new Webhook(webhookSecret);
  try {
    return wh.verify(payload, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error('Webhook verification failed:', error);
    return null;
  }
}

export default http;
