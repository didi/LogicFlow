---
nav: API
title: transformModel
toc: content
order: 3
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

Control zoom in, zoom out, and panning of the canvas

```tsx | pure
type PointTuple = [number, number]
```

## zoom(zoomSize, point)

Zooming in and out of the canvas. The scale for zooming in and out is `transformModel.ZOOM_SIZE`.

| name     | type                           | default | description                                                                                                                                                                                                                                            |
|----------|--------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| isZoomIn | `TransformModel.ZoomParamType` | false   | The value of zoom in and zoom out, supports passing in numbers between 0 and n. Less than 1 means zoom out, more than 1 means zoom in. It also supports passing true and false to zoom in and out according to the built-in scale. `number \| boolean` |
| point    | PointTuple                     | -       | zoom-in/out datum, can be interpreted as transform-origin                                                                                                                                                                                              |

```tsx | pure
const { transformModel } = lf.graphModel;
transformModel.zoom(true)
```

## resetZoom

```tsx | pure
const { transformModel } = lf.graphModel;
transformModel.resetZoom()
```

## translate(x, y)

Moving the Canvas

| Name | Type   | Default Value | Description              |
|------|--------|---------------|--------------------------|
| x    | number | None          | X-axis distance traveled |
| y    | number | None          | Y-axis distance traveled |

```tsx | pure
const { transformModel } = lf.graphModel;
transformModel.translate(100, 100);
```

## focusOn(targetX, targetY, width, height)

Move the graph to the center of the canvas

| Name    | Type   | Default Value | Description                       |
|---------|--------|---------------|-----------------------------------|
| targetX | number | None          | current x-coordinate of the graph |
| targetY | number | None          | current y-coordinate of the graph |
| width   | number | No            | Canvas Width                      |
| height  | number | No            | Canvas Height                     |

```tsx | pure
const { transformModel, width, height } = lf.graphModel;
transformModel.focusOn(100, 100, width, height);
```

## HtmlPointToCanvasPoint <Badge>method</Badge>

Converts toolOverlay points to points on the canvasOverlay layer based on scaling

Parameters:
| Name | Type | Mandatory | Default | Description |
| :- | :- | :- | :- | :- |
| point | PointTuple | true | None | coordinate |

return: `PointTuple`

```js
const { transformModel } = lf.graphModel;
const point = transformModel.HtmlPointToCanvasPoint([100, 100]);
// If the canvas x-axis is translated by +100, then the value returned is [0, 100]
```

## CanvasPointToHtmlPoint <Badge>method</Badge>

Converts points on the canvasOverlay layer to points on the toolOverlay based on scaling.

Parameters:
| Name | Type | Mandatory | Default | Description |
| :- | :- | :- | :- | :- |
| point | PointTuple | true | None | Coordinates |

return: `PointTuple`

```js
const { transformModel } = lf.graphModel;
const point = transformModel.CanvasPointToHtmlPoint([100, 100]);
// If the canvas x-axis is panned by +100, then the value returned is [200, 100]
```

## updateTranslateLimits <Badge>method</Badge>

Updated canvas movement range

Parameters：`limit: boolean | "vertical" | "horizontal" | [number, number, number, number]`
