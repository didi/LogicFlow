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
| node:resize<Badge>2.0 Added</Badge>            | Adjust node scaling                    | preData, data, model, deltaX, deltaY, index                                                                                 |
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
| element:click                                  | Click on the element                     | data, e, position                                                                                                                                 |
| edge:click                                     | Click on the edge                        | data, e, position                                                                                                                                 |
| edge:dbclick                                   | Double-click on the edge                 | data, e                                                                                                                                           |
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
| connection:not-allowed                         | Connection is not allowed                | data, msg                                                                                                                                         |

The event object contains the following:

| Property | Type       | Description                                                                                                                                   |
| :------- | :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| data     | Object     | The [data attribute](./model/edgeModel.en.md#data-attributes)                                                                                 |
| e        | MouseEvent | Native mouse event object                                                                                                                     |
| position | Object     | Coordinates of the mouse trigger point in the canvas (Refer to the return value of [getPointByClient](./detail/index.en.md#getpointbyclient)) |
| msg      | string     | Verification information of the edge                                                                                                          |

## Anchor Events

| Event names                               | Description                                                                                                          | Event object                  |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------- | :---------------------------- |
| anchor:mouseenter<Badge>2.0 Added</Badge> | Move the mouse pointer into the anchor                                                                               | data, e                       |
| anchor:mouseleave<Badge>2.0 Added</Badge> | Move the mouse pointer out of the anchor                                                                             | data, e                       |
| anchor:dragstart<Badge>2.0 Added</Badge>  | Start dragging from anchor                                                                                           | data, e, nodeModel            |
| anchor:drop<Badge>2.0 Added</Badge>       | Drop on anchor, only triggered when connecting successfully. Used to distinguish manual and auto-created connections | data, e, nodeModel, edgeModel |
| anchor:drag<Badge>2.0 Added</Badge>       | Anchor connection dragging                                                                                           | data, e, nodeModel            |
| anchor:dragend<Badge>2.0 Added</Badge>    | End of anchor connection, triggered regardless of whether a connection is created                                    | data, e, nodeModel            |

The event object contains the following:

| Properties | Type       | Description                                |
| :--------- | :--------- | :----------------------------------------- |
| data       | Object     | Anchor data                                |
| e          | MouseEvent | Native mouse event object                  |
| nodeModel  | Object     | The node to which the anchor point belongs |

## Canvas Events

| Event names                              | Description                                                                                                                                                                                                         | Event object                                                               |
| :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------- |
| blank:mousedown                          | Mouse down on blank area                                                                                                                                                                                            | e                                                                          |
| blank:mousemove                          | Mouse move on blank area                                                                                                                                                                                            | e                                                                          |
| blank:mouseup                            | Mouse up on blank area                                                                                                                                                                                              | e                                                                          |
| blank:click                              | Click on blank area                                                                                                                                                                                                 | e                                                                          |
| blank:contextmenu                        | Right-click on blank area                                                                                                                                                                                           | e, position                                                                |
| blank:dragstart                          | Start dragging on blank area                                                                                                                                                                                        | e                                                                          |
| blank:drag                               | Dragging on blank area                                                                                                                                                                                              | e                                                                          |
| blank:drop                               | Drop on blank area                                                                                                                                                                                                  | e                                                                          |
| text:update                              | Update text                                                                                                                                                                                                         | data                                                                       |
| graph:transform                          | Graph transformation (zoom, pan)                                                                                                                                                                                    | transform: { transform: string; zoom: number }                             |
| graph:rendered<Badge>1.1.0 Added</Badge> | Graph rendering completed                                                                                                                                                                                           | graphData                                                                  |
| graph:updated<Badge>2.0.0 Added</Badge>  | Canvas updated. Triggered after lf.render(graphData) or after changing properties on the canvas. If you need to perform operations after the canvas updates, it's recommended to use once event instead of on event | -                                                                          |
| history:change                           | History state change                                                                                                                                                                                                | data: { undos: Array, redos: Array, undoAble: boolean; redoAble: boolean } |

The event object contains the following:

| Property | Type       | Description                                                                                                                                   |
| :------- | :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| e        | MouseEvent | Native mouse event object                                                                                                                     |
| position | Object     | Coordinates of the mouse trigger point in the canvas (Refer to the return value of [getPointByClient](./detail/index.en.md#getpointbyclient)) |

## Selection Events

When multiple nodes are selected to form a selection area, the following events are triggered:

| Event names           | Description                    | Event object      |
| :-------------------- | :----------------------------- | :---------------- |
| selection:selected    | Triggered after area selection | Selected elements |
| selection:mousedown   | Mouse down on selection        | e                 |
| selection:dragstart   | Start dragging selection       | e                 |
| selection:drag        | Dragging selection             | e                 |
| selection:drop        | Drop selection                 | e                 |
| selection:mousemove   | Mouse move in selection        | e, position       |
| selection:mouseup     | Mouse up in selection          | e                 |
| selection:contextmenu | Right-click on selection       | e                 |

The event object contains the following:

| Property | Type       | Description                                                                                                                                   |
| :------- | :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| e        | MouseEvent | Native mouse event object                                                                                                                     |
| position | Object     | Coordinates of the mouse trigger point in the canvas (Refer to the return value of [getPointByClient](./detail/index.en.md#getpointbyclient)) |

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

## Plugin Events

The following are events triggered by different plugins:

### DndPanel

| Event name            | Description                | Event object |
| :-------------------- | :------------------------- | :----------- |
| dnd:panel-dbclick     | Double-click on drag panel | e, data      |
| dnd:panel-click       | Left-click on drag panel   | e, data      |
| dnd:panel-contextmenu | Right-click on drag panel  | e, data      |

The event object contains the following:

| Property | Type       | Value                     |
| :------- | :--------- | :------------------------ |
| e        | MouseEvent | Native mouse event object |
| data     | Object     | NodeModel/EdgeModel       |

### MiniMap

| Event name    | Description                      | Event object |
| :------------ | :------------------------------- | :----------- |
| miniMap:close | Triggered when minimap is hidden | -            |

### SelectionSelect

| Event name              | Description                                                  | Event object                                                              |
| :---------------------- | :----------------------------------------------------------- | :------------------------------------------------------------------------ |
| selection:selected-area | Selection area                                               | topLeft: Top-left coordinate, bottomRight: Bottom-right coordinate        |
| selection:drop          | Triggered when elements are selected after mouse is released | e                                                                         |
| selection:selected      | Triggered after selection is complete                        | elements: Selected elements, topLeft: Top-left, bottomRight: Bottom-right |

### DynamicGroup/Group

| Event name                                      | Description                                      | Event object                                           |
| :---------------------------------------------- | :----------------------------------------------- | :----------------------------------------------------- |
| group:add-node                                  | Triggered when a node is added to a group        | data: Group data, childId: ID of the newly added node  |
| group:remove-node                               | Triggered when a node is removed from a group    | data: Group data, childId: ID of the removed node      |
| group:not-allowed                               | Triggered when a node cannot be added to a group | group: Group data, node: Information of forbidden node |
| dynamicGroup:collapse<Badge>2.1.0 Added</Badge> | Group node collapse event                        | collapse: Collapse state, nodeModel: Node entity       |

### Highlight

| Event name           | Description                                    | Event object         |
| :------------------- | :--------------------------------------------- | :------------------- |
| highlight:single     | Element highlight in single element mode       | data                 |
| highlight:neighbours | Element highlight in neighboring elements mode | data, relateElements |
| highlight:path       | Element highlight in path elements mode        | data, relateElements |

The event object contains the following:

| Property       | Type   | Value                        |
| :------------- | :----- | :--------------------------- |
| data           | Object | NodeModel/EdgeModel          |
| relateElements | Array  | Array of NodeModel/EdgeModel |

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

- When evt is empty, remove all evt listeners.
- When evt is present and callback is empty, remove all registered methods for the corresponding event.
- When both evt and callback are present, compare the callback objects and remove matching methods.

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
