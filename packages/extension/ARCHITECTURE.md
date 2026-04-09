# Extension Architecture

## Mission

`@logicflow/extension` collects optional capabilities built on top of `@logicflow/core`: BPMN support, built-in editor components, helper tools, materials, and higher-level editing plugins.

If a feature extends editor behavior without redefining the core editor runtime, it usually belongs here.

## What This Package Owns

- BPMN elements and BPMN data adapters
- built-in editor UI such as menus, mini-map, context menu, drag-and-drop panel, and selection helpers
- optional tools such as label support, snapshot, flow-path, auto-layout integration, and proximity-connect
- reusable materials and grouped editing capabilities such as pool and dynamic-group

## What This Package Does Not Own

- the base editor state model or registration primitives
- workflow execution semantics
- framework adapters as a general rendering layer

This package should remain an extension layer over public core APIs rather than a second core.

## Code Map

### Public surface

- `src/index.ts`: package export hub for plugins, adapters, tools, components, and materials.

### BPMN support

- `src/bpmn`: BPMN-oriented plugin registration and built-in BPMN element setup.
- `src/bpmn-adapter`: BPMN data conversion logic.
- `src/bpmn-elements` and `src/bpmn-elements-adapter`: BPMN element definitions and related adapters.

### Editor components

- `src/components/context-menu`
- `src/components/control`
- `src/components/dnd-panel`
- `src/components/highlight`
- `src/components/menu`
- `src/components/mini-map`
- `src/components/selection-select`

### Plugin-like editor features

- `src/tools`: optional helper capabilities layered onto core.
- `src/materials`: reusable node and edge enhancements.
- `src/pool`: swimlane-style structures.
- `src/dynamic-group`: newer grouping behavior.
- `src/insert-node-in-polyline`: polyline insertion behavior.
- `src/rect-label-node` and `src/NodeResize`: legacy or compatibility-oriented features still exported by the package.

## Stable Runtime Pattern

Most features in this package follow the same high-level pattern:

1. import public types or runtime hooks from `@logicflow/core`
2. register elements, tools, or components through core extension points
3. expose the feature as an optional plugin or helper export

Preserve that pattern. Extension code should layer on top of core, not tunnel into private internals when a public hook is available.

## Invariants

- Features in this package are optional. They should not be required for a baseline `@logicflow/core` editor to work.
- Public extension behavior should compose through `LogicFlow.use`, registration, or other documented core hooks.
- BPMN support should remain grouped in BPMN-focused modules rather than leaking BPMN assumptions into unrelated extension features.
- Built-in components and tools should avoid becoming hidden sources of graph state. Core models remain the source of truth.
- New features should land in a focused module instead of expanding the root export file with unrelated implementation logic.

## Common Change Entry Points

- Add or adjust BPMN element behavior: start with `src/bpmn` or `src/bpmn-elements`.
- Change BPMN import or export contracts: start with `src/bpmn-adapter`.
- Change built-in menus, panels, or overlays: start with `src/components`.
- Change helper tools such as auto-layout or snapshot: start with `src/tools`.
- Change grouped editing or swimlane behavior: start with `src/pool` or `src/dynamic-group`.
- Change reusable node or edge materials: start with `src/materials`.

## Dependency Boundaries

This package depends on `@logicflow/core` and should primarily consume its public extension and rendering surface.

`@logicflow/core` is the host runtime for this package, not an implementation detail to duplicate. Keep it as a consumer-provided peer for published usage, while retaining a local development dependency only when the package itself needs to build or type-check inside the monorepo.

Vue- or React-specific custom node rendering belongs in the registry packages and host applications, not in this package. Extension features may need to behave correctly when those registries are present, but that compatibility should not become a hard package dependency unless the extension source actually imports and uses it.

If a feature cannot be implemented without changing private core internals, prefer improving the core extension point first rather than baking a fragile workaround into this package.

## Verification Entry

For most extension changes:

```sh
cd packages/extension
pnpm run build:watch

cd examples/feature-examples
pnpm start
```

Use a more targeted example when the feature is framework-specific or docs-facing.

## What To Avoid In Future Updates

Do not let this document collapse into a list of every plugin export. Keep it focused on module responsibilities, stable patterns, and integration boundaries.