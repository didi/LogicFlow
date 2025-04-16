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

| Event names                                    | Description                            | Event object                                                                                                                                      |
| :--------------------------------------------- | :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| element:click                                  | Click on the element                   | data, e, position                                                                                                                                 |
| node:click                                     | Click on the node                      | data, e, position                                                                                                                                 |
| node:dbclick                                   | Double-click on the node               | data, e, position                                                                                                                                 |
| node:mousedown                                 | Press the mouse on the node            | data, e                                                                                                                                           |
| node:mouseup                                   | Release the mouse on the node          | data, e                                                                                                                                           |
| node:mousemove                                 | Move the mouse pointer on the node     | data, e                                                                                                                                           |
| node:mouseenter                                | Move the mouse pointer into the node   | data, e                                                                                                                                           |
| node:mouseleave                                | Move the mouse pointer out of the node | data, e                                                                                                                                           |
| node:delete                                    | Delete node                            | data                                                                                                                                              |
| node:add                                       | Add node                               | data                                                                                                                                              |
| node:dnd-add                                   | When a node is dragged in from outside | data                                                                                                                                              |
| node:dnd-drag                                  | When dragging a node from outside      | data, e                                                                                                                                           |
| node:dragstart                                 | Start dragging nodes                   | data, e                                                                                                                                           |
| node:drag                                      | Nodes in dragging                      | data, e                                                                                                                                           |
| node:drop                                      | End of node dragging                   | data, e                                                                                                                                           |
| node:contextmenu                               | Right-click on the node                | data, e, position                                                                                                                                 |
| node:resize<Badge>2.0 Added</Badge>            | Adjust node scaling                    | preData, data, model, deltaX, deltaY, index                                                                                                       |
| node:resize-start<Badge>2.0 Added</Badge>      | Start adjusting node scaling           | e, data, model                                                                                                                                    |
| node:properties-change<Badge>2.0 Added</Badge> | Node custom properties change          | id: Current node id<br/>keys: Set of keys for current changes<br/>preProperties: Properties before change<br/>properties: Properties after change |

The event object contains the following:

