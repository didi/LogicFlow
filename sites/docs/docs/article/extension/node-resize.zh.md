---
title: 节点缩放
order: 0
toc: content
---

LogicFlow 节点缩放

## 前言

LogicFlow 目前内置的节点类型有矩形、圆形、菱形、多边形、椭圆、文本。通过继承这些基本类型可以实现自定义节点，对其功能进行扩展。
节点缩放就是通过自定义节点方式实现的，本文将详细介绍节点缩放功能的实现方案。

## 支持的节点类型

目前节点缩放支持的节点类型如下：

- 矩形
- 椭圆
- 菱形

**为什么要实现这 3 种节点类型呢?**  
流程图中常用的节点类型是矩形、圆形、菱形，因此仅目前仅支持了 3 种比较常用的。如果你的系统需要其他类型，可以参考本文的思路，自定义节点实现。

**为什么是椭圆不是圆形?**  
椭圆可以通过将 rx，ry 设置为相同的值来绘制圆形，圆形改变大小会变成椭圆，因此这里对椭圆的缩放实现。

## 缩放效果

目前缩放是在节点边框四角方向上，通过拖拽进行大小调整，效果如下。想要了解如何在项目中使用参考[节点缩放使用文档](/tutorial/extension-node-resize)

<example href="/examples/#/extension/node-resize" :height="450" ></example>

## 缩放实现方案

### 缩放操作

通过继承基础类型节点，重写节点绘制方法(getShape), 在节点四角上增加四个控制点，点击控制点拖拽进行缩放。
控制点的实现与@logicflow/core 保持一致，基于 Preact 进行绘制。

### 控制点拖拽

控制点拖拽后，需要有 4 方面的调整

- 节点位置(x,y)
- 节点文案位置(textPosition)
- 节点大小(width,height/rx,ry)
- 与节点相连的边，路径调整(pointsList)

LogicFlow 的绘制是 MVVM 模式，绘制(view)上的调整，更新数据(model)即可。

#### 节点位置 & 节点文案位置

根据控制点移动的距离，节点中心点位置和文案位置移动对应一半的距离。

```js
updatePosition = ({ deltaX, deltaY }) => {
  const { x, y } = this.nodeModel;
  this.nodeModel.x = x + deltaX / 2;
  this.nodeModel.y = y + deltaY / 2;
  this.nodeModel.moveText(deltaX / 2, deltaY / 2);
};
```

#### 节点大小

根据控制点移动的距离，节点的宽高对应增加或较少对应的距离。矩形修改其宽高，菱形和椭圆修改其 rx/ry 取值，菱形和椭圆的宽高是以及 rx/ry 得到的计算属性，自动更新。距离增加逻辑根据控制点 (control) 位置，以及移动我位置计算方式如下。  
**index**: 控制点顺序 index, 顺序如下【左上，右上，右下，左下】  
**deltaX/deltaY**: 控制点移动位置  
**pct**: width, height, rx, ry 需要计算的比例，矩形为 1，椭圆菱形为 1/2。

