---
nav: 指南
group:
  title: 介绍
title: 快速上手
order: 1
toc: content
---

# 快速上手

## 安装

- 命令安装：通过使用 npm、yarn、pnpm 进行安装。

:::code-group

```bash [npm]
npm install @logicflow/core --save
```

```bash [yarn]
yarn add @logicflow/core
```

```bash [pnpm]
pnpm install @logicflow/core
```

:::

- 直接用`<script>`引入

  由于LogicFlow本身会有一些预置样式，所以除了需要引入js, 还`需要引入css`。

```html
<!-- 引入 core包 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core@2.0.0-beta.2/dist/index.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core@2.0.0-beta.2/lib/style/index.min.css" rel="stylesheet">

```
  当前最新版本是2.0.0-beta.2，其他版本请查看：https://www.jsdelivr.com/package/npm/@logicflow/core

## 开始使用

### 1.直接`<script>`使用

```html
<!-- 引入 core包 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core@2.0.0-beta.2/dist/index.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core@2.0.0-beta.2/lib/style/index.min.css" rel="stylesheet">

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

### 2.React 框架中使用

LogicFlow 本身是以 umd 打包为纯 JS 的包，所以不论是 vue 还是 react 中都可以使用。这里需要注意一个点，那就是初始化 LogicFlow 实例的时候，传入的参数 container,必须要 dom 上存在这个节点，不然会报错请检查 container 参数是否有效。

```jsx
import LogicFlow from "@logicflow/core";
import "@logicflow/core/dist/index.css";
import { useEffect, useRef } from "react";

export default function App() {
  const refContainer = useRef();
  const data = {
    // 节点
    nodes: [
      {
        id: '21',
        type: 'rect',
        x: 300,
        y: 100,
        text: 'rect node',
      },
      {
        id: '50',
        type: 'circle',
        x: 500,
        y: 100,
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
  useEffect(() => {
    const logicflow = new LogicFlow({
      container: refContainer.current,
      grid: true,
      height: 200
    });
    logicflow.render(data);
  }, []);
  return <div className="App" ref={refContainer}></div>;
}
```

### 3.Vue 框架中使用

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