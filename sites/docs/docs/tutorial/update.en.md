---
nav: 指南
group:
  title: 介绍
  order: 0
title: 升级到 2.0 版本
order: 7
toc: content
---
In the `2.0` version, we optimized multiple modules of project infrastructure, core functions, and plug-ins, and fixed a series of problems. There are several main areas that need to be adjusted:
1. The CDN import path needs to be changed:
```html | pure
<!-- Original import path -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/logic-flow.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/style/index.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/Menu.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.css" />

<!-- Current import path -->
<!-- When importing the old version, you need to add the version number after the package name and use the old path -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core@1.2.27/dist/logic-flow.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core@1.2.27/dist/style/index.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension@1.2.27/lib/Menu.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension@1.2.27/lib/style/index.css" />
<!-- If you want to directly import the latest version of 2.0, just copy the following code -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/index.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core/lib/style/index.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/dist/index.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.min.css" />

```
2. The style path of the LogicFlow core package needs to be changed when importing it through the package manager:
```js

// 1.x version import method
import "@logicflow/core/dist/style/index.css";
// How to import version 2.0
import "@logicflow/core/lib/style/index.css";

```

1. The options of each plugin passed in by the pluginOptions parameter need to be separated according to the plugin name
```js
// Here, we take the configuration item showEdge to set whether the minimap displays the connection as an example
// 1.x version
new LogicFlow({
pluginsOptions: {
showEdge, // MiniMap can be displayed normally
},
})
// 2.0 version
new LogicFlow({
pluginsOptions: {
showEdge, // ❌MiniMap cannot be displayed normally
MiniMap: {
showEdge,// ✅MiniMap can be displayed normally
},
},
})
```
Other changes theoretically have no impact on usage. Here is a list of changes:

### Project infrastructure
**Optimization**
1. Supplement the type definitions of all components and methods in the project;
2. preact -> preact/compat in the core package;
3. Remove jest dependencies in dependencies, lodash -> lodash-es
4. Improve README.md and CONTRIBUTING related documents;

### Core

#### Node
**New capabilities**
1. Added `node:resize`, `node:rotate` and `node:properties-change` events

**Optimization**
1. Shape component refactoring, some methods renamed
1. `formateAnchorConnectValidateData` -> `formatAnchorConnectValidateData`;
2. `setHoverON` -> `setHoverOn`;
3. `setHoverOFF` -> `setHoverOff`;
2. Remove the setting of y: y-1 under rectAttr in TextNode getBackground;
3. fakerNode renamed to fakeNode;

4. Node text style supports configuration through `properties.textStylele`

**Bug fix**

1. Solve the problem of abnormal polygon shape and border positioning by setting the origin in points and scaling based on the set width and height;

#### Edge
**New capabilities**

1. Added adjustEdgeStart and adjustEdgeEnd, which can adjust the start point or end point separately;

2. Edge text style supports configuration through `properties.textStylele`;

**Bug fix**

1. Fix the bug that graphModel.edgeType (default edge type) is not used to initialize the edge when the type in edgeConfig is not passed during initialization

#### Grid
**Optimization**

1. The Grid class implements the initialization of grid configuration options by itself

2. Modify the maximum radius calculation logic of the point in the dot grid and add relevant comments

**Bug fix**

1. Correct the problem of offset in the original grid

2. Corrected the type declaration of grid configuration options

#### Graph
**Optimization**
1. Optimized the logic of setting the canvas size during initialization: when adjusting the window, the canvas size can be updated synchronously;
2. "Breaking Change" adjusted pluginOptions to only pass in the options data corresponding to the plugin (previously all data was passed in)

**Bug fixes**
1. Fixed the problem that the canvas cannot scroll when stopMoveGraph:true is set but stopScrollGraph:true is not set;
2. Fixed the bug of the getAreaElement method in GraphModel;

#### Tool
**bigfix**
Fixed the bug that TextEditTool is invalid, and the reason is noted later
- When the TextEditTool component is updated, the original graphModel and LogicFlow props will not trigger the component update. The component update is triggered by passing in textEditElement
- Removed the useless console in the code
- Updated the dependency @babel/plugin-proposal-class-properties -> @babel/plugin-transform-class-properties
- EventArgs related types are changed from unknown Changed to any

### Extension

