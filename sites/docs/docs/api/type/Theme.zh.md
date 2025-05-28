---
nav: API
title: 主题样式
toc: content
order: 0
---
本文主要介绍 LogicFlow 主题样式的类型定义。

## Theme（主题配置）
`Theme` 类型定义了 LogicFlow 中各种元素的主题样式。它包含了节点、边、文本、锚点、箭头等元素的样式配置。

| 属性名        | 类型                                    | 描述                           |
| ------------- | --------------------------------------- | ------------------------------ |
| baseNode      | [CommonTheme](#commontheme)             | 所有节点的通用主题设置。       |
| baseEdge      | [EdgeTheme](#edgetheme)                 | 所有边的通用主题设置。         |
| rect          | [RectTheme](#recttheme)                 | 矩形样式。                     |
| circle        | [CircleTheme](#circletheme)             | 圆形样式。                     |
| diamond       | [PolygonTheme](#polygontheme)           | 菱形样式。                     |
| ellipse       | [EllipseTheme](#ellipsetheme)           | 椭圆样式。                     |
| polygon       | [PolygonTheme](#polygontheme)           | 多边形样式。                   |
| line          | [EdgeTheme](#edgetheme)                 | 直线样式。                     |
| polyline      | [EdgePolylineTheme](#edgepolylinetheme) | 折线样式。                     |
| bezier        | [EdgeBezierTheme](#edgebeziertheme)     | 贝塞尔曲线样式。               |
| anchorLine    | [AnchorLineTheme](#anchorlinetheme)     | 从锚点拉出的边的样式。         |
| text          | [TextNodeTheme](#textnodetheme)         | 文本节点样式。                 |
| nodeText      | [NodeTextTheme](#nodetexttheme)         | 节点文本样式。                 |
| edgeText      | [EdgeTextTheme](#edgetexttheme)         | 边文本样式。                   |
| inputText     | [CommonTheme](#commontheme)(可选)       | 输入文本样式。                 |
| anchor        | [AnchorTheme](#anchortheme)             | 锚点样式。                     |
| arrow         | [ArrowTheme](#arrowtheme)               | 边上箭头的样式。               |
| snapline      | [EdgeTheme](#edgetheme)                 | 对齐线样式。                   |
| rotateControl | [CommonTheme](#commontheme)             | 节点旋转控制点样式。           |
| resizeControl | [CommonTheme](#commontheme)             | 节点缩放控制点样式。           |
| resizeOutline | [CommonTheme](#commontheme)             | 节点调整大小时的外框样式。     |
| edgeAdjust    | [CircleTheme](#circletheme)             | 边连段的调整点样式。           |
| outline       | [OutlineTheme](#outlinetheme)           | 节点选择状态下外侧的选框样式。 |
| edgeAnimation | [EdgeAnimation](#edgeanimation)         | 边动画样式。                   |

## CommonTheme（通用主题）
`CommonTheme` 类型定义了 LogicFlow 框架中各种图形元素可应用的通用属性。该类型作为其他主题类型的基础，使不同组件之间的样式保持一致。

| 属性名        | 类型             | 描述                                                                                                                                                                |
| ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fill          | string \| 'none' | 形状的填充颜色。可以是 CSS 颜色字符串（如 #000000、rgba(0, 0, 0, 0)），或者字符串 'none' 表示透明。                                                                 |
| stroke        | string \| 'none' | 形状的描边颜色。与 fill 类似，可以是 CSS 颜色字符串或 'none'。                                                                                                      |
| strokeWidth   | number           | 描边的宽度。定义形状边框的厚度。注意：在 SVG 中可接受的值既可以是数字，也可以是百分比（如 10%）。                                                                   |
| radius        | number           | 形状的圆角半径，目前矩形、多边形和菱形支持设置圆角。此属性为可选项。                                                                                                |
| rx            | number           | x 轴方向的圆角半径。此属性为可选项。                                                                                                                                |
| ry            | number           | y 轴方向的圆角半径。此属性为可选项。                                                                                                                                |
| width         | number           | 形状的宽度。此属性为可选项。                                                                                                                                        |
| height        | number           | 形状的高度。此属性为可选项。                                                                                                                                        |
| path          | number           | 定义自定义形状的 SVG 路径字符串。此属性为可选项。                                                                                                                   |
| [key: string] | unknown          | 允许在主题中包含额外的自定义属性，并将其传递给 DOM。这为扩展主题提供了灵活性。详情请参考 [svg 属性规范](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute) |

## NodeTheme（节点主题）

### RectTheme

`RectTheme` 类型表示矩形节点的主题，它继承自 [CommonTheme](#commontheme)，没有做额外的扩展；

### CircleTheme

`CircleTheme` 类型表示圆形节点的主题，它同样继承自 [CommonTheme](#commontheme)，没有做额外的扩展；

### PolygonTheme

`PolygonTheme` 类型表示多边形节点的主题。它继承自 [CommonTheme](#commontheme)，没有做额外的扩展；

### EllipseTheme

`EllipseTheme` 类型表示椭圆形节点的主题。它继承自 [CommonTheme](#commontheme)，没有做额外的扩展；

## EdgeTheme（边主题）

LogicFlow 中定义的各种边主题类型都扩展自 [CommonTheme](#commontheme)。它用于定义流程图中边的样式和属性。

`EdgeTheme` 类型表示直线边的主题，除了[CommonTheme](#commontheme)中的通用属性外，还扩展了以下特定的属性：

| 属性名          | 类型                            | 描述                                                   |
| --------------- | ------------------------------- | ------------------------------------------------------ |
| strokeDasharray | string                          | 定义用于描边路径的虚线模式，包括短划线和间隙的模式。   |
| animation       | [EdgeAnimation](#edgeanimation) | 定义边的动画属性，包括描边颜色、虚线模式和动画时长等。 |

### EdgePolylineTheme
`EdgePolylineTheme`表示折线边的主题，它与[EdgeTheme](#edgetheme)类型相同，且没有做额外扩展。

### EdgeBezierTheme
`EdgeBezierTheme` 表示曲线边的主题，曲线边在直线边的基础上扩展了一下特定属性：

| 属性名       | 类型                        | 描述                     |
| ------------ | --------------------------- | ------------------------ |
| adjustLine   | [EdgeTheme](#edgetheme)     | 定义贝塞尔调整线主题。   |
| adjustAnchor | [CircleTheme](#circletheme) | 定义贝塞尔调整锚点主题。 |

### EdgeAnimation
`EdgeAnimation` 类型定义了边的动画样式，它包含以下属性：

| 属性名                  | 类型                      | 描述                                    |
| ----------------------- | ------------------------- | --------------------------------------- |
| stroke                  | string \| 'none'          | 动画的边框颜色。                        |
| strokeDasharray         | string                    | 动画的虚线样式。                        |
| strokeDashoffset        | ${number}% \| number      | 动画的虚线偏移量。                      |
| animationName           | string                    | 动画名称。                              |
| animationDuration       | ${number}s \| ${number}ms | 动画持续时间。                          |
| animationIterationCount | 'infinite' \| number      | 动画循环次数，可以是数字或 'infinite'。 |
| animationTimingFunction | string                    | 动画的时间函数。                        |
| animationDirection      | string                    | 动画的方向。                            |

## TextTheme（文本主题）

`TextTheme`表示文本最基础的主题，它继承自 [CommonTheme](#commontheme)，额外扩展了以下属性：

| 属性名           | 类型                                                                                                                                  | 描述           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| color            | string \| 'none'                                                                                                                      | 文本颜色。     |
| fontSize         | number                                                                                                                                | 字体大小。     |
| textWidth        | number (可选)                                                                                                                         | 文本宽度。     |
| lineHeight       | number (可选)                                                                                                                         | 行高。         |
| textAnchor       | 'start' \| 'middle' \| 'end' (可选)                                                                                                   | 文本锚点。     |
| dominantBaseline | 'auto' \| 'text-bottom' \| 'alphabetic' \| 'ideographic' \| 'middle' \| 'central' \| 'mathematical' \| 'hanging' \| 'text-top' (可选) | 基线对齐方式。 |

### TextNodeTheme
`TextNodeTheme` 类型定义了文本节点的主题样式。它继承自 `TextTheme`，额外扩展了以下属性：

| 属性名     | 类型                           | 描述                 |
| ---------- | ------------------------------ | -------------------- |
| background | [RectTheme](#recttheme) (可选) | 文本节点的背景样式。 |

### NodeTextTheme
`NodeTextTheme` 类型定义了文本节点的主题样式。它继承自 `TextTheme`，额外扩展了以下属性：

| 属性名       | 类型                                         | 描述                                                                                                                               |
| ------------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| overflowMode | 'default' \| 'autoWrap' \| 'ellipsis' (可选) | 文本超出指定宽度的处理方式：<br> - 'default': 不特殊处理，允许超出。<br> - 'autoWrap': 超出自动换行。<br> - 'ellipsis': 超出省略。 |
| textWidth    | number (可选)                                | 文本宽度。                                                                                                                         |
| background   | [RectTheme](#recttheme) (可选)               | 文本背景样式。                                                                                                                     |
| wrapPadding  | string (可选)                                | 背景区域的内边距，例如 '5px,10px'。                                                                                                |

### EdgeTextTheme
`EdgeTextTheme` 类型定义了边上文本的主题样式。它继承自 `NodeTextTheme` 和 `TextTheme`，并添加了一些特定于边文本的属性：

| 属性名     | 类型                                                      | 描述                                                                                               |
| ---------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| textWidth  | number                                                    | 文本宽度。                                                                                         |
| background | { wrapPadding?: string } & [RectTheme](#recttheme) (可选) | 文本背景样式，包含背景区域的内边距。<br> - wrapPadding (可选): 背景区域的内边距，例如 '5px,10px'。 |
| hover      | [EdgeTextTheme](#edgetexttheme) (可选)                    | 悬停状态下的文本样式。                                                                             |


## 其他主题类型

### AnchorTheme
`AnchorTheme`类型表示锚点的主题，它继承自 [CommonTheme](#commontheme)，扩展了以下特定属性：

| 属性名 | 类型                                                | 描述                    |
| ------ | --------------------------------------------------- | ----------------------- |
| r      | number (可选)                                       | 锚点半径。              |
| hover  | { r?: number } & [CommonTheme](#commontheme) (可选) | 定义锚点的 hover 效果。 |

### OutlineTheme
`OutlineTheme` 类型定义了节点选择状态下外侧选框的主题样式。它继承自 [CommonTheme](#commontheme) 和 `EdgeAnimation`，扩展了以下特定属性：

| 属性名 | 类型                               | 描述               |
| ------ | ---------------------------------- | ------------------ |
| hover  | [CommonTheme](#commontheme) (可选) | 悬停状态下的样式。 |

### ArrowTheme
`ArrowTheme` 类型定义了边上箭头的主题样式。它继承自 [CommonTheme](#commontheme)，并添加了一些特定于箭头的属性：

| 属性名         | 类型          | 描述                                                                                                                                                                         |
| -------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| offset         | number        | 箭头长度。例如，对于符号 "->"，offset 表示箭头大于号的宽度。                                                                                                                 |
| refX           | number (可选) | 箭头垂直于边的距离。例如，对于符号 "->"，refX 表示箭头大于号的高度。                                                                                                         |
| refY           | number (可选) | 箭头垂直于边的距离。例如，对于符号 "->"，refY 表示箭头大于号的高度。                                                                                                         |
| verticalLength | number        | 箭头垂直于边的距离。例如，对于符号 "->"，verticalLength 表示箭头大于号的高度。                                                                                               |
| endArrowType   | string (可选) | 终点箭头类型，目前LogicFlow内置支持用户设置以下4种箭头：<br/>`solid`: 实心箭头<br/>`hollow`: 线条箭头<br/>`diamond`: 菱形箭头<br/>`circle`: 圆形箭头<br/>内部默认会用`solid` |
| startArrowType | string (可选) | 起点箭头类型，目前LogicFlow内置支持用户设置以下4种箭头：<br/>`solid`: 实心箭头<br/>`hollow`: 线条箭头<br/>`diamond`: 菱形箭头<br/>`circle`: 圆形箭头<br/>内部默认会用`solid` |
| strokeLinecap  | string (可选) | 线条的端点样式，作用同SVG strokeLinecap，支持传入：'butt'、'round'、'square' 三个值                                                                                          |
| strokeLinejoin | string (可选) | 线条的连接样式，作用同SVG strokeLinecap，支持传入：'miter'、'round'、'bevel' 三个值                                                                                          |

### AnchorLineTheme
`AnchorLineTheme`类型表示节点锚点拖出的连线的主题，它继承自 [EdgeTheme](#edgetheme) 和 `EdgeAnimation`。

这些节点主题类型允许在 LogicFlow 库中自定义节点的外观，同时通过继承 [CommonTheme](#commontheme) 保持一致的主题结构，从而提供灵活的可视化表现。

