---
nav: API
group:
  title: LogicFlow 实例
  order: 2
title: 文本编辑
toc: content
order: 5
---

本页汇总 LogicFlow 实例中与节点/边文本编辑相关的方法。

### editText

显示节点、连线文本编辑框，进入编辑状态。

**签名**

```ts
editText(id: string): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 是 | 节点或边 ID。 |

**示例**

```ts
lf.editText('node_1');
```

:::info{title=注意}
当初始化 `lf` 实例时设置了文本不可编辑，LogicFlow 内部不会自动监听并取消元素编辑状态。此时需要自行监听并通过 `setElementState` 取消文本编辑状态。
:::

### updateText

更新节点或边的文本内容。

**签名**

```ts
updateText(id: string, value: string): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 是 | 节点或边 ID。 |
| `value` | `string` | 是 | 更新后的文本值。 |

**示例**

```ts
lf.updateText('id', 'value');
```
