---
nav: API
title: Theme
toc: content
order: 0
---
This article mainly introduces the type definitions of LogicFlow theme styles. Let's start with the `style` parameter used to control the overall style of the canvas when creating a LogicFlow instance, which is of type `Theme`:

The `Theme` type defines the theme styles for various elements in LogicFlow. It includes the style configurations for nodes, edges, text, anchors, arrows, and other elements.

| Property Name | Type                                    | Description                               |
| ------------- | --------------------------------------- | ----------------------------------------- |
| baseNode      | [CommonTheme](#commontheme)             | General theme settings for all nodes.     |
| baseEdge      | [EdgeTheme](#edgetheme)                 | General theme settings for all edges.     |
| rect          | [RectTheme](#recttheme)                 | Rectangle style.                          |
| circle        | [CircleTheme](#circletheme)             | Circle style.                             |
| diamond       | [PolygonTheme](#polygontheme)           | Diamond style.                            |
| ellipse       | [EllipseTheme](#ellipsetheme)           | Ellipse style.                            |
| polygon       | [PolygonTheme](#polygontheme)           | Polygon style.                            |
| line          | [EdgeTheme](#edgetheme)                 | Straight line style.                      |
| polyline      | [EdgePolylineTheme](#edgepolylinetheme) | Polyline style.                           |
| bezier        | [EdgeBezierTheme](#edgebeziertheme)     | Bezier curve style.                       |
| anchorLine    | [AnchorLineTheme](#anchorlinetheme)     | Style for lines drawn from anchors.       |
| text          | [TextNodeTheme](#textnodetheme)         | Text node style.                          |
| nodeText      | [NodeTextTheme](#nodetexttheme)         | Node text style.                          |
| edgeText      | [EdgeTextTheme](#edgetexttheme)         | Edge text style.                          |
| inputText     | [CommonTheme](#commontheme)             | Input text style.                         |
| anchor        | [AnchorTheme](#anchortheme)             | Anchor style.                             |
| arrow         | [ArrowTheme](#arrowtheme)               | Arrow style on edges.                     |
| snapline      | [EdgeTheme](#edgetheme)                 | Snapline style.                           |
| rotateControl | [CommonTheme](#commontheme)             | Node rotation control point style.        |
| resizeControl | [CommonTheme](#commontheme)             | Node resize control point style.          |
| resizeOutline | [CommonTheme](#commontheme)             | Outline style when resizing nodes.        |
| edgeAdjust    | [CircleTheme](#circletheme)             | Adjustment point style for edge segments. |
| outline       | [OutlineTheme](#outlinetheme)           | Outline style when nodes are selected.    |
| edgeAnimation | [EdgeAnimation](#edgeanimation)         | Edge animation style.                     |

## CommonTheme
The `CommonTheme` type defines the common properties that can be applied to various graphical elements in the LogicFlow framework. This type serves as the foundation for other theme types, ensuring consistent styles across different components.

| Property Name | Type             | Description                                                                                                                                                                                                                                                         |
| ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fill          | string \| 'none' | The fill color of the shape. It can be a CSS color string (e.g., #000000, rgba(0, 0, 0, 0)), or the string 'none' to indicate transparency.                                                                                                                         |
| stroke        | string \| 'none' | The stroke color of the shape. Similar to fill, it can be a CSS color string or 'none'.                                                                                                                                                                             |
| strokeWidth   | number           | The width of the stroke. Defines the thickness of the shape's border. Note: In SVG, acceptable values can be either numbers or percentages (e.g., 10%).                                                                                                             |
| radius        | number           | The corner radius of the shape, applicable to rounded shapes. This property is optional.                                                                                                                                                                            |
| rx            | number           | The x-axis radius of the corners. This property is optional.                                                                                                                                                                                                        |
| ry            | number           | The y-axis radius of the corners. This property is optional.                                                                                                                                                                                                        |
| width         | number           | The width of the shape. This property is optional.                                                                                                                                                                                                                  |
| height        | number           | The height of the shape. This property is optional.                                                                                                                                                                                                                 |
| path          | number           | The SVG path string that defines a custom shape. This property is optional.                                                                                                                                                                                         |
| [key: string] | unknown          | Allows additional custom properties to be included in the theme and passed to the DOM. This provides flexibility for extending the theme. For more details, refer to the [SVG attribute specification](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute). |

## Node-Related Theme Types

### RectTheme

The `RectTheme` type represents the theme for rectangle nodes, inheriting from [CommonTheme](#commontheme) without additional extensions.

### CircleTheme

The `CircleTheme` type represents the theme for circle nodes, inheriting from [CommonTheme](#commontheme) without additional extensions.

### PolygonTheme

The `PolygonTheme` type represents the theme for polygon nodes. It inherits from [CommonTheme](#commontheme) without additional extensions.

### EllipseTheme

The `EllipseTheme` type represents the theme for ellipse nodes. It inherits from [CommonTheme](#commontheme) without additional extensions.

## Edge-Related Theme Types

Various edge theme types defined in LogicFlow extend from [CommonTheme](#commontheme). They are used to define the styles and properties of edges in the flowchart.

### EdgeTheme
The `EdgeTheme` type represents the theme for straight edges. In addition to the common properties from [CommonTheme](#commontheme), it extends with the following specific properties:

| Property Name   | Type                            | Description                                                                                                  |
| --------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| strokeDasharray | string                          | Defines the dash pattern used for the stroke path, including the pattern of dashes and gaps.                 |
| animation       | [EdgeAnimation](#edgeanimation) | Defines the animation properties for the edge, including stroke color, dash pattern, and animation duration. |

### EdgePolylineTheme
The `EdgePolylineTheme` type represents the theme for polyline edges. It is the same as the [EdgeTheme](#edgetheme) type without additional extensions.

### EdgeBezierTheme
The `EdgeBezierTheme` type represents the theme for bezier curve edges. It extends the straight edge with the following specific properties:

| Property Name | Type                        | Description                                         |
| ------------- | --------------------------- | --------------------------------------------------- |
| adjustLine    | [EdgeTheme](#edgetheme)     | Defines the theme for the bezier adjustment line.   |
| adjustAnchor  | [CircleTheme](#circletheme) | Defines the theme for the bezier adjustment anchor. |

### EdgeAnimation
The `EdgeAnimation` type defines the animation style for edges. It includes the following properties:

| Property Name           | Type                      | Description                                                                |
| ----------------------- | ------------------------- | -------------------------------------------------------------------------- |
| stroke                  | string \| 'none'          | The stroke color for the animation.                                        |
| strokeDasharray         | string                    | The dash pattern for the animation.                                        |
| strokeDashoffset        | ${number}% \| number      | The dash offset for the animation.                                         |
| animationName           | string                    | The name of the animation.                                                 |
| animationDuration       | ${number}s \| ${number}ms | The duration of the animation.                                             |
| animationIterationCount | 'infinite' \| number      | The number of iterations for the animation, can be a number or 'infinite'. |
| animationTimingFunction | string                    | The timing function for the animation.                                     |
| animationDirection      | string                    | The direction of the animation.                                            |

## Text-Related Theme Types

### TextTheme
The `TextTheme` type represents the most basic theme for text. It inherits from [CommonTheme](#commontheme) and extends with the following properties:

| Property Name    | Type                                                                                                                                      | Description            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| color            | string \| 'none'                                                                                                                          | The color of the text. |
| fontSize         | number                                                                                                                                    | The font size.         |
| textWidth        | number (optional)                                                                                                                         | The width of the text. |
| lineHeight       | number (optional)                                                                                                                         | The line height.       |
| textAnchor       | 'start' \| 'middle' \| 'end' (optional)                                                                                                   | The text anchor.       |
| dominantBaseline | 'auto' \| 'text-bottom' \| 'alphabetic' \| 'ideographic' \| 'middle' \| 'central' \| 'mathematical' \| 'hanging' \| 'text-top' (optional) | The dominant baseline. |

### TextNodeTheme
The `TextNodeTheme` type defines the theme for text nodes. It inherits from `TextTheme` and extends with the following property:

| Property Name | Type                               | Description                             |
| ------------- | ---------------------------------- | --------------------------------------- |
| background    | [RectTheme](#recttheme) (optional) | The background style for the text node. |

### NodeTextTheme
The `NodeTextTheme` type defines the theme for text on nodes. It inherits from `TextTheme` and extends with the following properties:

| Property Name | Type                                             | Description                                                                                                                                                                                                              |
| ------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| overflowMode  | 'default' \| 'autoWrap' \| 'ellipsis' (optional) | The handling of text overflow: <br> - 'default': No special handling, allows overflow. <br> - 'autoWrap': Automatically wraps text when it overflows. <br> - 'ellipsis': Truncates text with ellipsis when it overflows. |
| textWidth     | number (optional)                                | The width of the text.                                                                                                                                                                                                   |
| background    | [RectTheme](#recttheme) (optional)               | The background style for the text.                                                                                                                                                                                       |
| wrapPadding   | string (optional)                                | The padding for the background area, e.g., '5px,10px'.                                                                                                                                                                   |

### EdgeTextTheme
The `EdgeTextTheme` type defines the theme for text on edges. It inherits from `NodeTextTheme` and `TextTheme`, and adds some properties specific to edge text:

| Property Name | Type                                                          | Description                                                                                                                                                         |
| ------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| textWidth     | number                                                        | The width of the text.                                                                                                                                              |
| background    | { wrapPadding?: string } & [RectTheme](#recttheme) (optional) | The background style for the text, including padding for the background area. <br> - wrapPadding (optional): The padding for the background area, e.g., '5px,10px'. |
| hover         | [EdgeTextTheme](#edgetexttheme) (optional)                    | The text style when hovered.                                                                                                                                        |

## Other Theme Types

### AnchorTheme
The `AnchorTheme` type represents the theme for anchors. It inherits from [CommonTheme](#commontheme) and extends with the following specific properties:

| Property Name | Type                                                    | Description                              |
| ------------- | ------------------------------------------------------- | ---------------------------------------- |
| r             | number (optional)                                       | The radius of the anchor.                |
| hover         | { r?: number } & [CommonTheme](#commontheme) (optional) | Defines the hover effect for the anchor. |

### OutlineTheme
The `OutlineTheme` type defines the theme for the outline of nodes when selected. It inherits from [CommonTheme](#commontheme) and `EdgeAnimation`, and extends with the following specific property:

| Property Name | Type                                   | Description             |
| ------------- | -------------------------------------- | ----------------------- |
| hover         | [CommonTheme](#commontheme) (optional) | The style when hovered. |

### ArrowTheme
The `ArrowTheme` type defines the theme for arrows on edges. It inherits from [CommonTheme](#commontheme) and adds some properties specific to arrows:

| Property Name  | Type              | Description                                                                                                                                           |
| -------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| offset         | number            | The length of the arrow. For example, for the symbol "->", offset represents the width of the greater-than sign.                                      |
| refX           | number (optional) | The distance of the arrow perpendicular to the edge. For example, for the symbol "->", refX represents the height of the greater-than sign.           |
| refY           | number (optional) | The distance of the arrow perpendicular to the edge. For example, for the symbol "->", refY represents the height of the greater-than sign.           |
| verticalLength | number            | The distance of the arrow perpendicular to the edge. For example, for the symbol "->", verticalLength represents the height of the greater-than sign. |

### AnchorLineTheme
The `AnchorLineTheme` type represents the theme for lines drawn from anchors. It inherits from [EdgeTheme](#edgetheme) and `EdgeAnimation`.

These node theme types allow for the customization of node appearances in the LogicFlow library while maintaining a consistent theme structure through the inheritance of [CommonTheme](#commontheme), providing flexible visual representations.