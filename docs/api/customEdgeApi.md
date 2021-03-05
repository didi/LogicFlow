# 自定义连线

## getShape

获取连线的 SVG 元素。

```ts
getShape(): h.JSX.Element
```

## getAttributes

获取连线的属性，其返回值为[数据属性](/api/edgeApi.md#通用属性)和[样式属性](/api/edgeApi.html#样式属性)的合集。

使用示例：

```ts
getAttributes() {
  const attributes = super.getAttributes();
  return Object.assign(attributes, {});
}
```

## getArrowStyle

获取连线的[箭头属性](/api/edgeApi.html#箭头属性)。

使用示例：

```ts
getArrowStyle() {
  const style = super.getArrowStyle();
  style.fill = "transparent";
  return style;
}
```
