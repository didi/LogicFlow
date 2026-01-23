---
nav: API
title: LogicFlow Core Types
toc: content
order: 2
---

## **Introduction**

This document mainly introduces the core types of `LogicFlow`, including the following types:
- **`Common`**: Basic configuration items for instances
- **`EdgeType`**: Types of edges
- **`BackgroundConfig`**: Background configuration
- **`AnimationConfig`**: Animation configuration
- **`EdgeGeneratorType`**: Custom edge generation function
- **`CustomTargetAnchorType`**: Custom anchor connection rules
- **`CustomAnchorLineProps`**: Custom properties for anchor lines
- **`GuardsConfig`**: Interceptors (permission control)
- **`Manual` & `Definition`**: Extended configuration

## **Detailed Description of Configuration Items**

## **Basic Configuration Items for Instances (Common)**
```ts
export interface Common {
  container: HTMLElement
  width?: number
  height?: number
  background?: false | BackgroundConfig
  grid?: number | boolean | GridOptions
  partial?: boolean
  keyboard?: KeyboardDef
  style?: Partial<LogicFlow.Theme>
  edgeType?: EdgeType
  adjustEdge?: boolean
  textMode?: TextMode
  edgeTextMode?: TextMode
  nodeTextMode?: TextMode
  allowRotate?: boolean
  allowResize?: boolean
  isSilentMode?: boolean
  stopScrollGraph?: boolean
  stopZoomGraph?: boolean
  stopMoveGraph?: boolean | 'vertical' | 'horizontal' | [number, number, number, number]
  animation?: boolean | Partial<AnimationConfig>
  history?: boolean
  outline?: boolean
  snapline?: boolean
  textEdit?: boolean
  guards?: GuardsConfig
  overlapMode?: OverlapMode
  plugins?: ExtensionType[]
  pluginsOptions?: Record<string, any>
  disabledPlugins?: string[]
  disabledTools?: string[]
  idGenerator?: (type?: string) => string
  edgeGenerator?: EdgeGeneratorType
  customTrajectory?: (props: CustomAnchorLineProps) => h.JSX.Element
  [key: string]: unknown
}
```

- `container`: The DOM element used to mount the LogicFlow canvas.
- `width`: The width of the canvas.
- `height`: The height of the canvas.
- `background`: The background configuration of the canvas, which can be `false` or a `BackgroundConfig` object.
- `grid`: Grid configuration, which can be a number representing the grid size, a boolean, or a `GridOptions` object.
- `partial`: Whether to enable partial rendering.
- `keyboard`: Keyboard configuration.
- `style`: Theme style configuration.
- `edgeType`: The type of edges.
- `adjustEdge`: Whether to allow edge adjustment.
- `textMode`: Text mode.
- `edgeTextMode`: Edge text mode.
- `nodeTextMode`: Node text mode.
- `allowRotate`: Whether to allow node rotation.
- `allowResize`: Whether to allow node resizing.
- `isSilentMode`: Whether to enable silent mode. In silent mode, nodes and edges on the canvas cannot be moved, text cannot be edited, and there are no anchor points.
- `stopScrollGraph`: Whether to stop scrolling the canvas.
- `stopZoomGraph`: Whether to stop zooming the canvas.
- `stopMoveGraph`: Whether to stop moving the canvas, which can be a boolean, a string, or an array.
- `animation`: Animation configuration, which can be a boolean or an `AnimationConfig` object.
- `history`: Whether to enable history recording.
- `outline`: Whether to enable outlines.
- `snapline`: Whether to enable snaplines.
- `textEdit`: Whether to enable text editing.
- `guards`: Guards configuration.
- `overlapMode`: Overlap mode.
- `plugins`: List of plugins.
- `pluginsOptions`: Plugin options.
- `disabledPlugins`: List of disabled plugins.
- `disabledTools`: List of disabled tools.
- `idGenerator`: ID generator function.
- `edgeGenerator`: Edge generator function.
- `customTargetAnchor`: Custom anchor connection rules, which can be a function or `undefined`.
- `customTrajectory`: Custom trajectory function.
- `[key: string]`: Other custom properties.

### **EdgeType**
```ts
export type EdgeType = 'line' | 'polyline' | 'bezier' | string
```
Defines the types of edges. Possible values are:
- `'line'`: Straight line
- `'polyline'`: Polyline
- `'bezier'`: Bezier curve
- `string`: Other custom types

### **BackgroundConfig**
```ts
export type BackgroundConfig = {
  backgroundImage?: string
  backgroundRepeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | 'initial' | 'inherit'
  [key: string]: any
}
```
- `backgroundImage`: Background image URL.
- `backgroundRepeat`: Background repeat mode, similar to the CSS `background-repeat` property.
- Allows extending additional CSS styles.

This type is mainly used to constrain the `background` parameter passed in during initialization. The passed attributes will be directly applied to the `BackgroundOverlay` of the LogicFlow canvas.

### **AnimationConfig**
```ts
export type AnimationConfig = {
  node: boolean
  edge: boolean
}
```
- `node`: Whether to enable animation for nodes.
- `edge`: Whether to enable animation for edges.

### **EdgeGeneratorType**
```ts
export type EdgeGeneratorType = (
  sourceNode: LogicFlow.NodeData,
  targetNode: LogicFlow.NodeData,
  currentEdge?: Partial<LogicFlow.EdgeConfig>
) => any
```
- `sourceNode`: Source node data.
- `targetNode`: Target node data.
- `currentEdge` (optional): Partial configuration of the current edge.

This type is mainly used to constrain the `edgeGenerator` parameter passed in during initialization.
``` typescript
edgeGenerator: (sourceNode, targetNode, currentEdge) => {
  // Use bezier when the source node type is rect
  if (sourceNode.type === 'rect') return 'bezier'
  if (currentEdge) return currentEdge.type
  return 'polyline'
},
```

Used to constrain the type of custom edge generation methods.

### **customTargetAnchorType (Custom Anchor Connection Rule)**
```ts
export type customTargetAnchorType = (
  nodeModel: BaseNodeModel,
  position: LogicFlow.Point,
) => Model.AnchorInfo | undefined
```
| Field | Type | Description |
| ----- | ---- | ----------- |
| nodeModel | BaseNodeModel | The node model that acts as the target node. |
| position | LogicFlow.Point | The mouse release position (canvas coordinates). |
| Return | Model.AnchorInfo \| undefined | The anchor info to connect to; returning undefined falls back to the default behavior (connect to the anchor closest to position). |

This type constrains the `customTargetAnchor` parameter passed during initialization.

For example, adding the following code when creating the instance will always connect to the leftmost anchor, no matter where you drop on the node:
``` typescript
customTargetAnchor: (nodeModel) => {
  const anchors = nodeModel?.anchors || []
  if (!anchors.length) return
  const left = anchors.reduce((min, a) => (a.x < min.x ? a : min), anchors[0])
  return {
    index: anchors.indexOf(left),
    anchor: left,
  }
},
```

### **GuardsConfig**
```ts
export interface GuardsConfig {
  beforeClone?: (data: NodeData | GraphData) => boolean
  beforeDelete?: (data: NodeData | EdgeData) => boolean
}
```
- `beforeClone`: Interceptor function before cloning nodes/graphs. Returning `false` will prevent cloning.
- `beforeDelete`: Interceptor function before deleting nodes/edges. Returning `false` will prevent deletion.
