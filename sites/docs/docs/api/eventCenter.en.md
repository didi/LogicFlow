---
nav: API
title: Event
toc: content
order: 1
---

<style>
table td:first-of-type {
  word-break: normal; 
}
</style>

LogicFlow provides an event system to inform the developer of events that occur in the current
flowchart. The detailed usage of events is described in [events](../tutorial/basic/event.en.md)。

## Node Events

| Event names      | Description                                                                                  | Event object                                |
|:-----------------|:---------------------------------------------------------------------------------------------|:--------------------------------------------|
| element:click    | Click on the element                                                                         | data, e, position                           |
| node:click       | Click on the node                                                                            | data, e, position                           |
| node:dbclick     | Double-click on the node                                                                     | data, e, position                           |
| node:mousedown   | Press the mouse on the node                                                                  | data, e                                     |
| node:mouseup     | Release the mouse on the node                                                                | data, e                                     |
| node:mousemove   | Move the mouse pointer on the node                                                           | data, e                                     |
| node:mouseenter  | Move the mouse pointer into the node                                                         | data, e                                     |
| node:mouseleave  | Move the mouse pointer out of the node                                                       | data, e                                     |
| node:delete      | Delete node                                                                                  | data                                        |
| node:add         | Add node                                                                                     | data                                        |
| node:dnd-add     | When a node is dragged in from outside, the node added will trigger the event                | data                                        |
| node:dnd-drag    | When a node is dragged in from outside, the node in the dragged state will trigger the event | data, e                                     |
| node:dragstart   | Start dragging nodes                                                                         | data, e                                     |
| node:drag        | Nodes in dragging                                                                            | data, e                                     |
| node:drop        | End of node dragging                                                                         | data, e                                     |
| node:contextmenu | Right-click on the node                                                                      | data, e, position                           |
| node:resize      | Handle resize node                                                                           | preData, data, model, deltaX, deltaY, index |

The event object contains the following:

