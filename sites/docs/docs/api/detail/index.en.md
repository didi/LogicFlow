---
toc: content
order: 1
title: LogicFlow Methods
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

| Name        | Type   | Required | Default | Description                |
| :---------- | :----- | :------- | :------ | :------------------------- |
| focusOnArgs | object | ✅        | -       | Parameters for positioning |

Example:

```tsx | pure
// Center the canvas viewport on the node_1 element
lf.focusOn({
  id: 'node_1',
})
// Center the canvas viewport at coordinates [1000, 1000]
lf.focusOn({
  coordinate: {
    x: 1000,
    y: 1000,
  },
})
```

### resize

Adjust the canvas width and height. If width or height is not provided, the canvas dimensions will be calculated automatically.

Parameters:

| Name   | Type   | Required | Default | Description   |
| :----- | :----- | :------- | :------ | :------------ |
| width  | number |          | -       | Canvas width  |
| height | number |          | -       | Canvas height |

```tsx | pure
lf.resize(1200, 600);
```

### toFront

Bring an element to the front.

In default stacking mode, the specified element's zIndex is set to 9999, and the previously top element's zIndex is restored to 1.

In incremental mode, the specified element's zIndex is set to the current maximum zIndex + 1.

Example:

```tsx | pure
lf.toFront("id");
```

### getPointByClient

Get the coordinates relative to the canvas's top-left corner from an event position.

Since the canvas can be positioned anywhere on the page, and native events return coordinates relative to the page's top-left corner, this method provides accurate positions using the canvas's top-left corner as the origin.

```tsx | pure
// Function definition
getPointByClient: (x: number, y: number): Point => {}
// Function call
lf.getPointByClient(x, y)
```

Parameters:

| Name | Type   | Required | Default | Description                                                                 |
| :--- | :----- | :------- | :------ | :-------------------------------------------------------------------------- |
| x    | number | ✅        | -       | X coordinate relative to page top-left, usually from native event's x value |
| y    | number | ✅        | -       | Y coordinate relative to page top-left, usually from native event's y value |

Return value:

| Name  | Type  | Description                                        |
| :---- | :---- | :------------------------------------------------- |
| point | Point | Two types of coordinates relative to canvas origin |

```tsx | pure
type Position = {
  x: number;
  y: number;
};
type Point = {
  domOverlayPosition: Position; // Coordinates {x, y} relative to canvas origin in HTML layer
  canvasOverlayPosition: Position; // Coordinates {x, y} relative to canvas origin in SVG layer
};
```

Example:

```tsx | pure
lf.getPointByClient(event.x, event.y);
```

### getGraphData

Get the flow diagram data.

```tsx | pure
// Return value: if adapter plugin is applied with adapterOut set, returns converted data format, otherwise returns default format
// Since version 1.2.5, parameters were added to support adapterOut that requires input, such as the built-in BpmnAdapter which may need an array of property reserved fields
// The parameters here match the adapterOut method's parameters of the imported Adapter, except for data
// Function definition
getGraphData: (...params: any): GraphConfigData | unknown => {}
// Function call
lf.getGraphData()
```

LogicFlow default data format:

```tsx | pure
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
    pointsList?: Point[]; // Polylines and curves output pointsList
  }[];
};
```

Example:

```tsx | pure
lf.getGraphData();
```

### getGraphRawData

Get the raw flow diagram data. Unlike getGraphData, this method returns data unaffected by adapters.

```tsx | pure
getGraphRawData = (): GraphData => {}
```

Example:

```tsx | pure
lf.getGraphRawData();
```

### clearData

Clear the canvas.

```tsx | pure
lf.clearData();
```

### renderRawData

Render raw graph data. Unlike render, this method can be used to render LogicFlow format data even when using an adapter.

```tsx | pure
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

```tsx | pure
const lf = new LogicFlow({
  ...
})
lf.render(graphData)
```

## Node Related

### addNode

Add a node to the graph.

```tsx | pure
// Function definition
// addNode: (nodeConfig: NodeConfig) => NodeModel
// Function call
lf.addNode(nodeConfig)
```

Parameters:

| Name       | Type           | Required | Default | Description                       |
| :--------- | :------------- | :------- | :------ | :-------------------------------- |
| type       | string         | ✅        | -       | Node type name                    |
| x          | number         | ✅        | -       | Node x coordinate                 |
| y          | number         | ✅        | -       | Node y coordinate                 |
| text       | Object\|string |          | -       | Node text content and coordinates |
| id         | string         |          | -       | Node id                           |
| properties | Object         |          | -       | Custom node properties            |

Example:

```tsx | pure
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

