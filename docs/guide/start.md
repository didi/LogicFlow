# 介绍

## LogicFlow是什么

LogicFlow 是一款流程图编辑框架，提供了一系列流程图交互、编辑所必需的功能和灵活的节点自定义、插件等拓展机制。LogicFlow支持前端研发自定义开发各种逻辑编排场景，如流程图、ER图、BPMN流程等。在工作审批配置、机器人逻辑编排、无代码平台流程配置都有较好的应用。

更多资料请查看[LogicFlow系列文章](/article/article01.html)

## 安装

### 直接用`<script>`引入

LogicFlow分为`core`包和`extension`包。由于LogicFlow本身会有一些预置样式，所以除了需要引入js, 还需要引入css。


```html
<!--LogicFlow core包css-->
<link ref="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/style/index.css" />
<!--LogicFlow extension包css-->
<link ref="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.css" />
<!--LogicFlow core包js-->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/logic-flow.js"></script>
<!--LogicFlow的插件支持单个引入，这里以菜单插件为例-->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/Menu.js"></script>

```

### 使用npm引入

```shell
npm install @logicflow/core
npm install @logicflow/extension
```

## 绘制一个简单的流程图


```js
import LogicFlow from '@logicflow/core'
import "@logicflow/core/dist/style/index.css";

const lf = new LogicFlow({
  container: document.querySelector("#app"),
  grid: true
});

lf.render({
  nodes: [
    {
      id: "1",
      type: "rect",
      x: 100,
      y: 100,
      text: "节点1"
    },
    {
      id: "2",
      type: "circle",
      x: 300,
      y: 200,
      text: "节点2"
    }
  ],
  edges: [
    {
      sourceNodeId: "1",
      targetNodeId: "2",
      type: "polyline",
      text: "连线"
    }
  ]
});
```

<iframe src="https://codesandbox.io/embed/cranky-rubin-700y0?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="cranky-rubin-700y0"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

### 在vue或者react等前端框架中使用logicflow

LogicFlow本身是以umd打包为纯JS的包，所以不论是vue还是react中都可以使用。这里需要注意一个点，那就是初始化LogicFlow实例的时候，传入的参数container,必须要dom上存在这个节点，不然会报错`请检查 container 参数是否有效`。

[在Sandbox查看vue示例](https://codesandbox.io/s/github/towersxu/logicflow-vue-base/tree/main/?fontsize=14&hidenavigation=1&theme=dark)
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
      grid: true
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

[在Sandbox查看react示例](https://codesandbox.io/s/github/towersxu/logicflow-react-base/tree/main/?fontsize=14&hidenavigation=1&theme=dark)

```js

import LogicFlow from "@logicflow/core";
import "@logicflow/core/dist/style/index.css";
import { useEffect, useRef } from "react";

export default function App() {
  const refContainer = useRef();
  useEffect(() => {
    const logicflow = new LogicFlow({
      container: refContainer.current,
      grid: true,
      width: 1000,
      height: 500
    });
    logicflow.render();
  }, []);
  return <div className="App" ref={refContainer}></div>;
}

```
