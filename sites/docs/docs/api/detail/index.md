
<style>
table td:first-of-type {
  word-break: normal;
}
</style>

## Register 相关

### register

注册自定义节点、边。

```jsx | pure
lf.register(config: RegisterConfig):void
```

参数：

| 名称       | 类型   | 必传 | 默认值 | 描述          |
| :----------- | :----- | :--- | :----- | :------------------- |
| config.type  | String | ✅   | -      | 自定义节点、边的名称 |
| config.model | Model  | ✅   | -      | 节点、边的 model     |
| config.view  | View   | ✅   | -      | 节点、边的 view      |

示例：

```jsx | pure
import { RectNode, RectNodeModel } from "@logicflow/core";
// 节点View
class CustomRectNode extends RectNode {}
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

```jsx | pure
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
);
```

## Node 相关

### addNode

在图上添加节点。

```jsx | pure
addNode(nodeConfig: NodeConfig):nodeModel
```

参数：

| 名称       | 类型           | 必传 | 默认值 | 描述                     |
| :--------- | :------------- | :--- | :----- | :----------------------- |
| type       | String         | ✅   | -      | 节点类型名称             |
| x          | Number         | ✅   | -      | 节点横坐标 x             |
| y          | Number         | ✅   | -      | 节点纵坐标 y             |
| text       | Object\|String |      | -      | 节点文案内容及位置坐标   |
| id         | String         |      | -      | 节点 id                  |
| properties | Object         |      | -      | 节点属性，用户可以自定义 |

示例：

```jsx | pure
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

```jsx | pure
deleteNode(nodeId: string): void
```

参数：

| 名称   | 类型   | 必传 | 默认值 | 描述            |
| :----- | :----- | :--- | :----- | :-------------- |
| nodeId | String | ✅   | -      | 要删除节点的 id |

示例：

```jsx | pure
lf.deleteNode("id");
```

### cloneNode

克隆节点。

```jsx | pure
cloneNode(nodeId: string): BaseNodeModel
```

参数：

| 名称   | 类型   | 必传 | 默认值 | 描述        |
| :----- | :----- | :--- | :----- | :---------- |
| nodeId | String | ✅   | -      | 目标节点 id |

示例：

```jsx | pure
lf.cloneNode("id");
```

### changeNodeId

修改节点的 id， 如果不传新的 id，会内部自动创建一个。

示例：

```jsx | pure
lf.changeNodeId("oldId", "newId");
```

### changeNodeType

修改节点类型。

```jsx | pure
changeNodeType(id: string, type: string): void
```

| 名称 | 类型   | 必传 | 默认值 | 描述     |
| :--- | :----- | :--- | :----- | :------- |
| id   | String | ✅   |        | 节点 id  |
| type | String | ✅   |        | 新的类型 |

示例：

```jsx | pure
lf.changeNodeType("node_id", "rect");
```

### getNodeModelById

获取节点的`model`。

```jsx | pure
getNodeModelById(nodeId: string): BaseNodeModel
```

参数：

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | String | ✅   | -      | 节点 id |

示例：

```jsx | pure
lf.getNodeModelById("id");
```

### getNodeDataById

获取节点的`model`数据。

```jsx | pure
getNodeDataById(nodeId: string): NodeConfig
```

参数：

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | String | ✅   | -      | 节点 id |

示例：

```jsx | pure
lf.getNodeDataById("id");
```

### getNodeIncomingEdge

获取所有以此节点为终点的边。

```jsx | pure
getNodeIncomingEdge(nodeId: string): BaseEdgeModel[]
```

参数：

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | String | ✅   | -      | 节点 id |

### getNodeOutgoingEdge

获取所有以此节点为起点的边。

```jsx | pure
getNodeOutgoingEdge(nodeId: string): BaseEdgeModel[]
```

参数：

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | String | ✅   | -      | 节点 id |

### getNodeIncomingNode

获取节点所有的上一级节点。

```jsx | pure
getNodeIncomingNode(nodeId: string): BaseNodeModel[]
```

参数：

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | String | ✅   | -      | 节点 id |

### getNodeOutgoingNode

获取节点所有的下一级节点。

```jsx | pure
getNodeOutgoingNode(nodeId: string): BaseNodeModel[]
```

参数：

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | String | ✅   | -      | 节点 id |

## Edge 相关

### setDefaultEdgeType

设置边的类型, 也就是设置在节点直接由用户手动绘制的连线类型。

