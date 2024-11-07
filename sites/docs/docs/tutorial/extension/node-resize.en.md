---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: NodeResize
order: 16
toc: content
tag: Deprecated
---

## Use

LogicFlow provides `RectResize`, `EllipseResize`, `DiamondResize`, `HtmlResize` in the extension package, each node has `view` and `model` attributes. The scaling of nodes is also achieved by using LogicFlow's custom node mechanism, which allows developers to inherit from these 4 types of nodes that can be scaled to achieve node scaling.

For example, if we need a rectangle that can be scaled, when we didn't support node scaling before, we customize the node in the following way:

```tsx | pure
import { RectNode, RectNodeModel } from '@logicflow/core'

class CustomNode extends RectNode {
}

class CustomNodeModel extends RectNodeModel {
}

export default {
  type: 'custom-node',
  model: CustomNodeModel,
  view: CustomNode,
}
```

If we expect the custom node to be scaled, then change it to:

```tsx | pure
import { RectResize } from '@logicflow/extension'

class CustomNode extends RectResize.view {
}

class CustomNodeModel extends RectResize.model {
}

export default {
  type: 'custom-node',
  model: CustomNodeModel,
  view: CustomNode,
}
```

### Setting shape attributes of a node

LogicFlow calls the attributes of a node such as width, height, radius, etc. as [ShapeAttributes](../../api/nodeModel.en.md#Shape-Attributes), we can override the [initNodeData](../../api/nodeModel.en.md#getoutlinestyle) or [ setAttributes](../../api/nodeModel.en.md#setattributes) methods to set the shape attributes of a node. But when the node can be scaled, we can't set the width and height in `setAttributes`, only in `initNodeData`.

```tsx | pure
class ResizableRectModel extends RectResize.model {
  initNodeData(data) {
    super.initNodeData(data);
    this.width = 100;
    this.height = 40;
  }
}
```

### Customizing the view of a node

As mentioned in Customizing Nodes, for nodes with complex style attributes, we can override the `getShape` method in `view` to achieve the real rendered appearance of the custom node. However, since custom nodes need to populate the node's appearance with adjustment points for scaling, we need to override `getResizeShape`, not `getShape`, for the view of a custom scalable node.

```tsx | pure
import { RectResize } from "@logicflow/extension";

class ResizableRectModel extends RectResize.model {
  initNodeData(data) {
    super.initNodeData(data);
    this.width = 100;
    this.height = 40;
    this.text.draggable = true;
  }
}
class ResizableRectView extends RectResize.view {
  getResizeShape() {
    const { model } = this.props;
    const { x, y, width, height, radius, properties } = model;
    const style = model.getNodeStyle();
    return h("g", {}, [
      h("rect", {
        ...style,
        x: x - width / 2,
        y: y - height / 2,
        rx: radius,
        ry: radius,
        width,
        height,
      }),
    ]);
  }
}

export default {
  type: "resizable-rect",
  view: ResizableRectView,
  model: ResizableRectModel,
};
```

:::info{title=tip}
For nodes that inherit `HtmlResize`, customize `view` by continuing to use the `setHtml` method of the `view` of the custom HTML node.
:::

## Event `node:resize` is thrown after node resizing.

Throw event `node:resize` after node resizing, the data include node position and node size before and after node resizing, the data is {preData, data}, the details are as follows.
| Name      | Type   | Description                         |
| :-------- | :----- | :---------------------------------- |
| id        | string | Node id                             |
| type      | string | Node type                           |
| modelType | string | Node graph type, internally defined |
| x         | number | Node center x-axis coordinates      |
| y         | number | Node center y-axis coordinate       |
| rx        | number | x-axis radius (ellipse, rhombus)    |
| ry        | number | y-axis radius (ellipse, diamond)    |
| width     | number | Node width (rectangle)              |
| height    | number | Node height (rectangle)             |

```tsx | pure
lf.on("node:resize", ({ preData, data }) => {
  console.log(preData, data);
});
```

## Setting the maximum and minimum values for zoom-in and zoom-out

After `v1.1.8`, the zoom-in/zoom-out of a node supports setting the maximum and minimum values.

```tsx | pure
class ResizableRectModel extends RectResize.model {
  initNodeData(data) {
    super.initNodeData(data);
    this.width = 100;
    this.height = 40;
    this.maxWidth = 400;
    this.maxHeight = 400;
  }
}
```

## Setting the adjustment default distance for zooming in and out

After `v1.1.8`, it is supported to set the `girdSize` property of a node, which is used to control how much distance to move the mouse before starting to zoom the node.

```tsx | pure
class ResizableRectModel extends RectResize.model {
  initNodeData(data) {
    super.initNodeData(data);
    this.gridSize = 400;
  }
}
```
:::info{title=gridSize on node scaling}
In most cases, to keep the nodes `neat` and to facilitate top/bottom/right/left/right alignment between nodes. `logicflow` defaults to change the size of nodes when zooming in and out, only when the mouse movement distance reaches twice the `gridSize` passed to the initialization canvas. But this has the disadvantage of a laggy feeling when adjusting. You can set the `gridSize` of each node individually without changing the initialized `gridSize` to make zooming in and out smoother.
:::

## Settings to adjust the border style

The resizable node displays a dashed box against the node when it is selected (the rectangle does not). Customizing its style can be achieved by overriding the `getResizeOutlineStyle` method.

```tsx | pure
class ResizableRectModel extends RectResize.model {
  getResizeOutlineStyle() {
    return {
      stroke: "#000000",
      strokeWidth: 1,
      strokeDasharray: "3,3",
    };
  }
}
```

## Setting the resize point style

When the zoom-in/zoom-out node is selected, action points for resizing the node are generated at the four corners of the dashed box, which can be customized by overriding the `getControlPointStyle` method.

```tsx | pure
class ResizableRectModel extends RectResize.model {
  getControlPointStyle() {
    return {
      width: 7,
      height: 7,
      fill: "#FFFFFF",
      stroke: "#000000",
    };
  }
}
```

address: [https://codesandbox.io/s/prod-resonance-ztpvtv](https://codesandbox.io/s/prod-resonance-ztpvtv?file=/step_26_nodeResize/index.js)

<a href="https://codesandbox.io/embed/prod-resonance-ztpvtv?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> Go to CodeSandbox for examples </a>
