
## register

Register nodes, edges.

```jsx | pure
lf.register(config):void
```

Parameters:

| Parameter Name | Type   | Required | Default | Description      |
| :------------- | :----- | :------- | :------ | :------------------------------------- |
| config.type    | String | ✅       | -       | Customize the names of nodes and edges |
| config.model   | Model  | ✅       | -       | Model of nodes and edges    |
| config.view    | View   | ✅       | -       | View of nodes and edges     |

Example:

```jsx | pure
import { RectNode, RectNodeModel, h } from "@logicflow/core";
// provide nodes
class UserNode extends RectNode {}
// provide the attributes of the node
class UserModel extends RectNodeModel {
  constructor(data) {
    super(data);
    const { size } = data.properties;
    this.width = size * 40;
    this.height = size * 40;
    this.fill = "green";
  }
}
lf.register({
  type: "user",
  view: UserNode,
  model: UserModel,
});
```

## batchRegister

Batch register

```jsx | pure
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
);
```

## render

Render graph data

```jsx | pure
const lf = new LogicFlow({
  ...
})
lf.render(graphData)
```

## renderRawData

Rendering of the raw graph data. The difference with `render` is that after using `adapter`, you can use this method if you still want to render the data in logicflow format.

```jsx | pure
const lf = new LogicFlow({
  ...
})
lf.renderRawData({
  nodes: [],
  edges: []
})
```

## setTheme

Set the theme, see [Theme](theme-api) for details

## changeNodeType

Modify node type

```jsx | pure
changeNodeType(id: string, type: string): void
```

| Name | Type   | Required | Default | Description |
| :--- | :----- | :------- | :------ | :---------- |
| id   | String | ✅       |         | Node id     |
| type | String | ✅       |         | New type    |

Example:

```jsx | pure
lf.changeNodeType("node_id", "rect");
```

## getNodeEdges

Get the model of all edges connected by the node.

```jsx | pure
getNodeEdges(id: string): BaseEdgeModel[]
```

| Parameter | Type   | Required | Default | Description |
| :-------- | :----- | :------- | :------ | :---------- |
| id        | String | ✅       |         | Node id     |

Example：

```jsx | pure
const edgeModels = lf.getNodeEdges("node_id");
```

## addNode

Add nodes to the graph.

```jsx | pure
addNode(nodeConfig: NodeConfig):nodeModel
```

Parameters:

| Name       | Type| Required | Default | Description          |
| :--------- | :------------- | :------- | :------ | :----------------------------------------- |
| type       | String         | ✅       | -       | Node type name       |
| x          | Number         | ✅       | -       | Node horizontal coordinate x    |
| y          | Number         | ✅       | -       | Node vertical coordinate y      |
| text       | Object\|String |          | -       | Node text content and location coordinates |
| id         | String         |          | -       | Node id   |
| properties | Object         |          | -       | Node properties, user can customize        |

Example：

