---
nav: 指南
group:
  title: 基础
  order: 1
title: 实例与图数据
order: 0
toc: content
---

这页回答两个基础问题：**如何创建 LogicFlow 实例**，以及**传给 `render` 的图数据长什么样**。

::::info{title=阅读提示}
- 如果你只想先把第一个示例跑通，请先看 [快速上手](../get-started.zh.md)
- 如果你已经跑通过最小示例，这一页会补上实例、初始化配置和 `graphData` 的基础认知
::::

LogicFlow 实例的定位是作为流程图设计和管理的核心对象。它负责初始化、渲染、操作和管理流程图中的所有元素，包括节点和边。
使用 LogicFlow 实例，开发者可以方便地创建和操作流程图，实现复杂的业务逻辑和交互功能。

## 创建实例

一个流程设计界面，就是一个LogicFlow的实例。要创建一个实例我们只需要`new LogicFlow`一下，就像这样：

<iframe src="/initialized-demo.html" style="border: none; width: 100%; height: 400px; margin: auto;"></iframe>

```html
<style>
  #container {
    width: 1000px;
    height: 500px
  }
</style>

<div id="container"></div>
```

```js
const lf = new LogicFlow({
  container: document.querySelector('#container')
});
```

:::info{title=Tip}
为了统一术语，我们后面统一在代码层面将`LogicFlow`
的实例写作`lf`。
:::

当创建一个实例的时候，我们需要传递初始化 LogicFlow 实例的配置项。LogicFlow 支持非常丰富的初始化配置项，但 **container**（用于挂载画布的 DOM 节点）是唯一必填项。有关完整的配置项，请参阅 [初始化选项](../../api/logicflow-constructor/index.zh.md)。

## 图数据

在LogicFlow里面，我们把流程图看做是由节点和边组成的图。因此我们采用如下数据结构来表示LogicFlow的图数据：
```json
{
  nodes: [ // 节点数据
    {
      id, // 节点ID，可选参数，不传时内部会自动生成
      type, // 节点类型，必传，可以是LogicFlow内置的基础类型，也可以是用户自定义的类型
      x, // 节点x坐标，必传
      y, // 节点y坐标，必传
      text, // 节点文本，可选参数
      properties, // 自定义属性
      // ...其他属性
    }
  ],
  edges: [ // 边数据
    {
      id, // 边ID，可选参数，不传时内部会自动生成
      type, // 边类型，必传，可以是LogicFlow内置的基础类型，也可以是用户自定义的类型
      sourceNodeId, // 起始节点ID，必传
      targetNodeId, // 目标节点ID，必传
      // ...其他属性
    }
  ],
}
```

**`nodes`**: 包含所有要渲染的节点，完整的字段配置项见 [类型导览](../../api/type/index.zh.md)

**`edges`**: 包含所有要渲染的边，通过起始 `sourceNodeId` 和 `targetNodeId`
将两个节点相连。完整的字段配置项见 [类型导览](../../api/type/index.zh.md)

当图数据传入 LogicFlow 实例后，系统会为每个节点和边分别创建对应的数据模型：`nodeModel` 和 `edgeModel`，它用于管理节点的相关数据和行为，包括节点的属性、状态、交互逻辑以及与其他节点和边的关系，每个节点和边的实际表现（例如位置、样式等）都由对应的 model 来定义并控制。更多信息详见 [NodeModel](../../api/runtime-model/nodeModel.zh.md)、[EdgeModel](../../api/runtime-model/edgeModel.zh.md)

## 图渲染

接着只需要传入一个遵循格式的数据给`render`方法执行就可以渲染出图了。

```js
lf.render(graphData)
```

下面是一个图数据渲染的例子，从例子中你能看到实际图数据是如何定义和传递给实例的：
<code id="graphData" src="../../../src/tutorial/basic/instance/graphData"></code>

当然，除了渲染外 LogicFlow 还对外提供了很多 API 以支持开发者调用。建议先从 [API 导览](../../api/logicflow-instance/index.zh.md) 了解能力分组，再按需进入 [完整方法参考](../../api/logicflow-instance/index.zh.md)。

## 下一步阅读

1. [主题](theme.zh.md)：统一调整节点、边和文本样式
2. [事件](event.zh.md)：监听画布、节点和边的交互
3. [节点](node.zh.md) / [边](edge.zh.md)：开始进入业务自定义