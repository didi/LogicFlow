---
nav: API
group:
  title: LogicFlow
  order: 1
title: Constructor
toc: content
order: 0
---

## Calling the constructor

```tsx | pure
import LogicFlow from '@logicflow/core'

const options: LogicFlow.Options = {
  // ...
}
new LogicFlow(options)
```

## Basic options

| Option     | Type        | Required | Default | Description |
| :--------- | :---------- | :------- | :------ | :---------- |
| container  | `HTMLElement` | Yes    | -       | DOM container for the diagram. |
| width      | number      | No       | -       | Canvas width in `px`; defaults to container width. |
| height     | number      | No       | -       | Canvas height in `px`; defaults to container height. |
| autoExpand | boolean     | No       | false   | Expand the canvas when nodes are dragged near the edge. |

## Canvas options

| Option           | Type | Required | Default | Description |
| :--------------- | :--- | :------- | :------ | :---------- |
| background       | false \| [`BackgroundConfig`](../type/MainTypes.en.md#backgroundconfig) | No | false | Background layer; `false` disables it. |
| grid             | number / boolean / [`GridOptions`](../type/MainTypes.en.md#gridoptions) | No | false | Grid configuration. |
| snapGrid         | boolean | No | false | Snap dragging to the grid. |
| partial          | boolean | No | false | Enable partial rendering for large graphs. |
| animation        | boolean \| `Partial<AnimationConfig>`（[`AnimationConfig`](../type/MainTypes.en.md#animationconfig)） | No | - | Animation toggles and per-kind settings. |
| overlapMode      | [`OverlapMode`](../type/MainTypes.en.md#common) | No | - | Z-ordering when elements overlap. |
| snapline         | boolean | No | true | Show snaplines while dragging nodes. |
| stopScrollGraph  | boolean | No | false | Disable wheel panning. |
| stopZoomGraph    | boolean | No | false | Disable zoom. |
| stopMoveGraph    | boolean \| 'vertical' \| 'horizontal' \| [number, number, number, number] | No | false | Constrain or disable canvas panning. |

## Edit control

| Option                 | Type | Required | Default | Description |
| :--------------------- | :--- | :------- | :------ | :---------- |
| isSilentMode           | boolean | No | false | Read-only / presentation mode. |
| guards                 | [`GuardsConfig`](../type/MainTypes.en.md#guardsconfig) | No | - | Guard callbacks (`beforeClone`, `beforeDelete`, …). |
| disabledTools          | `string[]` | No | - | Built-in tools to disable. |
| adjustEdge             | boolean | No | true | Allow edge adjustment. |
| adjustEdgeStartAndEnd  | boolean | No | false | Allow dragging edge endpoints. |
| adjustNodePosition     | boolean | No | true | Allow moving nodes. |
| hideAnchors            | boolean | No | false | Hide node anchors. |
| outline                | boolean | No | false | Outer selection box for nodes. |
| hoverOutline           | boolean | No | true | Outline on hover. |
| nodeSelectedOutline    | boolean | No | true | Outline when a node is selected. |
| edgeSelectedOutline    | boolean | No | true | Outline when an edge is selected. |
| nodeTextEdit           | boolean | No | true | Allow editing node text. |
| edgeTextEdit           | boolean | No | true | Allow editing edge text. |
| textEdit               | boolean | No | true | Master text-edit switch. |
| nodeTextDraggable      | boolean | No | false | Allow dragging node text. |
| edgeTextDraggable      | boolean | No | false | Allow dragging edge text. |
| multipleSelectKey      | string | No | - | Multi-select modifier (`meta` / `shift` / `alt`). |
| idGenerator            | function | No | - | Custom id generator for new nodes/edges. |
| customTargetAnchor     | [`customTargetAnchorType`](../type/MainTypes.en.md#customtargetanchortype) | No | - | Custom anchor picking when connecting. |
| edgeGenerator          | [`EdgeGeneratorType`](../type/MainTypes.en.md#edgegeneratortype) | No | - | Rule for edge type when connecting. |
| customTrajectory       | function | No | - | Custom anchor line rendering. |

## Keyboard

| Option   | Type | Required | Default | Description |
| :------- | :--- | :------- | :------ | :---------- |
| keyboard | [`KeyboardDef`](../type/MainTypes.en.md#keyboarddef) | No | - | Keyboard shortcuts configuration. |

Built-in shortcuts (when `keyboard.enabled = true`):

- `cmd + c` / `ctrl + c`: copy
- `cmd + v` / `ctrl + v`: paste
- `cmd + z` / `ctrl + z`: undo
- `cmd + y` / `ctrl + y`: redo
- `backspace`: delete

## Theme

| Option    | Type | Required | Default | Description |
| :-------- | :--- | :------- | :------ | :---------- |
| style     | [`Theme`](../type/Theme.en.md#theme) | No | - | Visual theme for nodes, edges, text, anchors, etc. |
| themeMode | string | No | - | Built-in presets: `default`, `dark`, `colorful`, `radius`. |
| edgeType  | [`EdgeType`](../type/MainTypes.en.md#edgetype) | No | `polyline` | Default edge type created from the UI. |

## Plugins

| Option          | Type | Required | Default | Description |
| :-------------- | :--- | :------- | :------ | :---------- |
| disabledPlugins | `string[]` | No | - | Plugins not to load at init. |
| plugins         | [`ExtensionConstructor`](../type/MainTypes.en.md#extensionconstructor)`[]` | No | - | Plugins for this instance; falls back to global list. |
| pluginsOptions  | any | No | - | Options passed to plugins. |

## History

| Option  | Type | Required | Default | Description |
| :------ | :--- | :------- | :------ | :---------- |
| history | boolean | No | true | Enable undo/redo stack. |
