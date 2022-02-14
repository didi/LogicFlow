# TransformModel

控制画布的放大、缩小、平移

```ts
type PointTuple = [number, number]
```

## zoom(isZoomIn, point)

放大缩小画布. 放大缩小的刻度是`transformModel.ZOOM_SIZE`

|名称|类型|默认值|说明|
|-|-|-|-|
|isZoomIn|boolean|false| 是否放大， false表示缩小|
|point|PointTuple|无|放大缩小基准点，可以理解为transform-origin|

```js
const { transformModel } = lf.graphModel;
transformModel.zoom(true)
```

## translate(x, y)

移动画布

|名称|类型|默认值|说明|
|-|-|-|-|
|x|number|无|移动的X轴距离|
|y|number|无|移动的Y轴距离|

```js
const { transformModel } = lf.graphModel;
transformModel.translate(100, 100);
```


## focusOn(targetX, targetY, width, height)

将图形移动到画布中心

|名称|类型|默认值|说明|
|-|-|-|-|
|targetX|number|无|图形当前x坐标|
|targetY|number|无|图形当前y坐标|
|width|number|无|画布宽|
|height|number|无|画布高|

```js
const { transformModel, width, height } = lf.graphModel;
transformModel.focusOn(100, 100, width, height);
```

## setZoomMiniSize(size)

设置缩放时的最小值

|名称|类型|默认值|说明|
|-|-|-|-|
|size|number|无|缩小的倍数，0-1之间|

```js
const { transformModel } = lf.graphModel;
transformModel.setZoomMiniSize(0.1);
```

## setZoomMaxSize(size)

设置缩放的最大值

|名称|类型|默认值|说明|
|-|-|-|-|
|size|number|无|放大的倍数，大于1|

```js
const { transformModel } = lf.graphModel;
transformModel.setZoomMaxSize(10);
```
## HtmlPointToCanvasPoint

`方法`

将toolOverlay点基于缩放转换为canvasOverlay层上的点

参数

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| point | PointTuple | true | 无 | 坐标 |

返回值

PointTuple

```js
const { transformModel } = lf.graphModel;
const point = transformModel.HtmlPointToCanvasPoint([100, 100]);
// 如果画布x轴平移了+100，那么返回的值为[0, 100]
```

## CanvasPointToHtmlPoint

`方法`

将canvasOverlay层上的点基于缩放转换为toolOverlay上的点。

参数

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| point | PointTuple | true | 无 | 坐标 |

返回值

PointTuple

```js
const { transformModel } = lf.graphModel;
const point = transformModel.CanvasPointToHtmlPoint([100, 100]);
// 如果画布x轴平移了+100，那么返回的值为[200, 100]
```