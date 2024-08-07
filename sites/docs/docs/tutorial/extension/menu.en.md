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

> Menu refers to the right-click menu

## Enable

Introducing components to enable the default menu

```tsx | purex | pure
import LogicFlow from "@logicflow/core";
import { Menu } from "@logicflow/extension";
import "@logicflow/extension/lib/style/index.css";

LogicFlow.use(Menu);
```

The `Menu` component supports menus including node context menus, side context menus, and canvas
context menus. By default, `Menu` has the following functions built into each menu.

- nodeMenu: Delete, Copy, Edit text.
- edgeMenu: delete, edit text.
- Canvas context menu (graphMenu): none

## Menu configuration items

Each function in the menu can be represented by a configuration entry. The specific fields are as
follows.

| Fields    | Type     | Role                                  | Required | Description                                                                                                                                                                                                                                                                                   |
|-----------|----------|---------------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| text      | string   | copywriter                            |          | copywriter for Menu Item Display                                                                                                                                                                                                                                                              |
| className | string   | className                             |          | The default class for each item is lf-menu-item, set this field and class will add className to the original.                                                                                                                                                                                 |
| icon      | boolean  | If or not create a span booth of icon |          | If the simple text can not richly represent the menu, you can add an icon and set it to true, the corresponding menu item will add a span of class lf-menu-icon to enrich the representation of the menu by setting a background for it, which is usually used in conjunction with className. |
| callback  | Function | Callbacks executed after clicking     | ✅        | You can get node data/edge data/event information in the three menu callbacks respectively.                                                                                                                                                                                                   |

The node right-click menu delete function, the example is as follows:

```tsx | purex | pure
const menuItem = {
  text: 'delete',
  callback: (node) => {
    lf.deleteNode(node.id)
  },
}
```

## Adding Menu Options

The `lf.extension.menu.addMenuConfig` method can be used to add new options to the existing menu,
the configuration is shown below:

```tsx | purex | pure
import LogicFlow from "@logicflow/core";
import { Menu } from "@logicflow/extension";

// Instantiating Logic Flow
const lf = new LogicFlow({
  container: document.getElementById("app"),
  // Registered Components
  plugins: [Menu],
});
// Append options to the menu (must be set before lf.render())
// we can use `lf.addMenuConfig` to add menu options as other options
lf.extension.menu.addMenuConfig({
  nodeMenu: [
    {
      text: '分享',
      callback() {
        alert('分享成功！')
      },
    },
    {
      text: '属性',
      callback(node: NodeData) {
        alert(`
              节点id：${node.id}
              节点类型：${node.type}
              节点坐标：(x: ${node.x}, y: ${node.y})
            `)
      },
    },
  ],
  edgeMenu: [
    {
      text: '属性',
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
              边id：${id}
              边类型：${type}
              边起点坐标：(startPoint: [${startPoint.x}, ${startPoint.y}])
              边终点坐标：(endPoint: [${endPoint.x}, ${endPoint.y}])
              源节点id：${sourceNodeId}
              目标节点id：${targetNodeId}
            `)
      },
    },
  ],
  graphMenu: [
    {
      text: '分享',
      callback() {
        alert('分享成功！')
      },
    },
  ],
})
lf.render();
```

## Resetting the menu

If there are unwanted options in the default menu, or it doesn't meet the needs, you can reset the
menu and replace it with a customized menu via `lf.setMenuConfig`.

```tsx | purex | pure
lf.extension.menu.setMenuConfig({
  nodeMenu: [
    {
      text: "删除",
      callback(node) {
        lf.deleteNode(node.id);
      },
    },
  ],
  edgeMenu: false,
  graphMenu: [],
});
```

## Configuring Menus for Specified Types of Elements

In addition to the above customization of generic menus for all nodes, elements, and canvases, menus
can be defined for nodes or edges of a specified type using `lf.setMenuByType`.

```tsx | purex | pure
lf.extension.menu.setMenuByType({
  type: "bpmn:startEvent",
  menu: [
    {
      text: "111",
      callback() {
        console.log("222");
      },
    },
  ],
});
```

## Setting the constituency menu

After using the constituency plugin, the constituency component will also appear as a menu, you can
set the menu item to be empty to realize the effect of not displaying the menu.

```tsx | purex | pure
lf.extension.menu.setMenuByType({
  type: "lf:defaultSelectionMenu",
  menu: [],
});
```

## Setting menus for specific business states

In addition to setting a menu for a certain type of element as above, you can also set a menu for a
node to be in a different business state when customizing the element.

- You can set a custom menu for a node by customizing the node and setting its menu.
- Since you may not be able to get the lf instance object directly from the customized model, you
  can get the graphModel object from `this.graphModel`. Please refer
  to [API/graphModel](../../api/graphModel.en.md) for the detailed description of the graphModel
  object.
- If you still want to do business processing after clicking the menu, you can send a custom event
  via `eventCenter` of `graphModel`, and then listen to this event on `lf` instance by yourself.
- Priority: specify business state setting menu > specify type element configuration menu > generic
  menu configuration > default menu.

```tsx | purex | pure
// customNode.ts
import { RectNode, RectNodeModel } from "@logicflow/core";

