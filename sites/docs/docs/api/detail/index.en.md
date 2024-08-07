---
toc: content
order: 1
title: LogicFlow methods
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

## Graph Related

### setTheme

Set the theme, see [Theme](../theme.en.md) for details.

### focusOn

Position to the center of the canvas viewport.

Parameters:

| Name        | Type   | Required | Default | Description                         |
|:------------|:-------|:---------|:--------|:------------------------------------|
| focusOnArgs | object | ✅        | -       | Required parameters for positioning |

Example：

```ts | pure
//  position the center of the canvas viewport to the position of the node_1 element
lf.focusOn({
  id: "node_1",
});
// position the center of the canvas viewport to the coordinates [1000, 1000]
lf.focusOn({
  coordinate: {
    x: 1000,
    y: 1000,
  },
});
```

### resize

Adjusts the width and height of the canvas, if the width or height is not passed, the width and
height of the canvas will be calculated automatically.

Parameters:

| Name   | Type   | Mandatory | Default | Description          |
|:-------|:-------|:----------|:--------|:---------------------|
| width  | number |           | -       | Width of the canvas  |
| height | number | ✅         | -       | Height of the canvas |

```ts | pure
lf.resize(1200, 600);
```

### toFront

Places an element to the top.

If the stacking mode is the default, the original top element is restored to its original level.

If the stacking mode is incremental, the zIndex of the element to be specified is set to the current
maximum zIndex + 1.

Example：

```ts | pure
lf.toFront('id')
```

### getPointByClient

Get the coordinates of the event location relative to the top left corner of the canvas.

The location of the canvas can be anywhere on the page. The coordinates returned by the native event
are relative to the top-left corner of the page, and this method provides the exact location with
the top-left corner of the canvas as the origin.

```ts | pure
// 函数定义
getPointByClient: (x: number, y: number): Point => {}
// 函数调用
lf.getPointByClient(x, y)
```

Parameters:

| Name | Type   | Required | Default | Description                                                                                                                        |
|:-----|:-------|:---------|:--------|:-----------------------------------------------------------------------------------------------------------------------------------|
| x    | number | ✅        | -       | The `x` coordinate relative to the top left corner of the page, which is generally the `x` coordinate returned by the native event |
| y    | number | ✅        | -       | The `y` coordinate relative to the top left corner of the page, which is generally the `y` coordinate returned by the native event |

return：

| Name  | Type  | Description                                                     |
|:------|:------|:----------------------------------------------------------------|
| point | Point | Two coordinates relative to the upper left corner of the canvas |

```ts | pure
type Position = {
  x: number;
  y: number;
};
type Point = {
  domOverlayPosition: Position; // Coordinates on the HTML layer relative to the top-left corner of the canvas`{x, y}`
  canvasOverlayPosition: Position; // Coordinates on the SVG layer relative to the top-left corner of the canvas`{x, y}`
};
```

Example：

```ts | pure
lf.getPointByClient(event.x, event.y);
```

### getGraphData

Get flow graphing data.

```ts | pure
// Return value. If the adapter plugin is applied and the setting is adapterOut, the return is the converted data format, otherwise it is the default format.
// Starting from version 1.2.5, new input parameters have been added for the execution of certain adapterOut that require input parameters.
// For example, the built-in BpmnAdapter may require an array of attribute reserve fields to be passed in to ensure that certain node attributes in the exported data are properly processed.
// The input parameters here should be consistent with the other parameters of the adapterOut method from the imported adapter, except for the data parameter.
// 函数定义
getGraphData: (...params: any): GraphConfigData | unknown => {}
// 函数调用
lf.getGraphData()

```

LogicFlow default data format.

```ts | pure
type GraphConfigData = {
  nodes: {
    id?: string;
    type: string;
    x: number;
    y: number;
    text?: TextConfig;
    properties?: Record<string, unknown>;
    zIndex?: number;
  }[];
  edges: {
    id: string;
    type: string;
    sourceNodeId: string;
    targetNodeId: string;
    startPoint: any;
    endPoint: any;
    text: {
      x: number;
      y: number;
      value: string;
    };
    properties: {};
    zIndex?: number;
    pointsList?: Point[]; // Folding lines and curves will output pointsList.
  }[];
};
```

