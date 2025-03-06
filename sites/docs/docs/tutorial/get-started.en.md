---
nav: Guide
group:
  title: Introduce
title: Getting Started
order: 1
toc: content
---

Welcome to the Quickstart, in this section you will learn:
- How to install LogicFlow dependencies for your project
- How to create a flowchart canvas using LogicFlow.
- How to add functionality to a flowchart canvas using the LogicFlow plugin.
- LogicFlow input and output data formats and how to do data conversion.

## Installation

### Command Installation

You can install using npm, yarn, or pnpm.

:::code-group

```bash [npm]
npm install @logicflow/core --save

# Plugin package (not needed if plugins are not used)
npm install @logicflow/extension --save
```

```bash [yarn]
yarn add @logicflow/core

# Plugin package (not needed if plugins are not used)
yarn add @logicflow/extension
```

```bash [pnpm]
pnpm add @logicflow/core

# Plugin package (not needed if plugins are not used)
pnpm add @logicflow/extension
```

:::

### Using CDN

LogicFlow requires including CSS files for its built-in styles in addition to the JS files.

:::code-group

```html [introduce under v2.0]

<!-- Import the core package and corresponding css -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/index.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core/lib/style/index.min.css" rel="stylesheet">

<!--  Import extension packages and corresponding css (not necessary when not using plugins)  -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/dist/index.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.min.css" />

```

```html [introduce under v1.0]

<!-- Import the core package and corresponding css -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core@1.2.27/dist/logic-flow.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core@1.2.27/dist/style/index.css" rel="stylesheet">

<!--  Import extension packages and corresponding css (not necessary when not using plugins) -->
<!-- Tip: version 1.0, the plug-in script package is exported separately, so the introduction of a component, the reference path needs to be specific to the name of the package, like the following introduction of the Menu plug-in so 👇🏻 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension@1.2.27/lib/Menu.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension@1.2.27/lib/style/index.css" />
```
:::

By default, the CDN will include the latest version. To include a different version, refer to the specific package information here: 
<a href="https://www.jsdelivr.com/package/npm/@logicflow/core" target="_blank">core package</a>
<a href="https://www.jsdelivr.com/package/npm/@logicflow/extension" target="_blank">extension package</a>, and adjust the CDN path accordingly.

## Getting Started

Let's get started with LogicFlow now!

### 1. Using in Native JS

It's easy to create and display an instance of LogicFlow, you just need to write a piece of code that looks like this:

``` javascript
  // Initialising instances
  const lf = new LogicFlow({
    container: document.querySelector('#container'),
    // Other options
  })
  // Render data
  lf.render({
    // Data to be rendered
  })
```
Developers can initialise LogicFlow instances and render data according to their actual needs.
LogicFlow itself is packaged in umd as a pure JS package, so it can be used in both vue and react. Below are some examples of how to introduce and use LogicFlow in both native and framework environments for reference.

<iframe src="/original-usage.html" style="border: none; width: 100%; height: 400px; margin: auto;"></iframe>

:::code-group

``` html [Origin environment]
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

``` jsx [React]
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

``` vue [Vue]
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

``` ts [Angular]
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
LogicFlow supports not passing the canvas width and height when initializing, in this case the default width and height of the DOM node passed by the container parameter is taken.

In order to ensure the canvas can be rendered normally, please initialize LogicFlow instance after making sure the corresponding container already exists and has the width and height.
:::

### 2. Using in Frameworks

If a plugin is required, the developer needs to bring in the `@logicflow/extension` dependency package and introduce the plugin according to their own requirements.

Below is an example of using the functionality of a control panel plugin that provides the ability to zoom in and out or adapt to the canvas, and also has built-in `redo` and `undo` functionality.

<iframe src="/control-extension-usage.html" style="border: none; width: 100%; height: 400px; margin: auto;"></iframe>

:::code-group

