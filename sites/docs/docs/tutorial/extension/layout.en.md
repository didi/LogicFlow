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

The Layout plugin is currently based on Dagre, and its scope is:
- Covered: automatic calculation of node positions, hierarchy, spacing, and basic edge routing
- Not covered: business rule validation, node/edge styling, and complex interaction logic (handled separately)

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
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core/lib/style/index.min.css" rel="stylesheet">
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
import { Dagre } from "@logicflow/layout";

// Global registration
LogicFlow.use(Dagre);

// Local registration
const lf = new LogicFlow({
  container: document.getElementById('app'),
  plugins: [Dagre]
});
```

### Apply Layout

After registration, you can access the dagre plugin through the LogicFlow instance's extension property:

```tsx | pure
// Use default configuration
lf.extension.dagre.layout();

// Use custom configuration
lf.extension.dagre.layout({
  rankdir: 'TB',   // Top-to-bottom layout direction
  align: 'UL',     // Upper-left alignment
  nodesep: 60,     // Node spacing
  ranksep: 70      // Rank spacing
});
```

## Layout Configuration Options

You can customize the appearance and behavior of the layout through various options:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| rankdir | string | 'LR' | Layout direction: 'LR'(left to right), 'TB'(top to bottom), 'BT'(bottom to top), 'RL'(right to left) |
| align | string | 'UL' | Node alignment: 'UL'(upper left), 'UR'(upper right), 'DL'(down left), 'DR'(down right) |
| nodesep | number | 100 | Horizontal spacing between nodes (pixels) |
| ranksep | number | 150 | Vertical spacing between ranks (pixels) |
| marginx | number | 120 | Horizontal margin of the graph (pixels) |
| marginy | number | 120 | Vertical margin of the graph (pixels) |
| ranker | string | 'tight-tree' | Ranking algorithm: 'network-simplex', 'tight-tree', 'longest-path' |
| edgesep | number | 10 | Horizontal spacing between edges (pixels) |
| acyclicer | string | undefined | If set to 'greedy', uses a greedy heuristic for finding a feedback arc set for making the graph acyclic |
| isDefaultAnchor | boolean | false | Whether to use default anchors: when true, automatically adjusts edge anchors and calculates edge paths based on layout direction |

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

1. **Complex Graphs**: For large or complex flowcharts, use automatic layout to generate an initial arrangement, then make manual adjustments
2. **Dynamic Updates**: Apply layout after adding/removing nodes to keep the graph tidy
3. **Direction Selection**: Choose a suitable layout direction based on the actual meaning of your business process
4. **Parameter Adjustment**: Find the layout that best suits your diagram by adjusting node spacing and rank spacing
