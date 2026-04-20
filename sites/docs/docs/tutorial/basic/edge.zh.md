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

## 三种边的渲染形式

### 直线（line）

直线是最简单的边类型，通过 SVG 的 `<line>` 标签直接连接起点与终点，路径唯一确定。

**渲染特点**：

- 底层使用 SVG `<line>` 元素，`x1/y1` 为起点，`x2/y2` 为终点。
- 路径计算最简：只需 `startPoint` 和 `endPoint` 两个坐标。
- 选中区域（AppendWidth）：以直线为中轴，向两侧各扩展一定宽度，形成矩形点击区，方便用户选中细线。

```tsx | pure
// LineEdge 的 getEdge 核心渲染
getEdge() {
  const { model } = this.props
  const { startPoint, endPoint } = model
  return (
    <Line
      x1={startPoint.x}
      y1={startPoint.y}
      x2={endPoint.x}
      y2={endPoint.y}
    />
  )
}
```

### 折线（polyline）

折线（直角折线）是所有线段均为水平或垂直方向的多段线，通过 SVG 的 `<polyline>` 标签渲染多个折点。

**渲染特点**：

- 底层使用 SVG `<polyline>` 元素，通过 `points` 属性传入所有折点坐标（格式：`"x1,y1 x2,y2 x3,y3 ..."`）。
- 路径计算复杂：采用 A* 算法结合曼哈顿距离，自动绕过节点计算最优正交路径，结果存储在 `pointsList` 中。
- 选中区域（AppendWidth）：将折线拆分为每段线段，对每段单独计算矩形扩展区域并叠加。

```tsx | pure
// PolylineEdge 的 getEdge 核心渲染
getEdge() {
  const { model } = this.props
  const { points } = model // "x1,y1 x2,y2 x3,y3 ..."
  return (
    <Polyline
      points={points}
    />
  )
}
```

### 贝塞尔曲线（bezier）

贝塞尔曲线是三次贝塞尔曲线，通过 SVG `<path>` 的 `M...C...` 命令绘制光滑曲线。

**渲染特点**：

- 底层使用 SVG `<path>` 元素，路径格式为 `M startX startY C sNextX sNextY, ePreX ePreY, endX endY`。
- `pointsList` 固定包含 4 个点：**起点**、**起点控制点（sNext）**、**终点控制点（ePre）**、**终点**。
- 控制点的初始位置根据起终点所在节点的方位自动计算，使曲线尽量不与节点边框重叠。
- 选中区域（AppendWidth）：在相同路径上绘制一条宽度为 10、颜色透明的曲线，扩大点击范围。

```tsx | pure
// BezierEdgeModel 的路径生成
private getPath(points: Point[]): string {
  const [start, sNext, ePre, end] = points
  return `M ${start.x} ${start.y}
    C ${sNext.x} ${sNext.y},
    ${ePre.x} ${ePre.y},
    ${end.x} ${end.y}`
}
```

## 三种边的操作点区别

"操作点"是指边被选中后，用于调整边形态的交互控件。三种边均支持公共的起终点调整点，但各自还有独特的操作点。

### 公共操作：起终点调整点

三种边都支持起终点调整点，需在初始化时开启 `adjustEdgeStartAndEnd`：

```tsx | pure
const lf = new LogicFlow({
  adjustEdgeStartAndEnd: true, // 开启起终点调整功能
})
```

开启后，选中边时在**起点**和**终点**各显示一个圆形调整点，拖拽可将边重新连接到其他节点的锚点。

### 直线（line）的操作点

直线**仅有**起终点调整点，无法改变中间路径——因为两点之间直线唯一，没有可调整的中间段。

| 操作点 | 说明 |
|--------|------|
| 起点调整点（SOURCE） | 拖拽重新连接到其他节点锚点 |
| 终点调整点（TARGET） | 拖拽重新连接到其他节点锚点 |

### 折线（polyline）的操作点

