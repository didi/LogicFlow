---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: SelectionSelect
order: 5
toc: content
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

# SelectionSelect

```tsx | purex | pure
import LogicFlow from '@logicflow/core'
import { SelectionSelect } from '@logicflow/extension'
import '@logicflow/extension/lib/style/index.css'

LogicFlow.use(SelectionSelect)
```

### start

```tsx | purex | pure
lf.openSelectionSelect();

// 1.1.0 new
lf.extension.selectionSelect.openSelectionSelect();
```

### close

```tsx | purex | pure
lf.closeSelectionSelect();
// 1.1.0 new
lf.extension.selectionSelect.closeSelectionSelect();
```

<!-- <example href="/examples/#/extension/components/selection" :height="300" ></example> -->

### Default state

Whether box selection is enabled by default is affected by whether the page allows
canvas dragging. The canvas can be dragged and the selection cannot exist at the same time.

```tsx | pure
const lf = new LogicFlow({
  container: document.querySelector("#app"),
  stopMoveGraph: true,
});
```

If `stopMoveGraph` is true, i.e. dragging the canvas is not allowed, then box selection is allowed
by default.

If `stopMoveGraph` is not true, i.e., canvas dragging is allowed, then box selection is not allowed
by default.

In most cases, we expect to allow canvas dragging, and only turn on the selection when the user
clicks on the drag and drop panel. See [drag-and-drop panel plugin](dnd-panel.en.md)

### Set selection sensitivity

- By default, the entire node needs to be boxed in order to select the node.
- By default, the start and end of an edge need to be selected to select the edge.

You can call the plugin method `setSelectionSense` to reset it.

| Parameters  | Default | Description                                                                                      |
|-------------|---------|--------------------------------------------------------------------------------------------------|
| isWholeEdge | true    | Whether the start and end of an edge should be in the selection range to be considered selected. |
| isWholeNode | true    | Whether all points of the node should be in the selection range to be considered selected.       |

usage：

```tsx | pure
lf.extension.selectionSelect.setSelectionSense(false, true);
```

### example

<a href="https://codesandbox.io/embed/trusting-archimedes-m0bn4r?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> Go to CodeSandbox for examples </a>
