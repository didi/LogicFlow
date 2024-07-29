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

The graphModel is the `model` that corresponds to the entire canvas in LogicFlow.

Most of the methods on the LogicFlow instance are simply wrapped around the graphModel.

You can get the graphModel in several ways

- Directly from the lf property. `lf.graphModel`
- From the constructor when customizing `model`, or from `this` in a method.

```tsx | pure
class CustomModel extends RectNodeModel {
  getNodeStyle() {
    const graphModel = this.graphModel
  }
}
```

- Get from `props` when customizing `view`.

```tsx | pure
class CustomNode extends RectNode {
  getShape() {
    const { model, graphModel } = this.props;
    // ...
  }
}
```

:::info
**NOTE** All properties on graphModel are read-only, to modify them, use the corresponding methods
provided to do so.
:::

## Property

| Name                        | Type                                          | Default | Description                                                                                                                                                                  |
|:----------------------------|:----------------------------------------------|:--------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| width                       | `number`                                      |         | LogicFlow Canvas Width                                                                                                                                                       |
| height                      | `number`                                      |         | LogicFlow Canvas Height                                                                                                                                                      |
| theme                       | `LogicFlow.Theme`                             |         | [Detailed API](../theme.en.md)                                                                                                                                               |
| animation                   | `boolean \| LFOptions.AnimationConfig`        | false   | Animation state configuration, if or not the corresponding animation is turned on                                                                                            |
| [eventCenter](#eventcenter) | `EventEmitter`                                |         | Event center, through which events can be thrown to the outside world.                                                                                                       |
| modelMap                    | `Map<string, BaseNodeModel \| BaseEdgeModel>` |         | Maintains a model for all nodes and edge types                                                                                                                               |
| [topElement](#topelement)   | `BaseNodeModel \| BaseEdgeModel`              |         | The element at the top of the current canvas                                                                                                                                 |
| idGenerator                 | `(type?: string) => string \| undefined`      |         | Custom global id generator                                                                                                                                                   |
| nodeMoveRules               | `Model.NodeMoveRule[]`                        | []      | Node movement rules, all rules in this array are triggered when a node is moved.                                                                                             |
| customTrajectory            | `LFOptions.CustomAnchorLineProps`             |         | Get customized line traces                                                                                                                                                   |
| edgeGenerator               | `LFOptions.EdgeGeneratorType`                 |         | Rules for generating edges when connecting nodes and when connecting lines are changed.                                                                                      |
| edgeType                    | `string`                                      |         | Default edge type used when creating edges in graph operations                                                                                                               |
| nodes                       | `BaseNodeModel[]`                             | []      | All node objects of the canvas                                                                                                                                               |
| edges                       | `BaseEdgeModel[]`                             | []      | All line objects of the canvas                                                                                                                                               |
| fakeNode                    | `BaseNodeModel  \| null`                      | null    | When dragging nodes from outside into the canvas, use fakeNode to distinguish them from formal nodes on the canvas.                                                          |
| [overlapMode](#overlapmode) | `number`                                      |         | Stacking mode when elements overlap; 0: default mode, 1: incremental mode                                                                                                    |
| background                  | `false \| LFOptions.BackgroundConfig`         |         | Canvas background configuration.                                                                                                                                             |
| transformModel              | `TransformModel`                              |         | current canvas translation and scaling matrix `model`, see [API](./transformModel.en.md) for more details                                                                      |
| editConfigModel             | `EditConfigModel`                             |         | Basic configuration object, see [editConfigApi](./editConfigModel.en.md) for details.                                                                                          |
| gridSize                    | `number`                                      | 1       | Grid size                                                                                                                                                                    |
| partial                     | `boolean`                                     | false   | whether or not to enable localized rendering, when the number of elements on the page is too large, enabling localized rendering will improve the page rendering performance |
| nodesMap                    | `GraphModel.NodesMapType`                     |         | The `map` of all nodes in the canvas.                                                                                                                                        |
| edgesMap                    | `GraphModel.EdgesMapType`                     |         | The `map` of all edges of the canvas.                                                                                                                                        |
| modelsMap                   | `GraphModel.ModelsMapType`                    |         | A `map` of all nodes and edges of the canvas.                                                                                                                                |
| selectNodes                 | `BaseNodeModel[]`                             |         | All selected node objects in the canvas                                                                                                                                      |
| sortElements                | `array`                                       |         | Elements sorted by zIndex, sorting elements based on zIndex                                                                                                                  |
| textEditElement             | `BaseNodeModel \| BaseEdgeModel`              |         | Currently edited elements                                                                                                                                                    |
| selectElements              | `Map<string, BaseNodeModel \| BaseEdgeModel>` |         | All currently selected elements in the canvas                                                                                                                                |

### eventCenter <Badge>Property</Badge>

logicflow internal event center, you can use this object to throw events to the outside.

```tsx | pure
class UserTaskModel extends RectNodeModel {
  setAttributes() {
    this.menu = [
      {
        text: "详情",
        callback: (res) => {
          this.graphModel.eventCenter.emit("user:detail", res);
        },
      },
    ];
  }
}

lf.on("user:detail", (res) => {});
```

### topElement<Badge>Property</Badge>

The element at the top of the current canvas.

This element only exists when the stacking mode is the default mode.
Used to restore the previous top element to its initial order in default mode.

### overlapMode<Badge>Property</Badge>

Stacking mode when elements overlap<br>

- A value of `0`: the default mode, where nodes and edges are selected, will be displayed at the
  top. When unchecked, the elements revert to their previous level.
- A value of `1`: Incremental mode, nodes and edges are selected and displayed at the top. When
  unchecked, the element maintains its hierarchy.

## method

### getAreaElement<Badge>method</Badge>

Get all elements in the specified area

Parameters:

| Name              | Type       | Default | Description                                        |
|-------------------|------------|---------|----------------------------------------------------|
| leftTopPoint      | PointTuple | None    | Dots in the upper left corner of the area          |
| rightBottomPoint  | PointTuple | None    | The point at the bottom right corner of the region |
| wholeEdge         | boolean    | None    | Whether to have the entire edge inside the region  |
| wholeNode         | boolean    | None    | Whether to have the entire node inside the region  |
| ignoreHideElement | boolean    | None    | Whether to ignore hidden nodes                     |

```tsx | pure
graphModel.getAreaElement([100, 100], [800, 800]);
```

### getModel<Badge>method</Badge>

Get the Model constructor for the specified type

Parameters:

| Name | Type   | Default |
|------|--------|---------|
| type | string | None    |

return: [NodeModel](./nodeModel.en.md) or [EdgeModel](./edgeModel.en.md)

```tsx | pure
graphModel.getModel("rect");
```

### getNodeModelById<Badge>method</Badge>

Parameters:

| Name | Type   | Default |
|------|--------|---------|
| type | string | None    |

return: [NodeModel](./nodeModel.en.md)

```tsx | pure
graphModel.getNodeModelById("node_1");
```

### getPointByClient<Badge>method</Badge>

Get the coordinates of the mouse click position on the canvas.

> Because the location of the flowchart can be anywhere on the page, when the internal event needs
> to get the triggering event, its position relative to the upper-left corner of the canvas needs to
> be the event triggering position minus the position of the canvas relative to the client.

Parameters:

| Name  | Type     | Default | Description     |
|-------|----------|---------|-----------------|
| point | Position | None    | HTML coordinate |

return:

| Name                  | Type     | Default | Description                                                                                               |
|-----------------------|----------|---------|-----------------------------------------------------------------------------------------------------------|
| domOverlayPosition    | Position | None    | HTML layer coordinates, generally used when controlling the position of components                        |
| canvasOverlayPosition | Position | None    | Canvas layer coordinates, generally the coordinates of nodes and edges are the coordinates of this layer. |

Why do you need this method and why does the same position of a mouse click produce two different
coordinates?

Because there is scaling and panning of the canvas. When the canvas is moved, visually it looks like
the position of the elements on the canvas has changed, but at the data level, the position of the
nodes and edges on the canvas is unchanged. As a reverse example: there is a node in the middle of a
canvas with a width and height of 1000px \* 1000px, and the position of this node is likely to
be `{x: -999,y: -999}`, because of the panning. But when we double-click this node, we need to
display a text input box at the node position, because the input box is in the `domOverlay` layer,
which is not scaled and panned like `CanvasOverlay`, and its width and height are the same as the
canvas width and height. So the coordinates of this text input box should be `{x: 500, y: 500}`.

Let's look at why we need this method again.

Let's say that the canvas is at a distance of 100 from the top of the browser, and 100 from the
left. So when the user clicks on the center of the canvas, the position that the js listener gets
from the click function should be `{x: 600, y: 600}`, and by calling this method we can get
the `canvasOverlayPosition` as `{x: -999,y: -999}`, and the `domainOverlayPosition`
as `{x: -999,y: -999}`. 999}`, and `domOverlayPosition` is `{x: 500, y:
500}`. Developers can then base their development on these two coordinates. For example, displaying a menu at `
domOverlayPosition` or something like that.

```tsx | pure
graphModel.getPointByClient({ x: 200, y: 200 });
```

### isElementInArea<Badge>method</Badge>

Determines whether an element is within the specified rectangular area.

Parameters:

| Name      | Type                  | Default | Description                                                          |
|-----------|-----------------------|---------|----------------------------------------------------------------------|
| element   | NodeModel 或 EdgeModel | None    | element of the model                                                 |
| lt        | PointTuple            | None    | upper left corner point                                              |
| rb        | PointTuple            | None    | lower right                                                          |
| wholeEdge | boolean               | true    | Only if the start and end points of the edges are within the region. |
| wholeNode | boolean               | true    | The node's boxes are all in the region before counting the           |

return: `boolean`

```tsx | pure
const node = {
  type: "rect",
  x: 300,
  y: 300,
};
graphModel.isElementInArea(node, [200, 200], [400, 400]);
```

### getAreaElements<Badge>method</Badge>

Parameters:

| Name              | Type       | Default | Description                                                       |
|-------------------|------------|---------|-------------------------------------------------------------------|
| leftTopPoint      | PointTuple | None    | Top Left Point                                                    |
| rightBottomPoint  | PointTuple | None    | Bottom right point                                                |
| ignoreHideElement | boolean    | false   | Ignore hidden elements                                            |
| wholeEdge         | boolean    | true    | Edges count only if their start and end points are in the region. |
| wholeNode         | boolean    | true    | Nodes count only if their box is inside the region.               |

return: `LogicFlow.GraphElement[]`

### graphDataToModel<Badge>method</Badge>

Reset the entire canvas elements with the new data

Note: All existing nodes and edges on the canvas will be cleared.

Parameters:

| Name      | Type            | Default | Description             |
|-----------|-----------------|---------|-------------------------|
| graphData | GraphConfigData | None    | Basic data of the graph |

```tsx | pure
const graphData = {
  nodes: [
    {
      id: "node_id_1",
      type: "rect",
      x: 100,
      y: 100,
      text: { x: 100, y: 100, value: "node1" },
      properties: {},
    },
    {
      id: "node_id_2",
      type: "circle",
      x: 200,
      y: 300,
      text: { x: 200, y: 300, value: "node2" },
      properties: {},
    },
  ],
  edges: [
    {
      id: "edge_id",
      type: "polyline",
      sourceNodeId: "node_id_1",
      targetNodeId: "node_id_2",
      text: { x: 139, y: 200, value: "edge" },
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

### modelToGraphData<Badge>method</Badge>

return: `GraphConfigData`

```tsx | pure
const graphData = graphModel.modelToGraphData();
console.log(graphData)
```

### modelToHistoryData<Badge>method</Badge>

return：false | HistoryData

```tsx | pure
const historyData = graphModel.modelToHistoryData();
console.log(historyData)
```

### getEdgeModelById<Badge>method</Badge>

Parameters:

| Name   | Type   | Default | Description |
|--------|--------|---------|-------------|
| edgeId | string | None    | edge Id     |

return: [EdgeModel](edgeModel.en.md)

```tsx | pure
const edgeModel = graphModel.getEdgeModelById('edge_id');
console.log(edgeModel)
```

### getElement<Badge>method</Badge>

get node or edge Model

Parameters:

| Name | Type   | Default | Description        |
|------|--------|---------|--------------------|
| id   | string | None    | edge Id or node Id |

return: [EdgeModel](./edgeModel.en.md) or [NodeModel](./nodeModel.en.md)

```tsx | pure
const edgeModel = graphModel.getElement('edge_id');
console.log(edgeModel)
```

### getNodeEdges<Badge>method</Badge>

Parameters:

| Name   | Type   | Default | Description |
|--------|--------|---------|-------------|
| nodeId | string | None    | node Id     |

return: [EdgeModel](./edgeModel.en.md)

```tsx | pure
const edgeModels = graphModel.getNodeEdges('node_id_1');
console.log(edgeModels)
```

### getSelectElements<Badge>method</Badge>

Parameters:

| Name          | Type    | Default | Description                                                                                                                                                                       |
|---------------|---------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| isIgnoreCheck | boolean | true    | Include or exclude edges where sourceNode and targetNode are not selected, by default. Such edges cannot be included when copying, because copying does not allow dangling edges. |

```tsx | pure
const elements = graphModel.getSelectElements(true);
console.log(elements)
```

### updateAttributes<Badge>method</Badge>

Modify the attributes in the corresponding element model

:::warning
Note: This method should be used with caution unless you have a good understanding of logicflow
internals.<br>
In most cases, use methods like setProperties, updateText, changeNodeId, etc.<br>
For example, if you use this method to change a node's id, the sourceNodeId of the side connected to
the node will not be found.
:::

Parameters:

| Name       | Type   | Default | Description        |
|------------|--------|---------|--------------------|
| id         | string | None    | node Id            |
| attributes | object | None    | Element Properties |

```tsx | pure
graphModel.updateAttributes("node_id_1", {
  radius: 4,
});
```

### getVirtualRectSize<Badge>method</Badge>

Parameters `includeEdge: boolean = false`
return `GraphModel.VirtualRectProps`

```tsx | pure
const virtualdata = graphModel.getVirtualRectSize();
console.log(virtualdata);
// virtualdata : { width, height, x, y }
```

### changeNodeId<Badge>method</Badge>

Modify the id of the node, if you don't pass a new id, one will be created internally.
Parameters:

| Name  | Type   | Default | Description |
|-------|--------|---------|-------------|
| oldId | string | None    | node Id     |
| newId | string | None    | new Id      |

```tsx | pure
graphModel.changeNodeId("node_id_1", "node_id_2");
```

### changeEdgeId<Badge>method</Badge>

Modify the id of the side, if you don't pass a new id, one will be created internally.

Parameters:

| Name  | Type   | Default | Description |
|-------|--------|---------|-------------|
| oldId | string | None    | node Id     |
| newId | string | None    | new Id      |

```tsx | pure
graphModel.changeEdgeId("edge_id_1", "edge_id_2");
```

### handleEdgeTextMove<Badge>method</Badge>

Parameters:

| Name | Type          | Default | Description             |
|------|---------------|---------|-------------------------|
| edge | BaseEdgeModel | None    | edge model              |
| x    | number        | None    | x-axis coordinate value |
| y    | number        | None    | y-axis coordinate value |

### getRelatedEdgesByType<Badge>method</Badge>

Get the model of all edges associated with a node by its node id.

Parameters:

| Name   | Type                             | Default | Description                                         |
|--------|----------------------------------|---------|-----------------------------------------------------|
| nodeId | string                           | None    | target node id                                      |
| type   | 'sourceNodeId' \| 'targetNodeId' | None    | sourceNodeId: source node；targetNodeId: target node |

### toFront<Badge>method</Badge>

Place the specified node or edge in front

If the stacking mode is the default mode, set the top zIndex of the specified element to 9999, and
the original zIndex of the top element will be restored to the original level zIndex is set to 1.

If the stacking mode is incremental, the zIndex of the specified element is set to the current
maximum zIndex + 1.

Parameters:

| Name | Type   | Default | Description        |
|------|--------|---------|--------------------|
| id   | string | None    | node id or edge id |

```tsx | pure
graphModel.toFront("edge_id_1");
```

### setElementZIndex<Badge>method</Badge>

Sets the zIndex of the element.

Note: This method is not recommended in default stacking mode.

Parameters:

| Name   | Type                    | Default | Description                                                        |
|--------|-------------------------|---------|--------------------------------------------------------------------|
| id     | string                  | None    | node id or edge id                                                 |
| zIndex | number\|'top'\|'bottom' | None    | You can pass numbers, but you can also pass in `top` and `bottom`. |

```tsx | pure
graphModel.setElementZIndex("top");
```

### setElementStateById<Badge>method</Badge>

Sets the state of an element (this method can be called when you need to make sure that only one of
all the elements on the entire canvas has a certain state)

Parameters:

| Name              | Type                          | Must Pass | Default | Description                   |
|-------------------|-------------------------------|-----------|---------|-------------------------------|
| id                | string                        | ✅         | None    | node id or edge id            |
| state             | `ElementState`                | ✅         | None    | Set Node \| Edge  model state |
| additionStateData | `Model.AdditionStateDataType` | -         | None    | Additional values passed      |

```tsx | pure
interface ElementState {
  DEFAULT: 1, // Default display
  TEXT_EDIT: 2, // This element is being edited.
  SHOW_MENU: 3, // Show menu, deprecate menu plugin.
  ALLOW_CONNECT: 4, // This element is allowed to be the target node of the current edge.
  NOT_ALLOW_CONNECT: 5, // This element is not allowed to be the target node of the current edge.
}
```

Usage:

```tsx | pure
graphModel.setElementStateById("node_1", 4);
```

### deleteNode<Badge>method</Badge>

Parameters:

| Name | Type   | Default | Description |
|------|--------|---------|-------------|
| id   | string | None    | node ID     |

```tsx | pure
graphModel.deleteNode("node_1");
```

### addNode<Badge>method</Badge>

Parameters:

| Name       | Type       | Default |
|------------|------------|---------|
| nodeConfig | NodeConfig | None    |

```tsx | pure
const nodeModel = graphModel.addNode({
  type: "rect",
  x: 300,
  y: 300,
});
```

### cloneNode<Badge>method</Badge>

Parameters:

| Name   | Type   | Default | Description |
|--------|--------|---------|-------------|
| nodeId | string | None    | node id     |

```tsx | pure
const nodeModel = graphModel.cloneNode("node_1");
```

### moveNode<Badge>method</Badge>

移动node

Parameters:

| Name         | Type    | Default | Description                                  |
|--------------|---------|---------|----------------------------------------------|
| nodeId       | string  | None    | node id                                      |
| deltaX       | number  | None    | Move x-axis distance                         |
| deltaY       | number  | None    | Move y-axis distance                         |
| isignoreRule | boolean | false   | Whether to ignore movement rule restrictions |

```tsx | pure
graphModel.moveNode("node_1", 10, 10, true);
```

### moveNode2Coordinate<Badge>method</Badge>

Move node-absolute position

Parameters:

| Name         | Type    | Default | Description                                  |
|--------------|---------|---------|----------------------------------------------|
| nodeId       | string  | None    | node id                                      |
| x            | number  | None    | Move x-axis distance                         |
| y            | number  | None    | Move y-axis distance                         |
| isignoreRule | boolean | false   | Whether to ignore movement rule restrictions |

```tsx | pure
graphModel.moveNode2Coordinate("node_1", 100, 100, true);
```

### editText<Badge>method</Badge>

Display node, line text edit box, enter editing state

Parameters:

| Name | Type   | Default | Description        |
|------|--------|---------|--------------------|
| id   | string | None    | node id or edge id |

```tsx | pure
graphModel.editText("node_1");
```

:::info{title=Note}
When the lf instance is initialized, the text passed in is not editable, LogicFlow will not listen
to the event to cancel the editing state of the element. You need to listen to it manually, and then
use the `setElementState` method to cancel the text editing state.
:::

### setElementState<Badge>method</Badge>

Parameters:

| Name | Type   | Default | Description                                                                                                                           |
|------|--------|---------|---------------------------------------------------------------------------------------------------------------------------------------|
| type | number | None    | 1 means default; 2 means in text editor; 4 means no node is not allowed to be connected; 5 means the node is allowed to be connected. |

For example, in some scenarios, node and line are not allowed to be edited by default. However, when
certain operations are performed, editing is allowed, and this method can be used to set the element
from an editable state to a non-editable state.

```tsx | pure
lf.on("node:dbclick", ({ data }) => {
  lf.graphModel.editText(data.id);
  lf.once("graph:transform,node:click,blank:click", () => {
    lf.graphModel.textEditElement.setElementState(1);
  });
});
```

### addEdge<Badge>method</Badge>

Parameters:

| Name       | Type       | Default |
|------------|------------|---------|
| edgeConfig | EdgeConfig | None    |

```tsx | pure
const edgeModel = graphModel.addEdge({
  type: "polyline",
  sourceNodeId: "node_1",
  targetNodeId: "node_2",
});
```

### deleteEdgeBySourceAndTarget<Badge>method</Badge>

Parameters:

| Name         | Type   | Default | Description   |
|--------------|--------|---------|---------------|
| sourceNodeId | string | None    | start node id |
| targetNodeId | string | None    | end node ID   |

```tsx | pure
graphModel.deleteEdgeBySourceAndTarget("node_1", "node_2");
```

### deleteEdgeById<Badge>method</Badge>

Parameters:

| Name | Type   | Default | Description |
|------|--------|---------|-------------|
| id   | string | None    | edge id     |

```tsx | pure
graphModel.deleteEdgeById("edge_1");
```

### deleteEdgeBySource<Badge>method</Badge>

Parameters:

| Name | Type   | Default | Description |
|------|--------|---------|-------------|
| id   | string | None    | edge id     |

```tsx | pure
graphModel.deleteEdgeBySource("node_1");
```

### deleteEdgeByTarget<Badge>method</Badge>

Parameters:

| Name | Type   | Default | Description |
|------|--------|---------|-------------|
| id   | string | None    | edge id     |

```tsx | pure
graphModel.deleteEdgeByTarget("node_1");
```

### updateText<Badge>method</Badge>

```tsx | pure
graphModel.updateText("node_1", "hello world");
```

### selectNodeById<Badge>method</Badge>

Parameters:

| Name     | Type    | Default | Description            |
|----------|---------|---------|------------------------|
| id       | string  | None    | node id                |
| multiple | boolean | None    | Multiple choice or not |

```tsx | pure
graphModel.selectNodeById("node_1", true);
```

### selectEdgeById<Badge>method</Badge>

Parameters:

| Name     | Type    | Default | Description            |
|----------|---------|---------|------------------------|
| id       | string  | None    | node id                |
| multiple | boolean | None    | Multiple choice or not |

```tsx | pure
graphModel.selectEdgeById("edge_1", true);
```

### selectElementById<Badge>method</Badge>

Parameters:

| Name     | Type    | Default | Description            |
|----------|---------|---------|------------------------|
| id       | string  | None    | node或边 id              |
| multiple | boolean | None    | Multiple choice or not |

```tsx | pure
graphModel.selectElementById("edge_1", true);
```

### clearSelectElements<Badge>method</Badge>

Unchecks all selected elements.

```tsx | pure
graphModel.clearSelectElements();
```

### moveNodes<Badge>method</Badge>

Batch move nodes, when the node moves, it will dynamically calculate the edge position of all nodes
and the unmoved nodes.

The edges between the moved nodes will keep their relative positions.

Parameters

| Name    | Type     | Mandatory | Default | Description          |
|:--------|:---------|:----------|:--------|:---------------------|
| nodeIds | string[] | ✅         | None    | All of node id       |
| deltaX  | number   | ✅         | None    | Move x-axis distance |
| deltaY  | number   | ✅         | None    | Move y-axis distance |

```tsx | pure
graphModel.moveNodes(["node_id", "node_2"], 10, 10);
```

### addNodeMoveRules<Badge>method</Badge>

Adds a node movement restriction rule that is triggered when a node moves.

If the method returns false, node movement is prevented.

```tsx | pure
graphModel.addNodeMoveRules((nodeModel, x, y) => {
  if (nodeModel.properties.disabled) {
    return false;
  }
  return true;
});
```

### getNodeIncomingNode<Badge>method</Badge>

```tsx | pure
graphModel.getNodeIncomingNode = (nodeId: string): BaseNodeModel[] => {}
```

Parameters:

| Name   | Type   | Mandatory | Default | Description |
|:-------|:-------|:----------|:--------|:------------|
| nodeId | string | ✅         | -       | node id     |

### getNodeOutgoingNode<Badge>method</Badge>

```tsx | pure
graphModel.getNodeOutgoingNode = (nodeId: string): BaseNodeModel[] => {}
```

Parameters:

| Name   | Type   | Mandatory | Default | Description |
|:-------|:-------|:----------|:--------|:------------|
| nodeId | string | ✅         | -       | node id     |

### getNodeIncomingEdge<Badge>method</Badge>

Get all edges that end at this node

```tsx | pure
graphModel.getNodeIncomingEdge = (nodeId: string): BaseEdgeModel[] => {}
```

Parameters:

| Name   | Type   | Mandatory | Default | Description |
|:-------|:-------|:----------|:--------|:------------|
| nodeId | string | ✅         | -       | node id     |

### getNodeOutgoingEdge<Badge>method</Badge>

Get all edges starting at this node

```tsx | pure
graphModel.getNodeOutgoingEdge = (nodeId: string): BaseEdgeModel[] => {Î}
```

Parameters:

| Name   | Type   | Mandatory | Default | Description |
|:-------|:-------|:----------|:--------|:------------|
| nodeId | string | ✅         | -       | node id     |

### setDefaultEdgeType<Badge>method</Badge>

Parameters

| Name | Type   | Mandatory | Default | Description |
|:-----|:-------|:----------|:--------|:------------|
| type | string | ✅         | None    | 边类型         |

```tsx | pure
graphModel.setDefaultEdgeType("bezier");
```

### changeNodeType<Badge>method</Badge>

Parameters

| Name | Type   | Mandatory | Default | Description |
|:-----|:-------|:----------|:--------|:------------|
| id   | string | ✅         | None    | Node        |
| type | string | ✅         | None    | Node Type   |

```tsx | pure
graphModel.changeNodeType("node_1", "circle");
```

### changeEdgeType<Badge>method</Badge>

Parameters

| Name | Type   | Mandatory | Default | Description |
|:-----|:-------|:----------|:--------|:------------|
| id   | string | ✅         | None    | Node        |
| type | string | ✅         | None    | Edge Type   |

```tsx | pure
graphModel.changeEdgeType("edge_1", "bezier");
```

### openEdgeAnimation<Badge>method</Badge>

Parameters edgeId: string

```tsx | pure
graphModel.openEdgeAnimation("edge_1");
```

### closeEdgeAnimation<Badge>method</Badge>

Parameters edgeId: string

```tsx | pure
graphModel.closeEdgeAnimation("edge_1");
```

### setTheme<Badge>method</Badge>

```tsx | pure
graphModel.setTheme({
  rect: {
    fill: "red",
  },
});
```

### resize<Badge>method</Badge>

Reset the canvas width and height

```tsx | pure
graphModel.resize(1000, 600);
```

### clearData<Badge>method</Badge>

```tsx | pure
graphModel.clearData();
```

### translateCenter<Badge>method</Badge>

Move the entire image to the center of the canvas

```tsx | pure
graphModel.translateCenter();
```

### fitView<Badge>method</Badge>

Canvas Graphics Adaptation to Screen Size

Parameters
| Name | Type | Must Pass | Default | Description |
| :--- | :----- | :--- | :----- | :----- |
| verticalOffset | number | - | 20 | Distance from top and bottom of box |
| horizontalOffset | number | - | 20 | Distance to the left and right of the box |

```tsx | pure
graphModel.fitView();
```
