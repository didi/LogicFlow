# 自定义组件

当内置组件的功能或样式不能满足业务需求时，我们可以根据 Logic Flow 提供的 [API](/api/logicFlowApi.html) 自己实现相应的组件，例如[拖拽示例](/guide/basic/dnd.html)中的拖拽面板。

Logic Flow 维护了一个覆盖在`Graph`之上的组件层，这个组件层会向所包含的组件传递一些数据，如果想要将自己的组件插入到这一层中，我们需要暴露一个含有`install`方法的对象，以便将组件注册进 Logic Flow，除此之外还要提供一个`render`方法，Logic Flow 会将自身实例、内部数据以及组件层 DOM 传入进来。

> 将组件插入内部组件层完全是可选的。

以上文中的拖拽面板为例，其基本结构如下。

```js
// 若开发环境为 Rect
import React from 'react';
import ReactDom from 'react-dom';
import YourApp from 'YourApp.jsx';

const Dnd = {
  install(lf) {},
  render(lf, container) {
    ReactDom.render(<YourApp />, container);
  }
}
```

```js
// 若开发环境为 Vue
import createApp from 'vue';
import YourApp from 'YourApp.vue';

const Dnd = {
  install(lf) {},
  render(lf, container) {
    createApp(YourApp).mount(`#${container.id}`);
  }
}
```

自定义组件的详细案例请参考拖拽面板的实现[源码](https://github.com/didi/LogicFlow/blob/master/packages/extension/src/components/dnd-panel/index.ts)
