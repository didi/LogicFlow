# 迁移指南

## 从0.x 升级到1.0

### 主题

logicflow采用的新的主题定义方式，支持直接将自定义的所有svg属性透传到节点上，相比原来的主题方式，提供了更完善的自定义配置。
原来的`outlineHover`, `edgeAdjust`等改成新的主题方式，详细使用方式见[todo]()

### 自定义节点

- 我们规范了自定义节点的语义，现在主题相关样式相关的属性获取改成在自定义view中用`getShapteStyle()`方法获取，不再支持在model中使用`setAttribute`设置外观相关的属性。也不支持通过`getAttributes()`获取。现在`getAttributes`用于获取非主题样式相关属性，如`text`、`x`、`y`、`properties`等。详细使用方式见[todo]()

### lf实例API

- `getNodeModel` -> `getNodeModelById`
- `getNodeData` -> `getNodeDataById`
- `getEdge` -> `getEdgeModelById`
- `changeNodeId`在找不到id的时候，返回的是空字符串而不是`false`
- `getEdgeModels`参数不支持传入id, 基于Id获取edgeModel请使用`getEdgeModelById`