```jsx | pure
setDefaultEdgeType(type: EdgeType): void
```

| 名称 | 类型   | 必传 | 默认值     | 描述                                                                                                                                    |
| :--- | :----- | :--- | :--------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| type | String | ✅   | 'polyline' | 设置边的类型，内置支持的边类型有 line(直线)、polyline(折线)、bezier(贝塞尔曲线)，默认为折线，用户可以自定义 type 名切换到用户自定义的边 |

示例：

```jsx | pure
lf.setDefaultEdgeType("line");
```

### addEdge

创建连接两个节点的边。

```jsx | pure
addEdge(edgeConfig: EdgeConifg): void
```

参数：

| 名称         | 类型            | 必传 | 默认值 | 描述            |
| :----------- | :-------------- | :--- | :----- | :-------------- |
| id           | String          |      | -      | 边的 id         |
| type         | String          |      | -      | 边的类型        |
| sourceNodeId | String          | ✅   | -      | 边起始节点的 id |
| targetNodeId | String          | ✅   | -      | 边终止节点的 id |
| startPoint   | Object          |      | -      | 边起点坐标      |
| endPoint     | Object          |      | -      | 边终端坐标      |
| text         | String\| Object |      | -      | 边文案          |

示例：

```jsx | pure
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

### getEdgeDataById

通过`id`获取边的数据。

```jsx | pure
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

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| edgeId | String | ✅   | -      | 边的 id |

示例：

```jsx | pure
lf.getEdgeDataById("id");
```

### getEdgeModelById

基于边 Id 获取边的`model`。

```jsx | pure
getEdgeModelById(edgeId: string): BaseEdgeModel
```

参数：

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| edgeId | String | ✅   | -      | 节点 id |

示例：

```jsx | pure
lf.getEdgeModelById("id");
```

### getEdgeModels

获取满足条件边的 model。

| 名称       | 类型   | 必传 | 默认值 | 描述     |
| :--------- | :----- | :--- | :----- | :------- |
| edgeFilter | Object | ✅   | -      | 过滤条件 |

```jsx | pure
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

```jsx | pure
lf.changeEdgeId("oldId", "newId");
```

### changeEdgeType

切换边的类型。

示例：

```jsx | pure
lf.changeEdgeType("edgeId", "bezier");
```

### deleteEdge

基于边 id 删除边。

```jsx | pure
deleteEdge(id): void
```

参数：

| 名称 | 类型   | 必传 | 默认值 | 描述    |
| :--- | :----- | :--- | :----- | :------ |
| id   | String |      | -      | 边的 id |

示例：

```jsx | pure
lf.deleteEdge("edge_1");
```

### deleteEdgeByNodeId

删除与指定节点相连的边, 基于边起点和终点。

```jsx | pure
deleteEdgeByNodeId(config: EdgeFilter): void
```

参数：

| 名称         | 类型   | 必传 | 默认值 | 描述            |
| :----------- | :----- | :--- | :----- | :-------------- |
| sourceNodeId | String |      | -      | 边起始节点的 id |
| targetNodeId | String |      | -      | 边终止节点的 id |

示例：

```jsx | pure
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

```jsx | pure
getNodeEdges(id: string): BaseEdgeModel[]
```

| 名称 | 类型   | 必传 | 默认值 | 描述    |
| :--- | :----- | :--- | :----- | :------ |
| id   | String | ✅   |        | 节点 id |

示例：

```jsx | pure
const edgeModels = lf.getNodeEdges("node_id");
```

## Element 相关

### addElements

批量添加节点和边。

示例：

