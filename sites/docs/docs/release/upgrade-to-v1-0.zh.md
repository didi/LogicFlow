---
title: 0.7 升级到 1.0
order: 2
toc: content
---

### 主题

logicflow 采用的新的主题定义方式，支持直接将自定义的所有 svg 属性透传到节点上，相比原来的主题方式，提供了更完善的自定义配置。
原来的`outlineHover`, `edgeAdjust`等改成新的主题方式，详细使用方式见[主题 API](../api/theme.zh.md)。

### 自定义节点和边

- 我们规范了自定义的方式，现在主题相关样式属性获取改成在自定义`view`中用`model.getNodeStyle()`或者`model.getEdgeStyle()`方法获取，不支持在`view`中通过`getAttributes()`获取。
- 自定义样式相关属性我们要求在`model`中重写获取样式相关的方法。如[getNodeStyle](../api/nodeModel.zh.md#样式属性), [getEdgeStyle](../api/edgeModel.zh.md#样式属性)。
- 自定义 html 节点内置了`shouldUpdate`判断，只有节点的 properties 的发生了变化，才会触发 setHtml 方法。
- 我们明确了属性的分类，对于宽、高这类影响连线计算的属性，我们定义为[形状属性](../api/nodeModel.zh.md#形状属性), 形状属性只允许在`setAttributes`中定义。

### lf 实例 API

- `getNodeModel` -> `getNodeModelById`
- `getNodeData` -> `getNodeDataById`
- `getEdge` -> `getEdgeModelById`
- `changeNodeId`在找不到 id 的时候，返回的是空字符串而不是`false`
- `getEdgeModels`参数不支持传入 id, 基于 Id 获取 edgeModel 请使用`getEdgeModelById`
- `select` -> `selectElementById`
- `eventCenter` -> `graphModel.eventCenter`
- `removeEdge` -> `deleteEdgeByNodeId`

### graphModel

- `getNodeModel.transformMatrix` -> `getNodeModel.transformModel`
- `getNodeModel.setTextEditable()` -> `getNodeModel.editText()`
- `getNodeModel.editConfig` -> `getNodeModel.editConfigModel`
- `graphModel.setElementTextById()` -> `graphModel.updateText()`
- `graphModel.removeEdgeById()` -> `graphModel.deleteEdgeById()`
- `graphModel.removeEdgeBySource()` -> `graphModel.deleteEdgeBySource()`
- `graphModel.removeEdgeByTarget()` -> `graphModel.deleteEdgeByTarget()`
