---
nav: API
title: Overview
toc: content
order: 0
---

Welcome to the LogicFlow type documentation. This article serves as the main entry point for understanding the various types used in the LogicFlow framework. Each type is crucial for defining the structure and behavior of elements within the LogicFlow environment.

Below is an introduction to each type defined in LogicFlow:

### Theme Style Related Types
- [CommonTheme](commonTheme.en.md): The foundation of various theme types, providing common properties such as `fill`, `stroke`, and `strokeWidth`.
- [EdgeTheme](edgeTheme.en.md): Extends `CommonTheme` and includes additional properties specific to edge styles, allowing detailed customization of edge appearance.
- [NodeTheme](nodeTheme.en.md): Node theme types such as `RectTheme`, `CircleTheme`, `PolygonTheme`, and `EllipseTheme`, inheriting from `CommonTheme` and defining properties specific to each shape.
- [TextTheme](textTheme.en.md): Describes properties related to text styles, including `color`, `fontSize`, and `textAnchor`, while also extending `CommonTheme`.

### Configuration Types
- [LFOptions](LFOptions.en.md): The core configuration type for LogicFlow.
- [DomAttributes](domAttributes.en.md): Attributes for DOM elements, including optional className.
- [PropertiesType](propertiesType.en.md): Attributes for elements such as width, height, style, and text style.
- [AttributesType](attributesType.en.md): Attribute records associated with LogicFlow elements.
- [VectorData](vectorData.en.md): Represents vector calculations with deltaX and deltaY.
- [OffsetData](offsetData.en.md): Contains offset calculations with dx and dy properties.
- [Position](position.en.md): Represents a point in 2D space with x and y coordinates.
- [Point](point.md): Extends Position with optional id and other attributes.
- [PointTuple](pointTuple.en.md): Represents a tuple of points with two values.
- [ClientPosition](clientPosition.en.md): Position information for DOM overlay and canvas overlay.
- [LineSegment](lineSegment.en.md): Consists of a start and end point represented by the Point type.
- [Direction](direction.en.md): Alias for SegmentDirection.
- [RadiusCircleInfo](radiusCircleInfo.en.md): Includes radius and position.
- [Vector](vector.en.md): Represents x, y, z coordinates and an optional id.
- [RectSize](rectSize.en.md): Contains width and height properties.
- [TextConfig](textConfig.en.md): Attributes for text value, position, and optional edit and drag flags.
- [LabelConfig](labelConfig.en.md): Attributes for label position, content, style, and edit options.
- [LabelOption](labelOption.en.md): Settings for label direction and maximum count.
- [LabelData](labelData.en.md): Extends LabelConfig with mandatory properties.
- [AppendConfig](appendConfig.en.md): Includes startIndex, endIndex, direction, and segment information.
- [ArrowConfig](arrowConfig.en.md): Attributes for arrow configuration, including markerStart and markerEnd.
- [ArrowInfo](arrowInfo.en.md): Includes start and end points, hover state, and selection state.
- [GraphConfigData](graphConfigData.en.md): Optional arrays of nodes and edges.
- [GraphData](graphData.en.md): Mandatory arrays of nodes and edges.
- [FakeNodeConfig](fakeNodeConfig.en.md): Type, text, and properties for fake nodes.
- [OnDragNodeConfig](onDragNodeConfig.en.md): Attributes for draggable nodes.
- [NodeConfig](nodeConfig.en.md): Attributes for node identification, type, position, and configuration.
- [NodeData](nodeData.en.md): Extends NodeConfig with mandatory properties.
- [EdgeConfig](edgeConfig.en.md): Attributes for edge identification, source node, target node, and configuration.
- [EdgeData](edgeData.en.md): Extends EdgeConfig with mandatory properties.
- [MenuConfig](menuConfig.en.md): Attributes for menu text, className, icon, and callback function.

### Rendering Related
- [FocusOnArgsType](FocusOnArgsType.en.md): Parameters for centering the canvas viewport.
- [BaseNodeModelCtor](BaseNodeModelCtor.en.md): Constructor type for node models.
- [BaseEdgeModelCtor](BaseEdgeModelCtor.en.md): Constructor type for edge models.
- [GraphElementCtor](GraphElementCtor.en.md): Constructor type for graph elements.
- [GraphElement](GraphElement.en.md): Type for graph elements.
- [GraphElements](GraphElements.en.md): Type for collections of graph elements.
- [RegisterConfig](RegisterConfig.en.md): Configuration items for registering elements (nodes or edges).
- [RegisterElement](RegisterElement.en.md): Type for registering elements.
- [RegisterParam](RegisterParam.en.md): Parameter type for registering elements.
- [RegisterElementFunc](RegisterElementFunc.en.md): Function type for registering elements.
- [LogicFlowConstructor](LogicFlowConstructor.en.md): Constructor type for LogicFlow.
- [ExtensionType](ExtensionType.en.md): Type for plugins.
- [ExtensionConfig](ExtensionConfig.en.md): Configuration type for plugins.
- [IExtensionProps](IExtensionProps.en.md): Property type for plugins.
- [ExtensionConstructor](ExtensionConstructor.en.md): Constructor type for plugins.
- [ExtensionRenderFunc](ExtensionRenderFunc.en.md): Render function type for plugins.
- [ExtensionDefinition](ExtensionDefinition.en.md): Object form type for plugins.
- [Extension](Extension.en.md): Type for plugins.

For detailed information on each type, please refer to the corresponding documentation linked above.