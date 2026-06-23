---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: Automatic Layout
order: 7
toc: content
tag: Enhancement
---

In complex flowcharts, manually placing nodes and adjusting edges is time-consuming and often messy.

The auto layout plugin can:
- Automatically compute node positions and rank order from edge relationships
- Support layout directions (LR/TB/BT/RL) and alignment
- Configure node spacing, rank spacing, edge spacing, and canvas margins
- Plan edge routes to reduce crossings and keep a consistent overall flow
- Optionally adjust edge endpoints based on default anchors

It typically produces a structured layout with clear hierarchy, consistent spacing, and fewer edge crossings, making it ideal for an initial layout that you can fine-tune.

`@logicflow/layout` provides **Dagre** and **ElkLayout**. Both share group-layout options (see [Layout API](../../api/extension/layout.en.md)).

**Scope:**

- Covered: node positions, hierarchy, spacing, basic edge routing; inner layout and overflow detection for containers such as `dynamic-group` and lanes
- Not covered: business validation, styling, group membership (owned by DynamicGroup / Pool plugins)

:::warning{title=resizeGroup defaults to false}
By default, group width/height is **not** changed. Overflow triggers a console warning. Pass `resizeGroup: 'grow-only'` or `'fit'` when you want the group box to follow laid-out children.
:::

## Live Demonstration

### Default Anchors

If nodes use LogicFlow's default anchors (i.e., top, bottom, left, and right anchors), and anchor information doesn't carry business meaning, you can set isDefaultAnchor to true to adjust connection start and end anchor positions during layout.

<code id="react-portal-1" src="@/src/tutorial/extension/layout"></code>

### Custom Anchors

If nodes use custom anchors, or if anchors have actual business meaning, isDefaultAnchor is false by default, which means the layout will not adjust the connection's start and end anchors.

<code id="react-portal-2" src="@/src/tutorial/extension/layout/custom"></code>

## Installation

```shell
# npm
npm install @logicflow/layout

# yarn
yarn add @logicflow/layout

# pnpm
pnpm add @logicflow/layout
```

### UMD Usage

You can also use the UMD bundle directly via CDN:

```html
<!-- Include LogicFlow Core UMD -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/index.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/index.css" rel="stylesheet">
<!-- Include Layout UMD -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/layout/dist/index.min.js"></script>

<script>
  // Access Dagre plugin through global variable Layout
  const { Dagre } = Layout;
  
  // Create LogicFlow instance and register plugin
  const lf = new LogicFlow.default({
    container: document.getElementById('container'),
    plugins: [Dagre]
  });
  
  // Use layout functionality
  lf.dagre.layout({
    rankdir: 'LR',
    nodesep: 50,
    ranksep: 100
  });
</script>
```

## Basic Usage

### Register the Plugin

Like other LogicFlow plugins, Layout supports both global and local registration:

```tsx | pure
import LogicFlow from "@logicflow/core";
import { Dagre, ElkLayout } from "@logicflow/layout";

LogicFlow.use(Dagre);
LogicFlow.use(ElkLayout);

const lf = new LogicFlow({
  container: document.getElementById('app'),
  plugins: [Dagre, ElkLayout]
});
```

### Apply Layout

```tsx | pure
lf.extension.dagre.layout({ rankdir: 'TB', nodesep: 60, ranksep: 70 });
await lf.extension.elkLayout.layout({ rankdir: 'TB', nodesep: 60, ranksep: 70 });
```

## Layout Configuration Options

### Common options (Dagre / ElkLayout)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| rankdir | string | 'LR' | Layout direction: 'LR', 'TB', 'BT', 'RL' |
| align | string | 'UL' | Node alignment: 'UL', 'UR', 'DL', 'DR' |
| nodesep | number | 100 | Horizontal spacing between nodes (pixels) |
| ranksep | number | 150 | Vertical spacing between ranks (pixels) |
| marginx | number | 120 | Horizontal margin of the graph (pixels) |
| marginy | number | 120 | Vertical margin of the graph (pixels) |
| ranker | string | 'tight-tree' | Ranking algorithm: 'network-simplex', 'tight-tree', 'longest-path' |
| isDefaultAnchor | boolean | false | When true, adjusts edge anchors and paths based on layout direction |

ElkLayout also supports `edgesep`, `acyclicer`, and `elkOption`.

### Group layout options (new)

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| groupId | string | — | Omit for full graph; set to layout only that group's children |
| resizeGroup | `false \| 'grow-only' \| 'fit'` | `false` | Whether to adjust group size after layout |
| groupPadding | number | 40 | Padding around child bounds for overflow checks and group resizing |

**`resizeGroup`:**

- `false`: keep size; warn on overflow
- `'grow-only'`: expand only
- `'fit'`: fit to children (grow or shrink); warns when size changes

When `resizeGroup` is truthy and `group.resizable === false`, layout still resizes and warns about the override.

Within one `layout()` call, each warning category is emitted at most once per group.

## Group layout examples

See also [Dynamic Group](./dynamic-group.en.md) and [Pool / Lane](./pool.en.md).

```tsx | pure
lf.extension.dagre.layout({ rankdir: 'TB' })

lf.extension.dagre.layout({ groupId: 'group_1', rankdir: 'LR' })

lf.extension.dagre.layout({
  groupId: 'group_1',
  resizeGroup: 'grow-only',
  groupPadding: 24,
})

lf.extension.elkLayout.layout({
  groupId: 'lane_1',
  rankdir: 'LR',
  resizeGroup: false,
})
```

Full API reference: [Layout API](../../api/extension/layout.en.md).

## Advanced Features

### Auto-fit View After Layout

After adjusting the layout, you may need to adjust the view to show all nodes:

```tsx | pure
// First apply the layout
lf.extension.dagre.layout();
// Then fit the view
lf.fitView();
```

## Usage Recommendations

1. **Complex Graphs**: Use auto layout for an initial arrangement, then fine-tune manually
2. **Grouped graphs**: Default `resizeGroup: false` warns only; use `'grow-only'` or `'fit'` to resize group boxes
3. **Swimlanes**: Prefer `resizeGroup: false` inside lanes to preserve pool/lane geometry
4. **Dynamic Updates**: Re-layout after adding or removing nodes
5. **Direction Selection**: Pick a direction that matches your process semantics
6. **Parameter Tuning**: Adjust `nodesep` and `ranksep` for your diagram density