Example：

```ts | pure
lf.getGraphData()
```

### getGraphRawData

Get the raw data of the flow graph. The difference with getGraphData is that the data obtained by
this method is not affected by the adapter.

```ts | pure
getGraphRawData = (): GraphData => {}
```

Example：

```ts | pure
lf.getGraphRawData()
```

### clearData

Clear the canvas.

```ts | pure
lf.clearData()
```

### renderRawData

Rendering of the raw graph data. The difference with `render` is that after using `adapter`, you can
use this method if you still want to render the data in logicflow format.

```ts | pure
const lf = new LogicFlow({
  ...
})
lf.renderRawData({
  nodes: [],
  edges: []
})
```

### render

Render graph data.

```ts | pure
const lf = new LogicFlow({
  // ...
})
lf.render(graphData)
```

## Node Related

### addNode

Add nodes to the graph.

```ts | pure
// 函数定义
// addNode: (nodeConfig: NodeConfig) => NodeModel
// 函数调用
lf.addNode(nodeConfig)
```

Parameters:

| Name       | Type           | Required | Default | Description                                |
|:-----------|:---------------|:---------|:--------|:-------------------------------------------|
| type       | string         | ✅        | -       | Node type name                             |
| x          | number         | ✅        | -       | Node horizontal coordinate x               |
| y          | number         | ✅        | -       | Node vertical coordinate y                 |
| text       | Object\|string |          | -       | Node text content and location coordinates |
| id         | string         |          | -       | Node id                                    |
| properties | Object         |          | -       | Node properties, user can customize        |

Example：

```ts | pure
lf.addNode({
  type: "user",
  x: 500,
  y: 600,
  id: 20,
  text: {
    value: "test",
    x: 500,
    y: 600,
  },
  properties: {
    size: 1,
  },
});
```

### deleteNode

Deletes a node on the graph, and if there is a line attached to this node, then also deletes the
line.

```ts | pure
// 函数定义
deleteNode: (nodeId: string) => void
// 函数调用
  lf.deleteNode(nodeId)
```

Parameters:

| Name   | Type   | Mandatory | Default | Description                      |
|:-------|:-------|:----------|:--------|:---------------------------------|
| nodeId | string | ✅         | -       | The id of the node to be deleted |

Example：

```ts | pure
lf.deleteNode(nodeId)
```

### cloneNode

Clone a node.

```ts | pure
// 函数定义
cloneNode: (nodeId: string): BaseNodeModel => {}
//函数调用
lf.cloneNode(nodeId)
```

Parameters:

| Name   | Type   | Mandatory | Default | Description    |
|:-------|:-------|:----------|:--------|:---------------|
| nodeId | string | ✅         | -       | Target node id |

Example：

```ts | pure
lf.cloneNode(nodeId)
```

### changeNodeId

Modify the id of the node, if no new id is passed, one will be created internally automatically.

Example：

```ts | pure
lf.changeNodeId(oldId, newId)
```

### changeNodeType

Modify node type.

```ts | pure
changeNodeType: (id: string, type: string): void => {}
```

| Name | Type   | Required | Default | Description |
|:-----|:-------|:---------|:--------|:------------|
| id   | string | ✅        |         | Node id     |
| type | string | ✅        |         | New type    |

Example:

```ts | pure
lf.changeNodeType("node_id", "rect");
```

### getNodeModelById

Get the `model` of the node.

```ts | pure
getNodeModelById: (nodeId: string): BaseNodeModel => {}
```

Parameters:

| Name   | Type   | Mandatory | Default | Description |
|:-------|:-------|:----------|:--------|:------------|
| nodeId | string | ✅         | -       | Node id     |

Example：

```ts | pure
lf.getNodeModelById(nodeId)
```

### getNodeDataById

Get the `model` data of the node.

```ts | pure
getNodeDataById: (nodeId: string): NodeConfig => {}
```

