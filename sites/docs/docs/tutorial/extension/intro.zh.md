---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 插件简介
order: 0
toc: content
---

> LogicFlow最初的目标就是支持一个扩展性强的流程绘制工具，用来满足各种业务需求。为了让LogicFlow的拓展性足够强，LogicFlow将所有的非核心功能都使用插件的方式开发，然后将这些插件放到`@logicflow/extension`包中。

## 使用指南

`@logicflow/extension`包中提供一些开箱即用的组件，快速支持产品中常见的功能，如控制面板、右键菜单等。

```tsx | purex | pure
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
