---
toc: content
order: 1
title: LogicFlow 方法
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

## Graph 相关

### setTheme

设置主题, 详情见[主题](../theme.zh.md)

### focusOn

定位到画布视口中心。

参数：

| 参数名         | 类型     | 必传 | 默认值 | 描述     |
|:------------|:-------|:---|:----|:-------|
| focusOnArgs | object | ✅  | -   | 定位所需参数 |

示例：

```tsx | pure
// 定位画布视口中心到node_1元素所处位置
lf.focusOn({
  id: 'node_1',
})
// 定位画布视口中心到坐标[1000, 1000]处
lf.focusOn({
  coordinate: {
    x: 1000,
    y: 1000,
  },
})
```

### resize

调整画布宽高, 如果 width 或者 height 不传会自动计算画布宽高。

参数：

| 名称     | 类型     | 必传 | 默认值 | 描述   |
|:-------|:-------|:---|:----|:-----|
| width  | number |    | -   | 画布的宽 |
| height | number |    | -   | 画布的高 |

```tsx | pure
lf.resize(1200, 600);
```

### toFront

将某个元素放置到顶部。

如果堆叠模式为默认模式，则将指定元素置顶 zIndex 设置为 9999，原置顶元素重新恢复原有层级 zIndex 设置为
1。

如果堆叠模式为递增模式，则将需指定元素 zIndex 设置为当前最大 zIndex + 1。

示例：

```tsx | pure
lf.toFront("id");
```

### getPointByClient

获取事件位置相对于画布左上角的坐标。

画布所在的位置可以是页面任何地方，原生事件返回的坐标是相对于页面左上角的，该方法可以提供以画布左上角为原点的准确位置。

```tsx | pure
// 函数定义
getPointByClient: (x: number, y: number): Point => {}
// 函数调用
lf.getPointByClient(x, y)
```

参数：

| 名称 | 类型     | 必传 | 默认值 | 描述                             |
|:---|:-------|:---|:----|:-------------------------------|
| x  | number | ✅  | -   | 相对于页面左上角的`x`坐标，一般是原生事件返回的`x`坐标 |
| y  | number | ✅  | -   | 相对于页面左上角的`y`坐标，一般是原生事件返回的`y`坐标 |

返回值：

| 名称    | 类型    | 描述            |
|:------|:------|:--------------|
| point | Point | 相对于画布左上角的两种坐标 |

```tsx | pure
type Position = {
  x: number;
  y: number;
};
type Point = {
  domOverlayPosition: Position; // HTML 层上相对于画布左上角的坐标`{x, y}`
  canvasOverlayPosition: Position; // SVG 层上相对于画布左上角的坐标`{x, y}`
};
```

示例：

```tsx | pure
lf.getPointByClient(event.x, event.y);
```

### getGraphData

获取流程绘图数据。

```tsx | pure
// 返回值，如果是应用了adapter插件，且设置为adapterOut，返回为转换后的数据格式，否则为默认的格式
// 1.2.5版本以后新增了入参，用于某些需要入参的adapterOut的执行，例如内置的BpmnAdapter可能需要传入属性保留字段的数组来保证导出数据中的某些节点属性被正常处理。
// 这里的入参和引入的Adapter的adapterOut方法除了data以外的其他参数保持一致。
// 函数定义
getGraphData: (...params: any): GraphConfigData | unknown => {}
// 函数调用
lf.getGraphData()
```

LogicFlow 默认数据格式。

```tsx | pure
type GraphConfigData = {
  nodes: {
    id?: string;
    type: string;
    x: number;
    y: number;
    text?: TextConfig;
    properties?: Record<string, unknown>;
    zIndex?: number;
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
    zIndex?: number;
    pointsList?: Point[]; // 折线、曲线会输出pointsList
  }[];
};
```

示例：

```tsx | pure
lf.getGraphData();
```

### getGraphRawData

获取流程绘图原始数据， 与 getGraphData 区别是该方法获取的数据不会受到 adapter 影响。

```tsx | pure
getGraphRawData = (): GraphData => {}
```

示例：

