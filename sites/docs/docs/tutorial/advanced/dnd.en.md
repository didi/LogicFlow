---
nav: Guide
group:
  title: Intermediate
  order: 2
title: Dnd
order: 4
toc: content
---

#### In a flowchart editing scenario rather than creating nodes through code configuration, we may need to manipulate the creation of the flowchart through the graphical user interface, which can be achieved through drag and drop. <Badge>info</Badge>

Drag and drop needs to be combined with a graphical panel, steps: create panel → initialize drag and
drop → listen to drop event to create node

The example is as follows:

```tsx | pure
lf.dnd.startDrag({
  type,
  text: `${type}-node`,
})
```

<a href="https://codesandbox.io/embed/logicflow-base18-odj3g?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> Go to CodeSandbox for examples </a>

As you can see from the code above, the nodes are drawn to the panel by means of `div` tags + `css`
styles, and the `onMouseDown` event is bound to it, and when the graph is dragged and dropped,
the `lf.dnd.startDrag` function is triggered to indicate that dragging and dropping has begun, and
the configuration of the selected graph is passed in, in the format of the `startDrag` entry
parameter:

```tsx | pure
lf.dnd.startDrag = (nodeConfig: NodeConfig): void => {}

type NodeConfig = {
  id?: string; // It is not recommended to pass ids directly, logicflow ids are not allowed to be duplicated.
  type: string;
  text?: TextConfig;
  properties?: Record<string, unknown>;
};
```

When the mouse is released at the end of the drag, the current mouse position is converted to
coordinates on the canvas and used as the center point coordinates of the node `x`, `y`, merged with
the `nodeConfig` passed in by the dragging node, and the `lf.addNode` method is called to create the
node when it listens to the drop event.

:::warning
If you are using an image as an element to add a node in the configuration panel, you need to set it
to be non-draggable. For more details, please refer
to[#267](https://github.com/didi/LogicFlow/issues/267)<br>
If you encounter the error "No node with id xx exists" when you add a node by dragging, you need to
trigger `dnd.startDrag` when mousedown. For more details, please refer
to[#185](https://github.com/didi/LogicFlow/issues/185)
:::

**Use drag and drop panel plugin**

LogicFlow has built-in **Drag & Drop Panel Plugin** in extension, if you don't want to customize the
graphic panel, you can use this plugin to do it quickly.
See [DndPanel](../extension/dnd-panel.en.md) for more details.
