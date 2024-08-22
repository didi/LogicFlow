---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: Group
order: 15
toc: content
tag: Deprecated
---

LogicFlow supports grouping. Grouping is a custom node built-in in LogicFlow, so developers can
customize more scenarios based on grouping by referring to the custom node.

## Default Grouping

```tsx | pure
import LogicFlow from '@logicflow/core'
import '@logicflow/core/lib/style/index.css'
import { Group } from '@logicflow/extension'
import '@logicflow/extension/lib/style/index.css'

const lf = new LogicFlow({
  // ...
  plugins: [Group],
})
lf.render({
  nodes: [
    {
      type: 'group',
      x: 300,
      y: 300,
    },
  ],
})
```

## Data format of group

A `group` is a special kind of node for LogicFlow, so its data format is still basically the same as
that of a node. However, a `group` node has an additional `children` attribute to store its child
ids.

```tsx | pure
lf.render({
  nodes: [
    {
      type: "group",
      x: 400,
      y: 400,
      children: ["rect_2"],
    },
    {
      id: "rect_2",
      type: "circle",
      x: 400,
      y: 400,
    },
  ],
});
```

## Custom Grouping

In practice, we recommend that, as with custom nodes, developers customize groups based on their own
business, and then give the groups a name that matches their business. For example, for a subgroup
in bpmn, name it `subProcess` and then customize the style of the grouping node.

```tsx | pure
import { GroupNode } from "@logicflow/extension";

class MyGroup extends GroupNode.view {
}

class MyGroupModel extends GroupNode.model {
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = "#AEAFAE";
    style.strokeDasharray = "3 3";
    style.strokeWidth = 1;
    return style;
  }
}

lf.register({
  type: "my-group",
  model: MyGroupModel,
  view: MyGroup,
});
```

## Attributes and methods of groupModel

In addition to the properties of the node itself, there are some special properties of the group. We
can control these properties to achieve various effects of grouping when customizing. The properties
and methods of the node itself are shown in [nodeModel](../../api/nodeModel.en.md)。

### State Properties

| Name         | Type    | Description                                                                                        |
|:-------------|:--------|:---------------------------------------------------------------------------------------------------|
| isRestrict   | boolean | Whether or not to restrict grouped child nodes from being dragged out of the group, default false. |
| resizable    | boolean | Whether the group supports manual resizing, default false.                                         |
| foldable     | boolean | If or not the group displays the expand and collapse buttons, default false.                       |
| width        | number  | Grouping width                                                                                     |
| height       | number  | Grouping height                                                                                    |
| foldedWidth  | number  | Width after grouping and folding                                                                   |
| foldedHeight | number  | Height after folding in groups                                                                     |
| isFolded     | boolean | Read-only, indicates whether the grouping is collapsed or not.                                     |
| isGroup      | boolean | Read-only, always true, used to identify `model` as a `group`.                                     |

Attributes of a group are set in the same way as nodes, either in the `initNodeData`
or `setAttributes` methods of the `groupModel`.

```tsx | pure
class MyGroupModel extends GroupNode.model {
  initNodeData(data) {
    super.initNodeData(data);
    this.isRestrict = true;
    this.resizable = true;
    this.foldable = true;
    this.width = 500;
    this.height = 300;
    this.foldedWidth = 50;
    this.foldedHeight = 50;
  }
}
```

### addChild

Sets a node as a child of the grouping. Note that this method will only add relationships, it will
not automatically move the node inside the grouping.

```tsx | pure
const groupModel = lf.getNodeModelById("group_id");
const node = lf.addNode({
  type: "rect",
  x: groupModel.x,
  y: groupModel.y,
});
groupModel.addChild(node.id);
```

### removeChild

Removes a child node from the grouping.

```tsx | pure
const groupModel = lf.getNodeModelById("group_id");
groupModel.removeChild("node_id_1");
```

### foldGroup

Group up, `true` means group up, false means group down.

```tsx | pure
const groupModel = lf.getNodeModelById("group_id");
groupModel.foldGroup(true);
```

### isAllowAppendIn(nodeData)

Checks if incoming nodes are allowed to be added to this group, by default all nodes are allowed.

```tsx | pure
class MyGroupModel extends GroupNode.model {
  isAllowAppendIn(nodeData) {
    // Set to only allow custom-rect nodes to be added to this group.
    return nodeData.type === "custom-rect";
  }
}
```

:::info
When a node is not allowed to be added to a group, the node will still show up where the user put
it, it's just that the node isn't belong to the group. If you want the added node to be removed,
you can listen to the `group:not-allowed` event and then manually remove the node.
:::

### getAddableOutlineStyle

Sets the alert effect style for group highlighting when dragging a node onto a group.

```tsx | pure
class MyGroupModel extends GroupNode.model {
  getAddableOutlineStyle() {
    const style = super.getAddableOutlineStyle();
    style.stroke = "#AEAFAE";
    style.strokeDasharray = "3 3";
    return style;
  }
}
```

:::info
How to prevent a node from connecting to a grouping?

Grouping is a special kind of node, so it is still possible to disallow nodes and grouping to be
directly connected by [custom connection rule check](../advanced/node.en.md#connection-rules). But
please don't set the number of anchors of the grouping to 0, because when the grouping is collapsed,
the relationship between the nodes inside the grouping and the nodes outside the grouping will be
indicated by the anchors of the grouping being connected to the outside nodes.
:::

## example

<a href="https://codesandbox.io/embed/bold-moore-vgvpf?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> Go to CodeSandbox for examples </a>

:::info
About swimlanes.

The grouping function is not a swim lane and needs to be implemented by developers on the basis of
grouping. LogicFlow will provide full-featured Bpmn support to support BPMN swimlane. You are
welcome to PR us if you have implemented it yourself.
:::
