---
nav: API
group:
  title: LogicFlow Instance
  order: 2
title: Edit configuration
toc: content
order: 11
---

This page documents instance APIs for reading and updating edit configuration.

### updateEditConfig

Merge partial updates into the active edit configuration.

**Signature**

```ts
updateEditConfig(config: Partial<IEditConfigType>): void
```

**Parameters**

| Name    | Type | Required | Description |
| :------ | :--- | :------- | :---------- |
| `config` | [`Partial<IEditConfigType>`](../type/MainTypes.en.md#ieditconfigtype-edit-control) | Yes | Fields to update. |

**Example**

```ts
lf.updateEditConfig({
  stopZoomGraph: true,
});
```

### getEditConfig

Return the current edit configuration.

**Signature**

```ts
getEditConfig(): IEditConfigType
```

**Returns**

| Type | Description |
| :--- | :---------- |
| [`IEditConfigType`](../type/MainTypes.en.md#ieditconfigtype-edit-control) | Active configuration for this instance. |

**Example**

```ts
lf.getEditConfig();
```

Field definitions: [IEditConfigType](../type/MainTypes.en.md#ieditconfigtype-edit-control). `editConfigModel` methods: [graphModel → editConfigModel](../runtime-model/graphModel.en.md#editconfigmodel).