```jsx | pure
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

## deleteNode

Deletes a node on the graph, and if there is a line attached to this node, then also deletes the line.

```jsx | pure
deleteNode(nodeId: string): void
```

Parameters:

| Name | Type | Mandatory | Default | Description            |
| :----- | :----- | :--- | :----- | :-------------- |
| nodeId | String | ✅   | -      | The id of the node to be deleted |

Example：

```jsx | pure
lf.deleteNode("id");
```

## cloneNode

```jsx | pure
cloneNode(nodeId: string): BaseNodeModel
```

Parameters:

| Name | Type | Mandatory | Default | Description        |
| :----- | :----- | :--- | :----- | :---------- |
| nodeId | String | ✅   | -      | Target node id |

Example：

```jsx | pure
lf.cloneNode("id");
```

## changeNodeId

Modify the id of the node, if no new id is passed, one will be created internally automatically.

Example：

```jsx | pure
lf.changeNodeId("oldId", "newId");
```

## getNodeModelById

Get the `model` of the node

```jsx | pure
getNodeModelById(nodeId: string): BaseNodeModel
```

Parameters:

| Name | Type | Mandatory | Default | Description    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | String | ✅   | -      | Node id |

Example：

```jsx | pure
lf.getNodeModelById("id");
```

## getNodeDataById

Get the `model` data of the node

```jsx | pure
getNodeDataById(nodeId: string): NodeConfig
```

Parameters:

| Name | Type | Mandatory | Default | Description    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | String | ✅   | -      | Node id |

Example：

```jsx | pure
lf.getNodeDataById("id");
```

## getNodeIncomingNode

Get all parent nodes of the node

```jsx | pure
getNodeIncomingNode(nodeId: string): BaseNodeModel[]
```

Parameters:

| Name | Type | Mandatory | Default | Description    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | String | ✅   | -      | Node id |

## getNodeOutgoingNode

Get all the next-level nodes of the node

```jsx | pure
getNodeOutgoingNode(nodeId: string): BaseNodeModel[]
```

Parameters:

| Name | Type | Mandatory | Default | Description    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | String | ✅   | -      | Node id |

## getNodeIncomingEdge

Get all the edges that end at this node

```jsx | pure
getNodeIncomingEdge(nodeId: string): BaseEdgeModel[]
```

Parameters:

| Name | Type | Mandatory | Default | Description    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | String | ✅   | -      | Node id |

## getNodeOutgoingEdge

Get all the edges that start at this node

```jsx | pure
getNodeOutgoingEdge(nodeId: string): BaseEdgeModel[]
```

Parameters:

| Name | Type | Mandatory | Default | Description    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | String | ✅   | -      | Node id |

## addEdge

Create an edge connecting two nodes

```jsx | pure
addEdge(edgeConfig: EdgeConifg): void
```

Parameters:

| Name         | Type | Required | Default | Description |
| :----------- | :-------------- | :------- | :------ | :------------ |
| id| String          |          | -       | Edge id     |
| type         | String          |          | -       | Egde type   |
| sourceNodeId | String          | ✅       | -       | id of the start node of the edge  |
| targetNodeId | String          | ✅       | -       | id of the end node of the edge    |
| startPoint   | Object          |          | -       | Coordinate of the starting point of the edge |
| endPoint     | Object          |          | -       | Coordinate of the ending point of the edge   |
| text         | String\| Object |          | -       | Edge text   |

Example：

```jsx | pure
lf.addEdge({
  sourceNodeId: '10',
  targetNodeId: '21',
  startPoint: {
    x: 11,
    y: 22,
  }
  endPoint: {
    x: 33,
    y: 44,
  }
  text: 'Edge Text',
});
```

## deleteEdge

Delete an edge based on its id

```jsx | pure
deleteEdge(id): void
```

Parameters:

| Name       | Type   | Required | Default | Description        |
| :--- | :----- | :--- | :----- | :------ |
| id   | String |      | -      | Edge id |

Example：

```jsx | pure
lf.deleteEdge("edge_1");
```

## deleteEdgeByNodeId

Deletes an edge of the specified type, based on the start and end points of the edge, and can pass only one of them.

```jsx | pure
deleteEdgeByNodeId(config: EdgeFilter): void
```

Parameters:

| Name       | Type   | Required | Default | Description           |
| :----------- | :----- | :--- | :----- | :-------------- |
| sourceNodeId | String |          | -       | id of the starting node of the edge |
| targetNodeId | String |          | -       | id of the ending node of the edge   |

Example：

```jsx | pure

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

## getEdgeModelById

Get the `model` of the edge based on the its id

```jsx | pure
getEdgeModelById(edgeId: string): BaseEdgeModel
```

Parameters:

| Name | Type | Mandatory | Default | Description    |
| :----- | :----- | :--- | :----- | :------ |
| edgeId | String | ✅   | -      | Node id |

Example：

```jsx | pure
lf.getEdgeModelById("id");
```

## getEdgeModels

Get the model of the edge that satisfies the condition

| Name       | Type   | Required | Default | Description        |
| :--------- | :----- | :--- | :----- | :------- |
| edgeFilter | Object | ✅   | -      | Filtering conditions |

```jsx | pure
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

## changeEdgeId

Modify the edge id. If a new id is not passed, one will be created internally automatically.

Example：

```jsx | pure
lf.changeEdgeId("oldId", "newId");
```

## changeEdgeType

Switch type of edge

Example：

```jsx | pure
lf.changeEdgeType("edgeId", "bezier");
```

## getEdgeDataById

Get edge data by `id`

```jsx | pure
getEdgeDataById(edgeId: string): EdgeConfig
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

| Name | Type | Mandatory | Default | Description    |
| :----- | :----- | :--- | :----- | :------ |
| edgeId | String | ✅   | -      | Edge id |

Example：

```jsx | pure
lf.getEdgeDataById("id");
```

## setDefaultEdgeType

Set the type of edge, i.e. set the type of linkage drawn directly by the user at the node.

```jsx | pure
setDefaultEdgeType(type: EdgeType): void
```

| Name       | Type   | Required | Default | Description             |
| :--- | :----- | :--- | :--------- | :---------------------------------- |
| type | String | ✅   | 'polyline' | Set the type of edge, built-in support for edge types are line (straight line), polyline (line), bezier (Bezier curve). The default is a line, and users can customize the type name to switch to the user-defined edge |