| Property | Type       | Description                                                                                                                                    |
|:---------|:-----------|:-----------------------------------------------------------------------------------------------------------------------------------------------|
| data     | Object     | The [data attribute](./model/nodeModel.en.md#data-attributes)                                                                                  |
| e        | MouseEvent | Native mouse event object                                                                                                                      |
| position | Object     | Coordinates of the mouse trigger point in the canvas ( Refer to the return value of [getPointByClient](./detail/index.en.md#getpointbyclient)) |

## Edge Events

| Event names            | Description                            | Event object      |
|:-----------------------|:---------------------------------------|:------------------|
| element:click          | Click on the element                   | data, e, position |
| edge:click             | Click on the edge                      | data, e, position |
| edge:dbclick           | Double-click on the edge               | data, e           |
| edge:mouseenter        | Move the mouse pointer into the edge   | data, e           |
| edge:mouseleave        | Move the mouse pointer out of the edge | data, e           |
| edge:add               | Add edge                               | data              |
| edge:delete            | Delete edge                            | data              |
| edge:contextmenu       | Right-click on the edge                | data, e, position |
| edge:adjust            | Drag to adjust the edge                | data              |
| edge:exchange-node     | Adjust the start/end of the edge       | data              |
| connection:not-allowed | Connection not allowed                 | data, msg         |

The event object contains the following:

| Property | 类型         | 值                                                                                                                                            |
|:---------|:-----------|:---------------------------------------------------------------------------------------------------------------------------------------------|
| data     | Object     | The [data attribute](./model/edgeModel.en.md#data-attributes)                                                                                |
| e        | MouseEvent | Native mouse event object                                                                                                                    |
| position | Object     | Coordinates of the mouse trigger point in the canvas(Refer to the return value of [getPointByClient](./detail/index.en.md#getpointbyclient)) |
| msg      | string     | Verification information of the edge                                                                                                         |

## Anchor Events

| Event names      | Description                                                                                                                                                                                             | Event object                  |
|:-----------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------|
| anchor:dragstart | Start connecting based on anchor points                                                                                                                                                                 | data, e, nodeModel            |
| anchor:drop      | Manual connection success based on anchor points. Triggered only if the edge is created successfully. Used to distinguish between manually created edges and automatically created edges ( `edge:add` ) | data, e, nodeModel, edgeModel |
| anchor:dragend   | End of manual connection based on anchor points. This is triggered whether or not the edge is successfully created.                                                                                     | data, e, nodeModel            |
| anchor:dragend   | The end of the anchor linkage is triggered regardless of whether the linkage is created or not.                                                                                                         | data, e, nodeModel            |

The event object contains the following:

| Properties | Type       | Description                                |
|:-----------|:-----------|:-------------------------------------------|
| data       | Object     | Anchor data                                |
| e          | MouseEvent | Native mouse event object                  |
| nodeModel  | Object     | The node to which the anchor point belongs |

<!-- adjustPoint -->

## Graph Events

| Event names       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Event object |
|:------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-------------|
| blank:mousedown   | Press the mouse on the canvas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | e            |
| blank:mousemove   | Move the mouse pointer on the canvas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | e            |
| blank:mouseup     | Release the mouse on the canvas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | e            |
| blank:click       | Click on the canvas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | e            |
| blank:contextmenu | Right-click on the canvas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | e, position  |
| blank:dragstart   | Start dragging canvas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | e            |
| blank:drag        | Canvas in dragging                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | e            |
| blank:drop        | End of canvas dragging                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | e            |
| text:update       | Update text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | data         |
| graph:transform   | Triggered when panning or zooming the canvas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | data         |
| graph:rendered    | Triggered after the canvas renders data, i.e. after the lf.render(graphData) method is called. `Add in v1.1.0`                                                                                                                                                                                                                                                                                                                                                                                                                                                     | graphData    |
| graph:updated     | Triggered after the canvas is updated. That is, it is triggered after the lf.render(graphData) method is called or after the properties on the canvas (graphModel) are changed. If the canvas is updated due to active modification of a property, and you want to do something after the canvas is updated, it is recommended to register the event and unregister the event in the callback function in time, or use the once event instead of the on event, because as other properties may also cause the canvas to update, trigger this event. `Add inv2.0.0` | -            |

The event object contains the following:

| Property | Type       | Description                                                                                                                                 |
|:---------|:-----------|:--------------------------------------------------------------------------------------------------------------------------------------------|
| e        | MouseEvent | Native mouse event object                                                                                                                   |
| position | Object     | Coordinates of the mouse trigger point in the canvas(Refer to the return value of[getPointByClient](./detail/index.en.md#getpointbyclient)) |

## History Events

History is used to record every change on the canvas. The `history:change` event is triggered when
an element on the canvas changes.

| Event names    | Description        | Event object |
|:---------------|:-------------------|:-------------|
| history:change | The canvas changes | data         |

The data property in the event object contains the following content:

| Properties | Type    | Description              |
|:-----------|:--------|:-------------------------|
| undos      | Array   | Undoable graph snapshots |
| redos      | Array   | Redoable graph snapshots |
| undoAble   | boolean | Whether it can be undone |
| redoAble   | boolean | Whether it can be redone |

## Selection Events

Events triggered when multiple nodes are selected at the same time to form a selection.

| Event names           | Description                              | Event object          |
|:----------------------|:-----------------------------------------|:----------------------|
| selection:selected    | Triggered when the selection is selected | All selected elements |
| selection:mousedown   | Press the mouse on the selection         | e                     |
| selection:dragstart   | Start dragging the selection             | e                     |
| selection:drag        | Selection in dragging                    | e                     |
| selection:drop        | End of selection dragging                | e                     |
| selection:mousemove   | Move the mouse pointer on the selection  | e, position           |
| selection:mouseup     | Release the mouse on the selection       | e                     |
| selection:contextmenu | Right-click on the selection             | e                     |

The event object contains the following:

| Properties | Type       | Description                                                                                                                                  |
|:-----------|:-----------|:---------------------------------------------------------------------------------------------------------------------------------------------|
| e          | MouseEvent | Native mouse event                                                                                                                           |
| position   | Object     | Coordinates of the mouse trigger point in the canvas(Refer to the return value of [getPointByClient](./detail/index.en.md#getpointbyclient)) |

## Text events

When the position or content of a Text changes, the event is triggered by the text

| Event name     | Description                            | Event object            |
|:---------------|:---------------------------------------|:------------------------|
| text:mousedown | Mouse presses the text                 | e, data                 |
| text:dragstart | Start dragging the text                | e, data                 |
| text:drag      | Drag the text                          | e, data                 |
| text:drop      | Release the text                       | e, data                 |
| text:click     | Click the text                         | e                       |
| text:dbclick   | Double-click the text                  | e                       |
| text:blur      | Text loses focus                       | e                       |
| text:mousemove | Mouse moves inside the text area       | e, data, deltaX, deltaY |
| text:mouseup   | Mouse is released inside the text area | e, data                 |
| text:update    | Update the text                        | data                    |

When the position or content of a Label text changes, the event is triggered by the text

| Event name      | Description                            | Event object            |
|:----------------|:---------------------------------------|:------------------------|
| label:mousedown | Mouse presses text                     | e, data                 |
| label:dragstart | Start dragging text                    | e, data                 |
| label:drag      | Drag text                              | e, data                 |
| label:drop      | Release text                           | e, data                 |
| label:mousemove | Mouse moves inside the text area       | e, data, deltaX, deltaY |
| label:mouseup   | Mouse is released inside the text area | e, data                 |

The event object contains the following:

| Attribute | Type       | Value                     |
|:----------|:-----------|:--------------------------|
| e         | MouseEvent | Native mouse event object |
| data      | Object     | NodeModel/EdgeModel       |

## on

Register events.

Parameters:

| Name     | Type   | Required | Default | Description       |
|:---------|:-------|:---------|:--------|:------------------|
| evt      | string | ✅        | -       | Event Name        |
| callback | string | ✅        | -       | Callback function |

Example:

```tsx | pure
const { eventCenter } = lf.graphModel;

eventCenter.on("node:click", (args) => {
  console.log("node:click", args.position);
});
eventCenter.on("element:click", (args) => {
  console.log("element:click", args.e.target);
});

```

## off

Delete registered events.

Parameters:

| Name     | Type   | Required | Default | Description       |
|:---------|:-------|:---------|:--------|:------------------|
| evt      | string | -        | -       | Event Name        |
| callback | string | -        | -       | Callback function |

When evt is empty, remove all evt listeners.
When evt is present and callback is empty, remove all registered methods for the corresponding
event.
When both evt and callback are present, compare the callback objects and remove matching methods.

Example:

```tsx | pure
const { eventCenter } = lf.graphModel;

eventCenter.off("node:click", () => {
  console.log("node:click off");
});

eventCenter.off("element:click", () => {
  console.log("element:click off");
});
```

## once

The event is triggered only once.

Parameters:

| Name     | Type   | Required | Default | Description       |
|:---------|:-------|:---------|:--------|:------------------|
| evt      | string | ✅        | -       | Event Name        |
| callback | string | ✅        | -       | Callback function |

Example:

```tsx | pure
const { eventCenter } = lf.graphModel;

eventCenter.once("node:click", () => {
  console.log("node:click");
});

```

## emit

Trigger the event.

Parameters:

| Name | Type   | Required | Default | Description       |
|:-----|:-------|:---------|:--------|:------------------|
| evt  | string | ✅        | -       | Event Name        |
| args | Array  | ✅        | -       | Callback function |

Example:

```tsx | pure
const { eventCenter } = lf.graphModel;

eventCenter.emit("custom:button-click", data);
```
