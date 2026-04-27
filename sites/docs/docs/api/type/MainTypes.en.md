---
nav: API
group:
  title: 类型字典
  order: 3
title: Core Types (MainTypes)
toc: content
order: 1
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

## **Basic Configuration Items for Instances (Common)** {#common}
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

### **EdgeType** {#edgetype}
```ts
export type EdgeType = 'line' | 'polyline' | 'bezier' | string
```
Defines the types of edges. Possible values are:
- `'line'`: Straight line
- `'polyline'`: Polyline
- `'bezier'`: Bezier curve
- `string`: Other custom types

### **BackgroundConfig** {#backgroundconfig}
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

### **AnimationConfig** {#animationconfig}
```ts
export type AnimationConfig = {
  node: boolean
  edge: boolean
}
```
- `node`: Whether to enable animation for nodes.
- `edge`: Whether to enable animation for edges.

### **EdgeGeneratorType** {#edgegeneratortype}
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

### **customTargetAnchorType (Custom Anchor Connection Rule)** {#customtargetanchortype}
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

### **GuardsConfig** {#guardsconfig}
```ts
export interface GuardsConfig {
  beforeClone?: (data: NodeData | GraphData) => boolean
  beforeDelete?: (data: NodeData | EdgeData) => boolean
}
```
- `beforeClone`: Interceptor function before cloning nodes/graphs. Returning `false` will prevent cloning.
- `beforeDelete`: Interceptor function before deleting nodes/edges. Returning `false` will prevent deletion.

### **IEditConfigType (edit control configuration)** {#ieditconfigtype-edit-control}

`IEditConfigType` is the full runtime edit-control shape used by `updateEditConfig` and `getEditConfig`.

| Field | Type | Description |
| --- | --- | --- |
| `isSilentMode` | `boolean` | Silent (read-only) mode. |
| `stopZoomGraph` | `boolean` | Disable zooming the canvas. |
| `stopScrollGraph` | `boolean` | Disable wheel panning. |
| `stopMoveGraph` | `boolean \| 'vertical' \| 'horizontal' \| [number, number, number, number]` | Constrain or disable canvas panning. |
| `adjustEdge` | `boolean` | Allow edge adjustment. |
| `adjustEdgeMiddle` | `boolean` | Allow adjusting edge midpoints. |
| `adjustEdgeStartAndEnd` | `boolean` | Allow dragging edge endpoints. |
| `adjustNodePosition` | `boolean` | Allow moving nodes. |
| `hideAnchors` | `boolean` | Hide anchors. |
| `allowRotate` | `boolean` | Allow node rotation. |
| `allowResize` | `boolean` | Allow node resize. |
| `autoExpand` | `boolean` | Auto-expand canvas when elements exceed bounds. |
| `hoverOutline` | `boolean` | Show hover outline. |
| `nodeSelectedOutline` | `boolean` | Outline when node is selected. |
| `edgeSelectedOutline` | `boolean` | Outline when edge is selected. |
| `textEdit` | `boolean` | Allow text editing. |
| `nodeTextEdit` | `boolean` | Allow node text editing. |
| `edgeTextEdit` | `boolean` | Allow edge text editing. |
| `textDraggable` | `boolean` | Allow dragging text. |
| `nodeTextDraggable` | `boolean` | Allow dragging node text. |
| `edgeTextDraggable` | `boolean` | Allow dragging edge text. |
| `multipleSelectKey` | `string` | Multi-select modifier (`meta` / `shift` / `alt`). |

### **GridOptions** {#gridoptions}

| Field | Type | Description |
| ----- | ---- | ----------- |
| size | number (optional) | Grid cell spacing. |
| visible | boolean (optional) | Whether grid lines are visible. |
| type | `'dot' \| 'mesh'` (optional) | Grid pattern: dots or mesh lines. |
| config | `{ color?: string; thickness?: number }` (optional) | Line/dot styling. |
| config.color | string (optional) | Grid color. |
| config.thickness | number (optional) | Line thickness or dot size. |

### **KeyboardDef** {#keyboarddef}

