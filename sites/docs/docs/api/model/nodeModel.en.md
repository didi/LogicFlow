---
nav: API
title: nodeModel
toc: content
order: 1
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

All nodes in LogicFlow have a nodeModel associated with them. Due to the data-driven view mechanism,
all operations on a node are in fact operations on the model. In most cases, it is not recommended
to assign values to the properties of the nodeModel directly, but rather to call the methods
provided on the model or [graphModel](./graphModel.en.md).

:::error{title=Warning}
Without being familiar with LogicFlow's internal source code, assignment operations on the model's
attributes can cause a lot of problems that are not expected. For example, `x`,`y` represent the
position of a node in a model. If you want to move a node by modifying `x`,`y` directly, the node
will be moved, but the text on the node and the edges connected to the node will not be moved. The
best way to move a node is to call the `moveNode` method on the `graphModel`.
:::

There are many node properties on the nodeModel and we have categorized them due to their different
uses.

## Data Attributes

The data attributes of a node are the data that the LogicFlow diagram data is used to identify the
node. Generally, only the data attributes of a node are saved when the flowchart is saved.

| Name       | Type              | Required or Not | Description                     |
|:-----------|:------------------|:----------------|:--------------------------------|
| id         | string            | ✅               | Node id                         |
| type       | string            | ✅               | Node type                       |
| x          | number            | ✅               | Node center x-axis coordinate   |
| y          | number            | ✅               | Node center y-axis coordinates  |
| text       | TextObject/string |                 | Node Text                       |
| properties | Object            |                 | Node Business Custom Attributes |

**TextObject**

| Name      | Type    | Required | Description                                                                                         |
|:----------|:--------|:---------|:----------------------------------------------------------------------------------------------------|
| value     | string  |          | Text content                                                                                        |
| x         | number  | ✅        | Text center x-axis coordinates                                                                      |
| y         | number  | ✅        | Text center y-axis coordinate                                                                       |
| draggable | boolean | ✅        | Whether the text is allowed to be dragged to reposition, this property is not saved when saving     |
| editable  | boolean | ✅        | Whether the text is allowed to be edited by double-clicking; this property is not saved when saving |

## State attribute

Usually used for customizing the node, based on the state attribute for more granular style display.

| Name         | Type    | Required or not | Description                                    |
|:-------------|:--------|:----------------|:-----------------------------------------------|
| isSelected   | boolean | ✅               | Whether the node is selected                   |
| isHovered    | boolean | ✅               | Whether the node is in hover state             |
| isHitable    | boolean | ✅               | Whether the node is clickable                  | whether the node is draggable |
| draggable    | boolean | ✅               | Is the node draggable                          |
| isShowAnchor | boolean | ✅               | Whether the anchor is displayed                |
| isDragging   | boolean | ✅               | Whether the anchor is dragging                 |
| visible      | boolean | ✅               | Whether the anchor is displayed, `1.1.0` added |

## Shape Attributes

