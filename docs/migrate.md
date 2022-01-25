# 迁移指南

## 从0.x 升级到1.0

### 主题

logicflow采用的新的主题定义方式，支持直接将自定义的所有svg属性透传到节点上，相比原来的主题方式，提供了更完善的自定义配置。
原来的`outlineHover`, `edgeAdjust`等改成新的主题方式，详细使用方式见[主题 API](api/themeApi.html)。

### 自定义节点和边

- 我们规范了自定义的方式，现在主题相关样式属性获取改成在自定义`view`中用`model.getNodeStyle()`或者`model.getEdgeStyle()`方法获取，不支持在`view`中通过`getAttributes()`获取。
- 自定义样式相关属性我们要求在`model`中重写获取样式相关的方法。如[getNodeStyle](/api/nodeModelApi.html#样式属性), [getEdgeStyle](/api/edgeModelApi.html#样式属性)。
- 我们明确了属性的分类，对于宽、高这类影响连线计算的属性，我们定义为[形状属性](/api/nodeModelApi.html#形状属性), 形状属性只允许在`setAttributes`中定义。

### lf实例API

- `getNodeModel` -> `getNodeModelById`
- `getNodeData` -> `getNodeDataById`
- `getEdge` -> `getEdgeModelById`
- `changeNodeId`在找不到id的时候，返回的是空字符串而不是`false`
- `getEdgeModels`参数不支持传入id, 基于Id获取edgeModel请使用`getEdgeModelById`
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

## 从1.0 升级到1.1

### 插件写法规范

1.1版本对插件进行了规范，现在要求所有的插件必须使用class的方式实现。然后插件的方法可以通过`lf.extension.插件名称.插件方法`来调用。原来的`lf.插件方法`仍然可用，后续版本将废弃。

### MiniMap插件

- `MiniMap.show()` -> `lf.extension.miniMap.show()`
- `MiniMap.hide()` -> `lf.extension.miniMap.hide()`

### 新增group功能

- 详情见教程-[分组](./guide/extension/component-group.md)

### bugfix

- 修复了[#481](https://github.com/didi/LogicFlow/issues/481)首次导出后，删除远处存在的节点再进行导出，图片导出出现空白
  