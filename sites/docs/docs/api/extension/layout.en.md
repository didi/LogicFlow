---
nav: API
group:
  title: Extensions
  order: 4
title: Automatic Layout
toc: content
order: 1
---

`@logicflow/layout` ships **Dagre** and **ElkLayout**. Both plugins share the same group-layout options (`GroupLayoutOption`) and differ only in the underlying algorithm.

For tutorials and demos, see [Automatic Layout](../../tutorial/extension/layout.en.md).

## Registration and invocation

```tsx | pure
import LogicFlow from '@logicflow/core'
import { Dagre, ElkLayout } from '@logicflow/layout'

const lf = new LogicFlow({
  container: document.getElementById('app'),
  plugins: [Dagre, ElkLayout],
})

// Full graph
lf.extension.dagre.layout({ rankdir: 'TB' })
lf.extension.elkLayout.layout({ rankdir: 'TB' })

// Inner layout for one group only
lf.extension.dagre.layout({
  groupId: 'group_1',
  rankdir: 'LR',
  nodesep: 40,
})
```

## `Dagre.layout(option?)`

Synchronous layout powered by [dagre.js](https://github.com/dagrejs/dagre).

### Common layout options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `rankdir` | `'LR' \| 'TB' \| 'BT' \| 'RL'` | `'LR'` | Layout direction |
| `align` | `'UL' \| 'UR' \| 'DL' \| 'DR'` | `'UL'` | Node alignment |
| `nodesep` | `number` | `100` | Node spacing on the same rank |
| `ranksep` | `number` | `150` | Rank spacing |
| `marginx` | `number` | `120` | Horizontal margin |
| `marginy` | `number` | `120` | Vertical margin |
| `ranker` | `'network-simplex' \| 'tight-tree' \| 'longest-path'` | `'tight-tree'` | Layering strategy |
| `isDefaultAnchor` | `boolean` | `false` | Recompute polyline paths and default anchors when `true` |

### Group layout options (new)

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `groupId` | `string` | — | Omit for full-graph layout; set to layout only direct `children` and inner edges |
| `resizeGroup` | `false \| 'grow-only' \| 'fit'` | `false` | Whether to adjust group size after layout (see below) |
| `groupPadding` | `number` | `40` | Padding around child bounds for overflow checks and group resizing |

:::warning{title=Overflow is detected by default; size is not changed}
With the default `resizeGroup: false`, layout logs `[LogicFlow Layout] 节点超出group边界: <groupId>` when children overflow the group box, but does **not** change group `width` / `height`.
:::

### `resizeGroup` modes

| Value | Behavior |
| --- | --- |
| `false` (default) | Keep group size; warn on overflow |
| `'grow-only'` | Expand group only to wrap children + `groupPadding` |
| `'fit'` | Fit group box to children + padding (grow or shrink) |

When `resizeGroup` is `'grow-only'` or `'fit'`:

- Group `width`, `height`, and `properties.width/height` are updated.
- If `group.resizable === false`, layout still resizes and warns: `resizeGroup 覆盖了 group.resizable=false`.
- When size changes: `调整了group尺寸: <groupId>`.

Within one `layout()` call, each warning category is emitted at most once per group.

### Examples

```tsx | pure
lf.extension.dagre.layout({ rankdir: 'TB', nodesep: 50 })

lf.extension.dagre.layout({
  groupId: 'task_group',
  rankdir: 'LR',
})

lf.extension.dagre.layout({
  groupId: 'task_group',
  resizeGroup: 'grow-only',
  groupPadding: 24,
})

lf.extension.dagre.layout({
  groupId: 'task_group',
  resizeGroup: 'fit',
})
```

## `ElkLayout.layout(option?)`

Async layout powered by [elkjs](https://github.com/kieler/elkjs). Group options match Dagre. Additional options:

| Option | Type | Description |
| --- | --- | --- |
| `edgesep` | `number` | Edge spacing |
| `acyclicer` | `'greedy'` | Cycle breaking |
| `elkOption` | `LayoutOptions` | Raw ELK overrides |

## Supported group types

Containers are detected via `isGroup` and `children`:

| Type | Notes |
| --- | --- |
| `dynamic-group` | Inner layout, nesting |
| `lane` / `pool` | Default `resizeGroup: false` to preserve pool structure |
| Legacy `group` | Still supported; prefer DynamicGroup |

Nested groups are processed deepest-first; outer groups may grow when `resizeGroup` is enabled.

## Type exports

```tsx | pure
import type {
  DagreOption,
  ElkLayoutOption,
  GroupLayoutOption,
  ResizeGroupMode,
} from '@logicflow/layout'
```

## See also

- [Dynamic Group](../../tutorial/extension/dynamic-group.en.md)
- [Pool / Lane](../../tutorial/extension/pool.en.md)
- Package architecture: `packages/layout/ARCHITECTURE.md`
