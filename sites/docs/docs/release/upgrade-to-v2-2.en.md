---
title: 2.2.0 Alpha ChangeLog
order:: 3
toc: content
---

## 2.2.0 (alpha), 2.2.0-alpha.0 - 2025.12.02

### Added
1. Mobile adaptation
 - Main change: except for over, enter, and leave events, all other events upgrade MouseEvent to PointerEvent and reuse handlers to ensure smooth migration of most features
 - Effects:
   1. Support node dragging, double-click to edit text, single-click shows outline enabling resize and rotation
   2. Support edge connection, drag to adjust polyline mid-segments and endpoints; Bezier curves are adjustable
   3. Support canvas dragging and pinch-to-zoom (two-finger)
   4. Support dragging the minimap in plugins to move the canvas, lasso selection, long-press node/edge/canvas to show the corresponding menu
   - A demo video

### Bugs
1. Shortcuts only take effect after right-clicking on the canvas

## 2.2.0-alpha.1 - 2025.12.16

### Features
1. Anchor optimization:
 - Support specifying the default anchor that edges connect into
 - Support requiring release near an anchor to create an edge
2. Insert-node-on-edge plugin optimization: when inserting a node on an edge, the target now points to the closest anchor to the insertion position

### Fixed
1. Fixed getSnapshotBlob returning a non-SVG file when passing an SVG
2. Fixed errors when using plugins in Electron environments

## 2.2.0-alpha.2 - 2025.12.16

### Fixed
1. Fixed the issue introduced in 2.2.0-alpha.0: “Shortcuts only take effect after right-clicking on the canvas”

## 2.2.0-alpha.3 - 2025.12.18

### Changed
1. Overall UI polish
  a. Polyline edge optimization:
   - Rounded corners are now built-in; support setting polyline corner radius via properties.radius
   - Distance between the first bend and the node changed from fixed 10 to arrow offset + 5; support setting polyline edge spacing via properties.offset
   <img width="1762" height="1498" alt="Edge optimization effect" src="https://github.com/user-attachments/assets/2b7ce088-af9e-4025-9d2e-330c4922739f" />
  b. Polygon optimization
    - Optimize rounded corner generation logic, aligned with polyline rounded corner rules
    - Style resolution optimization: from merge(theme style, properties custom style) to merge(theme style, style passed in when creating new LogicFlow, properties custom style)
    <img width="1600" height="1200" alt="Polygon optimization" src="https://github.com/user-attachments/assets/26bada96-aca0-4dd2-aac0-dee19576073b" />

  c. vue-node-registry/react-node-registry capability expansion: support title card mode; users can render fixed-structure custom nodes via properties to lower integration cost
   <img width="1122" height="816" alt="Framework node revamp" src="https://github.com/user-attachments/assets/1c78da5c-26ed-4e91-8f3a-7ecab2cb5792" />

  d. Grid enhancements:
    - Added support for configuring vertex boldness
    - Adjusted initialization config sourcing: from fixed default config -> theme’s default grid config
    <img width="1600" height="1200" alt="Grid effect comparison" src="https://github.com/user-attachments/assets/de65add9-2f40-48cb-be04-daf1765e47a1" />

  e. Default theme polish:
    - Merge radius theme configuration (the radius input previously supported by themeMode before 2.2 will be removed in this version) and adjust default colors
    - Add retro theme type to retain pre-2.2 styles for users who need them
    <img width="1600" height="1200" alt="Theme comparison" src="https://github.com/user-attachments/assets/81dbcbc7-ae13-460e-af78-a1e926931a7f" />

  f. Other theme configuration refinements
    - Node outline supports configuring spacing relative to the node
    - HTML supports styling via theme configuration, including shadow settings
    - Multi-select box supports configuring spacing relative to selected elements
    - Added edgeOutline configuration to style edge outlines separately

  g. Plugin optimizations
    - Menus support hiding labels and showing only icons; icons improved
    - For dynamic group nodes, the expanded text position changes from centered both horizontally and vertically to horizontally centered + top-aligned vertically, so group text is not obscured when there are child elements by default; a new method allows overriding the text position on expand
    - UI polish for context menu, minimap, and drag panel
## 2.2.0-alpha.4

- Added ELK layout plugin (ElkLayout), built on elkjs layered algorithm for automatic layout. It automatically computes node positions and edge paths.
- Usage is consistent with Dagre and both can coexist; choose as needed:
  - Install: @logicflow/layout
  - Register: import { ElkLayout } from '@logicflow/layout', then use LogicFlow.use(ElkLayout) or plugins: [ElkLayout]
  - Invoke: lf.extension.elkLayout.layout(options)
- Main options (aligned with Dagre):
  - rankdir (LR/TB/BT/RL), align (UL/UR/DL/DR), nodesep, ranksep, marginx, marginy, ranker, edgesep, acyclicer, isDefaultAnchor
- Supports passing native ELK layout parameters via elkOption to override default layout strategy details.