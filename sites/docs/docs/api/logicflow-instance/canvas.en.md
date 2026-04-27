---
nav: API
group:
  title: LogicFlow Instance
  order: 2
title: Canvas
toc: content
order: 8
---

This page documents instance APIs for canvas size, viewport transforms, coordinate conversion, and edge animation.

### resize

Resize the canvas; when omitted, width and height are recomputed from the container.

**Signature**

```ts
resize(width?: number, height?: number): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `width` | `number` | No | Target width. |
| `height` | `number` | No | Target height. |

### focusOn

Center the viewport on a node id or a canvas coordinate.

**Signature**

```ts
focusOn(focusOnArgs: { id?: string; coordinate?: { x: number; y: number } }): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `focusOnArgs` | `object` | Yes | Provide either `id` or `coordinate`. |

### zoom

Zoom by step or explicit ratio, optionally around a point.

**Signature**

```ts
zoom(zoomSize?: boolean | number, point?: [number, number]): string
```

**Returns**

- `string`: current zoom as a percentage string.

### resetZoom

Reset zoom to `1`.

**Signature**

```ts
resetZoom(): void
```

### setZoomMiniSize

Set the minimum allowed zoom factor.

**Signature**

```ts
setZoomMiniSize(size: number): void
```

### setZoomMaxSize

Set the maximum allowed zoom factor.

**Signature**

```ts
setZoomMaxSize(size: number): void
```

### getTransform

Read the current transform (scale and translation).

**Signature**

```ts
getTransform(): {
  SCALE_X: number;
  SCALE_Y: number;
  TRANSLATE_X: number;
  TRANSLATE_Y: number;
}
```

### translate

Translate the canvas by a relative offset.

**Signature**

```ts
translate(x: number, y: number): void
```

### resetTranslate

Reset translation to the initial state.

**Signature**

```ts
resetTranslate(): void
```

### translateCenter

Center the graph content inside the viewport.

**Signature**

```ts
translateCenter(): void
```

### fitView

Adjust zoom and translation so the graph fits the viewport.

**Signature**

```ts
fitView(verticalOffset?: number, horizontalOffset?: number): void
```

### getPointByClient

Convert page coordinates to overlay positions (DOM and canvas layers).

**Signature**

```ts
getPointByClient(x: number, y: number): {
  domOverlayPosition: { x: number; y: number };
  canvasOverlayPosition: { x: number; y: number };
}
```

### toFront

Raise the z-order of a node or edge.

**Signature**

```ts
toFront(id: string): void
```

### openEdgeAnimation

Enable animation for an edge.

**Signature**

```ts
openEdgeAnimation(edgeId: string): void
```

### closeEdgeAnimation

Disable animation for an edge.

**Signature**

```ts
closeEdgeAnimation(edgeId: string): void
```

### Common recipes

```ts
lf.resize();
lf.translateCenter();
lf.zoom(1.2);

const point = lf.getPointByClient(300, 200);
lf.focusOn({ coordinate: point.canvasOverlayPosition });
```
