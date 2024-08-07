---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 框选 (SelectionSelect)
order: 5
toc: content
tag: 优化
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

LogicFlow 的框选插件允许用户通过拖动鼠标绘制矩形框来选择多个图形元素，方便进行批量操作或编辑。

## 演示

<code id="react-portal" src="@/src/tutorial/extension/selection-select"></code>

## 使用

### 注册

两种注册方式，全局注册和局部注册，区别是全局注册每一个 `lf` 实例都可以使用。

```tsx | pure
import LogicFlow from "@logicflow/core";
import { SelectionSelect } from "@logicflow/extension";

// 全局注册
LogicFlow.use(SelectionSelect);

// 局部注册
const lf = new LogicFlow({
  ...config,
  plugins: [SelectionSelect]
});

```

## API

### openSelectionSelect

开启框选。

```tsx | pure

lf.openSelectionSelect();

// 1.1.0新增用法
lf.extension.selectionSelect.openSelectionSelect();

```

### closeSelectionSelect

关闭框选。

```tsx  | pure

lf.closeSelectionSelect()

// 1.1.0新增用法
lf.extension.selectionSelect.closeSelectionSelect()

```

### setSelectionSense

设置选区灵敏度。

- 默认需要框选整个节点才选中节点
- 默认需要框选边的起点、终点才选中边

可以调用插件方法`setSelectionSense`来重新设置

| 参数          | 默认值  | 描述                  |
|-------------|------|---------------------|
| isWholeEdge | true | 是否要边的起点终点都在选区范围才算选中 |
| isWholeNode | true | 是否要节点的全部点都在选区范围才算选中 |

用法：

```tsx | pure
lf.extension.selectionSelect.setSelectionSense(false, true);
```

## 默认状态

默认是否开启框选功能，受到页面是否允许拖动画布影响。画布可以拖动与选区不能同时存在。

```tsx | pure
const lf = new LogicFlow({
  container: document.querySelector("#app"),
  stopMoveGraph: true,
});
```

如果`stopMoveGraph`为 true，也就是不允许拖动画布，那么默认则可以进行框选。

如果`stopMoveGraph`不为 true, 也就是允许拖动画布，那么默认则不可以进行框选。

大多数情况下，我们期望允许拖动画布，当用户点击拖拽面板后才开启选区。请参考[拖拽面板插件](dnd-panel.zh.md)