Parameters:

| Name   | Type   | Mandatory | Default | Description |
|:-------|:-------|:----------|:--------|:------------|
| nodeId | string | ✅         | -       | Node id     |

Example：

```ts | pure
lf.getNodeDataById("id")
```

### getNodeIncomingNode

Get all parent nodes of the node.

```ts | pure
getNodeIncomingNode:(nodeId: string): BaseNodeModel[] => {}
```

Parameters:

| Name   | Type   | Mandatory | Default | Description |
|:-------|:-------|:----------|:--------|:------------|
| nodeId | string | ✅         | -       | Node id     |

### getNodeOutgoingNode

Get all the next-level nodes of the node.

```ts | pure
getNodeOutgoingNode:(nodeId: string): BaseNodeModel[] => {}
```

Parameters:

| Name   | Type   | Mandatory | Default | Description |
|:-------|:-------|:----------|:--------|:------------|
| nodeId | string | ✅         | -       | Node id     |

### getNodeIncomingEdge

Get all the edges that `end` at this node.

```ts | pure
getNodeIncomingEdge:(nodeId: string): BaseEdgeModel[] => {}
```

Parameters:

| Name   | Type   | Mandatory | Default | Description |
|:-------|:-------|:----------|:--------|:------------|
| nodeId | string | ✅         | -       | Node id     |

### getNodeOutgoingEdge

Get all the edges that `start` at this node.

```ts | pure
getNodeOutgoingEdge:(nodeId: string): BaseEdgeModel[] => {}
```

Parameters:

| Name   | Type   | Mandatory | Default | Description |
|:-------|:-------|:----------|:--------|:------------|
| nodeId | string | ✅         | -       | Node id     |

## Edge Related

### setDefaultEdgeType

Set the type of edge, i.e. set the type of linkage drawn directly by the user at the node.

```ts | pure
setDefaultEdgeType: (type: EdgeType): void => {}
```

| Name | Type   | Required | Default    | Description                                                                                                                                                                                                             |
|:-----|:-------|:---------|:-----------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type | string | ✅        | 'polyline' | Set the type of edge, built-in support for edge types are line (straight line), polyline (line), bezier (Bezier curve). The default is a line, and users can customize the type name to switch to the user-defined edge |

Example：

```ts | pure
lf.setDefaultEdgeType("line");
```

### addEdge

Create an edge connecting two nodes.

```ts | pure
addEdge: (edgeConfig: EdgeConifg): void => {}
```

Parameters:

| Name         | Type            | Required | Default | Description                                  |
|:-------------|:----------------|:---------|:--------|:---------------------------------------------|
| id           | string          |          | -       | Edge id                                      |
| type         | string          |          | -       | Edge type                                    |
| sourceNodeId | string          | ✅        | -       | id of the start node of the edge             |
| targetNodeId | string          | ✅        | -       | id of the end node of the edge               |
| startPoint   | Object          |          | -       | Coordinate of the starting point of the edge |
| endPoint     | Object          |          | -       | Coordinate of the ending point of the edge   |
| text         | string\| Object |          | -       | Edge text                                    |

Example：

```ts | pure
lf.addEdge({
  sourceNodeId: '10',
  targetNodeId: '21',
  startPoint: {
    x: 11,
    y: 22,
  },
  endPoint: {
    x: 33,
    y: 44,
  },
  text: 'Edge Text',
})
```

### getEdgeDataById

Get edge data by `id`.

```ts | pure
getEdgeDataById: (edgeId: string): EdgeConfig => {}

// return
export type EdgeConfig = {
  id: string;
  type: string;
  sourceNodeId: string;
  targetNodeId: string;
  startPoint?: {
    x: number;
    y: number;
  },
  endPoint?: {
    x: number;
    y: number;
  },
  text?: {
    x: number;
    y: number;
    value: string;
  },
  pointsList?: Point[];
  properties?: Record<string, unknown>;
};
```

Parameters:

| Name   | Type   | Mandatory | Default | Description |
|:-------|:-------|:----------|:--------|:------------|
| edgeId | string | ✅         | -       | Edge id     |

