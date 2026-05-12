---
nav: API
group:
  title: LogicFlow Instance
  order: 2
title: Rendering and data
toc: content
order: 1
---

This page covers rendering entry points, reading and writing graph data, and adapter hooks on the LogicFlow instance.

### render

Render graph data. When `adapterIn` is configured, incoming data is converted to LogicFlow’s internal shape first.

**Signature**

```ts
render(graphData: unknown): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `graphData` | `unknown` | Yes | Graph payload; shape depends on `adapterIn`. |

**Example**

```ts
lf.render({
  nodes: [{ id: 'node_1', type: 'rect', x: 120, y: 100 }],
  edges: [],
});
```

### renderRawData

Render native LogicFlow graph data without running `adapterIn`.

**Signature**

```ts
renderRawData(graphData: GraphData): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `graphData` | [`GraphData`](../type/MainTypes.en.md#graphdata) | Yes | Native LogicFlow graph data. |

**Example**

```ts
lf.renderRawData({
  nodes: [{ id: 'node_1', type: 'rect', x: 120, y: 100 }],
  edges: [],
});
```

### getGraphData

Return the current graph. When `adapterOut` is set, the result is passed through that adapter.

**Signature**

```ts
getGraphData(...params: any[]): GraphConfigData | unknown
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `...params` | `any[]` | No | Extra arguments forwarded to `adapterOut`. |

**Returns**

- Without `adapterOut`: [`GraphConfigData`](../type/MainTypes.en.md#graphconfigdata).
- With `adapterOut`: your business shape (`unknown`).

**Example**

```ts
const data = lf.getGraphData(['property1', 'property2']);
```

### getGraphRawData

Return native LogicFlow data, ignoring `adapterOut`.

**Signature**

```ts
getGraphRawData(): GraphData
```

**Returns**

- [`GraphData`](../type/MainTypes.en.md#graphdata)

**Example**

```ts
const rawData = lf.getGraphRawData();
console.log(rawData.nodes, rawData.edges);
```

### clearData

Remove every node and edge from the canvas.

**Signature**

```ts
clearData(): void
```

**Example**

```ts
lf.clearData();
```

### adapterIn

Optional inbound adapter: convert business data to LogicFlow graph data before `render`.

**Signature**

```ts
adapterIn?: (data: unknown) => GraphData
```

**Returns**

- [`GraphData`](../type/MainTypes.en.md#graphdata)

**Example**

```ts
lf.adapterIn = (bizData) => {
  return {
    nodes: [],
    edges: [],
  };
};
```

### adapterOut

Optional outbound adapter: convert LogicFlow graph data when `getGraphData` runs.

**Signature**

```ts
adapterOut?: (data: GraphConfigData, ...params: any[]) => unknown
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `data` | [`GraphConfigData`](../type/MainTypes.en.md#graphconfigdata) | Yes | Current graph data. |
| `...params` | `any[]` | No | Same extras passed to `getGraphData`. |

**Example**

```ts
lf.adapterOut = (data, reserveFields = []) => {
  return {
    processNodes: data.nodes,
    processEdges: data.edges,
    reserveFields,
  };
};
```
