# Luna Backend Tests

## Overview
Integration tests for the Luna chat backend using Vitest and real Convex deployment.

## Setup

### Prerequisites
1. Node.js v20+
2. Convex CLI installed
3. Convex dev deployment running

### Running Tests

1. Start Convex dev deployment:
```bash
npx convex dev
```

2. In another terminal, run tests:
```bash
CONVEX_URL=<your-dev-url> npm test
```

The CONVEX_URL is displayed when you run `npx convex dev`.

## Test Structure

### Test Files
- `tests/setup.ts` - Convex client configuration
- `tests/helpers.ts` - Reusable test utilities
- `tests/chat.test.ts` - Chat flow integration tests

### Test Helpers
- `createTestUser()` - Create test user
- `cleanupTestUser()` - Remove test user
- `setTestUserCredits()` - Set user credits
- `getTestUserCredits()` - Get user credits
- `getOrCreateTestModel()` - Ensure test model exists
- `cleanupTestConversation()` - Remove conversation

## Test Coverage

### Chat Flow Tests
✅ Create conversation with model selection
✅ Send message and trigger LLM response
✅ Credits deducted after response
✅ Insufficient credits rejects request

## Notes

### Internal Mutations
Tests use internal mutations to bypass authentication:
- `internal.users.createUser`
- `internal.conversations.createForUser`
- `internal.messages.sendForUser`

This allows testing without Clerk authentication setup.

### Async Handling
LLM responses are generated asynchronously via Convex actions. Tests include delays to allow actions to complete.

### Test Timeout
Tests have a 30-second timeout configured in `vitest.config.ts` to accommodate LLM response times.

## Troubleshooting

### "Cannot find module" errors
Run `npx convex dev` to generate TypeScript types in `convex/_generated/`.

### Tests timeout
- Increase timeout in `vitest.config.ts`
- Check vLLM endpoint is configured and responding
- Verify Convex deployment is running

### "Insufficient credits" errors
Tests create users with 1000 initial credits. If tests fail, check credit deduction logic.
