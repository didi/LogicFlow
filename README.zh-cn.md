<p align="center">
  <a href="https://site.logic-flow.cn" target="_blank">
    <img
      src="https://site.logic-flow.cn/logo.png"
      alt="LogicFlow logo"
      width="250"
    />
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@logicflow/core">
    <img src="https://img.shields.io/npm/v/@logicflow/core" alt="Version">
  </a>
  <a href="https://www.npmjs.com/package/@logicflow/core">
    <img src="https://img.shields.io/npm/dm/@logicflow/core" alt="Download">
  </a>
  <a href="https://github.com/didi/LogicFlow/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/@logicflow/core" alt="LICENSE">
  </a>
</p>


简体中文 | [English](/README.md)

LogicFlow 是一款流程图编辑框架，提供了一系列流程图交互、编辑所必需的功能和简单灵活的节点自定义、插件等拓展机制，方便我们快速在业务系统内满足类流程图的需求。

## 特性


- 🛠 高拓展性
  
  兼容各种产品自定义的流程编辑需求，绝大部分模块以插件的形式实现，支持各模块自由插拔。

- 🚀 重执行
  
  流程图能完备的表达业务逻辑，不受流程引擎限制。

- 🎯 专业
  
  专注于业务流程图编辑的框架

## 使用

### 安装

```sh
# npm
$ npm install @logicflow/core @logicflow/extension --save

```

### 代码示例

```js
// 创建容器
<div id="container"></div>;

// 准备数据
const data = {
  // 节点
  nodes: [
    {
      id: '21',
      type: 'rect',
      x: 100,
      y: 200,
      text: '矩形节点',
    },
    {
      id: '50',
      type: 'circle',
      x: 300,
      y: 400,
      text: '圆形节点',
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
};
// 渲染画布
const lf = new LogicFlow({
  container: document.querySelector('#container'),
  width: 700,
  height: 600,
});

lf.render(data);
```

## 文档

