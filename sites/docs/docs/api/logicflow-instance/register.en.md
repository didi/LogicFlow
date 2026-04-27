---
nav: API
group:
  title: LogicFlow Instance
  order: 2
title: Registration
toc: content
order: 10
---

This page documents instance APIs for registering custom nodes and edges.

### register

Register a single custom node or edge type.

**Signature**

```ts
register(config: RegisterConfig): void
```

See [`RegisterConfig`](../type/MainTypes.en.md#registerconfig) for the parameter shape.

**Example**

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

Register multiple custom nodes or edges at once.

**Signature**

```ts
batchRegister(configList: RegisterConfig[]): void
```

See [`RegisterConfig`](../type/MainTypes.en.md#registerconfig).

**Example**

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

Global plugin registration: [LogicFlow.use](../logicflow-constructor/use.en.md).