| Field | Type | Description |
| ----- | ---- | ----------- |
| enabled | boolean | Master switch for keyboard shortcuts. |
| shortcuts | `Array<{ keys: string \| string[]; callback: Handler; action?: Action }>` (optional) | Custom shortcut definitions. |
| shortcuts.keys | string \| string[] | Key combination to listen for. |
| shortcuts.callback | Handler | Handler invoked when the shortcut fires. |
| shortcuts.action | Action (optional) | DOM keyboard event type (`keypress`, `keydown`, `keyup`). |

### **AppendConfig** {#appendconfig}

Polyline segment selection metadata when inserting nodes on an edge.

| Field | Type | Description |
| ----- | ---- | ----------- |
| startIndex | number | Segment start index for insertion. |
| endIndex | number | Segment end index / append position. |
| direction | Direction | Direction along the polyline. |
| draggable | boolean (optional) | Whether the segment can be dragged. |
| start | Point | Start coordinate of the selection. |
| end | Point | End coordinate of the selection. |

### **ArrowConfig** {#arrowconfig}

| Field | Type | Description |
| ----- | ---- | ----------- |
| markerStart | string | SVG marker id or definition for the arrow start. |
| markerEnd | string | SVG marker id or definition for the arrow end. |

### **AttributesType** {#attributestype}

```ts
export type AttributesType = Record<string, any>
```

Bag for arbitrary custom attributes on LogicFlow elements.

### **RegisterConfig** {#registerconfig}

| Field | Type | Description |
| ----- | ---- | ----------- |
| type | string | Element type name (required). |
| view | ComponentType<any> & { isObserved?: boolean } | View component for rendering. |
| model | GraphElementCtor | Model constructor (`BaseNodeModelCtor` or `BaseEdgeModelCtor`). |
| isObserverView | boolean (optional) | Whether the view observes model changes. |

### **RegisterElement** {#registerelement}

| Field | Type | Description |
| ----- | ---- | ----------- |
| view | React.ComponentType<any> | Visual component. |
| model | any | Data model implementation. |

### **RegisterElementFunc** {#registerelementfunc}

```ts
export type RegisterElementFunc = (params: RegisterParam) => RegisterElement
```

### **RegisterParam** {#registerparam}

```ts
export type RegisterParam = {
  h: typeof h
  [key: string]: unknown
}
```

| Field | Type | Description |
| ----- | ---- | ----------- |
| h | Function | Hyperscript helper for virtual DOM. |
| [key: string] | any | Additional registration context. |

### **BaseNodeModelCtor** {#basenodemodelctor}

Constructor type for node models derived from `BaseNodeModel`.

### **BaseEdgeModelCtor** {#baseedgemodelctor}

Constructor type for edge models derived from `BaseEdgeModel`.

## **Canvas-related types** {#canvas-related}

### **GraphConfigData** {#graphconfigdata}

Input shape for `lf.render` when using LogicFlow graph configuration objects.

