# 自定义节点

## Model

### setAttributes

设置节点`model`中的各类属性。

使用示例：

```ts
setAttributes() {
  this.width = 80;
}
```

## View

### getShape

获取节点的 SVG 元素。

```ts
getShape(): h.JSX.Element
```

### getAttributes

获取节点`model`中的部分属性，其返回值为[数据属性](/api/nodeApi.md#通用属性)和[样式属性](/api/nodeApi.html#样式属性)的合集。

使用示例：

```ts
getShape() {
  const attributes = this.getAttributes();
  // ...
}
```
