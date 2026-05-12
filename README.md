# todo-20260512

E2E test fixture for the agent-team sweet-home workflow runtime.

This is a deliberately tiny TypeScript HTTP service used to exercise the
workflow's Worker → WhiteBoxValidator → BlackBoxValidator dispatch chain
against real WorkPackage issues. **Safe to delete after testing.**

## Stack

- Node 20+, TypeScript strict (+ `noUncheckedIndexedAccess`)
- `node:http` only — no framework
- vitest for tests
- tsx for `pnpm dev`

## Verify

```bash
pnpm install
pnpm verify   # tsc --noEmit && vitest run
```
