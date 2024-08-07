---
title: Upgrade from v1.1 to v1.2
order: 1
toc: content
---

### Breaking Changes

- In version 1.2, we have standardized the difference between the methods that can be overridden in custom elements in 'model' and 'view'. If you do not need to change the DOM structure of an element but only modify its style based on the properties in the model, you can override the method provided by the model to get the style. If you need to change the DOM structure of the element, you need to override the method provided by the 'view' to modify the DOM structure. The detailed modification methods are as follows:

  1. The 'getArrowStyle' method in 'view' is deprecated, please use the 'getArrowStyle' method in 'model' instead.

- In version 1.1, LogicFlow provided the feature of automatically expanding the canvas area when dragging nodes or edges to the canvas boundary. However, based on the feedback received, this feature resulted in certain explanation costs. Therefore, in version 1.2, this feature is disabled by default. You can enable it by passing the 'autoExpand' parameter as 'true' when initializing LogicFlow. It is now set as 'false' by default.

- In version 1.2, we have optimized the support for React 18.

## 1.2.10

- Bugfix:
  - Fixed the issue of anchor point misplacement after scaling using scalable nodes. [#807](https://github.com/didi/LogicFlow/issues/807)&[#875](https://github.com/didi/LogicFlow/issues/875)
  - Fixed the issue of the menu being obscured by the canvas boundary in the Menu plugin. [#1019](https://github.com/didi/LogicFlow/issues/1019)
  - Fixed the issue in the Control plugin where an error occurred when removing a control item from the control panel if the corresponding item did not exist.

## 1.2.9

- Bugfix:
  - Fixed the issue of setting `isSilentMode = true` repeatedly, leading to subsequent incorrect settings. [#1180](https://github.com/didi/LogicFlow/issues/1180)
  - Fixed the issue of abnormal background length when text is truncated. [#1151](https://github.com/didi/LogicFlow/issues/1151)
  - Fixed the issue of overlap between connectors and node edges when the aspect ratio of nodes is too large. [#817](https://github.com/didi/LogicFlow/issues/817)
  - Fixed the issue of text not being moved when moving nodes along with their corresponding connectors. [#1194](https://github.com/didi/LogicFlow/pull/1194)
  - Fixed the issue of nested subgroups remaining in the collapsed state when opening the nested grouping. [#1145](https://github.com/didi/LogicFlow/issues/1145)

## 1.2.8

- Bugfix:
  - Fixed an issue where the custom connection's start arrow was not working. [#1167](https://github.com/didi/LogicFlow/issues/1167)
  - Fixed an issue where the connection text could not be moved after adjusting the connection's start and end points and deleting the original node.
  - Fixed an issue where the node:dnd-add event was not throwing the event object. [#1170](https://github.com/didi/LogicFlow/issues/1170)

## 1.2.7

- Bugfix:
  - Fixed an issue with incomplete bezier curve export in snapshots. [#1147](https://github.com/didi/LogicFlow/issues/1147)
  - Fixed an issue with incorrect bpmn XML data. [#1155](https://github.com/didi/LogicFlow/issues/1155)

## 1.2.6

- Bugfix:
  - Fixed an issue where inserting a node on an edge did not trigger the validation rules for both sides of the node. [#1078](https://github.com/didi/LogicFlow/issues/1078)
  - Fixed an issue with incorrect attributes in bpmn XML data. [#1142](https://github.com/didi/LogicFlow/pull/1142)
  - Fixed an issue where picking `undefined` overwrote the default value and caused some problems. [#1153](https://github.com/didi/LogicFlow/issues/1153)

## 1.2.5

- Bugfix:
  - Fixed an issue where the bpmnAdapter partially supported incomplete XML data. [#718](https://github.com/didi/LogicFlow/issues/718)
  - Fixed an issue where inserting a node on an edge did not trigger the validation rules for both sides of the node.
  - Updated compatibility with React 18. [#1089](https://github.com/didi/LogicFlow/issues/1089)
  - Fixed an issue where the collapse button for groups was being hidden. [#1099](https://github.com/didi/LogicFlow/issues/1099)
  - Fixed an issue where a text node was not displayed after its content was completely deleted. [#1067](https://github.com/didi/LogicFlow/issues/1067)
  - Fixed an issue where moving a selected node did not move other selected nodes along with it. [#894](https://github.com/didi/LogicFlow/issues/894)

## 1.2.4

- Bugfix:
  - LogicFlow bpmn plugin now generates XML with `isExecutable` set to false by default. [#571](https://github.com/didi/LogicFlow/issues/571)

## 1.2.3

- bugfix
  - fix: update edge path while move nodes[#1027](https://github.com/didi/LogicFlow/issues/1027)

### 1.2.2

- features
  - Add Custom Line Adjustment Point Style Method ` getAdjustPointShape`
- bugfix
  - fix: remove shape attributes from theme types. [#1052](https://github.com/didi/LogicFlow/issues/1052)
  - fix: virtual models cannot be included in group children. [#1022](https://github.com/didi/LogicFlow/issues/1022)
  - fix: keep the default browser reaction while custom keyboard.[#1046](https://github.com/didi/LogicFlow/issues/1046)

### 1.2.1

- bugfix
  - Fixed the issue where `LogicFlow` plugins were not displayed.

### 1.2.0

- bugfix
  - Fixed compatibility issues of `LogicFlow` in the `React 18` environment.

### 1.2.0-next.5

- bugfix
  - Fixed the issue where it was not possible to delete a selected HTML node for the first time in a React environment.[#1029](https://github.com/didi/LogicFlow/issues/1029),[#933](https://github.com/didi/LogicFlow/issues/933)
  - Fixed the issue where some plugins were not working in development mode under React.StrictMode.

### 1.2.0-next.4

- bugfix
  - Fixed the issue where the position of text on the connections between child nodes within a group would change when moving the group.[#1015](https://github.com/didi/LogicFlow/issues/1015)
  - Fixed the issue where inserting a node on an edge was not easy to perform.[754](https://github.com/didi/LogicFlow/issues/754)
  - Fixed the issue where inserting a node on an edge would cause the start and end nodes to move.[#996](https://github.com/didi/LogicFlow/issues/996)
  - Fixed the issue where nested groups could not be collapsed.[#1007](https://github.com/didi/LogicFlow/issues/1007)

### 1.2.0-next.3

- bugfix
  - Fixed the issue where, after adjusting the nodes connected by an edge, new edges could not be clicked and selected intermittently.[#974](https://github.com/didi/LogicFlow/issues/974)
  - "Fixed the issue where the 'isHovered' property of edges would remain true and not change to false.[#989](https://github.com/didi/LogicFlow/issues/989)
  - When selecting both a group and the nodes within the group at the same time, there may be an issue with incorrect movement distances of the nodes within the group.[#1004](https://github.com/didi/LogicFlow/issues/1004)

### 1.2.0-next.2

- features
  - When omitting the overflow text, mouse over the text and the tip will display the full text. [#984](https://github.com/didi/LogicFlow/issues/984)
  - The element will be selected by default when the right mouse button clicks on the node or edge. [#949](https://github.com/didi/LogicFlow/pull/949)
- bugfix
  - Disable the ability to use the right mouse button for box selection, to fix an issue that could cause multiple checkboxes to exist on the canvas that would not disappear. [#984](https://github.com/didi/LogicFlow/issues/985)
  - Fixed the problem that after `adjustEdgeStartAndEnd` is enabled, the API used for adjusting edges is not the same as the default new edge. [973](https://github.com/didi/LogicFlow/pull/973)、[979](https://github.com/didi/LogicFlow/pull/979)、[968](https://github.com/didi/LogicFlow/pull/968)
  - The parameters of anchor's drop and dragend events are optimized to the event object not nested under the e object. [#969](https://github.com/didi/LogicFlow/pull/969)
  - Fixed the problem that the `CurvedEdge` plugin reported an error in some cases. [#953](https://github.com/didi/LogicFlow/pull/953)
  - The `node:add` event is no longer triggered when a node is added by dragging and dropping. [#916](https://github.com/didi/LogicFlow/pull/916)
  - Fixed the problem of inaccurate `edgeModel.targetAnchorId` after manual connection. [#944](https://github.com/didi/LogicFlow/issues/944)
