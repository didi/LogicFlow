# 自定义节点

## getShape

获取连线的 SVG 元素。

```ts
getShape(): h.JSX.Element
```

## getAttributes

获取连线的属性，其返回值为[数据属性](/api/nodeApi.md#通用属性)和[样式属性](/api/nodeApi.html#样式属性)的合集。

使用示例：

```ts
getAttributes() {
  const attributes = super.getAttributes();
  return Object.assign(attributes, {});
}
```

## getConnectedSourceRules

获取节点作为开始节点（source）的校验规则。

```ts
getConnectedSourceRules(): ConnectRule[]

export type ConnectRule = {
  message: string;
  validate: (source: BaseNodeModel, target: BaseNodeModel) => boolean;
};
```

## getConnectedTargetRules

获取节点作为目标节点（target）的校验规则。

```ts
getConnectedTargetRules(): ConnectRule[]

export type ConnectRule = {
  message: string;
  validate: (source: BaseNodeModel, target: BaseNodeModel) => boolean;
};
```
