---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: SelectionSelect
order: 5
toc: content
tag: Optimization
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

The SelectionSelect plugin in LogicFlow allows users to select multiple graphical elements by dragging the mouse to draw a rectangular box, facilitating batch operations or editing.

## Demonstration

<code id="react-portal" src="@/src/tutorial/extension/selection-select"></code>

## Usage

### Registration

There are two registration methods: global registration and local registration. The difference is that global registration allows every `lf` instance to use it.

```tsx | pure
import LogicFlow from "@logicflow/core";
import { SelectionSelect } from "@logicflow/extension";

// Global registration
LogicFlow.use(SelectionSelect);

// Local registration
const lf = new LogicFlow({
  ...config,
  plugins: [SelectionSelect]
});
```

## API

### openSelectionSelect

Enable selection selection.

```tsx | pure
lf.openSelectionSelect();

// Added in 1.1.0
lf.extension.selectionSelect.openSelectionSelect();
```

### closeSelectionSelect

Disable selection selection.

```tsx | pure
lf.closeSelectionSelect();

// Added in 1.1.0
lf.extension.selectionSelect.closeSelectionSelect();
```

### setSelectionSense

Set selection sensitivity.

- By default, the entire node must be within the selection box to be selected.
- By default, both the start and end points of the edge must be within the selection box to be selected.

You can call the `setSelectionSense` method to reconfigure this.

| Parameter      | Default Value | Description                                    |
| -------------- | -------------- | ---------------------------------------------- |
| isWholeEdge    | true           | Whether both the start and end points of the edge must be within the selection area to be selected |
| isWholeNode    | true           | Whether the entire node must be within the selection area to be selected |

Usage:

```tsx | pure
lf.extension.selectionSelect.setSelectionSense(false, true);
```

## Default State

The default state of the selection functionality is influenced by whether the canvas dragging is allowed on the page. The canvas can either be dragged or have the selection box, but not both simultaneously.

```tsx | pure
const lf = new LogicFlow({
  container: document.querySelector("#app"),
  stopMoveGraph: true,
});
```

If `stopMoveGraph` is true, meaning canvas dragging is not allowed, then selection is enabled by default.

If `stopMoveGraph` is false, meaning canvas dragging is allowed, then selection is disabled by default.

In most cases, we expect to allow canvas dragging and only enable selection when the user clicks and drags the panel. Please refer to the [Drag-and-Drop Panel Plugin](dnd-panel.en.md).