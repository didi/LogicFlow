---
nav: 指南
group:
  title: 介绍
title: 快速上手
order: 1
toc: content
---

欢迎来到快速上手，在这个部分你将了解到：
- 如何安装LogicFlow依赖
- 如何创建一个LogicFlow画布
- 如何使用LogicFlow插件
- LogicFlow输入输出的数据格式和如何做数据转换

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

由于LogicFlow有内置样式，因此在引入依赖时需要同时引入LogicFlow的js包和css包。

:::code-group

```html [2.0引入方式]

<!-- 引入 core包和对应css -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/index.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core/lib/style/index.min.css" rel="stylesheet">

<!--  引入 extension包和对应css（不使用插件时不需要引入） -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/dist/index.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.min.css" />

```

```html [1.0引入方式]

<!-- 引入 core包和对应css -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core@1.2.27/dist/logic-flow.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core@1.2.27/dist/style/index.css" rel="stylesheet">

<!--  引入 extension包和对应css（不使用插件时不需要引入） -->
<!-- 值得注意的是：1.0版本，插件的脚本包是分开导出的，因此引入某个组件，引用路径需要具体到包名，就像下文引入Menu插件这样👇🏻 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension@1.2.27/lib/Menu.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension@1.2.27/lib/style/index.css" />
```
:::

默认情况下CDN引入的是最新版本的包，如需引入其他版本的包，可点击链接查看具体包信息，再根据自己的诉求在CDN路径中加上包版本。
<a href="https://www.jsdelivr.com/package/npm/@logicflow/core" target="_blank">Core包</a> 
<a href="https://www.jsdelivr.com/package/npm/@logicflow/extension" target="_blank">
Extension包</a> 

## 开始使用

接下来让我们开始使用LogicFlow吧

### 1. 创建实例
要创建并展示LogicFlow的实例很简单，你只需要写一段类似这样的代码：

``` javascript
  // 初始化实例
  const lf = new LogicFlow({
    container: document.querySelector('#container'),
    // 其他配置
  })
  // 渲染数据
  lf.render({
    // 渲染的数据
  })
```
开发者们可以根据实际的需求初始化LogicFlow实例并渲染数据。
LogicFlow 本身是以 umd 打包为纯 JS 的包，所以无论是 vue 还是 react 都可以使用，下面是 原生环境 和 框架环境 下引入并使用LogicFlow的例子以供参考。

<iframe src="/original-usage.html" style="border: none; width: 100%; height: 400px; margin: auto;"></iframe>

:::code-group

``` html [原生环境]
<html>
  <head>
      <title>Original Usage</title>
  </head>
  <body>
  <!-- 引入 core 包和对应 css-->
  <script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/index.min.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/@logicflow/core/lib/style/index.min.css" rel="stylesheet">

  <!-- 创建画布容器 -->
  <div id="container"></div>
  </body>
  <script>
    // 引入继承节点，引入 core 包后，会自动挂载 window.Core 
    // const { RectNode, RectNodeModel } = Core;
    
    // 准备图数据
    const data = {
      // 节点数据
      nodes: [
        {
          id: '21', // 节点ID，需要全局唯一，不传入内部会自动生成一个ID
          type: 'rect', // 节点类型，可以传入LogicFlow内置的7种节点类型，也可以注册自定义节点后传入自定义类型
          x: 100, // 节点形状中心在x轴位置
          y: 100, // 节点形状中心在y轴的位置
          text: 'Origin Usage-rect', // 节点文本
          properties: { // 自定义属性，用于存储需要这个节点携带的信息，可以传入宽高以重设节点的宽高
            width: 160,
            height: 80,
          }
        },
        {
          id: '50',
          type: 'circle',
          x: 300,
          y: 300,
          text: 'Origin Usage-circle',
          properties: {
            r: 60,
          }
        },
      ],
      // 边数据
      edges: [
        {
          id: 'rect-2-circle', // 边ID，性质与节点ID一样
          type: 'polyline', // 边类型
          sourceNodeId: '50', // 起始节点Id
          targetNodeId: '21', // 目标节点Id
        },
      ],
    }
    
    // 创建画布实例，也可以 new Core.LogicFLow
    const lf = new Core.default({
      container: document.querySelector('#container'),
      // width: 700, // 宽高和容器存一即可
      // height: 500, // 如果二者同时存在，会优先取设置的宽高
      grid: true,
    })
    
    // 渲染画布实例
    lf.render(data)
  </script>
</html>
```

