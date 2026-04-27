---
nav: API
group:
  title: LogicFlow 实例
  order: 2
title: 注册
toc: content
order: 10
---

本页汇总 LogicFlow 实例中与自定义节点/边注册相关的方法。

### register

注册单个自定义节点或边。

**签名**

```ts
register(config: RegisterConfig): void
```

参数类型见 [`RegisterConfig`](../type/MainTypes.zh.md#registerconfig注册配置)。

**示例**

```ts
import { RectNode, RectNodeModel } from '@logicflow/core';

class CustomRectNode extends RectNode {}

class CustomRectModel extends RectNodeModel {
  setAttributes() {
    this.width = 200;
    this.height = 80;
    this.radius = 50;
  }
}

lf.register({
  type: 'custom-rect',
  view: CustomRectNode,
  model: CustomRectModel,
});
```

### batchRegister

批量注册多个自定义节点或边。

**签名**

```ts
batchRegister(configList: RegisterConfig[]): void
```

参数类型见 [`RegisterConfig`](../type/MainTypes.zh.md#registerconfig注册配置)。

**示例**

```ts
lf.batchRegister([
  {
    type: 'user',
    view: UserNode,
    model: UserModel,
  },
  {
    type: 'user1',
    view: UserNode1,
    model: UserModel1,
  },
]);
```

插件全局注册见 [LogicFlow.use](../logicflow-constructor/use.zh.md)。
