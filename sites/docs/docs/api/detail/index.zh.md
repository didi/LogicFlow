# LogicFlow API 文档

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

```tsx | pure
lf.redo();
```

**注意事项**

- 需要先判断是否可以重做
- 操作会触发相应的历史记录事件
- 支持撤销重做



## Transform 相关

变换相关的 API 用于控制画布的缩放、平移等变换操作，帮助用户在画布中进行视图导航。

### zoom

放大缩小画布。

**参数**

| 名称     | 类型              | 必传 | 默认值 | 描述                                                                                                       |
| :------- | :---------------- | :--- | :----- | :--------------------------------------------------------------------------------------------------------- |
| zoomSize | boolean \| number | -    | false  | 缩放值，支持传入 0-n 之间的数字。小于 1 表示缩小，大于 1 表示放大。也支持传入 true 和 false 按内置刻度缩放 |
| point    | PointTuple        | -    | -      | 缩放的原点，不传默认为画布中心                                                                             |

**返回值**

| 类型   | 描述               |
| :----- | :----------------- |
| string | 当前缩放比例百分比 |

**示例**

```ts
// 放大
lf.zoom(true);

// 缩小  
lf.zoom(false);

// 缩放到指定比例
lf.zoom(2);

// 以指定点为原点缩放
lf.zoom(2, [100, 100]);
```

**注意事项**

- 缩放值会受到最小和最大缩放比例限制
- 缩放原点默认为画布中心
- 返回值为当前缩放比例的百分比字符串



### resetZoom

重置画布的缩放比例为默认值 1。

**示例**

```ts
// 重置缩放比例
lf.resetZoom();
```

**注意事项**

- 重置后缩放比例变为 1
- 不会影响画布的平移位置
- 该操作会触发相应的变换事件



### setZoomMiniSize

设置画布缩小时能达到的最小倍数。

**参数**

| 名称 | 类型   | 必传 | 默认值 | 描述                          |
| :--- | :----- | :--- | :----- | :---------------------------- |
| size | number | ✅    | 0.2    | 最小缩放倍数，取值范围 0.01-1 |

**示例**

```ts
// 设置最小缩放倍数为 0.3
lf.setZoomMiniSize(0.3);
```

**注意事项**

- 参数值应在 0.01-1 之间
- 设置后缩放操作不能小于此值
- 影响所有缩放相关操作



### setZoomMaxSize

设置画布放大时能达到的最大倍数。

**参数**

| 名称 | 类型   | 必传 | 默认值 | 描述         |
| :--- | :----- | :--- | :----- | :----------- |
| size | number | ✅    | 16     | 最大缩放倍数 |

**示例**

```ts
// 设置最大缩放倍数为 20
lf.setZoomMaxSize(20);
```

**注意事项**

- 建议值不要设置过大，可能影响性能
- 设置后缩放操作不能大于此值
- 影响所有缩放相关操作



### getTransform

获取当前画布的缩放值和偏移值。

**返回值**

```ts
type Transform = {
  SCALE_X: number;    // X轴缩放比例
  SCALE_Y: number;    // Y轴缩放比例  
  TRANSLATE_X: number; // X轴偏移距离
  TRANSLATE_Y: number; // Y轴偏移距离
};
```

**示例**

```ts
// 获取当前变换信息
const transform = lf.getTransform();
console.log('缩放比例:', transform.SCALE_X, transform.SCALE_Y);
console.log('偏移距离:', transform.TRANSLATE_X, transform.TRANSLATE_Y);
```

**注意事项**

- 返回的是当前实时的变换状态
- 可用于保存和恢复画布状态
- X 和 Y 轴的缩放比例通常相等



### translate

平移画布。

**参数**

| 名称 | 类型   | 必传 | 默认值 | 描述         |
| :--- | :----- | :--- | :----- | :----------- |
| x    | number | ✅    | -      | X 轴移动距离 |
| y    | number | ✅    | -      | Y 轴移动距离 |

