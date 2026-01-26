---
nav: API
title: Overview
toc: content
order: 0
---

Welcome to the LogicFlow type reference. This page is the main entry point to the types used across the LogicFlow framework. Each type is critical for defining the structure and behavior of elements in a LogicFlow application.

Below is an overview of the types defined in LogicFlow:

## Theme Style Related Types
- [Theme](Theme.en.md#theme主题配置): The LogicFlow theme configuration for styling supported elements.
- [CommonTheme](Theme.en.md#commontheme通用主题): The base for all theme variants, providing common properties such as `fill`, `stroke`, and `strokeWidth`.
- [NodeTheme](Theme.en.md#nodetheme节点主题): Node theme types, for example `RectTheme`, `CircleTheme`, `PolygonTheme`, and `EllipseTheme`, inheriting from `CommonTheme` and defining shape-specific properties.
- [EdgeTheme](Theme.en.md#edgetheme边主题): Extends `CommonTheme` and adds edge-specific styling properties for fine-grained control.
- [TextTheme](Theme.en.md#texttheme文本主题): Text styling properties including `color`, `fontSize`, and `textAnchor`; extends `CommonTheme`.

## Instance Related
- [Common](MainTypes.en.md#common实例基础配置项): Basic LogicFlow instance configuration, including the canvas DOM node, width, height, etc.
- [BackgroundConfig](MainTypes.en.md#backgroundconfig背景配置): Canvas background configuration, including background image and tiling mode.
- [GridOptions](MainTypes.en.md#gridoptions网格配置): Canvas grid configuration, including grid size, visibility, and grid type.
- [KeyboardDef](MainTypes.en.md#keyboarddef快捷键参数类型): Keyboard shortcut configuration, including enable state and key combinations.
- [EdgeType](MainTypes.en.md#edgetype边类型): Edge types including straight line, polyline, and bezier curve.
- [AnimationConfig](MainTypes.en.md#animationconfig动画配置): Animation configuration, including whether node and edge animations are enabled.
- [EdgeGeneratorType](MainTypes.en.md#edgegeneratortype自定义边生成函数): Custom edge generator type, used to generate different edge types based on node type.
- [customTargetAnchorType](MainTypes.en.md#customtargetanchortype自定义锚点连接规则): Custom anchor connection rule function type, used to decide which anchor to connect when a manual connection drops on the target node.
- [GuardsConfig](MainTypes.en.md#guardsconfig守卫函数类型): Guard configuration for intercepting clone or delete actions.
- [AppendConfig](MainTypes.en.md#appendconfig折线边选区信息): Polyline segment selection info, including start and end indices, direction, and whether it is draggable.
- [ArrowConfig](MainTypes.en.md#arrowconfig箭头配置): Arrow configuration, including styles for arrow start and end.
- [AttributesType](MainTypes.en.md#attributestype通用属性类型): Generic attribute type, allowing custom properties to be attached to LogicFlow elements.
- [RegisterConfig](MainTypes.en.md#registerconfig注册配置): Configuration for registering new elements, including element type, view component, and model constructor.
- [RegisterElement](MainTypes.en.md#registerelement注册元素配置): Configuration for registering new element types, including view component and data model.
- [RegisterElementFunc](MainTypes.en.md#registerelementfunc): Function type for registering elements; accepts registration parameters and returns the registered element object.
- [RegisterParam](MainTypes.en.md#registerparam): Parameter type for registering elements, including hyperscript function and other custom properties.
- [BaseNodeModelCtor](MainTypes.en.md#basenodemodelctor基础节点构造函数): Constructor type for base node models, used to create node model instances.
- [BaseEdgeModelCtor](MainTypes.en.md#baseedgemodelctor基础边构造函数): Constructor type for base edge models, used to create edge model instances.

## Canvas Related
- [GraphConfigData](MainTypes.en.md#graphconfigdata流程图渲染数据类型): Flowchart rendering data type, including node and edge configurations.
- [GraphData](MainTypes.en.md#graphdata画布数据): Canvas data type, including the data structures of nodes and edges.
- [GraphElement](MainTypes.en.md#graphelement): Element type on the canvas, including nodes and edges.
- [GraphElementCtor](MainTypes.en.md#graphelementctor画布元素构造函数): Constructor type for canvas elements, used to create node or edge instances.
- [Position](MainTypes.en.md#position坐标类型): Coordinate type for a point in 2D space, including x and y.
- [Point](MainTypes.en.md#point点类型): Extends `Position`, represents a point in 2D space with optional id and other attributes.
- [PointTuple](MainTypes.en.md#pointtuple点坐标组): A tuple representing a point in 2D space, with two numeric values for x and y.
- [PropertiesType](MainTypes.en.md#propertiestype元素属性): Element property type, including width, height, style, and text style.
- [TextConfig](MainTypes.en.md#textconfig文本配置): Configuration for text elements, including content, position, editing, and drag options.
- [ClientPosition](MainTypes.en.md#clientposition元素位置): Represents event positions relative to the DOM overlay and the canvas overlay.

## Node Related
- [NodeConfig](MainTypes.en.md#nodeconfig节点配置): Node configuration structure, including identity, position, and behavior.
- [OffsetData](MainTypes.en.md#offsetdata移动偏移): Data structure representing node drag offset.
- [FakeNodeConfig](MainTypes.en.md#fakenodeconfig虚拟节点配置): Configuration for a temporary node used during drag-create.
- [VectorData](MainTypes.en.md#vectordata向量数据): Vector data, including changes along the x and y axes.
- [DomAttributes](MainTypes.en.md#domattributesdom属性): DOM attributes for nodes, including CSS class name and other custom attributes.

## Edge Related
- [EdgeConfig](MainTypes.en.md#edgeconfig边配置): Edge configuration structure, including edge properties, source, and target.
- [EdgeData](MainTypes.en.md#edgedata边数据): Extends `EdgeConfig`, representing edge data structure and behavior.

## Plugin Related
- [Extension](MainTypes.en.md#extension插件): Defines the structure and behavior of extensions in the LogicFlow framework, including render and destroy methods.
- [ExtensionRenderFunc](MainTypes.en.md#extensionrenderfunc插件渲染函数): Render function type for plugins, used to render extension content in LogicFlow.
- [ExtensionType](MainTypes.en.md#extensiontype插件类型): Different forms of extensions available in LogicFlow, including constructor and object definitions.
- [ExtensionConfig](MainTypes.en.md#extensionconfig插件配置): Configuration for extensions, including plugin identifier, extension behavior, and extra properties.
- [IExtensionProps](MainTypes.en.md#iextensionprops插件参数类型): Parameter type for plugins, including LogicFlow instance and extension properties.
- [ExtensionConstructor](MainTypes.en.md#extensionconstructor插件构造函数): Constructor type for creating plugin instances.
- [ExtensionDefinition](MainTypes.en.md#extensiondefinition插件定义): Object form definition for plugins, including plugin name, install, and render methods.
- [LabelConfig](MainTypes.en.md#labelconfiglabel插件数据类型): Render data structure supported by the Label plugin, including label position, content, and style.
- [LabelOption](MainTypes.en.md#labeloptionlabel插件配置项类型): Configuration settings for the Label plugin, including label direction and maximum count.
- [MenuConfig](MainTypes.en.md#menuconfigmenu插件菜单项类型): Menu item configuration in the Menu plugin, including display text, CSS class name, icon, and callback function.

For detailed information on each type, please refer to the corresponding documentation linked above.