```tsx | pure
lf.getGraphRawData();
```

### clearData

清空画布。

```tsx | pure
lf.clearData();
```

### renderRawData

渲染图原始数据，和`render`的区别是在使用`adapter`后，如果还想渲染 logicflow 格式的数据，可以用此方法。

```tsx | pure
const lf = new LogicFlow({
  ...
})
lf.renderRawData({
  nodes: [],
  edges: []
})
```

### render

渲染图数据。

```tsx | pure
const lf = new LogicFlow({
  ...
})
lf.render(graphData)
```

## Node 相关

### addNode

在图上添加节点。

```tsx | pure
// 函数定义
// addNode: (nodeConfig: NodeConfig) => NodeModel
// 函数调用
lf.addNode(nodeConfig)
```

参数：

| 名称         | 类型             | 必传 | 默认值 | 描述           |
|:-----------|:---------------|:---|:----|:-------------|
| type       | string         | ✅  | -   | 节点类型名称       |
| x          | number         | ✅  | -   | 节点横坐标 x      |
| y          | number         | ✅  | -   | 节点纵坐标 y      |
| text       | Object\|string |    | -   | 节点文案内容及位置坐标  |
| id         | string         |    | -   | 节点 id        |
| properties | Object         |    | -   | 节点属性，用户可以自定义 |

示例：

```tsx | pure
lf.addNode({
  type: "user",
  x: 500,
  y: 600,
  id: 20,
  text: {
    value: "test",
    x: 500,
    y: 600,
  },
  properties: {
    size: 1,
  },
});
```

### deleteNode

删除图上的节点, 如果这个节点上有连接线，则同时删除线。

```tsx | pure
// 函数定义
deleteNode: (nodeId: string) => void
// 函数调用
  lf.deletaNode(nodeId)
```

参数：

| 名称     | 类型     | 必传 | 默认值 | 描述        |
|:-------|:-------|:---|:----|:----------|
| nodeId | string | ✅  | -   | 要删除节点的 id |

示例：

```tsx | pure
lf.deleteNode("id");
```

### cloneNode

克隆节点。

```tsx | pure
// 函数定义
cloneNode: (nodeId: string): BaseNodeModel => {}
//函数调用
lf.cloneNode(nodeId)
```

参数：

| 名称     | 类型     | 必传 | 默认值 | 描述      |
|:-------|:-------|:---|:----|:--------|
| nodeId | string | ✅  | -   | 目标节点 id |

示例：

```tsx | pure
lf.cloneNode("id");
```

### changeNodeId

修改节点的 id， 如果不传新的 id，会内部自动创建一个。

示例：

```tsx | pure
lf.changeNodeId("oldId", "newId");
```

### changeNodeType

修改节点类型。

```tsx | pure
changeNodeType: (id: string, type: string): void => {}
```

| 名称   | 类型     | 必传 | 默认值 | 描述    |
|:-----|:-------|:---|:----|:------|
| id   | string | ✅  |     | 节点 id |
| type | string | ✅  |     | 新的类型  |

示例：

```tsx | pure
lf.changeNodeType("node_id", "rect");
```

### getNodeModelById

获取节点的`model`。

```tsx | pure
getNodeModelById: (nodeId: string): BaseNodeModel => {}
```

参数：

| 名称     | 类型     | 必传 | 默认值 | 描述    |
|:-------|:-------|:---|:----|:------|
| nodeId | string | ✅  | -   | 节点 id |

示例：

```tsx | pure
lf.getNodeModelById("id");
```

### getNodeDataById

获取节点的`model`数据。

```tsx | pure
getNodeDataById: (nodeId: string): NodeConfig => {}
```

参数：

| 名称     | 类型     | 必传 | 默认值 | 描述    |
|:-------|:-------|:---|:----|:------|
| nodeId | string | ✅  | -   | 节点 id |

示例：

```tsx | pure
lf.getNodeDataById("id");
```

### getNodeIncomingEdge

获取所有以此节点为终点的边。

```tsx | pure
getNodeIncomingEdge:(nodeId: string): BaseEdgeModel[] => {}
```

