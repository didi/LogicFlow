---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 框选 (SelectionSelect)
order: 5
toc: content
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

LogicFlow 的框选插件允许用户通过拖动鼠标绘制矩形框来选择多个图形元素，方便进行批量操作或编辑。


## 演示

<code id="react-portal" src="@/src/tutorial/extension/selection-select"></code>

## 更新

### 框选独占模式
在<Badge>2.0.13</Badge>版本新增了框选独占模式，开启后用户只能做框选动作，相对的用户可以分批框选多个元素，已框选的元素二次框选会被取消选中。
用户可以通过在创建实例时通过传入`exclusiveMode`参数用来设置是否默认开启独占框选模式
``` ts
const lf = new LogicFlow({
  // ...config, // 其他配置
  plugins: [SelectionSelect],
  pluginsOptions: {
    selectionSelect: {
      exclusiveMode: false,
    },
  },
});
```
也可以通过调用下方的[`toggleExclusiveMode`](#setleexclusivemode)方法动态修改独占模式的启用状态

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

注册插件后，插件会在初始化时增加下述方法：

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

| 参数        | 默认值 | 描述                                   |
| ----------- | ------ | -------------------------------------- |
| isWholeEdge | true   | 是否要边的起点终点都在选区范围才算选中 |
| isWholeNode | true   | 是否要节点的全部点都在选区范围才算选中 |

用法：

```tsx | pure
lf.extension.selectionSelect.setSelectionSense(false, true);
```

### setleExclusiveMode

设置框选独占模式的启用状态

- 默认不启用独占模式

可以调用插件方法`setSelectionSense`来重新设置

| 参数   | 默认值 | 描述             |
| ------ | ------ | ---------------- |
| status | false  | 是否启用独占模式 |

用法：

```tsx | pure
lf.setSelectionSelectMode(true)

lf.extension.selectionSelect.setleExclusiveMode(true);
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