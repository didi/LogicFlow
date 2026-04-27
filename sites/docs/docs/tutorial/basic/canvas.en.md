---
nav: Guide
group:
  title: Basics
  order: 1
title: Canvas
order: 4
toc: content
---

This page covers three canvas-related topics: **grid** (alignment and snapping), **background** (underlay styling), and **snaplines** (alignment guides while dragging nodes).

## Grid

The grid is the smallest step used when rendering or moving nodes. It keeps node centers on grid points so elements line up cleanly. Larger spacing makes alignment easier; smaller spacing feels smoother when dragging.

By default the grid is off and the step is 1px. When enabled, the default size is 20px: rendering snaps to that step, and each move step is 20px.

:::warning{title=Note}
When you set node coordinates they are quantized to the grid. For example center `{ x: 124, y: 138 }` may become `{ x: 120, y: 140 }` on the canvas. Migrating from another designer may require normalizing historical coordinates.

If you need both center alignment and edge alignment, prefer node widths and heights that are **even multiples** of the grid size (e.g. with a 20px grid use 20, 40, 80, 120, …).
:::

### Enable the grid

Pass `grid` when constructing LogicFlow:

```tsx | pure
const lf1 = new LogicFlow({
  grid: true,
})

// Equivalent to explicit defaults
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

### Grid options

You can control size, pattern, color, and line thickness.

```tsx | pure
export type GridOptions = {
  size?: number
  visible?: boolean
  type?: 'dot' | 'mesh'
  config?: {
    color?: string
    thickness?: number
  }
}
```

### Snap to grid (`snapGrid`)

`grid` and `snapGrid` work together but differ:

- **`grid`**: How the grid is drawn and its cell size (`size`, `visible`, `type`, …).
- **`snapGrid`**: Whether dragging and placement snap to that grid.

So `grid` is mostly visual and sizing; `snapGrid` is an editing behavior flag.

#### Turning on snap

`snapGrid` is part of edit config: set it at init or update at runtime:

```tsx | pure
const lf = new LogicFlow({
  container: document.querySelector('#app'),
  grid: {
    size: 20,
    visible: true,
    type: 'dot',
  },
  snapGrid: true,
})

lf.updateEditConfig({
  snapGrid: false,
})
```

For more edit options (including `snapGrid`) see [`editConfigModel`](../../api/runtime-model/graphModel.en.md#editconfigmodel) on the runtime model page and [Edit config](../../api/logicflow-instance/edit-config.en.md) for `lf.updateEditConfig` / `lf.getEditConfig`.

### Grid demo

<a href="https://codesandbox.io/embed/logicflow-base8-hxtqr?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank">Open the CodeSandbox example</a>

## Background

LogicFlow can draw a background layer under the diagram (color, image, etc.). Use the `background` option; `false` disables the layer (default).

```tsx | pure
const lf = new LogicFlow({
  background: false | BackgroundConfig,
})

type BackgroundConfig = {
  backgroundImage?: string
  backgroundColor?: string
  backgroundRepeat?: string
  backgroundPosition?: string
  backgroundSize?: string
  backgroundOpacity?: number
  filter?: string
  [key: string]: any
}
```

### Background image

```tsx | pure
const lf = new LogicFlow({
  background: {
    backgroundImage: 'url(../asserts/img/grid.svg)',
    backgroundRepeat: 'repeat',
  },
})
```

### Background demo

<a href="https://codesandbox.io/embed/infallible-goldberg-mrwgz?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank">Open the CodeSandbox example</a>

## Snaplines

Snaplines help align a moving node with others by comparing centers and bounding boxes.

### Usage

Snaplines are on by default in normal edit mode and can be disabled via options. In [silent mode](../advanced/silent-mode.en.md#silent-mode) nodes cannot be moved, so snaplines stay off.

```tsx | pure
const lf = new LogicFlow({
  snapline: false,
})
```

### Styling

Change color and width through the theme:

```tsx | pure
lf.setTheme({
  snapline: {
    stroke: '#1E90FF',
    strokeWidth: 1,
  },
})
```

<example :height="400" ></example>

More styling options: [Theme](./theme.en.md).
