# LogicFlow
LogicFlow 是一款流程可视化的前端框架，提供了一系列流程图交互、编辑所必需的功能和简单灵活的节点自定义、插件等拓展机制，方便我们快速在业务系统内满足类流程图的需求。

# 特性
- 🎯专业

  专注于业务流程可视化的解决方案
- 🚀快速搭建

  提供配套能力（undo/对齐线/键盘）快速搭建流程图编辑器，提升研发效率
- 🛠高拓展性

  提供自定义能力和插件能力，助力定制化的业务场景


# 使用
## 安装
```sh
# npm
$ npm install @logicflow/core --save


# yarn
$ yarn add @logicflow/core
```

## 代码示例
```js
// 创建容器
<div id="container"></div>

// 准备数据
const data = {
  // 节点
  nodes: [
    {
      id: 21,
      type: 'rect',
      x: 100,
      y: 200,
      text: {
        value: '矩形节点',
        x: 100,
        y: 200,
      },
    },
    {
      id: 50,
      type: 'circle',
      x: 300,
      y: 400,
      text: {
        value: '圆形节点',
        x: 300,
        y: 400,
      },
    },
  ],
  // 边
  edges:[
    {
      type: 'polyline',
      sourceNodeId: 50,
      targetNodeId: 21,
    }
  ]
}
// 渲染画布
const lf = new LogicFlow({
  container: document.querySelector('#container'),
  width: 700,
  height: 600,
});

lf.render(data);

```

# 文档
[官方文档](http://logic-flow.org)

- [快速上手](http://logic-flow.org/guide/start.html#安装)
- [基础教程](http://logic-flow.org/guide/basic/logic-flow.html)
- [进阶指南](http://logic-flow.org/guide/advance/theme.html)
- [拓展](http://logic-flow.org/guide/extension/extension-components.html)
- [示例](http://logic-flow.org/usage/bpmn.html)


# 核心能力
## 流程图编辑器快速搭建
提供了一个流程图编辑所必需的各项能力，这也是 LogicFlow 的基础能力：

- 图的绘制能力。基于 SVG 来绘制形状各异的节点和线，并提供了基础的节点（矩形、圆形、多边形等）和线（直线、折线、曲线）
- 各类交互能力，让图动起来。根据节点、线、图的各类鼠标事件（hover、点击、拖拽等）做出反应。比如节点拖拽、拖拽创建连线、线的调整、双击节点编辑文本等
- 提升编辑效率的能力。提供网格、对齐线，上一步、下一步，键盘快捷键，图放大缩小等配套能力，帮助用户提升编辑效率
- 提供了丰富的 API ，宿主研发通过 API 传参调用和监听事件的方式，与 LogicFlow 完成交互

  下面是通过 LogicFlow 内置的节点和配套能力，做的流程图示例
：

  <image src="https://dpubstatic.udache.com/static/dpubimg/eEMT14E7BR/lfexample1.gif" width="500"/>


## 基于业务场景拓展

当基础能力无法满足业务需求的时候，便需要基于业务场景拓展。

- 设置图上所有元素的样式，比如各种节点、线、锚点、箭头、对齐线的大小颜色等，满足对前端样式调整的需求
- API 拓展。支持在 LogicFlow 上注册自定义的方法，比如通过 API 拓展提供图片下载的方法
- 自定义节点、线。内置的矩形、圆形等图形类节点往往无法满足实际的业务需求，需要定义具有业务意义的节点。LogicFlow 提供了 的方式让用户定制具有自定义图形、业务数据的节点，比如流程审批场景中的 “审批” 节点
- 拓展组件。LogicFlow 在 SVG 图层上提供了 HTML 层和一系列坐标转换逻辑，并支持在 HTML 层注册组件。宿主研发可以通过 LogicFlow 的 API，基于任何 View 框架开发组件，比如节点的右键菜单、控制面板等
- 数据转换 adapter。LogicFlow 默认导出的图数据不一定适合所有业务，此时可以通过 adapter API，在图数据从 LogicFlow 输入、输出的时候做自定义转换，比如转换成 BPMN 规范的图数据
- 内置部分拓展能力。基于上述拓展能力，我们还单独提供了 extension 的包，用来存放当前业务下沉淀出的具有通用性的节点、组件等，比如面向 BPMN 规范的节点和数据 adapter，默认菜单。注意 extension 可以单独安装，并支持按需引入

基于上述拓展的能力，前端研发能够根据实际业务场景的需求，灵活的开发出所需的节点、组件等。下面有两个基于 LogicFlow 拓展能力做出的流程图

### BPMN 规范

<image src="https://dpubstatic.udache.com/static/dpubimg/CS6S6q9Yxf/lfexample2.gif" width="500"/>


### 审批流

<image src="https://dpubstatic.udache.com/static/dpubimg/uBeSlMEytL/lfexample3.gif" width="500"/>


# 整体架构

![jiagou](https://dpubstatic.udache.com/static/dpubimg/fg7q5j_5nG/lfjk.png)

[详细介绍](https://github.com/didi/LogicFlow/wiki)

# 开发团队
内部成员：<a href="https://github.com/GeekJk">GeekJk</a>、<a href="https://github.com/sunyongjian">sunyongjian</a>、<a href="https://github.com/towersxu
">towersxu</a>、<a href="https://github.com/xinxin93
">xinxin93</a>、<a href="https://github.com/ChengranYan
">ChengranYan</a>、<a href="https://github.com/lww117
">lww117</a>、<a href="https://github.com/yhlchao
">yhlchao</a>

# 联系我们

## 加入微信群

加我微信号邀请入群：sunyongjian1993

或扫群二维码：

<image src="https://dpubstatic.udache.com/static/dpubimg/C9OknpWCFr/wxq2.jpeg" width="300"/>

## 加入 QQ 群
<image src="https://dpubstatic.udache.com/static/dpubimg/VMBzV7jhh8/qq.png" width="300"/>
