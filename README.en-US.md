<p align="center">
  <a href="https://site.logic-flow.cn" target="_blank">
    <img
      src="https://site.logic-flow.cn/logo.png"
      alt="LogicFlow logo"
      width="100"
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


[简体中文](/README.md) | English

LogicFlow is a flowchart editing framework , providing a series of functions necessary for flowchart interaction and editing, as well as simple and flexible node customization, plug-in and other expansion mechanisms, so that we can quickly meet the needs of class flowcharts in business systems.

## Features

- High customizability：With the intuitive visual interface provided by LogicFlow, users can easily create, edit, and manage complex logical flowcharts.
- Rich Plug-ins: Built-in rich plug-ins, users can also customize complex plug-ins according to their own needs to achieve business requirements.
- The Visualization model：Users can customize nodes, connectors, and styles to suit their needs, creating custom logical flowcharts that match specific use cases.
- Self-executing engine: The execution engine supports browser-side flow chart logic, providing new ideas for code-free execution.
- Data convertible：Supports the conversion of LogicFlow data to BPMN, Turbo, and other backend execution engine data structures.

## Installation

```shell
# npm
$ npm install @logicflow/core @logicflow/extension --save

# yarn
$ yarn add @logicflow/core @logicflow/extension

# pnpm
$ pnpm add @logicflow/core @logicflow/extension
```

## Usage

```html
<!-- LogicFlow 容器 DOM-->
<div id="container"></div>;
```
```typescript
// 准备数据
const data = {
  // 节点
  nodes: [
    {
      id: '21',
      type: 'rect',
      x: 100,
      y: 200,
      text: 'Rect Node',
    },
    {
      id: '50',
      type: 'circle',
      x: 300,
      y: 400,
      text: 'Circle Node',
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

## Links

[Official Website](https://site.logic-flow.cn/en/)

- [Getting Started](https://site.logic-flow.cn/en/tutorial/get-started)
- [Examples](https://site.logic-flow.cn/en/examples)
- [Articles](https://site.logic-flow.cn/en/article/architecture-of-logicflow)

---
- [CHANGELOG](https://github.com/didi/LogicFlow/releases)
- [Issue Template](https://github.com/didi/LogicFlow/issues/new/choose)

## [Development](/CONTRIBUTING.en-US.md)

```shell
# install deps and build
$ pnpm install

# enter the specified project for development and debugging
cd packages/core
pnpm run build:watch

# start example to develop
cd examples/feature-examples
pnpm run start
```

## Contributing

To become a contributor, please follow our [contributing guide](/CONTRUBUTING.en-US.md). If you are an active contributor, you can apply to be a outside collaborator.

<a href="https://github.com/didi/LogicFlow/graphs/contributors">
<img src="https://raw.githubusercontent.com/didi/LogicFlow/master/CONTRIBUTORS.svg" alt="Contributors" />
</a>

## License

The scripts and documentation in this project are released under the [Apache-2.0 License](/LICENSE).

