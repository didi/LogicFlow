---
nav: API
group:
  title: LogicFlow 实例
  order: 2
title: 编辑控制
toc: content
order: 11
---

本页汇总 LogicFlow 实例中与编辑配置读写相关的方法。

### updateEditConfig

更新流程编辑基础配置。

**签名**

```ts
updateEditConfig(config: Partial<IEditConfigType>): void
```

**参数**

| 名称 | 类型 | 必传 | 说明 |
| :--- | :--- | :--- | :--- |
| `config` | [`Partial<IEditConfigType>`](../type/MainTypes.zh.md#ieditconfigtype编辑控制配置) | 是 | 需要更新的编辑控制配置。 |

**示例**

```ts
lf.updateEditConfig({
  stopZoomGraph: true,
});
```

### getEditConfig

获取当前流程编辑基础配置。

**签名**

```ts
getEditConfig(): IEditConfigType
```

**返回值**

| 类型 | 说明 |
| :--- | :--- |
| [`IEditConfigType`](../type/MainTypes.zh.md#ieditconfigtype编辑控制配置) | 当前实例生效的编辑控制配置。 |

**示例**

```ts
lf.getEditConfig();
```

配置字段说明见 [IEditConfigType](../type/MainTypes.zh.md#ieditconfigtype编辑控制配置)。`editConfigModel` 的方法与模型说明见 [graphModel → editConfigModel](../runtime-model/graphModel.zh.md#editconfigmodel)。
