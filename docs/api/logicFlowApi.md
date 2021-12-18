# LogicFlow

流程图上所有的节点实例操作以及事件，行为监听都在 `LogicFlow` 实例上进行。

## constructor

`LogicFlow` 配置项

```js
const lf = new LogicFlow(config: Object)
```

| 名称 | 类型 | 必选 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| container | HTMLElement | ✅ | - | 图的 DOM 容器。 |
| width | Number | | 100% | 指定画布宽度，单位为 'px'。 |
| height | Number | | 100% | 指定画布高度，单位为 'px'。 |
| [background](#background) | false \| Object | |false | 背景，默认无背景 |
| [grid](#grid) | false \| Object | | false |网格，若设为`false`不开启网格，则为 1px 移动单位，不绘制网格背景，若设置为`true`开启则默认为 20px 点状网格 |
| textEdit | Boolean | | true | 是否开启文本编辑 |
| [style](#style) | Object | | - | 样式 |
| isSilentMode | Boolean | | false | 仅浏览不可编辑模式，默认不开启 |
| hideAnchors | Boolean | | false | 是否隐藏节点的锚点，静默模式下默认隐藏 |
| hoverOutline | Boolean | | false | hover时是否显示外边框 |
| edgeType | String | | 'polyline' | 边的类型，支持自定义，内置直线'line'和折线'polyline'，默认折线 |
| snapline | Boolean | | true | 是否启用节点辅助对齐线 |
| guards | Array | | - | 是否增加守卫函数，函数返回true则执行默认逻辑，返回false则阻止 |
| disabledPlugins | Array[pluginName] | | - | 控制当前禁用的插件 |
|stopZoomGraph|boolean|- |false|禁止缩放画布|
|stopScrollGraph|boolean|- |false|禁止鼠标滚动移动画布|
|stopMoveGraph|boolean|- |false|禁止拖动画布|
|adjustEdge|boolean|- |true|允许调整边|
|adjustNodePosition|boolean|- |true|允许拖动节点|
|hideAnchors|boolean|- |false|隐藏节点所有锚点|
|hoverOutline|boolean|- |false|鼠标hover的时候显示节点的外框|
|nodeTextEdit|boolean|- |true|允许节点文本可以编辑|
|edgeTextEdit|boolean|- |true|允许边文本可以编辑|
|nodeTextDraggable|boolean| - |false|允许节点文本可以拖拽|
|edgeTextDraggable|boolean| - |false|允许边文本可以拖拽|
|metaKeyMultipleSelected|boolean| - |false|允许按照meta键多选元素|

### `background`

背景默认无，支持选项：

```js
export type BackgroundConfig = {
  image?: string; // 背景图片地址
  color?: string; // 背景色
  repeat?: string; // 背景图片重复
  position?: string; // 背景图片位置
  size?: string; // 背景图片尺寸
  opacity?: number; // 背景透明度
};
```

### `grid`

网格默认开启，支持选项：

```js
export type GridOptions = {
  size?: number // 栅格
  visible?: boolean, // 是否可见，false则隐藏网格线但是保留栅格效果
  type?: 'dot' | 'mesh', // 网格样式，目前内置支持点状'dot'和网格'mesh'
  config?: {
    color: string, // 网格颜色
    thickness?: number, // 网格线宽度
  }
};
```

### `style`

可以通过style配置主题，详细支持的样式选项见教程[主题 Theme](/guide/advance/theme.html)

### `snapline`

对齐线，包含节点的中心点、上下边框、左右边框对齐。

- 在编辑模式下，默认开启对齐线，将snapline设置为false，关闭对齐线。
- 在不可编辑模式下，对齐线关闭。

## register

注册节点

```js
register(config):void
```

参数：

| 参数名 | 类型 | 必传 |默认值 | 描述 |
| :- | :- | :- | :- | :- |
| config.type | String | ✅ | - | 自定义节点的名称 |
| config.model | Model | ✅ | - | 节点的model |
| config.view | View | ✅ | - | 节点的view |

示例：

```js
import { RectNode, RectNodeModel, h } from '@logicflow/core'
// 提供节点
class UserNode extends RectNode {
}
// 提供节点的属性
class UserModel extends RectNodeModel {
  constructor(data) {
    super(data);
    const { size } = data.properties;
    this.width = size * 40;
    this.height = size * 40;
    this.fill = 'green';
  }
}
lf.register({
  type: 'user',
  view: UserNode,
  model: UserModel,
});
```

## addNode

在图上添加节点。

```js
addNode(nodeConfig: NodeConfig):nodeModel
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| type | String | ✅ | - | 节点类型名称 |
| x | Number | ✅ | - | 节点横坐标x |
| y | Number | ✅ | - | 节点纵坐标y |
| text | Object | | - | 节点文案内容及位置坐标 |
| id | String | | - | 节点id |
| properties | Object | |  - | 节点属性，用户可以自定义 |

示例：

```js
lf.addNode({
  type: 'user',
  x: 500,
  y: 600,
  id: 20,
  text:{
    value: 'test',
    x: 500,
    y: 600,
  },
  properties: {
    size: 1
  }
})
```

## deleteNode

删除图上的节点, 如果这个节点上有连接线，则同时删除线。

```js
deleteNode(nodeId: string): void
```

参数：

| 名称 | 类型 | 必传 |默认值 | 描述 |
| :- | :- | :- |:- | :- |
| nodeId | String | ✅ | - | 要删除节点的id |

示例：

```js
lf.deleteNode('id');
```

## addEdge

创建连接两个节点的边

```js
addEdge(edgeConfig: EdgeConifg): void
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- |:- | :- |
| id | String | | - | 边的id |
| type | String | | - | 边的类型 |
| sourceNodeId | String | ✅ | - | 边起始节点的id |
| targetNodeId | String | ✅ | - | 边终止节点的id |
| startPoint | Object | | - | 边起点坐标 |
| endPoint | Object | | - | 边终端坐标 |
| text | String | | - | 边文案 |

示例：

```js
lf.addEdge({
  sourceNodeId: '10',
  targetNodeId: '21',
  startPoint: {
    x: 11,
    y: 22,
  }
  endPoint: {
    x: 33,
    y: 44,
  }
  text: '边文案',
});
```

## removeEdge

基于边的起终点删除边

```js
removeEdge(config: EdgeFilter): void
```

参数：

| 名称 | 类型 | 必传 |默认值 | 描述 |
| :- | :- | :- |:- | :- |
| sourceNodeId | String | | - | 边起始节点的id |
| targetNodeId | String | | - | 边终止节点的id |

示例：

```js
lf.removeEdge({
  sourceNodeId:'id1',
  targetNodeId: 'id2'
});
```

## on

图的监听事件

```js
on(evt: string, callback: Function): this
// 回调函数参数
{
  e, // 鼠标的原生事件对象 <MouseEvent>
  data?, // 元素的通用属性
  position?, // 鼠标在画布中的触发点坐标 { x, y }
  msg?, // 边的校验信息
}
```

参数：

| 名称 | 类型 | 必传 |默认值 | 描述 |
| :- | :- | :- |:- | :- |
| evt | String | ✅ | - | 事件名称|
| callback | String | ✅ | - | 回调函数 |

示例：

```js
lf.on('node:click', (args) => {
  console.log('node:click', args.position)
})
lf.on('element:click', (args) => {
  console.log('element:click', args.e.target)
})
```

事件名称全集：

```js
export enum EventType {
  ELEMENT_CLICK = 'element:click', // 是 node:click & edge:click 的并集
  NODE_CLICK = 'node:click',
  NODE_DBCLICK = 'node:dbclick',
  NODE_DELETE = 'node:delete',
  NODE_ADD = 'node:add',
  NODE_MOUSEDOWN = 'node:mousedown',
  NODE_DRAGSTART = 'node:dragstart',
  NODE_DRAG = 'node:drag',
  NODE_DROP = 'node:drop',
  NODE_MOUSEUP = 'node:mouseup',
  NODE_MOUSEMOVE = 'node:mousemove',
  NODE_CONTEXTMENU = 'node:contextmenu',
  EDGE_DELETE = 'edge:delete',
  EDGE_ADD = 'edge:add',
  EDGE_CLICK = 'edge:click',
  EDGE_DBCLICK = 'edge:dbclick',
  EDGE_CONTEXTMENU = 'edge:contextmenu',
  BLANK_MOUSEDOWN = 'blank:mousedown',
  BLANK_MOUSEMOVE = 'blank:mousemove',
  BLANK_MOUSEUP = 'blank:mouseup',
  BLANK_DRAGSTART = 'blank:dragstart',
  BLANK_DRAG = 'blank:drag',
  BLANK_DROP = 'blank:drop',
  BLANK_CLICK = 'blank:click',
  BLANK_CONTEXTMENU = 'blank:contextmenu',
  CONNECTION_NOT_ALLOWED = 'connection:not-allowed',
  HISTORY_CHANGE = 'history:change',
}
```

## off

删除事件监听

```js
off(evt: string, callback: Function): this
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| evt | String | ✅ | - | 事件名称|
| callback | String | ✅ | - | 回调函数 |

示例：

```js
lf.off('node:click', () => {
  console.log('node:click off')
})
lf.off('element:click', () => {
  console.log('element:click off')
})
```

## undo

撤销

示例：

```js
lf.undo()
```

## redo

重做

示例：

```js
lf.redo()
```

## zoom

放大缩小

```js
zoom(0.5, [400, 400]): string
// 返回值为放大缩小的比例
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| isZoomIn | Boolean或Number | | false | 放大缩小的值，支持传入0-n之间的数字。小于1表示缩小，大于1表示放大。也支持传入true和false按照内置的刻度放大缩小 |
| isZoomIn | [x,y] | | false | 缩放的原点, 不传默认左上角 |

示例：

```js
lf.zoom(true)
```

## resetZoom

还原

```js
resetZoom(): void
```

示例：

```js
lf.resetZoom()
```

## setZoomMiniSize

设置缩放最小倍数

```js
setZoomMiniSize(size: number): void
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| size | Number | ✅ | 0.2 | 最小缩放比，默认0.2 |

示例：

```js
lf.setZoomMiniSize(0.3)
```

## setZoomMaxSize

设置放大最大倍数

```js
setZoomMaxSize(size: number): void
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| size | Number | ✅ | 16 | 最大放大倍数，默认16 |

示例：

```js
lf.setZoomMaxSize(20)
```

## focusOn

将图形定位到画布中心

```js
focusOn(focusOnArgs: FocusOnArgs): void
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| id | String | | - | 图形的id |
| coordinate | Object | | - | 图形当前的位置坐标 |

示例：

```js
lf.focusOn({
  id: '22'
})

lf.focusOn({
  coordinate: {
    x: 11,
    y: 22
  }
})
```

## getPointByClient

获取事件位置相对于画布左上角的坐标

画布所在的位置可以是页面任何地方，原生事件返回的坐标是相对于页面左上角的，该方法可以提供以画布左上角为原点的准确位置。

```js
getPointByClient(x: number, y: number)
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| x | Number | ✅ | - | 相对于页面左上角的`x`坐标，一般是原生事件返回的`x`坐标 |
| y | Number | ✅ | - | 相对于页面左上角的`y`坐标，一般是原生事件返回的`y`坐标 |

返回值：

| 名称 | 类型 | 描述 |
| :- | :- | :- |
| point | Point | 相对于画布左上角的两种坐标 |

```ts
type Position = {
  x: number;
  y: number;
}
type Point = {
  domOverlayPosition: Position; // HTML 层上相对于画布左上角的坐标`{x, y}`
  canvasOverlayPosition: Position; // SVG 层上相对于画布左上角的坐标`{x, y}`
}
```

示例：

```js
lf.getPointByClient(event.x, event.y)
```

## cloneNode

克隆节点

```js
cloneNode(nodeId: string): BaseNodeModel
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| nodeId | String | ✅ | - | 目标节点id |

示例：

```js
lf.cloneNode('id')
```

## getNodeModelById

获取节点的`model`数据

```js
getNodeModelById(nodeId: string): BaseNodeModel
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| nodeId | String | ✅ | - | 节点id |

示例：

```js
lf.getNodeModelById('id')
```

## getEdge

通过边的`id`或边连接的节点的`id`来获取边的`model`，其中通过边的连接节点来获取到的边可能有多个。

```js
getEdge(config: EdgeFilter): BaseEdgeModel[]
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| id | String | | - | 边的id |
| sourceNodeId | String | | - | 边的起始节点id |
| targetNodeId | String | | - | 边的目标节点id |

示例：

```js
lf.getEdgeModels({
  sourceNodeId: 'id1',
  targetNodeId: 'id2'
})
lf.getEdgeModels({
  sourceNodeId: 'id1'
})
lf.getEdgeModels({
  targetNodeId: 'id2'
})
```

## getEdgeDataById

通过`id`获取边的数据

```js
getEdgeDataById(edgeId: string): EdgeConfig
// 返回值
export type EdgeConfig = {
  id: string;
  type: string;
  sourceNodeId: string;
  targetNodeId: string;
  startPoint?: {
    x: number;
    y: number;
  },
  endPoint?: {
    x: number;
    y: number;
  },
  text?: {
    x: number;
    y: number;
    value: string;
  },
  pointsList?: Point[];
  properties?: Record<string, unknown>;
};
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| edgeId | String | ✅ | - | 边的id |

示例：

```js
lf.getEdgeDataById('id')
```

## setDefaultEdgeType

设置边的类型

```js
setDefaultEdgeType(type: EdgeType): void
```

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| type | String | ✅ | 'polyline' | 设置边的类型，内置支持的边类型有line(直线)、polyline(折线)、bezier(贝塞尔曲线)，默认为折线，用户可以自定义type名切换到用户自定义的边 |

示例：

```js
lf.setDefaultEdgeType('line')
```

## getGraphData

获取流程绘图数据

```ts
//返回值，如果是应用了adapter插件，且设置为adapterOut，返回为转换后的数据格式，否则为默认的格式
getGraphData(): GraphConfigData | unknown
```

LogicFlow 默认数据格式

```ts
type GraphConfigData = {
  nodes: {
    id?: string;
    type: string;
    x: number;
    y: number;
    text?: TextConfig;
    properties?: Record<string, unknown>;
  }[];
  edges: {
      id: string;
      type: string;
      sourceNodeId: string;
      targetNodeId: string;
      startPoint: any;
      endPoint: any;
      text: {
          x: number;
          y: number;
          value: string;
      };
      properties: {};
  }[];
}
```

示例：

```js
lf.getGraphData()
```

## getGraphRawData

获取流程绘图原始数据， 与getGraphData区别是该方法获取的数据不会受到adapter影响。

```ts
getGraphRawData(): GraphConfigData
```

示例：

```js
lf.getGraphRawData()
```

## setProperties

设置节点或者边的自定义属性

```ts
setProperties(id: string, properties: Object): void
```

示例：

```js
lf.setProperties('aF2Md2P23moN2gasd', {
  isRollbackNode: true
})
```

## getProperties

获取节点或者边的自定义属性

```ts
getProperties(id: string): Object
```

示例：

```js
lf.getProperties('id')
```


## changeNodeId

修改节点的id， 如果不传新的id，会内部自动创建一个。

示例：

```js
lf.changeNodeId('oldId', 'newId')
```

## changeEdgeId

修改边的id， 如果不传新的id，会内部自动创建一个。

示例：

```js
lf.changeEdgeId('oldId', 'newId')
```

## updateText

更新节点或者边的文案

```ts
updateText(id: string, value: string): void
```

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| id | String | ✅ |  | 节点或者边id |
| value | String | ✅ |  | 更新后的文本值 |


示例：

```js
lf.updateText('id', 'value')
```

## getEditConfig

获取流程编辑基本配置


```js
lf.getEditConfig()
```

## updateEditConfig

更新流程编辑基本配置

详细参数见： 

```js
lf.updateEditConfig({
  stopZoomGraph: true
})
```

## getSelectElements

获取选中的所有元素

```ts
getSelectElements(isIgnoreCheck: boolean): GraphConfigData
```

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| isIgnoreCheck | boolean | ✅ | true | 是否包括sourceNode和targetNode没有被选中的边, 默认包括。 |


```js
lf.getSelectElements(false)
```

## clearSelectElements

取消所有元素的选中状态

```js
lf.clearSelectElements()
```

## select

将指定图形选中

```js
lf.select(id)
```

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| id | string | ✅ |  | 需选中(节点或者边)id |

## changeNodeType

修改节点类型

```ts
lf.changeNodeType(id: string, type: string)
```