| Property | Type       | Description                                                                                                                                    |
| :------- | :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| data     | Object     | The [data attribute](./model/nodeModel.en.md#data-attributes)                                                                                  |
| e        | MouseEvent | Native mouse event object                                                                                                                      |
| position | Object     | Coordinates of the mouse trigger point in the canvas ( Refer to the return value of [getPointByClient](./detail/index.en.md#getpointbyclient)) |

## Edge Events

| Event names                                    | Description                              | Event object                                                                                                                                      |
| :--------------------------------------------- | :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| edge:click                                     | Click on the edge                        | data, e, position                                                                                                                                 |
| edge:dbclick                                   | Double-click on the edge                 | data, e, position                                                                                                                                 |
| edge:mouseenter                                | Move the mouse pointer into the edge     | data, e                                                                                                                                           |
| edge:mouseleave                                | Move the mouse pointer out of the edge   | data, e                                                                                                                                           |
| edge:add                                       | Add edge                                 | data                                                                                                                                              |
| edge:delete                                    | Delete edge                              | data                                                                                                                                              |
| edge:contextmenu                               | Right-click on the edge                  | data, e, position                                                                                                                                 |
| edge:adjust                                    | Adjust edge                              | data                                                                                                                                              |
| edge:exchange-node<Badge>2.0 Added</Badge>     | Exchange source and target nodes of edge | data                                                                                                                                              |
| edge:connect<Badge>2.0 Added</Badge>           | Edge connection completed                | data                                                                                                                                              |
| edge:beforeConnect<Badge>2.0 Added</Badge>     | Before edge connection                   | data, msg                                                                                                                                         |
| edge:properties-change<Badge>2.0 Added</Badge> | Edge custom properties change            | id: Current edge id<br/>keys: Set of keys for current changes<br/>preProperties: Properties before change<br/>properties: Properties after change |

The event object contains the following:

| Property | 类型       | 值                                                                                                                                           |
| :------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| data     | Object     | The [data attribute](./model/edgeModel.en.md#data-attributes)                                                                                |
| e        | MouseEvent | Native mouse event object                                                                                                                    |
| position | Object     | Coordinates of the mouse trigger point in the canvas(Refer to the return value of [getPointByClient](./detail/index.en.md#getpointbyclient)) |
| msg      | string     | Verification information of the edge                                                                                                         |

## Anchor Events

| Event names                               | Description                              | Event object |
| :---------------------------------------- | :--------------------------------------- | :----------- |
| anchor:mouseenter<Badge>2.0 Added</Badge> | Move the mouse pointer into the anchor   | data, e      |
| anchor:mouseleave<Badge>2.0 Added</Badge> | Move the mouse pointer out of the anchor | data, e      |
| anchor:dragstart<Badge>2.0 Added</Badge>  | Start dragging from anchor               | data, e      |
| anchor:drop<Badge>2.0 Added</Badge>       | Drop on anchor                           | data, e      |

The event object contains the following:

| Properties | Type       | Description                                |
| :--------- | :--------- | :----------------------------------------- |
| data       | Object     | Anchor data                                |
| e          | MouseEvent | Native mouse event object                  |
| nodeModel  | Object     | The node to which the anchor point belongs |

<!-- adjustPoint -->

## Canvas Events

| Event names                               | Description                      | Event object                                   |
| :---------------------------------------- | :------------------------------- | :--------------------------------------------- |
| blank:mousedown                           | Mouse down on blank area         | e                                              |
| blank:mousemove                           | Mouse move on blank area         | e                                              |
| blank:mouseup                             | Mouse up on blank area           | e                                              |
| blank:click                               | Click on blank area              | e                                              |
| blank:contextmenu                         | Right-click on blank area        | e                                              |
| blank:dragstart                           | Start dragging on blank area     | e                                              |
| blank:drag                                | Dragging on blank area           | e                                              |
| blank:drop                                | Drop on blank area               | e                                              |
| graph:transform                           | Graph transformation (zoom, pan) | transform: { transform: string; zoom: number } |
| graph:rendered                            | Graph rendering completed        | graphData                                      |
| history:change                            | History state change             | data: { undoAble: boolean; redoAble: boolean } |
| graph:rendered<Badge>2.0 Added</Badge>    | Graph rendering completed        | graphData                                      |
| graph:transform<Badge>2.0 Added</Badge>   | Graph transformation (zoom, pan) | transform: { transform: string; zoom: number } |
| graph:data-change<Badge>2.0 Added</Badge> | Graph data change                | graphData                                      |

## Text events

When the position or content of a Text changes, the event is triggered by the text

| Event name     | Description                            | Event object            |
| :------------- | :------------------------------------- | :---------------------- |
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
| :-------------- | :------------------------------------- | :---------------------- |
| label:mousedown | Mouse presses text                     | e, data                 |
| label:dragstart | Start dragging text                    | e, data                 |
| label:drag      | Drag text                              | e, data                 |
| label:drop      | Release text                           | e, data                 |
| label:mousemove | Mouse moves inside the text area       | e, data, deltaX, deltaY |
| label:mouseup   | Mouse is released inside the text area | e, data                 |

The event object contains the following:

| Attribute | Type       | Value                     |
| :-------- | :--------- | :------------------------ |
| e         | MouseEvent | Native mouse event object |
| data      | Object     | NodeModel/EdgeModel       |

## on

Register events.

Parameters:

| Name     | Type   | Required | Default | Description       |
| :------- | :----- | :------- | :------ | :---------------- |
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
| :------- | :----- | :------- | :------ | :---------------- |
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
| :------- | :----- | :------- | :------ | :---------------- |
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
| :--- | :----- | :------- | :------ | :---------------- |
| evt  | string | ✅        | -       | Event Name        |
| args | Array  | ✅        | -       | Callback function |

Example:

```tsx | pure
const { eventCenter } = lf.graphModel;

eventCenter.emit("custom:button-click", data);
```