**示例**

```ts
// 向右下角平移
lf.translate(100, 100);

// 向左上角平移
lf.translate(-50, -50);
```

**注意事项**

- 平移距离是相对于当前位置的偏移量
- 正值表示向右下方向移动
- 平移可能受到画布移动限制的约束



### resetTranslate

将画布恢复到初始位置。

**示例**

```ts
// 恢复到初始位置
lf.resetTranslate();
```

**注意事项**

- 恢复到画布的初始偏移位置（通常为 0, 0）
- 不会影响缩放比例
- 该操作会触发相应的变换事件



### translateCenter

将画布内容居中显示。

**示例**

```ts
// 画布内容居中
lf.translateCenter();
```

**注意事项**

- 会自动计算画布内容的中心点
- 如果画布内容为空，可能无明显效果
- 常用于初始化后的视图调整



### fitView

缩放画布以适应屏幕大小，让所有内容都能在当前视口中显示。

**参数**

| 名称             | 类型   | 必传 | 默认值 | 描述                   |
| :--------------- | :----- | :--- | :----- | :--------------------- |
| verticalOffset   | number | -    | 20     | 距离画布上下边缘的距离 |
| horizontalOffset | number | -    | 20     | 距离画布左右边缘的距离 |

**示例**

```ts
// 使用默认边距适应屏幕
lf.fitView();

// 自定义边距
lf.fitView(50, 30);

// 只设置垂直边距，水平边距自动使用相同值
lf.fitView(40);
```

**注意事项**

- 会同时调整缩放比例和位置
- 如果只传一个参数，水平边距会使用相同值
- 画布内容为空时可能无明显效果
- 适合在数据加载完成后调用



## Edge 动画相关

边动画相关的 API 用于控制连线的动画效果，增强用户交互体验。

### openEdgeAnimation

开启指定边的动画效果。

**参数**

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| edgeId | string | ✅    | -      | 边的 ID |

**示例**

```ts
// 开启边动画
lf.openEdgeAnimation('edge_1');

// 批量开启多个边的动画
['edge_1', 'edge_2'].forEach(edgeId => {
  lf.openEdgeAnimation(edgeId);
});
```

**注意事项**

- 边必须存在，否则操作无效
- 动画样式由主题中的 edgeAnimation 配置决定
- 可以重复调用，不会产生副作用



### closeEdgeAnimation

关闭指定边的动画效果。

**参数**

| 名称   | 类型   | 必传 | 默认值 | 描述    |
| :----- | :----- | :--- | :----- | :------ |
| edgeId | string | ✅    | -      | 边的 ID |

**示例**

```ts
// 关闭边动画
lf.closeEdgeAnimation('edge_1');

// 关闭所有边动画
const graphData = lf.getGraphRawData();
graphData.edges.forEach(edge => {
  lf.closeEdgeAnimation(edge.id);
});
```

**注意事项**

- 边必须存在，否则操作无效
- 关闭动画后边恢复静态样式
- 可以重复调用，不会产生副作用



## Graph 主题相关

### getTheme

获取当前画布的主题配置。

**返回值**

| 类型  | 描述         |
| :---- | :----------- |
| Theme | 当前主题配置 |

**示例**

```ts
// 获取当前主题
const currentTheme = lf.getTheme();
console.log('当前主题配置:', currentTheme);

// 基于当前主题进行修改
const newTheme = {
  ...currentTheme,
  rect: {
    ...currentTheme.rect,
    fill: '#ff0000'
  }
};
lf.setTheme(newTheme);
```

**注意事项**

- 返回的是当前完整的主题配置对象
- 可以用于保存和恢复主题状态
- 建议在修改主题时先获取当前主题



### addThemeMode

注册新的主题模式。

**参数**

