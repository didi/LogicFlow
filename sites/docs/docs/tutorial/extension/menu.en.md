---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: Menu
order: 1
toc: content
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

When using flowchart tools for editing, users' attention is often focused on the canvas area. Compared to frequently moving the mouse to click the top menu bar or using shortcut keys, right-clicking directly on nodes, edges, or blank areas is more efficient and intuitive. To better match users' operating habits, LogicFlow has built-in right-click menus, making common operations readily accessible and improving the overall editing experience.

## Enable

Import and enable the default menu

```tsx | purex | pure
import LogicFlow from "@logicflow/core";
import { Menu } from "@logicflow/extension";
import "@logicflow/extension/lib/style/index.css";

LogicFlow.use(Menu); // Global import

const lf = new LogicFlow({
  plugins: [Menu], // Local import
})
```

By default, the menu plugin supports node menus, edge menus, and canvas menus, with the following built-in functions:

- Node right-click menu (nodeMenu): Delete, Copy, Edit text
- Edge right-click menu (edgeMenu): Delete, Edit text  
- Canvas right-click menu (graphMenu): None

Of course, supporting only these configuration items is far from enough, so we also support users to customize menu configuration items.

## Menu configuration items

Each function in the menu can be represented by a configuration entry. The specific fields are as follows:

| Fields    | Type             | Role                                          | Required | Description                                                                                                                                                                                                                                                                                                                                                            |
| --------- | ---------------- | --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| text      | string           | Text content                                  |          | Text displayed by the menu item                                                                                                                                                                                                                                                                                                                                        |
| className | string           | Class name                                    |          | The default class for each item is lf-menu-item, set this field and class will add className to the original.                                                                                                                                                                                                                                                          |
| icon      | boolean / string | Whether to create a span placeholder for icon |          | If simple text cannot richly represent the menu, you can add an icon. Set to `true` to create an empty icon container with class `lf-menu-icon`. Set to a string for various icon formats: image file paths (e.g., `./icon.png`), base64 image data (e.g., `data:image/png;base64,...`), CSS class names, or HTML content. Usually used in conjunction with className. |
| disabled  | boolean          | Whether to disable menu item                  |          | When set to true, the menu item will be displayed in gray and cannot be clicked. This state can be dynamically modified using the `changeMenuItemDisableStatus` method.                                                                                                                                                                                                |
| callback  | Function         | Callback executed after clicking              | ✅        | You can get node data/edge data/event information in the three menu callbacks respectively.                                                                                                                                                                                                                                                                            |

Here's an example of writing a node right-click menu delete function:

```tsx | purex | pure
// Define a menu item for node deletion
const menuItem = {
  className: "lf-menu-delete",
  icon: true,
  callback: (node) => {
    // Delete menu and trigger a custom event custom-node:deleted, passing out the current deleted node information
    this.graphModel.deleteNode(node.id);
    this.graphModel.eventCenter.emit("custom-node:deleted", node);
  },
}
```

## Adding Menu Options

You can use the `lf.extension.menu.addMenuConfig` method to add new options to the existing menu. The specific configuration example is as follows:

```tsx | purex | pure
import LogicFlow from "@logicflow/core";
import { Menu } from "@logicflow/extension";

import NodeData = LogicFlow.NodeData;
import EdgeData = LogicFlow.EdgeData;
import Position = LogicFlow.Position;

// Instantiate Logic Flow
const lf = new LogicFlow({
  container: document.getElementById("app"),
  // Register plugins
  plugins: [Menu],
});
// Add options to the menu
// You can also call lf.extension.menu.addMenuConfig to set the menu, both have the same effect
lf.addMenuConfig({
  nodeMenu: [
    {
      text: 'Share',
      callback() {
        alert('Share Success!')
      },
    },
    {
      text: 'Properties',
      callback(node: NodeData) {
        alert(`
              Node ID: ${node.id}
              Node Type: ${node.type}
              Node Position: (x: ${node.x}, y: ${node.y})
            `)
      },
    },
  ],
  edgeMenu: [
    {
      text: 'Properties',
      callback(edge: EdgeData) {
        const {
          id,
          type,
          startPoint,
          endPoint,
          sourceNodeId,
          targetNodeId,
        } = edge
        alert(`
              Edge ID: ${id}
              Edge Type: ${type}
              Start Point: (x: ${startPoint.x}, y: ${startPoint.y})
              End Point: (x: ${endPoint.x}, y: ${endPoint.y})
              Source Node ID: ${sourceNodeId}
              Target Node ID: ${targetNodeId}
            `)
      },
    },
  ],
  graphMenu: [
    {
      text: 'Share',
      callback() {
        alert('Share Success!')
      },
    },
    {
      text: 'Add Node',
      callback(data: Position) {
        lf.addNode({
          type: 'rect',
          x: data.x,
          y: data.y,
        })
      },
    },
  ],
})
lf.render();
```