参数：

| 名称     | 类型     | 必传 | 默认值 | 描述    |
|:-------|:-------|:---|:----|:------|
| nodeId | string | ✅  | -   | 节点 id |

### getNodeOutgoingEdge

获取所有以此节点为起点的边。

```tsx | pure
getNodeOutgoingEdge:(nodeId: string): BaseEdgeModel[] => {}
```

参数：

| 名称     | 类型     | 必传 | 默认值 | 描述    |
|:-------|:-------|:---|:----|:------|
| nodeId | string | ✅  | -   | 节点 id |

### getNodeIncomingNode

获取节点所有的上一级节点。

```tsx | pure
getNodeIncomingNode:(nodeId: string): BaseNodeModel[] => {}
```

参数：

| 名称     | 类型     | 必传 | 默认值 | 描述    |
|:-------|:-------|:---|:----|:------|
| nodeId | string | ✅  | -   | 节点 id |

### getNodeOutgoingNode

获取节点所有的下一级节点。

```tsx | pure
getNodeOutgoingNode:(nodeId: string): BaseNodeModel[] => {}
```

参数：

| 名称     | 类型     | 必传 | 默认值 | 描述    |
|:-------|:-------|:---|:----|:------|
| nodeId | string | ✅  | -   | 节点 id |

## Edge 相关

### setDefaultEdgeType

设置边的默认类型, 也就是设置当节点直接由用户手动连接的边类型。

```tsx | pure
setDefaultEdgeType: (type: EdgeType): void => {}
```

| 名称   | 类型     | 必传 | 默认值        | 描述                                                                                            |
|:-----|:-------|:---|:-----------|:----------------------------------------------------------------------------------------------|
| type | string | ✅  | 'polyline' | 设置边的类型，内置支持的边类型有 line(直线)、polyline(折线)、bezier(贝塞尔曲线)，默认为折线`polyline`，用户可以自定义 type 名切换到用户自定义的边 |

示例：

```tsx | pure
lf.setDefaultEdgeType("line");
```

### addEdge

创建连接两个节点的边。

```tsx | pure
addEdge: (edgeConfig: EdgeConifg): BaseEdgeModel => {}
```

参数：

| 名称           | 类型              | 必传 | 默认值 | 描述        |
|:-------------|:----------------|:---|:----|:----------|
| id           | string          |    | -   | 边的 id     |
| type         | string          |    | -   | 边的类型      |
| sourceNodeId | string          | ✅  | -   | 边起始节点的 id |
| targetNodeId | string          | ✅  | -   | 边终止节点的 id |
| startPoint   | Object          |    | -   | 边起点坐标     |
| endPoint     | Object          |    | -   | 边终端坐标     |
| text         | string\| Object |    | -   | 边文案       |

示例：

```tsx | pure
lf.addEdge({
  sourceNodeId: '10',
  targetNodeId: '21',
  startPoint: {
    x: 11,
    y: 22,
  },
  endPoint: {
    x: 33,
    y: 44,
  },
  text: '边文案',
});
```

### getEdgeDataById

通过`id`获取边的数据。

