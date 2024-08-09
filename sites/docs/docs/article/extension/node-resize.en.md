---
title: NodeResize Extension
order: 0
toc: content
---

LogicFlow Node Resize

## Introduction

LogicFlow currently includes built-in node types such as rectangle, circle, diamond, polygon, ellipse, and text. By inheriting these basic types, you can implement custom nodes and extend their functionality. Node resize is implemented through custom nodes. This article will provide a detailed explanation of the node resize feature's implementation.

### Supported Node Types

Currently, node resize supports the following node types:

- Rectangle
- Ellipse
- Diamond

**Why are these three node types supported?**

The most commonly used node types in flowcharts are rectangles, circles, and diamonds. Therefore, only these three common types are currently supported. If your system requires other types, you can refer to the ideas in this article to implement custom nodes.

**Why ellipse and not circle?**

An ellipse can be drawn as a circle by setting rx and ry to the same value. When you resize a circle, it becomes an ellipse. Therefore, ellipse resizing is implemented here.

## Resize Effect

Currently, resizing is performed by dragging at the four corners of the node's border. The effect is as follows. For information on how to use node resizing in your project, refer to the Node Resize Usage [Documentation](/en/tutorial/extension-node-resize).

<example href="/examples/#/extension/node-resize" :height="450" ></example>

## Implementation Approach

### Resize Operation

By inheriting the basic node type and overriding the node drawing method (getShape), four control points are added to the corners of the node to enable resizing by dragging these points. The implementation of the control points is consistent with `@logicflow/core` and uses `Preact` for drawing.

### Control Point Dragging

After dragging a control point, four aspects need to be adjusted:

- Node position (x, y)
- Node text position (textPosition)
- Node size (width, height or rx, ry for ellipses and diamonds)
- Connected edges and their paths (pointsList)

LogicFlow follows the MVVM pattern for drawing. Adjustments on the view are translated to updates in the model.

#### Node Position & Node Text Position
Based on the distance the control point is dragged, the node's center position and text position are moved half the distance accordingly.

```javascript
updatePosition = ({ deltaX, deltaY }) => {
  const { x, y } = this.nodeModel;
  this.nodeModel.x = x + deltaX / 2;
  this.nodeModel.y = y + deltaY / 2;
  this.nodeModel.moveText(deltaX / 2, deltaY / 2);
};
```

#### Node Size

Based on the distance the control point is dragged, the node's width and height are increased or decreased accordingly. For rectangles, the width and height are adjusted directly. For ellipses and diamonds, the rx and ry values are adjusted, and the width and height are computed automatically. The logic for distance increase based on the control point's position and movement is as follows:

**Index**: Control point order index, from left-top, right-top, right-bottom, to left-bottom.
**deltaX and deltaY**: Control point movement distance.
**pct**: Proportion for calculating width, height, rx, ry. For rectangles, this is 1. For ellipses and diamonds, this is 1/2.

```javascript
getResize = ({ index, deltaX, deltaY, width, height, pct = 1 }) => {
  const resize = { width, height };
  switch (index) {
    case 0:
      resize.width = width - deltaX * pct;
      resize.height = height - deltaY * pct;
      break;
    case 1:
      resize.width = width + deltaX * pct;
      resize.height = height - deltaY * pct;
      break;
    case 2:
      resize.width = width + deltaX;
      resize.height = height + deltaY * pct;
      break;
    case 3:
      resize.width = width - deltaX * pct;
      resize.height = height + deltaY * pct;
      break;
    default:
      break;
  }
  return resize;
};
```

After obtaining the resize, update the data as follows:

- For rectangles: width = resize.width and height = resize.height
- For ellipses: rx = resize.width and ry = resize.height
- For diamonds: rx = resize.width and ry = resize.height

#### Adjusting Connected Edges and Paths
When the node's position and size are updated, the paths of edges connected to the node must also be adjusted. If an edge is coming out of the node, simply update its starting point, and the path will automatically update. Similarly, for edges entering the node, update their end points. Here's an example for rectangles:

```javascript
let afterPoint;
const edges = this.getNodeEdges(id);
edges.sourceEdges.forEach((item) => {
  params.point = item.startPoint;
  afterPoint = getRectReizeEdgePoint(params);
  item.updateStartPoint(afterPoint);
});
edges.targetEdges.forEach((item) => {
  params.point = item.endPoint;
  afterPoint = getRectReizeEdgePoint(params);
  item.updateEndPoint(afterPoint);
});
```

