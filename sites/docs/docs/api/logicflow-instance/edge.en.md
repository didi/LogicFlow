---
nav: API
group:
  title: LogicFlow Instance
  order: 2
title: Edges
toc: content
order: 3
---

This page documents instance helpers for creating, querying, updating, and deleting edges.

### setDefaultEdgeType

Sets the default edge type used when users draw new connections.

**Signature**

```ts
setDefaultEdgeType(type: string): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `type` | `string` | Yes | Edge type such as `line`, `polyline`, or `bezier`. |

**Example**

```ts
lf.setDefaultEdgeType('line');
```

### addEdge

Creates an edge between two nodes.

**Signature**

```ts
addEdge(edgeConfig: EdgeConfig): BaseEdgeModel
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `edgeConfig` | [`EdgeConfig`](../type/MainTypes.en.md#edgeconfig) | Yes | Edge configuration. |

**Returns**

| Type | Description |
| :--- | :--- |
| `BaseEdgeModel` | New edge model. |

**Example**

```ts
lf.addEdge({
  sourceNodeId: '10',
  targetNodeId: '21',
  text: 'Label',
});
```

### getEdgeDataById

Returns serialized edge data.

**Signature**

```ts
getEdgeDataById(edgeId: string): EdgeConfig | undefined
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `edgeId` | `string` | Yes | Edge id. |

**Returns**

| Type | Description |
| :--- | :--- |
| [`EdgeConfig`](../type/MainTypes.en.md#edgeconfig) \| `undefined` | Data snapshot. |

**Example**

```ts
lf.getEdgeDataById('edge_1');
```

### getEdgeModelById

Returns the live edge model.

**Signature**

```ts
getEdgeModelById(edgeId: string): BaseEdgeModel | undefined
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `edgeId` | `string` | Yes | Edge id. |

**Returns**

| Type | Description |
| :--- | :--- |
| `BaseEdgeModel \| undefined` | Model or `undefined`. |

**Example**

```ts
lf.getEdgeModelById('edge_1');
```

### getEdgeModels

Filters edge models by endpoints or other fields.

**Signature**

```ts
getEdgeModels(edgeFilter: EdgeFilter): BaseEdgeModel[]
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `edgeFilter` | `EdgeFilter` | Yes | Filter object (commonly `sourceNodeId` / `targetNodeId`; see types). |

**Returns**

| Type | Description |
| :--- | :--- |
| `BaseEdgeModel[]` | Matching models. |

**Example**

```ts
lf.getEdgeModels({
  sourceNodeId: 'nodeA_id',
  targetNodeId: 'nodeB_id',
});
```

### changeEdgeId

Renames an edge; generates an id when `newId` is omitted.

**Signature**

```ts
changeEdgeId(oldId: string, newId?: string): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `oldId` | `string` | Yes | Current id. |
| `newId` | `string` | No | New id. |

**Example**

```ts
lf.changeEdgeId('oldId', 'newId');
```

### changeEdgeType

Swaps the registered edge type.

**Signature**

```ts
changeEdgeType(edgeId: string, type: string): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `edgeId` | `string` | Yes | Edge id. |
| `type` | `string` | Yes | New type. |

**Example**

```ts
lf.changeEdgeType('edgeId', 'bezier');
```

### deleteEdge

Deletes an edge by id.

**Signature**

```ts
deleteEdge(id: string): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Edge id. |

**Example**

```ts
lf.deleteEdge('edge_1');
```

### deleteEdgeByNodeId

Deletes edges matching endpoint filters.

**Signature**

```ts
deleteEdgeByNodeId(config: EdgeFilter): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `config` | `EdgeFilter` | Yes | Endpoint filter (see [`EdgeConfig`](../type/MainTypes.en.md#edgeconfig) fields). |

**Example**

```ts
lf.deleteEdgeByNodeId({
  sourceNodeId: 'id1',
  targetNodeId: 'id2',
});
```

### getNodeEdges

Lists all edge models attached to a node.

**Signature**

```ts
getNodeEdges(id: string): BaseEdgeModel[]
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Node id. |

**Returns**

| Type | Description |
| :--- | :--- |
| `BaseEdgeModel[]` | Related edges. |

**Example**

```ts
const edgeModels = lf.getNodeEdges('node_id');
```
