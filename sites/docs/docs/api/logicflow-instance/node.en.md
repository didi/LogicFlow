---
nav: API
group:
  title: LogicFlow Instance
  order: 2
title: Nodes
toc: content
order: 2
---

This page documents instance helpers for creating, deleting, querying, and mutating nodes.

### addNode

Adds a new node to the canvas.

**Signature**

```ts
addNode(nodeConfig: NodeConfig): BaseNodeModel
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `nodeConfig` | [`NodeConfig`](../type/MainTypes.en.md#nodeconfig) | Yes | Node configuration. |

**Returns**

| Type | Description |
| :--- | :--- |
| `BaseNodeModel` | Model instance for the new node. |

**Example**

```ts
lf.addNode({
  type: 'rect',
  x: 100,
  y: 100,
});
```

### deleteNode

Deletes a node and any edges attached to it.

**Signature**

```ts
deleteNode(nodeId: string): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | Yes | Node id to remove. |

**Example**

```ts
lf.deleteNode('node_1');
```

### cloneNode

Clones a node and returns the new model.

**Signature**

```ts
cloneNode(nodeId: string): BaseNodeModel
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | Yes | Source node id. |

**Returns**

| Type | Description |
| :--- | :--- |
| `BaseNodeModel` | Cloned node model. |

**Example**

```ts
const cloned = lf.cloneNode('node_1');
console.log(cloned.id);
```

### changeNodeId

Renames a node. When `newId` is omitted, LogicFlow generates one.

**Signature**

```ts
changeNodeId(oldId: string, newId?: string): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `oldId` | `string` | Yes | Current id. |
| `newId` | `string` | No | New id. |

**Example**

```ts
lf.changeNodeId('node_1', 'new_node_1');
```

### changeNodeType

Changes the registered type of a node.

**Signature**

```ts
changeNodeType(nodeId: string, type: string): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | Yes | Node id. |
| `type` | `string` | Yes | New type name. |

**Example**

```ts
lf.changeNodeType('node_1', 'circle');
```

### getNodeModelById

Returns the live model for a node.

**Signature**

```ts
getNodeModelById(nodeId: string): BaseNodeModel | undefined
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | Yes | Node id. |

**Returns**

| Type | Description |
| :--- | :--- |
| `BaseNodeModel \| undefined` | Model or `undefined` if missing. |

**Example**

```ts
const nodeModel = lf.getNodeModelById('node_1');
```

### getNodeDataById

Returns plain data shaped like `addNode` input.

**Signature**

```ts
getNodeDataById(nodeId: string): NodeConfig | undefined
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | Yes | Node id. |

**Returns**

| Type | Description |
| :--- | :--- |
| [`NodeConfig`](../type/MainTypes.en.md#nodeconfig) \| `undefined` | Config snapshot. |

**Example**

```ts
const nodeData = lf.getNodeDataById('node_1');
```

### getNodeIncomingEdge

Returns edges whose target is this node.

**Signature**

```ts
getNodeIncomingEdge(nodeId: string): BaseEdgeModel[]
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | Yes | Node id. |

**Returns**

| Type | Description |
| :--- | :--- |
| `BaseEdgeModel[]` | Incoming edge models. |

**Example**

```ts
const incomingEdges = lf.getNodeIncomingEdge('node_1');
```

### getNodeOutgoingEdge

Returns edges whose source is this node.

**Signature**

```ts
getNodeOutgoingEdge(nodeId: string): BaseEdgeModel[]
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | Yes | Node id. |

**Returns**

| Type | Description |
| :--- | :--- |
| `BaseEdgeModel[]` | Outgoing edge models. |

**Example**

```ts
const outgoingEdges = lf.getNodeOutgoingEdge('node_1');
```

### getNodeIncomingNode

Returns upstream neighbour nodes.

**Signature**

```ts
getNodeIncomingNode(nodeId: string): BaseNodeModel[]
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | Yes | Node id. |

**Returns**

| Type | Description |
| :--- | :--- |
| `BaseNodeModel[]` | Upstream models. |

**Example**

```ts
const incomingNodes = lf.getNodeIncomingNode('node_1');
```

### getNodeOutgoingNode

Returns downstream neighbour nodes.

**Signature**

```ts
getNodeOutgoingNode(nodeId: string): BaseNodeModel[]
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | Yes | Node id. |

**Returns**

| Type | Description |
| :--- | :--- |
| `BaseNodeModel[]` | Downstream models. |

**Example**

```ts
const outgoingNodes = lf.getNodeOutgoingNode('node_1');
```