class CustomeModel extends RectNodeModel {
  setAttributes() {
    this.stroke = "#1E90FF";
    this.fill = "#F0F8FF";
    this.radius = 10;
    const {
      properties: { isDisabledNode },
    } = this;
    if (!isDisabledNode) {
      // Separate menus for non-disabled elements.
      this.menu = [
        {
          className: "lf-menu-delete",
          icon: true,
          callback: (node) => {
            this.graphModel.deleteNode(node.id);
            this.graphModel.eventCenter.emit("custom:event", node);
          },
        },
        {
          text: "edit",
          className: "lf-menu-item",
          callback: (node) => {
            this.graphModel.setElementStateById(node.id, 2);
          },
        },
        {
          text: "copy",
          className: "lf-menu-item",
          callback: (node) => {
            this.graphModel.cloneNode(node.id);
          },
        },
      ];
    }
  }
}

// index.js
import { RectNode, CustomeModel } from "./custom.ts";

lf.register({
  type: "custome_node",
  view: RectNode,
  model: CustomeModel,
});

lf.on("custom:event", (r) => {
  console.log(r);
});
```

- Set up a customized custom menu for an edge by customizing the edge and setting its menu

```tsx | purex | pure
// custom.ts
import { PolylineEdge, PolylineEdgeModel } from "@logicflow/core";

class CustomModel extends PolylineEdgeModel {
  setAttributes() {
    // context menu
    this.menu = [
      {
        className: "lf-menu-delete",
        icon: true,
        callback(edge) {
          const comfirm = window.confirm("你确定要删除吗？");
          comfirm && this.graphModel.deleteEdgeById(edge.id);
        },
      },
    ];
  }
}

// index.ts
lf.register({
  type: "custome_edge",
  view: PolylineEdge,
  model: CustomeModel,
});
// Set default edge type to custom edge type
lf.setDefaultEdgeType("custome_edge");
```

```stylus
.lf-menu-delete .lf-menu-item-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url("./delete.png") no-repeat;
  background-size: 20px;
}
```

### Menu Styles

Overrides the original style based on the class in the menu structure and sets a style that matches
the host's style.

- Menu: lf-menu
- Menu item: lf-menu-item, user-defined className
- menu-item-text: lf-menu-item-text
- menu-item-icon: lf-menu-item-icon, need to set menu-item-icon to true.
  By setting these classes, you can override the default style, beautify the font color, set the
  menu item icon and so on.

Note that the menu configuration described above must be called before `lf.render()`.

### example

<a href="https://codesandbox.io/embed/dazzling-hypatia-en8s9?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> Go to CodeSandbox for examples </a>
