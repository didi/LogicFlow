---
nav: API
title: edgeModel
toc: content
order: 2
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>


All edges in LogicFlow will have an edgeModel corresponding to them. Due to the mechanism of Data
Driven View, all our operations on edges are in fact operations on models. In most cases, it is not
recommended to assign values to edgeModel properties directly, but to call the methods provided on
model or [graphModel](./graphModel.en.md)

## Data attributes

The data attributes of an edge is the data of the edge that is included in the LogicFlow flowchart
when it is saved.

| Name         | Type          | Required | Description                                                               |
|:-------------|:--------------|:---------|:--------------------------------------------------------------------------|
| id           | string        | ✅        | Edge id                                                                   |
| type         | string        | ✅        | Edge Type                                                                 |
| sourceNodeId | string        | ✅        | Start Node Id                                                             |
| targetNodeId | string        | ✅        | End Node Id                                                               |
| startPoint   | Point         | ✅        | Start coordinates of the edge                                             |
| endPoint     | Point         | ✅        | End coordinates of the edge                                               |
| text         | Object/string |          | Edge text                                                                 |
| points       | string        |          | Controlling the trajectory of an edge                                     |
| pointsList   | Array         |          | Control edge trajectory, `polyline` and `bezier` have it, `line` does not |
| properties   | Object        |          | Custom properties of the edge                                             |

## Status attributes

Generally used when customizing edges for more fine-grained style display based on status
attributes.

| Name              | Type    | Required | Description                                                          |
|:------------------|:--------|:---------|:---------------------------------------------------------------------|
| isSelected        | boolean | ✅        | Whether the edge is selected or not                                  |
| isHovered         | boolean | ✅        | Whether the edge is in the hover state                               |
| isHitable         | boolean | ✅        | Whether the edge is clickable                                        |
| draggable         | boolean | ✅        | Whether the edge is draggable                                        |
| isDragging        | boolean | ✅        | Whether the edge is dragging                                         |
| isAnimation       | boolean | ✅        | Whether the edge is animated or not                                  |
| isShowAdjustPoint | boolean | ✅        | Whether the edge shows the adjustment points at the ends of the edge |
| visible           | boolean | ✅        | Whether to display edges, new in `1.1.0`                             |

## Shape attributes

When customizing edges, the shape attributes can be set by `setAttributes`.

| Name   | Type   | Required | Description                                                                                                                                                                                                       |
|:-------|:-------|:---------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| offset | number |          | If the line is of type polyline, offset indicates the distance from the turning point of the fold to the node. If the line is of type bezier, offset indicates the length of the control curve adjustment handle. |

## Other attributes

LogicFlow also maintains some properties on `model` that developers can use to get some information.
For example, you can get `graphModel`,  `model` , etc.

| 名称                 | 类型                            | 是否必须 | 描述                                                                                                                                                                                                                                                                                                                                                                          |
|:-------------------|:------------------------------|:-----|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| graphModel         | `GraphModel`                  | ✅    | The model corresponding to the entire canvas. For details, see [graphModelApi](./graphModel.en.md)                                                                                                                                                                                                                                                                            |
| zIndex             | number                        | ✅    | The height of the node on the z-axis. When elements overlap, the higher zIndex is on top, default is 0                                                                                                                                                                                                                                                                      |
| state              | number                        | ✅    | Element state. Different states correspond to the display effect of the element. DEFAULT = 1 means the default display effect; TEXT_EDIT = 2 means the element is being edited; ALLOW_CONNECT = 4, means the element is allowed to be the target node of the current edge; NOT_ALLOW_CONNECT = 5 means the element is not allowed to be the target node of the current edge |
| BaseType           | string                        | ✅    | The base type of the current model, which is fixed to `edge` for edges. It is mainly used to identify whether this `model` is a node or an edge when nodes and edges are mixed.                                                                                                                                                                                             |
| modelType          | string                        | ✅    | The type of the current model, the values are `edge`,`polyline`,`bezier`,`line`                                                                                                                                                                                                                                                                                             |
| sourceAnchorId     | string                        | -    | The id of the anchor point at the start of the edge                                                                                                                                                                                                                                                                                                                         |
| additionStateData  | `Model.AdditionStateDataType` | -    | Additional values passed                                                                                                                                                                                                                                                                                                                                                    |
| targetAnchorId     | string                        | -    | he id of the anchor point at the end of the edge                                                                                                                                                                                                                                                                                                                            |
| customTextPosition | boolean                       | -    | Customize the position of the edge text                                                                                                                                                                                                                                                                                                                                     |
| style              | `LogicFlow.CommonTheme`       | -    | Edge Style                                                                                                                                                                                                                                                                                                                                                                  |
| arrowConfig        | `{markerStart, markerEnd}`    | -    | Arrow Properties                                                                                                                                                                                                                                                                                                                                                            |
| virtual            | boolean                       | -    | Whether it is a virtual node, the default is false. Export data will not include this node when the value is true. `v1.1.24`                                                                                                                                                                                                                                                |

## Style attributes

All edges of LogicFlow are eventually rendered as SVG DOM. But except for the shape attributes, all
other properties belonging to svg do not exist directly in `edgeModel`. When developers want to add
more <a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute" target="_blank">svg attributes</a> to the SVG DOM, they can do so by overriding the method on `edgeModel` that gets the node style attributes.

