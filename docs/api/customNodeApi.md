# 自定义节点

## getShape

获取节点的 SVG 元素。

```ts
getShape(): h.JSX.Element
```

## getShapeStyle

获取节点的[样式属性](/api/nodeApi.html#样式属性)。

使用示例：

```ts
getShapeStyle() {
  const style = super.getShapeStyle();
  return Object.assign(style, {});
}
```

## getAttributes

获取节点的属性，其返回值为[数据属性](/api/nodeApi.md#通用属性)和[样式属性](/api/nodeApi.html#样式属性)的合集。

使用示例：

```ts
getAttributes() {
  const attributes = super.getAttributes();
  return Object.assign(attributes, {});
}
```

## setAttributes

设置节点`model`中的属性。

使用示例：

```ts
setAttributes() {
  this.width = 80;
}
```
