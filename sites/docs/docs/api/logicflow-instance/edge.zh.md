---
nav: API
group:
  title: LogicFlow 实例
  order: 2
title: 边相关
toc: content
order: 3
---

本页汇总 LogicFlow 实例中与边的创建、查询、修改和删除相关的方法。

### setDefaultEdgeType

设置默认边类型（用于用户手动连线时的新边类型）。

**签名**

```ts
setDefaultEdgeType(type: string): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `type` | `string` | 是 | 默认边类型，例如 `line` / `polyline` / `bezier`。 |

**示例**

```ts
lf.setDefaultEdgeType('line');
```

### addEdge

创建连接两个节点的边。

**签名**

```ts
addEdge(edgeConfig: EdgeConfig): BaseEdgeModel
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `edgeConfig` | [`EdgeConfig`](../type/MainTypes.zh.md#edgeconfig边配置) | 是 | 边配置。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| `BaseEdgeModel` | 新增边的 model 实例。 |

**示例**

```ts
lf.addEdge({
  sourceNodeId: '10',
  targetNodeId: '21',
  text: '边文案',
});
```

### getEdgeDataById

通过 ID 获取边的数据。

**签名**

```ts
getEdgeDataById(edgeId: string): EdgeConfig | undefined
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `edgeId` | `string` | 是 | 边 ID。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| [`EdgeConfig`](../type/MainTypes.zh.md#edgeconfig边配置) \| `undefined` | 边数据；不存在时返回 `undefined`。 |

**示例**

```ts
lf.getEdgeDataById('edge_1');
```

### getEdgeModelById

通过 ID 获取边的 model。

**签名**

```ts
getEdgeModelById(edgeId: string): BaseEdgeModel | undefined
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `edgeId` | `string` | 是 | 边 ID。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| `BaseEdgeModel \| undefined` | 边 model；不存在时返回 `undefined`。 |

**示例**

```ts
lf.getEdgeModelById('edge_1');
```

### getEdgeModels

按过滤条件获取边 model 列表。

**签名**

```ts
getEdgeModels(edgeFilter: EdgeFilter): BaseEdgeModel[]
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `edgeFilter` | [`EdgeFilter`](../type/MainTypes.zh.md#edgeconfig边配置) | 是 | 边过滤条件。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| `BaseEdgeModel[]` | 满足条件的边 model 列表。 |

**示例**

```ts
lf.getEdgeModels({
  sourceNodeId: 'nodeA_id',
  targetNodeId: 'nodeB_id',
});
```

### changeEdgeId

修改边 ID；若不传新 ID，会自动生成一个唯一 ID。

**签名**

```ts
changeEdgeId(oldId: string, newId?: string): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `oldId` | `string` | 是 | 当前边 ID。 |
| `newId` | `string` | 否 | 新边 ID。 |

**示例**

```ts
lf.changeEdgeId('oldId', 'newId');
```

### changeEdgeType

切换边类型。

**签名**

```ts
changeEdgeType(edgeId: string, type: string): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `edgeId` | `string` | 是 | 边 ID。 |
| `type` | `string` | 是 | 新边类型。 |

**示例**

```ts
lf.changeEdgeType('edgeId', 'bezier');
```

### deleteEdge

按边 ID 删除边。

**签名**

```ts
deleteEdge(id: string): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 是 | 边 ID。 |

**示例**

```ts
lf.deleteEdge('edge_1');
```

### deleteEdgeByNodeId

按起点/终点节点过滤删除边。

**签名**

```ts
deleteEdgeByNodeId(config: EdgeFilter): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `config` | [`EdgeFilter`](../type/MainTypes.zh.md#edgeconfig边配置) | 是 | 起点/终点过滤条件。 |

**示例**

```ts
lf.deleteEdgeByNodeId({
  sourceNodeId: 'id1',
  targetNodeId: 'id2',
});
```

### getNodeEdges

获取节点关联的所有边 model。

**签名**

```ts
getNodeEdges(id: string): BaseEdgeModel[]
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 是 | 节点 ID。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| `BaseEdgeModel[]` | 节点关联边的 model 列表。 |

**示例**

```ts
const edgeModels = lf.getNodeEdges('node_id');
```
