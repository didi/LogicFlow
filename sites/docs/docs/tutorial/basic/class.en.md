---
nav: Guide
group:
  title: Basics
  order: 1
title: Examples
order: 0
toc: content
---

## Creating instances

Each process design interface is an instance of LogicFlow. To standardize terminology, we will later
write `lf` for `LogicFlow` instances at the code level.

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

When creating an instance, we need to pass configuration items that initialize the LogicFlow
instance.LogicFlow supports a very rich set of initialization configuration items, but only
the `container` parameter of the DOM node that is mounted when the LogicFlow canvas is initialized
is required. See [LogicFlow API](../../api) for the complete set of configuration items.

## Graph data

Inside LogicFlow, we think of a flowchart as a graph consisting of nodes and edges. So we use the
following data structure to represent the graph data of LogicFlow.

<code id="graphData" src="../../../src/tutorial/basic/instance/graphData"></code>

**`nodes`**: Contains all nodes. Each node's data attributes are detailed in
the <a href="../../../en/api/model/node-model#DataAttributes">nodeModel</a>.

**`edges`**: Contains all edges, connecting two nodes through `sourceNodeId` and `targetNodeId`.
Each edge's data attributes are detailed in the <a href="../../../en/api/model/edge-model#DataAttributes">
EdgeModel</a>.

**`type`**: Indicates the type of node or edge, which can be a basic type built into LogicFlow such
as `rect` or `polyline`, or a custom type defined by users based on these basic types.

**`text`**: `text` can represent either node text or edge text. For node text, the node coordinates
are automatically used as the text coordinates. For edge text, an appropriate coordinate is computed
based on the type of edge. In some scenarios, text positions can be adjusted and dragged. Therefore,
our text data in LogicFlow provides coordinate attributes.

**`properties`**: Each node and edge has properties including node style, shape attributes, and
business-specific properties reserved for particular business scenarios. Examples include node shape
attributes like `width` and `height`, `style` attributes, and business-specific properties
like `isPass`.

## Diagram Rendering

The data is put directly into the `render` method to render the diagram.

```js
lf.render(graphData)
```
