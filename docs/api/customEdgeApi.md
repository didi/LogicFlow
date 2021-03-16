# 自定义连线

## Model

## setAttributes

设置连线`model`中的属性。

使用示例：

```ts
setAttributes() {
  this.stroke = '#999999';
}
```

## View

## getShape

获取连线的 SVG 元素。

```ts
getShape(): h.JSX.Element
```

## getAttributes

获取连线`model`中的属性，其返回值为[数据属性](/api/edgeApi.md#通用属性)和[样式属性](/api/edgeApi.html#样式属性)的合集。

使用示例：

```ts
getShape() {
  const attributes = this.getAttributes();
  // ...
}
```
