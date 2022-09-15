# BPMN 元素

> BPMN 是目前较为著名的 workflow 的建模语言标准之一。LogicFlow 实现了 BPMN 扩展，可以直接使用 LogicFlow 来绘制兼容 BPMN2.0 规范的流程，并且其导出的数据可以在 Activiti 流程引擎上运行。

LogicFlow 提供了[自定义节点](/guide/basic/node.html)和[自定义边](/guide/basic/edge.html), 可以实现满足 BPMN2.0 规范的节点和边。然后在使用[数据转换](../extension/adapter)将生成的数据转换为 Activiti 需要的格式。

::: warning 注意
在实际项目中，我们推荐开发者完成自定义项目的节点，而不是使用我们提供的bpmnElement和bpmnAdapter插件。我们开发LogicFlow的初衷之一就是希望前端能在代码中体现我们所有的业务逻辑，这样让我们研发更贴近工作流的业务。
:::

## 使用方式

```html
<script src="/logic-flow.js"></script>
<script src="/lib/BpmnElement.js"></script>
<script src="/lib/BpmnAdapter.js"></script>
<script>
  LogicFlow.use(BpmnElement);
  LogicFlow.use(BpmnAdapter);
</script>
```

<example href="/examples/#/extension/bpmn-elements" :height="360"></example>

## 转换为 XML

`BpmnAdapter` 支持 bpmnjson 和 LogicFlow data 之间的相互转换，如果希望 LogicFlow data 与 XML 互相转换，可以使用`BpmnXmlAdapter`。

```html
<script src="/logic-flow.js"></script>
<script src="/lib/BpmnElement.js"></script>
<script src="/lib/BpmnXmlAdapter.js"></script>
<script>
  LogicFlow.use(BpmnElement);
  LogicFlow.use(BpmnXmlAdapter);
</script>
```

## StartEvent

```js
const data = {
  nodes: [
    {
      id: 10,
      type: 'bpmn:startEvent',
      x: 200,
      y: 80,
      text: '开始'
    }
  ]
}
```

## EndEvent

```js
const data = {
  nodes: [
    {
      id: 10,
      type: 'bpmn:endEvent',
      x: 200,
      y: 80,
      text: '结束'
    }
  ]
}
```

## UserTask

```js
const data = {
  nodes: [
    {
      id: 10,
      type: 'bpmn:userTask',
      x: 200,
      y: 80,
      text: '用户任务'
    }
  ]
}
```

## ServiceTask

```js
const data = {
  nodes: [
    {
      id: 10,
      type: 'bpmn:serviceTask',
      x: 200,
      y: 80,
      text: '系统任务'
    }
  ]
}
```

## ExclusiveGateway

```js
const data = {
  nodes: [
    {
      id: 10,
      type: 'bpmn:exclusiveGateway',
      x: 200,
      y: 80,
    }
  ]
}
```

完整的 BPMN 案例工具请到[示例](/usage/bpmn.html)中体验。