```jsx | pure
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

| 参数名   | 类型    | 必传 | 默认值 | 描述                                                |
| :------- | :------ | :--- | :----- | :-------------------------------------------------- |
| id       | string  | ✅   | -      | 节点或者连线 Id                                     |
| multiple | boolean |      | false  | 是否为多选，如果为 true，不会将上一个选中的元素重置 |
| toFront  | boolean |      | true   | 是否将选中的元素置顶，默认为 true                   |

示例：

```jsx | pure
lf.selectElementById(id: string, multiple = false, toFront = true)
```

### getSelectElements

获取选中的所有元素。

```jsx | pure
getSelectElements(isIgnoreCheck: boolean): GraphConfigData
```

| 名称          | 类型    | 必传 | 默认值 | 描述                                                         |
| :------------ | :------ | :--- | :----- | :----------------------------------------------------------- |
| isIgnoreCheck | boolean | ✅   | true   | 是否包括 sourceNode 和 targetNode 没有被选中的边, 默认包括。 |

```jsx | pure
lf.getSelectElements(false);
```

### clearSelectElements

取消所有元素的选中状态。

```jsx | pure
lf.clearSelectElements();
```

### getModelById

基于节点或边 Id 获取其 model。

```jsx | pure
lf.getModelById("node_id");
lf.getModelById("edge_id");
```

### getDataById

基于节点或边 Id 获取其 data。

```jsx | pure
lf.getDataById("node_id");
lf.getDataById("edge_id");
```

### deleteElement

删除元素。

```jsx | pure
deleteElement(id: string): boolean
```

| 名称 | 类型   | 必传 | 默认值 | 描述          |
| :--- | :----- | :--- | :----- | :------------ |
| id   | String | ✅   |        | 节点或者边 id |

示例：

```jsx | pure
lf.deleteElement("node_id");
```

### setElementZIndex

设置元素的 zIndex.

注意：默认堆叠模式下，不建议使用此方法。

参数：

| 名称   | 类型            | 必传 | 默认值 | 描述                                    |
| :----- | :-------------- | :--- | :----- | :-------------------------------------- |
| id     | String          | ✅   | -      | 边或者节点 id                           |
| zIndex | String\| Number | ✅   | -      | 可以传数字，也支持传入`top` 和 `bottom` |

示例：

```jsx | pure
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

| 名称              | 类型       | 默认值 | 说明                       |
| ----------------- | ---------- | ------ | -------------------------- |
| leftTopPoint      | PointTuple | 无     | 区域左上方的点             |
| rightBottomPoint  | PointTuple | 无     | 区域右下角的点             |
| rightBottomPoint  | PointTuple | 无     | 区域右下角的点             |
| wholeEdge         | boolean    | 无     | 是否要整个边都在区域内部   |
| wholeNode         | boolean    | 无     | 是否要整个节点都在区域内部 |
| ignoreHideElement | boolean    | 无     | 是否忽略隐藏的节点         |

```jsx | pure
lf.getAreaElement([100, 100], [500, 500]);
```

### setProperties

设置节点或者边的自定义属性。

```jsx | pure
setProperties(id: string, properties: Object): void
```

示例：

```jsx | pure
lf.setProperties("aF2Md2P23moN2gasd", {
  isRollbackNode: true,
});
```

### getProperties

获取节点或者边的自定义属性。

```jsx | pure
getProperties(id: string): Object
```

示例：

```jsx | pure
lf.getProperties("id");
```

### deleteProperty

删除节点属性。

```jsx | pure
deleteProperty(id: string, key: string): void
```

示例：

```jsx | pure
lf.deleteProperty("aF2Md2P23moN2gasd", "isRollbackNode");
```

### updateAttributes

