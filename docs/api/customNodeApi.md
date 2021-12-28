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

