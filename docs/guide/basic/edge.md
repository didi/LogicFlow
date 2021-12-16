
 # 边 Edge

LogicFlow 的内置连线包括
- 直线(line)
- 直角折线(polyline)
- 贝塞尔曲线(bezier)

LogicFlow在扩展中还提供了更多类型的连线
- 圆角折线(curved-edge)

## 创建边
LogicFlow 支持两种创建边的方式
- 数据配置
- 函数调用

### 通过数据配置创建连接

在图初始化时，通过配置数据创建连接，**前提是已经创建了节点**。
```ts
lf.render({
  nodes: [...],
  edges: [
    {
      type: 'polyline',
      sourceNodeId: 10,
      targetNodeId: 20,
      text: '直角折线',
    }
  ],
});
```

<example :height="500" ></example>

### 通过函数创建连接

在实例化 `LogicFlow` 后，通过调用 `lf.addEdge` 创建边。创建边的参数包括边类型、位置信息、文案信息、自定义属性等。内置边的完整配置参见 [Edge API](/api/edgeApi.html)。

```ts
lf.addEdge({
  type: 'line',
  sourceNodeId: '10',
  targetNodeId: '20',
  text: '直线',
});
```

## 常用方法

```ts
// 创建边
lf.addEdge({
  type: 'polyline',
  sourceNodeId: '30',
  targetNodeId: '40',
  text: '折线'
});

// 获取边数据
lf.getEdgeData(edgeId);

// 修改边数据
lf.setEdgeData({
  id: '1000',
  type: 'polyline',
  sourceNodeId: '30',
  targetNodeId: '40',
  startPoint: {
    id: '300-160'
    x: 300,
    y: 160,
  },
  endPoint: {
    id: '380-100'
    x: 380,
    y: 100,
  },
  pointsList: [
    {
      x: 300,
      y: 160,
    },
    {
      x: 300,
      y: 130,
    },
    {
      x: 380,
      y: 130,
    },
    {
      x: 380,
      y: 100,
    },
  ]
  text: {
    x: 340,
    y: 130,
    value: '折线'
  },
  property: {}
});

// 删除节点A到节点B所有的边
lf.removeEdge({sourceNodeId: nodeAId, targetNodeId: nodeBId,});

// 删除从节点A开始所有的边
lf.removeEdge({sourceNodeId: nodeAId});

// 删除到节点B结束所有的边
lf.removeEdge({targetNodeId: nodeBId});


```

Edge 的完整函数参见 [Edge API](/api/EdgeApi.html)。