```tsx | pure
getEdgeDataById: (edgeId: string): EdgeConfig => {}

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

| 名称     | 类型     | 必传 | 默认值 | 描述    |
|:-------|:-------|:---|:----|:------|
| edgeId | string | ✅  | -   | 边的 id |

示例：

```tsx | pure
lf.getEdgeDataById("id");
```

### getEdgeModelById

基于边 Id 获取边的`model`。

```tsx | pure
getEdgeModelById: (edgeId: string): BaseEdgeModel => {}
```

参数：

| 名称     | 类型     | 必传 | 默认值 | 描述    |
|:-------|:-------|:---|:----|:------|
| edgeId | string | ✅  | -   | 节点 id |

示例：

```tsx | pure
lf.getEdgeModelById("id");
```

### getEdgeModels

获取满足条件边的 model。

| 名称         | 类型     | 必传 | 默认值 | 描述   |
|:-----------|:-------|:---|:----|:-----|
| edgeFilter | Object | ✅  | -   | 过滤条件 |

```tsx | pure
// 获取所有起点为节点A的边的model
lf.getEdgeModels({
  sourceNodeId: "nodeA_id",
});
// 获取所有终点为节点B的边的model
lf.getEdgeModels({
  targetNodeId: "nodeB_id",
});
// 获取起点为节点A，终点为节点B的边
lf.getEdgeModels({
  sourceNodeId: "nodeA_id",
  targetNodeId: "nodeB_id",
});
```

### changeEdgeId

修改边的 id， 如果不传新的 id，会内部自动创建一个。

示例：

```tsx | pure
lf.changeEdgeId("oldId", "newId");
```

### changeEdgeType

切换边的类型。

示例：

```tsx | pure
lf.changeEdgeType("edgeId", "bezier");
```

### deleteEdge

基于边 id 删除边。

```tsx | pure
deleteEdge: (id): void => {}
```

参数：

| 名称 | 类型     | 必传 | 默认值 | 描述    |
|:---|:-------|:---|:----|:------|
| id | string |    | -   | 边的 id |

示例：

```tsx | pure
lf.deleteEdge("edge_1");
```

### deleteEdgeByNodeId

删除与指定节点相连的边, 基于边起点和终点。

```tsx | pure
deleteEdgeByNodeId: (config: EdgeFilter): void => {}
```

参数：

| 名称           | 类型     | 必传 | 默认值 | 描述        |
|:-------------|:-------|:---|:----|:----------|
| sourceNodeId | string |    | -   | 边起始节点的 id |
| targetNodeId | string |    | -   | 边终止节点的 id |

示例：

```tsx | pure
// 删除起点id为id1并且终点id为id2的边
lf.deleteEdgeByNodeId({
  sourceNodeId: "id1",
  targetNodeId: "id2",
});
// 删除起点id为id1的边
lf.deleteEdgeByNodeId({
  sourceNodeId: "id1",
});
// 删除终点id为id2的边
lf.deleteEdgeByNodeId({
  targetNodeId: "id2",
});
```

### getNodeEdges

获取节点连接的所有边的 model。

```tsx | pure
getNodeEdges: (id: string): BaseEdgeModel[] => {}
```

| 名称 | 类型     | 必传 | 默认值 | 描述    |
|:---|:-------|:---|:----|:------|
| id | string | ✅  |     | 节点 id |

示例：

```tsx | pure
const edgeModels = lf.getNodeEdges("node_id");
```

## Register 相关

### register

注册自定义节点、边。

```tsx | pure
register: (config: RegisterConfig): void => {}
```

参数：

| 名称           | 类型     | 必传 | 默认值 | 描述          |
|:-------------|:-------|:---|:----|:------------|
| config.type  | string | ✅  | -   | 自定义节点、边的名称  |
| config.model | Model  | ✅  | -   | 节点、边的 model |
| config.view  | View   | ✅  | -   | 节点、边的 view  |

示例：

```tsx | pure
import { RectNode, RectNodeModel } from "@logicflow/core";

// 节点View
class CustomRectNode extends RectNode {
}

// 节点Model
class CustomRectModel extends RectNodeModel {
  setAttributes() {
    this.width = 200;
    this.height = 80;
    this.radius = 50;
  }
}

lf.register({
  type: "Custom-rect",
  view: CustomRectNode,
  model: CustomRectModel,
});
```

### batchRegister

批量注册。

```tsx | pure
lf.batchRegister([
  {
    type: 'user',
    view: UserNode,
    model: UserModel,
  },
  {
    type: 'user1',
    view: UserNode1,
    model: UserModel1,
  },
])
```

## Element 相关

### addElements

批量添加节点和边。

示例：

```tsx | pure
// 置为顶部
lf.addElements({
  nodes: [
    {
      id: "node_1",
      type: "rect",
      x: 100,
      y: 100,
    },
    {
      id: "node_2",
      type: "rect",
      x: 200,
      y: 300,
    },
  ],
  edges: [
    {
      id: "edge_3",
      type: "polyline",
      sourceNodeId: "node_1",
      targetNodeId: "node_2",
    },
  ],
});
```

### selectElementById

将图形选中。

参数：

| 参数名      | 类型      | 必传 | 默认值   | 描述                           |
|:---------|:--------|:---|:------|:-----------------------------|
| id       | string  | ✅  | -     | 节点或者连线 Id                    |
| multiple | boolean |    | false | 是否为多选，如果为 true，不会将上一个选中的元素重置 |
| toFront  | boolean |    | true  | 是否将选中的元素置顶，默认为 true          |

示例：

```tsx | pure
import BaseNodeModel from './BaseNodeModel'
import BaseNodeModel from './BaseNodeModel'
// TODO: 确认这个类型

