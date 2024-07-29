---
nav: API
title: 主题
toc: content
order: 2
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

主题可以对 LogicFlow
基础图形的外观进行统一设置。其属性与<a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute" target="_blank">svg 属性</a>
保持一致。
大多数情况下，我们只需要设置一些常用属性即可。

## 常用属性

- <a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke" target="_blank">stroke</a>属性定义了给定图形元素的外轮廓的颜色。
- <a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-dasharray" target="_blank">stroke-dasharray</a>
  属性可控制用来描边的点划线的图案范式。
- <a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-width" target="_blank">stroke-width</a> 
  属性指定了当前对象的轮廓的宽度。
- <a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/fill" target="_blank">fill</a> 属性用来定义给定图形元素内部的颜色。
- <a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/fill-opacity" target="_blank">fill-opacity</a> 属性指定了填色的不透明度或当前对象的内容物的不透明度。
- <a href="https://developer.mozilla.org/en/docs/Web/SVG/Attribute/font-size" target="_blank">font-size</a>属性定义文本字体大小。
- <a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/color" target="_blank">color</a>属性定义文本颜色。

由于 LogicFlow 推荐在实际业务中完全自定义节点的外观和样式，所以 LogicFlow
本身内置的主题样式只包含极少数必须的样式。开发者可以基于自己业务场景对其进行重新定义和扩展。

## 形状属性

LogicFlow 将`width`、`height`、`r`这些影响节点大小的属性叫做`形状属性`, `形状属性`
会影响锚点位置、连线计算。所以不支持在主题中配置，只支持在自定义时配置，详情见[NodeModel 形状属性](./model/nodeModel.zh.md#形状属性)。

## setTheme 设置

| 类型       | 名称                                    |
|:---------|:-----------------------------------------|
| 节点       | - [baseNode](#basenode) <br> - [rect](#rect) <br> - [circle](#circle) <br> - [diamond](#diamond) <br> - [ellipse](#ellipse) <br> - [polygon](#polygon) <br> - [text](#text) |
| 锚点       | [anchor](#anchor)                              |
| 文本       | - [nodeText](#nodetext) <br> - [edgeText](#edgetext)     |
| 线        | -[baseEdge](#baseedge) <br> - [line](#line) <br> - [polyline](#polyline) <br> - [bezier](#bezier)                                     |
| 对齐线      | [snapline](#snapline)          |
| 锚点拖出线    | [anchorLine](#anchorline)     |
| 箭头       | [arrow](#arrow)                 |
| 连线两端调整点 | [edgeAdjust](#edgeadjust)     |
| 选中/hover | [outline](#outline)             |

### baseNode

LogicFlow 内置所有的节点都是白色填充，黑色 2 边框。

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

LogicFlow 内置`rect`节点都是白色填充，黑色 2 边框。

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

LogicFlow 内置`circle`节点都是白色填充，黑色 2 边框。

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

LogicFlow 内置`diamond`节点都是白色填充，黑色 2 边框。

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

LogicFlow 内置`ellipse`节点都是白色填充，黑色 2 边框。

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

LogicFlow 内置`polygon`节点都是白色填充，黑色 2 边框。

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

LogicFlow 内置`text`节点字体大小为 12, 颜色为黑色。

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

LogicFlow 内置的锚点是一个半径为 4 的圆。在 hover 状态下回显示一个半径为 10 的圆。

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

LogicFlow 内置的节点文本

- `overflowMode`: 用于控制节点文本超出节点后的显示效果:
  - `default`为默认，即超出不处理。
  - `autoWrap`为超出了自动换行。
  - `ellipsis`为超出了隐藏，显示省略符号。

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

LogicFlow 内置所有的连线都是黑色连线，宽 2。

```tsx | pure
lf.setTheme({
  baseEdge: {
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### line

LogicFlow 内置`line`都是黑色连线，宽 2。

```tsx | pure
lf.setTheme({
  line: {
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### polyline

LogicFlow 内置`polyline`都是黑色连线，宽 2。

```tsx | pure
lf.setTheme({
  polyline: {
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### bezier

LogicFlow 内置`bezier`都是黑色连线，宽 2。

- `adjustLine`: 曲线调整手柄的样式。
- `adjustAnchor`: 曲线调整点的样式。

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

LogicFlow 内置的连线文本

- `textWidth`: 用于控制连线文本最大宽度。
- `overflowMode`: 用于控制连线文本超出节点后的显示效果。
  - `default`为默认，即超出不处理。
  - `autoWrap`为超出了自动换行。
  - `ellipsis`为超出了隐藏，显示省略符号。
- `background`: 用于控制连线文本对应的背景。

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

箭头的样式

- `offset`: 箭头长度
- `verticalLength`: 箭头垂直于边的距离

```tsx | pure
lf.setTheme({
  arrow: {
    offset: 10,
    verticalLength: 5,
  },
});
```

### anchorLine

在连线是，从锚点拖出的直线样式

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

对齐线样式

```tsx | pure
lf.setTheme({
  snapline: {
    stroke: "#949494",
    strokeWidth: 1,
  },
});
```

### edgeAdjust

当设置允许调整连线起点和终点时，连线两端调整点样式。

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

节点和连线选中或者 hover 状态下的状态框样式。

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
