# Core Architecture

## Mission

`@logicflow/core` is the editor runtime for LogicFlow. It owns graph state, built-in node and edge models, rendering, interaction behavior, registration of custom elements, and the extension hooks that other packages build on.

If a change alters how a graph is edited, rendered, selected, moved, connected, or observed, it probably belongs here.

## What This Package Owns

- the `LogicFlow` entry class and plugin lifecycle
- the `GraphModel` and element models
- built-in node and edge view layers
- editor interaction behavior such as drag, selection, keyboard, history, and snapline
- public registration and extension APIs used by extension packages and host applications

## What This Package Does Not Own

- workflow or business execution semantics
- BPMN-specific behavior as a product feature
- framework-specific adapters for React or Vue custom nodes
- demo-only behavior

Those concerns belong in `packages/engine`, `packages/extension`, framework registry packages, or examples.

## Code Map

### Runtime entry

- `src/LogicFlow.tsx`: top-level editor class, plugin installation, registration, render setup, and high-level public API.
- `src/index.ts`: public exports for the package.

### State and models

- `src/model/GraphModel.ts`: graph-wide state and coordination point for nodes, edges, config, and events.
- `src/model/node`: built-in node models.
- `src/model/edge`: built-in edge models.
- `src/model/EditConfigModel.ts`: editability and behavior switches.
- `src/model/TransformModel.ts` and `src/model/NestedTransformModel.ts`: coordinate and viewport transforms.

### Rendering

- `src/view/Graph.tsx`: top-level graph rendering container.
- `src/view/node`: built-in node views.
- `src/view/edge`: built-in edge views.
- `src/view/overlay` and `src/view/shape`: graph overlays and primitive shapes.
- `src/view/text`: text rendering and editing-related display.

### Interaction and editor helpers

- `src/view/behavior`: drag-and-drop, connection, and behavior orchestration.
- `src/history`: undo and redo support.
- `src/keyboard`: shortcut registration and dispatch.
- `src/tool`: editor tool layer.
- `src/event`: event emission contracts.

### Shared support

- `src/util`: graph helpers, geometry helpers, and conversion utilities.
- `src/algorithm`: reusable graph-facing algorithms.
- `src/constant`: stable editor enums and event types.
- `src/style` and `src/index.less`: theme and style defaults.

## Stable Runtime Flow

The editor pipeline is intentionally layered:

1. `LogicFlow` normalizes options, creates the container, and instantiates `GraphModel`.
2. Built-in registration and plugin installation extend the available node, edge, tool, and component surface.
3. `GraphModel` becomes the central source of editor state.
4. The view layer renders from models.
5. User interaction flows back through behavior modules, models, and event emission.

When changing core behavior, preserve this direction of flow. Avoid introducing side channels that mutate rendered state without going through the model layer.

## Invariants

- `GraphModel` is the authoritative graph state owner inside the editor runtime.
- Registration of custom nodes, edges, and plugins happens through public registration hooks rather than ad hoc mutation.
- View components render from model state; they should not become independent sources of truth.
- Interaction behavior should emit or consume established events instead of bypassing the editor event system.
- Public extension points in core must remain stable enough for `packages/extension` and host applications to use without reaching into private internals.

## Common Change Entry Points

Use these entry points to avoid over-scanning the package.

- Change graph-wide state behavior: start with `src/model/GraphModel.ts`.
- Change built-in node or edge semantics: start with `src/model/node` or `src/model/edge`.
- Change rendering of built-in elements: start with `src/view/node` or `src/view/edge`.
- Change drag, selection, connection, or other interaction behavior: start with `src/view/behavior`.
- Change plugin or element registration behavior: start with `src/LogicFlow.tsx`.
- Change keyboard, history, or tool behavior: start with `src/keyboard`, `src/history`, or `src/tool`.

## Dependencies And Extension Surface

This package is the base layer for:

- `packages/extension`
- `packages/layout`
- `packages/react-node-registry`
- `packages/vue-node-registry`

Changes to public exports, registration behavior, graph model contracts, or event semantics can affect all of them. Treat those changes as cross-package API work even when they occur in a single directory.

## Verification Entry

For most source changes:

```sh
cd packages/core
pnpm run build:watch

cd examples/feature-examples
pnpm start
```

If the change affects framework-backed nodes, also verify with the closest framework app in `examples/`.

## What To Avoid In Future Updates

Keep this document focused on stable responsibilities, boundaries, and entry points. Do not turn it into a function-by-function reference or a log of transient implementation details.