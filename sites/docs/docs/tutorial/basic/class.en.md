---
nav: Guide
group:
  title: Basics
  order: 1
title: Instance and graph data
order: 0
toc: content
---

This page answers two basics: **how to create a LogicFlow instance**, and **what the graph data passed to `render` looks like**.

::::info{title=Reading guide}
- If you only want to run the first example end-to-end, start with [Get started](../get-started.en.md).
- If you have already run the minimal example, this page fills in the instance, initialization options, and `graphData` fundamentals.
::::

The LogicFlow instance is the main object for designing and managing flowcharts. It initializes, renders, operates, and manages all elements on the diagram, including nodes and edges. With it you can build and manipulate diagrams and implement richer business logic and interactions.

## Creating an instance

Each flow-design surface is one LogicFlow instance. Create one with `new LogicFlow`, for example:

<iframe src="/initialized-demo.html" style="border: none; width: 100%; height: 400px; margin: auto;"></iframe>

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

:::info{title=Tip}
For consistent terminology, we write LogicFlow instances as `lf` in code examples from here on.
:::

When creating an instance you pass initialization options. LogicFlow supports many options, but **`container`** (the DOM element that hosts the canvas) is the only required field. For the full option list see [Constructor options](../../api/logicflow-constructor/index.en.md).

## Graph data

Inside LogicFlow a flowchart is a graph made of nodes and edges. Graph data uses the following shape:

```json
{
  "nodes": [
    {
      "id",
      "type",
      "x",
      "y",
      "text",
      "properties"
    }
  ],
  "edges": [
    {
      "id",
      "type",
      "sourceNodeId",
      "targetNodeId"
    }
  ]
}
```

- **`id`**: Optional for nodes and edges; generated when omitted.
- **`type`**: Required; a built-in type such as `rect` / `polyline` or your custom type.
- **`x` / `y`**: Required node coordinates.
- **`text`**: Optional node or edge text.
- **`properties`**: Custom data attached to the element.

**`nodes`**: All nodes to render. Full field definitions: [Type guide](../../api/type/index.en.md).

**`edges`**: All edges to render, linked by `sourceNodeId` and `targetNodeId`. Full field definitions: [Type guide](../../api/type/index.en.md).

After data is passed into the instance, LogicFlow builds a `nodeModel` and `edgeModel` for each element to hold state, behavior, and rendering. See [NodeModel](../../api/runtime-model/nodeModel.en.md) and [EdgeModel](../../api/runtime-model/edgeModel.en.md) for details.

## Rendering

Call `render` with data in the format above:

```js
lf.render(graphData)
```

The example below shows how graph data is defined and passed in:

<code id="graphData" src="../../../src/tutorial/basic/instance/graphData"></code>

Beyond rendering, LogicFlow exposes many APIs. Start from the [API overview](../../api/logicflow-instance/index.en.md), then open the [full method index](../../api/logicflow-instance/index.en.md) as needed.

## Next

1. [Theme](theme.en.md): unify node, edge, and text styling
2. [Events](event.en.md): listen to canvas, node, and edge interactions
3. [Nodes](node.en.md) / [Edges](edge.en.md): move on to customization