| 名称      | 类型                     | 必传 | 默认值 | 描述         |
| :-------- | :----------------------- | :--- | :----- | :----------- |
| themeMode | string                   | ✅    | -      | 主题模式名称 |
| style     | Partial<LogicFlow.Theme> | ✅    | -      | 主题样式配置 |

**示例**

```ts
// 注册自定义主题模式
lf.addThemeMode('custom', {
  rect: {
    fill: '#e6f7ff',
    stroke: '#1890ff',
    strokeWidth: 2,
    radius: 8
  },
  circle: {
    fill: '#fff2e8', 
    stroke: '#fa8c16',
    strokeWidth: 2
  },
  nodeText: {
    color: '#333',
    fontSize: 14
  }
});

// 应用自定义主题
lf.setTheme({}, 'custom');
```

**注意事项**

- 主题模式名称必须唯一，重复注册会覆盖之前的配置
- 样式配置支持部分配置，会与默认主题合并
- 注册后可通过 setTheme 方法的第二个参数使用



## Element 相关补充

### deselectElementById

取消指定元素的选中状态。

**参数**

| 名称 | 类型   | 必传 | 默认值 | 描述    |
| :--- | :----- | :--- | :----- | :------ |
| id   | string | ✅    | -      | 元素 ID |

**示例**

```ts
// 取消选中指定节点
lf.deselectElementById('node_1');

// 取消选中指定边
lf.deselectElementById('edge_1');
```

**注意事项**

- 如果元素不存在或未被选中，操作无效果
- 不会影响其他已选中的元素
- 可以配合 selectElementById 实现精确的选择控制



## 事件系统相关

事件系统相关的 API 用于监听和触发 LogicFlow 的各种事件，实现自定义的交互逻辑。

### on

监听事件。支持监听单个事件或多个事件。

**参数**

| 名称     | 类型          | 必传 | 默认值 | 描述                                 |
| :------- | :------------ | :--- | :----- | :----------------------------------- |
| evt      | string        | ✅    | -      | 事件名称，支持用逗号分隔监听多个事件 |
| callback | EventCallback | ✅    | -      | 事件回调函数                         |

**示例**

```ts
// 监听单个事件
lf.on('node:click', (data) => {
  console.log('节点被点击:', data);
});

// 监听多个事件
lf.on('node:click,edge:click', (data) => {
  console.log('元素被点击:', data);
});

// 监听节点移动事件
lf.on('node:drag', ({ data }) => {
  console.log('节点拖拽中:', data.id, data.x, data.y);
});

// 监听画布点击事件
lf.on('blank:click', ({ e }) => {
  console.log('画布被点击:', e.x, e.y);
});
```

**注意事项**

- 事件名称支持用逗号分隔同时监听多个事件
- 回调函数的参数格式取决于具体的事件类型
- 重复监听同一事件会叠加，都会被执行
- 详细的事件列表请参考[事件文档](../eventCenter.zh.md)



### off

取消事件监听。

**参数**

| 名称     | 类型          | 必传 | 默认值 | 描述                                 |
| :------- | :------------ | :--- | :----- | :----------------------------------- |
| evt      | string        | ✅    | -      | 事件名称，支持用逗号分隔取消多个事件 |
| callback | EventCallback | ✅    | -      | 要取消的事件回调函数                 |

**示例**

```ts
// 定义回调函数
const handleNodeClick = (data) => {
  console.log('节点被点击:', data);
};

// 监听事件
lf.on('node:click', handleNodeClick);

// 取消监听
lf.off('node:click', handleNodeClick);

// 取消多个事件监听
lf.off('node:click,edge:click', handleNodeClick);
```

**注意事项**

- 必须传入监听时使用的同一个回调函数引用
- 如果回调函数引用不匹配，取消操作无效
- 支持同时取消多个事件的监听



### once

监听事件，但只触发一次。触发后自动取消监听。

**参数**

