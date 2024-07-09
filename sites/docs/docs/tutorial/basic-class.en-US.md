---
nav: Guide
group:
  title: Basics
  order: 1
title: Examples
order: 0
toc: content
---

## LogicFlow Instances

## Creating instances

Each process design interface is an instance of LogicFlow. To standardize terminology, we will later write `lf` for `LogicFlow` instances at the code level.

```html
<style>
  #container {
    width: 1000px;
    height: 500px
  }
</style>
<div id="container"></div>
```

```js
const lf = new LogicFlow({
  container: document.querySelector('#container')
});
```

When creating an instance, we need to pass configuration items that initialize the LogicFlow instance.LogicFlow supports a very rich set of initialization configuration items, but only the `container` parameter of the DOM node that is mounted when the LogicFlow canvas is initialized is required. See [LogicFlow API](/en-US/api) for the complete set of configuration items.

## Graph data

Inside LogicFlow, we think of a flowchart as a graph consisting of nodes and edges. So we use the following data structure to represent the graph data of LogicFlow.

<code id="graphData" src="../../src/tutorial/basic/instance/graphData"></code>

`nodes`: Contains all nodes. Each node's data attributes are detailed in the <a href="../api/nodeModelApi.en-US.md#DataAttributes">nodeModel</a>.

`edges`: Contains all edges, connecting two nodes through `sourceNodeId` and `targetNodeId`. Each edge's data attributes are detailed in the <a href="../api/edgeModelApi.en-US.md#DataAttributes">EdgeModel</a>.

<!-- ```jsx | pure
const graphData = {
  nodes: [
    {
      id: "node_id_1",
      type: "rect",
      x: 100,
      y: 100,
      text: { x: 100, y: 100, value: '节点1' },
      properties: {}
    },
    {
      id: "node_id_2",
      type: "circle",
      x: 200,
      y: 300,
      text: { x: 300, y: 300, value: '节点2' },
      properties: {}
    }
  ],
  edges: [
    {
      id: "edge_id",
      type: "polyline",
      sourceNodeId: "node_id_1",
      targetNodeId: "node_id_2",
      text: { x: 139, y: 200, value: "连线" },
      startPoint: { x: 100, y: 140 },
      endPoint: { x: 200, y: 250 },
      pointsList: [ { x: 100, y: 140 }, { x: 100, y: 200 }, { x: 200, y: 200 }, { x: 200, y: 250 } ],
      properties: {}
    }
  ]
}
```
- Why does node text need to have coordinates, can't we just use the node's coordinates directly?

  `text` can be used directly as a string, at this time, if it is the text of a node, we will automatically adopt the node coordinates as the node text coordinates, if it is the text of a connection, we will calculate a suitable coordinate as the node coordinates based on the different types of connections.
  In some application scenarios, our text can be dragged, in order to keep the consistency, our LogicFlow exported text data will take the coordinates with it.


- Why are the connecting `startPoint`, `endPoint` data and `pointsList` duplicated?

  Currently, LogicFlow has built-in `line`, `polyline`, and `bezier` lines, which all have `startPoint` and `endPoint` data. But the data exported by `line` will not take `pointsList` with it. For `polyline`, `pointsList` represents all points of the polyline. For `bezier`, `pointsList` represents `['start point', 'first control point', 'second control point', 'end point']`.


- What is `properties` used for?

  The LogicFlow of `properties` is reserved for data used in specific business scenarios.
  For example, in an approval flow scenario, we define a certain node, which passes, the node is green, and does not pass the node is red. Then the data description of the node could be.
  ```jsx | pure
  {
    type: 'apply',
    properties: {
      isPass: true
    }
  }
  ```

- What is `type`?

  The `type` represents the type of the node or line, which can be not only LogicFlow's built-in base type such as `rect`, `polyline`, but also user-defined type based on the base type. -->

## Diagram Rendering

The data is put directly into the `render` method to render the diagram.

```js
lf.render(graphData)
```
