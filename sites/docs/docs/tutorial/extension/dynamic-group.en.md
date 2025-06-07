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
   * Whether to restrict the movement range of child nodes
   * When enabled, child nodes can only move within the group bounds
   * and cannot be dragged outside the group.
   * Also limits resizing to not exceed children's floor area
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
   * whether to scale or rotate the nodes within the group
   * Default to false. When set to true, scaling or rotating the group
   * will also transform the child nodes accordingly
   */
  transformWithContainer?: boolean

  /**
   * zIndex of the group element
   */
  zIndex?: number
  /**
   * Whether the group node should automatically bring itself to the front
   * When the group is selected, whether to automatically bring the group
   * and its children to the top layer
   */
  autoToFront?: boolean
  
  /**
   * Validation function for whether nodes can be added to the group
   * Allows customizing which nodes can be added to the group
   */
  isAllowAppendIn?: (nodeData: LogicFlow.NodeData) => boolean
} & IRectNodeProperties
```

### Default Configuration

Group nodes have the following default configuration:

```ts
// Default size for expanded group
const DEFAULT_GROUP_EXPAND_WIDTH = 400
const DEFAULT_GROUP_EXPAND_HEIGHT = 230
// Default size for collapsed group  
const DEFAULT_GROUP_COLLAPSE_WIDTH = 80
const DEFAULT_GROUP_COLLAPSE_HEIGHT = 60
// Default zIndex
const DEFAULT_BOTTOM_Z_INDEX = -10000
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
    collapsible: true,           // Enable collapsing
    isCollapsed: false,          // Initial state is expanded
    width: 420,                  // Width when expanded
    height: 250,                 // Height when expanded
    collapsedWidth: 80,          // Width when collapsed
    collapsedHeight: 60,         // Height when collapsed
    radius: 5,                   // Border radius
    isRestrict: false,           // Don't restrict child node movement
    autoResize: false,           // Don't auto-resize
    transformWithContainer: true, // Transform children with group
    zIndex: -1000,               // Layer index
    autoToFront: true,           // Auto bring to front when selected
  },
}
```

### Complete Configuration Example

Here's a complete example showing various property usage:

```tsx | pure
import LogicFlow from '@logicflow/core'
import { DynamicGroup, dynamicGroup } from '@logicflow/extension'

// Custom group
class CustomGroup extends dynamicGroup.view {}

class CustomGroupModel extends dynamicGroup.model {
  initNodeData(data) {
    super.initNodeData(data)
    
    // Set default properties
    this.properties = {
      ...this.properties,
      collapsible: true,
      autoToFront: true,
      transformWithContainer: false,
    }
  }

  // Custom group styling
  getNodeStyle() {
    const style = super.getNodeStyle()
    style.stroke = '#1890ff'
    style.strokeWidth = 2
    style.fill = 'rgba(24, 144, 255, 0.1)'
    return style
  }

  // Custom drag-over highlight style
  getAddableOutlineStyle() {
    const style = super.getAddableOutlineStyle()
    style.stroke = '#52c41a'
    style.strokeDasharray = '4 4'
    style.strokeWidth = 2
    return style
  }

  // Restrict to only allow specific node types
  isAllowAppendIn(nodeData) {
    return ['rect', 'circle', 'diamond'].includes(nodeData.type)
  }
}

// Register custom group
lf.register({
  type: 'custom-group',
  view: CustomGroup,
  model: CustomGroupModel,
})

