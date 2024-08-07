---
nav: 指南
group:
  title: 基础
  order: 1
title: 边 Edge
order: 2
toc: content
---

和节点一样，LogicFlow 也内置一些基础的边。LogicFlow 的内置边包括:

1. 直线 - line
2. 直角折线 - polyline
3. 贝塞尔曲线 - bezier

效果如下：

<code id="edge-shapes" src="../../../src/tutorial/basic/edge/shapes"></code>

## 选择自定义边继承的内置边

```tsx | pure
// 直线
import { LineEdge, LineEdgeModel } from '@logicflow/core'
// 折线
import { PolylineEdge, PolylineEdgeModel } from '@logicflow/core'
// 贝塞尔曲线
import { BezierEdge, BezierEdgeModel } from '@logicflow/core'
```

## 基于继承的自定义边

和节点一样，LogicFlow 的边也支持基于继承的自定义机制。同样也只需同时继承`view`和`model`。
但是和节点不一样的是，由于边的编辑复杂度问题，绝大多数情况下，自定义边时不推荐自定义`view`。
只需要在自定义[edgeModel](../../api/edgeModel.zh.md)中样式类即可。

<code id="edge-custom" src="../../../src/tutorial/basic/edge/custom"></code>

:::info{title=提示}
自定义边同样需要使用`register`注册哦。
:::

## 自定义边文本位置

默认情况下，边上文本的位置是用户双击点击边时的位置。如果是通过 API 的方式给边添加的文本，文本位置按照如下规则。

- line: 起点和终点中间
- polyline: 最长线段中间
- bezier: 起点、终点、调整点中间

LogicFlow 支持开发者自定义文本位置，例如文本位置永远在边起点旁边。定义方式为将属性`customTextPosition`
设置为 true, 然后重写`getTextPosition`方法, 此方法发回的坐标就是文本的坐标。

<code id="edge-text" src="../../../src/tutorial/basic/edge/textPosition"></code>

## 自定义节点之间边的类型

默认情况下，通过从锚点手动连接节点生成的边为初始化`edgeType`
指定的类型，也可以通过`lf.setDefaultEdgeType(edgeType)`来指定。但是当需要不同的节点之间连接的边类型不一样时，就只有自定义节点之间边的类型了。

```tsx | pure
const lf = new LogicFlow({
  ...,
  // 手动设置默认边
  edgeType: 'bezier',
  // 移动已有边时会有 currentEdge 信息, 否则为空
  edgeGenerator: (sourceNode, targetNode, currentEdge) => {
    // 起始节点类型 rect 时使用 自定义的边 custom-edge
    if (sourceNode.type === 'rect') return 'custom-edge'
  }
})

```

## 自定义箭头

在`1.1.27`版本后，LogicFlow 支持单独自定义连线两端的箭头。和之前的自定义方式一样，支持通过主题自定义大小等基本数据和通过重写对应的方法实现完全的自定义。

### 主题设置

```tsx | pure
lf.setTheme({
  arrow: {
    offset: 4, // 箭头垂线长度
    verticalLength: 2, // 箭头底线长度
  },
});
```

### 自定义箭头形状

在自定义连线 view 的时候，可以重写`getEndArrow`和`getStartArrow`
方法来实现自定义连线两端的图形，这两个方法可以返回的任意`svg`图形。

这里以通过连线属性中的 arrowType 来控制连线不同的外观为例。

<code id="custom-arrow" src="../../../src/tutorial/basic/edge/arrow"></code>

### 自定义调整点样式

在初始化 LogicFlow 实例的时候,可以通过参数`adjustEdgeStartAndEnd`来开启调整边的起始点和结束点的功能。

在自定义连线 view 的时候，可以重写`getAdjustPointShape`方法来实现自定义调整点的样式。

```tsx | pure
// lf.js
const lf = new LogicFlow({
  adjustEdgeStartAndEnd: true,
});

// edge.js
class CustomEdge extends LineEdge {
  getAdjustPointShape(x, y, edgeModel) {
    return h("g", {}, [
      h("image", {
        x: x - 9,
        y: y - 9,
        width: 18,
        height: 18,
        cursor: "move",
        href: "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMnB4IiBoZWlnaHQ9IjIycHgiIHZlcnNpb249IjEuMSI+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iNyIgc3Ryb2tlPSIjZmZmIiBmaWxsPSIjMjliNmYyIi8+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iMyIgc3Ryb2tlPSIjZmZmIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjwvc3ZnPg==",
      }),
    ]);
  }
}
```

<a href="https://codesandbox.io/embed/logicflow026-edgeanimation-forked-fdg3v0?fontsize=14&hidenavigation=1&theme=dark" target="_blank"> 去 CodeSandbox 查看示例</a>

