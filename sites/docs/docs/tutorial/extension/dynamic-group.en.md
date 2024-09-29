---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: Group
order: 8
toc: content
tag: New
---

LogicFlow supports dynamic grouping. Dynamic grouping is an enhanced version of the built-in Group node (since we’ve added Node Resize functionality and the naming of the Group node wasn’t quite appropriate, we introduced the upgraded DynamicGroup node). We will continue to enhance this plugin, and we welcome contributions from the community.

## Demonstration

<code id="react-portal" src="@/src/tutorial/extension/dynamic-group"></code>

## Using the Plugin

```tsx | pure
import LogicFlow from '@logicflow/core';
import { DynamicGroup } from '@logicflow/extension';
import '@logicflow/extension/es/style/index.css';

const lf = new LogicFlow({
  // ...
  plugins: [DynamicGroup],
});
lf.render({
  nodes: [
    {
      type: 'dynamic-group',
      x: 300,
      y: 300,
    },
  ],
});
```

## Data Format for DynamicGroup Nodes

`dynamic-group` is a special type of node in LogicFlow, so its data format is similar to that of nodes but with an additional `children` property to store the IDs of its child nodes.

```tsx | pure
lf.render({
  nodes: [
    {
      type: "dynamic-group",
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

## Customizing Group Nodes

In practical applications, we recommend that developers customize groups based on their business needs and assign meaningful names to these groups. For example, in BPMN, a subgroup might be named `subProcess`, and then customize the group's appearance accordingly.

```tsx | pure
import { dynamicGroup } from "@logicflow/extension";

class CustomGroup extends dynamicGroup.view {}

class CustomGroupModel extends dynamicGroup.model {
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = "#AEAFAE";
    style.strokeDasharray = "3 3";
    style.strokeWidth = 1;
    return style;
  }
}

lf.register({
  type: "my-custom-group",
  model: CustomGroup,
  view: CustomGroupModel,
});
```

## Properties and Methods of groupModel

In addition to the standard node properties, group nodes have special properties related to grouping. You can control these properties to achieve various grouping effects. For node properties and methods, see [nodeModel](../../api/nodeModel.en.md).

### State Properties
```ts
export type IRectNodeProperties = {
  width?: number
  height?: number
  radius?: number
  style?: LogicFlow.CommonTheme
  textStyle?: LogicFlow.CommonTheme

  [key: string]: unknown
}

export type IGroupNodeProperties = {
  /**
   * IDs of nodes within the group
   */
  children?: string[]
  /**
   * Whether the group node can be collapsed
   */
  collapsible?: boolean
  /**
   * Collapsed state of the group node
   */
  isCollapsed?: boolean
  /**
   * Whether to restrict the movement range of child nodes +
   * Limit resizing to not exceed children's floor area
   * Defaults to false, allowing nodes to be dragged out of the group
   */
  isRestrict?: boolean
  /**
   * When isRestrict mode is enabled and autoResize is true,
   * the parent node will automatically resize when child nodes move within it
   */
  autoResize?: boolean

  // Default width and height for the expanded state of the group
  /**
   * Width and height of the group node when expanded
   */
  width?: number
  height?: number
  
  /**
   * Width and height of the group node when collapsed
   */
  collapsedWidth?: number
  collapsedHeight?: number

  /**
   * When scaling or rotating a container,
   * do you scale or rotate the nodes within the group
   * Default to false, when scaling or rotating the container, 
   * the nodes within the group are scaled or rotated by default
   */
  transformWithContainer?: boolean

  /**
   * zIndex of the group element
   */
  zIndex?: number
  /**
   * Whether the group node should automatically bring itself to the front
   */
  autoToFront?: boolean
} & IRectNodeProperties
```

Group properties can be set similarly to node properties, either in the `groupModel`'s `initNodeData` or `setAttributes` methods. It can also be directly provided in the `properties` during node initialization (recommended).

```ts
const dynamicGroupNodeConfig = {
  id: 'dynamic-group_1',
  type: 'dynamic-group',
  x: 500,
  y: 140,
  text: 'dynamic-group_1',
  resizable: true,
  rotatable: false,
  properties: {
    children: ["rect_3"],
    collapsible: true,
    width: 420,
    height: 250,
    radius: 5,
    isCollapsed: true,
    transformWidthContainer: true,
  },
}
```

## API

### addChild

Adds a node as a child of the group. Note that this method only establishes the relationship and does not automatically move the node into the group.

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

Removes a child node from the group.

```tsx | pure
const groupModel = lf.getNodeModelById("group_id");
groupModel.removeChild("node_id_1");
```

### toggleCollapse

Collapses or expands the group. Pass `true` to collapse the group, or `false` to expand it.

```tsx | pure
const groupModel = lf.getNodeModelById('group_id');
groupModel.toggleCollapse(true);
```

### isAllowAppendIn(nodeData)

Checks whether the specified node can be added to this group. By default, all nodes can be added.

```tsx | pure
class MyGroupModel extends dynamicGroup.model {
  isAllowAppendIn(nodeData) {
    // Only allow nodes of type "custom-rect" to be added to this group
    return nodeData.type === "custom-rect";
  }
}
```

:::info{title=Tip}
If a node is not allowed to be added to a group, it will still be displayed at the user's drop location, but it will not be part of the group. If you want to delete the node, you can listen for the `group:not-allowed` event and manually remove the node.
:::

### getAddableOutlineStyle

Sets the highlight style for the group when dragging a node over it.

```tsx | pure
class MyGroupModel extends dynamicGroup.model {
  getAddableOutlineStyle() {
    const style = super.getAddableOutlineStyle();
    style.stroke = "#AEAFAE";
    style.strokeDasharray = "3 3";
    return style;
  }
}
```

:::info{title=How-to-Prevent-Nodes-from-Connecting-to-a-Group?}

Groups are a special type of node, so it is still possible to use [custom connection rules](../advanced/node.en.md#connection-rules) to prevent nodes from connecting directly to groups. However, do not set the number of anchors on a group to 0, as connections are used to represent the relationship between internal and external nodes when the group is collapsed.

:::

## About Swimlanes
:::info{title=About-Swimlanes}

Grouping functionality is not the same as swimlanes; developers need to implement swimlanes based on the grouping functionality. Future LogicFlow support for BPMN will include full BPMN swimlane support. Contributions for implementations are welcome.

:::