Example：

```ts | pure
lf.getEdgeDataById("id");
```

### getEdgeModelById

Get the `model` of the edge based on its id.

```ts | pure
getEdgeModelById: (edgeId: string): BaseEdgeModel => {}
```

Parameters:

| Name   | Type   | Mandatory | Default | Description |
|:-------|:-------|:----------|:--------|:------------|
| edgeId | string | ✅         | -       | Node id     |

Example：

```ts | pure
lf.getEdgeModelById("id")
```

### getEdgeModels

Get the model of the edge that satisfies the condition.

| Name       | Type   | Required | Default | Description          |
|:-----------|:-------|:---------|:--------|:---------------------|
| edgeFilter | Object | ✅        | -       | Filtering conditions |

```ts | pure
// get all the mods of the edges whose starting point is node A
lf.getEdgeModels({
  sourceNodeId: "nodeA_id",
});
// get all the mods of the edges whose ending point is node B
lf.getEdgeModels({
  targetNodeId: "nodeB_id",
});
// Get the edge whose starting point is node A and ending point is node B
lf.getEdgeModels({
  sourceNodeId: "nodeA_id",
  targetNodeId: "nodeB_id",
});
```

### changeEdgeId

Modify the edge id. If a new id is not passed, one will be created internally automatically.

Example：

```ts | pure
lf.changeEdgeId("oldId", "newId");
```

### changeEdgeType

Switch type of the edge.

Example：

```ts | pure
lf.changeEdgeType("edgeId", "bezier");
```

### deleteEdge

Delete an edge based on its id.

```ts | pure
deleteEdge: (id): void => {}
```

Parameters:

| Name | Type   | Required | Default | Description |
|:-----|:-------|:---------|:--------|:------------|
| id   | string |          | -       | Edge id     |

Example：

```ts | pure
lf.deleteEdge("edge_1");
```

### deleteEdgeByNodeId

Deletes an edge of the specified type, based on the start and end points of the edge, and can pass
only one of them.

```ts | pure
deleteEdgeByNodeId: (config: EdgeFilter): void => {}
```

Parameters:

| Name         | Type   | Required | Default | Description                         |
|:-------------|:-------|:---------|:--------|:------------------------------------|
| sourceNodeId | string |          | -       | id of the starting node of the edge |
| targetNodeId | string |          | -       | id of the ending node of the edge   |

Example：

```ts | pure

lf.deleteEdgeByNodeId({
  sourceNodeId: "id1",
  targetNodeId: "id2",
});

lf.deleteEdgeByNodeId({
  sourceNodeId: "id1",
});

lf.deleteEdgeByNodeId({
  targetNodeId: "id2",
});
```

### getNodeEdges

Get the model of all edges connected by the node.

```ts | pure
getNodeEdges: (id: string): BaseEdgeModel[] => {}
```

| Parameter | Type   | Required | Default | Description |
|:----------|:-------|:---------|:--------|:------------|
| id        | string | ✅        |         | Node id     |

Example：

```ts | pure
const edgeModels = lf.getNodeEdges("node_id");
```

## Register Related

### register

Register custom nodes, edges.

```ts | pure
register: (config: RegisterConfig): void => {}
```

Parameters:

| Name         | Type   | Required | Default | Description                            |
|:-------------|:-------|:---------|:--------|:---------------------------------------|
| config.type  | string | ✅        | -       | Customize the types of nodes and edges |
| config.model | Model  | ✅        | -       | Model of nodes and edges               |
| config.view  | View   | ✅        | -       | View of nodes and edges                |

Example:

```ts | pure
import { RectNode, RectNodeModel } from "@logicflow/core";

// provide nodes
class CustomRectNode extends RectNode {
}

// provide the attributes of the node
class CustomRectModel extends RectNodeModel {
  setAttributes() {
    this.width = 200;
    this.height = 80;
    this.radius = 50;
  }
}

lf.register({
  type: "Custom-rect",
  view: CustomRectNode,
  model: CustomRectModel,
});
```

