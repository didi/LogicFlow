# LogicFlow实例
## 创建一个实例

每一个流程设计界面，就是一个LogicFlow的实例。为了统一术语，我们后面统一在代码层面将`LogicFlow`的实例写作`lf`。

```html
<style>
  #container {
    width: 1000px;
    height: 500px
  }
</style>
<div id="container"></div>
```

```js
const lf = new LogicFlow({
  container: document.querySelector('#container')
});
```

当创建一个实例的时候，我们需要传递初始化LogicFlow实例的配置项。LogicFlow支持非常丰富的初始化配置项，但是只有LogicFlow画布初始化时挂载的DOM节点`container`参数是必填的。完整的配置项参见 [LogicFlow API](/api/logicFlowApi.html#constructor)。

## LogicFlow的图数据

在LogicFlow里面，我们把流程图看做是由节点和连线组成的图。所以我们采用如下数据结构来表示LogicFlow的图数据。

```js
const graphData = {
  nodes: [
    {
      id: "node_id_1",
      type: "rect",
      x: 100,
      y: 100,
      text: { x: 100, y: 100, value: '节点1' },
      properties: {}
    },
    {
      id: "node_id_2",
      type: "circle",
      x: 200,
      y: 300,
      text: { x: 300, y: 300, value: '节点2' },
      properties: {}
    }
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
      pointsList: [ { x: 100, y: 140 }, { x: 100, y: 200 }, { x: 200, y: 200 }, { x: 200, y: 250 } ],
      properties: {}
    }
  ]
}
```

::: tip 为什么节点文本还要有坐标，直接用节点的坐标不行吗？

`text`是可以直接用字符串，这个时候，如果是节点的文本，我们会自动采用节点坐标作为节点文本坐标，如果是连接文本，我们会基于不同的连线类型计算一个合适的坐标作为节点坐标。

在有些应用场景下，我们文本是可以拖动的，为了保持一致，我们LogicFlow导出的文本数据都会带上坐标。

:::

::: tip 连线startPoint、endPoint数据和pointsList为什么是重复的？
目前，在LogicFlow内部内置了`line`, `polyline`, `bezier`三种基础连线，这三种连线都有`startPoint`、`endPoint`数据。但是其中`line`导出的数据是不会带上`pointsList`。对于`polyline`, `pointsList`表示折线所有的点。对于`bezier`，`pointsList`表示`['起点', '第一个控制点'，'第二个控制点', '终点']`。
:::

::: tip properties是用来做什么的？
properties的LogicFlow保留给具体业务场景使用的数据。

例如：在审批流场景，我们定义某个节点，这个节点通过了，节点为绿色，不通过节点为红色。那么节点的数据描述可以为:
```js
{
  type: 'apply',
  properties: {
    isPass: true
  }
}
```
PS: 对于如何基于properties中的属性控制节点的样式，请查看后面的自定义节点。

:::

::: tip type的含义是什么？

type表示节点或者连线的类型，这里的类型不仅可以是`rect`,`polyline`这种LogicFlow内置的基础类型，也可以是用户基于基础类型自定义的类型。

:::

### 将图数据渲染到画布上

```js
lf.render(graphData)
```
