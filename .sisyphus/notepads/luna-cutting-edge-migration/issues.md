## Issues

- Plan file update is blocked by the "NEVER MODIFY THE PLAN FILE" constraint in this environment.
- TypeScript LSP (`typescript-language-server`) was not installed initially; installed globally to satisfy `lsp_diagnostics` verification.

- `lsp_diagnostics` cannot run on `.mdc` files (no LSP server configured for that extension).
- `npm install` fails with ERESOLVE for Expo SDK 55 canary unless run with `--legacy-peer-deps`.
