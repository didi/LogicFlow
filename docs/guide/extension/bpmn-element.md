# BPMN 元素

> BPMN 是目前较为著名的 workflow 的建模语言标准之一。Logic Flow 实现了 BPMN 扩展，可以直接使用 Logic Flow 来绘制兼容 BPMN2.0 规范的流程，并且其导出的数据可以在 Activiti 流程引擎上运行。

Logic Flow 提供了[自定义节点](../advance/customNode)和[自定义连线](../advance/customEdge), 可以实现满足 BPMN2.0 规范的节点和连线。然后在使用[数据转换](../extension/adapter)将生成的数据转换为 Activiti 需要的格式。

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

## 转换为xml

BpmnAdapter 支持的 bpmnjson 和 Logic Flow data的相互转换，如果希望是转换为xml。可以使用`BpmnXmlAdapter`。

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
## EndEvent
## UserTask
## ServiceTask
## SequenceFlow
## ExclusiveGateway