## Overwriting Menus

If there are unwanted options in the default menu, or it doesn't meet the requirements, you can use `lf.setMenuConfig` to override the default menu and achieve a custom menu effect.

```tsx | purex | pure
lf.setMenuConfig({
  nodeMenu: [
    {
      text: "Delete",
      callback(node) {
        lf.deleteNode(node.id);
      },
    },
  ], // Override the default node right-click menu
  edgeMenu: false, // Remove the default edge right-click menu
  graphMenu: [], // Override the default edge right-click menu, same behavior as false
});
```

## Configuring Menus for Specified Element Types

In addition to overwriting the entire menu above, you can also use `lf.setMenuByType` to set menus for elements of specified types.

```tsx | purex | pure
lf.setMenuByType({
  type: "bpmn:startEvent",
  menu: [
    {
      text: "Share111",
      callback() {
        console.log("Share Success222!");
      },
    },
  ],
});
```

## Dynamic Enable/Disable Menu Items<Badge>New in 2.1.0</Badge>

To provide more flexible interaction, version 2.1.0 adds functionality to dynamically control the disabled state of menu items, allowing you to dynamically disable or enable specific menu items based on business logic.

### API

```tsx | purex | pure
lf.changeMenuItemDisableStatus(menuKey, text, disabled)
```

Parameter description:
- `menuKey`: Menu type, possible values are `'nodeMenu'` | `'edgeMenu'` | `'graphMenu'` | `'selectionMenu'`
- `text`: Text of the menu item to operate on
- `disabled`: Whether to disable, `true` to disable, `false` to enable

### Usage Example

```tsx | purex | pure
// Disable the "Delete" option in node menu
lf.changeMenuItemDisableStatus('nodeMenu', 'Delete', true)

// Enable the "Properties" option in edge menu
lf.changeMenuItemDisableStatus('edgeMenu', 'Properties', false)

// Disable the "Share" option in graph menu
lf.changeMenuItemDisableStatus('graphMenu', 'Share', true)
```

### Setting Disabled State During Configuration

You can also directly set certain menu items to disabled state when configuring the menu:

```tsx | purex | pure
lf.addMenuConfig({
  nodeMenu: [
    {
      text: 'Delete',
      disabled: true, // Initially disabled
      callback(node: NodeData) {
        lf.deleteNode(node.id)
      },
    },
    {
      text: 'Copy',
      disabled: false, // Initially enabled
      callback(node: NodeData) {
        lf.cloneNode(node.id)
      },
    },
  ],
})
```

## Selection Menu

After using the selection plugin, the selection component will also display a menu. By default, the selection menu only has a delete operation.
Like other menu items, you can call the methods provided by the Menu plugin to modify the selection menu configuration.

```tsx | purex | pure
// Example: Set the selection menu to not display
lf.setMenuByType({
  type: "lf:defaultSelectionMenu",
  menu: [],
});
```

## Setting Menus for Custom Nodes

In addition to setting menus for general canvas elements above, LogicFlow also supports setting menus for custom nodes:

```tsx | purex | pure

// index.js
import { RectNode, CustomeModel } from "./custom.ts";
// Register custom node
lf.register({
  type: "custome_node",
  view: RectNode,
  model: CustomeModel,
});
// Set custom node menu
lf.setMenuByType({
  type: "custome_node",
  menu: [
    {
      className: "lf-menu-delete",
      icon: true,
      callback: (node) => {
        this.lf.graphModel.deleteNode(node.id);
        this.lf.graphModel.eventCenter.emit("custom:event", node);
      },
    },
    {
      text: "edit",
      className: "lf-menu-item",
      callback: (node) => {
        this.lf.graphModel.setElementStateById(node.id, 2);
      },
    },
    {
      text: "copy",
      className: "lf-menu-item",
      disabled: false, // Can set disabled state
      callback: (node) => {
        this.lf.graphModel.cloneNode(node.id);
      },
    }
  ],
});

lf.on("custom:event", (node) => {
  console.log(node);
});
```

### Custom Menu Styles

The Menu plugin sets a class for each DOM it displays. Users can override the original style based on the class in the menu structure and set styles that match the host's style.

- Menu: lf-menu
- Menu item: lf-menu-item, user-defined className
- Menu item text: lf-menu-item-text
- Menu item icon: lf-menu-item-icon, need to set the menu item configuration icon to true
- Disabled menu item: lf-menu-item__disabled, this class is automatically added when a menu item is disabled

By setting these classes, you can override the default style, beautify font color, set menu item icons, etc.

## Effect
<a href="https://codesandbox.io/embed/dazzling-hypatia-en8s9?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> Go to CodeSandbox for examples </a>
