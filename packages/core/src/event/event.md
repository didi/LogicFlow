# EventCenter

`eventCenter` 是 LogicFlow 内部的通讯中心，通过 `eventCenter` 来发布事件或者监听事件，以低耦合的方式使两个实例产生交互。

在开发过程中，使用 `eventCenter` 也需要遵循一些规范。

## 事件名

### 规范

命名遵循 `namespace:eventName` 的结构，同类 eventName 通过 namespace 来区分。

比如 node 和 edge 抛出的都是 click 事件，但是观察者可能是不同群体，通过 namespace 使得事件监听更精确，不容易出错。

目前 core 包中定义的 namespace 包括：

- `node`：节点事件
- `edge`：边事件
- `anchor`：锚点事件
- `blank`：画布空白区域事件
- `history`：历史记录事件
- `selection`：选区事件

### 开发注意

内部均通过 `eventCenter` 来抛出事件，包括以下两种情况：

- `graphModel` 中通过 `this.eventCenter` 调用 `eventCenter` 对象的 `emit` 方法抛出事件。
- 组件通过 `props` 获取到 `eventCenter` 实例对象，然后在组件内部调用 `eventCenter` 的 `emit` 方法来抛出事件。
  - 部分组件会从 `props` 中直接获取 `eventCenter` 实例
  - 而另一部分组件则需要从 `props` 中获取 `graphModel` 实例，然后通过 `graphModel.eventCenter` 获取 `eventCenter` 实例

用户可以通过 LogicFlow 的实例 `lf` 去监听我们抛出的事件。

如果组件内部监听了 `eventCenter` 事件，在组件销毁的时候，需要取消这些监听。

## 事件对象

在使用 `emit` 方法抛出事件时，可以传递一个对象作为第二个参数，该对象将作为对应的事件监听器的回调函数的入参。

事件对象可以包含任何与当前事件相关的信息，比如节点的 id，边的 id，原生鼠标事件对象等。

以 `node:click` 事件为例：

```ts
// 抛出 node:click 事件
eventCenter.emit('node:click', {
  data: {
    // 节点数据
  },
  e: MouseEvent,
  position: {
    // 鼠标点击的位置信息
  }
});

// 监听 node:click 事件
eventCenter.on('node:click', (event) => {
  console.log(event); // event 即为抛出事件时传递的对象
});

// 使用解构赋值可以便捷地获取事件对象中的信息
eventCenter.on('node:click', ({ data, e, position }) => {
  console.log(data, e, position);
});
```