Delete a node from the graph. If the node has connected edges, they will be deleted as well.

```tsx | pure
// Function definition
deleteNode: (nodeId: string) => void
// Function call
  lf.deleteNode(nodeId)
```

Parameters:

| Name   | Type   | Required | Default | Description          |
| :----- | :----- | :------- | :------ | :------------------- |
| nodeId | string | ✅        | -       | ID of node to delete |

Example:

```tsx | pure
lf.deleteNode("id");
```

### cloneNode

Clone a node.

```tsx | pure
// Function definition
cloneNode: (nodeId: string): BaseNodeModel => {}
// Function call
lf.cloneNode(nodeId)
```

Parameters:

| Name   | Type   | Required | Default | Description    |
| :----- | :----- | :------- | :------ | :------------- |
| nodeId | string | ✅        | -       | Target node ID |

Example:

```tsx | pure
lf.cloneNode("id");
```

### changeNodeId

Modify a node's ID. If no new ID is provided, one will be automatically generated.

Example:

```tsx | pure
lf.changeNodeId("oldId", "newId");
```

### changeNodeType

Change a node's type.

```tsx | pure
changeNodeType: (id: string, type: string): void => {}
```

Parameters:

| Name | Type   | Required | Default | Description |
| :--- | :----- | :------- | :------ | :---------- |
| id   | string | ✅        |         | Node ID     |
| type | string | ✅        |         | New type    |

Example:

```tsx | pure
lf.changeNodeType("node_id", "rect");
```

### getNodeModelById

Get a node's model.

```tsx | pure
getNodeModelById: (nodeId: string): BaseNodeModel => {}
```

Parameters:

| Name   | Type   | Required | Default | Description |
| :----- | :----- | :------- | :------ | :---------- |
| nodeId | string | ✅        | -       | Node ID     |

Example:

```tsx | pure
lf.getNodeModelById("id");
```

### getNodeDataById

Get a node's model data.

```tsx | pure
getNodeDataById: (nodeId: string): NodeConfig => {}
```

Parameters:

| Name   | Type   | Required | Default | Description |
| :----- | :----- | :------- | :------ | :---------- |
| nodeId | string | ✅        | -       | Node ID     |

Example:

```tsx | pure
lf.getNodeDataById("id");
```

### getNodeIncomingEdge

Get all edges that end at this node.

```tsx | pure
getNodeIncomingEdge:(nodeId: string): BaseEdgeModel[] => {}
```

Parameters:

| Name   | Type   | Required | Default | Description |
| :----- | :----- | :------- | :------ | :---------- |
| nodeId | string | ✅        | -       | Node ID     |

### getNodeOutgoingEdge

Get all edges that start from this node.

```tsx | pure
getNodeOutgoingEdge:(nodeId: string): BaseEdgeModel[] => {}
```

Parameters:

| Name   | Type   | Required | Default | Description |
| :----- | :----- | :------- | :------ | :---------- |
| nodeId | string | ✅        | -       | Node ID     |

### getNodeIncomingNode

Get all parent nodes of this node.

```tsx | pure
getNodeIncomingNode:(nodeId: string): BaseNodeModel[] => {}
```

Parameters:

| Name   | Type   | Required | Default | Description |
| :----- | :----- | :------- | :------ | :---------- |
| nodeId | string | ✅        | -       | Node ID     |

### getNodeOutgoingNode

Get all child nodes of this node.

```tsx | pure
getNodeOutgoingNode:(nodeId: string): BaseNodeModel[] => {}
```

Parameters:

| Name   | Type   | Required | Default | Description |
| :----- | :----- | :------- | :------ | :---------- |
| nodeId | string | ✅        | -       | Node ID     |

## Edge Related

### setDefaultEdgeType

Set the default edge type for edges created by manual user connections between nodes.

```tsx | pure
setDefaultEdgeType: (type: EdgeType): void => {}
```

Parameters:

| Name | Type   | Required | Default    | Description                                                                                                                                                                                     |
| :--- | :----- | :------- | :--------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type | string | ✅        | 'polyline' | Edge type. Built-in types include line (straight line), polyline (polyline), bezier (bezier curve). Default is polyline. Users can switch to custom edge types by defining their own type names |

