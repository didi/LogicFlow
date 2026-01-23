---
nav: API
title: 导览
toc: content
order: 0
---

欢迎阅读 LogicFlow 类型说明。本文是了解 LogicFlow 框架中使用的各种类型的主要入口。每种类型对于定义 LogicFlow 环境中元素的结构和行为都至关重要。

下面是 LogicFlow 中定义的每种类型的简介：

## 主题样式相关类型
- [Theme](Theme.zh.md#theme主题配置)：LogicFlow主题配置项，提供了目前LogicFlow支持的元素的样式配置。
- [CommonTheme](Theme.zh.md#commontheme通用主题)：各种主题类型的基础，提供了诸如 `fill`、`stroke` 和 `strokeWidth` 等通用属性。
- [NodeTheme](Theme.zh.md#nodetheme节点主题)：节点主题类型，例如 `RectTheme`、`CircleTheme`、`PolygonTheme` 和 `EllipseTheme`，继承自 `CommonTheme` 并定义了特定于每种形状的属性。
- [EdgeTheme](Theme.zh.md#edgetheme边主题)：扩展了 `CommonTheme`，并包含了特定于边样式的附加属性，允许对边的外观进行详细的自定义。
- [TextTheme](Theme.zh.md#texttheme文本主题)：概述了与文本样式相关的属性，包括 `color`、`fontSize` 和 `textAnchor`，同时也扩展了 `CommonTheme`。

## 实例相关
- [Common](MainTypes.zh.md#common实例基础配置项)：LogicFlow 实例的基础配置项，包括画布的 DOM 节点、宽度、高度等。
- [BackgroundConfig](MainTypes.zh.md#backgroundconfig背景配置)：定义画布背景的配置，包括背景图片和背景平铺方式。
- [GridOptions](MainTypes.zh.md#gridoptions网格配置)：定义画布网格的配置，包括网格大小、可见性和网格类型。
- [KeyboardDef](MainTypes.zh.md#keyboarddef快捷键参数类型)：定义快捷键的配置，包括启用状态和快捷键组合。
- [EdgeType](MainTypes.zh.md#edgetype边类型)：定义边的类型，包括直线、折线和贝塞尔曲线。
- [AnimationConfig](MainTypes.zh.md#animationconfig动画配置)：定义动画的配置，包括节点和边的动画启用状态。
- [EdgeGeneratorType](MainTypes.zh.md#edgegeneratortype自定义边生成函数)：定义自定义边生成函数的类型，用于根据节点类型生成不同类型的边。
- [customTargetAnchorType](MainTypes.zh.md#customtargetanchortype自定义锚点连接规则)：定义自定义锚点连接规则函数类型，用于决定手动连线落到目标节点时连接哪个锚点。
- [GuardsConfig](MainTypes.zh.md#guardsconfig守卫函数类型)：定义守卫函数的配置，用于在克隆或删除节点/边之前进行拦截。
- [AppendConfig](MainTypes.zh.md#appendconfig折线边选区信息)：定义折线边选区的信息，包括起点、终点、方向和是否可拖动。
- [ArrowConfig](MainTypes.zh.md#arrowconfig箭头配置)：定义箭头的配置，包括箭头起点和终点的样式。
- [AttributesType](MainTypes.zh.md#attributestype通用属性类型)：定义通用属性类型，允许为 LogicFlow 元素附加自定义属性。
- [RegisterConfig](MainTypes.zh.md#registerconfig注册配置)：定义注册新元素的配置，包括元素类型、视图组件和模型构造函数。
- [RegisterElement](MainTypes.zh.md#registerelement注册元素配置)：定义注册新元素类型的配置，包括视图组件和数据模型。
- [RegisterElementFunc](MainTypes.zh.md#registerelementfunc)：定义注册元素的函数类型，接受注册参数并返回注册元素对象。
- [RegisterParam](MainTypes.zh.md#registerparam)：定义注册元素时的参数类型，包括 hyperscript 函数和其他自定义属性。
- [BaseNodeModelCtor](MainTypes.zh.md#basenodemodelctor基础节点构造函数)：定义基础节点模型的构造函数类型，用于创建节点模型实例。
- [BaseEdgeModelCtor](MainTypes.zh.md#baseedgemodelctor基础边构造函数)：定义基础边模型的构造函数类型，用于创建边模型实例。

## 画布相关

- [GraphConfigData](MainTypes.zh.md#graphconfigdata流程图渲染数据类型)：定义流程图渲染数据的类型，包括节点和边的配置。
- [GraphData](MainTypes.zh.md#graphdata画布数据)：定义画布数据的类型，包括节点和边的数据结构。
- [GraphElement](MainTypes.zh.md#graphelement)：定义画布上的元素类型，包括节点和边。
- [GraphElementCtor](MainTypes.zh.md#graphelementctor画布元素构造函数)：定义画布元素的构造函数类型，用于创建节点或边的实例。
- [Position](MainTypes.zh.md#position坐标类型)：定义二维空间中的点的坐标类型，包括 x 和 y 坐标。
- [Point](MainTypes.zh.md#point点类型)：扩展自 Position 类型，表示二维空间中的点，包含可选的 id 和其他属性。
- [PointTuple](MainTypes.zh.md#pointtuple点坐标组)：表示二维空间中点的元组，由两个数值组成，分别对应 x 和 y 坐标。
- [PropertiesType](MainTypes.zh.md#propertiestype元素属性)：定义元素的属性类型，包括宽度、高度、样式和文本样式。
- [TextConfig](MainTypes.zh.md#textconfig文本配置)：定义文本元素的配置，包括文本内容、位置、编辑和拖动选项。
- [ClientPosition](MainTypes.zh.md#clientposition元素位置)：表示事件相对于 DOM 覆盖层和画布覆盖层的位置。

## 节点相关

- [NodeConfig](MainTypes.zh.md#nodeconfig节点配置)：定义节点的配置结构，包括节点的特性、位置和行为。
- [OffsetData](MainTypes.zh.md#offsetdata移动偏移)：定义节点在拖拽时移动偏移值的数据结构。
- [FakeNodeConfig](MainTypes.zh.md#fakenodeconfig虚拟节点配置)：定义虚拟节点的配置，用于拖拽创建节点过程中的临时节点。
- [VectorData](MainTypes.zh.md#vectordata向量数据)：定义二维空间中的向量数据，包括 x 轴和 y 轴的变化量。
- [DomAttributes](MainTypes.zh.md#domattributesdom属性)：定义节点的 DOM 属性，包括 CSS 类名和其他自定义属性。

## 边相关

- [EdgeConfig](MainTypes.zh.md#edgeconfig边配置)：定义边的配置结构，包括边的特性、起点和终点。
- [EdgeData](MainTypes.zh.md#edgedata边数据)：扩展自 EdgeConfig，表示边的数据结构，包括边的特性和行为。

## 插件相关

- [Extension](MainTypes.zh.md#extension插件)：定义 LogicFlow 框架中扩展的结构和行为，包括渲染和销毁方法。
- [ExtensionRenderFunc](MainTypes.zh.md#extensionrenderfunc插件渲染函数)：定义插件的渲染函数类型，用于在 LogicFlow 环境中渲染扩展内容。
- [ExtensionType](MainTypes.zh.md#extensiontype插件类型)：定义 LogicFlow 框架中可用的不同形式的扩展，包括构造函数和对象定义。
- [ExtensionConfig](MainTypes.zh.md#extensionconfig插件配置)：定义插件的配置结构，包括插件标识符、扩展行为和额外属性。
- [IExtensionProps](MainTypes.zh.md#iextensionprops插件参数类型)：定义插件的参数类型，包括 LogicFlow 实例和扩展属性。
- [ExtensionConstructor](MainTypes.zh.md#extensionconstructor插件构造函数)：定义插件的构造函数类型，用于创建插件实例。
- [ExtensionDefinition](MainTypes.zh.md#extensiondefinition插件定义)：定义插件的对象形式，包括插件名称、安装和渲染方法。
- [LabelConfig](MainTypes.zh.md#labelconfiglabel插件数据类型)：定义 Label 插件支持的渲染数据结构，包括标签位置、内容和样式。
- [LabelOption](MainTypes.zh.md#labeloptionlabel插件配置项类型)：定义 Label 插件的配置设置，包括标签方向和最大数量。
- [MenuConfig](MainTypes.zh.md#menuconfigmenu插件菜单项类型)：定义 Menu 插件中菜单项的配置结构，包括显示文本、CSS 类名、图标和回调函数。

有关每种类型的详细信息，请参阅上面链接的相应文档。