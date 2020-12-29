# 数据转换 Adapter

## Logic Flow的数据格式

在 Logic Flow 中一个流程图是有**节点**和**连线**组成的。

- 对于一个节点，我们需要知道这个节点的 **id**、[**类型**](./adapter.html#类型)、**位置**、**文本**、[**properties**](./adapter.html#properties)
- 对于一个连线，我们则需要知道这个连线的 **id**、[**类型**](./adapter.html#类型)、起始节点id（**sourceNodeId**）、目标节点id（**targetNodeId**）、**文本**、[**properties**](./adapter.html#properties)以及连线的起点位置（**startPoint**）,连线的终点位置（**endPoint**）。
  
  - 折线的额外数据`pointsList`，因为折线是可以被用户手动调整的，所以增加此字段用于记录这个折线的具体路径。

### 类型

在 Logic Flow 中，一个节点宽、高、颜色等表示外观的信息都不会保存到数据中，而是统一使用这个节点的类型来表示。例如我们通过 Logic Flow 的自定义机制定义一个节点为“开始节点(startNode)”，那么当前的这个项目中，就应该是知道这个 type 为 startNode 的节点外观是什么样的。

### properties

properties 是 Logic Flow 预留给开发者的一个空对象，开发者可以基于这个属性来绑定任何数据。上面的类型中提到，一个节点具体外观是通过类型来确定。但是当我们需要在项目中，基于某些业务条件，将这个节点外观进行一些调整。这个时候我们可以将这些业务条件放到 properties 中，然后在自定义节点的时候，通过`getAttributes`方法拿到 properties，然后基于 proerties 中的内容重新设置这个节点的样式。

### 使用方法

```js
lf.render({
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 100,
      y: 100,
    },
    {
      id: '2',
      type: 'circle',
      x: 300,
      y: 200,
    }
  ],
  edges: [
    {
      id: 'edge1',
      type: 'polyline',
      sourceNodeId: '1',
      targetNodeId: '2',
      startPoint: { x: 150, y: 100, },
      endPoint: { x: 250, y: 200, },
      pointList: [
        { x: 150, y: 100, },
        { x: 200, y: 100, },
        { x: 200, y: 200, },
        { x: 250, y: 200, },
      ]
    }
  ]
})
```

## 什么是数据转换工具

在某些情况下，可能 Logic Flow 生成的数据格式不是满足业务需要的格式。比如后端也需要的数据格式是 bpmn-js 生成的格式，那么可以使用数据转换工具，将 Logic Flow 生成的数据转换为 bpmn-js 生成的数据。

## 如何自定义数据转换工具

自定义数据转换工具本质上其实是将用户传入的数据，通过一个`lf.adapterIn`方法，将其转换为 Logic Flow 可以识别的格式。然后在生成数据的时候，又通过`lf.adapterOut`方法将 Logic Flow 的数据转换为用户传入的数据。所以自定义数据转换工具我们只需要重新覆盖这两个方法即可。

```js
const lf = new LogicFlow({
  container: document.querySelector('#app')
})
lf.adapterIn = function (userData) {
  // 这里把userData转换为logic Flow支持的格式
  return logicFlowData;
}
lf.adapterOut = function (logicFlowData) {
  // 这里把logic Flow生成的数据转换为用户需要的格式。
  return userData;
}
```

## 使用内置的数据转换工具

Logic Flow 内置通用的 bpmn-js 兼容的转换工具。可以支持将 Logic Flow 上绘制的图在 bpmn-js 上显示，也支持 bpmn-js 上绘制的图在 Logic Flow 上显示。[LogicFlow2Bpmn](/bpmn/index.html)

**bpmnAdapter**

```ts
import { bpmnAdapter } from '@logicflow/extension/bpmnAdapter';

Graph.useAdapter(bpmnAdapter);
```
