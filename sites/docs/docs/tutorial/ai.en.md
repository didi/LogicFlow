---
nav: Guide
group:
  title: Introduction
title: AI Programming Support
order: 2
toc: content
---

Starting from `@logicflow/core@2.3.0`, LogicFlow ships tutorial and API docs with the npm package. Copy the prompt on this page to your AI Agent so it can read local docs in your project instead of implementing LogicFlow features from general knowledge alone.

## When to Copy the Prompt

Copy the prompt in these situations:

1. After installing `@logicflow/core` for the first time
2. After upgrading `@logicflow/core`
3. Before asking an Agent to implement LogicFlow features

If your Agent already has an older prompt but still misses official plugin or layout capabilities, copy the latest prompt below again.

## What the Agent Should Know

LogicFlow is organized around three main packages:

- `@logicflow/core`: the core graph editor runtime, including canvas, nodes, edges, models, events, rendering, themes, and basic interactions.
- `@logicflow/extension`: the official extension package for common product features.
- `@logicflow/layout`: the official layout plugin package for automatic graph layout.

The docs for these packages are shipped under `node_modules/@logicflow/core/dist/docs/`. The docs for `@logicflow/extension` and `@logicflow/layout` mainly live under `tutorial/extension/`.

## Prompt to Copy

Copy the whole block below to your AI Agent:

```md
<!-- BEGIN:logicflow-agent-rules -->
# LogicFlow Agent Rules

LogicFlow documentation is available at:

- `node_modules/@logicflow/core/dist/docs/`

Package roles:

- `@logicflow/core`: core graph editor runtime, including canvas, nodes, edges, models, events, rendering, themes, and basic interactions.
- `@logicflow/extension`: official plugins for common product features.
- `@logicflow/layout`: official layout plugins for automatic graph layout.

The docs for `@logicflow/extension` and `@logicflow/layout` are included under:

- `node_modules/@logicflow/core/dist/docs/tutorial/extension/`

Before implementing any LogicFlow feature, check the local docs first to see whether LogicFlow already provides a built-in, extension, or layout capability. If it does, prefer the documented official capability instead of reimplementing it from scratch.

If an official package is needed but not installed, ask the user before installing it.
<!-- END:logicflow-agent-rules -->
```

## Next Reading

- New to LogicFlow: read [Getting Started](get-started.en.md)
- Need plugins or layout: read [Plugin Introduction](extension/intro.en.md)
- Need exact API options: read [API Guide](../api/logicflow-instance/index.en.md)
