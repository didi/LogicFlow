---
nav: API
group:
  title: 类型字典
  order: 3
title: 类型定义字典
toc: content
order: 0
---

Welcome to the LogicFlow type reference for **API**. This section indexes types used by constructor options and runtime APIs.

**Documents in this group**

- Theme style types: [`Theme Types`](./Theme.en.md)
- Full type dictionary: [`Core Types (MainTypes)`](./MainTypes.en.md)
- Canvas-related index: [`Canvas-related types`](./canvas-types.en.md)
- Node-related index: [`Node-related types`](./node-types.en.md)
- Plugin-related index: [`Built-in plugin types`](./plugin-types.en.md)

Below is an overview of the types defined in LogicFlow:

## Theme Style Related Types

- [Theme](Theme.en.md#theme): The LogicFlow theme configuration for styling supported elements.
- [CommonTheme](Theme.en.md#commontheme): The base for all theme variants, providing common properties such as `fill`, `stroke`, and `strokeWidth`.
- [Node-related themes](Theme.en.md#node-related-theme-types): Shape themes such as `RectTheme`, `CircleTheme`, `PolygonTheme`, and `EllipseTheme`, inheriting from `CommonTheme`.
- [EdgeTheme](Theme.en.md#edgetheme): Extends `CommonTheme` and adds edge-specific styling properties for fine-grained control.
- [TextTheme](Theme.en.md#texttheme): Text styling properties including `color`, `fontSize`, and `textAnchor`; extends `CommonTheme`.

## Instance Related

- [Common](MainTypes.en.md#common): Basic LogicFlow instance configuration, including the canvas DOM node, width, height, etc.
- [BackgroundConfig](MainTypes.en.md#backgroundconfig): Canvas background configuration, including background image and tiling mode.
- [GridOptions](MainTypes.en.md#gridoptions): Canvas grid configuration, including grid size, visibility, and grid type.
- [KeyboardDef](MainTypes.en.md#keyboarddef): Keyboard shortcut configuration, including enable state and key combinations.
- [EdgeType](MainTypes.en.md#edgetype): Edge types including straight line, polyline, and bezier curve.
- [AnimationConfig](MainTypes.en.md#animationconfig): Animation configuration, including whether node and edge animations are enabled.
- [EdgeGeneratorType](MainTypes.en.md#edgegeneratortype): Custom edge generator type, used to generate different edge types based on node type.
- [customTargetAnchorType](MainTypes.en.md#customtargetanchortype): Custom anchor connection rule function type, used to decide which anchor to connect when a manual connection drops on the target node.
- [GuardsConfig](MainTypes.en.md#guardsconfig): Guard configuration for intercepting clone or delete actions.
- [AppendConfig](MainTypes.en.md#appendconfig): Polyline segment selection info, including start and end indices, direction, and whether it is draggable.
- [ArrowConfig](MainTypes.en.md#arrowconfig): Arrow configuration, including styles for arrow start and end.
- [AttributesType](MainTypes.en.md#attributestype): Generic attribute type, allowing custom properties to be attached to LogicFlow elements.
- [RegisterConfig](MainTypes.en.md#registerconfig): Configuration for registering new elements, including element type, view component, and model constructor.
- [RegisterElement](MainTypes.en.md#registerelement): Configuration for registering new element types, including view component and data model.
- [RegisterElementFunc](MainTypes.en.md#registerelementfunc): Function type for registering elements; accepts registration parameters and returns the registered element object.
- [RegisterParam](MainTypes.en.md#registerparam): Parameter type for registering elements, including hyperscript function and other custom properties.
- [BaseNodeModelCtor](MainTypes.en.md#basenodemodelctor): Constructor type for base node models, used to create node model instances.
- [BaseEdgeModelCtor](MainTypes.en.md#baseedgemodelctor): Constructor type for base edge models, used to create edge model instances.

## Canvas Related

- [GraphConfigData](MainTypes.en.md#graphconfigdata): Flowchart rendering data type, including node and edge configurations.
- [GraphData](MainTypes.en.md#graphdata): Canvas data type, including the data structures of nodes and edges.
- [GraphElement](MainTypes.en.md#graphelement): Element type on the canvas, including nodes and edges.
- [GraphElementCtor](MainTypes.en.md#graphelementctor): Constructor type for canvas elements, used to create node or edge instances.
- [Position](MainTypes.en.md#position): Coordinate type for a point in 2D space, including x and y.
- [Point](MainTypes.en.md#point): Extends `Position`, represents a point in 2D space with optional id and other attributes.
- [PointTuple](MainTypes.en.md#pointtuple): A tuple representing a point in 2D space, with two numeric values for x and y.
- [PropertiesType](MainTypes.en.md#propertiestype): Element property type, including width, height, style, and text style.
- [TextConfig](MainTypes.en.md#textconfig): Configuration for text elements, including content, position, editing, and drag options.
- [ClientPosition](MainTypes.en.md#clientposition): Represents event positions relative to the DOM overlay and the canvas overlay.

## Node Related

- [NodeConfig](MainTypes.en.md#nodeconfig): Node configuration structure, including identity, position, and behavior.
- [OffsetData](MainTypes.en.md#offsetdata): Data structure representing node drag offset.
- [FakeNodeConfig](MainTypes.en.md#fakenodeconfig): Configuration for a temporary node used during drag-create.
- [VectorData](MainTypes.en.md#vectordata): Vector data, including changes along the x and y axes.
- [DomAttributes](MainTypes.en.md#domattributes): DOM attributes for nodes, including CSS class name and other custom attributes.

## Edge Related

- [EdgeConfig](MainTypes.en.md#edgeconfig): Edge configuration structure, including edge properties, source, and target.
- [EdgeData](MainTypes.en.md#edgedata): Extends `EdgeConfig`, representing edge data structure and behavior.

## Plugin Related

- [Extension](MainTypes.en.md#extension): Defines the structure and behavior of extensions in the LogicFlow framework, including render and destroy methods.
- [ExtensionRenderFunc](MainTypes.en.md#extensionrenderfunc): Render function type for plugins, used to render extension content in LogicFlow.
- [ExtensionType](MainTypes.en.md#extensiontype): Different forms of extensions available in LogicFlow, including constructor and object definitions.
- [ExtensionConfig](MainTypes.en.md#extensionconfig): Configuration for extensions, including plugin identifier, extension behavior, and extra properties.
- [IExtensionProps](MainTypes.en.md#iextensionprops): Parameter type for plugins, including LogicFlow instance and extension properties.
- [ExtensionConstructor](MainTypes.en.md#extensionconstructor): Constructor type for creating plugin instances.
- [ExtensionDefinition](MainTypes.en.md#extensiondefinition): Object form definition for plugins, including plugin name, install, and render methods.
- [LabelConfig](MainTypes.en.md#labelconfig): Render data structure supported by the Label plugin, including label position, content, and style.
- [LabelOption](MainTypes.en.md#labeloption): Configuration settings for the Label plugin, including label direction and maximum count.
- [MenuConfig](MainTypes.en.md#menuconfig): Menu item configuration in the Menu plugin, including display text, CSS class name, icon, and callback function.

For detailed information on each type, please refer to the corresponding documentation linked above.

## See also

- Runtime theme APIs: [`LogicFlow Instance > Theme`](../logicflow-instance/theme.en.md)
- Constructor options: [`LogicFlow Constructor`](../logicflow-constructor/index.en.md)
