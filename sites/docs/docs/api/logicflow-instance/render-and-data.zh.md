---
nav: API
group:
  title: LogicFlow 实例
  order: 2
title: 渲染与数据
toc: content
order: 1
---

本页聚焦 LogicFlow 实例的渲染入口、图数据读写与数据适配器接口。

### render

渲染图数据；当配置了 `adapterIn` 时，会先转换为 LogicFlow 标准数据再渲染。

**签名**

```ts
render(graphData: unknown): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `graphData` | `unknown` | 是 | 图数据，格式取决于是否配置了 `adapterIn`。 |

**示例**

```ts
// 直接渲染 LogicFlow 标准格式
lf.render({
  nodes: [{ id: 'node_1', type: 'rect', x: 120, y: 100 }],
  edges: [],
});
```

### renderRawData

渲染 LogicFlow 原生图数据，不经过 `adapterIn` 转换。

**签名**

```ts
renderRawData(graphData: GraphData): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `graphData` | [`GraphData`](../type/MainTypes.zh.md#graphdata画布数据) | 是 | LogicFlow 原生图数据。 |

**示例**

```ts
lf.renderRawData({
  nodes: [{ id: 'node_1', type: 'rect', x: 120, y: 100 }],
  edges: [],
});
```

### getGraphData

获取当前图数据；当配置了 `adapterOut` 时，返回值会先经过适配器转换。

**签名**

```ts
getGraphData(...params: any[]): GraphConfigData | unknown
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `...params` | `any[]` | 否 | 透传给 `adapterOut` 的额外参数。 |

**返回值**

- 未配置 `adapterOut`：返回 [`GraphConfigData`](../type/MainTypes.zh.md#graphconfigdata流程图渲染数据类型)。
- 已配置 `adapterOut`：返回适配后的业务数据（`unknown`）。

**示例**

```ts
const data = lf.getGraphData(['property1', 'property2']);
```

### getGraphRawData

获取当前图的 LogicFlow 原生数据，不受 `adapterOut` 影响。

**签名**

```ts
getGraphRawData(): GraphData
```

**返回值**

- [`GraphData`](../type/MainTypes.zh.md#graphdata画布数据)

**示例**

```ts
const rawData = lf.getGraphRawData();
console.log(rawData.nodes, rawData.edges);
```

### clearData

清空当前画布中的全部节点和边数据。

**签名**

```ts
clearData(): void
```

**示例**

```ts
lf.clearData();
```

### adapterIn

自定义输入数据适配函数，用于在 `render` 前把业务数据转换为 LogicFlow 原生数据。

**签名**

```ts
adapterIn?: (data: unknown) => GraphData
```

**返回值**

- [`GraphData`](../type/MainTypes.zh.md#graphdata画布数据)

**示例**

```ts
lf.adapterIn = (bizData) => {
  // 将业务结构转换成 nodes / edges
  return {
    nodes: [],
    edges: [],
  };
};
```

### adapterOut

自定义输出数据适配函数，用于在 `getGraphData` 时把 LogicFlow 原生数据转换为业务数据。

**签名**

```ts
adapterOut?: (data: GraphConfigData, ...params: any[]) => unknown
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `data` | [`GraphConfigData`](../type/MainTypes.zh.md#graphconfigdata流程图渲染数据类型) | 是 | 当前图数据。 |
| `...params` | `any[]` | 否 | 来自 `getGraphData(...params)` 的透传参数。 |

**示例**

```ts
lf.adapterOut = (data, reserveFields = []) => {
  return {
    processNodes: data.nodes,
    processEdges: data.edges,
    reserveFields,
  };
};
```
