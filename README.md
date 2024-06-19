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

简体中文 | [English](/README.en-US.md)

LogicFlow 是一款流程图编辑框架，提供了一系列流程图交互、编辑所必需的功能和简单灵活的节点自定义、插件等拓展机制，方便我们快速在业务系统内满足类流程图的需求。

## 核心能力

---
- 高可定制性：自定义能力，支持 SVG、HTML、React、Vue 等自定义节点；边的富文本编辑
- 丰富的插件
- 可视化模型：MVVM
- 自执行引擎
- 数据可转换：BPMN、...

## 安装

---
```shell
# npm
$ npm install @logicflow/core @logicflow/extension --save

# yarn
$ yarn add @logicflow/core @logicflow/extension

# pnpm
$ pnpm add @logicflow/core @logicflow/extension
```

## 快速上手

---
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

## 相关文档

---
[官方文档](https://site.logic-flow.cn/)

- [快速上手](https://site.logic-flow.cn/tutorial/getting-started)
- [示例](https://site.logic-flow.cn/examples)
- [文章](https://site.logic-flow.cn/article/article01)

[更新日志]()
[常见问题]()
[issue模板]()

## 本地开发

---
```shell
# 安装项目依赖和初始化构建
$ pnpm install

# 进入到指定项目开发和调试
cd packages/core
pnpm run build:watch

# 启动 example 查看效果
cd examples/feature-examples
pnpm run start
```

## 参与共建
如果希望参与到 LogicFlow 的开发中，请遵从我们的[贡献指南](/CONTRIBUTING.md)。如果你贡献度足够活跃，你可以申请成为社区协作者。

<!-- readme: collaborators,contributors -start -->
<!-- readme: collaborators,contributors -end -->

## 开源协议
该项目的代码和文档基于 [Apache-2.0 License](/LICENSE) 开源协议。
