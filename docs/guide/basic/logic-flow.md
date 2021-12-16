# LogicFlow

一个 LogicFlow 实例对应一个用户界面的流程图，它包含了图上的所有内容（画布、节点、边等），同时为这些内容提供了相关操作（渲染、元素操作、事件监听等）。

## 实例化

通过 `new LogicFlow(config: Object)` 进行图的实例化。构造函数所接收的配置一般可以分为四类。

- 容器配置
- 画布配置
- 工具配置
- 样式配置

```js
const lf = new LogicFlow({
  // 容器配置
  container: document.querySelector('#graph'),
  // 画布配置
  width: 700,
  height: 600,
  background: {
    color: '#F0F0F0'
  },
  grid: {
    type: 'dot',
    size: 20,
  },
  // 工具配置
  textEdit: true,
  isSilentMode: false,
  edgeType: 'line',
  snapline: true,
  // 样式配置
  style: {
    rect: {
      radius: 6
    }
  }
});
```

完整的配置项参见 [LogicFlow API](/api/logicFlowApi.html#constructor)。

## 常用函数

LogicFlow 所提供的方法一般可以分为三类。

- 图方法
- 节点方法
- 连线方法

### 图方法

```js
// 放大或缩小画布
lf.zoom(isZoomIn)

// 将图形移动到画布中心
lf.focusOn(focusOnArgs)

// 监听事件
lf.on(evt, callback)

// 撤销
lf.undo()

// 获取画布数据
lf.getGraphData()
```

### 节点方法

```js
// 添加节点
lf.addNode(nodeConfig)

// 删除节点
lf.deleteNode(nodeId)

// 克隆节点
lf.cloneNode(nodeId)

// 获取节点的model数据
lf.getNodeModelById(nodeId)

```

### 连线方法

```js
// 创建边
lf.addEdge(edgeConfig)

// 根据连线Id来删除边
lf.deleteEdge(edgeId)

// 根据连线两端节点的Id来删除边
lf.removeEdge(sourceNodeId, targetNodeId)

// 获取边的model数据
lf.getEdgeModels(edgeFilter)

// 获取边的数据属性
lf.getEdgeData(edgeId)

// 设置边的数据属性
lf.setEdgeData(edgeAttribute)
```

LogicFlow 的完整函数参见 [LogicFlow API](/api/logicFlowApi.html)。
