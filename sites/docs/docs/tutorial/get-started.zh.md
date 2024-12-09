---
nav: 指南
group:
  title: 介绍
title: 快速上手
order: 1
toc: content
---

## 安装

### 命令安装
通过使用 npm、yarn、pnpm 进行安装。

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

### 通过CDN引入

  由于LogicFlow本身会有一些预置样式，所以除了需要引入js包外还需要引入css包。

- 2.0版本之后的CDN包的引入方式

```html | pure

<!-- 引入 core包和对应css -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/index.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core/lib/style/index.min.css" rel="stylesheet">

<!--  引入 extension包和对应css（不使用插件时不需要引入） -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/dist/index.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.min.css" />

```
- 2.0版本以前的CDN包的引入方式
```html | pure

<!-- 引入 core包和对应css -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core@1.2.27/dist/logic-flow.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core@1.2.27/dist/style/index.css" rel="stylesheet">

<!--  引入 extension包和对应css（不使用插件时不需要引入） -->
<!-- 值得注意的是：2.0版本之前，插件的脚本包是分开导出的 -->
<!-- 因此引入某个组件，引用路径需要具体到包名，就像下文引入Menu插件这样👇🏻 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension@1.2.27/lib/Menu.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension@1.2.27/lib/style/index.css" />

```

默认情况下CDN引入的是最新版本的包，如需引入其他版本的包，可到此处查看具体包信息：<a href="https://www.jsdelivr.com/package/npm/@logicflow/core" target="_blank">
core包</a>、<a href="https://www.jsdelivr.com/package/npm/@logicflow/extension" target="_blank">
entension包</a> ，再根据自己的诉求在cdn路径中加上包版本。

## 开始使用

### 1. 在原生JS环境下使用

```html | pure
<!-- 引入 core 包和对应 css-->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/index.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core/lib/style/index.min.css" rel="stylesheet">

<!-- 创建画布容器 -->
<div id="container"></div>

<script>
// 引入继承节点，引入 core 包后，会自动挂载 window.Core 
// const { RectNode, RectNodeModel } = Core;

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

// 创建画布实例，也可以 new Core.LogicFLow
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



### 2. 在框架中使用
LogicFlow 本身是以 umd 打包为纯 JS 的包，所以无论是 vue 还是 react 都可以使用。

:::warning{title=Tip}
LogicFlow初始化时支持不传画布宽高，这种情况下默认取的是container参数传入的DOM节点的宽高。

为了保障画布能正常渲染，请在确保对应容器已存在且有宽高后再初始化LogicFlow实例。
:::

#### 在React中使用

<code id="use-in-react" src="../../src/tutorial/get-started/use-in-react"></code>

#### 在Vue框架中使用

```vue

<template>
  <div class="container" ref="container"></div>
</template>

<script>
  import LogicFlow from "@logicflow/core";
  import "@logicflow/core/lib/style/index.css";
  // import "@logicflow/core/dist/style/index.css"; // 2.0版本前的引入方式

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

### 3. 使用插件

LogicFlow最初的目标就是提供一个扩展性强的流程绘制工具，用来满足各种业务需求。

为了让LogicFlow的拓展性足够强，LogicFlow所有的非核心功能都使用插件的方式开发，并放到`@logicflow/extension`
包中。

如果需要使用插件，用户需要引入`@logicflow/extension`依赖，并根据自己的诉求取用插件。

如下使用了控制面板插件功能，提供了放大缩小或者自适应画布的能力，同时也内置了 `redo` 和 `undo` 的功能。

#### 安装并使用CDN引入的LogicFlow插件包
- 2.0版本后的写法
```html | pure
<!-- 引入 extension包 -->

<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/dist/index.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.min.css" />
<!-- 创建画布容器 -->
<div id="container"></div>
<script>
  // Extension CDN会抛出一个包含所有插件的Extension变量，使用的插件需要从Extension中取用
  const { Control } = Extension
   //全局维度安装控制面板插件的写法：
  Core.default.use(Control);
   //实例维度安装控制面板插件的写法：
  const lf = new Core.default({
    ..., // 其他配置
    plugins: [Control],
  })
</script>
```

- 2.0版本前的写法
```html | pure
<!-- 引入 extension包 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension@1.2.27/lib/Control.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension@1.2.27/lib/style/index.css" />
<!-- 创建画布容器 -->
<div id="container"></div>
<script>
  //全局维度安装控制面板插件的写法：
  LogicFlow.use(Control);
  //实例维度安装控制面板插件的写法：
  const lf = new LogicFlow({
    ..., // 其他配置
    plugins: [Control]
  });
</script>
```

#### 安装并使用命令安装的LogicFlow插件包

```js
import LogicFlow from "@logicflow/core";
import { Control } from "@logicflow/extension";

// 全局使用 每一个lf实例都具备 Control
LogicFlow.use(Control);
```

示例：

<code id="use-plugin" src="../../src/tutorial/get-started/use-plugin"></code>

想要进一步了解插件功能，请看[插件简介](extension/intro.zh.md)。

### 4. 数据转换

#### 获取画布数据

我们提供了 [getGraphData](../api/detail/index.zh.md#getgraphdata) 方法，可以获取 LogicFlow 的画布数据，包括所有的节点和边的数据。

```js
const data = lf.getGraphData();
```

#### 自定义数据格式
在某些对数据格式有要求的场景下，LogicFlow的数据格式无法满足业务诉求，因此我们提供了数据转换能力。

对于需要bpmn格式的数据，可以直接使用使用我们[内置提供的数据转换](extension/adapter.zh.md#使用内置的数据转换工具)插件，将 LogicFlow 生成的数据转换为 bpmn-js 生成的数据。

想要深入更多数据转换功能，请看[数据转换](extension/adapter.zh.md)。