[官方文档](https://site.logic-flow.cn)

- [快速上手](https://site.logic-flow.cn/docs/#/zh/guide/start)
- [示例](https://site.logic-flow.cn/examples/#/gallery)

非官方

- [Vuejs3.x + Typescript 上手指南](https://www.yuque.com/fe-xiaoxin/zeots5)
- [Vuejs3.x + Typescript 在线案例](https://1024code.com/collections/25)

## 核心能力

### 流程图编辑器快速搭建

提供了一个流程图编辑所必需的各项能力，这也是 LogicFlow 的基础能力：

- 图的绘制能力。基于 SVG 来绘制形状各异的节点和线，并提供了基础的节点（矩形、圆形、多边形等）和线（直线、折线、曲线）
- 各类交互能力，让图动起来。根据节点、线、图的各类鼠标事件（hover、点击、拖拽等）做出反应。比如节点拖拽、拖拽创建边、线的调整、双击节点编辑文本等
- 提升编辑效率的能力。提供网格、对齐线，上一步、下一步，键盘快捷键，图放大缩小等配套能力，帮助用户提升编辑效率
- 提供了丰富的 API ，宿主研发通过 API 传参调用和监听事件的方式，与 LogicFlow 完成交互

  下面是通过 LogicFlow 内置的节点和配套能力，做的流程图示例
  ：

    <image src="https://dpubstatic.udache.com/static/dpubimg/eEMT14E7BR/lfexample1.gif" width="500"/>

### 基于业务场景拓展

当基础能力无法满足业务需求的时候，便需要基于业务场景拓展。

- 设置图上所有元素的样式，比如各种节点、线、锚点、箭头、对齐线的大小颜色等，满足对前端样式调整的需求
- API 拓展。支持在 LogicFlow 上注册自定义的方法，比如通过 API 拓展提供图片下载的方法
- 自定义节点、线。内置的矩形、圆形等图形类节点往往无法满足实际的业务需求，需要定义具有业务意义的节点。LogicFlow 提供了 的方式让用户定制具有自定义图形、业务数据的节点，比如流程审批场景中的 “审批” 节点
- 拓展组件。LogicFlow 在 SVG 图层上提供了 HTML 层和一系列坐标转换逻辑，并支持在 HTML 层注册组件。宿主研发可以通过 LogicFlow 的 API，基于任何 View 框架开发组件，比如节点的右键菜单、控制面板等
- 数据转换 adapter。LogicFlow 默认导出的图数据不一定适合所有业务，此时可以通过 adapter API，在图数据从 LogicFlow 输入、输出的时候做自定义转换，比如转换成 BPMN 规范的图数据
- 内置部分拓展能力。基于上述拓展能力，我们还单独提供了 extension 的包，用来存放当前业务下沉淀出的具有通用性的节点、组件等，比如面向 BPMN 规范的节点和数据 adapter，默认菜单。注意 extension 可以单独安装，并支持按需引入

基于上述拓展的能力，前端研发能够根据实际业务场景的需求，灵活的开发出所需的节点、组件等。下面有两个基于 LogicFlow 拓展能力做出的流程图：

### 流程编排器demo

demo link：https://site.logic-flow.cn/demo/dist/organizer/

code link：https://github.com/Logic-Flow/docs/tree/master/demo/organizer

![图片:organizer](https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/organizer-iii.gif)

### BPMN应用demo

示例地址：http://logic-flow.org/examples/#/extension/bpmn

源码地址：https://github.com/didi/LogicFlow/tree/master/examples/src/pages/usage/bpmn

![图片:bpmn](https://dpubstatic.udache.com/static/dpubimg/CS6S6q9Yxf/lfexample2.gif)


#### 审批流应用demo

示例地址：http://logic-flow.org/examples/#/usage/approve

源码地址：https://github.com/didi/LogicFlow/tree/master/examples/src/pages/usage/approve

![图片: 审批流](https://dpubstatic.udache.com/static/dpubimg/uBeSlMEytL/lfexample3.gif)

#### vue 应用 demo

源码地址 [https://github.com/xinxin93/logicflow_vue_demo](https://github.com/xinxin93/logicflow_vue_demo)

![https://dpubstatic.udache.com/static/dpubimg/e35cef10-bb7c-4662-a494-f5aac024c092.gif](https://dpubstatic.udache.com/static/dpubimg/e35cef10-bb7c-4662-a494-f5aac024c092.gif)


#### 作图工具示例

LogicFlow不仅支持开发类似bpmn.js这种固定整体样式、更偏向生成数据在流程引擎可执行的流程图工具。也支持实现类似ProcessOn这种自由控制样式的作图工具。

示例地址：[http://logic-flow.org/mvp/index.html](http://logic-flow.org/mvp/index.html)

源码地址：[https://github.com/didi/LogicFlow/tree/master/site/mvp](https://github.com/didi/LogicFlow/tree/master/site/mvp)

示例图如下:
![logicflow-1.0-4.png](/docs/assets/images/LogicFlow-1.0-4.png)


#### vue3 node-red风格示例

源码地址: [https://github.com/Logic-Flow/logicflow-node-red-vue3](https://github.com/Logic-Flow/logicflow-node-red-vue3)

![node-red](https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/node-red.png)

#### 手绘风格插件示例

源码地址: [https://github.com/towersxu/draft-flow](https://github.com/towersxu/draft-flow)

![draft-flow](https://cdn.jsdelivr.net/gh/towersxu/draft-flow@latest/packages/website/public/redis.png)

## 联系我们

### 加入微信群

添加微信号：logic-flow 加入用户群

### 加入 QQ 群

<image src="https://dpubstatic.udache.com/static/dpubimg/VMBzV7jhh8/qq.png" width="300"/>

### 贡献代码

LogicFlow对外持开放态度，不论是只修改文档的标点符号还是对LogicFlow的整体功能有大的重构我们都欢迎。对于您的每一个PR我们都会认真查看、回复、合并。详情见[LogicFlow贡献指南](https://github.com/didi/LogicFlow/blob/master/CONTRIBUTING.md)。

## 好书推荐
LogicFlow 支持产出适用于各种流程引擎的数据，如大家在项目中使用 Activiti流程引擎，推荐结合贺波老师的书[《深入Activiti流程引擎：核心原理与高阶实战》](https://item.m.jd.com/product/13928958.html?gx=RnAomTM2bmCImZxDqYAkVCoIHuIYVqc)，这本书对系统学习和深入掌握Activiti/Flowable的用法非常有帮助。

<image src="https://github.com/didi/LogicFlow/assets/8553969/f4492e40-d812-453e-a170-38fb4253338f" alt="《深入Activiti流程引擎：核心原理与高阶实战》" width="300"/>
