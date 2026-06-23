# `@logicflow/layout` Architecture

This package provides automatic layout plugins for LogicFlow graphs. It sits beside `@logicflow/core` and `@logicflow/extension`: it consumes the public graph model and writes layout results back through `renderRawData`, but it does not own editor interaction or grouping membership rules.

## Responsibilities

- Run layout algorithms (Dagre, ELK) on nodes and edges.
- Support group-aware layout: full-graph layout is processed by hierarchy, while
  `groupId` scopes layout to one group's children.
- Post-process group containers after layout: overflow detection, optional resize, console warnings.
- Recompute edge paths through shared `processEdge` helpers.

## Non-responsibilities

- Maintaining `children` / `nodeGroupMap` membership (owned by `DynamicGroup`, `PoolElements`, legacy `Group`).
- Collapse / virtual-edge behavior.
- BPMN or pool lane resize orchestration beyond what layout options explicitly allow.

## Plugin surface

| Plugin | Engine | Access |
| --- | --- | --- |
| `Dagre` | dagre.js | `lf.extension.dagre.layout(options)` |
| `ElkLayout` | elkjs layered | `lf.extension.elkLayout.layout(options)` |

Both plugins share `GroupLayoutOption` from `src/utils/groupLayout.ts`. Dagre and ELK only differ in how coordinates are computed; group scoping and post-resize behavior are identical.

## Group-aware layout pipeline

```text
layout(options)
  → resolveLayoutScopes(allNodes, allEdges, options.groupId)
      undefined groupId: deepest group scopes first, then parent/root scopes
      with groupId: layout only that group's direct children
      cross-level edges: projected to the nearest node visible in the current scope
  → run engine per scope (Dagre / ELK)
  → merge coordinates into full node list; moving a group also moves descendants
  → applyGroupResizeAndWarnings(allModels, allNodeData, options)
  → renderRawData
```

### Group detection

A node is treated as a group when `model.isGroup === true` (DynamicGroup, Lane, Pool, legacy Group). Child membership comes from `model.children` (`Set<string>`).

Layout does not import `@logicflow/extension`. It relies on duck typing against `@logicflow/core` node models.

### Nested groups

Full-graph layout processes groups **deepest first**. Inner group children are
laid out before the group itself participates in its parent scope. When a group
moves in an outer scope, its descendants move by the same delta so membership and
visual containment stay aligned.

`applyGroupResizeAndWarnings` also processes groups deepest first. When an inner
group grows, its parent group is re-evaluated in the same pass so outer bounds
can follow inner changes when `resizeGroup` is enabled.

### Pool / Lane notes

- `LaneModel` and `PoolModel` extend `DynamicGroupNodeModel` and participate in group detection.
- Default `resizeGroup: false` avoids changing lane/pool geometry during layout; overflow is reported via `console.warn`.
- Pool lane title areas and pool↔lane resize coupling are **not** reimplemented here. Layout only adjusts a group node's own `width` / `height` when explicitly requested through `resizeGroup`.
- When changing shared group geometry logic, regression-test pool scenarios in `packages/layout/__test__/group-layout.test.ts` and `packages/extension/__test__/pool`.

## `GroupLayoutOption`

| Field | Default | Meaning |
| --- | --- | --- |
| `groupId` | — | Omit for full-graph layout; set to layout only that group's children. |
| `resizeGroup` | `false` | `false`: no resize; `'grow-only'`: expand only; `'fit'`: fit child bounding box ± padding. |
| `groupPadding` | `40` | Padding used when computing required group bounds. |

### Warnings

During post-processing the package may emit short `console.warn` messages:

1. **Overflow** — child nodes extend outside the group box after layout.
2. **Resize applied** — group width/height was changed.
3. **Override** — `resizeGroup` is truthy while `group.resizable === false`; layout still resizes and warns once.

Each group emits at most one message per category per `layout()` call.

## File map

| Path | Role |
| --- | --- |
| `src/dagre/index.ts` | Dagre plugin |
| `src/elkLayout/index.ts` | ELK plugin |
| `src/utils/groupLayout.ts` | Scope, bounds, resize, warnings |
| `src/utils/processEdge.ts` | Edge path rewrite after layout |

## Verification

```sh
pnpm test -- packages/layout/__test__/group-layout.test.ts
```

Manual: `examples/dynamic-group-regression` scenario `layout-format-escape`.

## Related docs

- User guide: `sites/docs/docs/tutorial/extension/layout.*.md`
- API reference: `sites/docs/docs/api/extension/layout.*.md`
- Grouping ownership: `packages/extension/ARCHITECTURE.md` (Grouping section)
