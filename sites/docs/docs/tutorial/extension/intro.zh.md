---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 插件简介
order: 0
toc: content
---

> LogicFlow最初的目标就是支持一个扩展性强的流程绘制工具，用来满足各种业务需求。为了让LogicFlow的拓展性足够强，LogicFlow将所有的非核心功能都使用插件的方式开发。
>
> 常见产品功能通常由 `@logicflow/extension` 提供，自动布局能力由 `@logicflow/layout` 提供。两类能力的使用文档都放在插件教程分组中。

::::info{title=这页适合谁读}
- 你已经知道如何创建 `LogicFlow` 实例，现在想按目标挑选现成插件
- 你想知道全局安装插件和实例级安装插件有什么区别

如果你还没有跑通过最小示例，建议先看 [快速上手](../get-started.zh.md)。
::::

## 插件地图

可以先按目标选择，而不是逐个翻插件文件：

- 编辑体验增强：控制面板、右键菜单、选区、多选等
- 节点/边能力增强：节点缩放、分组、泳道、曲线边等
- 数据导入导出：adapter、BPMN 相关能力
- 布局与导出：自动布局、画布辅助能力
- 领域方案：BPMN 元素和配套能力

## 使用指南

`@logicflow/extension`包中提供一些开箱即用的组件，快速支持产品中常见的功能，如控制面板、右键菜单等。

```tsx | pure
import LogicFlow from '@logicflow/core'
import { Control, Menu, DndPanel } from '@logicflow/extension'
import '@logicflow/extension/lib/style/index.css'

LogicFlow.use(Control) // 控制面板
LogicFlow.use(Menu) // 右键菜单
LogicFlow.use(DndPanel) // 拖拽面板
```

### 安装全局插件

npm方式

```tsx | pure
import { BpmnElement } from '@logicflow/extension';

LogicFlow.use(BpmnElement);
```

cdn方式

```tsx
<!--LogicFlow core包css-->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/style/index.css" />
<!--LogicFlow extension包css-->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.css" />
<!--LogicFlow core包js-->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/logic-flow.js"></script>
<!--LogicFlow的插件支持单个引入，这里以菜单插件为例-->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/Menu.js"></script>
<script>
  LogicFlow.use(Menu); </script>
```

### 安装插件到实例上

`v1.0.7` 新增

当一个单页面应用存在多个使用LogicFlow的页面时，不同的页面使用的插件可能不一样。LogicFlow初始化的时候，将插件作为参数传入到构造函数中，此时插件会覆盖全局的插件。

```tsx | pure
import LogicFlow from "@logicflow/core";
import { DndPanel, SelectionSelect } from "@logicflow/extension";
import "@logicflow/core/lib/style/index.css";
// import "@logicflow/core/dist/style/index.css"; // 2.0版本前的引入方式
import "@logicflow/extension/lib/style/index.css";

const lf = new LogicFlow({
  container: document.querySelector("#app"),
  grid: true,
  plugins: [DndPanel, SelectionSelect]
});
```

## 下一步阅读

1. 已经知道要用哪个插件：直接进入对应插件页面
2. 想先理解实例和插件关系：查看 [API 导览](../../api/logicflow-instance/index.zh.md) 中的“插件系统”
3. 想继续自定义节点或边：回到 [进阶节点](../advanced/node.zh.md) / [进阶-边](../advanced/edge.zh.md)
