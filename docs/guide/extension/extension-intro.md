# 简介

> LogicFlow 最初的目标就是支持一个扩展性强的流程绘制工具，用来满足各种业务需求。

目前所有内置的拓展都在`@logicflow/extension`包中，其中包括`BpmnElement`、`Snapshot`、`Adapter`以及三个内置组件。

## 使用拓展

```js
import { BpmnElement } from '@logicflow/extension';
LogicFlow.use(BpmnElement);
```

```html
<script src="/logic-flow.js"></script>
<script src="/lib/BpmnElement.js"></script>
<script>
  LogicFlow.use(BpmnElement);
</script>
```

## 自定义拓展

实现一个 LogicFlow 的扩展非常简单，那就是对外暴露一个对象，这个对象有一个方法 install。LogicFlow 会在初始化的时候执行这个方法，将其实例传递进来。开发者基于这个实例，利用 LogicFlow 的自定义机制开发，就可以实现一个插件。

```js
window.ResizeNode = {
  name: 'resize-node',
  // lf实例化的时候触发
  install: function(lf, LogicFlow) {
    // 基于lf进行扩展
  },
  // 流程渲染到界面时触发
  render: function (lf, container) {}
}
```


