---
nav: 指南
group:
  title: 介绍
title: 快速上手
order: 1
toc: content
---

## 安装

- 命令安装：通过使用 npm、yarn、pnpm 进行安装。

:::code-group

```bash [npm]
npm install @logicflow/core --save

# 插件包（不使用插件时不需要引入）
npm install @logicflow/extension --save

```

```bash [yarn]
yarn add @logicflow/core

# 插件包（不使用插件时不需要引入）
yarn add @logicflow/extension
```

```bash [pnpm]
pnpm add @logicflow/core

# 插件包（不使用插件时不需要引入）
pnpm add @logicflow/extension
```

:::

- 直接用`<script>`引入

  由于LogicFlow本身会有一些预置样式，所以除了需要引入js, 还`需要引入css`。

```html | pure
<!-- 引入 core包 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core@latest/dist/index.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core@latest/lib/style/index.min.css" rel="stylesheet">

<!--  引入 extension包 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension@latest/dist/index.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension@latest/lib/style/index.min.css" />

```

当前引入的版本是最新版本，其他版本请查看：<a href="https://www.jsdelivr.com/package/npm/@logicflow/core" target="_blank">
core包</a>、<a href="https://www.jsdelivr.com/package/npm/@logicflow/extension" target="_blank">
entension包</a>

## 开始使用

### 1. 直接`<script>`使用

```html | pure
<!-- 引入 core包 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core@latest-beta.2/dist/index.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core@latest-beta.2/lib/style/index.min.css" rel="stylesheet">

<!-- 创建画布容器 -->
<div id="container"></div>

<script>
// 准备图数据
const data = {
  // 节点
  nodes: [
    {
      id: '21',
      type: 'rect',
      x: 100,
      y: 200,
      text: 'rect node',
    },
    {
      id: '50',
      type: 'circle',
      x: 300,
      y: 400,
      text: 'circle node',
    },
  ],
  // 边
  edges: [
    {
      type: 'polyline',
      sourceNodeId: '50',
      targetNodeId: '21',
    },
  ],
}
// 创建画布实例
const lf = new Core.default({
  container: document.querySelector('#container'),
  width: 700,
  height: 500,
  grid: true,
})

// 渲染画布实例
lf.render(data)
</script>
```

### 2. React 框架中使用

LogicFlow 本身是以 umd 打包为纯 JS 的包，所以不论是 vue 还是 react 中都可以使用。这里需要注意一个点，那就是初始化
LogicFlow 实例的时候，传入的参数 container,必须要 dom 上存在这个节点，不然会报错请检查 container
参数是否有效。

<code id="use-in-react" src="../../src/tutorial/get-started/use-in-react"></code>

### 3. Vue 框架中使用

```vue

<template>
  <div class="container" ref="container"></div>
</template>

<script>
  import LogicFlow from "@logicflow/core";
  import "@logicflow/core/dist/style/index.css";

  export default {
    mounted() {
      this.lf = new LogicFlow({
        container: this.$refs.container,
        grid: true,
      });
      this.lf.render();
    },
  };
</script>

<style scoped>
  .container {
    width: 1000px;
    height: 500px;
  }
</style>

```

:::warning{title=注意}
LogicFlow支持初始化不传容器宽高参数，这个时候默认会使用container的宽高。请保证初始化LogicFlow的时候，container已经存在宽高了。
:::

### 4. 使用插件

LogicFlow
最初的目标就是支持一个扩展性强的流程绘制工具，用来满足各种业务需求。为了让LogicFlow的拓展性足够强，LogicFlow将所有的非核心功能都使用插件的方式开发，然后将这些插件放到`@logicflow/extension`
包中。

如下使用了控制面板插件功能，提供了放大缩小或者自适应画布的能力，同时也内置了 `redo` 和 `undo` 的功能，

引入：

```js
import LogicFlow from "@logicflow/core";
import { Control } from "@logicflow/extension";

// 全局使用 每一个lf实例都具备 Control
LogicFlow.use(Control);
```

示例：

<code id="use-plugin" src="../../src/tutorial/get-started/use-plugin"></code>

想要发现更多插件功能，请看[插件简介](extension/intro.zh.md)。

### 5. 数据转换

在某些情况下，LogicFlow 生成的数据格式可能不满足业务需要的格式。比如后端需要的数据格式是 bpmn-js
生成的格式，那么可以使用数据转换工具，将 LogicFlow 生成的数据转换为 bpmn-js 生成的数据。

```tsx | pure

// 这里把userData转换为LogicFlow支持的格式
lf.adapterIn = function(userData: unknown): LogicFlow.GraphData {
  // ...
  return logicFlowData
}

// 这里把LogicFlow生成的数据转换为用户需要的格式。
lf.adapterOut = function(logicFlowData: LogicFlow.GraphData): unknown {
  // ...
  return userData
}

// 这时可以直接使用userData，内部会调用adapterIn 
lf.render(userData)

// 可以直接获取userData， 内部会调用adapterOut
lf.getGraphData()
```

自定义数据转换工具本质上是将用户传入的数据，通过一个`lf.adapterIn`方法，将其转换为 LogicFlow
可以识别的格式。然后在生成数据的时候，又通过`lf.adapterOut`方法将 LogicFlow
的数据转换为用户传入的数据。所以自定义数据转换工具我们只需要重新覆盖这两个方法即可。

当然，我们也可以在`render`传入时手动处理非LogicFlow支持的数据格式，在获取`getGraphData`
的时候再手动转为我们想要的其他数据格式。

想要深入更多数据转换功能，请看[数据转换](extension/adapter.zh.md)。

我们的演示 demo 就到这里了，想继续了解 Logicflow 的一些能力，可以从[基础教程](basic/class.zh.md)开始阅读。