LogicFlow's shape attributes control the primary appearance of the base node. Shape attributes can
be set via `setAttributes` or `initNodeData`.
See [Shape Attributes for Custom Nodes](../../tutorial/basic/node.en.md#2-shape-attributes) for
details
on how to set them.

| Name   | Type              | Required or not | Description                                                                                                                                                 |
|:-------|:------------------|:----------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------|
| width  | number            | ✅               | Width of node                                                                                                                                               |
| height | number            | ✅               | height of the node                                                                                                                                          |
| radius | number            |                 | specific to rectangular nodes, the rounded corners of the node                                                                                              |
| r      | number            |                 | specific to circular nodes, the radius of the circle. For circular nodes, the height and width of the node are automatically calculated based on the radius |
| rx     | number            |                 | radius of horizontal fillet for ellipse nodes and diamond nodes exist. The width of the node is automatically calculated based on the radius                |
| ry     | number            |                 | Ellipse nodes and rhombus nodes exist, the radius of the vertical fillet. The height of the node is automatically calculated based on the radius.           |
| points | [number,number][] |                 | Polygon node specific, polygon vertices. The width and height of the node will be calculated based on the vertices.                                         |

## Other Properties

LogicFlow maintains a number of properties on the `model` that developers can use to get some
information. For example, you can get the `graphModel`, the base `model` type of the node, and so
on.

| Name        | Type                   | Required or Not | Description                                                                                                                                                                                                                                                                                                                                       |
|:------------|:-----------------------|:----------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| graphModel  | GraphModel             | ✅               | model corresponding to the whole canvas, see [graphModelApi](./graphModel.en.md)                                                                                                                                                                                                                                                                    |
| zIndex      | number                 | ✅               | The height of the node on the z-axis. When elements overlap, the one with the highest zIndex is on top, default is 1                                                                                                                                                                                                                              |
| state       | number                 | ✅               | Element state, different state corresponds to the display effect of the element; DEFAULT = 1 is displayed by default; TEXT_EDIT = 2 the element is being edited; ALLOW_CONNECT = 4, the element is allowed to be the target node of the current edge; NOT_ALLOW_CONNECT = 5, the element is not allowed to be the target node of the current edge |
| BaseType    | string                 | ✅               | The base type of the current model, fixed to `node` for nodes. This is mainly used to identify whether the `model` is a node or an edge when nodes and edges are mixed.                                                                                                                                                                           |
| modelType   | string                 | ✅               | The type of the current model, it can take values like `node`, `rect-node`, `circle-node`, `polygon-node`, `ellipse-node`, `diamond-node`, `html-node`, `text-node`.                                                                                                                                                                              |
| moveRules   | `Model.NodeMoveRule[]` |                 | Checksum rules before a node is moved.                                                                                                                                                                                                                                                                                                            |
| sourceRules | `Model.ConnectRule[]`  |                 | Checksum rules when a node is connected to another node.                                                                                                                                                                                                                                                                                          |
| targetRules | `Model.ConnectRule[]`  |                 | Checksum rules when a node is connected to another node.                                                                                                                                                                                                                                                                                          |
| autoToFront | boolean                | ✅               | Controls whether a node is automatically topped when it is selected, defaults to true.                                                                                                                                                                                                                                                            |
| incoming    | object                 | ✅               | Enter all edges and nodes of the current node, `v1.1.4`                                                                                                                                                                                                                                                                                           |
| outgoing    | object                 | ✅               | All edges and nodes leaving the current node, `v1.1.4`                                                                                                                                                                                                                                                                                            |
| virtual     | boolean                | -               | Whether the node is a virtual node, default false. When true the exported data will not contain this element. `v1.1.24`                                                                                                                                                                                                                           |

:::info{title=What is the difference between modelType and type?}
When customizing a node, `type` can be any value customized by the developer, but inside LogicFlow,
when it comes to the calculation of this node, we need to sense the exact shape of the node, and
this time we can't use `type`, instead we have to use `modelType` to determine it.
:::

## Style attributes

All LogicFlow nodes are eventually rendered as SVG DOM. However, except for the shape
attribute, all other attributes belonging to svg are not directly present in `nodeModel`. When
developers want to add
more <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute" target="blank">svg attributes</a> to the SVG DOM,
they can do so by overriding the GetNodeStyleProperty method on `nodeModel`.

## method

### getNodeStyle

Support for rewriting, custom node style attributes，which defaults
to [theme baseNode](../theme.en.md#basenode)

```tsx | pure
class UserTaskModel extends RectNodeModel {
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = "blue";
    style.strokeDasharray = "3 3";
    return style;
  }
}
```

### getTextStyle

Overrides are supported to customize the node text style attribute, which defaults
to [theme nodeText](../theme.en.md#nodetext)

```tsx | pure
class UserTaskModel extends RectNodeModel {
  getTextStyle() {
    const style = super.getTextStyle();
    style.fontSize = 16;
    return style;
  }
}
```

### getAnchorStyle

Overrides are supported to customize the node anchor style attribute, which defaults
to [theme anchor](../theme.en.md#anchor)

```tsx | pure
class UserTaskModel extends RectNodeModel {
  getAnchorStyle(anchorInfo) {
    const style = super.getAnchorStyle(anchorInfo);
    style.stroke = "rgb(24, 125, 255)";
    style.r = 3;
    style.hover.r = 8;
    style.hover.fill = "rgb(24, 125, 255)";
    style.hover.stroke = "rgb(24, 125, 255)";
    return style;
  }
}
```

### getAnchorLineStyle

Supports overrides to customize the style attribute of the node anchor point dragout connection
line, defaults to [theme anchorline](../theme.en.md#anchorline)

```tsx | pure
class UserTaskModel extends RectNodeModel {
  getAnchorLineStyle(anchorInfo) {
    const style = super.getAnchorLineStyle();
    style.stroke = "rgb(24, 125, 255)";
    return style;
  }
}
```

### getOutlineStyle

Overrides are supported to customize the style attribute of the node outline box, which defaults
to [theme outline](../theme.en.md#outline)

```tsx | pure
class UserTaskModel extends RectNodeModel {
  getOutlineStyle() {
    const style = super.getOutlineStyle();
    style.stroke = "red";
    style.hover.stroke = "red";
    return style;
  }
}
```

### initNodeData

Support override to initialize node data and convert incoming graph data (data) to node attributes,
so you need to call `super.initNodeData` to trigger the conversion method.

- Process the graph data before `super.initNodeData`.
- After `super.initNodeData`, initialize the node attributes.

```tsx | pure
class UserTaskModel extends RectResize.model {
  initNodeData(data) {
    // 可以在super之前，强制设置节点文本位置不居中，而且在节点下面
    if (!data.text || typeof data.text === "string") {
      data.text = {
        value: data.text || "",
        x: data.x,
        y: data.y + 40,
      };
    }
    super.initNodeData(data);
    this.width = 100;
    this.height = 80;
  }
}
```

:::info
Both initNodeData and setAttributes can assign values to attributes of a nodeModel, but the
difference is this:<br>

- `initNodeData` is called only when the node is initialized and is used to initialize the
  properties of the node.
- `setAttributes` is called when properties change, in addition to the initialization call.
  :::

In the above code, for example, `setAttributes` will be triggered when the node is scaled, because
the scaled size in properties will be updated when the node is scaled. If the initial size of the
node is defined in `setAttributes`, the node will not be scaled.

### setAttributes

Setting model shape attributes, triggered every time properties changes.

```tsx | pure
class UserTaskModel extends RectNodeModel {
  setAttributes() {
    const size = this.properties.scale || 1;
    this.width = 100 * size;
    this.height = 80 * size;
  }
}
```

### createId

Overrides are supported to customize the rules for generating node ids.

:::warning{title=Note}

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

### formatText

Parameters `data: LogicFlow.NodeConfig`

```tsx | pure
class UserTaskModel extends RectNodeModel {
  formatText(data: LogicFlow.NodeConfig) {
    console.log('data', data);
    const defaultText = {
      value: '',
      x: data.x,
      y: data.y,
      draggable: false,
      editable: true,
    }
    if (!data.text) {
      data.text = { ...defaultText }
    } else {
      if (typeof data.text === 'string') {
        data.text = {
          ...defaultText,
          value: data.text,
        }
      }
      // ...
    }
  }
}
```

### getData

LogicFlow has a fixed node data format. If you want to add data to the saved data, add it to
properties.

Overriding this method is not supported

```tsx | pure
const nodeModel = lf.getNodeModelById("node_1");
const nodeData = nodeModel.getData();
```

### getProperties

Get node properties

Overriding this method is not supported

```tsx | pure
const nodeModel = lf.getNodeModelById("node_1");
const properties = nodeModel.getProperties();
```

### getDefaultAnchor

To reset the default anchor, you can add a custom attribute such as id to the anchor for validation
of the anchor.

```tsx | pure
class cNode extends RectNodeModel {
  // Define nodes with only left and right anchor points. The anchor position is calculated from the center and width.
  getDefaultAnchor() {
    const { width, height, x, y, id } = this;
    return [
      {
        x: x - width / 2,
        y,
        name: 'left',
        id: `${id}_0`
      },
      {
        x: x + width / 2,
        y,
        name: 'right',
        id: `${id}_1`,
        edgeAddable: false
      },
    ]
  }
}
```

Anchor Attributes

| Name | Type | Required | Description  |
| :---------- | :------ | :------- | :-------------------------------------- |
| x | number | ✅ | Anchor x coordinate |
| y | number | ✅ | Anchor y coordinate |
| id | string | ✅ | Anchor id |
| edgeAddable | boolean | ✅ | Whether to allow this anchor to manually create wires, default is true |

### getConnectedSourceRules

Get the current node as the starting node rule of the edge.

Supports rewriting, and when rewriting, you can customize to add extra rules. If any of the rules is
not satisfied, the linking is forbidden.

```tsx | pure
class EndNodeModel extends CircleNodeModel {
  getConnectedSourceRules(): ConnectRule[] {
    const rules = super.getConnectedSourceRules();
    const geteWayOnlyAsTarget = {
      message: "End nodes can only be connected in, not out!",
      validate: (
        source: BaseNodeModel,
        target: BaseNodeModel,
        sourceAnchor,
        targetAnchor
      ) => {
        let isValid = true;
        if (source) {
          isValid = false;
        }
        return isValid;
      },
    };
    rules.push(geteWayOnlyAsTarget);
    return rules;
  }
}
```

### getConnectedTargetRules

Get the target node rule for the current node as an edge.

Supports rewriting, and when rewriting, you can customize to add extra rules. If any of the rules is
not satisfied, the linking is forbidden.

```tsx | pure
class StartEventModel extends CircleNodeModel {
  getConnectedTargetRules() {
    const rules = super.getConnectedTargetRules();
    const notAsTarget = {
      message: "起始节点不能作为边的终点",
      validate: () => false,
    };
    rules.push(notAsTarget);
    return rules;
  }
}
```

### isAllowMoveNode

Parameters `deltaX: number, deltaY: number`

return `boolean | Model.IsAllowMove`

```tsx | pure
class UserTaskModel extends RectNodeModel {
  isAllowMoveNode(deltaX: number, deltaY: number) {
    let isAllowMoveX = true
    let isAllowMoveY = true
    return {
      x: isAllowMoveX,
      y: isAllowMoveY,
    }
  }
}

```

### isAllowConnectedAsSource

Whether to allow this node to be the source node and the edge to be the target node when connecting
edges.

Parameters
| 名称 | 类型 | 是否必填 | 描述 |
| ------| -------------- | --- | -- |
| target | `BaseNodeModel` | ✅ | target node |
| sourceAnchor | `Model.AnchorConfig` | ✅ | source anchor |
| targetAnchor | `Model.AnchorConfig` | ✅ | target anchor |
| edgeId | `string` | - | Adjust the back id |

return `LogicFlow.ConnectRuleResult`, please refer to <a href="https://github.com/didi/LogicFlow/issues/926#issuecomment-1371823306" target="_blank">issues</a>.

### isAllowConnectedAsTarget

Determine if this node is allowed to be a target node at the time of concatenation.

Parameters
| 名称 | 类型 | 是否必填 | 描述 |
| ------| -------------- | --- | -- |
| source | `BaseNodeModel` | ✅ | source node |
| sourceAnchor | `Model.AnchorConfig` | ✅ | source anchor |
| targetAnchor | `Model.AnchorConfig` | ✅ | target anchor |
| edgeId | `string` | - | Adjust the back id |

return `LogicFlow.ConnectRuleResult`, please refer to <a href="https://github.com/didi/LogicFlow/issues/926#issuecomment-1371823306" target="_blank">issues</a>.

### getRotateControlStyle

```tsx | pure
getRotateControlStyle()
```

### getTargetAnchor

Parameters：`position: LogicFlow.Point`

return: `BaseNodeModel.AnchorInfo`

### anchors

return:  `LogicFlow.Point[]`

```tsx | pure
const { anchors } = node
```

### getAnchorInfo

Parameters：`anchorId?: string`

### updateText

Parameters

| Name  | Type   | Mandatory | Default | Description |
|:------|:-------|:----------|:--------|:------------|
| value | string | true      | None    | Text Value  |

```tsx | pure
const nodeModel = lf.getNodeModelById("node_1");
nodeModel.updateText("hello world");
```

### setZIndex

```tsx | pure
const nodeModel = lf.getNodeModelById("node_1");
nodeModel.setZIndex(999);
```

### setProperties

```tsx | pure
lf.on("node:click", ({ data }) => {
  lf.getNodeModelById(data.id).setProperties({
    disabled: !data.properties.disabled,
    scale: 2,
  });
});
```

### setProperty

Parameters： `key: string, value: unknown`

### deleteProperty

```tsx | pure
lf.on("node:click", ({ data }) => {
  lf.getNodeModelById(data.id).deleteProperty("disabled");
  lf.getNodeModelById(data.id).deleteProperty("scale");
});
```

### moveText

Parameters：`deltaX: number, deltaY: number`

### moveTo

Parameters：`x: number, y: number, isIgnoreRule: boolean = false`

return: `boolean`

```tsx | pure
this.node.moveTo(200, 100)
```

### move

Parameters：`deltaX: number, deltaY: number, isIgnoreRule: boolean = false`

return: `boolean`

```tsx | pure
this.move(0, 24 / 2);
```

### getMoveDistance

Get distance traveled.

Parameters：`deltaX: number, deltaY: number, isIgnoreRule: boolean = false`

return: `Model.VectorType`

### setSelected

Parameters：`isSelected: boolean = true`

```tsx | pure
  this.node.setSelected(true);
```

### setHovered

Parameters：`isHovered: boolean = true`

### setHittable

Parameters：`isHittable: boolean`

### setIsShowAnchor

Set whether to show anchors.

Parameters：`isShowAnchor: boolean = true`

### updateAttributes

Parameters：`attributes: LogicFlow.AttributesType`

### setElementState

Setting Node | Edge model state

Parameters：`state: ElementState, additionStateData?: Model.AdditionStateDataType | undefined`

### setStyle

Parameters：`key: string, value: unknown`

### setStyles

Parameters：`styles: LogicFlow.CommonTheme`

### updateStyles

Parameters：`styles: LogicFlow.CommonTheme`

### setEnableRotate

Parameters：`flag: boolean`