After node resizing, the new coordinates of edge start and end points need to be calculated. The calculation is based on the position of the point relative to the node before resizing, for example, the angle with the center point or the relative position on a specific edge of the node. By calculating the proportion based on this relative position, the new coordinates after resizing can be determined. The detailed calculation methods for resizing edges are explained below for rectangles, ellipses, and diamonds.

## Edge Adjustment for Resizing

Rectangles, ellipses, and diamonds have different data structures and drawing logic. Therefore, the calculation methods for edge adjustment are different for each. This is the most complex part of implementing node resizing. The following sections will explain the detailed calculation methods for each type.

## Rectangles

Treating the center of the rectangle as the origin (0, 0), the endpoints are calculated for both the straight edges and rounded corners. The logic is as follows:

<img src="https://dpubstatic.udache.com/static/dpubimg/Vxibx5_JaH/rect1111.jpeg" alt="矩形" style="width: 50%; margin-left: 20%"/>

<img src="https://dpubstatic.udache.com/static/dpubimg/-2IFZJ7u8S/rectResize.jpeg" alt="矩形resize" style="width: 70%; margin-left: 15%"/>

### Ellipses
Treating the center of the ellipse as the origin (0, 0), the angle (θ) between the endpoint and the x-axis before resizing is calculated. After resizing, the new coordinates are computed while keeping the angle (θ) constant.
<img src="https://dpubstatic.udache.com/static/dpubimg/KGcedaNUOz/ellipseResize.jpeg" alt="椭圆resize" style="width: 70%; margin-left: 15%"/>

### Diamonds
Treating the center of the diamond as the origin (0, 0), the distance (L) between point P and point E is calculated. Then, the ratio (pct) of L to the distance NE is computed. After resizing, the ratio pct is kept constant, and the new coordinates are calculated. If the coordinates of point P are greater than 0, the reference point or computing the ratio is point E, and if the coordinates of point P are less than 0, the reference point for computing the ratio is point W. The logic is illustrated in the following diagram:
<img src="https://dpubstatic.udache.com/static/dpubimg/rYtOA0CC7V/diamondResize.jpeg" alt="菱形resize" style="width: 70%; margin-left: 15%"/>

## Customization Configuration
### Resize Range
Nodes can be configured with a resize range to limit the minimum and maximum sizes when dragging the control points. When the control points reach the maximum or minimum values, the node size will not change further. The supported configurations and their default values are as follows:

```javascript
sizeRange: {
  rect: {
    minWidth: 30,
    minHeight: 30,
    maxWidth: 300,
    maxHeight: 300,
  },
  ellipse: {
    minRx: 15,
    minRy: 15,
    maxRx: 150,
    maxRy: 150,
  },
  diamond: {
    minRx: 15,
    minRy: 15,
    maxRx: 150,
    maxRy: 150,
  },
},
```

### Dragging Step

When dragging with a step value of n, the node's coordinates will be updated by n/2. 
- The default step value is 2, which ensures that the node coordinates remain integers after resizing. 
- When a grid is set (e.g., for alignment), the default step value becomes 2 * grid. This may cause the node resizing to feel less smooth when the grid value is greater than 10. In such cases, you can manually adjust the step value to find the right balance between alignment and smoothness.

### Styles
After adding node resizing, the plugin sets some default theme styles to make the overall appearance more comfortable. You can override these styles to customize the appearance.

```javascript
lf.setTheme({
  rect: {
    strokeWidth: 2,
    outlineColor: "transparent",
  },
  ellipse: {
    strokeWidth: 2,
    outlineColor: "transparent",
  },
  diamond: {
    strokeWidth: 2,
    outlineColor: "transparent",
  },
});
```

For further customization, you can adjust the styles for the node's outline and control points. The supported styles and their default values are as follows:

```javascript
style: {
  outline: {
    stroke: '#000000',
    strokeWidth: 1,
    strokeDasharray: '3,3',
  },
  controlPoint: {
    width: 7,
    height: 7,
    fill: '#FFFFFF',
    stroke: '#000000',
  },
},
```

## Events

After node resizing, the node:resize event is defined and provides information about the node's basic information, size, and position before and after resizing. This enables the host system to perform additional operations if necessary.

## Custom Node Usage

To enable custom nodes to use the resizing feature, `RectResize`, `EllipseResize`, and `DiamondResize` are exported. Inheriting from `RectResize.model`, `RectResize.view`, etc., will allow you to implement resizing.

## Conclusion

The above explains the implementation approach for the node resize feature. If you have any ideas or suggestions regarding this plugin's implementation, feel free to discuss in the user group~