Example：

```jsx | pure
lf.setDefaultEdgeType("line");
```

## editText

same as [graphModel.editText](graph-model-api#edittext)

## updateText

Update the node or edge text

```jsx | pure
updateText(id: string, value: string): void
```

| Name       | Type   | Required | Default | Description              |
| :---- | :----- | :--- | :----- | :------------- |
| id    | String | ✅   |        | Node or Edge id  |
| value | String | ✅   |        | Updated text values |

Example：

```jsx | pure
lf.updateText("id", "value");
```

## deleteElement

```jsx | pure
deleteElement(id: string): boolean
```

| Name       | Type   | Required | Default | Description              |
| :--- | :----- | :--- | :----- | :------------ |
| id   | String | ✅   |        | Node or Edge id |

Example：

```jsx | pure
lf.deleteElement("node_id");
```

## selectElementById

Select the graph

Parameters:

| Name       | Type   | Required | Default | Description                                                  |
| :------- | :------ | :--- | :----- | :----------------------- |
| id       | string  | ✅   | -      | Node or edge id                                    |
| multiple | boolean |      | false  | If or not is multi-selected, if true, the last selected element will not be reset. |
| toFront  | boolean |      | true   | If or not the selected element will be topped, default is true.   |

Example：

```jsx | pure
lf.selectElementById(id: string, multiple = false, toFront = true)
```

## getGraphData

Get flow graphing data

```jsx | pure
// Return value. If the adapter plugin is applied and the setting is adapterOut, the return is the converted data format, otherwise it is the default format.
// Starting from version 1.2.5, new input parameters have been added for the execution of certain adapterOut that require input parameters.
// For example, the built-in BpmnAdapter may require an array of attribute reserve fields to be passed in to ensure that certain node attributes in the exported data are properly processed.
// The input parameters here should be consistent with the other parameters of the adapterOut method from the imported adapter, except for the data parameter.
getGraphData(...params: any): GraphConfigData | unknown
```

LogicFlow default data format

```jsx | pure
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

```jsx | pure
lf.getGraphData();
```

## getGraphRawData

Get the raw data of the flow graph. The difference with getGraphData is that the data obtained by this method is not affected by the adapter.

```jsx | pure
getGraphRawData(): GraphConfigData
```

Example：

```jsx | pure
lf.getGraphRawData();
```

## setProperties

Set custom properties of nodes or edges

```jsx | pure
setProperties(id: string, properties: Object): void
```

Example：

```jsx | pure
lf.setProperties("aF2Md2P23moN2gasd", {
  isRollbackNode: true,
});
```

## deleteProperty

Delete node attributes

```jsx | pure
deleteProperty(id: string, key: string): void
```

Example：

```jsx | pure
lf.deleteProperty("aF2Md2P23moN2gasd", "isRollbackNode");
```

## getProperties

Get the custom properties of a node or an edge

```jsx | pure
getProperties(id: string): Object
```

Example：

```jsx | pure
lf.getProperties("id");
```

## updateAttributes

Modifies an attribute in the corresponding element model, which is called [graphModel](graph-model-api#updateattributes) inside the method.

:::warning
This method is used with caution unless you know enough about logicflow internals.<br>
In most cases, please use setProperties, updateText, changeNodeId, and so on.<br>
For example, if you use this method to change the id of a Node, the sourceNodeId of the Edge connected to the Node will not be found.
:::
```jsx | pure
updateAttributes(id: string, attributes: object): void
```
Example：

```jsx | pure
lf.updateAttributes("node_id_1", { radius: 4 });
```

## toFront

Places an element to the top.

If the stacking mode is the default, the original top element is restored to its original level.

If the stacking mode is incremental, the zIndex of the element to be specified is set to the current maximum zIndex + 1.

Example：

```jsx | pure
lf.toFront("id");
```

## setElementZIndex

Set the zIndex of the element.

Note: This method is not recommended for the default stacking mode.

Parameters:

| Name | Type | Mandatory | Default | Description |
| :----- | :-------------- | :--- | :----- | :---|
| id     | String          | ✅   | - |  Node or edge id          |
| zIndex | String\| Number | ✅       | -       | Passing numbers, also supports passing `top` and `bottom` |

Example：

```jsx | pure
lf.setElementZIndex("element_id", "top");
lf.setElementZIndex("element_id", "bottom");
lf.setElementZIndex("element_id", 2000);
```

## addElements

Batch add nodes and edges

Example：

```jsx | pure
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

## getAreaElement

Gets all the elements in the specified region, which must be a DOM layer.

For example, after drawing a selection with the mouse, get all the elements inside the selection.

Parameters:

| Name   | Type       | Default | Description        |
| ----------------- | ---------- | ------- | --------------------------------------------------- |
| leftTopPoint      | PointTuple | -       | Point at the upper left of the area      |
| rightBottomPoint  | PointTuple | -       | point at the bottom right of the area    |
| wholeEdge         | boolean    | -       | Whether the entire edge has to be inside the region |
| wholeNode         | boolean    | -       | Whether the entire node has to be inside the region |
| ignoreHideElement | boolean    | -       | Whether ignoring hidden nodes |

```jsx | pure
lf.getAreaElement([100, 100], [500, 500]);
```

## getSelectElements

Get all elements selected

```jsx | pure
getSelectElements(isIgnoreCheck: boolean): GraphConfigData
```

| Name          | Type    | Required | Default | Description         |
| :------------ | :------ | :--- | :----- | :----------------------------------------------------------- |
| isIgnoreCheck | boolean | ✅   | true   |  Whether to include edges where sourceNode and targetNode are not selected, default is include. |

```jsx | pure
lf.getSelectElements(false);
```

## clearSelectElements

Uncheck all elements

```jsx | pure
lf.clearSelectElements();
```

## getModelById

Get the model of a node or edge based on its id

```jsx | pure
lf.getModelById("node_id");
lf.getModelById("edge_id");
```

## getDataById

Get data of a node or edge based on its id

```jsx | pure
lf.getDataById("node_id");
lf.getDataById("edge_id");
```

## clearData

Clear the canvas

```jsx | pure
lf.clearData();
```

## updateEditConfig

Update the basic configuration of the flow editor.

See [editConfig](edit-config-model-api) for detailed parameters

```jsx | pure
lf.updateEditConfig({
  stopZoomGraph: true,
});
```

## getEditConfig

Get the basic configuration of the flow editor.

See [editConfig](edit-config-model-api) for detailed parameters

```jsx | pure
lf.getEditConfig();
```

## getPointByClient

Get the coordinates of the event location relative to the top left corner of the canvas

The location of the canvas can be anywhere on the page. The coordinates returned by the native event are relative to the top-left corner of the page, and this method provides the exact location with the top-left corner of the canvas as the origin.

```jsx | pure
getPointByClient(x: number, y: number)
```

Parameters:

| Name       | Type   | Required | Default | Description                                                       |
| :--- | :----- | :--- | :----- | :----------------------------------------------------- |
| x    | Number | ✅   | -      | The `x` coordinate relative to the top left corner of the page, which is generally the `x` coordinate returned by the native event |
| y    | Number | ✅       | -       | The `y` coordinate relative to the top left corner of the page, which is generally the `y` coordinate returned by the native event |

return：

| Name  | Type  | Description                       |
| :---- | :---- | :------------------------- |
| point | Point | Two coordinates relative to the upper left corner of the canvas |

```jsx | pure
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

```jsx | pure
lf.getPointByClient(event.x, event.y);
```

## focusOn

Position to the center of the canvas viewport

Parameters:

| Name        | Type   | Required | Default | Description       |
| :---------- | :----- | :--- | :----- | :----------- |
| focusOnArgs | object | ✅   | -      | Required parameters for positioning |

Example：

```jsx | pure
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

## resize

Adjusts the width and height of the canvas, if the width or height is not passed, the width and height of the canvas will be calculated automatically.

Parameters:

| Name | Type | Mandatory | Default | Description     |
| :----- | :----- | :--- | :----- | :------- |
| width  | Number |      | -      | Width of the canvas  |
| height | Number | ✅   | -      | Height of the canvas |

```jsx | pure
lf.resize(1200, 600);
```

## zoom

Zoom in and out of the canvas

Parameters:

| Name     | Type   | Required | Default | Description |
| :------- | :---------------- | :--- | :----- | :------------------------ |
| zoomSize | Boolean or Number |      | false  | The value of zoom in and zoom out is supported by passing in a number between 0 and n. Less than 1 means zoom in, more than 1 means zoom out. It also supports passing true and false to zoom in and out according to the built-in scale. |
| point    | [x,y]             |      | false  | The origin of the zoom, not passing the default top left corner.   |

Example：

```jsx | pure
// zoom in
lf.zoom(true);
// zoom out
lf.zoom(false);
// Zoom to specified ratio
lf.zoom(2);
// Zoom to the specified scale, and the zoom origin is [100, 100].
lf.zoom(2, [100, 100]);
```

## resetZoom

Resets the zoom scale of the graph to default

Example：

```jsx | pure
lf.resetZoom();
```

## setZoomMiniSize

Sets the minimum number of times the graph can be scaled when it is reduced. The parameter takes values from 0 to 1. Default 0.2

```jsx | pure
setZoomMiniSize(size: number): void
```

Parameters:

| Name       | Type   | Required | Default | Description                     |
| :--- | :----- | :--- | :----- | :------------------- |
| size | Number | ✅   | 0.2    | Minimum scaling ratio, default 0.2 |

Example：

```jsx | pure
lf.setZoomMiniSize(0.3);
```

## setZoomMaxSize

Set the maximum magnification

```jsx | pure
setZoomMaxSize(size: number): void
```

Parameters:

| Name       | Type   | Required | Default | Description                      |
| :--- | :----- | :--- | :----- | :-------------------- |
| size | Number | ✅   | 16     | Maximum magnification, default 16 |

Example：

```jsx | pure
lf.setZoomMaxSize(20);
```

## getTransform

Get the zoom in/out value of the current canvas

```jsx | pure
const transform = lf.getTransform();
console.log(transform);
```

## translate

Panning graph

Parameters

| Name       | Type   | Required | Default | Description             |
| :--- | :----- | :--- | :----- | :----------- |
| x    | Number | ✅   |        | x-axis translation distance |
| y    | Number | ✅   |        | y-axis translation distance |

```jsx | pure
lf.translate(100, 100);
```

## translateCenter

Graphics canvas centering

```jsx | pure
lf.translateCenter();
```

## resetTranslate

Restore the graph to its original position

```jsx | pure
lf.resetTranslate();
```

## fitView

Reduce the entire flowchart to a size where the entire canvas can be displayed

Parameters:

| Name     | Type   | Required | Default | Description                           |
| :--------------- | :----- | :--- | :----- | :----------------------------- |
| verticalOffset   | Number | ✅   | 20     | The distance from the top and bottom of the box, default is 20 |
| horizontalOffset | Number | ✅   | 20     | The distance to the left and right of the box, default is 20 |

```jsx | pure
lf.fitView(deltaX, deltaY);
```

## openEdgeAnimation

```jsx | pure
lf.openEdgeAnimation(edgeId: string):void;
```

## closeEdgeAnimation

```jsx | pure
lf.closeEdgeAnimation(edgeId: string):void;
```

## on

Listening events of the graph，see [event](event-center-api)

```jsx | pure
on(evt: string, callback: Function): this
// Callback function parameters
{
  e, // Native event objects for the mouse <MouseEvent>
  data?, // General properties of elements
  position?, // Coordinates of the mouse trigger point in the canvas { x, y }
  msg?, // Edge calibration information
}
```

Parameters:

| Name     | Type   | Required | Default | Description       |
| :------- | :----- | :------- | :------ | :---------------- |
| evt      | String | ✅       | -       | Event name        |
| callback | String | ✅       | -       | Callback function |

Example：

```jsx | pure
lf.on("node:click", (args) => {
  console.log("node:click", args.position);
});
lf.on("element:click", (args) => {
  console.log("element:click", args.e.target);
});
```

## off

Remove event listener

```jsx | pure
off(evt: string, callback: Function): this
```

Parameters:

|  Name     | Type   | Required | Default | Description       |
| :------- | :----- | :------- | :------ | :---------------- |
| evt      | String | ✅       | -       | Event name        |
| callback | String | ✅       | -       | Callback function |

Example：

```jsx | pure
lf.off("node:click", () => {
  console.log("node:click off");
});
lf.off("element:click", () => {
  console.log("element:click off");
});
```

## once

Event Listening Once

```jsx | pure
once(evt: string, callback: Function): this
```

Parameters:

| 名称     | 类型   | 必传 | 默认值 | 描述     |
| :------- | :----- | :--- | :----- | :------- |
| evt      | String | ✅   | -      |  Event name        |
| callback | String | ✅       | -       | Callback function |

Example：

```jsx | pure
lf.once("node:click", () => {
  console.log("node:click");
});
```

## emit

Trigger events

```jsx | pure
emit(evt: string, ...args): this
```

Parameters:

| Name       | Type   | Required | Default | Description             |
| :--- | :----- | :--- | :----- | :----------- |
| evt  | String | ✅   | -      | Event name    |
| args | Array  | ✅       | -       | Trigger event parameters |

Example：

```jsx | pure
lf.emit("custom:button-click", model);
```

## undo

History Operation - Back to previous step

Example：

```jsx | pure
lf.undo();
```

## redo

History Operation - Resume Next

Example：

```jsx | pure
lf.redo();
```
