---
nav: API
title: graphModel
toc: content
order: 0
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

graphModel is the model corresponding to the entire canvas in LogicFlow.

Most methods on the LogicFlow instance are simple wrappers around graphModel.

You can get graphModel in several ways:

- Directly from the lf property: `lf.graphModel`
- When customizing a `model`, get it from the constructor or from `this` in methods:

```tsx | pure
class CustomModel extends RectNodeModel {
  getNodeStyle() {
    const graphModel = this.graphModel
  }
}
```

- When customizing a `view`, get it from `props`:

```tsx | pure
class CustomNode extends RectNode {
  getShape() {
    const { model, graphModel } = this.props
    // ...
  }
}
```

:::info{title=Note}
**Note** All properties on graphModel are read-only. To modify them, please use the provided corresponding methods.
:::

## Properties

| Property                    | Type                                          | Default | Description                                                                      |
| :-------------------------- | :-------------------------------------------- | :------ | :------------------------------------------------------------------------------- |
| width                       | `number`                                      |         | LogicFlow canvas width                                                           |
| height                      | `number`                                      |         | LogicFlow canvas height                                                          |
| theme                       | `LogicFlow.Theme`                             |         | [Detailed API](../theme.en.md)                                                   |
| animation                   | `boolean \| LFOptions.AnimationConfig`        | false   | Animation state configuration, whether corresponding animation is enabled        |
| [eventCenter](#eventcenter) | `EventEmitter`                                |         | Event center, can emit events to external through this object                    |
| modelMap                    | `Map<string, BaseNodeModel \| BaseEdgeModel>` |         | Maintains model mapping for all node and edge types                              |
| [topElement](#topelement)   | `BaseNodeModel \| BaseEdgeModel`              |         | Element at the top of current canvas                                             |
| idGenerator                 | `(type?: string) => string \| undefined`      |         | Custom global id generator                                                       |
| nodeMoveRules               | `Model.NodeMoveRule[]`                        | []      | Node movement rules, all rules in this array are checked when node moves         |
| customTrajectory            | `LFOptions.CustomAnchorLineProps`             |         | Get custom connection trajectory                                                 |
| edgeGenerator               | `LFOptions.EdgeGeneratorType`                 |         | Edge generation rules for node connections and edge changes                      |
| edgeType                    | `string`                                      |         | Default edge type used when creating edges on graph                              |
| nodes                       | `BaseNodeModel[]`                             | []      | All node objects on canvas                                                       |
| edges                       | `BaseEdgeModel[]`                             | []      | All edge objects on canvas                                                       |
| fakeNode                    | `BaseNodeModel \| null`                       | null    | Used to distinguish temporary node from formal nodes when dragging external node |
| [overlapMode](#overlapmode) | `number`                                      |         | Element stacking mode when overlapping; 0:default mode, 1:incremental mode       |
| background                  | `false \| LFOptions.BackgroundConfig`         |         | Canvas background configuration                                                  |
| transformModel              | `TransformModel`                              |         | Current canvas transform matrix model, see [API](./transformModel.en.md)         |
| editConfigModel             | `EditConfigModel`                             |         | Basic page editing config object, see [editConfigApi](./editConfigModel.en.md)   |
| gridSize                    | `number`                                      | 1       | Grid size                                                                        |
| partial                     | `boolean`                                     | false   | Whether to enable partial rendering to improve performance with many elements    |
| nodesMap                    | `GraphModel.NodesMapType`                     |         | Map of all nodes on canvas                                                       |
| edgesMap                    | `GraphModel.EdgesMapType`                     |         | Map of all edges on canvas                                                       |
| modelsMap                   | `GraphModel.ModelsMapType`                    |         | Map of all nodes and edges on canvas                                             |
| selectNodes                 | `BaseNodeModel[]`                             |         | All selected node objects on canvas                                              |
| sortElements                | `array`                                       |         | Elements sorted by zIndex                                                        |
| textEditElement             | `BaseNodeModel \| BaseEdgeModel`              |         | Currently being edited element                                                   |
| selectElements              | `Map<string, BaseNodeModel \| BaseEdgeModel>` |         | All currently selected elements on canvas                                        |

### eventCenter<Badge>Property</Badge>

LogicFlow's internal event center, can emit events to external through this object.

Example:

```tsx | pure
class UserTaskModel extends RectNodeModel {
  setAttributes() {
    this.menu = [
      {
        text: "Details",
        callback: (res) => {
          this.graphModel.eventCenter.emit("user:detail", res);
        },
      },
    ];
  }
}

// Listen
lf.on("user:detail", (res) => {});
```

### topElement<Badge>Property</Badge>

Element at the top of current canvas.<br>
This element only exists in default stacking mode.
Used to restore previous top element to initial order in default mode.

### overlapMode<Badge>Property</Badge>

Element stacking mode when overlapping<br>

- Value `0`: Default mode, selected nodes and edges display on top. When deselected, elements restore previous level.
- Value `1`: Incremental mode, selected nodes and edges display on top. When deselected, elements maintain level.

## Methods

### getAreaElement<Badge>Method</Badge>

Get all elements in specified area

Parameters:

| Name              | Type       | Default | Description                             |
| ----------------- | ---------- | ------- | --------------------------------------- |
| leftTopPoint      | PointTuple | -       | Top-left point of area                  |
| rightBottomPoint  | PointTuple | -       | Bottom-right point of area              |
| wholeEdge         | boolean    | -       | Whether entire edge must be inside area |
| wholeNode         | boolean    | -       | Whether entire node must be inside area |
| ignoreHideElement | boolean    | -       | Whether to ignore hidden elements       |

```tsx | pure
graphModel.getAreaElement([100, 100], [800, 800]);
```

### getModel<Badge>Method</Badge>

Get Model constructor for specified type

Parameters:

| Name | Type   | Default | Description |
| ---- | ------ | ------- | ----------- |
| type | string | -       | Type        |

Returns: [NodeModel](./nodeModel.en.md) or [EdgeModel](./edgeModel.en.md)

```tsx | pure
graphModel.getModel("rect");
```

### getNodeModelById<Badge>Method</Badge>

Get Model constructor for specified node type

Parameters:

| Name | Type   | Default | Description |
| ---- | ------ | ------- | ----------- |
| type | string | -       | Type        |

Returns: [NodeModel](./nodeModel.en.md)

```tsx | pure
graphModel.getNodeModelById("node_1");
```

### getPointByClient<Badge>Method</Badge>

Get coordinates on canvas from mouse click position

> Since flowchart can be placed anywhere on page, when internal events need to get trigger position relative to canvas top-left corner, event trigger position needs to subtract canvas position relative to client.

Parameters:

| Name  | Type     | Default | Description   |
| ----- | -------- | ------- | ------------- |
| point | Position | -       | HTML position |

Returns:

| Name                  | Type     | Default | Description                                                     |
| --------------------- | -------- | ------- | --------------------------------------------------------------- |
| domOverlayPosition    | Position | -       | HTML layer position, generally used for component positioning   |
| canvasOverlayPosition | Position | -       | Canvas layer position, generally used for node/edge coordinates |

Why do we need this method? Why does clicking the same position on mouse generate two different coordinates?

Because canvas can be zoomed and panned. When canvas is moved, visually elements' positions change, but at data level, positions of nodes and edges on canvas haven't changed. For example: in a 1000px * 1000px canvas with a node in center, this node's position might be `{x: -999,y: -999}` because it was panned. But when double-clicking this node, we need to show a text input box at node position, since input box is in `domOverlay` layer which unlike `CanvasOverlay` doesn't have zoom and pan, its width and height match canvas. So text input box coordinates should be `{x: 500, y: 500}`.

Let's see why we need this method:

Suppose canvas is 100px from browser top and left. When user clicks canvas center, js click listener gets position `{x: 600, y: 600}`. At this point calling this method will get `canvasOverlayPosition` as `{x: -999,y: -999}` and `domOverlayPosition` as `{x: 500, y: 500}`. Developers can then use these coordinates for their needs, like showing a menu at `domOverlayPosition`.

```tsx | pure
graphModel.getPointByClient({ x: 200, y: 200 });
```

### isElementInArea<Badge>Method</Badge>

Check if an element is within specified rectangular area.

Parameters:

| Name      | Type                   | Default | Description                                 |
| --------- | ---------------------- | ------- | ------------------------------------------- |
| element   | NodeModel or EdgeModel | -       | Element model                               |
| lt        | PointTuple             | -       | Top-left point                              |
| rb        | PointTuple             | -       | Bottom-right point                          |
| wholeEdge | boolean                | true    | Edge counts only if start/end points are in |
| wholeNode | boolean                | true    | Node counts only if entire box is in        |

Returns: `boolean`

```tsx | pure
const node = {
  type: "rect",
  x: 300,
  y: 300,
};
graphModel.isElementInArea(node, [200, 200], [400, 400]);
```

### getAreaElements<Badge>Method</Badge>

Get all elements in specified area

Parameters:

| Name              | Type       | Default | Description                                 |
| ----------------- | ---------- | ------- | ------------------------------------------- |
| leftTopPoint      | PointTuple | -       | Top-left point                              |
| rightBottomPoint  | PointTuple | -       | Bottom-right point                          |
| ignoreHideElement | boolean    | false   | Ignore hidden elements                      |
| wholeEdge         | boolean    | true    | Edge counts only if start/end points are in |
| wholeNode         | boolean    | true    | Node counts only if entire box is in        |

Returns: `LogicFlow.GraphElement[]`

### graphDataToModel<Badge>Method</Badge>

Reset all canvas elements using new data

Note: Will clear all existing nodes and edges on canvas

Parameters:

| Name      | Type            | Default | Description      |
| --------- | --------------- | ------- | ---------------- |
| graphData | GraphConfigData | -       | Basic graph data |

```tsx | pure
const graphData = {
  nodes: [
    {
      id: "node_id_1",
      type: "rect",
      x: 100,
      y: 100,
      text: { x: 100, y: 100, value: "Node1" },
      properties: {},
    },
    {
      id: "node_id_2",
      type: "circle",
      x: 200,
      y: 300,
      text: { x: 200, y: 300, value: "Node2" },
      properties: {},
    },
  ],
  edges: [
    {
      id: "edge_id",
      type: "polyline",
      sourceNodeId: "node_id_1",
      targetNodeId: "node_id_2", 
      text: { x: 139, y: 200, value: "Connection" },
      startPoint: { x: 100, y: 140 },
      endPoint: { x: 200, y: 250 },
      pointsList: [
        { x: 100, y: 140 },
        { x: 100, y: 200 },
        { x: 200, y: 200 },
        { x: 200, y: 250 },
      ],
      properties: {},
    },
  ],
};

graphModel.graphDataToModel(graphData);
```

### modelToGraphData<Badge>Method</Badge>

Get raw data corresponding to graphModel

Returns: `GraphConfigData`

```tsx | pure
const graphData = graphModel.modelToGraphData();
console.log(graphData)
```

### modelToHistoryData<Badge>Method</Badge>

Get history record data

Returns: false | HistoryData

```tsx | pure
const historyData = graphModel.modelToHistoryData();
console.log(historyData)
```

### getEdgeModelById<Badge>Method</Badge>

Get edge Model

Parameters:

| Name   | Type   | Default | Description |
| ------ | ------ | ------- | ----------- |
| edgeId | string | -       | Edge Id     |

Returns: [EdgeModel](./edgeModel.en.md)

```tsx | pure
const edgeModel = graphModel.getEdgeModelById('edge_id');
console.log(edgeModel)
```

### getElement<Badge>Method</Badge>

Get node or edge Model

Parameters:

| Name | Type   | Default | Description        |
| ---- | ------ | ------- | ------------------ |
| id   | string | -       | Edge Id or Node Id |

Returns: [EdgeModel](./edgeModel.en.md) or [NodeModel](nodeModel.en.md)

```tsx | pure
const edgeModel = graphModel.getElement('edge_id');
console.log(edgeModel)
```

### getNodeEdges<Badge>Method</Badge>

Get all edges connected to specified node

Parameters:

| Name   | Type   | Default | Description |
| ------ | ------ | ------- | ----------- |
| nodeId | string | -       | Node Id     |

Returns: [EdgeModel](./edgeModel.en.md)

```tsx | pure
const edgeModels = graphModel.getNodeEdges('node_id_1');
console.log(edgeModels)
```

### getSelectElements<Badge>Method</Badge>

Get selected element data

Parameters:

| Name          | Type    | Default | Description                                                                                                                                                        |
| ------------- | ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| isIgnoreCheck | boolean | true    | Whether to include edges whose sourceNode and targetNode are not selected, default includes. Cannot include such edges when copying since edges cannot be floating |

```tsx | pure
const elements = graphModel.getSelectElements(true);
console.log(elements)
```

### updateAttributes<Badge>Method</Badge>

Modify attributes in corresponding element model

:::warning{title=Warning}
Note: Use with caution unless you have sufficient understanding of LogicFlow internals.<br>
In most cases, please use setProperties, updateText, changeNodeId and other methods.<br>
For example: directly using this method to modify a node's id will cause sourceNodeId of edges connected to this node to become unfindable.
:::

Parameters:

| Name       | Type   | Default | Description        |
| ---------- | ------ | ------- | ------------------ |
| id         | string | -       | Node Id            |
| attributes | object | -       | Element attributes |

```tsx | pure
graphModel.updateAttributes("node_id_1", {
  radius: 4,
});
```

### getVirtualRectSize<Badge>Method</Badge>

Get size and center position of virtual rectangle in graph area

Parameter `includeEdge: boolean = false`
Returns `GraphModel.VirtualRectProps`

```tsx | pure
const virtualdata = graphModel.getVirtualRectSize();
console.log(virtualdata);
// virtualdata output: { width, height, x, y }
```

### changeNodeId<Badge>Method</Badge>

Change node id. If no new id provided, will automatically create one internally.

Parameters:

| Name  | Type   | Default | Description |
| ----- | ------ | ------- | ----------- |
| oldId | string | -       | Node Id     |
| newId | string | -       | New Id      |

```tsx | pure
graphModel.changeNodeId("node_id_1", "node_id_2");
```

### changeEdgeId<Badge>Method</Badge>

Change edge id. If no new id provided, will automatically create one internally.

Parameters:

| Name  | Type   | Default | Description |
| ----- | ------ | ------- | ----------- |
| oldId | string | -       | Node Id     |
| newId | string | -       | New Id      |

```tsx | pure
graphModel.changeEdgeId("edge_id_1", "edge_id_2");
```

### handleEdgeTextMove<Badge>Method</Badge>

Move Text on edge

Parameters:

| Name | Type          | Default | Description  |
| ---- | ------------- | ------- | ------------ |
| edge | BaseEdgeModel | -       | Edge model   |
| x    | number        | -       | X coordinate |
| y    | number        | -       | Y coordinate |

### toFront<Badge>Method</Badge>

Bring specified node or edge to front

In default overlap mode, set specified element's zIndex to 9999 and restores original top element's zIndex to 1. all node zIndexes are restored to 1 when you click the canvas to unselect the element

In incremental mode, sets specified element's zIndex to current maximum zIndex + 1.

Parameters:

| Name | Type   | Default | Description        |
| ---- | ------ | ------- | ------------------ |
| id   | string | -       | Node id or edge id |

```tsx | pure
graphModel.toFront("edge_id_1");
```

### setElementZIndex<Badge>Method</Badge>

Set element's zIndex.

Note: Not recommended to use this method in default stacking mode.

Parameters:

| Name   | Type                    | Default | Description                            |
| ------ | ----------------------- | ------- | -------------------------------------- |
| id     | string                  | -       | Node id or edge id                     |
| zIndex | number\|'top'\|'bottom' | -       | Can pass number, or 'top' and 'bottom' |

```tsx | pure
graphModel.setElementZIndex("top");
```

### setElementStateById<Badge>Method</Badge>

Set element state (use this method when need to ensure only one element on entire canvas has certain state)

Parameters:

| Name              | Type                          | Required | Default | Description                  |
| ----------------- | ----------------------------- | -------- | ------- | ---------------------------- |
| id                | string                        | ✅        | -       | Node id or edge id           |
| state             | `ElementState`                | ✅        | -       | Set Node \| Edge model state |
| additionStateData | `Model.AdditionStateDataType` | -        | -       | Additional passed value      |

```tsx | pure
interface ElementState {
  DEFAULT: 1, // Default display
  TEXT_EDIT: 2, // Element is being text edited  
  SHOW_MENU: 3, // Show menu, deprecated please use menu plugin
  ALLOW_CONNECT: 4, // Element allowed as current edge's target node
  NOT_ALLOW_CONNECT: 5, // Element not allowed as current edge's target node
}
```

Usage:

```tsx | pure
graphModel.setElementStateById("node_1", 4);
```

### deleteNode<Badge>Method</Badge>

Delete node

Parameters:

| Name | Type   | Default | Description |
| ---- | ------ | ------- | ----------- |
| id   | string | -       | Node ID     |

```tsx | pure
graphModel.deleteNode("node_1");
```

### addNode<Badge>Method</Badge>

Add node

Parameters:

| Name       | Type       | Default | Description        |
| ---------- | ---------- | ------- | ------------------ |
| nodeConfig | NodeConfig | -       | Node configuration |

```tsx | pure
const nodeModel = graphModel.addNode({
  type: "rect",
  x: 300,
  y: 300,
});
```

### cloneNode<Badge>Method</Badge>

Clone node

Parameters:

| Name   | Type   | Default | Description |
| ------ | ------ | ------- | ----------- |
| nodeId | string | -       | Node id     |

```tsx | pure
const nodeModel = graphModel.cloneNode("node_1");
```

### moveNode<Badge>Method</Badge>

Move node

Parameters:

| Name         | Type    | Default | Description                      |
| ------------ | ------- | ------- | -------------------------------- |
| nodeId       | string  | -       | Node id                          |
| deltaX       | number  | -       | X-axis movement distance         |
| deltaY       | number  | -       | Y-axis movement distance         |
| isignoreRule | boolean | false   | Whether to ignore movement rules |

```tsx | pure
graphModel.moveNode("node_1", 10, 10, true);
```

### moveNode2Coordinate<Badge>Method</Badge>

Move node - absolute position

Parameters:

| Name         | Type    | Default | Description                      |
| ------------ | ------- | ------- | -------------------------------- |
| nodeId       | string  | -       | Node id                          |
| x            | number  | -       | X-axis coordinate                |
| y            | number  | -       | Y-axis coordinate                |
| isignoreRule | boolean | false   | Whether to ignore movement rules |

```tsx | pure
graphModel.moveNode2Coordinate("node_1", 100, 100, true);
```

### editText<Badge>Method</Badge>

Show node/edge text editor, enter edit state

Parameters:

| Name | Type   | Default | Description        |
| ---- | ------ | ------- | ------------------ |
| id   | string | -       | Node id or edge id |

```tsx | pure
graphModel.editText("node_1");
```

:::info{title=Note}
When initializing lf instance with text not editable, LogicFlow won't internally listen for events to cancel element edit state. You need to manually listen and use `setElementState` method to cancel text edit state.
:::

### setElementState<Badge>Method</Badge>

Set element state

Parameters:

| Name | Type   | Default | Description                                                                                                       |
| ---- | ------ | ------- | ----------------------------------------------------------------------------------------------------------------- |
| type | number | -       | 1 means default state; 2 means text editing; 4 means node not allowed to connect; 5 means node allowed to connect |

For example in some scenarios where nodes and edges are not editable by default. But after certain operations they become editable, you can use this method to change element from edit state to non-editable state.

```tsx | pure
lf.on("node:dbclick", ({ data }) => {
  lf.graphModel.editText(data.id);
  lf.once("graph:transform,node:click,blank:click", () => {
    lf.graphModel.textEditElement.setElementState(1);
  });
});
```

### addEdge<Badge>Method</Badge>

Add edge

Parameters:

| Name       | Type       | Default | Description        |
| ---------- | ---------- | ------- | ------------------ |
| edgeConfig | EdgeConfig | -       | Edge configuration |

```tsx | pure
const edgeModel = graphModel.addEdge({
  type: "polyline",
  sourceNodeId: "node_1",
  targetNodeId: "node_2",
});
```

### deleteEdgeBySourceAndTarget<Badge>Method</Badge>

Delete edge

Parameters:

| Name         | Type   | Default | Description    |
| ------------ | ------ | ------- | -------------- |
| sourceNodeId | string | -       | Source node id |
| targetNodeId | string | -       | Target node ID |

```tsx | pure
graphModel.deleteEdgeBySourceAndTarget("node_1", "node_2");
```

### deleteEdgeById<Badge>Method</Badge>

Delete edge by Id

Parameters:

| Name | Type   | Default | Description |
| ---- | ------ | ------- | ----------- |
| id   | string | -       | Edge id     |

```tsx | pure
graphModel.deleteEdgeById("edge_1");
```

### deleteEdgeBySource<Badge>Method</Badge>

Delete all edges with specified node as source

Parameters:

| Name | Type   | Default | Description    |
| ---- | ------ | ------- | -------------- |
| id   | string | -       | Edge source id |

```tsx | pure
graphModel.deleteEdgeBySource("node_1");
```

### deleteEdgeByTarget<Badge>Method</Badge>

Delete all edges with specified node as target

Parameters:

| Name | Type   | Default | Description    |
| ---- | ------ | ------- | -------------- |
| id   | string | -       | Edge target id |

```tsx | pure
graphModel.deleteEdgeByTarget("node_1");
```

### updateText<Badge>Method</Badge>

Set text for specified element

```tsx | pure
graphModel.updateText("node_1", "hello world");
```

### selectNodeById<Badge>Method</Badge>

Select node

Parameters:

| Name     | Type    | Default | Description    |
| -------- | ------- | ------- | -------------- |
| id       | string  | -       | Node id        |
| multiple | boolean | -       | Allow multiple |

```tsx | pure
graphModel.selectNodeById("node_1", true);
```

### selectEdgeById<Badge>Method</Badge>

Select edge

Parameters:

| Name     | Type    | Default | Description    |
| -------- | ------- | ------- | -------------- |
| id       | string  | -       | Node id        |
| multiple | boolean | -       | Allow multiple |

```tsx | pure
graphModel.selectEdgeById("edge_1", true);
```

### selectElementById<Badge>Method</Badge>

Select node and edge

Parameters:

| Name     | Type    | Default | Description     |
| -------- | ------- | ------- | --------------- |
| id       | string  | -       | Node or edge id |
| multiple | boolean | -       | Allow multiple  |

```tsx | pure
graphModel.selectElementById("edge_1", true);
```

### clearSelectElements<Badge>Method</Badge>

Clear selection state of all selected elements

```tsx | pure
graphModel.clearSelectElements();
```

### moveNodes<Badge>Method</Badge>

Batch move nodes, when nodes move, dynamically calculate positions of all edges between moved and unmoved nodes

Edges between moved nodes maintain relative positions

Parameters

| Name    | Type     | Required | Default | Description          |
| :------ | :------- | :------- | :------ | :------------------- |
| nodeIds | string[] | ✅        | -       | All node ids         |
| deltaX  | number   | ✅        | -       | X-axis move distance |
| deltaY  | number   | ✅        | -       | Y-axis move distance |

```tsx | pure
graphModel.moveNodes(["node_id", "node_2"], 10, 10);
```

### addNodeMoveRules<Badge>Method</Badge>

Add node movement restriction rules, triggered when node moves.

If method returns false, node movement will be prevented.

```tsx | pure
graphModel.addNodeMoveRules((nodeModel, x, y) => {
  if (nodeModel.properties.disabled) {
    return false;
  }
  return true;
});
```

### getNodeIncomingNode<Badge>Method</Badge>

Get all upstream nodes of a node

```tsx | pure
graphModel.getNodeIncomingNode = (nodeId: string): BaseNodeModel[] => {}
```

Parameters:

| Name   | Type   | Required | Default | Description |
| :----- | :----- | :------- | :------ | :---------- |
| nodeId | string | ✅        | -       | Node id     |

### getNodeOutgoingNode<Badge>Method</Badge>

Get all downstream nodes of a node

```tsx | pure
graphModel.getNodeOutgoingNode = (nodeId: string): BaseNodeModel[] => {}
```

Parameters:

| Name   | Type   | Required | Default | Description |
| :----- | :----- | :------- | :------ | :---------- |
| nodeId | string | ✅        | -       | Node id     |

### getNodeIncomingEdge<Badge>Method</Badge>

Get all edges that end at this node

```tsx | pure
graphModel.getNodeIncomingEdge = (nodeId: string): BaseEdgeModel[] => {}
```

Parameters:

| Name   | Type   | Required | Default | Description |
| :----- | :----- | :------- | :------ | :---------- |
| nodeId | string | ✅        | -       | Node id     |

### getNodeOutgoingEdge<Badge>Method</Badge>

Get all edges that start from this node

```tsx | pure
graphModel.getNodeOutgoingEdge = (nodeId: string): BaseEdgeModel[] => {}
```

Parameters:

| Name   | Type   | Required | Default | Description |
| :----- | :----- | :------- | :------ | :---------- |
| nodeId | string | ✅        | -       | Node id     |

### setDefaultEdgeType<Badge>Method</Badge>

Change default edge type

Parameters

| Name | Type   | Required | Default | Description |
| :--- | :----- | :------- | :------ | :---------- |
| type | string | ✅        | -       | Edge type   |

```tsx | pure
graphModel.setDefaultEdgeType("bezier");
```

### changeNodeType<Badge>Method</Badge>

Change type of specified node

Parameters

| Name | Type   | Required | Default | Description |
| :--- | :----- | :------- | :------ | :---------- |
| id   | string | ✅        | -       | Node        |
| type | string | ✅        | -       | Node type   |

```tsx | pure
graphModel.changeNodeType("node_1", "circle");
```

### changeEdgeType<Badge>Method</Badge>

Change type of specified edge

Parameters

| Name | Type   | Required | Default | Description |
| :--- | :----- | :------- | :------ | :---------- |
| id   | string | ✅        | -       | Node        |
| type | string | ✅        | -       | Edge type   |

```tsx | pure
graphModel.changeEdgeType("edge_1", "bezier");
```

### openEdgeAnimation<Badge>Method</Badge>

Enable edge animation

Parameter edgeId: string

```tsx | pure
graphModel.openEdgeAnimation("edge_1");
```

### closeEdgeAnimation<Badge>Method</Badge>

Disable edge animation

Parameter edgeId: string

```tsx | pure
graphModel.closeEdgeAnimation("edge_1");
```

### setTheme<Badge>Method</Badge>

Set theme

```tsx | pure
graphModel.setTheme({
  rect: {
    fill: "red",
  },
});
```
### resize<Badge>Method</Badge>

Reset canvas width and height

```tsx | pure
graphModel.resize(1000, 600);
```

### clearData<Badge>Method</Badge>

Clear all elements on canvas

```tsx | pure
graphModel.clearData();
```

### translateCenter<Badge>Method</Badge>

Move entire graph to canvas center

```tsx | pure
graphModel.translateCenter();
```

### fitView<Badge>Method</Badge>

Fit graph to screen size

Parameters
| Name             | Type   | Required | Default | Description                  |
| :--------------- | :----- | :------- | :------ | :--------------------------- |
| verticalOffset   | number | -        | 20      | Distance from box top/bottom |
| horizontalOffset | number | -        | 20      | Distance from box left/right |

```tsx | pure
graphModel.fitView();
```

