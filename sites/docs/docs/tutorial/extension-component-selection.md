---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 框选 SelectionSelect
order: 5
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

# 框选 SelectionSelect

```jsx | purex | pure
import LogicFlow from "@logicflow/core";
import { SelectionSelect } from "@logicflow/extension";
import "@logicflow/extension/lib/style/index.css";

LogicFlow.use(SelectionSelect);
```

### 开启

```jsx | purex | pure
lf.openSelectionSelect();

// 1.1.0新增用法
lf.extension.selectionSelect.openSelectionSelect();
```

### 关闭

```jsx | purex | pure
lf.closeSelectionSelect();
// 1.1.0新增用法
lf.extension.selectionSelect.closeSelectionSelect();
```

<!-- <example href="/examples/#/extension/components/selection" :height="300" ></example> -->

### 默认状态

默认是否开启框选功能，受到页面是否允许拖动画布影响。画布可以拖动与选区不能同时存在。

```jsx | pure
const lf = new LogicFlow({
  container: document.querySelector("#app"),
  stopMoveGraph: true,
});
```

如果`stopMoveGraph`为 true，也就是不允许拖动画布，那么默认则可以进行框选。

如果`stopMoveGraph`不为 true, 也就是允许拖动画布，那么默认则不可以进行框选。

大多数情况下，我们期望允许拖动画布，当用户点击拖拽面板后才开启选区。请参考[拖拽面板插件](extension-component-dnd-panel)

### 设置选区灵敏度

- 默认需要框选整个节点才选中节点
- 默认需要框选边的起点、终点才选中边

可以调用插件方法`setSelectionSense`来重新设置

| 参数        | 默认值 | 描述                                   |
| ----------- | ------ | -------------------------------------- |
| isWholeEdge | true   | 是否要边的起点终点都在选区范围才算选中 |
| isWholeNode | true   | 是否要节点的全部点都在选区范围才算选中 |

用法：

```jsx | pure
lf.extension.selectionSelect.setSelectionSense(false, true);
```

### 示例

<a href="https://codesandbox.io/embed/trusting-archimedes-m0bn4r?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> 去 CodeSandbox 查看示例</a>
