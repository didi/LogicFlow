---
nav: API
group:
  title: LogicFlow Instance
  order: 2
title: Theme
toc: content
order: 9
---

This page explains how a LogicFlow instance reads, overrides, and extends theme configuration at runtime.

## setTheme

Apply a partial theme; values merge with the active theme.

**Signature**

```ts
setTheme(style: Partial<Theme>, themeMode?: string): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `style` | [`Partial<Theme>`](../type/Theme.en.md#theme) | Yes | Incremental theme fields. |
| `themeMode` | `string` | No | Named theme mode to activate. |

**Example**

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

Return the full theme currently in effect.

**Signature**

```ts
getTheme(): Theme
```

**Returns**

| Type | Description |
| :--- | :--- |
| [`Theme`](../type/Theme.en.md#theme) | Complete theme object. |

**Example**

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

Register a named theme mode, then switch with `setTheme({}, themeMode)`.

**Signature**

```ts
addThemeMode(themeMode: string, style: Partial<Theme>): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `themeMode` | `string` | Yes | Mode name. |
| `style` | [`Partial<Theme>`](../type/Theme.en.md#theme) | Yes | Theme payload for that mode. |

**Example**

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

## Type reference

### Theme

`Theme` is the root runtime theme object covering nodes, edges, text, anchors, arrows, selection chrome, and more.

| Field | Type | Description |
| :--- | :--- | :--- |
| `baseNode` | [`CommonTheme`](../type/Theme.en.md#commontheme) | Defaults shared by all nodes. |
| `baseEdge` | [`EdgeTheme`](../type/Theme.en.md#edgetheme) | Defaults shared by all edges. |
| `rect` / `circle` / `diamond` / `ellipse` / `polygon` | [`NodeTheme`](../type/Theme.en.md#recttheme) | Per-shape node styling. |
| `line` / `polyline` / `bezier` | [`EdgeTheme`](../type/Theme.en.md#edgetheme) | Per edge-type styling. |
| `text` / `nodeText` / `edgeText` | [`TextTheme`](../type/Theme.en.md#texttheme) | Text nodes and labels. |
| `anchor` | [`AnchorTheme`](../type/Theme.en.md#anchortheme) | Anchor styling. |
| `arrow` | [`ArrowTheme`](../type/Theme.en.md#arrowtheme) | Arrowheads. |
| `snapline` | [`EdgeTheme`](../type/Theme.en.md#edgetheme) | Snapline appearance. |
| `outline` | [`OutlineTheme`](../type/Theme.en.md#outlinetheme) | Hover/selection outlines. |
| `edgeAdjust` | [`NodeTheme`](../type/Theme.en.md#recttheme) | Edge endpoint adjustment handles. |

### CommonTheme

Shared fields for most theme records.

| Field | Type | Description |
| :--- | :--- | :--- |
| `fill` | `string \| 'none'` | Fill color. |
| `stroke` | `string \| 'none'` | Stroke color. |
| `strokeWidth` | `number` | Stroke width. |
| `radius` / `rx` / `ry` | `number` | Corner radii. |
| `width` / `height` | `number` | Optional sizing hints. |
| `path` | `string` | Custom SVG path. |
| `[key: string]` | `unknown` | Additional SVG attributes. |

### NodeTheme

Used for concrete node shapes such as [`RectTheme`](../type/Theme.en.md#recttheme), [`CircleTheme`](../type/Theme.en.md#circletheme), [`PolygonTheme`](../type/Theme.en.md#polygontheme), and [`EllipseTheme`](../type/Theme.en.md#ellipsetheme); all extend [`CommonTheme`](../type/Theme.en.md#commontheme).

### EdgeTheme

Extends [`CommonTheme`](../type/Theme.en.md#commontheme) with edge-specific fields.

| Field | Type | Description |
| :--- | :--- | :--- |
| `strokeDasharray` | `string` | Dash pattern. |
| `animation` | [`EdgeAnimation`](../type/Theme.en.md#edgeanimation) | Edge animation config. |

Curved edges may also define `adjustLine` and `adjustAnchor`.

### TextTheme

Extends [`CommonTheme`](../type/Theme.en.md#commontheme) with typography fields.

| Field | Type | Description |
| :--- | :--- | :--- |
| `color` | `string \| 'none'` | Text color. |
| `fontSize` | `number` | Font size. |
| `textWidth` | `number` | Optional text box width. |
| `lineHeight` | `number` | Optional line height. |
| `textAnchor` | `'start' \| 'middle' \| 'end'` | Horizontal alignment. |
| `dominantBaseline` | `string` | Vertical baseline. |

Node text may add `overflowMode`, `background`, `wrapPadding`; edge text may add `hover`.

### Other theme types

- [`AnchorTheme`](../type/Theme.en.md#anchortheme): anchor radius and hover state.
- [`ArrowTheme`](../type/Theme.en.md#arrowtheme): offsets, lengths, arrow kinds.
- [`OutlineTheme`](../type/Theme.en.md#outlinetheme): selection box hover styling.
- [`EdgeAnimation`](../type/Theme.en.md#edgeanimation): dash offset, duration, repeat count, etc.

Constructor-time `style` / `themeMode`: [Constructor](../logicflow-constructor/index.en.md).
