# AGENTS.md

This file defines the default working rules for GitHub Copilot and human contributors in the LogicFlow repository. Use it as the project-level contract before making code, docs, or example changes.

## 1. Repository Scope

LogicFlow is a pnpm-based monorepo.

- `packages/core`: core graph editor and interaction model.
- `packages/engine`: execution engine for browser and Node.js scenarios.
- `packages/extension`: built-in plugins and integration extensions.
- `packages/layout`: layout-related utilities.
- `packages/react-node-registry`: React node registry support.
- `packages/vue-node-registry`: Vue node registry support.
- `examples/`: runnable demos and integration examples.
- `sites/docs`: documentation site.

When making a change, identify the narrowest package or app that owns the behavior and keep the change local to that area.

## 2. Required Working Rules

- Use `pnpm` only. Do not use npm or yarn in this repository.
- Prefer minimal, targeted changes. Do not refactor unrelated areas while fixing a local issue.
- Do not hand-edit generated build outputs in `dist`, `es`, `lib`, or generated style artifacts unless the task is specifically about the build pipeline.
- Keep public APIs backward-compatible unless the task explicitly requires a breaking change.
- Reuse existing patterns from the owning package before introducing a new abstraction.
- If a change touches multiple packages, state the dependency between them clearly in the PR description.

## 3. How To Work In This Monorepo

### Install

```sh
pnpm install
```

### Build all packages

```sh
pnpm build
```

### Typical package workflow

When changing a package under `packages/*`:

1. Run `pnpm run build:watch` inside the target package.
2. Start the most relevant example app to verify behavior.
3. Keep the verification focused on the package you changed.

Example:

```sh
cd packages/core
pnpm run build:watch

cd examples/feature-examples
pnpm start
```

Use a more specific example when it better matches the change:

- `examples/engine-browser-examples` for browser engine behavior.
- `examples/engine-node-examples` for Node.js engine behavior.
- `examples/next-app`, `examples/vue3-app`, or `examples/material-ui-demo` for framework integration work.
- `sites/docs` for documentation site changes.

## 4. Validation Expectations

Run the smallest meaningful validation set for the area you changed.

- For source changes, run the relevant build command and the nearest demo or docs app.
- For lint-sensitive changes, run `pnpm run lint:ts` when the touched files are under `src`.
- For formatting-heavy edits, run `pnpm prettier` or format only the touched files with the existing toolchain.
- For behavior changes, run `pnpm test` when tests exist for the affected area.

Current repository reality:

- Root test command: `pnpm test`
- Engine has explicit tests and should be validated when engine behavior changes.
- Some packages have limited or no automated tests, so example-based verification is often required.

Do not claim test coverage you did not run.

## 5. Commit And PR Rules

Follow the existing Angular-style commit convention from `CONTRIBUTING.md`:

```text
<type>(<scope>): <subject>
```

Common commit types:

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `perf`
- `test`
- `chore`
- `deps`

Before opening a PR, make sure the description covers:

1. What changed.
2. Why the change is needed.
3. How the change was verified.
4. Any compatibility risk, migration note, or reviewer focus area.

Keep the PR content aligned with the repository template in `.github/workflows/PULL_REQUEST_TEMPLATE.md`.

## 6. Editing Guidelines By Area

### Packages

- Prefer fixing root causes in `src` rather than patching built output.
- Preserve package-level API shape and naming unless the task is an intentional API update.
- Check sibling implementations before adding duplicated logic.

### Examples

- Use examples to validate package behavior, not to hide missing fixes in package code.
- Keep demo-only hacks out of shared packages.
- If an example requires a temporary workaround, document why in the PR.

### Docs

- Update docs when public behavior, APIs, or user-visible workflows change.
- Keep examples and docs in sync when a feature contract changes.

## 7. Things To Avoid

- Do not switch package managers.
- Do not rewrite large files for small behavior changes.
- Do not introduce unrelated formatting churn across the monorepo.
- Do not edit multiple example apps unless the change truly affects multiple integration targets.
- Do not assume CI or hidden automation will catch missing validation; verify locally when possible.

## 8. Useful Commands

```sh
pnpm build
pnpm build:cjs
pnpm build:esm
pnpm build:umd
pnpm build:dev
pnpm test
pnpm run lint:ts
pnpm prettier
pnpm changeset
pnpm changeset:version
```

## 9. Primary References

Use these files as the source of truth when this document is not specific enough:

- `README.md`
- `CONTRIBUTING.md`
- `package.json`
- `turbo.json`
- `lerna.json`
- `.github/workflows/PULL_REQUEST_TEMPLATE.md`

If a future task needs finer-grained Copilot behavior, add more specific instructions under `.github/` without weakening the repository-level rules in this file.
