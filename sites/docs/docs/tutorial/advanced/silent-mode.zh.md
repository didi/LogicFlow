---
nav: 指南
group:
  title: 进阶
  order: 2
title: 图编辑配置项
order: 5
toc: content
---

LogicFlow提供了非常多的控制图如何编辑的配置，详情见[editConfigModel](../../api/editConfigModel.zh.md)。

## 初始化

LogicFlow 支持在初始化的时候传入很多配置参数，图编辑的配置也可以在初始化的时候传入。

```tsx | pure
const lf = new LogicFlow({
  stopZoomGraph: true, // 禁止缩放
  stopScrollGraph: true, // 禁止鼠标滚动移动画布
});
```

## 更新图编辑方式

```tsx | pure
lf.updateEditConfig({
  stopZoomGraph: false,
  stopScrollGraph: false,
});
```

## 静默模式

画布的静默模式可以简单理解为“只读”模式，这种模式下，画布中的节点和边不可移动，不可进行文案修改，没有锚点。

:::info{title=提示}
静默模式只是 LogicFlow 内置的流程图编辑控制的一种快捷方式, 是多个编辑配置的集合，如果效果不满足，你可以使用这些属性编辑。
:::

```tsx | pure
// 开启静默模式
const lf = new LogicFlow({
  isSilentMode: true,
});
```

静默模式等同于：

```tsx | pure
const SilentConfig = {
  stopZoomGraph: false,
  stopScrollGraph: false,
  stopMoveGraph: false,
  adjustEdge: false,
  adjustEdgeStartAndEnd: false,
  adjustNodePosition: false,
  hideAnchors: true,
  nodeSelectedOutline: true,
  nodeTextEdit: false,
  edgeTextEdit: false,
  nodeTextDraggable: false,
  edgeTextDraggable: false,
};
// 开启静默模式
const lf = new LogicFlow({
  ...SilentConfig
});
```

<a href="https://codesandbox.io/embed/pedantic-microservice-db76o?fontsize=14&hidenavigation=1&theme=dark&view=preview"> 去 CodeSandbox 查看示例</a>
