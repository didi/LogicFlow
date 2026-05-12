---
nav: API
group:
  title: LogicFlow 实例
  order: 2
title: 节点相关
toc: content
order: 2
---

本页汇总 LogicFlow 实例中与节点增删改查及上下游关系查询相关的方法。

### addNode

在画布上添加一个新节点。

**签名**

```ts
addNode(nodeConfig: NodeConfig): BaseNodeModel
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `nodeConfig` | [`NodeConfig`](../type/MainTypes.zh.md#nodeconfig节点配置) | 是 | 节点配置。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| `BaseNodeModel` | 新增节点的 model 实例。 |

**示例**

```ts
lf.addNode({
  type: 'rect',
  x: 100,
  y: 100,
});
```

### deleteNode

删除指定节点；若该节点有关联边，会一并删除这些边。

**签名**

```ts
deleteNode(nodeId: string): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | 是 | 要删除的节点 ID。 |

**示例**

```ts
lf.deleteNode('node_1');
```

### cloneNode

克隆一个节点并返回新节点实例。

**签名**

```ts
cloneNode(nodeId: string): BaseNodeModel
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | 是 | 要克隆的节点 ID。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| `BaseNodeModel` | 克隆得到的新节点 model 实例。 |

**示例**

```ts
const cloned = lf.cloneNode('node_1');
console.log(cloned.id);
```

### changeNodeId

修改节点 ID；若不传新 ID，会自动生成一个唯一 ID。

**签名**

```ts
changeNodeId(oldId: string, newId?: string): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `oldId` | `string` | 是 | 当前节点 ID。 |
| `newId` | `string` | 否 | 新节点 ID。 |

**示例**

```ts
lf.changeNodeId('node_1', 'new_node_1');
```

### changeNodeType

修改节点类型。

**签名**

```ts
changeNodeType(nodeId: string, type: string): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | 是 | 节点 ID。 |
| `type` | `string` | 是 | 新的节点类型。 |

**示例**

```ts
lf.changeNodeType('node_1', 'circle');
```

### getNodeModelById

获取节点的 model 实例。

**签名**

```ts
getNodeModelById(nodeId: string): BaseNodeModel | undefined
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | 是 | 节点 ID。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| `BaseNodeModel \| undefined` | 节点 model；不存在时返回 `undefined`。 |

**示例**

```ts
const nodeModel = lf.getNodeModelById('node_1');
```

### getNodeDataById

获取节点数据，返回格式与 `addNode` 入参一致。

**签名**

```ts
getNodeDataById(nodeId: string): NodeConfig | undefined
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | 是 | 节点 ID。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| [`NodeConfig`](../type/MainTypes.zh.md#nodeconfig节点配置) \| `undefined` | 节点配置数据；不存在时返回 `undefined`。 |

**示例**

```ts
const nodeData = lf.getNodeDataById('node_1');
```

### getNodeIncomingEdge

获取所有以该节点为终点的边。

**签名**

```ts
getNodeIncomingEdge(nodeId: string): BaseEdgeModel[]
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | 是 | 节点 ID。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| `BaseEdgeModel[]` | 入边 model 列表。 |

**示例**

```ts
const incomingEdges = lf.getNodeIncomingEdge('node_1');
```

### getNodeOutgoingEdge

获取所有以该节点为起点的边。

**签名**

```ts
getNodeOutgoingEdge(nodeId: string): BaseEdgeModel[]
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | 是 | 节点 ID。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| `BaseEdgeModel[]` | 出边 model 列表。 |

**示例**

```ts
const outgoingEdges = lf.getNodeOutgoingEdge('node_1');
```

### getNodeIncomingNode

获取所有连入该节点的上游节点。

**签名**

```ts
getNodeIncomingNode(nodeId: string): BaseNodeModel[]
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | 是 | 节点 ID。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| `BaseNodeModel[]` | 上游节点 model 列表。 |

**示例**

```ts
const incomingNodes = lf.getNodeIncomingNode('node_1');
```

### getNodeOutgoingNode

获取所有由该节点连出的下游节点。

**签名**

```ts
getNodeOutgoingNode(nodeId: string): BaseNodeModel[]
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `nodeId` | `string` | 是 | 节点 ID。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| `BaseNodeModel[]` | 下游节点 model 列表。 |

**示例**

```ts
const outgoingNodes = lf.getNodeOutgoingNode('node_1');
```