```js
// 计算control拖动后，节点的宽高
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

得到 resize 之后，更新数据。

- 矩形: width = resize.width; height = resize.height;
- 椭圆: rx = resize.width; ry = resize.height;
- 菱形: rx = resize.width; ry = resize.height;

#### 与节点相连的边，路径调整

当节点位置和大小更新之后，如果节点与其他节点之间存在边，那么边的路径也要做相对的调整。当边从节点连出时，根据边提供的方法，只需要更新边起点位置，路径就会自动更新，同理边连入节点时，更新边重点位置即可。以矩形为例如下：

```js
let afterPoint;
// 获取所有与节点相连的边
const edges = this.getNodeEdges(id);
// 更新从节点连出边的起点
edges.sourceEdges.forEach((item) => {
  params.point = item.startPoint;
  afterPoint = getRectReizeEdgePoint(params);
  item.updateStartPoint(afterPoint);
});
// 更新连入节点边的终点
edges.targetEdges.forEach((item) => {
  params.point = item.endPoint;
  afterPoint = getRectReizeEdgePoint(params);
  item.updateEndPoint(afterPoint);
});
```

节点缩放后，需要计算边起点终点的新坐标，计算思路是获取节点在缩放前在节点上的的相对位置，例如：与中心点的夹角、在节点某条边框的相对位置等，依据该相对位置比例，计算节点缩放后的该点的新坐标。缩放边调整部分介绍详细的计算方法。

## 缩放边调整

矩形、椭圆、菱形在图形数据和绘制上不同，因此计算方法不同，这也是节点缩放实现最复杂的部分，下面将分别介绍详细的计算方法。

### 矩形

将矩形中心当做中心点(0,0)，矩形支持 radius 取值，存在圆角矩形，将端点在矩形直线边和圆角两种情况进行计算，逻辑如下。  
<img src="https://dpubstatic.udache.com/static/dpubimg/Vxibx5_JaH/rect1111.jpeg" alt="矩形" style="width: 50%; margin-left: 20%"/>
<img src="https://dpubstatic.udache.com/static/dpubimg/-2IFZJ7u8S/rectResize.jpeg" alt="矩形resize" style="width: 70%; margin-left: 15%"/>

### 椭圆

将椭圆中心当做中心点(0,0)，计算缩放前边的端点与 X 轴的夹角 θ，缩放后保持夹角 θ 不变计算新坐标。
<img src="https://dpubstatic.udache.com/static/dpubimg/KGcedaNUOz/ellipseResize.jpeg" alt="椭圆resize" style="width: 70%; margin-left: 15%"/>

### 菱形

将菱形中心当做中心点(0,0), 如下图所示，首先计算点 P 到点 E 的距离 L，然后计算出 L 占 NE 距离的比例 pct，缩放后保持 pct 不变计算新坐标。当点 P 坐标大于 0 时以点 E 作为参考点进行比例计算，当点 P 坐标小于 0 时，以点 W 作为参考点进行比例计算。
<img src="https://dpubstatic.udache.com/static/dpubimg/rYtOA0CC7V/diamondResize.jpeg" alt="菱形resize" style="width: 70%; margin-left: 15%"/>

## 个性化配置

### 缩放范围

节点设置缩放的范围，当拖动控制点调整大小达到最大或最小值时，节点大小不会再改变，支持的配置以及默认取值如下。

```js
   // 缩放范围
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

### 拖动 step

当拖动 step=n 时候，节点坐标会更新 step/2= n/2。step 默认取值为 2，当设置了网格 grid 之后，默认取值为 2 \* grid。

- 默认取值为 2，是为了保证缩放后节点坐标为证书
- 设置了 grid 之后，为了能够保证能够依然高效实用对齐线功能，因此 step 默认设置为 2 \* grid，由此也会带来一些问题，当 grid 取值为 10 以上的值时，操作上会感觉节点缩放不太流畅。这个时候也可以手动修改 step 值，这个时候需要宿主系统功能上做下权衡取舍。

### 样式

增加节点调整后，为了使整体样式个更加舒适，在插件内部设置了节点的主题样式，宿主可以对其进行覆盖设置。

```js
// 设置默认样式，主要将outlineColor设置为透明，不再展示core包中默认的节点外框
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

为了能让宿主自由调整一些样式，支持节点缩放边框以及控制点样式调整，支持的样式以及默认值如下。

```js
// 边框和contol拖动点样式的设置
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

## 事件

节点缩放后，定义了 `node:resize` 事件，并抛出节点缩放前和缩放后的基础信息、大小、位置信息，方便宿主可以进行其他操作。

## 自定义节点使用

为了能够使自定义节点使用缩放功能，内部将 `RectResize`, `EllipseResize` , `DiamondResize` 导出，通过继承 `RectResize.model` , `RectResize.view` 等实现缩放。

## 最后

以上介绍了节点缩放功能的实现方案，如果对此插件实现有想法的同学，欢迎在用户群交流~。