### batchRegister

Batch register.

```ts | pure
lf.batchRegister([
  {
    type: 'user',
    view: UserNode,
    model: UserModel,
  },
  {
    type: 'user1',
    view: UserNode1,
    model: UserModel1,
  },
]);
```

## Element Related

### addElements

Batch add nodes and edges.

Example：

```ts | pure
// Put at the top
lf.addElements({
  nodes: [
    {
      id: "node_1",
      type: "rect",
      x: 100,
      y: 100,
    },
    {
      id: "node_2",
      type: "rect",
      x: 200,
      y: 300,
    },
  ],
  edges: [
    {
      id: "edge_3",
      type: "polyline",
      sourceNodeId: "node_1",
      targetNodeId: "node_2",
    },
  ],
});
```

### selectElementById

Select the graph.

Parameters:

| Name     | Type    | Required | Default | Description                                                                        |
|:---------|:--------|:---------|:--------|:-----------------------------------------------------------------------------------|
| id       | string  | ✅        | -       | Node or edge id                                                                    |
| multiple | boolean |          | false   | If or not is multi-selected, if true, the last selected element will not be reset. |
| toFront  | boolean |          | true    | If or not the selected element will be topped, default is true.                    |

Example：

```ts | pure
import BaseNodeModel from './BaseNodeModel'

selectElementById: (id: string, multiple = false, toFront = true) => BaseNodeModel
```

### getSelectElements

Get all elements selected.

```ts | pure
getSelectElements: (isIgnoreCheck: boolean): GraphConfigData => {}
```

| Name          | Type    | Required | Default | Description                                                                                    |
|:--------------|:--------|:---------|:--------|:-----------------------------------------------------------------------------------------------|
| isIgnoreCheck | boolean | ✅        | true    | Whether to include edges where sourceNode and targetNode are not selected, default is include. |

```ts | pure
lf.getSelectElements(false);
```

### clearSelectElements

Uncheck all elements.

```ts | pure
lf.clearSelectElements();
```

### getModelById

Get the `model` of a node or edge based on its `id`.

```ts | pure
lf.getModelById("node_id");
lf.getModelById("edge_id");
```

### getDataById

Get the `data` of a node or edge based on its `id`.

```ts | pure
lf.getDataById("node_id");
lf.getDataById("edge_id");
```

### deleteElement

Delete the element by id.

```ts | pure
deleteElement: (id: string): boolean => {}
```

| Name | Type   | Required | Default | Description     |
|:-----|:-------|:---------|:--------|:----------------|
| id   | string | ✅        |         | Node or Edge id |

Example：

```ts | pure
lf.deleteElement("node_id");
```

### setElementZIndex

Set the zIndex of the element.

Note: This method is not recommended for the default stacking mode.

Parameters:

| Name   | Type            | Mandatory | Default | Description                                               |
|:-------|:----------------|:----------|:--------|:----------------------------------------------------------|
| id     | string          | ✅         | -       | Node or edge id                                           |
| zIndex | string\| number | ✅         | -       | Passing numbers, also supports passing `top` and `bottom` |

Example：

```ts | pure
lf.setElementZIndex("element_id", "top");
lf.setElementZIndex("element_id", "bottom");
lf.setElementZIndex("element_id", 2000);
```

### getAreaElement

Gets all the elements in the specified region, which must be a DOM layer.

For example, after drawing a selection with the mouse, get all the elements inside the selection.

Parameters:

| Name              | Type       | Default | Description                                         |
|-------------------|------------|---------|-----------------------------------------------------|
| leftTopPoint      | PointTuple | -       | Point at the upper left of the area                 |
| rightBottomPoint  | PointTuple | -       | point at the bottom right of the area               |
| wholeEdge         | boolean    | -       | Whether the entire edge has to be inside the region |
| wholeNode         | boolean    | -       | Whether the entire node has to be inside the region |
| ignoreHideElement | boolean    | -       | Whether ignoring hidden nodes                       |

```ts | pure
lf.getAreaElement([100, 100], [500, 500]);
```

