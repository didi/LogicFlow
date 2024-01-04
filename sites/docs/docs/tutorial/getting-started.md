---
nav: 指南
group:
  title: 介绍
title: 快速上手
order: 1
---

# 快速上手

## 简介

LogicFlow分为：

- `core`包 - 核心包

- `extension`包 - 插件包（不使用插件时不需要引入）

- `engine`包 - 执行引擎

## 安装

- 命令安装：通过使用 npm 或 yarn 进行安装。

```shell
# npm
$ npm install @logicflow/core --save

# yarn
$ yarn add @logicflow/core
```

- 直接用`<script>`引入

  由于LogicFlow本身会有一些预置样式，所以除了需要引入js, 还需要引入css。

  TODO - 需要核对路径

```html
<!-- 引入 core包 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/style/index.css" />
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/logic-flow.js"></script>

<!-- 引入 extension包样式 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.css" />

<!-- 插件支持单个引入，这里以菜单插件为例 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/Menu.js"></script>
```

LogicFlow所有的插件地址：[https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/](https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/)

## 开始使用

### 1. 初始化画布

在页面中创建一个画布容器，然后初始化画布对象，可以通过配置设置画布的样式。

```jsx | pure
<div id="container"></div>

import LogicFlow from '@logicflow/core'
import "@logicflow/core/dist/index.css";

const lf = new LogicFlow({
  container: document.querySelector("#container")
});

```

### 2. 渲染节点和边

LogicFlow 支持 JSON 格式数据，该对象中 `nodes` 代表节点数据，`edges` 代表边数据。现在请看一个简单例子👇

<code id="helloworld" src="../../src/tutorial/getting-started/helloworld"></code>

LogicFlow 本身是以 umd 打包为纯 JS 的包，所以不论是 vue 还是 react 中都可以使用。这里需要注意一点，那就是初始化 LogicFlow 实例的时候，传入的参数 container，必须要 dom 上存在这个节点，不然会报错请检查 container 参数是否有效。

:::warning{title=注意}
LogicFlow支持初始化不传容器宽高参数，这个时候默认会使用container的宽高。请保证初始化LogicFlow的时候，container已经存在宽高了。
:::

### 3. 使用前端框架节点

使用 React 实现

<code id="use-react-node" src="../../src/tutorial/getting-started/use-react"></code>

使用 Vue 实现

<details> <summary>代码展开</summary>

```jsx | pure
import { HtmlNode, HtmlNodeModel } from "@logicflow/core";
import { createApp, ref, h } from 'vue';
import VueNode from './VueNode.vue';

class VueHtmlNode extends HtmlNode {
  constructor (props) {
    super(props)
    this.isMounted = false
    this.r = h(VueNode, {
      properties: props.model.getProperties(),
      text: props.model.inputData,
    })
    this.app = createApp({
      render: () => this.r
    })
  }
  setHtml(rootEl) {
    if (!this.isMounted) {
      this.isMounted = true
      const node = document.createElement('div')
      rootEl.appendChild(node)
      this.app.mount(node)
    } else {
      this.r.component.props.properties = this.props.model.getProperties()
    }
  }
}

class VueHtmlNodeModel extends HtmlNodeModel {
  setAttributes() {
    this.width = 300;
    this.height = 100;
    this.text.editable = false;
    this.inputData = this.text.value
  }
  getOutlineStyle() {
    const style = super.getOutlineStyle();
    style.stroke = 'none';
    style.hover.stroke = 'none';
    return style;
  }
}

export default {
  type: 'vue-html',
  model: VueHtmlNodeModel,
  view: VueHtmlNode
}
```

</details>

### 4. 使用插件

LogicFlow 最初的目标就是支持一个扩展性强的流程绘制工具，用来满足各种业务需求。为了让LogicFlow的拓展性足够强，LogicFlow将所有的非核心功能都使用插件的方式开发，然后将这些插件放到`@logicflow/extension`包中。

#### >> 启用

```js
import LogicFlow from "@logicflow/core";
import { Control } from "@logicflow/extension";

LogicFlow.use(Control);
```

#### >> 示例

<code id="use-plugin" src="../../src/tutorial/getting-started/use-plugin"></code>

### 5. 数据转换

在某些情况下，LogicFlow 生成的数据格式可能不满足业务需要的格式。比如后端需要的数据格式是 bpmn-js 生成的格式，那么可以使用数据转换工具，将 LogicFlow 生成的数据转换为 bpmn-js 生成的数据。

```jsx | pure
lf.adapterIn = function (userData) {
  ...
  return logicFlowData;
}

lf.adapterOut = function (logicFlowData) {
  ...
  return userData;
}
```

自定义数据转换工具本质上是将用户传入的数据，通过一个`lf.adapterIn`方法，将其转换为 LogicFlow 可以识别的格式。然后在生成数据的时候，又通过`lf.adapterOut`方法将 LogicFlow 的数据转换为用户传入的数据。所以自定义数据转换工具我们只需要重新覆盖这两个方法即可。

我们的演示 demo 就到这里了，想继续了解 X6 的一些能力，可以从[基础教程](basic-class)开始阅读。

