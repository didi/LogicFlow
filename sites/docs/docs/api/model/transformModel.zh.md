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

控制画布的放大、缩小、平移

```tsx | pure
type PointTuple = [number, number]
```

## zoom(zoomSize, point)

放大缩小画布. 放大缩小的刻度是`transformModel.ZOOM_SIZE`

| 名称       | 类型                             | 默认值   | 说明                                                                                 |
|----------|--------------------------------|-------|------------------------------------------------------------------------------------|
| isZoomIn | `TransformModel.ZoomParamType` | false | 放大缩小的值，支持传入0-n之间的数字。小于1表示缩小，大于1表示放大。也支持传入true和false按照内置的刻度放大缩小 `number \| boolean` |
| point    | PointTuple                     | 无     | 放大缩小基准点，可以理解为transform-origin                                                      |

```tsx | pure
const { transformModel } = lf.graphModel;
transformModel.zoom(true)
```

## resetZoom

重置 zoom

```tsx | pure
const { transformModel } = lf.graphModel;
transformModel.resetZoom()
```

## translate(x, y)

移动画布

| 名称 | 类型     | 默认值 | 说明      |
|----|--------|-----|---------|
| x  | number | 无   | 移动的X轴距离 |
| y  | number | 无   | 移动的Y轴距离 |

```tsx | pure
const { transformModel } = lf.graphModel;
transformModel.translate(100, 100);
```

## focusOn(targetX, targetY, width, height)

将图形移动到画布中心

| 名称      | 类型     | 默认值 | 说明      |
|---------|--------|-----|---------|
| targetX | number | 无   | 图形当前x坐标 |
| targetY | number | 无   | 图形当前y坐标 |
| width   | number | 无   | 画布宽     |
| height  | number | 无   | 画布高     |

```tsx | pure
const { transformModel, width, height } = lf.graphModel;
transformModel.focusOn(100, 100, width, height);
```

## HtmlPointToCanvasPoint <Badge>方法</Badge>

将toolOverlay点基于缩放转换为canvasOverlay层上的点

参数:
| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| point | PointTuple | true | 无 | 坐标 |

返回值: `PointTuple`

```js
const { transformModel } = lf.graphModel;
const point = transformModel.HtmlPointToCanvasPoint([100, 100]);
// 如果画布x轴平移了+100，那么返回的值为[0, 100]
```

## CanvasPointToHtmlPoint <Badge>方法</Badge>

将canvasOverlay层上的点基于缩放转换为toolOverlay上的点。

参数:
| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| point | PointTuple | true | 无 | 坐标 |

返回值: `PointTuple`

```js
const { transformModel } = lf.graphModel;
const point = transformModel.CanvasPointToHtmlPoint([100, 100]);
// 如果画布x轴平移了+100，那么返回的值为[200, 100]
```

## updateTranslateLimits <Badge>方法</Badge>

更新画布可以移动范围

入参：`limit: boolean | "vertical" | "horizontal" | [number, number, number, number]`
