---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: MiniMap
order: 4
toc: content
tag: Optimization
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

LogicFlow's canvas MiniMap is a thumbnail view that helps users quickly navigate and locate different areas of large or complex diagrams.

This article covers the latest syntax for version 2.0. For versions before 2.0, please visit the [old version](https://docs.logic-flow.cn/docs/#/zh/guide/extension/component-minimap).

## Demonstration

<code id="react-portal" src="@/src/tutorial/extension/mini-map"></code>

## Usage

### 1. Registration

There are two registration methods: global registration and local registration. The difference is that global registration allows every `lf` instance to use it.

```tsx | pure
import LogicFlow from "@logicflow/core";
import { MiniMap } from "@logicflow/extension";

// Global registration
LogicFlow.use(MiniMap);

// Local registration
const lf = new LogicFlow({
  ...config,
  plugins: [MiniMap]
});
```

### 2. Configuration

When initializing the `lf` instance, you can customize the MiniMap's capabilities through `pluginsOptions`.

```tsx | pure
const miniMapOptions: MiniMap.MiniMapOption = {
  ...options
}

const lf = new LogicFlow({
  ...config,
  plugins: [MiniMap],
  pluginsOptions: {
    miniMap: miniMapOptions,
  },
});
```

The `miniMapOptions` configuration is as follows:

| Property Name  | Type   | Default Value | Required | Description                              |
| -------------- | ------ | ------------- | -------- | ---------------------------------------- |
| width           | number | 150           | -        | The width of the canvas in the MiniMap   |
| height          | number | 220           | -        | The height of the canvas in the MiniMap  |
| showEdge        | boolean| false         | -        | Whether to render edges in the MiniMap   |
| headerTitle     | string | Navigation    | -        | The text content of the MiniMap's title bar; defaults to not showing |
| isShowHeader    | boolean| false         | -        | Whether to show the MiniMap's title bar  |
| isShowCloseIcon | boolean| false         | -        | Whether to show the close button         |
| leftPosition    | number | -             | -        | The left margin of the MiniMap from the canvas's left boundary; takes precedence over `rightPosition` |
| rightPosition   | number | 0             | -        | The right margin of the MiniMap from the canvas's right boundary; lower priority than `leftPosition` |
| topPosition     | number | -             | -        | The top margin of the MiniMap from the canvas's top boundary; takes precedence over `bottomPosition` |
| bottomPosition  | number | 0             | -        | The bottom margin of the MiniMap from the canvas's bottom boundary; lower priority than `topPosition` |

## API

### show

By default, the MiniMap is not displayed after being included; you need to manually enable it.

```tsx | pure
lf.extension.miniMap.show(left?: number, top?: number): void
```

`show()` supports passing `left` and `top` style properties to determine the MiniMap's position relative to the top-left corner of the canvas. If not provided, it defaults to the bottom-right corner of the canvas.

Providing only `left` and `top` values allows integration with the `lf.getPointByClient` API. For more flexible styling, you can directly set styles via class names:

- `lf-mini-map` - MiniMap root element
- `lf-mini-map-header` - MiniMap header element
- `lf-mini-map-graph` - MiniMap canvas element
- `lf-mini-map-close` - MiniMap close icon element

> `MiniMap.show()` must be called after `lf.render()`.

### hide

Hide the MiniMap.

```tsx | pure
lf.extension.miniMap.hide(): void
```

### reset

Reset the MiniMap's zoom and translation, essentially resetting the canvas's zoom and translation.

```tsx | pure
lf.extension.miniMap.reset(): void
```

Internal implementation:

```tsx | pure
lf.resetTranslate()
lf.resetZoom()
```

### updatePosition

Update the MiniMap's position on the canvas.

```tsx | pure
lf.extension.miniMap.updatePosition(MiniMapPosition): void
```

`MiniMapPosition` parameter is as follows:

```tsx | pure
export type AbsolutePosition = Partial<
  Record<'left' | 'right' | 'top' | 'bottom', number>
>

export type MiniMapPosition =
  | 'left-top' // Indicates the MiniMap is located at the top-left corner of the container
  | 'right-top' // Indicates the MiniMap is located at the top-right corner of the container
  | 'left-bottom' // Indicates the MiniMap is located at the bottom-left corner of the container
  | 'right-bottom' // Indicates the MiniMap is located at the bottom-right corner of the container
  | AbsolutePosition // Custom position of the MiniMap on the canvas
```

### setShowEdge

Set whether the edges are displayed in the MiniMap's canvas.

```tsx | pure
lf.extension.miniMap.setShowEdge(showEdge: boolean): void
```

`showEdge`: `true` to display, `false` to hide.

## Events

MiniMap events.

| Event Name       | Description          | Event Object |
| ---------------- | --------------------- | ------------ |
| miniMap:close    | MiniMap hidden        | {}           |

