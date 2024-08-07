---
title: Upgrade from v1.0 to v1.1
order: 2
toc: content
---

### Breaking Changes

- Version 1.1 standardizes plugins and now requires that all plugins must be implemented using class. Then the plugin methods can be called via `lf.extension.[plugin name].[plugin method]`. The original `lf.[plugin method]` is still available and will be deprecated in subsequent versions.
- Updates to the api of `MiniMap` are not compatible with older versions. `MiniMap.show()` -> `lf.extension.miniMap.show()`; `MiniMap.hide()` -> `lf.extension.miniMap.hide()`

### 1.1.30

> Release Date: Unpublished

- features
  - Set the zIndex of the selected element to 9999, instead of always remaining at the top.
  - Added the `isGroup:true` attribute to the default exported data for group nodes.
- bugfix
  - Fixed an issue where polyline continued to adjust after being adjusted to a straight line causing the path of edges to be messed up.
  - Deleting a grouped node would delete the child nodes belonging to the group at the same time.
  - Fixed the problem that the dragged-in nodes are not put into the correct group when grouping nesting. [#803](https://github.com/didi/LogicFlow/issues/803)
  - Fixed the issue that the group is not placed in front of other groups when it is selected. [#820](https://github.com/didi/LogicFlow/issues/820)

### 1.1.29

> Release Date: 2022/09/24

- features

  - Added the plug-in 'CurvedEdge' to provide curved polyline.
  - `getAnchorLineStyle` added parameter `anchorInfo`, for developers to implement different styles of edges for different anchors. [#766](https://github.com/didi/LogicFlow/issues/766)

- bugfix
  - Fixed the problem that the arrow do not appear after the id is changed by changeEdgeId in edge:add event. [#788](https://github.com/didi/LogicFlow/issues/788)

### 1.1.28

> Release Date: 2022/09/17

- features
  - Scaling of nodes was now much smoother.
  - nodeModel added isShowAnchor to control whether to show anchors or not.
  - Added `anchor:dragend` event, this event was triggered when dragging to create an edge was unsuccessful. [#759](https://github.com/didi/LogicFlow/issues/759)
  - Added an API for deleting a specific property of a node or an edge: `lf.deleteProperty(id, key)` and `model.deleteProperty(key)`.
- bugfix
  - Fixed the issue that the node size can still be dragged to set in read-only mode. [#778](https://github.com/didi/LogicFlow/issues/778)
  - Fixed the problem that the node zoom in and out function is poorly experienced after canvas zooming. [#773](https://github.com/didi/LogicFlow/issues/773)

### 1.1.27

> Release Date: 2022/09/13

- features
  - Added the function of custom arrows. [#755](https://github.com/didi/LogicFlow/issues/755)
  - The nodes added by the addNode method would be placed on the grid by default. [#756](https://github.com/didi/LogicFlow/issues/756)
- bugfix
  - Fixed the problem that the group node added to the canvas reports an error. [#757](https://github.com/didi/LogicFlow/issues/757)
  - Fixed the issue that when the custom shortcut key is a letter, it will be triggered by editing text. [#760](https://github.com/didi/LogicFlow/issues/760)
  - Fixed a bug that the click event in HTML nodes does not work on the first click in non-top nodes. [#767](https://github.com/didi/LogicFlow/issues/767)

### 1.1.26

> Release Date: 2022/08/27

- features
  - Added edgeGenerator option to customize the rules for connecting edges [#739](https://github.com/didi/LogicFlow/pull/739) [@oe](https://github.com/oe)
  - Fixed the property initialization order of BaseEdgeModel constructor [#740](https://github.com/didi/LogicFlow/pull/740) [@oe](https://github.com/oe)

### 1.1.25

> Release Date: 2022/08/21

- features
  - The `isAllowAppendIn` method was added to the grouping to control whether nodes were allowed to be added to the grouping.
- bugfix
  - fix [#734](https://github.com/didi/LogicFlow/issues/734): Showed exception when dragging out subNodes of the grouping.
  - fix: Fixed the problem that the nodes inside the subgroup cannot follow the movement when the groups are nested.

### 1.1.24

> Release Date: 2022/08/11

- features
  - `getAreaElement` added parameter `ignoreHideElement` to ignore hidden nodes.
  - `baseNodeModel` and `baseEdgeModel` added parameter `virtual`, the exported graph data will ignore the elements whose `virtual` is `true`.
- bugfix
  - fix [#702](https://github.com/didi/LogicFlow/issues/702): Fixed the bug that the edges of child nodes will be confused when the boxed group nodes are moved.

### 1.1.23

> Release Date: 2022/08/04

- bugfix
  - fix [#719](https://github.com/didi/LogicFlow/pull/665): Fixed the problem that the boundary is automatically expanded and cannot be stopped when autoExpand is true.

### 1.1.22

> Release Date: 2022/07/13

- bugfix
  - fix [#665](https://github.com/didi/LogicFlow/pull/665): Fixed the problem that only the first one can be downloaded when there are multiple flowcharts on the page.
  - fix [#673](https://github.com/didi/LogicFlow/pull/673): Fixed the problem that the mini-map cannot be dragged.

### 1.1.21

> Release Date: 2022/07/02

- features

  - Added the initialization parameter autoExpand to control whether the node automatically expands the canvas when it is dragged near the edge of the canvas.

- bugfix
  - fix: Fixed the problem that the nodes cannot be dragged if the width and height are not passed.
  - fix [#671](https://github.com/didi/LogicFlow/pull/671): Added the es module packaging method, but force the declaration not to use tree shaking.

### 1.1.20

> Release Date: 2022/06/08

- features
  - New highlight mode for node-associated paths [#642](https://github.com/didi/LogicFlow/pull/642) [@MvCraK](https://github.com/MvCraK)
  - Development mode used uncompressed version [#644](https://github.com/didi/LogicFlow/pull/644) [@KeyToLove](https://github.com/KeyToLove)

### 1.1.19

> Release Date: 2022/05/31

- features
  - Added the function of head and tail arrows of custom edges [#638](https://github.com/didi/LogicFlow/pull/638)

### 1.1.18

> Release Date: 2022/05/23

- bugfix
  - Fixed the problem of incorrect dragging effect of minimap.

### 1.1.16

> Release Date: 2022/05/18

- features
  - `anchor:drop` was triggered only when the creation of an edge was successful. Used to distinguish between manually created edges and automatically created edges (`edge:add`).
  - Added api for batch registration `lf.batchRegister`.
- bugfix
  - Fixed the problem that the mini-map is not updated in real time when the canvas is moved. [#610](https://github.com/didi/LogicFlow/issues/610)

### 1.1.15

> Release Date: 2022/05/07

- features
  - Add class `lf-xx-selected` to the edges and nodes when they are selected, for customizing the style when selected.
  - The api of fitView is enhanced to support the control of white space on both sides. [#585](https://github.com/didi/LogicFlow/issues/585)
  - [daxleg](https://github.com/daxlea)Added a default animation effect to the edges [#606](https://github.com/didi/LogicFlow/pull/606)
- bugfix
  - Fixed the problem of not supporting setting padding after setting background color for the text on the edge. [#592](https://github.com/didi/LogicFlow/issues/592)

### 1.1.14

> Release Date: 2022/04/22

- bugfix
  - Keyboard events were triggered when editing nodes or edges text [#587](https://github.com/didi/LogicFlow/issues/587)

### 1.1.13

> Release Date: 2022/04/16

- features

  -  Added `customCssRules` property and `useGlobalRules` property to `snapshot` plugin.

- bugfix
  - Fixed the problem that the nodes are not easily aligned when dragged [#555](https://github.com/didi/LogicFlow/issues/555)

### 1.1.12

> Release Date: 2022/04/13

- features
  - Added API to set whether the element is editable or not. [setElementState](../api/graphModel.en.md#setelementstate)
  - Added API [lf.renderRawData](../api/logicFlowApi#renderrawdata)
- bugfix
  - Fixed the problem that the node could not be moved when the width and height of the canvas was passed to 0
  - Fixed the problem that the edge does not disappear occasionally. [#568](https://github.com/didi/LogicFlow/issues/568)

### 1.1.11

> Release Date: 2022/03/29

- bugfix
  - Fixed the problem that the node text cannot move synchronously when dragging the node [#548](https://github.com/didi/LogicFlow/issues/548)

### 1.1.9

> Release Date: 2022/03/26

- features

  - Optimized the scrolling effect of moving the mouse to the edge of the canvas, and now supports continuous scrolling.
  - Optimized the node dragging effect. When dragging nodes, the mouse position was not the center point of the node, but kept relative position.

- bugfix
  - Fixed the issue that the edges between children nodes inside a group are not hidden when the group is put away.

### 1.1.8

> Release Date: 2022/03/25

- features

  - The [Node resize](../guide/extension/extension-node-resize) plugin supports setting the maximum and minimum values for zooming in and out and adjusting the sensitivity.
  - Added [lf.fitView](../api/logicFlowApi#fitview) method [@lixianyu-icon](https://github.com/lixianyu-icon).
  - When connecting nodes manually, the canvas scrolls automatically when the mouse moves to the edge of the canvas. [#534](https://github.com/didi/LogicFlow/issues/534)
  - Optimized the interaction of moving a node to the edge of the canvas. Moving a node to the edge of the canvas now automatically expands the canvas size.
  - Optimized the interaction of moving nodes. Now if the node is not allowed to move out of the grouping range, the node will appear at the mouse position when the mouse goes back inside the grouping again.

- bugfix
  - Fixed the issue that the `group` plugin reported an error when multiple `group` nodes were collapsed together.
  - Fixed an issue where internal elements prevented event bubbling causing external elements to fail to trigger. [#529](https://github.com/didi/LogicFlow/issues/529)、[#338](https://github.com/didi/LogicFlow/issues/338)。
  - Fixed the problem that when using history to return to the previous step after group collapse, the display was wrong. [#537](https://github.com/didi/LogicFlow/issues/537)

### Below 1.1.8

- features

  - Added `lf.getModelById` and `lf.getDataById`.
  - Added event `graph:rendered`.
  - `nodeModel` added a new property `autoToFront`, which controls whether the node is automatically topped when it is selected, default is true.
  - `nodeModel` and `edgeModel` added the property `visible`, which controls whether the node is displayed or not, default is true.
  - Added parameter `anchorInfo` to the `getAnchorStyle` method of `nodeModel`, for customizing the display of different effects for anchors on a node. `v1.1.3`.
  - Custom anchor points support setting the `edgeAddable` property to control whether an edge can be created manually based on this anchor point.
  - New anchor events `anchor:dragstart` and `anchor:drop` for highlighting connectable nodes when manually connecting. `v1.1.5`.
  - `NodeResize` plugin usage modification: do not set `Rectangle`, `Circle`, `Polygon` scalable globally, and import on-demand.

- bugfix

  - Fixed the problem that after the first export, if you delete the nodes that exist in the distance and export again, the image export will be blank. [#481](https://github.com/didi/LogicFlow/issues/481)
  - Fixed the problem that when the polygon was moving the edge, occasionally the edge could not be moved and an error was reported.
  - Fixed width and height not adapting again with window scaling when width and height are not passed in. [#479](https://github.com/didi/LogicFlow/issues/479)
  - Fixed the problem that there is always one more newline character after a line break. `v1.1.1`. [#488](https://github.com/didi/LogicFlow/issues/488)
  - Fixed the problem that the text is not displayed under some Chinese input. `v1.1.3` [#336](https://github.com/didi/LogicFlow/issues/336)
  - Fixed the problem of not triggering the node check rule when modifying the start and end points of the edge. `v1.1.5` [#514](https://github.com/didi/LogicFlow/issues/514)

- docs
  - Added [Group Plugin](../guide/extension/component-group)
  - Added [Custom Plugin Tutorial](../guide/extension/component-custom)
