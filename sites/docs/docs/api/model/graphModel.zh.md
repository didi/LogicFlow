---
nav: API
title: graphModel
toc: content
order: 0
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

graphModel 是 LogicFlow 中整个画布对应的 `model`。

LogicFlow 实例上的大多方法都是在 graphModel 上进行的简单封装。

可以通过一下几种方法获取到 graphModel

- 直接从 lf 属性中获取。`lf.graphModel`
- 自定义`model`的时候，从构造函数中获取，也可以在方法中从`this`中获取。

```tsx | pure
class CustomModel extends RectNodeModel {
  getNodeStyle() {
    const graphModel = this.graphModel
  }
}
```

- 自定义`view`的时候，从`props`中获取。

```tsx | pure
class CustomNode extends RectNode {
  getShape() {
    const { model, graphModel } = this.props
    // ...
  }
}
```

:::info{title=提示}
**注意**graphModel 上所有的属性都是只读，要想修改，请使用提供的对应方法进行修改。
:::

## 属性

| 属性                          | 类型                                            | 默认值   | 描述                                                    |
|:----------------------------|:----------------------------------------------|:------|:------------------------------------------------------|
| width                       | `number`                                      |       | LogicFlow 画布宽度                                        |
| height                      | `number`                                      |       | LogicFlow 画布高度                                        |
| theme                       | `LogicFlow.Theme`                             |       | [详细 API](../theme.zh.md)                              |
| animation                   | `boolean \| LFOptions.AnimationConfig`        | false | 动画状态配置，是否已打开对应的动画                                     |
| [eventCenter](#eventcenter) | `EventEmitter`                                |       | 事件中心, 可以通过这个对象向外部抛出事件                                 |
| modelMap                    | `Map<string, BaseNodeModel \| BaseEdgeModel>` |       | 维护所有节点和边类型对应的 model                                   |
| [topElement](#topElement)   | `BaseNodeModel \| BaseEdgeModel`              |       | 位于当前画布顶部的元素                                           |
| idGenerator                 | `(type?: string) => string \| undefined`      |       | 自定义全局 id 生成器                                          |
| nodeMoveRules               | `Model.NodeMoveRule[]`                        | []    | 节点移动规则, 在节点移动的时候，会触发此数组中的所有规则判断                       |
| customTrajectory            | `LFOptions.CustomAnchorLineProps`             |       | 获取自定义连线轨迹                                             |
| edgeGenerator               | `LFOptions.EdgeGeneratorType`                 |       | 节点间连线、连线变更时边的生成规则                                     |
| edgeType                    | `string`                                      |       | 在图上操作创建边时，默认使用的边类型                                    |
| nodes                       | `BaseNodeModel[]`                             | []    | 画布所有的节点对象                                             |
| edges                       | `BaseEdgeModel[]`                             | []    | 画布所有的连线对象                                             |
| fakeNode                    | `BaseNodeModel  \| null`                      | null  | 外部拖入节点进入画布的过程中，用 fakeNode 来和画布上正式的节点区分开               |
| [overlapMode](#overlapmode) | `number`                                      |       | 元素重合时堆叠模式; 0:默认模式, 1:递增模式                             |
| background                  | `false \| LFOptions.BackgroundConfig`         |       | 画布背景配置                                                |
| transformModel              | `TransformModel`                              |       | 当前画布平移、缩放矩阵 `model`, 详细见[API](./transformModel.zh.md)   |
| editConfigModel             | `EditConfigModel`                             |       | 页面编辑基本配置对象, 详细见[editConfigApi](./editConfigModel.zh.md) |
| gridSize                    | `number`                                      | 1     | 网格大小                                                  |
| partial                     | `boolean`                                     | false | 是否开启局部渲染，当页面元素数量过多的时候，开启局部渲染会提高页面渲染性能                 |
| nodesMap                    | `GraphModel.NodesMapType`                     |       | 画布所有节点的构成的 `map`                                      |
| edgesMap                    | `GraphModel.EdgesMapType`                     |       | 画布所有边构成的 `map`                                        |
| modelsMap                   | `GraphModel.ModelsMapType`                    |       | 画布所有节点和边共同构成的 `map`                                   |
| selectNodes                 | `BaseNodeModel[]`                             |       | 画布中所有选中节点对象                                           |
| sortElements                | `array`                                       |       | 按照 zIndex 排序后的元素，基于zIndex对元素进行排序                      |
| textEditElement             | `BaseNodeModel \| BaseEdgeModel`              |       | 当前被编辑的元素                                              |
| selectElements              | `Map<string, BaseNodeModel \| BaseEdgeModel>` |       | 当前画布所有被选中的元素                                          |

### eventCenter<Badge>属性</Badge>

logicflow 内部的事件中心，可以通过这个对象向外部抛出事件。

示例

```tsx | pure
class UserTaskModel extends RectNodeModel {
  setAttributes() {
    this.menu = [
      {
        text: "详情",
        callback: (res) => {
          this.graphModel.eventCenter.emit("user:detail", res);
        },
      },
    ];
  }
}

// 监听
lf.on("user:detail", (res) => {});
```

### topElement<Badge>属性</Badge>

位于当前画布顶部的元素。<br>
此元素只在堆叠模式为默认模式下存在。
用于在默认模式下将之前的顶部元素恢复初始顺序。

### overlapMode<Badge>属性</Badge>

元素重合时堆叠模式<br>

- 值为`0`: 默认模式，节点和边被选中，会被显示在最上面。当取消选中后，元素会恢复之前的层级。
- 值为`1`: 递增模式，节点和边被选中，会被显示在最上面。当取消选中后，元素会保持层级。

## 方法

### getAreaElement<Badge>方法</Badge>

获取指定区域内的所有元素

入参:

| 名称                | 类型         | 默认值 | 说明            |
|-------------------|------------|-----|---------------|
| leftTopPoint      | PointTuple | 无   | 区域左上方的点       |
| rightBottomPoint  | PointTuple | 无   | 区域右下角的点       |
| wholeEdge         | boolean    | 无   | 是否要整个边都在区域内部  |
| wholeNode         | boolean    | 无   | 是否要整个节点都在区域内部 |
| ignoreHideElement | boolean    | 无   | 是否忽略隐藏的节点     |

```tsx | pure
graphModel.getAreaElement([100, 100], [800, 800]);
```

### getModel<Badge>方法</Badge>

获取指定类型的 Model 构造函数

入参:

| 名称   | 类型     | 默认值 | 说明 |
|------|--------|-----|----|
| type | string | 无   | 类型 |

返回值: [NodeModel](./nodeModel.zh.md) 或 [EdgeModel](./edgeModel.zh.md)

```tsx | pure
graphModel.getModel("rect");
```

### getNodeModelById<Badge>方法</Badge>

获取指定类型节点的 Mdoel 构造函数

入参:

| 名称   | 类型     | 默认值 | 说明 |
|------|--------|-----|----|
| type | string | 无   | 类型 |

返回值: [NodeModel](./nodeModel.zh.md)

```tsx | pure
graphModel.getNodeModelById("node_1");
```

### getPointByClient<Badge>方法</Badge>

获取鼠标点击的位置在画布上的坐标

> 因为流程图所在的位置可以是页面任何地方,当内部事件需要获取触发事件时，其相对于画布左上角的位置需要事件触发位置减去画布相对于
> client 的位置。

入参:

| 名称    | 类型       | 默认值 | 说明      |
|-------|----------|-----|---------|
| point | Position | 无   | HTML 坐标 |

返回值:

| 名称                    | 类型       | 默认值 | 说明                          |
|-----------------------|----------|-----|-----------------------------|
| domOverlayPosition    | Position | 无   | HTML 层坐标，一般控制组件的位置时使用此坐标    |
| canvasOverlayPosition | Position | 无   | Canvas 层坐标，一般节点、边的坐标是这一层的坐标 |

为什么要这个方法，为什么鼠标点击的同一个位置会产生两个不同的坐标？

因为画布存在缩放和平移。当移动了画布，在视觉上看起来，画布上的元素位置变了，但是在数据层面，画布上的节点和边位置是没有变化的。反过来举个例子：在一个宽高为
1000px \* 1000px 的画布中间有一个节点，这个节点的位置很可能是`{x: -999,y: -999}`,
因为平移过来的。但是当双击这个节点，我们需要在节点位置显示一个文本输入框的时候，因为输入框是在`domOverlay`
层，这一层不像`CanvasOverlay`
一样有缩放和平移，其宽高和画布宽高一致。所以这个文本输入框坐标应该是`{x: 500, y: 500}`。

我们再来看为什么要这个方法？

假设这个画布距离浏览器顶部距离为 100，左侧距离也为 100. 那么当用户点击画布中心的时候，js
监听点击函数拿到的位置应该是`{x: 600, y: 600}`,
这个时候调用这个方法，就可以得到 `canvasOverlayPosition` 为`{x: -999,y: -999}`，`domOverlayPosition`
为 `{x: 500, y: 500}`。开发者就可以基于这两个坐标进行自己需要的开发。比如在`domOverlayPosition`
位置显示一个菜单之类的。

```tsx | pure
graphModel.getPointByClient({ x: 200, y: 200 });
```

### isElementInArea<Badge>方法</Badge>

判断一个元素是否在指定矩形区域内。

入参:

| 名称        | 类型                    | 默认值  | 说明             |
|-----------|-----------------------|------|----------------|
| element   | NodeModel 或 EdgeModel | 无    | 元素的 model      |
| lt        | PointTuple            | 无    | 左上角点           |
| rb        | PointTuple            | 无    | 右下角点           |
| wholeEdge | boolean               | true | 边的起点和终点都在区域内才算 |
| wholeNode | boolean               | true | 节点的box都在区域内才算  |

返回值: `boolean`

```tsx | pure
const node = {
  type: "rect",
  x: 300,
  y: 300,
};
graphModel.isElementInArea(node, [200, 200], [400, 400]);
```

### getAreaElements<Badge>方法</Badge>

获取指定区域内的所有元素

入参:

| 名称                | 类型         | 默认值   | 说明             |
|-------------------|------------|-------|----------------|
| leftTopPoint      | PointTuple | 无     | 左上角点           |
| rightBottomPoint  | PointTuple | 无     | 右下角点           |
| ignoreHideElement | boolean    | false | 忽略隐藏元素         |
| wholeEdge         | boolean    | true  | 边的起点和终点都在区域内才算 |
| wholeNode         | boolean    | true  | 节点的box都在区域内才算  |

返回值: `LogicFlow.GraphElement[]`

### graphDataToModel<Badge>方法</Badge>

使用新的数据重新设置整个画布的元素

注意：将会清除画布上所有已有的节点和边

入参:

| 名称        | 类型              | 默认值 | 说明     |
|-----------|-----------------|-----|--------|
| graphData | GraphConfigData | 无   | 图的基本数据 |

```tsx | pure
const graphData = {
  nodes: [
    {
      id: "node_id_1",
      type: "rect",
      x: 100,
      y: 100,
      text: { x: 100, y: 100, value: "节点1" },
      properties: {},
    },
    {
      id: "node_id_2",
      type: "circle",
      x: 200,
      y: 300,
      text: { x: 200, y: 300, value: "节点2" },
      properties: {},
    },
  ],
  edges: [
    {
      id: "edge_id",
      type: "polyline",
      sourceNodeId: "node_id_1",
      targetNodeId: "node_id_2",
      text: { x: 139, y: 200, value: "连线" },
      startPoint: { x: 100, y: 140 },
      endPoint: { x: 200, y: 250 },
      pointsList: [
        { x: 100, y: 140 },
        { x: 100, y: 200 },
        { x: 200, y: 200 },
        { x: 200, y: 250 },
      ],
      properties: {},
    },
  ],
};

graphModel.graphDataToModel(graphData);
```

### modelToGraphData<Badge>方法</Badge>

获取 graphModel 对应的原始数据

返回值: `GraphConfigData`

```tsx | pure
const graphData = graphModel.modelToGraphData();
console.log(graphData)
```

### modelToHistoryData<Badge>方法</Badge>

获取 history 记录的数据

返回值：false | HistoryData

```tsx | pure
const historyData = graphModel.modelToHistoryData();
console.log(historyData)
```

### getEdgeModelById<Badge>方法</Badge>

获取边的 Model

入参:

| 名称     | 类型     | 默认值 | 说明   |
|--------|--------|-----|------|
| edgeId | string | 无   | 边 Id |

返回值: [EdgeModel](./edgeModel.zh.md)

```tsx | pure
const edgeModel = graphModel.getEdgeModelById('edge_id');
console.log(edgeModel)
```

### getElement<Badge>方法</Badge>

获取节点或者边的 Model

入参:

| 名称 | 类型     | 默认值 | 说明           |
|----|--------|-----|--------------|
| id | string | 无   | 边 Id 或者节点 Id |

返回值: [EdgeModel](./edgeModel.zh.md) 或者 [NodeModel](nodeModel.zh.md)

```tsx | pure
const edgeModel = graphModel.getElement('edge_id');
console.log(edgeModel)
```

### getNodeEdges<Badge>方法</Badge>

获取指定节点上所有的边

入参:

| 名称     | 类型     | 默认值 | 说明    |
|--------|--------|-----|-------|
| nodeId | string | 无   | 节点 Id |

返回值: [EdgeModel](./edgeModel.zh.md)

```tsx | pure
const edgeModels = graphModel.getNodeEdges('node_id_1');
console.log(edgeModels)
```

### getSelectElements<Badge>方法</Badge>

获取选中的元素数据

入参:

| 名称            | 类型      | 默认值  | 说明                                                                      |
|---------------|---------|------|-------------------------------------------------------------------------|
| isIgnoreCheck | boolean | true | 是否包括 sourceNode 和 targetNode 没有被选中的边,默认包括。 复制的时候不能包括此类边, 因为复制的时候不允许悬空的边 |

```tsx | pure
const elements = graphModel.getSelectElements(true);
console.log(elements)
```

### updateAttributes<Badge>方法</Badge>

修改对应元素 model 中的属性

:::warning{title=警告}
注意：此方法慎用，除非您对 logicflow 内部有足够的了解。<br>
大多数情况下，请使用 setProperties、updateText、changeNodeId 等方法。<br>
例如:直接使用此方法修改节点的 id,那么就是会导致连接到此节点的边的 sourceNodeId 出现找不到的情况。
:::

入参:

| 名称         | 类型     | 默认值 | 说明    |
|------------|--------|-----|-------|
| id         | string | 无   | 节点 Id |
| attributes | object | 无   | 元素属性  |

```tsx | pure
graphModel.updateAttributes("node_id_1", {
  radius: 4,
});
```

### getVirtualRectSize<Badge>方法</Badge>

获取图形区域虚拟矩形的大小及其中心位置

参数 `includeEdge: boolean = false`
返回值 `GraphModel.VirtualRectProps`

```tsx | pure
const virtualdata = graphModel.getVirtualRectSize();
console.log(virtualdata);
// virtualdata输出内容 : { width, height, x, y }
```

### changeNodeId<Badge>方法</Badge>

修改节点的 id， 如果不传新的 id，会内部自动创建一个。

入参:

| 名称    | 类型     | 默认值 | 说明    |
|-------|--------|-----|-------|
| oldId | string | 无   | 节点 Id |
| newId | string | 无   | 新的 Id |

```tsx | pure
graphModel.changeNodeId("node_id_1", "node_id_2");
```

### changeEdgeId<Badge>方法</Badge>

修改边的 id， 如果不传新的 id，会内部自动创建一个。

入参:

| 名称    | 类型     | 默认值 | 说明    |
|-------|--------|-----|-------|
| oldId | string | 无   | 节点 Id |
| newId | string | 无   | 新的 Id |

```tsx | pure
graphModel.changeEdgeId("edge_id_1", "edge_id_2");
```

### handleEdgeTextMove<Badge>方法</Badge>

移动边上的 Text

入参:

| 名称   | 类型            | 默认值 | 说明      |
|------|---------------|-----|---------|
| edge | BaseEdgeModel | 无   | 边 model |
| x    | number        | 无   | x 轴坐标值  |
| y    | number        | 无   | y 轴坐标值  |

### getRelatedEdgesByType<Badge>方法</Badge>

根据节点 id 获取与之相关的所有边的 model

入参:

| 名称     | 类型                               | 默认值 | 说明                                   |
|--------|----------------------------------|-----|--------------------------------------|
| nodeId | string                           | 无   | 目标节点 id                              |
| type   | 'sourceNodeId' \| 'targetNodeId' | 无   | sourceNodeId: 源节点；targetNodeId: 目标节点 |

### toFront<Badge>方法</Badge>

将指定节点或者边放置在前面

如果堆叠模式为默认模式，则将指定元素置顶zIndex设置为9999，原置顶元素重新恢复原有层级zIndex设置为1。

如果堆叠模式为递增模式，则将需指定元素 zIndex 设置为当前最大 zIndex + 1。

入参:

| 名称 | 类型     | 默认值 | 说明          |
|----|--------|-----|-------------|
| id | string | 无   | 节点 id 或边 id |

```tsx | pure
graphModel.toFront("edge_id_1");
```

### setElementZIndex<Badge>方法</Badge>

设置元素的 zIndex.

注意：默认堆叠模式下，不建议使用此方法。

入参:

| 名称     | 类型                      | 默认值 | 说明                          |
|--------|-------------------------|-----|-----------------------------|
| id     | string                  | 无   | 节点 id 或边 id                 |
| zIndex | number\|'top'\|'bottom' | 无   | 可以传数字，也支持传入`top` 和 `bottom` |

```tsx | pure
graphModel.setElementZIndex("top");
```

### setElementStateById<Badge>方法</Badge>

设置元素的状态（在需要保证整个画布上所有的元素只有一个元素拥有某状态时，可以调用此方法）

入参:

| 名称                | 类型                            | 必传 | 默认值 | 说明                          |
|-------------------|-------------------------------|----|-----|-----------------------------|
| id                | string                        | ✅  | 无   | 节点 id 或边 id                 |
| state             | `ElementState`                | ✅  | 无   | 设置 Node \| Edge 等 model 的状态 |
| additionStateData | `Model.AdditionStateDataType` | -  | 无   | 传递的额外值                      |

```tsx | pure
interface ElementState {
  DEFAULT: 1, // 默认显示
  TEXT_EDIT: 2, // 此元素正在进行文本编辑
  SHOW_MENU: 3, // 显示菜单，废弃请使用菜单插件
  ALLOW_CONNECT: 4, // 此元素允许作为当前边的目标节点
  NOT_ALLOW_CONNECT: 5, // 此元素不允许作为当前边的目标节点
}
```

使用：

```tsx | pure
graphModel.setElementStateById("node_1", 4);
```

### deleteNode<Badge>方法</Badge>

删除节点

入参:

| 名称 | 类型     | 默认值 | 说明    |
|----|--------|-----|-------|
| id | string | 无   | 节点 ID |

```tsx | pure
graphModel.deleteNode("node_1");
```

### addNode<Badge>方法</Badge>

添加节点

入参:

| 名称         | 类型         | 默认值 | 说明   |
|------------|------------|-----|------|
| nodeConfig | NodeConfig | 无   | 节点配置 |

```tsx | pure
const nodeModel = graphModel.addNode({
  type: "rect",
  x: 300,
  y: 300,
});
```

### cloneNode<Badge>方法</Badge>

克隆节点

入参:

| 名称     | 类型     | 默认值 | 说明    |
|--------|--------|-----|-------|
| nodeId | string | 无   | 节点 id |

```tsx | pure
const nodeModel = graphModel.cloneNode("node_1");
```

### moveNode<Badge>方法</Badge>

移动节点

入参:

| 名称           | 类型      | 默认值   | 说明         |
|--------------|---------|-------|------------|
| nodeId       | string  | 无     | 节点 id      |
| deltaX       | number  | 无     | 移动 x 轴距离   |
| deltaY       | number  | 无     | 移动 y 轴距离   |
| isignoreRule | boolean | false | 是否忽略移动规则限制 |

```tsx | pure
graphModel.moveNode("node_1", 10, 10, true);
```

### moveNode2Coordinate<Badge>方法</Badge>

移动节点-绝对位置

入参:

| 名称           | 类型      | 默认值   | 说明         |
|--------------|---------|-------|------------|
| nodeId       | string  | 无     | 节点 id      |
| x            | number  | 无     | 移动 x 轴距离   |
| y            | number  | 无     | 移动 y 轴距离   |
| isignoreRule | boolean | false | 是否忽略移动规则限制 |

```tsx | pure
graphModel.moveNode2Coordinate("node_1", 100, 100, true);
```

### editText<Badge>方法</Badge>

显示节点、连线文本编辑框, 进入编辑状态

入参:

| 名称 | 类型     | 默认值 | 说明           |
|----|--------|-----|--------------|
| id | string | 无   | 节点 id 或者边 id |

```tsx | pure
graphModel.editText("node_1");
```

:::info{title=注意}
当初始化 lf 实例的时候，传入的设置了文本不可编辑，这个时候 LogicFlow 内部不会监听事件去取消元素的编辑状态。这个时候需要自己手动监听,
然后使用`setElementState`方法取消文本编辑状态。
:::

### setElementState<Badge>方法</Badge>

设置元素的状态

入参:

| 名称   | 类型     | 默认值 | 说明                                          |
|------|--------|-----|---------------------------------------------|
| type | number | 无   | 1 表示默认状态；2 表示文本编辑中；4 表示不节点不允许被连接；5 表示节点允许连接 |

例如在某些场景中，节点和连线都默认不允许编辑的。但是当某些操作后，就允许编辑了，这个时候可以通过此方法将元素从编辑状态设置为不可以编辑状态。

```tsx | pure
lf.on("node:dbclick", ({ data }) => {
  lf.graphModel.editText(data.id);
  lf.once("graph:transform,node:click,blank:click", () => {
    lf.graphModel.textEditElement.setElementState(1);
  });
});
```

### addEdge<Badge>方法</Badge>

添加边

入参:

| 名称         | 类型         | 默认值 | 说明  |
|------------|------------|-----|-----|
| edgeConfig | EdgeConfig | 无   | 边配置 |

```tsx | pure
const edgeModel = graphModel.addEdge({
  type: "polyline",
  sourceNodeId: "node_1",
  targetNodeId: "node_2",
});
```

### deleteEdgeBySourceAndTarget<Badge>方法</Badge>

删除边

入参:

| 名称           | 类型     | 默认值 | 说明      |
|--------------|--------|-----|---------|
| sourceNodeId | string | 无   | 起点 id   |
| targetNodeId | string | 无   | 结束节点 ID |

```tsx | pure
graphModel.deleteEdgeBySourceAndTarget("node_1", "node_2");
```

### deleteEdgeById<Badge>方法</Badge>

基于边 Id 删除边

入参:

| 名称 | 类型     | 默认值 | 说明   |
|----|--------|-----|------|
| id | string | 无   | 边 id |

```tsx | pure
graphModel.deleteEdgeById("edge_1");
```

### deleteEdgeBySource<Badge>方法</Badge>

删除指定节点为起点的所有边

入参:

| 名称 | 类型     | 默认值 | 说明     |
|----|--------|-----|--------|
| id | string | 无   | 边起点 id |

```tsx | pure
graphModel.deleteEdgeBySource("node_1");
```

### deleteEdgeByTarget<Badge>方法</Badge>

删除指定节点为目标点的所有边

入参:

| 名称 | 类型     | 默认值 | 说明      |
|----|--------|-----|---------|
| id | string | 无   | 边目的点 id |

```tsx | pure
graphModel.deleteEdgeByTarget("node_1");
```

### updateText<Badge>方法</Badge>

设置指定元素的文案

```tsx | pure
graphModel.updateText("node_1", "hello world");
```

### selectNodeById<Badge>方法</Badge>

选中节点

入参:

| 名称       | 类型      | 默认值 | 说明    |
|----------|---------|-----|-------|
| id       | string  | 无   | 节点 id |
| multiple | boolean | 无   | 是否多选  |

```tsx | pure
graphModel.selectNodeById("node_1", true);
```

### selectEdgeById<Badge>方法</Badge>

选中边

入参:

| 名称       | 类型      | 默认值 | 说明    |
|----------|---------|-----|-------|
| id       | string  | 无   | 节点 id |
| multiple | boolean | 无   | 是否多选  |

```tsx | pure
graphModel.selectEdgeById("edge_1", true);
```

### selectElementById<Badge>方法</Badge>

选中节点和边

入参:

| 名称       | 类型      | 默认值 | 说明      |
|----------|---------|-----|---------|
| id       | string  | 无   | 节点或边 id |
| multiple | boolean | 无   | 是否多选    |

```tsx | pure
graphModel.selectElementById("edge_1", true);
```

### clearSelectElements<Badge>方法</Badge>

取消所有被选中元素的选中状态

```tsx | pure
graphModel.clearSelectElements();
```

### moveNodes<Badge>方法</Badge>

批量移动节点，节点移动的时候，会动态计算所有节点与未移动节点的边位置

移动的节点之间的边会保持相对位置

参数

| 名称      | 类型       | 必传 | 默认值 | 描述        |
|:--------|:---------|:---|:----|:----------|
| nodeIds | string[] | ✅  | 无   | 所有节点 id   |
| deltaX  | number   | ✅  | 无   | 移动的 x 轴距离 |
| deltaY  | number   | ✅  | 无   | 移动的 y 轴距离 |

```tsx | pure
graphModel.moveNodes(["node_id", "node_2"], 10, 10);
```

### addNodeMoveRules<Badge>方法</Badge>

添加节点移动限制规则，在节点移动的时候触发。

如果方法返回 false, 则会阻止节点移动。

```tsx | pure
graphModel.addNodeMoveRules((nodeModel, x, y) => {
  if (nodeModel.properties.disabled) {
    return false;
  }
  return true;
});
```

### getNodeIncomingNode<Badge>方法</Badge>

获取节点所有的上一级节点

```tsx | pure
graphModel.getNodeIncomingNode = (nodeId: string): BaseNodeModel[] => {}
```

参数：

| 名称     | 类型     | 必传 | 默认值 | 描述    |
|:-------|:-------|:---|:----|:------|
| nodeId | string | ✅  | -   | 节点 id |

### getNodeOutgoingNode<Badge>方法</Badge>

获取节点所有的下一级节点

```tsx | pure
graphModel.getNodeOutgoingNode = (nodeId: string): BaseNodeModel[] => {}
```

参数：

| 名称     | 类型     | 必传 | 默认值 | 描述    |
|:-------|:-------|:---|:----|:------|
| nodeId | string | ✅  | -   | 节点 id |

### getNodeIncomingEdge<Badge>方法</Badge>

获取所有以此节点为终点的边

```tsx | pure
graphModel.getNodeIncomingEdge = (nodeId: string): BaseEdgeModel[] => {}
```

参数：

| 名称     | 类型     | 必传 | 默认值 | 描述    |
|:-------|:-------|:---|:----|:------|
| nodeId | string | ✅  | -   | 节点 id |

### getNodeOutgoingEdge<Badge>方法</Badge>

获取所有以此节点为起点的边

```tsx | pure
graphModel.getNodeOutgoingEdge = (nodeId: string): BaseEdgeModel[] => {}
```

参数：

| 名称     | 类型     | 必传 | 默认值 | 描述    |
|:-------|:-------|:---|:----|:------|
| nodeId | string | ✅  | -   | 节点 id |

### setDefaultEdgeType<Badge>方法</Badge>

修改默认边的类型

参数

| 名称   | 类型     | 必传 | 默认值 | 描述  |
|:-----|:-------|:---|:----|:----|
| type | string | ✅  | 无   | 边类型 |

```tsx | pure
graphModel.setDefaultEdgeType("bezier");
```

### changeNodeType<Badge>方法</Badge>

修改指定节点的类型

参数

| 名称   | 类型     | 必传 | 默认值 | 描述   |
|:-----|:-------|:---|:----|:-----|
| id   | string | ✅  | 无   | 节点   |
| type | string | ✅  | 无   | 节点类型 |

```tsx | pure
graphModel.changeNodeType("node_1", "circle");
```

### changeEdgeType<Badge>方法</Badge>

修改指定节点的类型

参数

| 名称   | 类型     | 必传 | 默认值 | 描述  |
|:-----|:-------|:---|:----|:----|
| id   | string | ✅  | 无   | 节点  |
| type | string | ✅  | 无   | 边类型 |

```tsx | pure
graphModel.changeEdgeType("edge_1", "bezier");
```

### openEdgeAnimation<Badge>方法</Badge>

开启边动画开关

参数 edgeId: string

```tsx | pure
graphModel.openEdgeAnimation("edge_1");
```

### closeEdgeAnimation<Badge>方法</Badge>

关闭边动画开关

参数 edgeId: string

```tsx | pure
graphModel.closeEdgeAnimation("edge_1");
```

### setTheme<Badge>方法</Badge>

设置主题

```tsx | pure
graphModel.setTheme({
  rect: {
    fill: "red",
  },
});
```

### resize<Badge>方法</Badge>

重新设置画布的宽高

```tsx | pure
graphModel.resize(1000, 600);
```

### clearData<Badge>方法</Badge>

清空画布所有元素

```tsx | pure
graphModel.clearData();
```

### translateCenter<Badge>方法</Badge>

将图像整体移动到画布中心

```tsx | pure
graphModel.translateCenter();
```

### fitView<Badge>方法</Badge>

画布图形适应屏幕大小

参数
| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :--- | :----- | :--- | :----- | :----- |
| verticalOffset | number | - | 20 | 距离盒子上下的距离 |
| horizontalOffset | number | - | 20 | 距离盒子左右的距离 |

```tsx | pure
graphModel.fitView();
```
