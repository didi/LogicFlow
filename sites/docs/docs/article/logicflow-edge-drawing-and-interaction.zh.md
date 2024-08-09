---
title: 边的绘制与交互
order: 3
toc: content
---

LogicFlow 边的绘制与交互

## 前言
[LogicFlow](https://github.com/didi/LogicFlow/) 是专注于业务的流程图可视化编辑框架（以下简称 LF），在这之前我们分别介绍了 LF 的[整体设计](https://juejin.cn/post/6933413834682007560)和[扩展机制](https://juejin.cn/post/6938319455529369636)，今天我们来聊一聊流程图中比较核心的一个概念 —— 边（Edge）。

首先，流程图中的元素主要由节点和边组成，边在 LF 中承担的角色是建立节点之间的关系。不同场景对图的布局和美观度都有要求，目前， LF 中提供了直线、折线、曲线 3 种类型的线来满足不同的需求。如下图所示。

![line](https://github.com/didi/LogicFlow/assets/27529822/8a95dd1b-b227-420b-a34c-342865455b76)

此外，边的基础功能包括路径绘制、箭头、文案，为了丰富操作还包括选中、调整等功能。本文将会介绍直线、折线、曲线的绘制，边文案设置，选中区域扩大，选中状态标识，位置调整，样式调整等实现思路和功能设计。

为了方便理解，先对一些名词和功能做下解释。
**绘制**：绘制线的形状。
**选中区域扩大**：一般边设置的宽度较小( 1 - 2px)，精确点击进行选中的实际操作比较困难，将选中区域扩大之后，可以使边更容易被鼠标选中。
**选中状态标识**：将选中的边与其他边进行区分标识。
**位置调整**：边的创建是通过锚点进行连接，自动计算其路径，但是路径会存在一些固定计算的弊端，可以通过手动调整位置，达到视觉最优。
**边文案设置**：边上设置文案丰富信息表达。
**样式调整**：系统提供了边的默认样式，例如：边的颜色为 #000000，宽度为 2px，如果不同宿主系统的需要不同风格，LF 中也提供了样式调整的方法。

LF 中提了供直线、直角折线、光滑曲线 3 种类型的边，本文将逐一介绍相关的实现思路。

## 直线
两点确定一条直线，仅需要边的起点和终点即可绘制出直线，在 LF 中使用 svg 的 `<line/>` 进行绘制。

![apply](https://github.com/didi/LogicFlow/assets/27529822/b7a159ec-b6ed-449c-a0e8-c91f85241066)

选中区域扩大是在直线上增加矩形来实现的，以与两个端点相邻距离为 10 的点为垂点，计算与垂点距离为 5，垂直于直线两边的点，结果可以得到 4 个点组成一个矩形，因计算结果为 4 点坐标，使用了 path 标签进行渲染。目前直线不支持起始位置的调整。

![line_clickable](https://github.com/didi/LogicFlow/assets/27529822/17df92e8-8e31-45d4-b77b-99bc0c5c2e70)
> 图中紫色为直线扩大的可点区域

ps：为什么要设置 offset = 10，而不是 offset = 0，或者使用绘制一样的图形加大宽度 (stroke-width) 进行实现呢？考虑到后面会有边起点、终点位置调整，以及扩展功能，这样的方式更加灵活和可控。
## 直角折线
两点之间如果仅使用直线进行连接，当节点数量增多，位置关系复杂时，会出现大量边和节点交叉和重合的现象，为了更加清晰的表达节点之间的关系，LF 支持直角折线来连接两个节点。
在 LF 中直角折线使用 svg 中的 polyline 标签进行绘制，关键步骤是找出组成折线的点。考虑美观性，策略为边尽量不与节点的边产生交叉和重合。
首先假定使用节点上锚点 Start —> 锚点 End 进行连接，以下面的图为例介绍，如何计算直角折线路径的点。

![orth_polyline](https://github.com/didi/LogicFlow/assets/27529822/ca4f8770-eed4-4bde-a43b-38bf3024b1c6)


第一步：计算以 Start 和 End 为垂足，垂直于的 Start 和 End 所在边框且距离为100的点，如下图所示，先计算出与 Start 所在节点边框距离为 100 的 SBbox，在 SBbox 上可以找到垂直于的 Start，且与其所在节点边框距离为 100 的点，这个点即为 Start 的下一个点，将其命名为 StartNext。同理可得点 EndPre。本次计算得到四个点，[Start, StartNext, EndPre, End]，这些点为路径确定经过的点。

![points1](https://github.com/didi/LogicFlow/assets/27529822/0cef701e-0ceb-4bdd-8270-63ef096e1b1e)

第二步：将包含 StartNext 和 EndPre 边的盒子命名为 LBox，包含 SBbox 和 LBbox 的盒子命名为 SLBbox，包含 EBbox 和 LBbox 的盒子命名为 ELBbox，取 SLBbox 和 ELBbox 四个角上的点，即图中蓝色的点，这些点为折线路径中可能经过的点。这一步得到的可能的点为【蓝色的点】

![points2](https://github.com/didi/LogicFlow/assets/27529822/3a35a287-eb71-49f7-9403-f8a066b2e2ff)

第三步：找出 StartNext 和 EndPre 的中点，下图中绿点，找出中点X，Y 轴上直线与 LBbox、SLBbox、ELBbox 相交，且不在 SBbox 和 EBbox 中的点，即为图中紫色的点，这些点为折线路径中可能经过的点。这一步得到的可能的点为【紫色的点】

![points3](https://github.com/didi/LogicFlow/assets/27529822/f970ff32-ec72-4442-81f2-ec622d71ccdf)

第四步：将前面三步得到的点汇总，然后对相同坐标的点进行去重，将会得到如下图中红色的点，接下来就是求 StartNext 到 EndPre 的最优路径。

![points4](https://github.com/didi/LogicFlow/assets/27529822/b66c616d-42dc-474e-b11d-6a98e2e244d1)

第五步：采用 [A*查找](https://baike.baidu.com/item/A%2A%E7%AE%97%E6%B3%95/215793?fr=aladdin) 结合 [曼哈顿距离](https://baike.baidu.com/item/%E6%9B%BC%E5%93%88%E9%A1%BF%E8%B7%9D%E7%A6%BB/743092?fr=aladdin)计算路径，得到如图所示路径。

![points5](https://github.com/didi/LogicFlow/assets/27529822/f9dc1daa-8f8d-4bad-b8ce-cf48206236a9)

第六步：过滤同一直线上的中间节点，得到如下点，并连接成折线，至此折线路径部分绘制完成。

![find_path](https://github.com/didi/LogicFlow/assets/27529822/f67d063b-5232-4bb2-a1c7-154993871dd8)

以上介绍了当两个节点之间存在一定距离，即 SBbox 与 EBbox 不存在重合时，路径计算的方法，这也是大部分绘图会涉及到的情景。当两个节点距离较近时，将采用其他简单策略来进行直角折线的实现，本文不做详细介绍。
折线点击区域扩大的实现，是将折线分成多个线段，每个线段采用与直线同样的方式。详细介绍可参考直线部分。示例如下如：

![polyline_clickable](https://github.com/didi/LogicFlow/assets/27529822/0a6d835e-3334-4677-a15f-e936424c7c28)

> 图中紫色为折线扩大的可点区域

将折现分成多个线段分别处理，同时也方便了折线的位置调整。目前LF中可以对折线中的各个线段，进行水平/垂直方向的移动调整。
LF中线段位置调整是根据移动位置，实时重新计算路径的方式实现的。步骤如下：
第一步：根据移动坐标，计算出当前线段两个端点拖拽移动后的坐标。
第二步：计算拖拽移动调整后，线段与节点外框的交点。 
- 如果移动前线段没有连接起点、终点，去掉线段会穿插在节点内部的部分，取整个节点离线段最近的点为交点。
- 如果移动前线段连接了起点, 判断线段端点是否在节点上，如果不在节点上，更换起点为线段与节点的交点。
- 如果移动前线段连接了终点, 判断线段端点是否在节点上，如果不在节点上，更换终点为线段与节点的交点。 

第三步：调整到对应外框的位置后，找到当前线段和图形的准确交点，更新路径。
以下图为矩形和圆形垂直向下调整为示例，调整效果如下。

![adjustment](https://github.com/didi/LogicFlow/assets/27529822/9f1b9b91-4df6-4d76-9994-618afbaac59d)

## 光滑曲线
LF 也提供了曲线的方式来绘制边。LF 是基于 svg 进行绘制的，svg 中 path 标签天然支持对于贝塞尔曲线的绘制，为了减少计算，LF 中的光滑曲线是基于贝塞尔曲线实现的，贝塞尔曲线可以依据四个任意坐标的点绘制出的一条光滑曲线，通过控制曲线上的四个点（起点、终点以及两个相互分离的中间支点）来创建、编辑图形。在LF中可以通过移动两个支点的位置来进行曲线形状调整。

![cubic_bezier](https://github.com/didi/LogicFlow/assets/27529822/ff343012-0c54-4366-8ff2-68c05ea67a54)

为了绘制贝塞尔曲线，需要计算出控制曲线上的四个点，其中起点和终点是已知的，关键点是如何计算出 2 个中间支点，为了图的美观性，线与节点的边框最大程度不产生重合，以及计算复杂度，实现步骤如下：
第一步：计算出节点边框的相关坐标
- 中心点X坐标
- 中心点Y坐标
- 最大X轴坐标
- 最小X轴坐标
- 最大Y轴坐标
- 最小Y轴坐标
第二步：计算出节点距离节点边框 offset = 100 的外框的相关坐标，
- 中心点X坐标
- 中心点Y坐标
- 最大X轴坐标
- 最小X轴坐标
- 最大Y轴坐标
- 最小Y轴坐标
第三步：判断中心点与起点所在线段的方向（水平/垂直），在中心点与起点相同的方向上计算距离起点距离 offset = 100 对应的支点，这个支点就在第二步描述的节点外框上，以上图示例，根据其位置，取节点外框中的点（坐标为：x: 最大X轴坐标，y: 中心点Y坐标）为支点。同理可以计算出终点对应的支点。此方法与查找折线路径中 StartNext 和 EndPre 相同。
第四步：得到两个支点后，结合起点和终点，使用 path 标签进行绘制。
曲线绘制效果如下，其中蓝色圆形即为其支点，可以通过移动支点位置，调整线的形状。

![adjust_controll_points](https://github.com/didi/LogicFlow/assets/27529822/f37c56d6-9254-4cad-953c-62ee080819b0)

扩大贝塞尔曲线的选中区域，绘制相同位置的曲线，但是样式属性如下的贝塞尔曲线：

```js
strokeWidth="10"

stroke="transparent"

fill="none"
```
扩大区域是一个宽度增加 10 的贝塞尔曲线。

![bezier_clickable](https://github.com/didi/LogicFlow/assets/27529822/94b1cdcd-5cca-46c1-a706-4e2c38f35d19)

> 图中紫色为贝塞尔曲线扩大的可点区域

## 箭头
流程图中箭头标明了流程节点的指向，在 LF 中直线、折线、曲线的箭头使用统一方案实现，在 LF 中的箭头本质是一个包含终点的三角形，其中终点是确定的，需要计算另外 2 点组成三角形。
- 找出边的末端切向量线段。
直线：起点到终点的向量
折线：折线中最后一个线段的向量
曲线：曲线中一共有 4 个点，取终点对应的支点到终点的向量
- 计算三角形另外 2 点
以与终点相邻距离为10的点为垂点，计算垂直于向量与垂点距离为5的两点点，结果可以得到 3 个点组成三角形，即为箭头。如下如所示，箭头大小可以通过主题样式设置 offset 和 verticalLength 来进行宽高调整。

![arrow](https://github.com/didi/LogicFlow/assets/27529822/6ea8f167-22d0-4c2a-949c-41cd05eb948a)

目前在LF中边仅支持单向箭头，且箭头样式仅为三角形，后续会继续丰富箭头的能力展现。

## 边的选中标识
边的选中是通过一个能够包含边的所有点的矩形进行标识的。通过计算出矩形坐标以及大小信息：x, y, width, height，然后进行渲染，这些选中标识与节点是在不同的 svg 图层中进行绘制的，LF 是基于 MVVM (具体可参考[滴滴开源 LogicFlow：专注流程可视化的前端框架](https://juejin.cn/post/6933413834682007560))，可以很方便的通过数据驱动进行分层渲染，同样节点的选中标识也是相似的分层方式实现，这样可以更加灵活的处理不同模式和条件下的渲染，同时下载图片时也方便进行选中标识图层的剔除，得到更加纯粹干净的图。直线、折线、曲线因其路径计算的差异，选中标识计算方法也有所不同。

直线的计算逻辑如下：

- startPoint：起点
- endPoint：终点

```js
const x = (startPoint.x + endPoint.x) / 2;

const y = (startPoint.y + endPoint.y) / 2;

const width = Math.abs(startPoint.x - endPoint.x) + 10;

const height = Math.abs(startPoint.y - endPoint.y) + 10;
```

![line_selected](https://github.com/didi/LogicFlow/assets/27529822/d169a666-4f37-41f9-adce-e779a0e85d6c)

折线的计算逻辑如下：
- points：折线路径

```js
// bbox: 包含折线上所有点的box
const { points } = polyline;
const pointsList = points2PointsList(points);
const bbox = getBBoxOfPoints(pointsList, 8);
const { x, y, width, height, } = bbox; 
```

![polyline_selected](https://github.com/didi/LogicFlow/assets/27529822/909602bf-d32d-4930-9e30-39fe2be6b74c)

曲线的计算逻辑如下：
- pointsList：贝塞尔曲线上所有点 list，包含起点、终点、两个支点
- bbox: 包含贝塞尔曲线上所有点的 box


```js
const { path } = bezier;
const pointsList = getBezierPoints(path);
const bbox = getBBoxOfPoints(pointsList, 8);
const { x, y, width, height, } = bbox;
```

![bezier_selected](https://github.com/didi/LogicFlow/assets/27529822/50760129-295e-42de-904c-b28e69841eb5)


## 边文案设置
边上设置文案可以丰富信息表达，在 LF 中可以通过双击边开启文案编辑，文案默认位置如下:

- 直线：中点。
- 折线：双击手动添加时为双击位置与折线距离最短的垂点，非双击添加默认为最长线段的中点。
- 曲线：起点、终点、两个控制点的X轴和Y轴坐标平均值。

当然文案位置也可以手动进行拖动调整。

## 样式调整
关于边的样式调整详细内容，可以查看官方文档介绍-[主题Theme](tutorial/basic-theme)。

## 最后
相信通过本文你对 Edge 的实现有一个大概的认知了，其实在做 LogicFlow 的过程中，我们遇到了很多非纯前端的问题，那就需要我们去重拾几何、算法这样的知识，如果你也对这方面非常感兴趣或者有研究，欢迎一起交流。目前，LogicFlow 用户群的人数已经 200+，大家都在讨论流程可视化/LowCode 相关实现，期待你的参与~


> 添加微信号进用户群：logic-flow
