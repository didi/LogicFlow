LogicFlow 提供了丰富的 API 来帮助开发者构建流程图编辑器。本文档详细介绍了所有可用的 API 方法。

## 目录

- [图形相关 API](#graph-相关)
- [节点相关 API](#node-相关) 
- [边相关 API](#edge-相关)
- [注册相关 API](#register-相关)
- [元素相关 API](#element-相关)
- [文本相关 API](#text-相关)
- [历史记录相关 API](#history-相关)
- [变换相关 API](#transform-相关)
- [事件系统相关 API](#事件系统-相关)

## API 说明

每个 API 方法都包含以下信息:
- 方法说明:简要描述方法的功能
- 参数说明:详细的参数类型和用途说明
- 返回值:方法的返回值类型和说明  
- 使用示例:展示如何使用该方法
- 注意事项:使用该方法时需要注意的问题

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

## Graph 相关

图形相关的 API 主要用于操作整个流程图画布,包括画布主题设置、视口操作、数据操作等。

### setTheme

设置画布主题。

**参数**

| 名称        | 类型                    | 必传 | 默认值 | 描述         |
| :---------- | :---------------------- | :--- | :----- | :----------- |
| themeConfig | [Theme](../theme.zh.md) | ✅    | -      | 主题配置对象 |

**示例**

```ts
lf.setTheme({
  rect: {
    radius: 6,
    stroke: '#8f8f8f'
  },
  circle: {
    r: 24,
    stroke: '#8f8f8f'
  },
  nodeText: {
    color: '#000000'
  },
  edgeText: {
    color: '#000000'
  }
});
```

**版本**

1.0.0+

### focusOn

将视口中心定位到指定节点或坐标。

**参数**

| 名称        | 类型   | 必传 | 默认值 | 描述            |
| :---------- | :----- | :--- | :----- | :-------------- |
| focusOnArgs | object | ✅    | -      | 定位参数,见下表 |

**focusOnArgs 参数**

| 名称       | 类型                   | 必传 | 默认值 | 描述    |
| :--------- | :--------------------- | :--- | :----- | :------ |
| id         | string                 | -    | -      | 节点 ID |
| coordinate | {x: number, y: number} | -    | -      | 坐标点  |

**示例**

```ts
// 定位到节点
lf.focusOn({
  id: 'node_1'
});

// 定位到坐标
lf.focusOn({
  coordinate: {
    x: 100,
    y: 100
  }
}); 
```

**注意事项**

- id 和 coordinate 参数二选一
- 如果节点 ID 不存在会报错

**版本**

1.0.0+

### resize

调整画布大小。

**参数** 

| 名称   | 类型   | 必传 | 默认值 | 描述     |
| :----- | :----- | :--- | :----- | :------- |
| width  | number | -    | -      | 画布宽度 |
| height | number | -    | -      | 画布高度 |

**示例**

```ts
// 设置画布大小为 1000 x 800
lf.resize(1000, 800);

// 自适应容器大小
lf.resize();
```

**注意事项**

- 不传参数时会自动适配容器大小
- 画布大小变化后需要重新渲染内容

**版本**

1.0.0+

### toFront

将指定元素置于顶层。

**参数**

| 名称 | 类型   | 必传 | 默认值 | 描述    |
| :--- | :----- | :--- | :----- | :------ |
| id   | string | ✅    | -      | 元素 ID |

**示例**

```ts
// 将节点置顶
lf.toFront('node_1');

// 将边置顶
lf.toFront('edge_1');
```

**注意事项**

- 在默认堆叠模式下,被置顶元素的 zIndex 会被设为 9999,原置顶元素恢复为 1
- 在递增模式下,被置顶元素的 zIndex 会被设为当前最大 zIndex + 1

**版本**

1.0.0+

### getPointByClient

获取相对于画布左上角的坐标点。由于画布可以位于页面任意位置,该方法可以将页面坐标转换为画布坐标。

**参数**

| 名称 | 类型   | 必传 | 默认值 | 描述                      |
| :--- | :----- | :--- | :----- | :------------------------ |
| x    | number | ✅    | -      | 相对于页面左上角的 x 坐标 |
| y    | number | ✅    | -      | 相对于页面左上角的 y 坐标 |

**返回值**

```ts
type Position = {
  x: number;
  y: number;
};

type Point = {
  domOverlayPosition: Position; // HTML 层的坐标
  canvasOverlayPosition: Position; // SVG 层的坐标
};
```

**示例**

```ts
// 转换鼠标事件坐标
lf.on('click', (e) => {
  const point = lf.getPointByClient(e.x, e.y);
  console.log('DOM层坐标:', point.domOverlayPosition);
  console.log('画布层坐标:', point.canvasOverlayPosition);
});
```

**注意事项**

- 通常用于处理鼠标事件的坐标转换
- 返回的坐标包含两个图层的位置信息

**版本**

1.0.0+

### getGraphData

获取流程图数据。如果使用了数据转换插件(adapter),则返回转换后的数据格式。

**参数**

| 名称      | 类型  | 必传 | 默认值 | 描述                      |
| :-------- | :---- | :--- | :----- | :------------------------ |
| ...params | any[] | -    | -      | 传递给 adapter 的额外参数 |

**返回值**

```ts
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
    startPoint: {
      x: number;
      y: number;
    };
    endPoint: {
      x: number;
      y: number;
    };
    text?: {
      x: number;
      y: number;
      value: string;
    };
    properties?: Record<string, unknown>;
    zIndex?: number;
    pointsList?: Point[]; // 折线、曲线的路径点
  }[];
};
```

**示例**

```ts
// 获取默认格式数据
const graphData = lf.getGraphData();

// 使用 adapter 并传入参数
const data = lf.getGraphData(['property1', 'property2']);
```

**注意事项**

- 从 1.2.5 版本开始支持传入参数
- 如果使用了 adapter 插件,返回格式由 adapter 决定
- 返回的数据可以直接用于渲染流程图

**版本**

1.0.0+

### getGraphRawData

获取流程图原始数据。与 getGraphData 不同,该方法返回的数据不会被 adapter 插件转换。

**返回值**

```ts
type GraphData = {
  nodes: NodeConfig[];
  edges: EdgeConfig[];
};
```

**示例**

```ts
// 获取原始数据
const rawData = lf.getGraphRawData();
console.log('节点:', rawData.nodes);
console.log('边:', rawData.edges);
```

**注意事项**

- 返回 LogicFlow 标准数据格式
- 即使配置了 adapter 也不会进行格式转换
- 主要用于需要处理原始数据的场景

**版本**

1.0.0+

### clearData

清空画布内容,删除所有节点和边。

**示例**

```ts
// 清空画布
lf.clearData();

// 清空后重新渲染
lf.clearData();
lf.render(newGraphData);
```

**注意事项**

- 该操作会触发 history 记录
- 清空后可以重新渲染新的数据
- 不会清除画布的样式和配置

**版本**

1.0.0+

### renderRawData

渲染原始数据(LogicFlow 标准格式)。即使配置了 adapter 插件,也可以用该方法渲染标准格式数据。

**参数**

| 名称      | 类型      | 必传 | 默认值 | 描述                       |
| :-------- | :-------- | :--- | :----- | :------------------------- |
| graphData | GraphData | ✅    | -      | LogicFlow 标准格式的图数据 |

**示例**

```ts
// 渲染标准格式数据
lf.renderRawData({
  nodes: [
    {
      id: 'node_1',
      type: 'rect',
      x: 100,
      y: 100,
      text: { value: '节点1' }
    }
  ],
  edges: [
    {
      id: 'edge_1',
      type: 'polyline',
      sourceNodeId: 'node_1',
      targetNodeId: 'node_2'
    }
  ]
});
```

**注意事项**

- 渲染前会先清空画布
- 数据必须符合 LogicFlow 标准格式
- 不会被 adapter 插件转换

**版本**

1.0.0+

### render

渲染图数据。如果配置了 adapter 插件,会先将数据转换为标准格式再渲染。

**参数**

| 名称      | 类型    | 必传 | 默认值 | 描述                           |
| :-------- | :------ | :--- | :----- | :----------------------------- |
| graphData | unknown | ✅    | -      | 图数据,格式取决于 adapter 配置 |

**示例**

```ts
// 使用默认格式
lf.render({
  nodes: [
    {
      id: 'node_1',
      type: 'rect',
      x: 100,
      y: 100
    }
  ],
  edges: []
});

// 使用自定义 adapter 后的格式
lf.render({
  processNodes: [{
    nodeId: 'node_1',
    nodeType: 'userTask'
  }],
  processEdges: []
});
```

**注意事项**

- 渲染前会先清空画布
- 如果配置了 adapter,数据会被转换为标准格式
- 支持任意格式的数据,但需要配置对应的 adapter

**版本**

1.0.0+

## Node 相关

节点相关的 API 用于操作流程图中的节点,包括节点的增删改查、属性设置、状态控制等功能。这些 API 让您能够以编程方式控制节点的行为。

### addNode

在画布上添加一个新节点。

**参数**

| 名称       | 类型       | 必传 | 默认值 | 描述            |
| :--------- | :--------- | :--- | :----- | :-------------- |
| nodeConfig | NodeConfig | ✅    | -      | 节点配置,见下表 |

**NodeConfig 参数**

| 名称       | 类型                    | 必传 | 默认值   | 描述               |
| :--------- | :---------------------- | :--- | :------- | :----------------- |
| id         | string                  | -    | 自动生成 | 节点唯一标识       |
| type       | string                  | ✅    | -        | 节点类型名称       |
| x          | number                  | ✅    | -        | 节点中心 x 坐标    |
| y          | number                  | ✅    | -        | 节点中心 y 坐标    |
| text       | string \| TextConfig    | -    | -        | 节点文本内容及样式 |
| properties | Record<string, unknown> | -    | {}       | 节点自定义属性     |

**TextConfig 类型**

```ts
type TextConfig = {
  value: string; // 文本内容
  x?: number; // 文本 x 坐标,不传默认使用节点中心点
  y?: number; // 文本 y 坐标,不传默认使用节点中心点
  draggable?: boolean; // 文本是否可拖动
  editable?: boolean; // 文本是否可编辑
};
```

**返回值**

| 类型          | 描述              |
| :------------ | :---------------- |
| BaseNodeModel | 节点的 model 实例 |

**示例**

```ts
// 添加基础节点
lf.addNode({
  type: 'rect',
  x: 100,
  y: 100
});

// 添加带文本的节点
lf.addNode({
  type: 'circle',
  x: 200,
  y: 300,
  text: '圆形节点'
});

// 添加带自定义属性的节点
lf.addNode({
  type: 'rect',
  x: 300,
  y: 200,
  text: {
    value: '矩形节点',
    draggable: true
  },
  properties: {
    status: 'pending',
    priority: 'high'
  }
});
```

**注意事项**

- type 必须是已注册的节点类型
- 坐标原点在画布左上角
- 节点 id 不指定时会自动生成
- 添加节点会触发 node:add 事件

**版本**

1.0.0+

### deleteNode

删除指定节点。如果该节点有连接的边,这些边也会被同时删除。

**参数**

| 名称   | 类型   | 必传 | 默认值 | 描述            |
| :----- | :----- | :--- | :----- | :-------------- |
| nodeId | string | ✅    | -      | 要删除的节点 ID |

**示例**

```ts
// 删除单个节点
lf.deleteNode('node_1');

// 批量删除节点
['node_1', 'node_2'].forEach(nodeId => {
  lf.deleteNode(nodeId);
});
```

**注意事项**

- 删除节点会同时删除与之相连的边
- 该操作会触发 node:delete 事件
- 支持撤销重做
- 如果节点不存在会抛出警告

**版本**

1.0.0+

### cloneNode

克隆一个节点,生成一个完全相同的新节点。

**参数**

| 名称   | 类型   | 必传 | 默认值 | 描述            |
| :----- | :----- | :--- | :----- | :-------------- |
| nodeId | string | ✅    | -      | 要克隆的节点 ID |

**返回值**

| 类型          | 描述                        |
| :------------ | :-------------------------- |
| BaseNodeModel | 克隆出的新节点的 model 实例 |

**示例**

```ts
// 克隆节点
const nodeModel = lf.cloneNode('node_1');
console.log('新节点ID:', nodeModel.id);

// 克隆并修改位置
const source = lf.getNodeModelById('node_1');
const cloned = lf.cloneNode('node_1');
if (source && cloned) {
  // 将克隆的节点放在原节点右侧100px处
  cloned.x = source.x + 100;
  cloned.y = source.y;
}
```

**注意事项**

- 克隆的节点会生成新的唯一 ID
- 会复制节点的所有属性,包括自定义属性
- 不会克隆与节点相连的边
- 如果原节点不存在会抛出警告

**版本**

1.0.0+

### changeNodeId

修改节点的 ID。如果不传入新 ID,会自动生成一个唯一 ID。

**参数**

| 名称  | 类型   | 必传 | 默认值   | 描述        |
| :---- | :----- | :--- | :------- | :---------- |
| oldId | string | ✅    | -        | 当前节点 ID |
| newId | string | -    | 自动生成 | 新的节点 ID |

**示例**

```ts
// 指定新 ID
lf.changeNodeId('node_1', 'new_node_1');

// 自动生成新 ID
lf.changeNodeId('node_1');
```

**注意事项**

- 会同步更新与该节点相连的边的 sourceNodeId 和 targetNodeId
- 新 ID 必须在画布中唯一,否则会抛出错误
- 该操作会触发 node:change:id 事件
- 支持撤销重做

**版本**

1.0.0+

### changeNodeType

修改节点的类型。

**参数**

| 名称   | 类型   | 必传 | 默认值 | 描述         |
| :----- | :----- | :--- | :----- | :----------- |
| nodeId | string | ✅    | -      | 节点 ID      |
| type   | string | ✅    | -      | 新的节点类型 |

**示例**

```ts
// 将矩形节点改为圆形节点
lf.changeNodeType('node_1', 'circle');

// 切换为自定义节点类型
lf.changeNodeType('node_1', 'custom-node');
```

**注意事项**

- 新类型必须是已注册的节点类型
- 会保留节点的位置、尺寸、文本等基础属性
- 不会保留与原类型相关的特殊属性
- 该操作会触发 node:change:type 事件
- 支持撤销重做

**版本**

1.0.0+

### getNodeModelById

获取节点的 model 实例。model 实例包含了节点的所有属性和方法。

**参数**

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | string | ✅    | -      | 节点 ID |

**返回值**

| 类型          | 描述                                             |
| :------------ | :----------------------------------------------- |
| BaseNodeModel | 节点的 model 实例,如果节点不存在则返回 undefined |

**示例**

```ts
// 获取节点 model
const nodeModel = lf.getNodeModelById('node_1');
if (nodeModel) {
  console.log('节点类型:', nodeModel.type);
  console.log('节点坐标:', nodeModel.x, nodeModel.y);
  console.log('节点文本:', nodeModel.text);
}

// 修改节点属性
const node = lf.getNodeModelById('node_1');
if (node) {
  node.setProperties({
    status: 'completed'
  });
}
```

**注意事项**

- model 实例包含节点的完整信息
- 可以通过 model 实例修改节点属性
- 对 model 的修改会实时反映到画布上
- 建议先判断返回值是否存在再使用

**版本**

1.0.0+

### getNodeDataById

获取节点的数据。返回的数据格式与 addNode 方法的参数格式一致。

**参数**

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | string | ✅    | -      | 节点 ID |

**返回值**

| 类型       | 描述                                          |
| :--------- | :-------------------------------------------- |
| NodeConfig | 节点的配置数据,如果节点不存在则返回 undefined |

**NodeConfig 类型**

```ts
type NodeConfig = {
  id: string;
  type: string;
  x: number;
  y: number;
  text?: string | TextConfig;
  properties?: Record<string, unknown>;
};
```

**示例**

```ts
// 获取节点数据
const nodeData = lf.getNodeDataById('node_1');
if (nodeData) {
  console.log('节点配置:', nodeData);
}

// 复制节点数据创建新节点
const data = lf.getNodeDataById('node_1');
if (data) {
  // 修改坐标创建新节点
  data.x += 100;
  delete data.id;
  lf.addNode(data);
}
```

**注意事项**

- 返回的是普通的数据对象,不包含方法
- 主要用于获取节点当前的状态数据
- 数据可以直接用于创建新的节点
- 建议先判断返回值是否存在再使用

**版本**

1.0.0+

### getNodeIncomingEdge

获取所有以该节点为终点的边。

**参数**

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | string | ✅    | -      | 节点 ID |

**返回值**

| 类型            | 描述                |
| :-------------- | :------------------ |
| BaseEdgeModel[] | 边的 model 实例数组 |

**示例**

```ts
// 获取入边
const incomingEdges = lf.getNodeIncomingEdge('node_1');
console.log('入边数量:', incomingEdges.length);

// 获取所有上游节点
const incomingEdges = lf.getNodeIncomingEdge('node_1');
const sourceNodes = incomingEdges.map(edge => {
  return lf.getNodeModelById(edge.sourceNodeId);
});
```

**注意事项**

- 返回的是边的 model 实例数组
- 如果节点没有入边,返回空数组
- 可以通过边的 sourceNodeId 获取上游节点
- 主要用于分析节点的入度和上游节点

**版本**

1.0.0+

### getNodeOutgoingEdge

获取所有以该节点为起点的边。

**参数**

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | string | ✅    | -      | 节点 ID |

**返回值**

| 类型            | 描述                |
| :-------------- | :------------------ |
| BaseEdgeModel[] | 边的 model 实例数组 |

**示例**

```ts
// 获取出边
const outgoingEdges = lf.getNodeOutgoingEdge('node_1');
console.log('出边数量:', outgoingEdges.length);

// 获取所有下游节点
const outgoingEdges = lf.getNodeOutgoingEdge('node_1');
const targetNodes = outgoingEdges.map(edge => {
  return lf.getNodeModelById(edge.targetNodeId);
});

// 判断节点是否为终点
const isEndNode = lf.getNodeOutgoingEdge('node_1').length === 0;
```

**注意事项**

- 返回的是边的 model 实例数组
- 如果节点没有出边,返回空数组
- 可以通过边的 targetNodeId 获取下游节点
- 主要用于分析节点的出度和下游节点

**版本**

1.0.0+

### getNodeIncomingNode

获取所有连入该节点的上游节点。

**参数**

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | string | ✅    | -      | 节点 ID |

**返回值**

| 类型            | 描述                  |
| :-------------- | :-------------------- |
| BaseNodeModel[] | 节点的 model 实例数组 |

**示例**

```ts
// 获取上游节点
const incomingNodes = lf.getNodeIncomingNode('node_1');
console.log('上游节点数量:', incomingNodes.length);

// 分析节点的入度
const inDegree = lf.getNodeIncomingNode('node_1').length;

// 判断是否为起始节点
const isStartNode = lf.getNodeIncomingNode('node_1').length === 0;
```

**注意事项**

- 返回的是节点的 model 实例数组
- 如果节点没有上游节点,返回空数组
- 与 getNodeIncomingEdge 相比,直接返回节点而不是边
- 主要用于分析节点的入度和依赖关系

**版本**

1.0.0+

### getNodeOutgoingNode

获取所有该节点连出的下游节点。

**参数**

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| nodeId | string | ✅    | -      | 节点 ID |

**返回值**

| 类型            | 描述                  |
| :-------------- | :-------------------- |
| BaseNodeModel[] | 节点的 model 实例数组 |

**示例**

```ts
// 获取下游节点
const outgoingNodes = lf.getNodeOutgoingNode('node_1');
console.log('下游节点数量:', outgoingNodes.length);

// 递归获取所有下游节点
function getAllDownstreamNodes(nodeId, visited = new Set()) {
  if (visited.has(nodeId)) return [];
  visited.add(nodeId);
  const directNodes = lf.getNodeOutgoingNode(nodeId);
  const allNodes = [...directNodes];
  directNodes.forEach(node => {
    const downstream = getAllDownstreamNodes(node.id, visited);
    allNodes.push(...downstream);
  });
  return allNodes;
}
```

**注意事项**

- 返回的是节点的 model 实例数组
- 如果节点没有下游节点,返回空数组
- 与 getNodeOutgoingEdge 相比,直接返回节点而不是边
- 主要用于分析节点的出度和影响范围
- 可以配合递归实现获取所有下游节点的功能

**版本**

1.0.0+

## Edge 相关

### setDefaultEdgeType

设置边的默认类型, 也就是设置当节点直接由用户手动连接的边类型。

```tsx | pure
setDefaultEdgeType: (type: EdgeType): void => {}
```

| 名称 | 类型   | 必传 | 默认值     | 描述                                                                                                                                              |
| :--- | :----- | :--- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| type | string | ✅    | 'polyline' | 设置边的类型，内置支持的边类型有 line(直线)、polyline(折线)、bezier(贝塞尔曲线)，默认为折线`polyline`，用户可以自定义 type 名切换到用户自定义的边 |

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

| 名称         | 类型            | 必传 | 默认值 | 描述            |
| :----------- | :-------------- | :--- | :----- | :-------------- |
| id           | string          |      | -      | 边的 id         |
| type         | string          |      | -      | 边的类型        |
| sourceNodeId | string          | ✅    | -      | 边起始节点的 id |
| targetNodeId | string          | ✅    | -      | 边终止节点的 id |
| startPoint   | Object          |      | -      | 边起点坐标      |
| endPoint     | Object          |      | -      | 边终端坐标      |
| text         | string\| Object |      | -      | 边文案          |

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

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| edgeId | string | ✅    | -      | 边的 id |

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

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| edgeId | string | ✅    | -      | 节点 id |

示例：

```tsx | pure
lf.getEdgeModelById("id");
```

### getEdgeModels

获取满足条件边的 model。

| 名称       | 类型   | 必传 | 默认值 | 描述     |
| :--------- | :----- | :--- | :----- | :------- |
| edgeFilter | Object | ✅    | -      | 过滤条件 |

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

| 名称 | 类型   | 必传 | 默认值 | 描述    |
| :--- | :----- | :--- | :----- | :------ |
| id   | string |      | -      | 边的 id |

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

| 名称         | 类型   | 必传 | 默认值 | 描述            |
| :----------- | :----- | :--- | :----- | :-------------- |
| sourceNodeId | string |      | -      | 边起始节点的 id |
| targetNodeId | string |      | -      | 边终止节点的 id |

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

| 名称 | 类型   | 必传 | 默认值 | 描述    |
| :--- | :----- | :--- | :----- | :------ |
| id   | string | ✅    |        | 节点 id |

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

| 名称         | 类型   | 必传 | 默认值 | 描述                 |
| :----------- | :----- | :--- | :----- | :------------------- |
| config.type  | string | ✅    | -      | 自定义节点、边的名称 |
| config.model | Model  | ✅    | -      | 节点、边的 model     |
| config.view  | View   | ✅    | -      | 节点、边的 view      |

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

| 参数名   | 类型    | 必传 | 默认值 | 描述                                                |
| :------- | :------ | :--- | :----- | :-------------------------------------------------- |
| id       | string  | ✅    | -      | 节点或者连线 Id                                     |
| multiple | boolean |      | false  | 是否为多选，如果为 true，不会将上一个选中的元素重置 |
| toFront  | boolean |      | true   | 是否将选中的元素置顶，默认为 true                   |

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

| 名称          | 类型    | 必传 | 默认值 | 描述                                                         |
| :------------ | :------ | :--- | :----- | :----------------------------------------------------------- |
| isIgnoreCheck | boolean | ✅    | true   | 是否包括 sourceNode 和 targetNode 没有被选中的边, 默认包括。 |

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

| 名称 | 类型   | 必传 | 默认值 | 描述          |
| :--- | :----- | :--- | :----- | :------------ |
| id   | string | ✅    |        | 节点或者边 id |

示例：

```tsx | pure
lf.deleteElement("node_id");
```

### setElementZIndex

设置元素的 zIndex.

注意：默认堆叠模式下，不建议使用此方法。

参数：

| 名称   | 类型            | 必传 | 默认值 | 描述                                    |
| :----- | :-------------- | :--- | :----- | :-------------------------------------- |
| id     | string          | ✅    | -      | 边或者节点 id                           |
| zIndex | string\| number | ✅    | -      | 可以传数字，也支持传入`top` 和 `bottom` |

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

| 名称              | 类型       | 默认值 | 说明                       |
| ----------------- | ---------- | ------ | -------------------------- |
| leftTopPoint      | PointTuple | 无     | 区域左上方的点             |
| rightBottomPoint  | PointTuple | 无     | 区域右下角的点             |
| rightBottomPoint  | PointTuple | 无     | 区域右下角的点             |
| wholeEdge         | boolean    | 无     | 是否要整个边都在区域内部   |
| wholeNode         | boolean    | 无     | 是否要整个节点都在区域内部 |
| ignoreHideElement | boolean    | 无     | 是否忽略隐藏的节点         |

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

| 名称  | 类型   | 必传 | 默认值 | 描述           |
| :---- | :----- | :--- | :----- | :------------- |
| id    | string | ✅    |        | 节点或者边 id  |
| value | string | ✅    |        | 更新后的文本值 |

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

```