``` jsx [React环境]
import LogicFlow from '@logicflow/core';
import '@logicflow/core/dist/index.css';
import { useEffect, useRef } from 'react';

export default function App() {
  const refContainer = useRef(null);
  const data = {
    // 节点数据
    nodes: [
      {
        id: '21', // 节点ID，需要全局唯一，不传入内部会自动生成一个ID
        type: 'rect', // 节点类型，可以传入LogicFlow内置的7种节点类型，也可以注册自定义节点后传入自定义类型
        x: 100, // 节点形状中心在x轴位置
        y: 100, // 节点形状中心在y轴的位置
        text: 'Origin Usage-rect', // 节点文本
        properties: { // 自定义属性，用于存储需要这个节点携带的信息，可以传入宽高以重设节点的宽高
          width: 160,
          height: 80,
        }
      },
      {
        id: '50',
        type: 'circle',
        x: 300,
        y: 300,
        text: 'Origin Usage-circle',
        properties: {
          r: 60,
        }
      },
    ],
    // 边数据
    edges: [
      {
        id: 'rect-2-circle', // 边ID，性质与节点ID一样
        type: 'polyline', // 边类型
        sourceNodeId: '50', // 起始节点Id
        targetNodeId: '21', // 目标节点Id
      },
    ],
  };
  useEffect(() => {
    const lf = new LogicFlow({
      container: refContainer.current,
      grid: true,
      height: 200,
    });
    lf.render(data);
    lf.translateCenter();
  }, []);

  return <div className="App" ref={refContainer}></div>;
}

```

``` vue [Vue环境]
<template>
  <div class="container" ref="container"></div>
</template>

<script>
  import LogicFlow from "@logicflow/core";
  import "@logicflow/core/lib/style/index.css";

  export default {
    name: 'lf-Demo',
    data() {
      return {
        renderData: {
          // 节点数据
          nodes: [
            {
              id: '21', // 节点ID，需要全局唯一，不传入内部会自动生成一个ID
              type: 'rect', // 节点类型，可以传入LogicFlow内置的7种节点类型，也可以注册自定义节点后传入自定义类型
              x: 100, // 节点形状中心在x轴位置
              y: 100, // 节点形状中心在y轴的位置
              text: 'Origin Usage-rect', // 节点文本
              properties: { // 自定义属性，用于存储需要这个节点携带的信息，可以传入宽高以重设节点的宽高
                width: 160,
                height: 80,
              }
            },
            {
              id: '50',
              type: 'circle',
              x: 300,
              y: 300,
              text: 'Origin Usage-circle',
              properties: {
                r: 60,
              }
            },
          ],
          // 边数据
          edges: [
            {
              id: 'rect-2-circle', // 边ID，性质与节点ID一样
              type: 'polyline', // 边类型
              sourceNodeId: '50', // 起始节点Id
              targetNodeId: '21', // 目标节点Id
            },
          ],
        }
      }
    }
    mounted() {
      this.lf = new LogicFlow({
        container: this.$refs.container,
        grid: true,
      });
      this.lf.render(renderData);
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

``` ts [Angular环境]
// demo.component.html
// <div class="container" #lfdom></div>

//demo.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import LogicFlow from '@logicflow/core'
import { Router } from '@angular/router';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit {

  @ViewChild('lfdom', { static: true }) lfdom: any;

  constructor(private router: Router) { }

  ngOnInit(): void {
    const lf = new LogicFlow({
      container: this.lfdom.nativeElement,
      grid: true,
      width: 1000,
      height: 500
    });
    lf.render({
      nodes: [
        {
          id: '21', // 节点ID，需要全局唯一，不传入内部会自动生成一个ID
          type: 'rect', // 节点类型，可以传入LogicFlow内置的7种节点类型，也可以注册自定义节点后传入自定义类型
          x: 100, // 节点形状中心在x轴位置
          y: 100, // 节点形状中心在y轴的位置
          text: 'Origin Usage-rect', // 节点文本
          properties: { // 自定义属性，用于存储需要这个节点携带的信息，可以传入宽高以重设节点的宽高
            width: 160,
            height: 80,
          }
        },
        {
          id: '50',
          type: 'circle',
          x: 300,
          y: 300,
          text: 'Origin Usage-circle',
          properties: {
            r: 60,
          }
        },
      ],
      // 边数据
      edges: [
        {
          id: 'rect-2-circle', // 边ID，性质与节点ID一样
          type: 'polyline', // 边类型
          sourceNodeId: '50', // 起始节点Id
          targetNodeId: '21', // 目标节点Id
        },
      ],
    });

  }

}
```
:::

:::warning{title=Tip}
LogicFlow初始化时支持不传画布宽高，这种情况下默认取的是container参数传入的DOM节点的宽高。

为了保障画布能正常渲染，请在确保对应容器已存在且有宽高后再初始化LogicFlow实例。
:::

### 2. 使用插件

如果需要使用插件，开发者需要引入`@logicflow/extension`依赖包，并根据自己的诉求引入插件。

下面是一个使用了控制面板插件功能的例子，这个插件提供了放大缩小或者自适应画布的能力，同时也内置了 `redo` 和 `undo` 的功能。

<iframe src="/control-extension-usage.html" style="border: none; width: 100%; height: 400px; margin: auto;"></iframe>

:::code-group

```html | pure [CDN]
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