| 名称     | 类型          | 必传 | 默认值 | 描述                                 |
| :------- | :------------ | :--- | :----- | :----------------------------------- |
| evt      | string        | ✅    | -      | 事件名称，支持用逗号分隔监听多个事件 |
| callback | EventCallback | ✅    | -      | 事件回调函数                         |

**示例**

```ts
// 只监听一次节点点击事件
lf.once('node:click', (data) => {
  console.log('首次点击节点:', data);
  // 这个回调只会执行一次
});

// 监听画布首次渲染完成
lf.once('graph:rendered', (data) => {
  console.log('画布渲染完成:', data);
  // 可以在这里执行一些初始化操作
});
```

**注意事项**

- 回调函数执行一次后会自动取消监听
- 适用于只需要响应一次的场景，如初始化操作
- 支持同时监听多个事件，但每个事件都只触发一次



### emit

手动触发事件。

**参数**

| 名称      | 类型      | 必传 | 默认值 | 描述     |
| :-------- | :-------- | :--- | :----- | :------- |
| evt       | string    | ✅    | -      | 事件名称 |
| eventArgs | EventArgs | ✅    | -      | 事件参数 |

**示例**

```ts
// 触发自定义事件
lf.emit('custom:event', {
  type: 'custom:event',
  data: {
    message: 'Hello World'
  }
});

// 监听自定义事件
lf.on('custom:event', (data) => {
  console.log('收到自定义事件:', data);
});

// 触发节点相关事件（谨慎使用）
lf.emit('node:click', {
  type: 'node:click',
  data: lf.getNodeDataById('node_1')
});
```

**注意事项**

- 主要用于触发自定义事件
- 谨慎触发内置事件，可能会影响 LogicFlow 的正常运行
- 事件参数格式需要符合对应事件的规范
- 触发的事件会被所有对应的监听器接收



## 插件系统相关

插件系统相关的 API 用于扩展 LogicFlow 的功能，支持加载和管理插件。

### use

静态方法，用于全局注册插件。注册后的插件会在所有 LogicFlow 实例中生效。

**参数**

| 名称      | 类型                                        | 必传 | 默认值 | 描述                       |
| :-------- | :------------------------------------------ | :--- | :----- | :------------------------- |
| extension | ExtensionConstructor \| ExtensionDefinition | ✅    | -      | 插件构造函数或插件定义对象 |
| props     | Record<string, unknown>                     | -    | -      | 插件属性配置               |

**示例**

```ts
// 注册插件类
class CustomPlugin {
  static pluginName = 'CustomPlugin';
  
  constructor({ lf, LogicFlow, props }) {
    this.lf = lf;
    this.props = props;
  }
  
  render(lf, container) {
    // 插件渲染逻辑
  }
  
  destroy() {
    // 插件销毁逻辑
  }
}

// 全局注册插件
LogicFlow.use(CustomPlugin, {
  option1: 'value1',
  option2: 'value2'
});

// 注册对象形式的插件
LogicFlow.use({
  pluginName: 'SimplePlugin',
  install(lf, LogicFlow) {
    // 插件安装逻辑
    console.log('插件已安装');
  },
  render(lf, container) {
    // 插件渲染逻辑
  }
});
```

**注意事项**

- 这是静态方法，通过 LogicFlow.use() 调用
- 插件必须有 pluginName 属性
- 重复注册同名插件会覆盖之前的插件
- 全局注册的插件会应用到所有 LogicFlow 实例
- 可以通过实例选项中的 disabledPlugins 禁用特定插件



### destroy

销毁 LogicFlow 实例，清理所有资源。

**示例**

```ts
// 创建实例
const lf = new LogicFlow({
  container: document.getElementById('container')
});

// 使用实例
lf.render(graphData);

// 销毁实例
lf.destroy();
```

**注意事项**

- 销毁后实例将不可再使用
- 会清理所有事件监听器、DOM 元素、插件等资源
- 建议在组件卸载或页面离开时调用
- 销毁后需要重新创建实例才能继续使用