```html | pure [CDN]
<!-- Import extension-->

<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/dist/index.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.min.css" />
<!-- create graph container -->
<div id="container"></div>
<script>
  // The Extension CDN throws an Extension variable that contains all the plugins, the plugins used need to be taken from the Extension
  const { Control } = Extension
   // Writeup for globally installing control panel plugins:：
  Core.default.use(Control);
   //Writeup for single instance installing control panel plugins：
  const lf = new Core.default({
    ..., // Other options
    plugins: [Control],
  })
</script>
```

```js [npm/yarn/pnpm]
import LogicFlow from "@logicflow/core";
import { Control } from "@logicflow/extension";

// Global use, every LogicFlow instance has Control
LogicFlow.use(Control);
```

:::

To learn more about the plugin's features, you can visit [Plugin Introduction](extension/intro.zh.md).

### 3. Using Plugins
#### 数据输入
The rendering data that LogicFlow's flowchart requires as input is structured like this：
```json
{
  nodes: [ // node data
    {
      id, // node ID, optional, internally generated if not passed.
      type, // node type, mandatory
      x, // x coordinate of the node, mandatory
      y, // y coordinate of the node, mandatory
      text, // node text, optional
      properties, // custom properties
      // ...Other properties
    }
  ],
  edges: [ // edge data
    {
      id, // edge id, optional, will be generated if not passed.
      type, // type of the edge, mandatory
      sourceNodeId, // start node id, mandatory
      targetNodeId, // target node id, mandatory.
      // ...Other properties
    }
  ],
}
```
When calling `lf.render`, you can easily render a flowchart canvas with initial data by just passing in an object in the above format, the full data format can be found in [graphConfigData](... /api/type/graphCinfigData.zh.md) for more information.
#### Data Output

LogicFlow provides two methods to output canvas data: `getGraphData` and `getGraphRawData`.
- [getGraphRawData](... /api/detail/index.zh.md#getgraphrawdata) method can return the raw data of the flowchart on the `LogicFlow` canvas, developers can directly call the method to get the graph data, the format of the returned data can be found in the type definition [graphData](... /api/type/graphData.zh.md)

- [getGraphData](... /api/detail/index.zh.md#getgraphdata) method returns the processed data of the flowchart, which first calls `getGraphRawData` to get the raw data, and then calls the instance-mounted data conversion method `adapterOut` to process and return the processed data.
:::info{title=Tip}
By default LogicFlow instances do not have the adapterOut method mounted on them, so the data output from getGraphData is the data returned by getGraphRawData.
:::

This is an example of calling `getGraphData` and `getGraphRawData` to get data:

<iframe src="/getGraphData-usage.html" style="border: none; width: 100%; height: 400px; margin: auto;"></iframe>

In this example, the raw data part of the presentation is the data returned by the `getGraphRawData` method, and the converted and processed data presentation is the data returned by the `getGraphData` method, in which the conversion logic is realized by defining the `lf.adapterOut` method, and the main action is to take only some of the fields of the nodes and edges, and adding the tip field:

```javascript
// Critical codes
// Defining export data conversion functions
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
        tips: 'Customizing exported node'
      }
    }),
    edges: edges.map(edge => {
      const { type, sourceNodeId, targetNodeId } = edge
      return {
        type,
        sourceNodeId,
        targetNodeId,
        // Adding customized properties
        tips: 'Customizing exported edge',
      }
    }),
  }
}
// 获取画布数据
const rawData = lf.getGraphRawData()
const exportData = lf.getGraphData()
```

#### Data Conversion
In some scenarios where the data format is required, the data format of LogicFlow can't meet the business requirements, so we add `adapterIn` and `adapterOut` methods to LogicFlow instances to support developers to convert data. Developers can define `adapterIn` and `adapterOut` methods to customize the conversion logic according to their needs.

For data in bpmn format, you can directly use our [built-in data conversion](extension/adapter.zh.md#Use built-in data conversion tool) plugin to convert data generated by LogicFlow to data generated by bpmn-js.

To dive into more data conversion features, see [Data Conversion](extension/adapter.zh.md).