<p align="center">
  <a href="https://docs.logic-flow.cn" target="_blank">
    <img
      src="https://docs.logic-flow.cn/docs/_images/logo.png"
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

[简体中文](/README.zh-cn.md) | English

LogicFlow is a flowchart editing framework , providing a series of functions necessary for flowchart interaction and editing, as well as simple and flexible node customization, plug-in and other expansion mechanisms, so that we can quickly meet the needs of class flowcharts in business systems.

## Feature


- 🛠 High scalability

  Compatible with the process editing requirements of various product customizations, most modules are implemented in the form of plug-ins, and each module is supported to be plugged and unplugged freely.

- 🚀 Independent and Complete

  Flowcharts can fully express business logic without being limited by process engines.

- 🎯 Professional

  Focus on business process flow editing

## Usage

### Install

```sh
# npm
$ npm install @logicflow/core @logicflow/extension --save

```

### Example

```js
// create container
<div id="container"></div>;

// prepare data
const data = {
  // node data
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
  // edge data
  edges: [
    {
      type: 'polyline',
      sourceNodeId: '50',
      targetNodeId: '21',
    },
  ],
};
// render instance
const lf = new LogicFlow({
  container: document.querySelector('#container'),
  width: 700,
  height: 600,
});

lf.render(data);
```

## Document

[Our Document Address](https://docs.logic-flow.cn)

- [Get Started](https://docs.logic-flow.cn/docs/#/en/guide/start)
- [Demo](https://docs.logic-flow.cn/examples/#/gallery)

## Core Capability

### Flowchart Editor Quick Build

Providing various capabilities necessary for editing a flowchart, which is also the basic capability of LogicFlow:：

- The ability to draw graphs. Draw nodes and lines of various shapes based on SVG, and provide basic nodes (rectangles, circles, polygons, etc.) and lines (straight lines, polylines, curves)

- All kinds of interactive capabilities. Respond to various mouse events (hover, click, drag, etc.) of nodes, lines, and graphs. Such as node dragging, dragging to create edges, line adjustment, double-clicking nodes to edit text, etc.

- Ability to improve editing efficiency. Provide grids, alignment lines, previous step, next step, keyboard shortcuts, image zoom in and out, etc., to help users improve editing efficiency

- Providing Rich API. Developer completes the interaction with LogicFlow by calling API parameters and listening to events

  The following is an example of a flowchart made through LogicFlow's built-in nodes and supporting capabilities：

    <image src="https://dpubstatic.udache.com/static/dpubimg/eEMT14E7BR/lfexample1.gif" width="500"/>

### Expand based on business scenarios

When basic capabilities cannot meet business needs, it needs to be expanded based on business scene.

- Set the style of all elements on the graph, such as the size and color of various nodes, lines, anchor points, arrows, alignment lines, etc., to meet the needs of front-end style adjustments
- API extensions. Supports registering custom methods on LogicFlow, such as extending the method of providing image downloads through API extensions
- Custom nodes, lines. Built-in graphics nodes such as rectangles and circles often cannot meet actual business needs, and nodes with business significance need to be defined. LogicFlow provides a way for users to customize nodes with custom graphics and business data, such as the "Approval" node in the process approval scenario
- Extension components. LogicFlow provides an HTML layer and a series of coordinate transformation logic on top of the SVG layer, and supports registering components on the HTML layer. Host R&D can develop components based on any View framework through the LogicFlow API, such as the right-click menu of the node, the control panel, etc.
- Data conversion adapter. The graph data exported by LogicFlow by default may not be suitable for all businesses. At this time, you can use the adapter API to do custom conversion when the graph data is input and output from LogicFlow, such as converting to BPMN-standard graph data.
- Built-in partial expansion capabilities. Based on the above-mentioned expansion capabilities, we also provide a extension package, which is used to store the general-purpose nodes and components precipitated under the current business, such as nodes and data adapters oriented to the BPMN specification, and the default menu. Note that extension can be installed separately and supports on-demand import

Based on the above expanded capabilities, front-end R&D can flexibly develop required nodes, components, etc. according to the needs of actual business scenarios. Below are two flow charts based on LogicFlow's expansion capabilities:

### Flow Organizer Demo (Vue2 + Element-UI)

demo link：https://docs.logic-flow.cn/demo/dist/organizer/

code link：https://github.com/Logic-Flow/docs/tree/master/demo/organizer

![图片:organizer](/docs/assets/images/organizer.gif)

### BPMN Application Demo

demo link：http://logic-flow.org/examples/#/extension/bpmn

code link：https://github.com/didi/LogicFlow/tree/master/examples/src/pages/usage/bpmn

![图片:bpmn](https://dpubstatic.udache.com/static/dpubimg/CS6S6q9Yxf/lfexample2.gif)


#### Approval-Flow  Application Demo

demo link：http://logic-flow.org/examples/#/usage/approve

code link：https://github.com/didi/LogicFlow/tree/master/examples/src/pages/usage/approve

![图片: 审批流](https://dpubstatic.udache.com/static/dpubimg/uBeSlMEytL/lfexample3.gif)

#### Vue Application Demo

code link:  [https://github.com/xinxin93/logicflow_vue_demo](https://github.com/xinxin93/logicflow_vue_demo)

![https://dpubstatic.udache.com/static/dpubimg/e35cef10-bb7c-4662-a494-f5aac024c092.gif](https://dpubstatic.udache.com/static/dpubimg/e35cef10-bb7c-4662-a494-f5aac024c092.gif)


#### Examples of Drawing Tools

LogicFlow not only supports the development of a fixed overall style like bpmn.js, but also a flowchart tool that generates data and is executable in the process engine. It also supports drawing tools that implement free control styles like ProcessOn.

demo link：[http://logic-flow.org/mvp/index.html](http://logic-flow.org/mvp/index.html)

code link：[https://github.com/didi/LogicFlow/tree/master/site/mvp](https://github.com/didi/LogicFlow/tree/master/site/mvp)

The example picture is as follows：
![logicflow-1.0-4.png](/docs/assets/images/LogicFlow-1.0-4.png)


#### Vue3 Node-red Style Demo

code link:  [https://github.com/Logic-Flow/logicflow-node-red-vue3](https://github.com/Logic-Flow/logicflow-node-red-vue3)

![node-red](https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/node-red.png)

#### LogicFlow with draft-js

code link:  [https://github.com/towersxu/draft-flow](https://github.com/towersxu/draft-flow)

![draft-flow](https://cdn.jsdelivr.net/gh/towersxu/draft-flow@latest/packages/website/public/redis.png)


## Contact US

### Join Wechat

please add wechat "logic-flow" to join the user group

### Join QQ Group

<image src="https://dpubstatic.udache.com/static/dpubimg/VMBzV7jhh8/qq.png" width="300"/>

### How to Contribute  

LogicFlow is open to the outside, whether it is just fixing docment typo or a major reconstruction of the overall function of LogicFlow, we welcome it. For each of your PRs, we will carefully review, reply, and merge them. Details can see [LogicFlow Contribution Guides](https://github.com/didi/LogicFlow/blob/master/CONTRIBUTING.md).