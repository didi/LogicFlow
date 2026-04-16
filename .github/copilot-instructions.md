# Copilot Cloud Agent Instructions for `didi/LogicFlow`

## Start Here First

1. Read `/home/runner/work/LogicFlow/LogicFlow/AGENTS.md` before editing anything.
2. Use `pnpm` only (enforced by repo preinstall).
3. Make the smallest change in the owning package; do not patch examples to hide package bugs.
4. Edit source in `src/`, not generated `dist/`, `es/`, or `lib/`.

## Monorepo Routing (Where Changes Belong)

- `packages/core`: editor runtime, graph state, rendering, interaction, registration, extension hooks.
- `packages/engine`: workflow execution runtime/scheduler; must stay independent of `packages/core`.
- `packages/extension`: optional plugins/BPMN/components built on core public APIs.
- `packages/layout`: layout algorithms and layout-facing adaptation only.
- `packages/react-node-registry` / `packages/vue-node-registry`: framework adapters for custom nodes.
- `examples/` and `sites/docs`: verification/docs targets, not primary bug-fix location (unless task is demo/docs-only).

## Required Boundaries

- Keep `packages/engine` free of `@logicflow/core` runtime dependency.
- Keep extension features on public core extension points; avoid private core internals.
- Keep framework runtimes (React/Vue) as adapter-layer concerns.
- Preserve public API compatibility unless the task explicitly calls for a breaking change.

## Fast File Entry Points

- Core: `packages/core/src/LogicFlow.tsx`, `packages/core/src/model`, `packages/core/src/view`, `packages/core/src/view/behavior`.
- Engine: `packages/engine/src/FlowModel.ts`, `packages/engine/src/Scheduler.ts`, `packages/engine/src/nodes`.
- Extension: `packages/extension/src/bpmn`, `packages/extension/src/components`, `packages/extension/src/tools`, `packages/extension/src/materials`.

For structural or cross-cutting changes, also read:
- `packages/core/ARCHITECTURE.md`
- `packages/engine/ARCHITECTURE.md`
- `packages/extension/ARCHITECTURE.md`

## Build, Lint, and Test Commands

Run from repo root (`/home/runner/work/LogicFlow/LogicFlow`):

```sh
pnpm run lint:ts
pnpm test
pnpm build
```

Package-focused workflows commonly used:

```sh
cd packages/<target-package>
pnpm run build:watch

cd examples/<closest-example>
pnpm start
```

## Known Environment Issues and Workarounds

During onboarding, the following issues were encountered:

1. `pnpm: command not found`
   - Workaround used:
     ```sh
     corepack enable
     corepack prepare pnpm@9.4.0 --activate
     ```

2. `pnpm install` failed in `examples/feature-examples` postinstall with Umi error:
   - `No such module: http_parser`
   - Workaround used for CI/agent setup:
     ```sh
     pnpm install --ignore-scripts
     ```
   - This allowed `pnpm run lint:ts`, `pnpm test`, and `pnpm build` to run successfully.

## PR and Commit Expectations

- Commit message format: Angular style (`<type>(<scope>): <subject>`).
- Use `.github/workflows/PULL_REQUEST_TEMPLATE.md` for PR structure.
- In PR description, cover:
  1. What changed
  2. Why it was needed
  3. How it was verified
  4. Compatibility risk / migration notes / reviewer focus

## Practical Agent Workflow

1. Read `AGENTS.md` + relevant package `ARCHITECTURE.md`.
2. Confirm the owning package and boundaries.
3. Implement a minimal localized change.
4. Run the smallest meaningful validation for touched area.
5. Do not claim validation you did not run.