Example:

```tsx | pure
lf.setDefaultEdgeType("line");
```

### addEdge

Create an edge connecting two nodes.

```tsx | pure
addEdge: (edgeConfig: EdgeConifg): BaseEdgeModel => {}
```

Parameters:

| Name         | Type            | Required | Default | Description        |
| :----------- | :-------------- | :------- | :------ | :----------------- |
| id           | string          |          | -       | Edge ID            |
| type         | string          |          | -       | Edge type          |
| sourceNodeId | string          | ✅        | -       | Source node ID     |
| targetNodeId | string          | ✅        | -       | Target node ID     |
| startPoint   | Object          |          | -       | Start point coords |
| endPoint     | Object          |          | -       | End point coords   |
| text         | string\| Object |          | -       | Edge text          |

Example:

```tsx | pure
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
  text: 'Edge text',
});
```

### getEdgeDataById

Get edge data by ID.

```tsx | pure
getEdgeDataById: (edgeId: string): EdgeConfig => {}

// Return type
export type EdgeConfig = {
  id: string;
  type: string;
  sourceNodeId: string;
  targetNodeId: string;
  startPoint: {
    x: number;
    y: number;
  };
  endPoint: {
    x: number;
    y: number;
  };
  text?: string | TextConfig;
  properties?: Record<string, unknown>;
};
```

### getEdgeModelById

Get the `model` of the edge based on its id.

```tsx | pure
getEdgeModelById: (edgeId: string): BaseEdgeModel => {}
```

Parameters:

| Name   | Type   | Required | Default | Description |
| :----- | :----- | :------- | :------ | :---------- |
| edgeId | string | ✅        | -       | Node id     |

| Name   | Type   | Mandatory | Default | Description |
| :----- | :----- | :-------- | :------ | :---------- |
| edgeId | string | ✅         | -       | Node id     |

Example：

```ts | pure
lf.getEdgeModelById("id")
```

### getEdgeModels

Get the model of the edge that satisfies the condition.

| Name       | Type   | Required | Default | Description          |
| :--------- | :----- | :------- | :------ | :------------------- |
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
| :--- | :----- | :------- | :------ | :---------- |
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
| :----------- | :----- | :------- | :------ | :---------------------------------- |
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
| :-------- | :----- | :------- | :------ | :---------- |
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
| :----------- | :----- | :------- | :------ | :------------------------------------- |
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
| :------- | :------ | :------- | :------ | :--------------------------------------------------------------------------------- |
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
| :------------ | :------ | :------- | :------ | :--------------------------------------------------------------------------------------------- |
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
| :--- | :----- | :------- | :------ | :-------------- |
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
| :----- | :-------------- | :-------- | :------ | :-------------------------------------------------------- |
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
| ----------------- | ---------- | ------- | --------------------------------------------------- |
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
| :---- | :----- | :------- | :------ | :------------------ |
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
| :------- | :---------------- | :------- | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
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
| :--- | :----- | :------- | :------ | :--------------------------------- |
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
| :--- | :----- | :------- | :------ | :-------------------------------- |
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
| :--- | :----- | :------- | :------ | :-------------------------- |
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
| :--------------- | :----- | :------- | :------ | :------------------------------------------------------------- |
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

| Name     | Type               | Required | Default | Description       |
| :------- | :----------------- | :------- | :------ | :---------------- |
| evt      | string             | ✅        | -       | Event name        |
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

| Name     | Type               | Required | Default | Description       |
| :------- | :----------------- | :------- | :------ | :---------------- |
| evt      | string             | ✅        | -       | Event name        |
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

| 名称     | 类型               | 必传 | 默认值 | 描述              |
| :------- | :----------------- | :--- | :----- | :---------------- |
| evt      | string             | ✅    | -      | Event name        |
| callback | `EventCallback<T>` | ✅    | -      | Callback function |

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

| Name      | Type              | Required | Default | Description              |
| :-------- | :---------------- | :------- | :------ | :----------------------- |
| evt       | string            | ✅        | -       | Event name               |
| eventArgs | `CallbackArgs<T>` | ✅        | -       | Trigger event parameters |

Example：

```ts | pure
lf.emit("custom:button-click", model);
```