// Render data
lf.render({
  nodes: [
    {
      id: 'group_1',
      type: 'custom-group',
      x: 300,
      y: 200,
      text: 'My Group',
      properties: {
        children: ['node_1', 'node_2'],
        collapsible: true,
        width: 400,
        height: 300,
        isRestrict: true,
        autoResize: true,
      },
    },
    {
      id: 'node_1',
      type: 'rect',
      x: 250,
      y: 150,
      text: 'Node 1',
    },
    {
      id: 'node_2',
      type: 'circle',
      x: 350,
      y: 250,
      text: 'Node 2',
    },
  ],
})
```

## API

### Basic Methods

#### addChild

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

#### removeChild

Removes a child node from the group.

```tsx | pure
const groupModel = lf.getNodeModelById("group_id");
groupModel.removeChild("node_id_1");
```

#### toggleCollapse

Collapses or expands the group. Pass `true` to collapse, `false` to expand, or no parameter to toggle current state.

```tsx | pure
const groupModel = lf.getNodeModelById('group_id');
// Collapse the group
groupModel.toggleCollapse(true);
// Expand the group
groupModel.toggleCollapse(false);
// Toggle current state
groupModel.toggleCollapse();
```

#### getNodesInGroup

Gets all node IDs within the group.

```tsx | pure
const groupModel = lf.getNodeModelById('group_id') as DynamicGroupNodeModel;
const nodeIds = groupModel.getNodesInGroup(groupModel);
console.log('Node IDs in group:', nodeIds);
```

### Validation Methods

#### isAllowAppendIn(nodeData)

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

### Styling Methods

#### getAddableOutlineStyle

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

#### getResizeOutlineStyle

Sets the border style when resizing the group.

```tsx | pure
class MyGroupModel extends dynamicGroup.model {
  getResizeOutlineStyle() {
    const style = super.getResizeOutlineStyle();
    style.stroke = "#1890ff";
    style.strokeWidth = 1;
    return style;
  }
}
```

#### getAnchorStyle

Sets the anchor point style for the group.

```tsx | pure
class MyGroupModel extends dynamicGroup.model {
  getAnchorStyle() {
    const style = super.getAnchorStyle();
    style.stroke = "#1890ff";
    style.fill = "#ffffff";
    return style;
  }
}
```

### Utility Methods

#### setAllowAppendChild

Sets whether the group is in a state that allows adding child nodes.

```tsx | pure
const groupModel = lf.getNodeModelById('group_id') as DynamicGroupNodeModel;
// Enable adding children
groupModel.setAllowAppendChild(true);
// Disable adding children
groupModel.setAllowAppendChild(false);
```

#### toBack

Sends the group node to the back layer.

```tsx | pure
const groupModel = lf.getNodeModelById('group_id') as DynamicGroupNodeModel;
groupModel.toBack();
```

## Plugin Class API

The DynamicGroup plugin class provides some utility methods that you can access through `lf.graphModel.dynamicGroup`:

### getGroupByNodeId

Get the group that a node belongs to by node ID.

```tsx | pure
const nodeGroup = lf.graphModel.dynamicGroup.getGroupByNodeId('node_1');
if (nodeGroup) {
  console.log('Node belongs to group:', nodeGroup.getData());
}
```

### getGroupByBounds

Get the group at the specified position by bounds. When groups overlap, returns the topmost group.

```tsx | pure
const bounds = {
  minX: 100,
  minY: 100,
  maxX: 200,
  maxY: 200
};
const nodeData = { id: 'test', type: 'rect' };
const group = lf.graphModel.dynamicGroup.getGroupByBounds(bounds, nodeData);
if (group) {
  console.log('Area belongs to group:', group.getData());
}
```

### sendNodeToFront

Bring an element to the front. If it's a group, also brings its child elements to the front.

```tsx | pure
const nodeModel = lf.getNodeModelById('group_1');
lf.graphModel.dynamicGroup.sendNodeToFront(nodeModel);
```

## Plugin Events

The DynamicGroup plugin triggers the following events. You can listen to these events to implement custom business logic:

### Group-related Events

| Event Name          | Description                                          | Event Object                                                     |
| :------------------ | :--------------------------------------------------- | :--------------------------------------------------------------- |
| `group:add-node`    | Triggered when a node is added to a group            | `{ data: Group data, childId: ID of newly added node }`          |
| `group:remove-node` | Triggered when a node is removed from a group        | `{ data: Group data, childId: ID of removed node }`              |
| `group:not-allowed` | Triggered when a node is not allowed to join a group | `{ group: Group data, node: Information of the forbidden node }` |

### Event Listening Examples

```tsx | pure
// Listen for node addition to group
lf.on('group:add-node', ({ data, childId }) => {
  console.log(`Node ${childId} has been added to group ${data.id}`)
  
  // Execute custom logic here, such as updating UI state
  updateGroupInfo(data.id, childId, 'add')
})

// Listen for node removal from group
lf.on('group:remove-node', ({ data, childId }) => {
  console.log(`Node ${childId} has been removed from group ${data.id}`)
  
  updateGroupInfo(data.id, childId, 'remove')
})

// Listen for node rejection from group
lf.on('group:not-allowed', ({ group, node }) => {
  console.log(`Node ${node.id} is not allowed to join group ${group.id}`)
  
  // Show notification
  showNotification(`Node type ${node.type} cannot join this group`)
  
  // Delete the rejected node if needed
  // lf.deleteNode(node.id)
})
```

## Advanced Usage

### Restriction Mode (isRestrict)

When restriction mode is enabled, child nodes will be constrained within the group bounds and cannot be dragged outside:

```tsx | pure
const restrictedGroup = {
  type: 'dynamic-group',
  x: 300,
  y: 200,
  properties: {
    isRestrict: true,        // Enable restriction mode
    autoResize: true,        // Enable auto-resize
    width: 400,
    height: 300,
  },
}

// In restriction mode, the group will auto-resize to accommodate all child nodes when they move
```

### Collapse Feature Details

The group's collapse feature automatically handles:

1. **Node Hiding**: Hide all child nodes when collapsed, restore visibility when expanded
2. **Edge Handling**: Automatically create virtual edges to represent connections between group interior and exterior
3. **Size Changes**: Switch between collapsed and expanded dimensions

```tsx | pure
// Listen for group state changes
lf.on('node:properties-change', ({ id, properties, preProperties }) => {
  const node = lf.getNodeModelById(id)
  if (node?.isGroup) {
    const wasCollapsed = preProperties.isCollapsed
    const isCollapsed = properties.isCollapsed
    
    if (wasCollapsed !== isCollapsed) {
      console.log(`Group ${id} state changed: ${isCollapsed ? 'collapsed' : 'expanded'}`)
    }
  }
})
```

### Transform with Container

When `transformWithContainer` is enabled, scaling or rotating the group will also transform child nodes:

```tsx | pure
const transformGroup = {
  type: 'dynamic-group',
  x: 300,
  y: 200,
  properties: {
    transformWithContainer: true,  // Enable synchronized transformation
    width: 400,
    height: 300,
  },
}

// Now when scaling or rotating the group, child nodes will maintain relative positions and transform accordingly
```

:::info{title=How-to-Prevent-Nodes-from-Connecting-to-a-Group?}

Groups are a special type of node, so it is still possible to use [custom connection rules](../advanced/node.en.md#connection-rules) to prevent nodes from connecting directly to groups. However, do not set the number of anchors on a group to 0, as connections are used to represent the relationship between internal and external nodes when the group is collapsed.

:::

## About Swimlanes
:::info{title=About-Swimlanes}

Grouping functionality is not the same as swimlanes; developers need to implement swimlanes based on the grouping functionality. Future LogicFlow support for BPMN will include full BPMN swimlane support. Contributions for implementations are welcome.

:::
