---
nav: API
group:
  title: Runtime Model
  order: 3
title: graphModel
toc: content
order: 12
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

`graphModel` is the model for the entire LogicFlow canvas.

Most instance methods are thin wrappers around `graphModel`.

You can access `graphModel`:

- From the instance: `lf.graphModel`
- Inside a custom `model` constructor or methods via `this.graphModel`
- Inside a custom `view` via `this.props.graphModel`

```tsx | pure
class CustomModel extends RectNodeModel {
  getNodeStyle() {
    const graphModel = this.graphModel
  }
}
```

```tsx | pure
class CustomNode extends RectNode {
  getShape() {
    const { model, graphModel } = this.props
    // ...
  }
}
```

:::info{title=Tip}
All `graphModel` fields are read-only; change state only through the documented methods.
:::

## Properties

| Property | Type | Default | Description |
| :------- | :--- | :------ | :---------- |
| width | `number` | | Canvas width |
| height | `number` | | Canvas height |
| theme | `LogicFlow.Theme` | | See [Theme API](../logicflow-instance/theme.en.md) |
| animation | `boolean \| LFOptions.AnimationConfig` | false | Animation flags |
| [eventCenter](#eventcenter) | `EventEmitter` | | Internal event hub |
| modelMap | `Map<string, BaseNodeModel \| BaseEdgeModel>` | | Model ctor registry by type |
| [topElement](#topElement) | `BaseNodeModel \| BaseEdgeModel` | | Top-most element (default overlap mode) |
| idGenerator | `(type?: string) => string \| undefined` | | Custom id factory |
| nodeMoveRules | `Model.NodeMoveRule[]` | [] | Hooks evaluated while moving nodes |
| customTrajectory | `LFOptions.CustomAnchorLineProps` | | Custom anchor line renderer |
| customTargetAnchor | `LFOptions.customTargetAnchorType` | | Anchor picking when manually connecting |
| edgeGenerator | `LFOptions.EdgeGeneratorType` | | Edge type factory |
| edgeType | `string` | | Default edge type for UI-created edges |
| nodes | `BaseNodeModel[]` | [] | All node models |
| edges | `BaseEdgeModel[]` | [] | All edge models |
| fakeNode | `BaseNodeModel \| null` | null | Placeholder while dragging external nodes |
| [overlapMode](#overlapmode) | `OverlapMode` | | Z-order policy when elements overlap |
| background | `false \| LFOptions.BackgroundConfig` | | Background layer config |
| transformModel | `TransformModel` | | Pan/zoom matrix; see [transformModel](#transformmodel) below |
| editConfigModel | `EditConfigModel` | | Edit toggles; see [editConfigModel](#editconfigmodel) and [Edit config](../logicflow-instance/edit-config.en.md) |
| gridSize | `number` | 1 | Grid step |
| partial | `boolean` | false | Partial rendering for large graphs |
| nodesMap | `GraphModel.NodesMapType` | | Node id → model map |
| edgesMap | `GraphModel.EdgesMapType` | | Edge id → model map |
| modelsMap | `GraphModel.ModelsMapType` | | Combined map |
| selectNodes | `BaseNodeModel[]` | | Selected nodes |
| sortElements | `array` | | Elements sorted by `zIndex` |
| textEditElement | `BaseNodeModel \| BaseEdgeModel` | | Element currently in text edit |
| selectElements | `Map<string, BaseNodeModel \| BaseEdgeModel>` | | Current selection map |

### eventCenter {#eventcenter} (property)

LogicFlow’s internal `EventEmitter` for custom events.

```tsx | pure
class UserTaskModel extends RectNodeModel {
  setAttributes() {
    this.menu = [
      {
        text: 'Details',
        callback: (res) => {
          this.graphModel.eventCenter.emit('user:detail', res)
        },
      },
    ]
  }
}

lf.on('user:detail', (res) => {})
```

### topElement (property)

The element rendered on top in default overlap mode; used to restore ordering after temporary promotion.

### overlapMode (property)

Controls stacking when elements overlap.

- `-1` (**STATIC**): selection does not change z-order; `toFront` is ignored; use per-element `zIndex`.
- `0` (**DEFAULT**): nodes render above edges; selection temporarily raises elements.
- `1` (**INCREASE**): each `toFront` bumps `zIndex` permanently.
- `2` (**EDGE_TOP**): edges render above nodes; `toFront` still promotes temporarily.

Only **INCREASE** and **STATIC** persist `zIndex` into serialized graph data.

## transformModel {#transformmodel}

`graphModel.transformModel` is the `TransformModel` instance that applies pan/zoom. Prefer `lf.graphModel.transformModel` or helpers on `lf` when available.

### zoom(zoomSize, point)

Zoom the canvas. Step size follows `transformModel.ZOOM_SIZE`.

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| zoomSize | `TransformModel.ZoomParamType` | false | Zoom factor (`0..n`), or `true` / `false` to step by the built-in preset. |
| point | [`PointTuple`](../type/MainTypes.en.md#pointtuple) | optional | Anchor point for zoom (transform origin). |

```tsx | pure
const { transformModel } = lf.graphModel
transformModel.zoom(true)
```

### resetZoom

Reset zoom to the default scale.

### translate(x, y)

Pan the canvas by `(x, y)` in canvas space.

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | number | Delta on X. |
| y | number | Delta on Y. |

### focusOn(targetX, targetY, width, height)

Center the rectangle `(targetX, targetY, width, height)` in the viewport.

### HtmlPointToCanvasPoint(point)

Maps a point from the HTML tool overlay into canvas overlay coordinates after applying zoom/pan.

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| point | `PointTuple` | Yes | Input coordinate. |

Returns `PointTuple`.

### CanvasPointToHtmlPoint(point)

Inverse of `HtmlPointToCanvasPoint`.

### updateTranslateLimits(limit)

Updates how far the canvas may be panned. Argument type matches constructor option `stopMoveGraph`: `boolean \| 'vertical' \| 'horizontal' \| [number, number, number, number]`.

## editConfigModel {#editconfigmodel}

`graphModel.editConfigModel` holds interaction toggles (wheel zoom, canvas drag, adjust handles, anchors, selection outlines, text editing, multi-select keys, etc.). Instance helpers [`lf.updateEditConfig` / `lf.getEditConfig`](../logicflow-instance/edit-config.en.md) wrap this model.

Field meanings and typings follow [`IEditConfigType`](../type/MainTypes.en.md#ieditconfigtype-edit-control); this section documents model methods only.

### updateEditConfig(config)

Merge partial edit configuration. Runs through `computeConfig`, including silent-mode bookkeeping.

```ts
updateEditConfig(config: Partial<IEditConfigType>): void
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| config | `Partial<IEditConfigType>` | Keys to merge (see type dictionary). |

### getConfig()

Returns the fully merged edit configuration currently in effect (`IEditConfigType`).

### updateTextMode(textMode)

Updates global `textMode` and synchronizes related node/edge text modes.

| Name | Type | Description |
| ---- | ---- | ----------- |
| textMode | `TextMode` | Same semantics as constructor `textMode`. |

```ts
import { TextMode } from '@logicflow/core'

lf.graphModel.editConfigModel.updateTextMode(TextMode.LABEL)
```

## Methods {#methods}

The following table summarizes `graphModel` mutation and query helpers. Several have matching shortcuts on the `lf` instance.

| Method | Purpose |
| ------ | ------- |
| `getAreaElement(leftTop, rightBottom, wholeEdge?, wholeNode?, ignoreHide?)` | Elements intersecting a rectangle (legacy helper). |
| `getModel(type)` | Registered model constructor for `type`. |
| `getNodeModelById(id)` | Look up a node model by id. |
| `getPointByClient(point)` | Convert a browser `Position` to `{ domOverlayPosition, canvasOverlayPosition }`. |
| `isElementInArea(element, lt, rb, wholeEdge?, wholeNode?)` | Hit-test an element against a box. |
| `getAreaElements(...)` | Same as `getAreaElement` with explicit defaults for hidden/hit rules. |
| `graphDataToModel(graphData)` | Replace the entire canvas from [`GraphConfigData`](../type/MainTypes.en.md#graphconfigdata) (clears existing elements). |
| `modelToGraphData()` | Export [`GraphConfigData`](../type/MainTypes.en.md#graphconfigdata). |
| `modelToHistoryData()` | Snapshot formatted for the history stack (`false` when disabled). |
| `getEdgeModelById(edgeId)` | Edge model lookup. |
| `getElement(id)` | Node or edge model by id. |
| `getNodeEdges(nodeId)` | All edges attached to a node. |
| `getSelectElements(isIgnoreCheck?)` | Selected elements as graph config data. |
| `getVirtualRectSize(includeEdge?)` | Bounding box of the diagram. |
| `changeNodeId` / `changeEdgeId` | Rename elements while keeping wiring consistent. |
| `handleEdgeTextMove(edge, x, y)` | Reposition edge label. |
| `toFront(id)` | Bring node/edge forward per overlap rules. |
| `setElementZIndex(id, zIndex)` | Manual stacking (`number` \| `'top'` \| `'bottom'`). |
| `deleteNode` / `addNode` / `cloneNode` / `moveNode` / `moveNode2Coordinate` | Node lifecycle helpers. |
| `editText(id)` | Open inline editor for node/edge text. |
| `setElementState(type)` | Element-local state flag (see model docs). |
| `addEdge` / `deleteEdge*` | Edge lifecycle helpers. |
| `updateText(id, value)` | Update label string. |
| `selectNodeById` / `selectEdgeById` / `selectElementById` / `clearSelectElements` | Selection API. |
| `moveNodes(nodeIds, dx, dy)` | Batch move with edge refresh. |
| `addNodeMoveRules(rule)` | Push additional move guards. |
| `getNodeIncomingNode` / `getNodeOutgoingNode` | Graph neighbourhood (nodes). |
| `getNodeIncomingEdge` / `getNodeOutgoingEdge` | Graph neighbourhood (edges). |
| `setDefaultEdgeType(type)` | Change default edge created by UI. |
| `changeNodeType` / `changeEdgeType` | Swap registered types in place. |
| `openEdgeAnimation` / `closeEdgeAnimation` | Per-edge animation toggles. |
| `setTheme(partial)` | Merge runtime theme overrides. |
| `resize(width, height)` | Canvas dimensions. |
| `clearData()` | Remove all nodes and edges. |
| `translateCenter()` | Pan content to the canvas center. |
| `fitView(verticalOffset?, horizontalOffset?)` | Zoom/pan to fit the diagram with padding. |

### updateAttributes {#updateattributes}

Low-level merge into element model fields.

:::warning{title=Warning}
Prefer `setProperties`, `updateText`, `changeNodeId`, and other high-level APIs. Writing ids or geometry incorrectly can desynchronize edges and hit-testing.
:::

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | string | Element id. |
| attributes | object | Patch object applied to the model. |

### setElementStateById {#setelementstatebyid}

Ensures a single element owns an interactive state (for example connection targeting).

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| id | string | Yes | Node or edge id. |
| state | [`ElementState`](../type/MainTypes.en.md#elementstate) | Yes | Target state code. |
| additionStateData | `Model.AdditionStateDataType` | No | Extra payload for the state machine. |

```tsx | pure
lf.graphModel.setElementStateById('node_1', 4)
```