```js [npm/yarn/pnpm]
import LogicFlow from "@logicflow/core";
import { Control } from "@logicflow/extension";

// 全局使用 每一个lf实例都具备 Control
LogicFlow.use(Control);
```

:::

进一步了解插件功能，可以访问 [插件简介](extension/intro.zh.md)。

### 3. 输入输出与数据转换
#### 数据输入
LogicFlow的流程图需要输入的渲染数据是这样结构的：
```json
{
  nodes: [ // 节点数据
    {
      id, // 节点ID，可选参数，不传时内部会自动生成
      type, // 节点类型，必传
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
      type, // 边类型，必传
      sourceNodeId, // 起始节点ID，必传
      targetNodeId, // 目标节点ID，必传
      // ...其他属性
    }
  ],
}
```
在调用`lf.render`时，只需要传入上面格式的对象就可以轻松渲染出一个带初始数据的流程图画布，完整的数据格式可以查阅[graphConfigData](../api/type/graphCinfigData.zh.md)了解。
#### 数据输出

LogicFlow对外提供了两个输出画布数据的方法： `getGraphData` 和 `getGraphRawData`
- [getGraphRawData](../api/detail/index.zh.md#getgraphrawdata) 方法可以返回`LogicFlow`画布上流程图的原始数据，开发者可以直接调用方法获取图数据，返回的数据格式可以查阅类型定义[graphData](../api/type/graphData.zh.md)

- [getGraphData](../api/detail/index.zh.md#getgraphdata) 方法则是返回流程图的加工数据，该方法首先会调`getGraphRawData`获取原始数据，再调用实例挂载的数据转换方法`adapterOut`加工后返回加工的数据。
:::info{title=Tip}
默认情况下LogicFlow实例上不会挂载adapterOut方法，所以这时getGraphData输出的数据就是getGraphRawData返回的数据
:::

这是一个调用`getGraphData` 和 `getGraphRawData`获取数据的例子：

<iframe src="/getGraphData-usage.html" style="border: none; width: 100%; height: 400px; margin: auto;"></iframe>

在这个例子中，原始数据部分展示的是`getGraphRawData`方法返回的数据，转换加工后的数据展示是`getGraphData`方法返回的数据，其中的转换逻辑是通过定义`lf.adapterOut`方法实现的，主要动作是只取节点和边的部分字段，并增加tip字段：

```javascript
// 关键代码
// 定义导出数据转换函数
lf.adapterOut = (data) => {
  const { nodes, edges } = data
  return {
    nodes: nodes.map(node => {
      const { properties, x, y, width, height } = node
      return {
        x,
        y,
        width,
        height,
        tips: '自定义导出的节点'
      }
    }),
    edges: edges.map(edge => {
      const { type, sourceNodeId, targetNodeId } = edge
      return {
        type,
        sourceNodeId,
        targetNodeId,
        // 添加自定义属性
        tips: '自定义导出的边',
      }
    }),
  }
}
// 获取画布数据
const rawData = lf.getGraphRawData()
const exportData = lf.getGraphData()
```

#### 数据转换
在某些对数据格式有要求的场景下，LogicFlow的数据格式无法满足业务诉求，因此我们在LogicFlow实例上增加了`adapterIn`和`adapterOut`方法以支持开发者进行数据转换。开发者可以根据自己的需求定义`adapterIn`和`adapterOut`方法来定制转换逻辑。

对于需要bpmn格式的数据，可以直接使用使用我们[内置提供的数据转换](extension/adapter.zh.md#使用内置的数据转换工具)插件，将 LogicFlow 生成的数据转换为 bpmn-js 生成的数据。

想要深入更多数据转换功能，请看[数据转换](extension/adapter.zh.md)。
