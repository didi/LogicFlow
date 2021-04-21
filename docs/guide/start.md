# 快速上手

## 安装

通过 `npm` 或 `yarn` 来安装 `LogicFlow`。

```sh
# npm
$ npm install @logicflow/core --save

# yarn
$ yarn add @logicflow/core

```

安装完成之后，使用 `import` 或 `require` 进行引用。

```js
import LogicFlow from '@logicflow/core';
import '@logicflow/core/dist/style/index.css';
```

## 开始使用

### 创建容器

在页面中创建一个用于绘图的容器，可以是一个 `div` 标签。

```html
<div id="container"></div>
```

### 准备数据

通过 `JSON` 的数据格式，来让 `LogicFlow` 渲染。该数据中需要有 `nodes`（节点） 和 `edges`（边） 字段，分别用数组表示：

```js
const data = {
  // 节点
  nodes: [
    {
      id: 50,
      type: 'rect',
      x: 100,
      y: 150,
      text: '你好',
    },
    {
      id: 21,
      type: 'circle',
      x: 300,
      y: 150,
    },
  ],
  // 边
  edges: [
    {
      type: 'polyline',
      sourceNodeId: 50,
      targetNodeId: 21,
    },
  ],
};
```

### 渲染画布

首先创建一个 `LogicFlow` 的实例，此时可以传入一些参数来控制画布，比如画布的大小。

```js
const lf = new LogicFlow({
  container: document.querySelector('#container'),
  stopScrollGraph: true,
  stopZoomGraph: true,
  width: 500,
  height: 500,
  grid: {
    type: 'dot',
    size: 20,
  },
});
```

通过刚才创建的实例，来渲染画布。

```js
lf.render(data);
```

到此，我们就创建好了一个最简单的示例。

<example :height="400" ></example>
