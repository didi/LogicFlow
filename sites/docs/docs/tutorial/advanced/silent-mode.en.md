---
nav: Guide
group:
  title: Intermediate
  order: 2
title: Edit Config Settings
order: 5
toc: content
---

LogicFlow provides a very large number of configurations that control how diagrams are edited,
see [editConfigModel](../../api/editConfigModel.en.md) for details.

## Initialization

LogicFlow supports passing in many configuration parameters at initialization time, and the
configuration for graph editing can also be passed in at initialization time.

```tsx | pure
const lf = new LogicFlow({
  stopZoomGraph: true, // 禁止缩放
  stopScrollGraph: true, // 禁止鼠标滚动移动画布
});
```

## Updating the way the graph is edited

```tsx | pure
lf.updateEditConfig({
  stopZoomGraph: false,
  stopScrollGraph: false,
})
```

## Silent Mode

The silent mode of the canvas can be simply understood as a "read-only" mode, in which the nodes and
edges of the canvas cannot be moved, no text modification is possible, and there are no anchor
points.

:::info{title=tip}
Silent mode is just a shortcut to LogicFlow's built-in flowchart editing controls, a collection of
multiple editing configurations that you can use to edit properties if the effect isn't satisfying.
:::

```tsx | pure
const lf = new LogicFlow({
  isSilentMode: true,
});
```

Silent mode is equivalent to：

```tsx | pure
const SilentConfig = {
  stopZoomGraph: false,
  stopScrollGraph: false,
  stopMoveGraph: false,
  adjustEdge: false,
  adjustEdgeStartAndEnd: false,
  adjustNodePosition: false,
  hideAnchors: true,
  nodeSelectedOutline: true,
  nodeTextEdit: false,
  edgeTextEdit: false,
  nodeTextDraggable: false,
  edgeTextDraggable: false,
};

const lf = new LogicFlow({
  ...SilentConfig
});
```

<a href="https://codesandbox.io/embed/pedantic-microservice-db76o?fontsize=14&hidenavigation=1&theme=dark&view=preview"> Go to CodeSandbox for examples </a>
