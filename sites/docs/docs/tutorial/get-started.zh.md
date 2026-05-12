---
nav: 指南
group:
  title: 介绍
title: 快速上手
order: 1
toc: content
---

这页只回答一个问题：**我怎样在几分钟内把 LogicFlow 跑起来，并知道下一步该看什么。**

::::info{title=本页适合谁读}
- 第一次接触 LogicFlow，想先跑通一个最小示例
- 想先理解 `new LogicFlow(...)` 和 `lf.render(...)` 的最基本用法

本页不展开插件、数据适配、框架集成和复杂自定义；这些内容请在跑通后按文末推荐顺序继续阅读。
::::

## 你将完成什么

完成本页后，你会得到一个最小可运行的 LogicFlow 画布，并理解三件事：

1. 如何安装依赖
2. 如何创建 `LogicFlow` 实例
3. 如何通过 `lf.render(graphData)` 渲染一张图

## 安装

推荐使用包管理器安装 `@logicflow/core`。只有在你准备使用现成插件时，才需要额外安装 `@logicflow/extension`。

:::code-group

```bash [npm]
npm install @logicflow/core --save

# 需要插件时再安装
npm install @logicflow/extension --save
```

```bash [yarn]
yarn add @logicflow/core

# 需要插件时再安装
yarn add @logicflow/extension
```

```bash [pnpm]
pnpm add @logicflow/core

# 需要插件时再安装
pnpm add @logicflow/extension
```

::::

如果你在无构建工具的场景下接入，也可以使用 CDN，但第一次上手更推荐先从包管理器方式开始。

如果你使用 AI 编程工具，可以阅读 [AI 编程支持](ai.zh.md)，把 LogicFlow 的本地文档位置和官方能力优先规则提供给 Agent。

## 最小示例

先准备一个挂载容器：

:::code-group

```html [HTML]
<div id="container"></div>
```

```css [CSS]
#container {
  width: 100%;
  height: 480px;
}
```

::::

然后初始化一个实例并渲染最小图数据：

```ts
import LogicFlow from '@logicflow/core'
import '@logicflow/core/es/index.css'

const lf = new LogicFlow({
  container: document.querySelector('#container') as HTMLDivElement,
  grid: true,
})

lf.render({
  nodes: [
    {
      id: 'node_1',
      type: 'rect',
      x: 200,
      y: 160,
      text: '开始使用 LogicFlow',
    },
  ],
  edges: [],
})
```

如果你使用 React、Vue 或其他框架，本质上仍然是同样的初始化过程，只是把 `container` 换成对应的挂载节点。

## `graphData` 是什么

`lf.render(...)` 接收的核心数据结构叫 `graphData`。它由 `nodes` 和 `edges` 两部分组成：

```ts
const graphData = {
  nodes: [
    {
      id: 'node_1',
      type: 'rect',
      x: 200,
      y: 160,
      text: '节点 1',
    },
  ],
  edges: [],
}
```

- `nodes` 表示节点数组
- `edges` 表示边数组
- 更完整的类型说明可以查看 [类型导览](../api/type/index.zh.md)

如果你想继续理解 `LogicFlow` 实例本身、初始化选项和图数据字段，下一篇建议阅读 [实例与图数据](basic/class.zh.md)。

## 下一步阅读

跑通最小示例后，推荐按这个顺序继续：

1. [实例与图数据](basic/class.zh.md)：理解 `LogicFlow` 实例、`graphData` 和 `render`
2. [主题](basic/theme.zh.md) / [事件](basic/event.zh.md)：掌握样式和交互监听
3. [节点](basic/node.zh.md) / [边](basic/edge.zh.md)：开始进入真正的业务建模
4. [插件简介](extension/intro.zh.md)：按目标选择现成插件
5. [API 导览](../api/logicflow-instance/index.zh.md)：需要精确查参数时再进入参考文档