折线除起终点调整点外，还支持**线段拖拽**。每个线段均有透明可拖拽区域（由 `getAppendWidth` 生成）：

- **水平线段**：只能沿垂直方向拖拽（纵向平移该段）；光标变为 `ns-resize`。
- **垂直线段**：只能沿水平方向拖拽（横向平移该段）；光标变为 `ew-resize`。

通过配置 `adjustEdgeMiddle` 可进一步限制只允许拖拽中间线段，防止连接节点的首尾段被意外移动：

```tsx | pure
const lf = new LogicFlow({
  adjustEdgeStartAndEnd: true,
  adjustEdgeMiddle: true, // 仅允许拖拽中间线段，首尾线段不可拖拽
})
```

| 操作点 | 说明 |
|--------|------|
| 起点调整点（SOURCE） | 拖拽重新连接到其他节点锚点 |
| 终点调整点（TARGET） | 拖拽重新连接到其他节点锚点 |
| 各线段拖拽区域 | 沿水平或垂直方向平移对应线段 |

### 贝塞尔曲线（bezier）的操作点

贝塞尔曲线除起终点调整点外，选中时还会显示**两个贝塞尔控制点**（`sNext` 和 `ePre`）及其辅助连线（由 `BezierAdjustOverlay` 渲染）：

- **sNext**（起点控制点）：通过辅助线与起点相连，拖拽可改变曲线起点侧的弯曲方向和幅度。
- **ePre**（终点控制点）：通过辅助线与终点相连，拖拽可改变曲线终点侧的弯曲方向和幅度。
- 两个控制点相互独立，可以单独调节。

```tsx | pure
// BezierAdjustOverlay 中的控制点渲染逻辑
getBezierAdjust(bezier: BezierEdgeModel, graphModel: GraphModel) {
  const [start, sNext, ePre, end] = getBezierPoints(bezier.path)
  return [
    // 起点侧：辅助线 + sNext 控制点
    <Line x1={start.x} y1={start.y} x2={sNext.x} y2={sNext.y} />,
    <BezierAdjustAnchor position={sNext} type="sNext" />,
    // 终点侧：辅助线 + ePre 控制点
    <Line x1={end.x} y1={end.y} x2={ePre.x} y2={ePre.y} />,
    <BezierAdjustAnchor position={ePre} type="ePre" />,
  ]
}
```

| 操作点 | 说明 |
|--------|------|
| 起点调整点（SOURCE） | 拖拽重新连接到其他节点锚点 |
| 终点调整点（TARGET） | 拖拽重新连接到其他节点锚点 |
| sNext（起点控制点） | 拖拽改变曲线起点侧的弯曲形态 |
| ePre（终点控制点） | 拖拽改变曲线终点侧的弯曲形态 |

### 操作点对比

| 操作点类型 | 直线 | 折线 | 贝塞尔曲线 |
|-----------|:----:|:----:|:----------:|
| 起点调整（SOURCE） | ✓ | ✓ | ✓ |
| 终点调整（TARGET） | ✓ | ✓ | ✓ |
| 线段拖拽（逐段移动） | ✗ | ✓ | ✗ |
| 贝塞尔控制点（sNext / ePre） | ✗ | ✗ | ✓ |

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
## 修改边样式
和节点的样式属性一样边样式也支持通过 [主题配置](../../api/theme.zh.md) 自定义边的样式则是它重新定义。

- 如果需要按照边的状态定义样式，可以把传递的参数放入`properties`中，在`getEdgeStyle`中判断`properties`中的参数，根据不同的参数返回不同的样式。
- 如果需要实现hover的效果，可以监听`edge:mouseenter`和`edge:mouseleave`事件，修改完`properties`中的参数，然后调用`edge.updateStyle()`方法更新边的样式。
- 不建议使用`setStyle`方法设置边的样式,这个方法一般用于插件开发时跳过自定义边的渲染。

<code id="edge-style" src="../../../src/tutorial/basic/edge/style"></code>
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

