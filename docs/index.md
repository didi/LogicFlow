---
home: true
heroImage: /new-logo.png
heroText:  
tagline:  专注流程可视化的前端解决方案
actionText: 开始使用 →
actionLink: /guide/start
features:
- title: 🎯 专业
  details: 专注于业务流程图的可视化解决方案
- title: 🚀 开箱即用
  details: 提供配套能力（undo/对齐线/快捷键），提升用户效率
- title: 🛠 高拓展性
  details: 提供自定义能力和数据转换（bpmn），助力定制化的业务场景
footer: Apache-2.0 License | Copyright © 2020-Present DiDi
---

## 💎 简单上手

安装一下

```sh
# npm
$ npm install @logicflow/core --save

# yarn
$ yarn add @logicflow/core
```

调用

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
