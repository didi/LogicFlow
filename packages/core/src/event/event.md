# EventCenter
eventCenter 是 Logic Flow 内部的通讯中心，通过 eventCenter 来发布事件或者监听事件，以低耦合的方式使两个实例产生交互。

在开发过程中，使用 eventCenter 也需要遵循一些规范。

## 事件名

### 规范
命名遵循 `emit('namespace:eventName')` 的结构，同类 eventName 通过 namespace 来区分。
比如 node 和 edge 抛出的都是 click 事件，但是观察者可能是不同群体，通过 namespace 使得事件监听更精确，不容易出错。

目前存在的 namespace
- node

  节点级别的事件

- edge

  连线级别的事件

- blank
  画布空白区域事件
  

### 开发注意
内部均通过 eventCenter 来抛出事件，包括以下两种情况：
- 组件通过 props 获取到 eventCenter 实例对象，然后在组件内部调用 eventCenter 的 emit 方法来抛出事件。
- graphModel 中的方法通过调用 LogicFlow 传入的 eventCenter 对象的 emit 方法抛出事件。

用户可以通过 LogicFlow 的实例 lf 去监听我们抛出的事件。

如果组件内部监听了`eventCenter`事件，在组件销毁的时候，需要取消这些监听。

## 事件对象
emit 的第二个参数。
```js
emit('namespace:eventName', {
  id, // 节点或连线的id 必传，blank非必需
  e, //  非必需，事件对象 e
  position: { // 非必须，表示触发事件时，鼠标所处画布层的位置和dom层的位置
    domOverlayPosition,
    canvasOverlayPosition,
  }
})
