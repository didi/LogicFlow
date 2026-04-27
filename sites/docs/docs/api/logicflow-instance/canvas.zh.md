---
nav: API
group:
  title: LogicFlow 实例
  order: 2
title: 画布相关
toc: content
order: 8
---

本页汇总 LogicFlow 实例中与画布尺寸、视口变换、坐标换算和边动画相关的方法。

### resize

调整画布尺寸；未传参数时自动按容器尺寸重算。

**签名**

```ts
resize(width?: number, height?: number): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `width` | `number` | 否 | 目标宽度。 |
| `height` | `number` | 否 | 目标高度。 |

### focusOn

将视口中心定位到指定节点，或指定坐标点。

**签名**

```ts
focusOn(focusOnArgs: { id?: string; coordinate?: { x: number; y: number } }): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `focusOnArgs` | `object` | 是 | `id` 与 `coordinate` 二选一。 |

### zoom

按步进或指定倍率缩放画布，并可指定缩放原点。

**签名**

```ts
zoom(zoomSize?: boolean | number, point?: [number, number]): string
```

**返回值**

- `string`：当前缩放比例百分比。

### resetZoom

将画布缩放比例重置为 `1`。

**签名**

```ts
resetZoom(): void
```

### setZoomMiniSize

设置画布允许的最小缩放倍数。

**签名**

```ts
setZoomMiniSize(size: number): void
```

### setZoomMaxSize

设置画布允许的最大缩放倍数。

**签名**

```ts
setZoomMaxSize(size: number): void
```

### getTransform

获取当前画布变换状态（缩放与平移）。

**签名**

```ts
getTransform(): {
  SCALE_X: number;
  SCALE_Y: number;
  TRANSLATE_X: number;
  TRANSLATE_Y: number;
}
```

### translate

按相对偏移量平移画布。

**签名**

```ts
translate(x: number, y: number): void
```

### resetTranslate

将画布平移状态重置到初始位置。

**签名**

```ts
resetTranslate(): void
```

### translateCenter

将当前图内容居中显示在画布视口内。

**签名**

```ts
translateCenter(): void
```

### fitView

自动调整缩放与平移，使图内容尽可能完整显示在当前视口。

**签名**

```ts
fitView(verticalOffset?: number, horizontalOffset?: number): void
```

### getPointByClient

将页面坐标转换为画布坐标（同时返回 DOM 层与 SVG 层坐标）。

**签名**

```ts
getPointByClient(x: number, y: number): {
  domOverlayPosition: { x: number; y: number };
  canvasOverlayPosition: { x: number; y: number };
}
```

### toFront

将指定节点或边置于更高层级。

**签名**

```ts
toFront(id: string): void
```

### openEdgeAnimation

开启指定边的动画效果。

**签名**

```ts
openEdgeAnimation(edgeId: string): void
```

### closeEdgeAnimation

关闭指定边的动画效果。

**签名**

```ts
closeEdgeAnimation(edgeId: string): void
```

### 常见组合示例

```ts
// 先自适应，再居中，再按指定倍率缩放
lf.resize();
lf.translateCenter();
lf.zoom(1.2);

// 点坐标转换后定位到该处
const point = lf.getPointByClient(300, 200);
lf.focusOn({ coordinate: point.canvasOverlayPosition });
```
