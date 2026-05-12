---
nav: API
group:
  title: LogicFlow Instance
  order: 2
title: Text editing
toc: content
order: 5
---

This page documents instance APIs related to node and edge text editing.

### editText

Open the text editor for a node or edge.

**Signature**

```ts
editText(id: string): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Node or edge id. |

**Example**

```ts
lf.editText('node_1');
```

:::info{title=Note}
If text editing was disabled at initialization, LogicFlow does not automatically clear edit state. Listen for the relevant events and call `setElementState` yourself to leave edit mode.
:::

### updateText

Update the text value of a node or edge.

**Signature**

```ts
updateText(id: string, value: string): void
```

**Parameters**

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Node or edge id. |
| `value` | `string` | Yes | New text content. |

**Example**

```ts
lf.updateText('id', 'value');
```
