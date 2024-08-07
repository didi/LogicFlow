---
title: Upgrade from v0.7 to v1.0
order: 3
toc: content
---

### Theme

Our new custom theme approach supports passing all custom svg attributes directly to the node. Compared to the original way, it provides better customization capabilities.
The original `outlineHover`, `edgeAdjust`, etc. are changed to the new custom theme method, see [Theme API](../api/theme.en.md) for details.

### Custom nodes and edges

- We standardized the way of customization, now the theme-related style attributes are obtained by `model.getNodeStyle()` or `model.getEdgeStyle()` methods in the custom `view`, and not by `getAttributes()` in the `view`.
- To customize style-related properties, you need to override the method of getting styles in `model`. For example [getNodeStyle](../api/nodeModel.en.md#styleAttributes), [getEdgeStyle](../api/edgeModel.en.md#styleAttributes).
- The custom html node has a built-in `shouldUpdate` method, which triggers the setHtml method only if the properties of the node have changed.
- We clarify the classification of attributes. For attributes like width and height that affect the calculation of the path of an edge, we define them as [shape attributes](../api/nodeModel.en.md#ShapeAttributes), which are only allowed to be defined in `setAttributes`.

### API for Logicflow instances

- `getNodeModel` -> `getNodeModelById`
- `getNodeData` -> `getNodeDataById`
- `getEdge` -> `getEdgeModelById`
- `changeNodeId` returns the empty string instead of `false` when the id is not found
- The parameters of the `getEdgeModels` method do not support id, to get the edgeModel based on id please use `getEdgeModelById`.
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
