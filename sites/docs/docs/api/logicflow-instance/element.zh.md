---
nav: API
group:
  title: LogicFlow 实例
  order: 2
title: 元素相关
toc: content
order: 4
---

本页汇总 LogicFlow 实例中面向节点与边等元素的批量操作、选择控制与属性更新方法。

### addElements

批量添加节点和边。

**签名**

```ts
addElements(data: GraphData): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `data` | [`GraphData`](../type/MainTypes.zh.md#graphdata画布数据) | 是 | 批量添加的节点与边数据。 |

**示例**

```ts
lf.addElements({
  nodes: [{ id: 'node_1', type: 'rect', x: 100, y: 100 }],
  edges: [],
});
```

### selectElementById

选中指定图形元素。

**签名**

```ts
selectElementById(id: string, multiple?: boolean, toFront?: boolean): BaseNodeModel | BaseEdgeModel
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 是 | 节点或边 ID。 |
| `multiple` | `boolean` | 否 | 是否多选；`true` 时保留已有选中项。 |
| `toFront` | `boolean` | 否 | 是否将选中元素置顶。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| `BaseNodeModel \| BaseEdgeModel` | 选中的元素 model。 |

**示例**

```ts
lf.selectElementById('node_1', true, true);
```

### deselectElementById

取消指定元素的选中状态。

**签名**

```ts
deselectElementById(id: string): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 是 | 元素 ID。 |

**示例**

```ts
lf.deselectElementById('node_1');
```

### getSelectElements

获取当前选中的所有元素数据。

**签名**

```ts
getSelectElements(isIgnoreCheck?: boolean): GraphConfigData
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `isIgnoreCheck` | `boolean` | 否 | 是否包含 source/target 未被选中的边，默认包含。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| [`GraphConfigData`](../type/MainTypes.zh.md#graphconfigdata流程图渲染数据类型) | 当前选中元素数据。 |

**示例**

```ts
lf.getSelectElements(false);
```

### clearSelectElements

取消所有元素的选中状态。

**签名**

```ts
clearSelectElements(): void
```

**示例**

```ts
lf.clearSelectElements();
```

### getModelById

按节点或边 ID 获取对应 model。

**签名**

```ts
getModelById(id: string): BaseNodeModel | BaseEdgeModel | undefined
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 是 | 节点或边 ID。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| `BaseNodeModel \| BaseEdgeModel \| undefined` | 元素 model；不存在时返回 `undefined`。 |

**示例**

```ts
lf.getModelById('node_id');
lf.getModelById('edge_id');
```

### getDataById

按节点或边 ID 获取对应数据。

**签名**

```ts
getDataById(id: string): NodeConfig | EdgeConfig | undefined
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 是 | 节点或边 ID。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| [`NodeConfig`](../type/MainTypes.zh.md#nodeconfig节点配置) \| [`EdgeConfig`](../type/MainTypes.zh.md#edgeconfig边配置) \| `undefined` | 元素数据；不存在时返回 `undefined`。 |

### deleteElement

删除节点或边元素。

**签名**

```ts
deleteElement(id: string): boolean
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 是 | 节点或边 ID。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| `boolean` | 是否删除成功。 |

**示例**

```ts
lf.deleteElement('node_id');
```

### setElementZIndex

设置元素 zIndex。

**签名**

```ts
setElementZIndex(id: string, zIndex: string | number): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 是 | 节点或边 ID。 |
| `zIndex` | `string \| number` | 是 | 可传数字或 `top` / `bottom`。 |

**示例**

```ts
lf.setElementZIndex('element_id', 'top');
```

### getAreaElement

获取指定 DOM 区域内的元素集合。

**签名**

```ts
getAreaElement(
  leftTopPoint: PointTuple,
  rightBottomPoint: PointTuple,
  wholeEdge?: boolean,
  wholeNode?: boolean,
  ignoreHideElement?: boolean
): (BaseNodeModel | BaseEdgeModel)[]
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `leftTopPoint` | `PointTuple` | 是 | 区域左上点。 |
| `rightBottomPoint` | `PointTuple` | 是 | 区域右下点。 |
| `wholeEdge` | `boolean` | 否 | 是否要求整条边都在区域内。 |
| `wholeNode` | `boolean` | 否 | 是否要求整个节点都在区域内。 |
| `ignoreHideElement` | `boolean` | 否 | 是否忽略隐藏元素。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| `(BaseNodeModel \| BaseEdgeModel)[]` | 命中区域的元素 model 列表。 |

**示例**

```ts
lf.getAreaElement([100, 100], [500, 500]);
```

### setProperties

设置节点或边的自定义属性。

**签名**

```ts
setProperties(id: string, properties: Record<string, unknown>): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 是 | 节点或边 ID。 |
| `properties` | `Record<string, unknown>` | 是 | 自定义属性对象。 |

**示例**

```ts
lf.setProperties('aF2Md2P23moN2gasd', {
  isRollbackNode: true,
});
```

### getProperties

获取节点或边的自定义属性。

**签名**

```ts
getProperties(id: string): Record<string, any>
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 是 | 节点或边 ID。 |

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| `Record<string, any>` | 自定义属性对象。 |

**示例**

```ts
lf.getProperties('id');
```

### deleteProperty

删除节点或边的指定属性键。

**签名**

```ts
deleteProperty(id: string, key: string): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 是 | 节点或边 ID。 |
| `key` | `string` | 是 | 要删除的属性键名。 |

**示例**

```ts
lf.deleteProperty('aF2Md2P23moN2gasd', 'isRollbackNode');
```

### updateAttributes

修改元素 model 属性；该方法内部调用 `graphModel` 的同名能力。

:::warning{title=注意}
此方法慎用，除非您对 LogicFlow 内部有足够了解。  
大多数情况下，请优先使用 `setProperties`、`updateText`、`changeNodeId` 等更高层方法。  
例如直接使用该方法修改节点 `id`，可能导致连接到此节点的边出现 `sourceNodeId` 无法匹配的问题。
:::

**签名**

```ts
updateAttributes(id: string, attributes: object): void
```

更多说明参考 [`graphModel.updateAttributes`](../runtime-model/graphModel.zh.md#updateattributes)。

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 是 | 元素 ID。 |
| `attributes` | `object` | 是 | 要更新的 model 属性。 |

**示例**

```ts
lf.updateAttributes('node_id_1', { radius: 4 });
```
