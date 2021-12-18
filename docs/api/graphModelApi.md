# graphModel

LogicFlow中整个画布对应的model。LogicFlow实例上的大多方法都是在graphModel上进行的简单封装。

## nodes

`属性`

画布所有的节点对象

## edges

`属性`

画布所有的连接对象

## transformModel

`属性`

当前画布平移、缩放矩阵model。

详细API[见](/api/transformModelApi.html)

## nodesMap 

`属性`, `只读`

画布所有节点的构成的map

## edgesMap 

`属性`, `只读`

画布所有边构成的map

## editConfigModel

`属性`

页面编辑基本配置对象, 详情见[editConfigApi](/api/editConfigModel.html)

## eventCenter

`属性`, `只读`

logicflow内部的事件中心，可以通过这个对象向外部抛出事件。

示例

```ts
class UserTaskModel extends RectNodeModel {
  setAttributes() {
    this.menu = [
      {
        text: '详情',
        callback: (res) => {
          this.graphModel.eventCenter.emit('user:detail', res);
        }
      },
    ]
  }
}
// 监听
lf.on('user:detail', (res) => {})
```

## partial

`属性`

是否开启局部渲染，当页面元素数量过多的时候，开启局部渲染会提高页面渲染性能。

## sortElements 

`属性`, `只读`

按照zIndex排序后的元素、zIndex控制元素叠加的时候谁在上面。

## textEditElement

`属性`, `只读`

当前被编辑的元素

## getAreaElement

`方法`

获取指定区域内的所有元素

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
|leftTopPoint|PointTuple|无| 区域左上方的点 |
|rightBottomPoint|PointTuple|无| 区域右下角的点 |

## getModel

`方法`

获取指定类型的Model构造函数

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
|type|string|无| 类型 |

返回值:

[NodeModel](/api/baseNodeModelApi.html) 或 [EdgeModel](/api/baseEdgeModelApi.html)
## getNodeModelById

`方法`

获取指定类型节点的Mdoel构造函数

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
|type|string|无| 类型 |

返回值

[NodeModel](/api/baseNodeModelApi.html)
## getPointByClient

`方法`

获取鼠标点击的位置在画布上的坐标

> 因为流程图所在的位置可以是页面任何地方,当内部事件需要获取触发事件时，其相对于画布左上角的位置.需要事件触发位置减去画布相对于client的位置.

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
|point|Position|无| HTML坐标 |

返回值：
|名称|类型|默认值|说明|
|-|-|-|-|
|domOverlayPosition|Position|无| HTML层坐标，一般控制组件的位置时使用此坐标 |
|canvasOverlayPosition|Position|无| Canvas层坐标，一般节点、边的坐标是这一层的坐标 |

为什么要这个方法，为什么鼠标点击的同一个位置会产生两个不同的坐标？

因为画布存在缩放和平移。当移动了画布，在视觉上看起来，画布上的元素位置变了，但是在数据层面，画布上的节点和边位置是没有变化的。反过来举个例子：在一个宽高为1000px * 1000px的画布中间有一个节点，这个节点的位置很可能是`{x: -999,y: -999}`, 因为平移过来的。但是当双击这个节点，我们需要在节点位置显示一个文本输入框的时候，因为输入框是在`domOverlay`层，这一层不像`CanvasOverlay`一样有缩放和平移，其宽高和画布宽高一致。所以这个文本输入框坐标应该是`{x: 500, y: 500}`。

我们再来看为什么要这个方法？

假设这个画布距离浏览器顶部距离为100，左侧距离也为100. 那么当用户点击画布中心的时候，js监听点击函数拿到的位置应该是`{x: 600, y: 600}`, 这个时候调用这个方法，就可以得到 `canvasOverlayPosition` 为`{x: -999,y: -999}`，`domOverlayPosition` 为 `{x: 500, y: 500}`。开发者就可以基于这两个坐标进行自己需要的开发。比如在`domOverlayPosition`位置显示一个菜单之类的。

## isElementInArea

`方法`

判断一个元素是否在指定矩形区域内。

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
|element|NodeModel或EdgeModel|无| 元素的model |
|lt|PointTuple|无| 左上角点 |
|rb|PointTuple|无| 右下角点 |
|wholeEdge|boolean|true| 边是否要所有的节点都在区域内 |

返回值

boolean

## graphDataToModel

`方法`

将原始数据渲染为graphModel

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
|graphData|GraphConfigData|无| 图的基本数据 |