selectElementById: (id: string, multiple = false, toFront = true) => BaseNodeModel | BaseEdgeModel
```

### getSelectElements

获取选中的所有元素。

```tsx | pure
getSelectElements: (isIgnoreCheck: boolean): GraphConfigData => {}
```

| 名称            | 类型      | 必传 | 默认值  | 描述                                          |
|:--------------|:--------|:---|:-----|:--------------------------------------------|
| isIgnoreCheck | boolean | ✅  | true | 是否包括 sourceNode 和 targetNode 没有被选中的边, 默认包括。 |

```tsx | pure
lf.getSelectElements(false);
```

### clearSelectElements

取消所有元素的选中状态。

```tsx | pure
lf.clearSelectElements();
```

### getModelById

基于节点或边 Id 获取其 model。

```tsx | pure
lf.getModelById("node_id");
lf.getModelById("edge_id");
```

### getDataById

基于节点或边 Id 获取其 data。

```tsx | pure
lf.getDataById("node_id");
lf.getDataById("edge_id");
```

### deleteElement

删除元素。

```tsx | pure
deleteElement: (id: string): boolean => {}
```

| 名称 | 类型     | 必传 | 默认值 | 描述       |
|:---|:-------|:---|:----|:---------|
| id | string | ✅  |     | 节点或者边 id |

示例：

```tsx | pure
lf.deleteElement("node_id");
```

### setElementZIndex

设置元素的 zIndex.

注意：默认堆叠模式下，不建议使用此方法。

参数：

| 名称     | 类型              | 必传 | 默认值 | 描述                          |
|:-------|:----------------|:---|:----|:----------------------------|
| id     | string          | ✅  | -   | 边或者节点 id                    |
| zIndex | string\| number | ✅  | -   | 可以传数字，也支持传入`top` 和 `bottom` |

示例：

```tsx | pure
// 置为顶部
lf.setElementZIndex("element_id", "top");
// 置为底部
lf.setElementZIndex("element_id", "bottom");
lf.setElementZIndex("element_id", 2000);
```

### getAreaElement

获取指定区域内的所有元素，此区域必须是 DOM 层。

例如鼠标绘制选区后，获取选区内的所有元素。

入参:

| 名称                | 类型         | 默认值 | 说明            |
|-------------------|------------|-----|---------------|
| leftTopPoint      | PointTuple | 无   | 区域左上方的点       |
| rightBottomPoint  | PointTuple | 无   | 区域右下角的点       |
| rightBottomPoint  | PointTuple | 无   | 区域右下角的点       |
| wholeEdge         | boolean    | 无   | 是否要整个边都在区域内部  |
| wholeNode         | boolean    | 无   | 是否要整个节点都在区域内部 |
| ignoreHideElement | boolean    | 无   | 是否忽略隐藏的节点     |

```tsx | pure
lf.getAreaElement([100, 100], [500, 500]);
```

### setProperties

设置节点或者边的自定义属性。

```tsx | pure
setProperties: (id: string, properties: Record<string, unknown>): void => {}
```

示例：

```tsx | pure
lf.setProperties("aF2Md2P23moN2gasd", {
  isRollbackNode: true,
});
```

### getProperties

获取节点或者边的自定义属性。

```tsx | pure
getProperties: (id: string): Record<string, any> => {}
```

示例：

```tsx | pure
lf.getProperties("id");
```

### deleteProperty

删除节点属性。

```tsx | pure
deleteProperty: (id: string, key: string): void => {}
```

示例：

```tsx | pure
lf.deleteProperty("aF2Md2P23moN2gasd", "isRollbackNode");
```

### updateAttributes

修改对应元素 model 中的属性, 方法内部就是调用 graphModel 上的 [updateAttributes](../model/graphModel.zh.md#updateattributes)。

:::warning{title=注意}
此方法慎用，除非您对logicflow内部有足够的了解。<br>
大多数情况下，请使用setProperties、updateText、changeNodeId等方法。<br>
例如直接使用此方法修改节点的id,那么就是会导致连接到此节点的边的sourceNodeId出现找不到的情况。
:::

```tsx | pure
updateAttributes: (id: string, attributes: object): void => {}
```

示例：

```tsx | pure
lf.updateAttributes("node_id_1", { radius: 4 });
```

## Text 相关

### editText

同[graphModel.editText](../model/graphModel.zh.md#edittext)

### updateText

更新节点或者边的文案。

```tsx | pure
updateText: (id: string, value: string): void => {}
```

| 名称    | 类型     | 必传 | 默认值 | 描述       |
|:------|:-------|:---|:----|:---------|
| id    | string | ✅  |     | 节点或者边 id |
| value | string | ✅  |     | 更新后的文本值  |

示例：

```tsx | pure
lf.updateText("id", "value");
```

### updateEditConfig

更新流程编辑基本配置.

详细参数见：[editConfig](../model/editConfigModel.zh.md)

```tsx | pure
lf.updateEditConfig({
  stopZoomGraph: true,
});
```

### getEditConfig

获取流程编辑基本配置。

详细参数见：[editConfig](../model/editConfigModel.zh.md)

```tsx | pure
lf.getEditConfig();
```

## History 相关

### undo

历史记录操作-返回上一步。

示例：

```tsx | pure
lf.undo();
```

### redo

历史记录操作-恢复下一步。

示例：

```tsx | pure
lf.redo();
```

## Transform 相关

### zoom

放大缩小画布。

参数：

| 名称       | 类型               | 必传 | 默认值   | 描述                                                                       |
|:---------|:-----------------|:---|:------|:-------------------------------------------------------------------------|
| zoomSize | boolean 或 number |    | false | 放大缩小的值，支持传入 0-n 之间的数字。小于 1 表示缩小，大于 1 表示放大。也支持传入 true 和 false 按照内置的刻度放大缩小 |
| point    | [x,y]            |    | false | 缩放的原点, 不传默认左上角                                                           |

示例：

```tsx | pure
// 放大
lf.zoom(true);
// 缩小
lf.zoom(false);
// 缩放到指定比例
lf.zoom(2);
// 缩放到指定比例，并且缩放原点为[100, 100]
lf.zoom(2, [100, 100]);
```

### resetZoom

重置图形的缩放比例为默认，默认是 1。

示例：

```tsx | pure
lf.resetZoom();
```

### setZoomMiniSize

设置图形缩小时，能缩放到的最小倍数。参数一般为 0-1 之间，默认 0.2。

```tsx | pure
setZoomMiniSize: (size: number): void => {}
```

参数：

| 名称   | 类型     | 必传 | 默认值 | 描述           |
|:-----|:-------|:---|:----|:-------------|
| size | number | ✅  | 0.2 | 最小缩放比，默认 0.2 |

示例：

```tsx | pure
lf.setZoomMiniSize(0.3);
```

### setZoomMaxSize

设置图形放大时，能放大到的最大倍数，默认 16。

```tsx | pure
setZoomMaxSize: (size: number): void => {}
```

参数：

| 名称   | 类型     | 必传 | 默认值 | 描述           |
|:-----|:-------|:---|:----|:-------------|
| size | number | ✅  | 16  | 最大放大倍数，默认 16 |

示例：

```tsx | pure
lf.setZoomMaxSize(20);
```

### getTransform

获取当前画布的缩放值与偏移值。

```tsx | pure
const transform = lf.getTransform();
console.log(transform);
```

`getTransform` 方法返回的对象包含以下属性：

| 属性   | 类型     | 值 |
|:-----|:-------|:---|
| SCALE_X | number | x 轴缩放比例 |
| SCALE_Y | number | y 轴缩放比例 |
| TRANSLATE_X | number | x 轴偏移值 |
| TRANSLATE_Y | number | y 轴偏移值 |

### translate

平移图

参数

| 名称 | 类型     | 必传 | 默认值 | 描述      |
|:---|:-------|:---|:----|:--------|
| x  | number | ✅  |     | x 轴平移距离 |
| y  | number | ✅  |     | y 轴平移距离 |

```tsx | pure
lf.translate(100, 100);
```

### resetTranslate

还原图形为初始位置

```tsx | pure
lf.resetTranslate();
```

### translateCenter

图形画布居中显示。

```tsx | pure
lf.translateCenter();
```

### fitView

将整个流程图缩小到画布能全部显示。

参数:

| 名称               | 类型     | 必传 | 默认值 | 描述                |
|:-----------------|:-------|:---|:----|:------------------|
| verticalOffset   | number | ✅  | 20  | 距离盒子上下的距离， 默认为 20 |
| horizontalOffset | number | ✅  | 20  | 距离盒子左右的距离， 默认为 20 |

```tsx | pure
lf.fitView(deltaX, deltaY);
```

### openEdgeAnimation

开启边的动画。

```tsx | pure
openEdgeAnimation: (edgeId: string): void => {}
```

### closeEdgeAnimation

关闭边的动画。

```tsx | pure
closeEdgeAnimation: (edgeId: string): void => {}
```

## 事件系统 相关

### on

图的监听事件，更多事件请查看[事件](../eventCenter.zh.md)。

```tsx | pure
import { EventCallback } from './EventEmitter'