## getEdgeStyle

Supports overriding this method to customize edge style attributes. Default
is [theme baseEdge](../theme.en.md#baseedge)

```tsx | pure
class SequenceFlowModel extends PolylineModel {
  getEdgeStyle() {
    const style = super.getEdgeStyle();
    style.stroke = "blue";
    style.strokeDasharray = "3 3";
    return style;
  }
}
```

## getAdjustPointStyle

Customize the edge adjustment point style (adjustment points are shown when isShowAdjustPoint is
true)

return: `LogicFlow.CircleTheme`

## getAnimation

Support overriding this method to customize the animation of the edges.

```tsx | pure
class CustomBezierModel extends BezierEdgeModel {
  getAnimation() {
    const animation = super.getAnimation();
    animation.stroke = "blue";
    return animation;
  }
}
```

## getTextStyle

Support overriding this method to customize edge text style attributes, default
is [theme edgeText](../theme.en.md#edgetext)

```tsx | pure
class SequenceFlowModel extends PolylineModel {
  getTextStyle() {
    const style = super.getTextStyle();
    style.color = "blue";
    style.fontSize = "20";
    return style;
  }
}
```

## getEdgeAnimationStyle

Customize side animation styles

return：`LogicFlow.EdgeAnimation`

```tsx | pure
getEdgeAnimationStyle()
{
  const style = super.getEdgeAnimationStyle();
  style.stroke = 'blue';
  style.animationDuration = '30s';
  style.animationDirection = 'reverse';
  return style;
}
```

## getArrowStyle

Customize the side arrow style

```tsx | pure
getArrowStyle()
{
  const style = super.getArrowStyle();
  style.stroke = 'green';
  return style;
}
```

## getOutlineStyle

Customize the style of the rectangular box that displays the range of sides when they are selected.

```tsx | pure
getOutlineStyle()
{
  const style = super.getOutlineStyle();
  style.stroke = 'none';
  style.hover.stroke = 'none';
  return style;
}
```

## initEdgeData

Support overriding this method to initialize the edge data.

```tsx | pure
class UserEdgeModel extends PolylineEdgeModel {
  initEdgeData(data) {
    super.initEdgeData(data);
    this.offset = 20;
  }
}
```

:::info{title=Tip}
Both initNodeData and setAttributes can assign values to the attributes of a edgeModel, but the
difference between the two is that:<br>

- `initNodeData` is called only when the node is initialized and is used to initialize the node's
  properties.
- `setAttributes` is not only called when the node is initialized, but also when properties change.
  :::

## setAttributes

Set the shape attributes of the model, which will be triggered every time the properties change.

```tsx | pure
class UserEdgeModel extends PolylineEdgeModel {
  setAttributes(data: NodeConfig) {
    super.setAttributes(data);
    this.offset = 20;
  }
}
```

## createId

It is supported to override this method to customize the generation rules of node id.

:::warning{title=Tip}

1. Please ensure the uniqueness of the id returned by this method.<br>
2. This method is synchronous, if you want to modify the node id asynchronously, please refer
   to <a href="https://github.com/didi/LogicFlow/issues/272" target="_blank">issues</a>
   :::

```tsx | pure
import { v4 as uuidv4 } from "uuid";

class UserTaskModel extends RectNodeModel {
  createId() {
    return uuidv4();
  }
}
```

## getData

Get the data returned when saved. LogicFlow has a fixed edge data format. If you expect to add more
data to the saved data, please add it to properties.

This method is not allowed to be overridden.

```tsx | pure
const edgeModel = lf.getEdgeModelById("edge_1");
const edgeData = edgeModel.getData();
```

## getHistoryData

Same as `getData`

## getProperties

Get the properties of a node.

This method is not allowed to be overridden.

```tsx | pure
const edgeModel = lf.getEdgeModelById("edge_1");
const properties = edgeModel.getProperties();
```

## setProperties

Set the properties of the edge

```tsx | pure
const edgeModel = lf.getEdgeModelById("edge_1");
edgeModel.setProperties({
  // Customizing properties
});
```

## deleteProperty

Delete a property of a node

```tsx | pure
lf.on("edge:click", ({ data }) => {
  lf.getEdgeModelById(data.id).deleteProperty("disabled");
  lf.getEdgeModelById(data.id).deleteProperty("scale");
});
```

## updateText

Modify the text content of an edge

Parameters

| Name  | Type   | Required | Default | Description |
|:------|:-------|:---------|:--------|:------------|
| value | string | true     | 无       | Text value  |

```tsx | pure
const edgeModel = lf.getEdgeModelById("edge_1");
edgeModel.updateText("hello world");
```

## getTextPosition

Supports rewriting to customize the position of the text on the connecting line.

## getAnchorPosition

Parameters：`sourceNode: BaseNodeModel, targetPosition: LogicFlow.Position`

return：`LogicFlow.Point`

## getBeginAnchor

Parameters：`sourceNode: BaseNodeModel, targetNode: BaseNodeModel`

return：`LogicFlow.Point`

## getEndAnchor

Parameters：`targetNode: BaseNodeModel`

return：`LogicFlow.Point`