| Field | Type | Description |
| ----- | ---- | ----------- |
| nodes | `NodeConfig[] \| undefined` | Optional array of node configs (see [NodeConfig](#nodeconfig)). |
| edges | `EdgeConfig[] \| undefined` | Optional array of edge configs (see [EdgeConfig](#edgeconfig)). |

### **GraphData** {#graphdata}

Native graph snapshot returned by APIs such as `getGraphRawData`.

```ts
interface GraphData {
  nodes: NodeData[]
  edges: EdgeData[]
}
```

| Field | Type | Description |
| ----- | ---- | ----------- |
| nodes | NodeData[] | All node records. |
| edges | EdgeData[] | All edge records. |

### **GraphElement** {#graphelement}

Union of `BaseNodeModel | BaseEdgeModel` representing any element on the canvas.

### **GraphElementCtor** {#graphelementctor}

```ts
export type GraphElementCtor = BaseNodeModelCtor | BaseEdgeModelCtor
```

### **Position** {#position}

| Field | Type | Description |
| ----- | ---- | ----------- |
| x | number | Horizontal coordinate. |
| y | number | Vertical coordinate. |

### **Point** {#point}

Extends `Position` with optional identifiers or extra fields.

| Field | Type | Description |
| ----- | ---- | ----------- |
| id | string (optional) | Stable point identifier. |
| x | number | X coordinate. |
| y | number | Y coordinate. |
| [key: string] | any | Additional metadata. |

### **PointTuple** {#pointtuple}

Tuple `[x, y]` representing a point in canvas space.

### **PropertiesType** {#propertiestype}

| Field | Type | Description |
| ----- | ---- | ----------- |
| width | number (optional) | Element width. |
| height | number (optional) | Element height. |
| rx | number (optional) | Horizontal corner radius. |
| ry | number (optional) | Vertical corner radius. |
| style | LogicFlow.CommonTheme (optional) | Theme snippet for the element. |
| textStyle | LogicFlow.CommonTheme (optional) | Theme snippet for nested text. |
| [key: string] | any (optional) | Arbitrary business fields. |

### **TextConfig** {#textconfig}

| Field | Type | Description |
| ----- | ---- | ----------- |
| value | string | Text body. |
| x | number | Canvas X coordinate. |
| y | number | Canvas Y coordinate. |
| editable | boolean (optional) | Whether users can edit inline. |
| draggable | boolean (optional) | Whether text can be dragged. |
| overflowMode | `'default' \| 'autoWrap' \| 'ellipsis'` (optional) | Overflow handling. |

### **ClientPosition** {#clientposition}

```ts
export type ClientPosition = {
  domOverlayPosition: Position
  canvasOverlayPosition: Position
}
```

Returned by pointer helpers and several interaction events.

### **ElementState** {#elementstate}

Numeric codes consumed by `graphModel.setElementStateById`.

| Name | Value | Meaning |
| ---- | ----- | ------- |
| DEFAULT | 1 | Normal display. |
| TEXT_EDIT | 2 | Text editing mode. |
| SHOW_MENU | 3 | Legacy menu state (prefer menu plugin). |
| ALLOW_CONNECT | 4 | Element may accept the active edge. |
| NOT_ALLOW_CONNECT | 5 | Element rejects the active edge. |

## **Node-related types** {#node-related}

### **NodeConfig** {#nodeconfig}

| Field | Type | Description |
| ----- | ---- | ----------- |
| id | string (optional) | Node identifier (auto-generated if omitted). |
| type | string | Registered node type (required). |
| x | number | Canvas X coordinate. |
| y | number | Canvas Y coordinate. |
| text | TextConfig \| string (optional) | Label configuration or plain string. |
| zIndex | number (optional) | Stack order. |
| properties | PropertiesType (optional) | Custom properties payload. |
| virtual | boolean (optional) | Marks transient / preview nodes. |
| rotate | number (optional) | Rotation in degrees. |
| rotatable | boolean (optional) | Allows interactive rotation. |
| resizable | boolean (optional) | Allows interactive resizing. |

### **OffsetData** {#offsetdata}

| Field | Type | Description |
| ----- | ---- | ----------- |
| dx | number | Horizontal drag delta. |
| dy | number | Vertical drag delta. |

### **FakeNodeConfig** {#fakenodeconfig}

Configuration for placeholder nodes while dragging from external sources.

| Field | Type | Description |
| ----- | ---- | ----------- |
| type | string | Target node type. |
| text | TextConfig \| string (optional) | Label while dragging. |
| properties | PropertiesType (optional) | Shape/style hints. |
| [key: string] | unknown | Additional transient fields. |

### **VectorData** {#vectordata}

| Field | Type | Description |
| ----- | ---- | ----------- |
| deltaX | number | Resize/move delta on X. |
| deltaY | number | Resize/move delta on Y. |

### **DomAttributes** {#domattributes}

SVG attributes returned from `getOuterGAttributes`.

| Field | Type | Description |
| ----- | ---- | ----------- |
| className | string | Optional CSS class on the outer `<g>`. |
| [key: string] | string \| undefined | Arbitrary SVG attributes. |

## **Edge-related types** {#edge-related}

### **EdgeConfig** {#edgeconfig}

| Field | Type | Description |
| ----- | ---- | ----------- |
| id | string (optional) | Edge identifier. |
| type | string (optional) | Edge type (`polyline` by default). |
| sourceNodeId | string | Source node id. |
| sourceAnchorId | string (optional) | Source anchor id. |
| targetNodeId | string | Target node id. |
| targetAnchorId | string (optional) | Target anchor id. |
| startPoint | Point (optional) | Manual start coordinate. |
| endPoint | Point (optional) | Manual end coordinate. |
| text | string \| TextConfig (optional) | Edge label. |
| pointsList | Point[] (optional) | Polyline bend points. |
| zIndex | number (optional) | Stack order. |
| properties | PropertiesType (optional) | Custom properties. |

### **EdgeData** {#edgedata}

Runtime edge snapshot extending `EdgeConfig` with resolved geometry.

| Field | Type | Description |
| ----- | ---- | ----------- |
| id | string | Edge identifier. |
| type | string | Edge type. |
| text | TextConfig \| string | Label payload. |
| startPoint | Point | Resolved start. |
| endPoint | Point | Resolved end. |
| pointsList | Point[] | Bend points for polylines. |

## **Plugin-related types** {#plugin-related}

### **Extension** {#extension}

| Field | Type | Description |
| ----- | ---- | ----------- |
| render | `(lf: LogicFlow, container: HTMLElement) => void` | Mount UI into the plugin container. |
| destroy | `() => void` (optional) | Cleanup hook. |

### **ExtensionRenderFunc** {#extensionrenderfunc}

```ts
export type ExtensionRenderFunc = (lf: LogicFlow, container: HTMLElement) => void
```

### **ExtensionType** {#extensiontype}

```ts
export type ExtensionType = ExtensionConstructor | ExtensionDefinition
```

### **ExtensionConfig** {#extensionconfig}

| Field | Type | Description |
| ----- | ---- | ----------- |
| pluginFlag | Symbol | Unique symbol identifying the plugin slot. |
| extension | ExtensionConstructor \| ExtensionDefinition | Plugin implementation. |
| props | Record<string, any> (optional) | Props forwarded to the plugin ctor. |

### **IExtensionProps** {#iextensionprops}

| Field | Type | Description |
| ----- | ---- | ----------- |
| lf | LogicFlow | Host instance. |
| LogicFlow | LogicFlowConstructor | Constructor reference for advanced usage. |
| props | Record<string, unknown> (optional) | Custom props from registration. |
| options | Record<string, unknown> | Plugin-specific options. |

### **ExtensionConstructor** {#extensionconstructor}

Class-based plugins must expose `pluginName` and accept `IExtensionProps` in the constructor.

### **ExtensionDefinition** {#extensiondefinition}

Object-style plugins with optional `install` and `render` hooks.

### **LabelConfig** {#labelconfig}

Rich configuration for Label plugin instances (positions, overflow, draggability, etc.).

### **LabelOption** {#labeloption}

Global Label plugin options (`isVertical`, `isMultiple`, `maxCount`, …).

### **MenuConfig** {#menuconfig}

Context-menu entry definition (`text`, `className`, `icon`, `callback`).

## **BPMN helper types** {#bpmn-elements}

### **DefinitionConfigType** {#definitionconfigtype}

| Field | Type | Description |
| ----- | ---- | ----------- |
| nodes | string[] | BPMN element types receiving the definition bundle. |
| definition | EventDefinitionType[] \| TaskDefinitionType[] | Associated BPMN definitions. |

### **DefinitionPropertiesType** {#definitionpropertiestype}

| Field | Type | Description |
| ----- | ---- | ----------- |
| definitionType | string | BPMN XML discriminator. |
| [key: string] | any | Additional serialized fields. |

### **EventDefinitionType** {#eventdefinitiontype}

| Field | Type | Description |
| ----- | ---- | ----------- |
| type | string | Definition name aligned with BPMN XML. |
| icon | string \| Record<string, any> | Icon payload for palette/rendering. |
| toJSON | `(data?: unknown) => unknown` | Serializer hook. |
| properties | DefinitionPropertiesType | Default properties for new nodes. |
| [key: string] | any | Extension slots. |

### **TaskDefinitionType** {#taskdefinitiontype}

| Field | Type | Description |
| ----- | ---- | ----------- |
| type | string | Task identifier. |
| [key: string] | any | Extension slots. |