#### Box selection plug-in
**New capabilities**
1. Add `selection:selected-area` event to return the box selection range;
2. The default enabled state of the box selection plug-in is changed to disabled. If you need to enable the box selection during initialization, call the `lf.extension.selectionSelect.open()` method to enable the box selection after the LogicFlow instance is created;
**Bug fixes**
1. Fix the problem that the page scrolling event is blocked after the box selection is enabled;
2. Fix the problem of calculating the box selection margin and outer border width after zooming;

#### Minimap plug-in
**New capabilities**
1. Support configuration of the minimap display position;
2. Support the selection of whether to render the connection, support setting during initialization or updating the setting through the `setShowEdge` method;
3. Optimize the display content of the minimap. Currently, the canvas element and the viewport position will jointly determine the display content;
4. Optimize the drag interaction experience of the minimap preview;
5. Added the callback event `miniMap:close` for closing the minimap;
**Problem fix**
1. Optimized the update strategy of the minimap when the canvas moves to reduce performance consumption;
2. Fixed the problem that clicking the minimap preview window triggers unexpected canvas movement;
3. Fixed the problem that the minimap preview window cannot be dragged;

#### NodeResize plug-in
**Optimization**
In version 1.x, the node scaling capability needs to be implemented by introducing the NodeResize plug-in. In version 2.0, we built the resize capability into the basic node; and also supported the configurable node rotation capability.
1. Users can set whether all nodes in the current instance are scalable and rotatable through the global configuration items `allowResize` and `allowRotate`;
2. You can also add `resizable` and `rotatable` parameters in the `properties` of the initial rendering incoming data to control whether a single node is rotatable and scalable. Internally, the node's `resizable` and `rotatable` default to `true`;

:::warning{title=Tip}
After the scaling capability is built-in, the NodeResize plug-in will be gradually abandoned
:::

3. Unify the return values ​​of getResizeOutlineStyle fill and stroke in NodeResize;

**Bug fix**
1. Solve the problem of node repositioning after resize ends;
2. Fix the bug that the outlineStyle fill of HtmlREsize node defaults to black;

#### Snapshot plug-in
**Optimization**
1. Optimize the export content of the bpmn plug-in;
2. Support network images in the export node;
3. Improve the snapshot usage, support custom export file name, file type, image width and height, background color, image quality and other attributes;

**Bug fix**
1. Fixed the problem of missing exported content after turning on local rendering;

#### Group plugin
In version 2.0, we rewrote the logic of the group plugin and upgraded the Group plugin to [Dynamic Group plugin](extension/dynamic-group.zh.md)
**New capabilities**
1. Support the synchronous scaling and rotation of group nodes, and the internal elements will also scale and rotate synchronously;

**Optimization**
1. Reduce the range of ResizeControl 30 -> 15, because it will cover the small button of Group folding;

2. Optimize the logic judgment of allowing text dragging -> nodeTextDraggable && draggable can only allow dragging;

#### HighLight plugin
**New capabilities**
1. Support highlight neighbor node mode;
2. Support external parameter configuration of highlight form;

**ptimizations**
1. Supplementary function introduction document [HighLight plugin] (extension/highlight.zh.md)

#### 「New」Label plugin
**New capabilities**
In version 2.0, we added a new text display format: Label. The main differences between this format and the existing Text format are:
1. Supports adding multiple texts to a node/edge, and can set the text direction;
2. Comes with rich text editing capabilities, supports set local text style;
3. Use the new position calculation algorithm to optimize the mobile experience of associated text when adjusting nodes and edges;
Welcome everyone to use it, the function introduction portal: [Label plugin](extension/label.zh.md)

**Optimization**
1. Optimize the assignment priority of text editable configuration items: textEdit (global) > nodeTextEdit/edgeTextEdit (category) > element itself editable;
2. Add the textMode attribute to graphModel to identify the current text mode;
3. Add the method to update textMode in BaseNodeMode, BaseEdgeModel and graphModel; `updateTextMode`;
4. Add listenable events to the text module;

### Engine
**Optimization**
1. Refactor the engine module code and use sandbox.js to solve the performance problem caused by frequent iframe appends
2. @logicflow/engine uses the browser to execute code by default, and the node side also uses @nyariv/sandboxjs to execute code snippets to keep both ends consistent