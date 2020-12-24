# 画布 LogicFlow

画布是图的载体，它包含了图上的所有元素（节点、边等），同时挂载了图的相关操作（如交互监听、元素操作、渲染等）。

##  实例化
通过 `new LogicFlow(config: Object)` 进行图的实例化。

```js
const lf = new LogicFlow({
  container: document.querySelector('#graph'),
  width: 700,
  height: 600,
  tool: {
    menu: true,
    control: true,
  },
  background: {
    color: '#F0F0F0'
  },
  grid: {
    type: 'dot',
    size: 20,
  },
});
```

### 配置项
上面代码中实例化 `LogicFlow` 使用了三个必要的配置项：

`container`
- 类型：String。
- 描述：图的 DOM 容器。

`width`、`height`
- 类型：Number。
- 描述：画布的宽度和高度。

完整的配置项参见 [LogicFlow API](/api/logicFlowApi.html)。


## 常用函数

```js
// 获取流程绘图数据
lf.getGraphData()

// 监听事件
lf.on(evt, callback)

// 注册节点或边
lf.register(type, fn)

// 撤销
lf.undo()

// 创建边
lf.createEdge(edgeConfig)

// 移除边
lf.removeEdge(config)

// 创建节点
lf.addNode(nodeConfig)

// 删除节点
lf.deleteNode(nodeId)

// 将指定图形定位到画布中心
lf.focusOn(focusOnArgs)

```
LogicFlow 的完整函数参见 [LogicFlow API](/api/logicFlowApi.html)。