### setProperties

Set the custom properties of nodes or edges.

```ts | pure
setProperties: (id: string, properties: Record<string, unknown>): void => {}
```

Example：

```ts | pure
lf.setProperties("aF2Md2P23moN2gasd", {
  isRollbackNode: true,
});
```

### getProperties

Get the custom properties of a node or an edge.

```ts | pure
getProperties: (id: string): Record<string, any> => {}
```

Example：

```ts | pure
lf.getProperties("id");
```

### deleteProperty

Delete node attributes.

```ts | pure
deleteProperty: (id: string, key: string): void => {}
```

Example：

```ts | pure
lf.deleteProperty("aF2Md2P23moN2gasd", "isRollbackNode");
```

### updateAttributes

Modifies an attribute in the corresponding element model, which is
called [graphModel](../model/GraphModel#updateattributes) inside the method.

:::warning
This method is used with caution unless you know enough about logicflow internals.<br>
In most cases, please use setProperties, updateText, changeNodeId, and so on.<br>
For example, if you use this method to change the id of a Node, the sourceNodeId of the Edge
connected to the Node will not be found.
:::

```ts | pure
updateAttributes: (id: string, attributes: object): void => {}
```

Example：

```ts | pure
lf.updateAttributes("node_id_1", { radius: 4 });
```

## Text Related

### editText

same as [graphModel.editText](../model/graphModel.en.md#edittext)

### updateText

Update the node or edge text.

```ts | pure
updateText: (id: string, value: string): void => {}
```

| Name  | Type   | Required | Default | Description         |
|:------|:-------|:---------|:--------|:--------------------|
| id    | string | ✅        |         | Node or Edge id     |
| value | string | ✅        |         | Updated text values |

Example：

```ts | pure
lf.updateText("id", "value");
```

### updateEditConfig

Update the basic configuration of the flow editor.

See [editConfig](../model/editConfigModel.en.md) for detailed parameters

```ts | pure
lf.updateEditConfig({
  stopZoomGraph: true,
});
```

### getEditConfig

Get the basic configuration of the flow editor.

See [editConfig](../model/editConfigModel.en.md) for detailed parameters

```ts | pure
lf.getEditConfig();
```

## History Related

### undo

History Operation - Back to previous step.

Example：

```ts | pure
lf.undo();
```

### redo

History Operation - Resume next.

Example：

```ts | pure
lf.redo();
```

## Transform Related

### zoom

Zoom in or out of the canvas.

Parameters:

| Name     | Type              | Required | Default | Description                                                                                                                                                                                                                               |
|:---------|:------------------|:---------|:--------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| zoomSize | boolean or number |          | false   | The value of zoom in and zoom out is supported by passing in a number between 0 and n. Less than 1 means zoom in, more than 1 means zoom out. It also supports passing true and false to zoom in and out according to the built-in scale. |
| point    | [x,y]             |          | false   | The origin of the zoom, not passing the default top left corner.                                                                                                                                                                          |

Example：

```ts | pure
// zoom in
lf.zoom(true);
// zoom out
lf.zoom(false);
// Zoom to specified ratio
lf.zoom(2);
// Zoom to the specified scale, and the zoom origin is [100, 100].
lf.zoom(2, [100, 100]);
```

### resetZoom

Reset the zoom ratio of the drawing to the default, which is 1.

Example：

```ts | pure
lf.resetZoom();
```

### setZoomMiniSize

Sets the minimum number of times the graph can be scaled when it is reduced. The parameter takes
values from 0 to 1. Default 0.2

```ts | pure
setZoomMiniSize: (size: number): void => {}
```

Parameters:

| Name | Type   | Required | Default | Description                        |
|:-----|:-------|:---------|:--------|:-----------------------------------|
| size | number | ✅        | 0.2     | Minimum scaling ratio, default 0.2 |

Example：

```ts | pure
lf.setZoomMiniSize(0.3);
```

### setZoomMaxSize

Set the maximum zoom scale when zooming in; default is 16.

```ts | pure
setZoomMaxSize: (size: number): void => {}
```

Parameters:

| Name | Type   | Required | Default | Description                       |
|:-----|:-------|:---------|:--------|:----------------------------------|
| size | number | ✅        | 16      | Maximum magnification, default 16 |

Example：

```ts | pure
lf.setZoomMaxSize(20);
```

### getTransform

Get the zoom in/out value of the current canvas.

```ts | pure
const transform = lf.getTransform();
console.log(transform);
```

### translate

Panning graph.

Parameters

| Name | Type   | Required | Default | Description                 |
|:-----|:-------|:---------|:--------|:----------------------------|
| x    | number | ✅        |         | x-axis translation distance |
| y    | number | ✅        |         | y-axis translation distance |

```ts | pure
lf.translate(100, 100);
```

### resetTranslate

Restore the graph to its original position.

```ts | pure
lf.resetTranslate();
```

### translateCenter

Graphics canvas centering.

```ts | pure
lf.translateCenter();
```

### fitView

Reduce the entire flowchart to a size where the entire canvas can be displayed.

Parameters:

| Name             | Type   | Required | Default | Description                                                    |
|:-----------------|:-------|:---------|:--------|:---------------------------------------------------------------|
| verticalOffset   | number | ✅        | 20      | The distance from the top and bottom of the box, default is 20 |
| horizontalOffset | number | ✅        | 20      | The distance to the left and right of the box, default is 20   |

```ts | pure
lf.fitView(deltaX, deltaY);
```

### openEdgeAnimation

Enable edge animations.

```ts | pure
openEdgeAnimation: (edgeId: string): void => {}
```

### closeEdgeAnimation

Disable edge animations.

```ts | pure
closeEdgeAnimation: (edgeId: string): void => {}
```

## Event System Related

### on

Event listener for the graph, see [event](../eventCenter.en.md).

```ts | pure
import { EventCallback } from './EventEmitter'

on: (evt: string, callback: EventCallback<T>): void => {}
```

Parameters:

| Name     | Type   | Required | Default | Description       |
|:---------|:-------|:---------|:--------|:------------------|
| evt      | string | ✅        | -       | Event name        |
| callback | `EventCallback<T>` | ✅        | -       | Callback function |

Example：

```ts | pure
lf.on("node:click", (args) => {
  console.log("node:click", args.position);
});
lf.on("element:click", (args) => {
  console.log("element:click", args.e.target);
});
```

### off

Remove event listener.

```ts | pure
import { EventCallback } from './EventEmitter'

off: (evt: string, callback: EventCallback<T>): void => {}
```

Parameters:

| Name     | Type   | Required | Default | Description       |
|:---------|:-------|:---------|:--------|:------------------|
| evt      | string | ✅        | -       | Event name        |
| callback | `EventCallback<T>` | ✅        | -       | Callback function |

Example：

```ts | pure
lf.off("node:click", () => {
  console.log("node:click off");
});
lf.off("element:click", () => {
  console.log("element:click off");
});
```

### once

Event listener that triggers only once.

```ts | pure
import { EventCallback } from './EventEmitter'

once: (evt: string, callback: EventCallback<T>): void => {}
```

Parameters:

| 名称       | 类型     | 必传 | 默认值 | 描述                |
|:---------|:-------|:---|:----|:------------------|
| evt      | string | ✅  | -   | Event name        |
| callback | `EventCallback<T>` | ✅  | -   | Callback function |

Example：

```ts | pure
lf.once("node:click", () => {
  console.log("node:click");
});
```

### emit

Trigger an event.

```ts | pure
import { CallbackArgs } from './eventEmitter'

emit: (evt: string, eventArgs: CallbackArgs<T>): void => {}
```

Parameters:

| Name | Type            | Required | Default | Description              |
|:-----|:----------------|:---------|:--------|:-------------------------|
| evt  | string               | ✅        | -       | Event name         |
| eventArgs | `CallbackArgs<T>`           | ✅        | -       | Trigger event parameters |

Example：

```ts | pure
lf.emit("custom:button-click", model);
```
