# AGENTS.md

This file is the repository entry point for agents and contributors working in LogicFlow. Use it to answer three questions before editing anything:

1. Where should this change live?
2. What boundaries must remain intact?
3. What is the smallest meaningful validation for this change?

## 1. Repository Shape

LogicFlow is a pnpm monorepo with three main product surfaces and several support packages.

- `packages/core`: graph editor runtime, built-in shapes, interaction model, rendering, and extension hooks.
- `packages/engine`: graph execution engine for browser and Node.js environments. It does not depend on `packages/core`.
- `packages/extension`: optional editor plugins, BPMN support, built-in UI components, and shared materials built on top of `packages/core`.
- `packages/layout`: automatic layout helpers built around the public core graph model.
- `packages/react-node-registry`: React-backed custom node rendering.
- `packages/vue-node-registry`: Vue-backed custom node rendering.
- `examples/`: runnable demos used for focused verification.
- `sites/docs`: documentation site and docs examples.

Default rule: change the narrowest package that owns the behavior. Do not patch examples to compensate for package bugs.

## 2. Working Contract

- Use `pnpm` only.
- Prefer minimal, local changes over broad refactors.
- Edit source files in `src` rather than generated outputs in `dist`, `es`, or `lib`.
- Preserve public API compatibility unless the task explicitly requires a breaking change.
- Reuse package-local patterns before introducing new abstractions.
- If a change crosses package boundaries, document that dependency in the PR.
- Treat examples as verification targets, not as the primary place to implement shared behavior.

## 3. Task Routing

Use this section to decide where to start reading and editing.

### Editor behavior and graph interaction

Start in `packages/core`.

Typical work:
- node or edge drag behavior
- selection, keyboard, history, snapline, zoom, viewport behavior
- graph state transitions and event emission
- built-in node or edge rendering

Primary code areas:
- `packages/core/src/LogicFlow.tsx`
- `packages/core/src/model`
- `packages/core/src/view`
- `packages/core/src/view/behavior`
- `packages/core/src/history`
- `packages/core/src/event`

### Execution semantics

Start in `packages/engine`.

Typical work:
- execution scheduling
- node execution lifecycle
- resume, interrupt, recorder, or platform-specific behavior
- browser versus Node execution support

Primary code areas:
- `packages/engine/src/FlowModel.ts`
- `packages/engine/src/Scheduler.ts`
- `packages/engine/src/nodes`
- `packages/engine/src/recorder`
- `packages/engine/src/platform`

### Plugins, BPMN, built-in editor add-ons

Start in `packages/extension`.

Typical work:
- BPMN elements or adapters
- context menu, mini-map, control panel, drag-and-drop panel
- group, pool, dynamic-group, node resize, flow-path, auto-layout integration
- built-in materials such as curved edges or selection helpers

Primary code areas:
- `packages/extension/src/bpmn`
- `packages/extension/src/bpmn-adapter`
- `packages/extension/src/components`
- `packages/extension/src/materials`
- `packages/extension/src/tools`
- `packages/extension/src/pool`

### Automatic layout

Start in `packages/layout`.

This package should stay focused on layout algorithms and layout-facing adaptation. Do not move core editor state logic here.

### Framework-backed custom nodes

Start in `packages/react-node-registry` or `packages/vue-node-registry`.

These packages bridge framework components into the core node system. Keep framework-specific rendering concerns here rather than inside `packages/core`.

### Demos and documentation

Use `examples/` and `sites/docs` to verify or document package behavior.

Keep the fix in the owning package unless the task is explicitly demo-only or docs-only.

## 4. Stable Package Boundaries

These boundaries should remain true unless the repository is intentionally being redesigned.

- `packages/core` owns editor state, rendering, interaction, registration, and extension hooks.
- `packages/engine` owns execution and must remain usable without `packages/core`.
- `packages/extension` depends on public core extension points; it should not require private core internals to function.
- `packages/layout` should consume graph data or public core models, not duplicate editor behavior.
- React and Vue node registry packages are adapters, not alternate graph engines.
- Packages layered on top of `packages/core` should treat `@logicflow/core` as the host runtime provided by the consumer. Do not introduce or restore hard runtime dependencies that bundle a second copy of core unless the package truly cannot function as an extension.
- Framework adapter packages should treat framework runtimes such as `react`, `react-dom`, and `vue` as consumer-provided peers rather than silently bundling their own copies.

## 5. Validation Strategy

Run the smallest meaningful validation for the area you touched.

- `packages/core`: build the package and verify with the nearest editor example, usually `examples/feature-examples`.
- `packages/engine`: run package tests first; use engine examples when behavior is environment-specific.
- `packages/extension`: build the package and verify the relevant feature in `examples/feature-examples` or another targeted demo.
- framework integration packages: verify with `examples/next-app`, `examples/vue3-app`, or another matching app.
- docs changes: verify in `sites/docs`.

Repository-level commands that are stable enough to rely on:

```sh
pnpm build
pnpm test
pnpm run lint:ts
pnpm prettier
```

Package-level workflow that usually matches source changes:

```sh
cd packages/<target-package>
pnpm run build:watch

cd examples/<closest-example>
pnpm start
```

Do not claim validation you did not run.

## 6. Commit And PR Expectations

Commit messages follow the Angular-style convention documented in `CONTRIBUTING.md`:

```text
<type>(<scope>): <subject>
```

Before opening a PR, make sure the description covers:

1. What changed.
2. Why the change is needed.
3. How it was verified.
4. Any compatibility risk, migration note, or reviewer focus area.

Use `.github/workflows/PULL_REQUEST_TEMPLATE.md` as the PR template source of truth.

## 7. Architecture Index

Read these documents before making structural changes in the corresponding package:

- `packages/core/ARCHITECTURE.md`
- `packages/engine/ARCHITECTURE.md`
- `packages/extension/ARCHITECTURE.md`

Use these repository files as supporting references when the architecture docs are not specific enough:

- `README.md`
- `CONTRIBUTING.md`
- `package.json`
- `turbo.json`
- `lerna.json`

## 8. What Not To Put Here

This file is intentionally not a full architecture manual.

Do not turn it into:
- a file-by-file code walkthrough
- a temporary task checklist
- a dump of unstable implementation details
- a replacement for package-level architecture docs

If a future task needs more agent-specific behavior, add narrower instructions under `.github/` instead of expanding this file into package internals.