```ts
type GraphConfigData = {
  nodes: NodeConfig[],
  edges: EdgeConfig[],
};
type NodeConfig = {
  id?: string;
  type: string;
  x: number;
  y: number;
  text?: TextConfig | string;
  properties?: Record<string, unknown>;
};

type EdgeConfig = {
  id?: string;
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
## modelToGraphData

`方法`

获取graphModel对应的原始数据

返回值： GraphConfigData
## getEdgeModels

`方法`

获取边的Model

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
|edgeId|string|无| 边Id |

返回值

[EdgeModel](/api/baseEdgeModelApi.html)

## getElement

`方法`

获取节点或者边的Model

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
|id|string|无| 边Id或者节点Id |

返回值

[EdgeModel](/api/baseEdgeModelApi.html) 或者 [NodeModel](/api/baseNodeModelApi.html) 

## getNodeEdges

`方法`

获取指定节点上所有的边

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
|nodeId|string|无| 节点Id |

返回值

[NodeModel](/api/baseNodeModelApi.html) 

## getSelectElements

`方法`

获取选中的元素数据

## updateAttributes

`方法`

更新指定节点的attributes


入参:
|名称|类型|默认值|说明|
|-|-|-|-|
|id|string|无| 节点Id |
|attributes|object|无| 元素属性 |

## setModel

`方法`

设置指定元素类型对于的Model构造函数

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
|type|string|无| 类型 |
|type|class|无| 此类型的model构造函数 |
## toFront

`方法`

将指定节点或者边放置在前面

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
| id | string | 无 | 节点id或边id |

## deleteNode

`方法`

删除节点

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
| id | string | 无 | 节点ID |
## addNode

`方法`

添加节点

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
| nodeConfig | NodeConfig | 无 | 节点配置 |

## cloneNode

`方法`

克隆节点

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
| nodeId | string | 无 | 节点id |

## moveNode

`方法`

移动节点

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
| nodeId | string | 无 | 节点id |
| deltaX | number | 无 | 移动x轴距离 |
| deltaY | number | 无 | 移动y轴距离 |

## setTextEditable(id: ElementModeId)

`方法`

设置元素本文变为编辑状态

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
| id | string | 无 | 节点id或者边id |


## addEdge

`方法`

添加边

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
| edgeConfig | EdgeConfig | 无 | 边配置 |
## moveEdge

`方法`

移动边

入参:

|名称|类型|默认值|说明|
|-|-|-|-|
| edgeId | string | 无 | 边id |
| deltaX | number | 无 | 移动x轴距离 |
| deltaY | number | 无 | 移动y轴距离 |

## removeEdge

`方法`

删除边

入参:

|名称|类型|默认值|说明|
|-|-|-|-|
| sourceNodeId | string | 无 | 起点id |
| targetNodeId | string | 无 | 结束节点ID |

## removeEdgeById

`方法`

基于Id删除边

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
| id | string | 无 | 边id |

## removeEdgeBySource

`方法`

删除指定节点为起点的所有边

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
| id | string | 无 | 边起点id |

## removeEdgeByTarget

`方法`

删除指定节点为目标点的所有边

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
| id | string | 无 | 边目的点id |

## updateText(id: ElementModeId, value: string)

`方法`

设置指定元素的文本

## selectNodeById

`方法`

选中节点

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
| id | string | 无 | 节点id |
| multiple | boolean | 无 | 是否多选 |

## selectEdgeById

`方法`

选中边

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
| id | string | 无 | 节点id |
| multiple | boolean | 无 | 是否多选 |
## selectElementById

`方法`

选中节点和边

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
| id | string | 无 | 节点或边id |
| multiple | boolean | 无 | 是否多选 |

## clearSelectElements

`方法`

取消所有被选中元素的选中状态

## moveElements

`方法` `废弃`

批量移动元素（将要废弃，请使用批量移动节点）

参数

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| elements | graphDataConfig | true | 无 | 图元素配置|
|deltaX| number | true | 无 | 移动的x轴距离|
|deltaY| number | true | 无 | 移动的y轴距离|

```ts
type graphDataConfig = {
  nodes: NodeConfig[],
}
```

## moveNodes

`方法`

批量移动节点

参数

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| nodeIds | nodeId[] | true | 无 | 图元素配置|
|deltaX| number | true | 无 | 移动的x轴距离|
|deltaY| number | true | 无 | 移动的y轴距离|

```ts
type nodeId = string;
```

## changeEdgeType

`方法`

修改默认边的类型

参数

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| type | string | true | 无 | 边类型 |

## changeNodeType

`方法`

修改指定节点的类型

参数

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| id | string | true | 无 | 节点 |
| type | string | true | 无 | 节点类型 |

## clearData

`方法`

清空画布所有元素

## setElementStateById

`方法`

设置指定元素状态

参数

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| id | string | true | 无 | 元素Id |
| state | ElementState | true | 无 | 元素状态 |

```ts
export enum ElementState {
  DEFAULT = 1, // 原始状态
  TEXT_EDIT = 2, // 编辑框显示
  SHOW_MENU = 3, // 菜单显示
  ALLOW_CONNECT = 4, // 允许边连接
  NOT_ALLOW_CONNECT = 5, // 不允许边连接
}
```