on: (evt: string, callback: EventCallback<T>): void => {}
```

参数：

| 名称       | 类型     | 必传 | 默认值 | 描述   |
|:---------|:-------|:---|:----|:-----|
| evt      | string | ✅  | -   | 事件名称 |
| callback | `EventCallback<T>` | ✅  | -   | 回调函数 |

示例：

```tsx | pure
lf.on("node:click", (args) => {
  console.log("node:click", args.position);
});
lf.on("element:click", (args) => {
  console.log("element:click", args.e.target);
});
```

### off

删除事件监听。

```tsx | pure
import { EventCallback } from './EventEmitter'

off: (evt: string, callback: EventCallback<T>): void => {}
```

参数：

| 名称       | 类型     | 必传 | 默认值 | 描述   |
|:---------|:-------|:---|:----|:-----|
| evt      | string | ✅  | -   | 事件名称 |
| callback | `EventCallback<T>` | ✅  | -   | 回调函数 |

示例：

```tsx | pure
lf.off("node:click", () => {
  console.log("node:click off");
});
lf.off("element:click", () => {
  console.log("element:click off");
});
```

### once

事件监听一次。

```tsx | pure
import { EventCallback } from './EventEmitter'

once: (evt: string, callback: EventCallback<T>): void => {}
```

参数：

| 名称       | 类型     | 必传 | 默认值 | 描述   |
|:---------|:-------|:---|:----|:-----|
| evt      | string | ✅  | -   | 事件名称 |
| callback | `EventCallback<T>` | ✅  | -   | 回调函数 |

示例：

```tsx | pure
lf.once("node:click", () => {
  console.log("node:click");
});
```

### emit

触发事件。

```tsx | pure
import { CallbackArgs } from './eventEmitter'

emit: (evt: string, eventArgs: CallbackArgs<T>): void => {}
```

参数：

| 名称   | 类型     | 必传 | 默认值 | 描述     |
|:-----|:-------|:---|:----|:-------|
| evt  | string | ✅  | -   | 事件名称   |
| eventArgs | `CallbackArgs<T>`  | ✅  | -   | 触发事件参数 |

示例：

```tsx | pure
lf.emit("custom:button-click", model);
```
