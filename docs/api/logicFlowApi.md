# LogicFlow

流程图上所有的节点实例操作以及事件，行为监听都在 `LogicFlow` 实例上进行。

## constructor

`LogicFlow` 配置项

```js
const lf = new LogicFlow(options: Options)
```

| 选项 | 类型 | 必选 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| container | HTMLElement | ✅ | - | 图的 DOM 容器。 |
| width | Number |- | - | 指定画布宽度，单位为 'px'，默认使用容器宽度。 |
| height | Number |- | - | 指定画布高度，单位为 'px'，默认使用容器高度。 |
| [background](#background) | false \| Object |- |false | 背景，默认无背景 |
| [grid](#grid) | false \| Object |- | false |网格，若设为`false`不开启网格，则为 1px 移动单位，不绘制网格背景，若设置为`true`开启则默认为 20px 点状网格 |
| [keyboard](#keyboard) | Object |- | -| 自定义键盘相关配置 |
| [style](#style) | Object |- | - | 样式 |
| animation | Boolean \| Object |- | - | 是否开启动画功能，可统一开关和单独配置 |
| disabledPlugins | string[] |- | - | 传入初始化的时候，禁用加载的插件 |
| snapline | Boolean |- | true | 是否启用节点辅助对齐线 |
| history | Boolean |- | true | 是否开启历史记录功能 |
| partial | Boolean |- | false | 是否开启局部渲染功能 |
| edgeType | String |- | 'polyline' | 在图上编辑创建边的类型，支持自定义类型。 |
| guards | Array |- | - | 是否增加守卫函数，函数返回true则执行默认逻辑，返回false则阻止 |
| disabledTools | string[]|- | - | 禁止启用的内置工具，目前logicflow内置工具有'multipleSelect', 'textEdit' |
| isSilentMode | Boolean |- | false | 仅浏览不可编辑模式，默认不开启 |
|stopZoomGraph|boolean|- |false|禁止缩放画布|
|stopScrollGraph|boolean|- |false|禁止鼠标滚动移动画布|
|stopMoveGraph|boolean|- |false|禁止拖动画布|
|adjustEdge|boolean|- |true|允许调整边|
|adjustEdgeStartAndEnd|boolean|- |false|是否允许拖动边的端点来调整连线|
|adjustNodePosition|boolean|- |true|是否允许拖动节点|
|hideAnchors| boolean |- | false | 是否隐藏节点的锚点，静默模式下默认隐藏 |
|hoverOutline|boolean|- |true|鼠标hover的时候显示节点的外框|
|nodeSelectedOutline|boolean|- |true|鼠标hover的时候显示节点的外框|
|edgeSelectedOutline|boolean|- |true|鼠标hover的时候显示边的外框|
|nodeTextEdit|boolean|- |true|允许节点文本可以编辑|
|edgeTextEdit|boolean|- |true|允许边文本可以编辑|
|textEdit| Boolean | -| true | 是否开启文本编辑 |
|nodeTextDraggable|boolean| - |false|允许节点文本可以拖拽|
|edgeTextDraggable|boolean| - |false|允许边文本可以拖拽|
|multipleSelectKey|string| - |-|多选按键, 可选meta(cmd)、shift、alt。 支持组合键点击元素实现多选|
|idGenerator|function| -|-|自定义创建节点、连线时生成id规则。|
|plugins|Array| -|-|当前LogicFlow实例加载的插件，不传则采用全局插件。|

### `background`

背景默认无；支持透传任何样式属性到背景层

```js
export type BackgroundConfig = {
  backgroundImage?: string; // 背景图片地址
  backgroundColor?: string; // 背景色
  backgroundRepeat?: string;  // 背景图片重复
  backgroundPosition?: string; // 背景图片位置
  backgroundSize?: string;  // 背景图片尺寸
  backgroundOpacity?: number; // 背景透明度
  filter?: string; // 滤镜
  [key: any]: any;
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

### `keyboard`

默认不开启键盘快捷操作, 支持选项

```ts
export interface KeyboardDef {
  enabled: boolean,
  shortcuts?: Array<{
    keys: string | string[],
    callback: Handler,
    action?: Action,
  }>
}
```

使用内置快捷键

```js
const lf = new LogicFlow({
  keyboard: {
    enabled: true
  }
})
```

内置快捷键功能有：

- `'cmd + c', 'ctrl + c'` 同流程图复制
- `'cmd + v', 'ctrl + v'` 同流程图粘贴
- `'cmd + z', 'ctrl + z'` 上一步
- `'cmd + y', 'ctrl + y'` 下一步
- `'backspace'` 删除

自定义快捷键

```js
const lf = new LogicFlow({
  keyboard: {
    enable: true,
    shortcuts: [
      {
        keys: ['cmd + o', 'ctrl + o'],
        callback: () => {
          // 自定义逻辑
        }
      }
    ]
  }
})
```


### `style`

可以通过style配置主题，详细支持的样式选项见教程[主题 Theme](/guide/advance/theme.html)

### `snapline`

对齐线，包含节点的中心点、上下边框、左右边框对齐。

- 在编辑模式下，默认开启对齐线，将snapline设置为false，关闭对齐线。
- 在不可编辑模式下，对齐线关闭。

## register

注册节点、边

```js
lf.register(config):void
```

参数：

| 参数名 | 类型 | 必传 |默认值 | 描述 |
| :- | :- | :- | :- | :- |
| config.type | String | ✅ | - | 自定义节点、边的名称 |
| config.model | Model | ✅ | - | 节点、边的model |
| config.view | View | ✅ | - | 节点、边的view |

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

## render

渲染图数据

```js
const lf = new LogicFlow({
  ...
})
lf.render(graphData)
```

## renderRawData

渲染图原始数据，和`render`的区别是在使用`adapter`后，如何还想渲染logicflow格式的数据，可以用此方法。

```js
const lf = new LogicFlow({
  ...
})
lf.render({
  nodes: [],
  edges: []
})
```


## setTheme

设置主题, 详情见[主题](/api/themeApi.html)

## changeNodeType

修改节点类型

```ts
changeNodeType(id: string, type: string): void
```

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| id | String | ✅ |  | 节点id |
| type | String | ✅ |  | 新的类型 |


示例：

```js
lf.changeNodeType('node_id', 'rect')
```

## getNodeEdges

获取节点连接的所有边的model

```ts
getNodeEdges(id: string): BaseEdgeModel[]
```

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| id | String | ✅ |  | 节点id |

示例：

```js
const edgeModels = lf.getNodeEdges('node_id')
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
| text | Object\|String | | - | 节点文案内容及位置坐标 |
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
## changeNodeId

修改节点的id， 如果不传新的id，会内部自动创建一个。

示例：

```js
lf.changeNodeId('oldId', 'newId')
```

## getNodeModelById

获取节点的`model`

```ts
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

## getNodeDataById

获取节点的`model`数据

```ts
getNodeDataById(nodeId: string): NodeConfig
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| nodeId | String | ✅ | - | 节点id |

示例：

```js
lf.getNodeDataById('id')
```
## getNodeIncomingNode

获取节点所有的上一级节点

```ts
getNodeIncomingNode(nodeId: string): BaseNodeModel[]
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| nodeId | String | ✅ | - | 节点id |

## getNodeOutgoingNode

获取节点所有的下一级节点

```ts
getNodeOutgoingNode(nodeId: string): BaseNodeModel[]
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| nodeId | String | ✅ | - | 节点id |


## getNodeIncomingEdge

获取所有以此节点为终点的边

```ts
getNodeIncomingEdge(nodeId: string): BaseEdgeModel[]
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| nodeId | String | ✅ | - | 节点id |

## getNodeOutgoingEdge

获取所有以此节点为起点的边

```ts
getNodeOutgoingEdge(nodeId: string): BaseEdgeModel[]
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| nodeId | String | ✅ | - | 节点id |


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
| text | String\| Object | | - | 边文案 |

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

## deleteEdge

基于边id删除边

```js
removeEdge(id): void
```

参数：

| 名称 | 类型 | 必传 |默认值 | 描述 |
| :- | :- | :- |:- | :- |
| id | String | | - | 边的id |

示例：

```js
lf.deleteEdge('edge_1');
```
## deleteEdgeByNodeId

删除指定类型的边, 基于边起点和终点，可以只传其一。

```js
deleteEdgeByNodeId(config: EdgeFilter): void
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

lf.removeEdge({
  sourceNodeId:'id1',
});

lf.removeEdge({
  targetNodeId: 'id2'
});
```

## getEdgeModelById

基于边Id获取边的`model`

```ts
getEdgeModelById(edgeId: string): BaseEdgeModel
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| edgeId | String | ✅ | - | 节点id |

示例：

```js
lf.getEdgeModelById('id')
```

## getEdgeModels

获取满足条件边的model

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| edgeFilter | Object | ✅ | - | 过滤条件 |

```js
// 获取所有起点为节点A的边的model
lf.getEdgeModels({
  sourceNodeId: 'nodeA_id'
})
// 获取所有终点为节点B的边的model
lf.getEdgeModels({
  targetNodeId: 'nodeB_id'
})
// 获取起点为节点A，终点为节点B的边
lf.getEdgeModels({
  sourceNodeId: 'nodeA_id',
  targetNodeId: 'nodeB_id'
})
```

## changeEdgeId

修改边的id， 如果不传新的id，会内部自动创建一个。

示例：

```js
lf.changeEdgeId('oldId', 'newId')
```

## changeEdgeType

切换边的类型

示例：

```js
lf.changeEdgeType('edgeId', 'bezier')
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

设置边的类型, 也就是设置在节点直接由用户手动绘制的连线类型。

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
## editText

同[graphModel.editText](/api/graphModelApi.html#edittext)

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

## deleteElement

删除元素

```ts
deleteElement(id: string): boolean
```

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| id | String | ✅ |  | 节点或者边id |


示例：

```js
lf.deleteElement('node_id')
```

## selectElementById

将图形选中

参数：

| 参数名 | 类型 | 必传 |默认值 | 描述 |
| :- | :- | :- | :- | :- |
| id | string | ✅ | - | 节点或者连线Id |
| multiple | boolean |  | false | 是否为多选 |

示例：

```ts
lf.selectElementById(id: string, multiple = false)
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

## toFront

将某个元素放置到顶部。

如果堆叠模式为默认模式，则将原置顶元素重新恢复原有层级。

如果堆叠模式为递增模式，则将需指定元素zIndex设置为当前最大zIndex + 1。

示例：

```js
lf.toFront('id')
```

## setElementZIndex

设置元素的zIndex.

注意：默认堆叠模式下，不建议使用此方法。

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| id | String | ✅ | - | 边或者节点id |
| zIndex | String\| Number | ✅ | - | 可以传数字，也支持传入`top` 和 'bottom' |

示例：

```js
// 置为顶部
lf.setElementZIndex('element_id', 'top')
// 置为底部
lf.setElementZIndex('element_id', 'bottom')
lf.setElementZIndex('element_id', 2000)
```

## addElements

批量添加节点和边

示例：

```js
// 置为顶部
lf.addElements({
  nodes: [
    {
      id: 'node_1',
      type: 'rect',
      x: 100,
      y: 100
    },
    {
      id: 'node_2',
      type: 'rect',
      x: 200,
      y: 300
    }
  ],
  edges: [
    {
      id: 'edge_3',
      type: 'polyline',
      sourceNodeId: 'node_1',
      targetNodeId: 'node_2'
    }
  ]
})
```

## getAreaElement

获取指定区域内的所有元素，此区域必须是DOM层。

例如鼠标绘制选区后，获取选区内的所有元素。

```js
lf.getAreaElement([100, 100], [500, 500])
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

## getModelById

基于节点或边Id获取其model

```js
lf.getModelById('node_id')
lf.getModelById('edge_id')
```

## getDataById

基于节点或边Id获取其data

```js
lf.getDataById('node_id')
lf.getDataById('edge_id')
```

## clearData

清空画布

```js
lf.clearData()
```

## updateEditConfig

更新流程编辑基本配置.

详细参数见：[editConfig](/api/editConfigModelApi.html)

```js
lf.updateEditConfig({
  stopZoomGraph: true
})
```

## getEditConfig

获取流程编辑基本配置

详细参数见：[editConfig](/api/editConfigModelApi.html)

```js
lf.getEditConfig()
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

## focusOn

定位到画布视口中心

参数：

| 参数名 | 类型 | 必传 |默认值 | 描述 |
| :- | :- | :- | :- | :- |
| focusOnArgs | object | ✅ | - | 定位所需参数 |

示例：

```ts
// 定位到画布视口中心到node_1元素所处位置
lf.focusOn({
  id: 'node_1'
})
// 定位到画布视口中心到坐标[1000, 1000]处
lf.focusOn({
  coordinate: {
    x: 1000,
    y: 1000
  }
})
```
## resize

调整画布宽高

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| width | Number | ✅ | - | 画布的宽 |
| height | Number | ✅ | - | 画布的高 |

```js
lf.resize(1200, 600)
```


## zoom

放大缩小画布

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

重置图形的放大缩写比例为默认

示例：

```js
lf.resetZoom()
```

## setZoomMiniSize

设置图形缩小时，能缩放到的最小倍数。参数为0-1自己。默认0.2

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

## getTransform

获取当前画布的放大缩小值

```js
const transform = lf.getTransform();
console.log(transform)
```

## translate

平移图

参数
| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| x | Number | ✅ |  | x轴平移距离 |
| y | Number | ✅ | | y轴平移距离 |

```js
lf.translate(100, 100)
```

## resetTranslate

还原图形为初始位置

```js
lf.resetTranslate()
```

## fitView

将整个流程图缩小到画布能全部显示

```js
lf.fitView()
```


## on

图的监听事件，更多事件请查看[事件](./eventCenterApi.md)

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

## once

事件监听一次

```js
once(evt: string, callback: Function): this
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| evt | String | ✅ | - | 事件名称|
| callback | String | ✅ | - | 回调函数 |

示例：

```js
lf.once('node:click', () => {
  console.log('node:click')
})
```

## emit

触发事件

```js
emit(evt: string, ...args): this
```

参数：

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| evt | String | ✅ | - | 事件名称|
| args | Array | ✅ | - | 触发事件参数 |

示例：

```js
lf.eventCenter.emit("custom:button-click", model);
```
## undo

历史记录操作-返回上一步

示例：

```js
lf.undo()
```

## redo

历史记录操作-恢复下一步

示例：

```js
lf.redo()
```
