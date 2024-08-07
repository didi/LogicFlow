---
nav: Guide
group:
  title: Basics
  order: 1
title: Grid
order: 4
toc: content
---

A mesh is the smallest unit for rendering/moving nodes. The primary purpose of a mesh is to ensure
that the position of each node center point is on the mesh when moving nodes. This is more conducive
to direct node alignment. Generally speaking, the larger the interval of the grid, the better the
nodes are aligned when editing the flowchart; the smaller the interval of the grid, the smoother the
feeling of dragging nodes.

Grid is off by default, and the minimum unit of rendering/movement is 1px. If grid is on, the
default size of grid is 20px, which means that the nodes are aligned to the network with the minimum
unit of 20 when rendering them, and the minimum distance of 20px each time they are moved when
moving them.

:::warning{title=注意}
When setting node coordinates, the coordinates are transformed according to the size of the grid.
For example, if the center point is set at { x: 124, y: 138 }, the actual position of the rendered
node on the canvas would be { x: 120, y: 140 }. Therefore, when replacing the old flow designer in
the project with LogicFlow, it is necessary to handle the coordinates of historical data.<br>
In practical development, if you want nodes to align both to the center and to the sides, the custom
node's width and height should be multiples of the grid size. This means that the width of all nodes
is preferably in even multiples such as 20, 40, 80, 120, assuming the grid size is 20.
:::

## Enable Grid

When creating the canvas, set grid properties through the configuration grid.

To enable the grid and apply default properties:

```tsx | pure
const lf1 = new LogicFlow({
  grid: true,
})

// or

const lf2 = new LogicFlow({
  grid: {
    size: 20,
    visible: true,
    type: 'dot',
    config: {
      color: '#ababab',
      thickness: 1,
    },
  },
})
```

## Set Grid Properties

Supports setting grid properties such as size, type, grid line color, and width.

```tsx | pure
export type GridOptions = {
  size?: number  // Set grid size.
  visible?: boolean,  // Set visibility; if set to false, grid lines will not be displayed, but the size grid effect will still be retained.
  type?: 'dot' | 'mesh', // Set grid type; currently supports dot and mesh types.
  config?: {
    color: string,  // Set grid color.
    thickness?: number,  // Set grid line width.
  }
};
```

## example

<a href="https://codesandbox.io/embed/logicflow-base8-hxtqr?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank">
Go to CodeSandbox for examples</a>
