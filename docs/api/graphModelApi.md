# graphModel

LogicFlow中整个lf实例对象对应的model。LogicFlow上的大多方法都是在graphModel上进行的简单封装。

## nodes

画布所有的节点对象

## edges

画布所有的连接对象

## transformMatrix

当前画布平移、缩放矩阵model。

详细API[见](/api/transformModelApi.html)

## nodesMap `只读`

画布所有节点的构成的map

## edgesMap `只读`

画布所有连线构成的map

## editConfig

页面编辑基本配置对象

## partial

是否开启局部渲染，当页面元素数量过多的时候，开启局部渲染会提高页面渲染性能。

## sortElements `只读`

按照zIndex排序后的元素、zIndex控制元素叠加的时候谁在上面。

## textEditElement `只读`

当前被编辑的元素

## getAreaElement(leftTopPoint, rightBottomPoint)

获取指定区域内的所有元素

|名称|类型|默认值|说明|
|-|-|-|-|
|leftTopPoint|PointTuple|无| 区域左上方的点 |
|rightBottomPoint|PointTuple|无| 区域右下角的点 |

## getModel(type)

获取指定类型的Model构造函数

## getNodeModel(type)

获取指定类型节点的Mdoel构造函数

## getPointByClient(point)

获取鼠标点击的位置在画布上的坐标

> 因为流程图所在的位置可以是页面任何地方,当内部事件需要获取触发事件时，其相对于画布左上角的位置.需要事件触发位置减去画布相对于client的位置.

|名称|类型|默认值|说明|
|-|-|-|-|
|point|Position|无| HTML坐标 |

返回值 

|名称|类型|默认值|说明|
|-|-|-|-|
|domOverlayPosition|Position|无| HTML层坐标，一般控制组件的位置时使用此坐标 |
|canvasOverlayPosition|Position|无| Canvas层坐标，一般节点、连线的坐标是这一层的坐标 |

为什么要这个方法，为什么鼠标点击的同一个位置会产生两个不同的坐标？

因为画布存在缩放和平移。当移动了画布，在视觉上看起来，画布上的元素位置变了，但是在数据层面，画布上的节点和连线位置是没有变化的。反过来举个例子：在一个宽高为1000px * 1000px的画布中间有一个节点，这个节点的位置很可能是`{x: -999,y: -999}`, 因为平移过来的。但是当双击这个节点，我们需要在节点位置显示一个文本输入框的时候，因为输入框是在`domOverlay`层，这一层不像`CanvasOverlay`一样有缩放和平移，其宽高和画布宽高一致。所以这个文本输入框坐标应该是`{x: 500, y: 500}`。

我们再来看为什么要这个方法？

假设这个画布距离浏览器顶部距离为100，左侧距离也为100. 那么当用户点击画布中心的时候，js监听点击函数拿到的位置应该是`{x: 600, y: 600}`, 这个时候调用这个方法，就可以得到 `canvasOverlayPosition` 为`{x: -999,y: -999}`，`domOverlayPosition` 为 `{x: 500, y: 500}`。开发者就可以基于这两个坐标进行自己需要的开发。比如在`domOverlayPosition`位置显示一个菜单之类的。

## isElementInArea(element, lt, rb, wholeEdge = true)

判断一个元素是否在指定矩形区域内。

- element 节点或者连线
- lt 左上角点
- rb 右下角点
- wholeEdge 连线是否要所有的节点都在区域内