修改对应元素 model 中的属性, 方法内部就是调用的[graphModel](graph-model-api#updateattributes)。

:::warning{title=注意}
此方法慎用，除非您对logicflow内部有足够的了解。<br>
大多数情况下，请使用setProperties、updateText、changeNodeId等方法。<br>
例如直接使用此方法修改节点的id,那么就是会导致连接到此节点的边的sourceNodeId出现找不到的情况。
:::
```jsx | pure
updateAttributes(id: string, attributes: object): void
```
示例：

```jsx | pure
lf.updateAttributes("node_id_1", { radius: 4 });
```

## Text 相关

### editText

同[graphModel.editText](graph-model-api#edittext)

### updateText

更新节点或者边的文案。

```jsx | pure
updateText(id: string, value: string): void
```

| 名称  | 类型   | 必传 | 默认值 | 描述           |
| :---- | :----- | :--- | :----- | :------------- |
| id    | String | ✅   |        | 节点或者边 id  |
| value | String | ✅   |        | 更新后的文本值 |

示例：

```jsx | pure
lf.updateText("id", "value");
```

### updateEditConfig

更新流程编辑基本配置.

详细参数见：[editConfig](edit-config-model-api)

```jsx | pure
lf.updateEditConfig({
  stopZoomGraph: true,
});
```

### getEditConfig

获取流程编辑基本配置。

详细参数见：[editConfig](edit-config-model-api)

```jsx | pure
lf.getEditConfig();
```

## Graph 相关

### setTheme

设置主题, 详情见[主题](theme-api)

### focusOn

定位到画布视口中心。

参数：

| 参数名      | 类型   | 必传 | 默认值 | 描述         |
| :---------- | :----- | :--- | :----- | :----------- |
| focusOnArgs | object | ✅   | -      | 定位所需参数 |

示例：

```jsx | pure
// 定位画布视口中心到node_1元素所处位置
lf.focusOn({
  id: "node_1",
});
// 定位画布视口中心到坐标[1000, 1000]处
lf.focusOn({
  coordinate: {
    x: 1000,
    y: 1000,
  },
});
```

### resize

调整画布宽高, 如果 width 或者 height 不传会自动计算画布宽高。

参数：

| 名称   | 类型   | 必传 | 默认值 | 描述     |
| :----- | :----- | :--- | :----- | :------- |
| width  | Number |      | -      | 画布的宽 |
| height | Number |      | -      | 画布的高 |

```jsx | pure
lf.resize(1200, 600);
```

### toFront

将某个元素放置到顶部。

如果堆叠模式为默认模式，则将指定元素置顶 zIndex 设置为 9999，原置顶元素重新恢复原有层级 zIndex 设置为 1。

如果堆叠模式为递增模式，则将需指定元素 zIndex 设置为当前最大 zIndex + 1。

示例：

```jsx | pure
lf.toFront("id");
```

### getPointByClient

获取事件位置相对于画布左上角的坐标。

画布所在的位置可以是页面任何地方，原生事件返回的坐标是相对于页面左上角的，该方法可以提供以画布左上角为原点的准确位置。

```jsx | pure
getPointByClient(x: number, y: number)
```

参数：

| 名称 | 类型   | 必传 | 默认值 | 描述                                                   |
| :--- | :----- | :--- | :----- | :----------------------------------------------------- |
| x    | Number | ✅   | -      | 相对于页面左上角的`x`坐标，一般是原生事件返回的`x`坐标 |
| y    | Number | ✅   | -      | 相对于页面左上角的`y`坐标，一般是原生事件返回的`y`坐标 |

返回值：

| 名称  | 类型  | 描述                       |
| :---- | :---- | :------------------------- |
| point | Point | 相对于画布左上角的两种坐标 |

```jsx | pure
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

```jsx | pure
lf.getPointByClient(event.x, event.y);
```

### getGraphData

获取流程绘图数据。

```jsx | pure
// 返回值，如果是应用了adapter插件，且设置为adapterOut，返回为转换后的数据格式，否则为默认的格式
// 1.2.5版本以后新增了入参，用于某些需要入参的adapterOut的执行，例如内置的BpmnAdapter可能需要传入属性保留字段的数组来保证导出数据中的某些节点属性被正常处理。
// 这里的入参和引入的Adapter的adapterOut方法除了data以外的其他参数保持一致。
getGraphData(...params: any): GraphConfigData | unknown
```

LogicFlow 默认数据格式。

```jsx | pure
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

```jsx | pure
lf.getGraphData();
```

### getGraphRawData

获取流程绘图原始数据， 与 getGraphData 区别是该方法获取的数据不会受到 adapter 影响。

```jsx | pure
getGraphRawData(): GraphConfigData
```

示例：

```jsx | pure
lf.getGraphRawData();
```

### clearData

清空画布。

```jsx | pure
lf.clearData();
```

### renderRawData

渲染图原始数据，和`render`的区别是在使用`adapter`后，如何还想渲染 logicflow 格式的数据，可以用此方法。

```jsx | pure
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

```jsx | pure
const lf = new LogicFlow({
  ...
})
lf.render(graphData)
```

## History 相关

### undo

历史记录操作-返回上一步。

示例：

```jsx | pure
lf.undo();
```

### redo

历史记录操作-恢复下一步。

示例：

```jsx | pure
lf.redo();
```

## Resize 相关

### zoom

放大缩小画布。

参数：

| 名称     | 类型              | 必传 | 默认值 | 描述                                                                                                                     |
| :------- | :---------------- | :--- | :----- | :----------------------------------------------------------------------------------------------------------------------- |
| zoomSize | Boolean 或 Number |      | false  | 放大缩小的值，支持传入 0-n 之间的数字。小于 1 表示缩小，大于 1 表示放大。也支持传入 true 和 false 按照内置的刻度放大缩小 |
| point    | [x,y]             |      | false  | 缩放的原点, 不传默认左上角                                                                                               |

示例：

```jsx | pure
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

```jsx | pure
lf.resetZoom();
```

### setZoomMiniSize

设置图形缩小时，能缩放到的最小倍数。参数一般为 0-1 之间，默认 0.2。

```jsx | pure
setZoomMiniSize(size: number): void
```

参数：

| 名称 | 类型   | 必传 | 默认值 | 描述                 |
| :--- | :----- | :--- | :----- | :------------------- |
| size | Number | ✅   | 0.2    | 最小缩放比，默认 0.2 |

示例：

```jsx | pure
lf.setZoomMiniSize(0.3);
```

### setZoomMaxSize

设置图形放大时，能放大到的最大倍数，默认 16。

```jsx | pure
setZoomMaxSize(size: number): void
```

参数：

| 名称 | 类型   | 必传 | 默认值 | 描述                  |
| :--- | :----- | :--- | :----- | :-------------------- |
| size | Number | ✅   | 16     | 最大放大倍数，默认 16 |

示例：

```jsx | pure
lf.setZoomMaxSize(20);
```

### getTransform

获取当前画布的放大缩小值。

```jsx | pure
const transform = lf.getTransform();
console.log(transform);
```

### translate

平移图

参数

| 名称 | 类型   | 必传 | 默认值 | 描述         |
| :--- | :----- | :--- | :----- | :----------- |
| x    | Number | ✅   |        | x 轴平移距离 |
| y    | Number | ✅   |        | y 轴平移距离 |

```jsx | pure
lf.translate(100, 100);
```

### resetTranslate

还原图形为初始位置

```jsx | pure
lf.resetTranslate();
```

### translateCenter

图形画布居中显示。

```jsx | pure
lf.translateCenter();
```


### fitView

将整个流程图缩小到画布能全部显示。

参数:

| 名称             | 类型   | 必传 | 默认值 | 描述                           |
| :--------------- | :----- | :--- | :----- | :----------------------------- |
| verticalOffset   | Number | ✅   | 20     | 距离盒子上下的距离， 默认为 20 |
| horizontalOffset | Number | ✅   | 20     | 距离盒子左右的距离， 默认为 20 |

```jsx | pure
lf.fitView(deltaX, deltaY);
```

### openEdgeAnimation

开启边的动画。

```jsx | pure
lf.openEdgeAnimation(edgeId: string):void;
```

### closeEdgeAnimation

关闭边的动画。

```jsx | pure
lf.closeEdgeAnimation(edgeId: string):void;
```

## 事件系统 相关

### on

图的监听事件，更多事件请查看[事件](event-center-api)。

```jsx | pure
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

| 名称     | 类型   | 必传 | 默认值 | 描述     |
| :------- | :----- | :--- | :----- | :------- |
| evt      | String | ✅   | -      | 事件名称 |
| callback | String | ✅   | -      | 回调函数 |

示例：

```jsx | pure
lf.on("node:click", (args) => {
  console.log("node:click", args.position);
});
lf.on("element:click", (args) => {
  console.log("element:click", args.e.target);
});
```

### off

删除事件监听。

```jsx | pure
off(evt: string, callback: Function): this
```

参数：

| 名称     | 类型   | 必传 | 默认值 | 描述     |
| :------- | :----- | :--- | :----- | :------- |
| evt      | String | ✅   | -      | 事件名称 |
| callback | String | ✅   | -      | 回调函数 |

示例：

```jsx | pure
lf.off("node:click", () => {
  console.log("node:click off");
});
lf.off("element:click", () => {
  console.log("element:click off");
});
```

### once

事件监听一次。

```jsx | pure
once(evt: string, callback: Function): this
```

参数：

| 名称     | 类型   | 必传 | 默认值 | 描述     |
| :------- | :----- | :--- | :----- | :------- |
| evt      | String | ✅   | -      | 事件名称 |
| callback | String | ✅   | -      | 回调函数 |

示例：

```jsx | pure
lf.once("node:click", () => {
  console.log("node:click");
});
```

### emit

触发事件。

```jsx | pure
emit(evt: string, ...args): this
```

参数：

| 名称 | 类型   | 必传 | 默认值 | 描述         |
| :--- | :----- | :--- | :----- | :----------- |
| evt  | String | ✅   | -      | 事件名称     |
| args | Array  | ✅   | -      | 触发事件参数 |

示例：

```jsx | pure
lf.emit("custom:button-click", model);
```