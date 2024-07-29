---
nav: API
title: Theme
toc: content
order: 2
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

Themes allow you to set the appearance of LogicFlow base graphics in a uniform way. Its properties
are consistent with <a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute" target="_blank">svg properties</a> In most cases, we only need to set a few common properties.

## Common Properties

- <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke" target="_blank">stroke</a> attribute defines the color of the outer outline of the given graphic element.
- <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray" target="_blank">stroke-dasharray</a> property controls the pattern paradigm of the dotted lines used to stroke.
- <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-width" target="_blank">stroke-width</a> property specifies the width of the outline of the current object.
- <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill" target="_blank">fill</a> attribute is used to define the color of the interior of a given graphic element.
- <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-opacity" target="_blank">fill-opacity</a> property specifies the opacity of the fill color or the opacity of the contents of the current object.
- <a href="https://developer.mozilla.org/en/docs/Web/SVG/Attribute/font-size" target="_blank">font-size</a> property defines the text font size.
- <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/color" target="_blank">color</a> attribute defines the text color.

Since LogicFlow recommends fully customizing the appearance and style of nodes in real business, the
built-in theme styles in LogicFlow itself contain only a few essential styles. Developers can
redefine and extend them based on their own business scenarios.

## Shape Attributes

LogicFlow calls `width`, `height`, `r` attributes that affect the size of nodes
as `shape attributes`, `shape attributes` affect the position of anchors and the calculation of
lines. Therefore, they are not supported to be configured in themes, but only in customization,
see [NodeModel Shape Attributes](./model/nodeModel.en.md#shape-attributes) for details.

## setTheme set

| Type                                       | Name                                                                                                  |
|:-------------------------------------------|:------------------------------------------------------------------------------------------------------|
| node                                       | - [baseNode](#basenode) <br> - [rect](#rect) <br> - [circle](#circle) <br> - [diamond](#diamond) <br> - [ellipse](#ellipse) <br> - [polygon](#polygon) <br> - [text](#text) |
| anchor                                     | [anchor](#anchor)                                                                                     |
| text                                       | - [nodeText](#nodetext) <br> - [edgeText](#edgetext)                                                  |
| edge                                       | - [baseEdge](#baseedge) <br> - [line](#line) <br> - [polyline](#polyline) <br> - [bezier](#bezier)  |
| snapline                                   | [snapline](#snapline)                                                                               |
| anchorLine                                 | [anchorLine](#anchorline)                                                                           |
| arrow                                      | [arrow](#arrow)                                                                                     |
| Adjustment points at both ends of the line | [edgeAdjust](#edgeadjust)                                                                           |
| choose/hover                               | [outline](#outline)                                                                               |


### baseNode

All nodes built into LogicFlow are white filled with a black 2 border.

```tsx | pure
lf.setTheme({
  baseNode: {
    fill: "#FFFFFF",
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### rect

LogicFlow's built-in `rect` nodes are all white filled with a black 2-sided border.

```tsx | pure
lf.setTheme({
  rect: {
    fill: "#FFFFFF",
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### circle

LogicFlow's built-in `circle` nodes are all white filled with black 2 borders.

```tsx | pure
lf.setTheme({
  circle: {
    fill: "#FFFFFF",
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### diamond

LogicFlow's built-in `diamond` nodes are all white filled with black 2 borders.

```tsx | pure
lf.setTheme({
  diamond: {
    fill: "#FFFFFF",
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### ellipse

LogicFlow's built-in `ellipse` nodes are all white filled with black 2 borders.

```tsx | pure
lf.setTheme({
  ellipse: {
    fill: "#FFFFFF",
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### polygon

LogicFlow's built-in `polygon` nodes are all white filled with black 2 borders.

```tsx | pure
lf.setTheme({
  polygon: {
    fill: "#FFFFFF",
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### text

LogicFlow's built-in `text` node has a font size of 12 and a black color.

```tsx | pure
lf.setTheme({
  text: {
    color: "#000000",
    fontSize: 12,
    background: {
      fill: "transparent",
    },
  },
});
```

### anchor

LogicFlow's built-in anchor is a circle with a radius of 4. A circle with a radius of 10 is
displayed in the hover state.

```tsx | pure
lf.setTheme({
  anchor: {
    stroke: "#000000",
    fill: "#FFFFFF",
    r: 4,
    hover: {
      fill: "#949494",
      fillOpacity: 0.5,
      stroke: "#949494",
      r: 10,
    },
  },
});
```

### nodeText

LogicFlow's built-in node text

- `overflowMode`: control how the node text will be displayed when it exceeds the node: `default` is
  the default, it is not processed.
  - `default` is the default, the node text will not be processed when it exceeds the node.
  - `autoWrap` is the default, no processing if the node is exceeded.
  - `ellipsis` is to hide and show ellipsis if it is exceeded.

```tsx | pure
lf.setTheme({
  nodeText: {
    color: "#000000",
    overflowMode: "default",
    lineHeight: 1.2,
    fontSize: 12,
  },
});
```

### baseEdge

All wires built into LogicFlow are black wires, 2 wide.

```tsx | pure
lf.setTheme({
  baseEdge: {
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### line

LogicFlow's built-in `lines` are all black and 2 wide.

```tsx | pure
lf.setTheme({
  line: {
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### polyline

LogicFlow's built-in `polylines` are all black and 2 wide.

```tsx | pure
lf.setTheme({
  polyline: {
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### bezier

LogicFlow's built-in `bezier` are black lines, 2 wide.

- `adjustLine`: The style of the curve adjustment handle.
- `adjustAnchor`: The style of the curve adjustment point.

```tsx | pure
lf.setTheme({
  bezier: {
    fill: "none",
    stroke: "#000000",
    strokeWidth: 2,
    adjustLine: {
      stroke: "#949494",
    },
    adjustAnchor: {
      r: 4,
      fill: "#949494",
      stroke: "#949494",
      fillOpacity: 1,
    },
  },
});
```

### edgeText

LogicFlow's built-in line text

- `textWidth`: control the maximum width of the line text.
- `overflowMode`: control the display effect when the line text exceeds the node.
  - `default` is the default, i.e. the overflow will not be processed.
  - `autoWrap` is the default, i.e. if the text exceeds the node, it will not be processed.
  - `ellipsis` is the default, i.e., if it is exceeded, the ellipsis symbol will be hidden and
    displayed.
- `background`: control the background of the linked text.

```tsx | pure
lf.setTheme({
  edgeText: {
    textWidth: 100,
    overflowMode: "default",
    fontSize: 12,
    background: {
      fill: "#FFFFFF",
    },
  },
});
```

### arrow

Arrow styles

- `offset`: length of the arrow
- `verticalLength`: distance of the arrow perpendicular to the edge

```tsx | pure
lf.setTheme({
  arrow: {
    offset: 10,
    verticalLength: 5,
  },
});
```

### anchorLine

In the connecting line is, the straight line style dragged from the anchor point.

```tsx | pure
lf.setTheme({
  anchorLine: {
    stroke: "#000000",
    strokeWidth: 2,
    strokeDasharray: "3,2",
  },
});
```

### snapline

Alignment line style.

```tsx | pure
lf.setTheme({
  snapline: {
    stroke: "#949494",
    strokeWidth: 1,
  },
});
```

### edgeAdjust

Adjustment point styles at both ends of the line when the setting allows adjustment of the start and
end points of the line.

```tsx | pure
lf.setTheme({
  edgeAdjust: {
    r: 4,
    fill: "#FFFFFF",
    stroke: "#949494",
    strokeWidth: 2,
  },
});
```

### outline

The style of the status box when nodes and links are selected or hovered.

```tsx | pure
lf.setTheme({
  outline: {
    fill: "transparent",
    stroke: "#949494",
    strokeDasharray: "3,3",
    hover: {
      stroke: "#949494",
    },
  },
});
```
