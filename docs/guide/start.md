# 介绍

## LogicFlow是什么

todo:


## 安装

### 直接用`<script>`引入

LogicFlow分为`core`包和`extension`包。由于LogicFlow本身会有一些预置样式，所以除了需要引入js, 还需要引入css。


```html
<link ref="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/style/index.css" />
<link ref="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.css" />
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/logic-flow.js"></script>
<!--LogicFlow的插件支持单个引入，这里以菜单插件为例-->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/Menu.js"></script>

```

### 使用npm引入

```shell
npm install @logicflow/core
npm install @logicflow/extension
```

## 一个简单的流程图

```js
const lf = new LogicFlow({
  container: document.querySelector("#app"),
  width: 1000,
  height: 500,
  grid: true
});

lf.render({
  nodes: [
    {
      id: "1",
      x: 200,
      y: 200,
      type: "rect"
    },
    {
      id: "2",
      x: 440,
      y: 220,
      type: "rect"
    }
  ]
});

lf.createEdge({
  type: "polyline",
  sourceNodeId: "1",
  targetNodeId: "2"
});
```

[![Edit cranky-rubin-700y0](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/cranky-rubin-700y0?fontsize=14&hidenavigation=1&theme=dark)
