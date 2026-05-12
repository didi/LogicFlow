---
nav: API
group:
  title: LogicFlow 实例
  order: 2
title: 主题
toc: content
order: 9
---

本页说明 LogicFlow 实例在运行时如何读取、覆盖和扩展主题配置。

## setTheme

设置当前实例的主题。可只传部分字段，系统会与当前主题合并。

**签名**

```ts
setTheme(style: Partial<Theme>, themeMode?: string): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `style` | [`Partial<Theme>`](../type/Theme.zh.md#theme主题配置) | 是 | 主题增量配置。 |
| `themeMode` | `string` | 否 | 指定要应用的主题模式名。 |

**示例**

```ts
lf.setTheme({
  baseNode: {
    fill: '#ffffff',
    stroke: '#1f2937',
    strokeWidth: 2,
  },
  nodeText: {
    color: '#111827',
    fontSize: 12,
  },
});
```

## getTheme

获取当前画布生效的完整主题配置。

**签名**

```ts
getTheme(): Theme
```

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| [`Theme`](../type/Theme.zh.md#theme主题配置) | 当前完整主题对象。 |

**示例**

```ts
const currentTheme = lf.getTheme();
lf.setTheme({
  rect: {
    ...currentTheme.rect,
    fill: '#ff0000',
  },
});
```

## addThemeMode

注册新的主题模式，注册后可通过 `setTheme({}, themeMode)` 切换。

**签名**

```ts
addThemeMode(themeMode: string, style: Partial<Theme>): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `themeMode` | `string` | 是 | 主题模式名称。 |
| `style` | [`Partial<Theme>`](../type/Theme.zh.md#theme主题配置) | 是 | 该模式下的主题样式。 |

**示例**

```ts
lf.addThemeMode('custom', {
  rect: {
    fill: '#e6f7ff',
    stroke: '#1890ff',
    strokeWidth: 2,
  },
  nodeText: {
    color: '#333333',
    fontSize: 14,
  },
});

lf.setTheme({}, 'custom');
```

## 类型说明

### Theme（主题配置）

`Theme` 是运行时主题的总类型，覆盖节点、边、文本、锚点、箭头、选中态等样式入口。

| 属性名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `baseNode` | [`CommonTheme`](../type/Theme.zh.md#commontheme通用主题) | 所有节点通用样式。 |
| `baseEdge` | [`EdgeTheme`](../type/Theme.zh.md#edgetheme边主题) | 所有边通用样式。 |
| `rect/circle/diamond/ellipse/polygon` | [`NodeTheme`](../type/Theme.zh.md#nodetheme节点主题) | 对应节点形状样式。 |
| `line/polyline/bezier` | [`EdgeTheme`](../type/Theme.zh.md#edgetheme边主题) | 对应边形态样式。 |
| `text/nodeText/edgeText` | [`TextTheme`](../type/Theme.zh.md#texttheme文本主题) | 文本节点、节点文案、边文案样式。 |
| `anchor` | [`AnchorTheme`](../type/Theme.zh.md#anchortheme) | 锚点样式。 |
| `arrow` | [`ArrowTheme`](../type/Theme.zh.md#arrowtheme) | 箭头样式。 |
| `snapline` | [`EdgeTheme`](../type/Theme.zh.md#edgetheme边主题) | 对齐线样式。 |
| `outline` | [`OutlineTheme`](../type/Theme.zh.md#outlinetheme) | 选中/悬停外框样式。 |
| `edgeAdjust` | [`NodeTheme`](../type/Theme.zh.md#nodetheme节点主题) | 连线端点调整手柄样式。 |

### CommonTheme（通用主题）

`CommonTheme` 是多数主题类型共享的基础字段。

| 属性名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `fill` | `string \| 'none'` | 填充色。 |
| `stroke` | `string \| 'none'` | 描边色。 |
| `strokeWidth` | `number` | 描边宽度。 |
| `radius/rx/ry` | `number` | 圆角相关配置。 |
| `width/height` | `number` | 可用于部分图形尺寸样式。 |
| `path` | `string` | 自定义 SVG 路径。 |
| `[key: string]` | `unknown` | 透传扩展 SVG 属性。 |

### NodeTheme（节点主题）

`NodeTheme` 用于节点图形样式（如 [`RectTheme`](../type/Theme.zh.md#recttheme)、[`CircleTheme`](../type/Theme.zh.md#circletheme)、[`PolygonTheme`](../type/Theme.zh.md#polygontheme)、[`EllipseTheme`](../type/Theme.zh.md#ellipsetheme)），本质上都基于 [`CommonTheme`](../type/Theme.zh.md#commontheme通用主题)。

### EdgeTheme（边主题）

`EdgeTheme` 基于 [`CommonTheme`](../type/Theme.zh.md#commontheme通用主题)，并扩展边样式能力。

| 属性名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `strokeDasharray` | `string` | 虚线样式。 |
| `animation` | [`EdgeAnimation`](../type/Theme.zh.md#edgeanimation) | 边动画配置。 |

曲线边还可扩展 `adjustLine` 与 `adjustAnchor`。

### TextTheme（文本主题）

`TextTheme` 在 [`CommonTheme`](../type/Theme.zh.md#commontheme通用主题) 基础上扩展文本样式字段。

| 属性名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `color` | `string \| 'none'` | 文字颜色。 |
| `fontSize` | `number` | 字号。 |
| `textWidth` | `number` | 文本宽度（可选）。 |
| `lineHeight` | `number` | 行高（可选）。 |
| `textAnchor` | `'start' \| 'middle' \| 'end'` | 水平对齐（可选）。 |
| `dominantBaseline` | `string` | 垂直基线（可选）。 |

节点文本可继续扩展 `overflowMode`、`background`、`wrapPadding`；边文本可在此基础上扩展 `hover`。

### 其他主题类型

- [`AnchorTheme`](../type/Theme.zh.md#anchortheme)：锚点样式，支持 `r` 与 `hover`。
- [`ArrowTheme`](../type/Theme.zh.md#arrowtheme)：箭头样式，支持 `offset`、`verticalLength`、`startArrowType`、`endArrowType` 等。
- [`OutlineTheme`](../type/Theme.zh.md#outlinetheme)：选中框样式，支持 `hover`。
- [`EdgeAnimation`](../type/Theme.zh.md#edgeanimation)：边动画样式，支持虚线偏移、时长、次数等字段。

构造期 style / themeMode 见 [构造方法](../logicflow-constructor/index.zh.md)。
