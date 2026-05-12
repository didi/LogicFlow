---
nav: API
group:
  title: LogicFlow Instance
  order: 2
title: Elements
toc: content
order: 4
---

This page documents batch operations, selection helpers, and property utilities that work on both nodes and edges.

### addElements

Adds many nodes and edges at once.

**Signature**

```ts
addElements(data: GraphData): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `data` | [`GraphData`](../type/MainTypes.en.md#graphdata) | Yes | Nodes and edges to insert. |

**Example**

```ts
lf.addElements({
  nodes: [{ id: 'node_1', type: 'rect', x: 100, y: 100 }],
  edges: [],
});
```

### selectElementById

Selects a node or edge.

**Signature**

```ts
selectElementById(id: string, multiple?: boolean, toFront?: boolean): BaseNodeModel | BaseEdgeModel
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Element id. |
| `multiple` | `boolean` | No | Keep previous selection when `true`. |
| `toFront` | `boolean` | No | Promote z-order after selection. |

**Returns**

| Type | Description |
| :--- | :--- |
| `BaseNodeModel \| BaseEdgeModel` | Selected model. |

**Example**

```ts
lf.selectElementById('node_1', true, true);
```

### deselectElementById

Clears selection for one element.

**Signature**

```ts
deselectElementById(id: string): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Element id. |

**Example**

```ts
lf.deselectElementById('node_1');
```

### getSelectElements

Exports currently selected elements as graph configuration data.

**Signature**

```ts
getSelectElements(isIgnoreCheck?: boolean): GraphConfigData
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `isIgnoreCheck` | `boolean` | No | When `false`, omits edges whose endpoints are not both selected (useful for copy). |

**Returns**

| Type | Description |
| :--- | :--- |
| [`GraphConfigData`](../type/MainTypes.en.md#graphconfigdata) | Selection payload. |

**Example**

```ts
lf.getSelectElements(false);
```

### clearSelectElements

Clears the entire selection.

**Signature**

```ts
clearSelectElements(): void
```

**Example**

```ts
lf.clearSelectElements();
```

### getModelById

Looks up a node or edge model.

**Signature**

```ts
getModelById(id: string): BaseNodeModel | BaseEdgeModel | undefined
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Element id. |

**Returns**

| Type | Description |
| :--- | :--- |
| `BaseNodeModel \| BaseEdgeModel \| undefined` | Model instance. |

**Example**

```ts
lf.getModelById('node_id');
lf.getModelById('edge_id');
```

### getDataById

Returns plain config data for a node or edge.

**Signature**

```ts
getDataById(id: string): NodeConfig | EdgeConfig | undefined
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Element id. |

**Returns**

| Type | Description |
| :--- | :--- |
| [`NodeConfig`](../type/MainTypes.en.md#nodeconfig) \| [`EdgeConfig`](../type/MainTypes.en.md#edgeconfig) \| `undefined` | Data snapshot. |

### deleteElement

Deletes a node or edge.

**Signature**

```ts
deleteElement(id: string): boolean
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Element id. |

**Returns**

| Type | Description |
| :--- | :--- |
| `boolean` | Whether deletion succeeded. |

**Example**

```ts
lf.deleteElement('node_id');
```

### setElementZIndex

Sets stacking order for an element.

**Signature**

```ts
setElementZIndex(id: string, zIndex: string | number): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Element id. |
| `zIndex` | `string \| number` | Yes | Numeric index or `'top'` / `'bottom'`. |

**Example**

```ts
lf.setElementZIndex('element_id', 'top');
```

### getAreaElement

Returns models intersecting a canvas rectangle.

**Signature**

```ts
getAreaElement(
  leftTopPoint: PointTuple,
  rightBottomPoint: PointTuple,
  wholeEdge?: boolean,
  wholeNode?: boolean,
  ignoreHideElement?: boolean
): (BaseNodeModel | BaseEdgeModel)[]
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `leftTopPoint` | `PointTuple` | Yes | Upper-left corner. |
| `rightBottomPoint` | `PointTuple` | Yes | Lower-right corner. |
| `wholeEdge` | `boolean` | No | Require the entire edge inside the box. |
| `wholeNode` | `boolean` | No | Require the entire node inside the box. |
| `ignoreHideElement` | `boolean` | No | Skip hidden elements. |

**Returns**

| Type | Description |
| :--- | :--- |
| `(BaseNodeModel \| BaseEdgeModel)[]` | Hits. |

**Example**

```ts
lf.getAreaElement([100, 100], [500, 500]);
```

### setProperties

Sets custom `properties` on a node or edge.

**Signature**

```ts
setProperties(id: string, properties: Record<string, unknown>): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Element id. |
| `properties` | `Record<string, unknown>` | Yes | Property bag. |

**Example**

```ts
lf.setProperties('aF2Md2P23moN2gasd', {
  isRollbackNode: true,
});
```

### getProperties

Reads the custom property object.

**Signature**

```ts
getProperties(id: string): Record<string, any>
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Element id. |

**Returns**

| Type | Description |
| :--- | :--- |
| `Record<string, any>` | Properties map. |

**Example**

```ts
lf.getProperties('id');
```

### deleteProperty

Removes a single key from `properties`.

**Signature**

```ts
deleteProperty(id: string, key: string): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Element id. |
| `key` | `string` | Yes | Property key. |

**Example**

```ts
lf.deleteProperty('aF2Md2P23moN2gasd', 'isRollbackNode');
```

### updateAttributes

Low-level patch against model fields; delegates to [`graphModel.updateAttributes`](../runtime-model/graphModel.en.md#updateattributes).

:::warning{title=Note}
Prefer higher-level helpers (`setProperties`, `updateText`, `changeNodeId`, …). Changing ids or geometry incorrectly can break edges.
:::

**Signature**

```ts
updateAttributes(id: string, attributes: object): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Element id. |
| `attributes` | `object` | Yes | Fields to merge into the model. |

**Example**

```ts
lf.updateAttributes('node_id_1', { radius: 4 });
```
