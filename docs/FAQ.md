# FAQ

## LogicFlow 是否支持 Vue、React 或者 Angular？

支持。LogicFlow 是一个 JavaScript 库，不依赖任何宿主环境，在任何框架中都可以使用。

## LogicFlow 是对 bpmn.js 的封装吗？

不是。LogicFlow 不是基于 bpmn.js 实现的，bpmn.js 在拓展性上具有局限性，LogicFlow 提供了更加灵活的拓展机制，可以用来自定义 BPMN 元素。

目前，在 [@logicflow/extension](/guide/extension/bpmn-element.html) 包中已经实现了部分 BPMN 元素。

## LogicFlow 支持 IE 浏览器吗？

兼容IE11，需要引入promise polyfill

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/promise-polyfill/8.2.0/polyfill.min.js"></script>
```

由于svg的一些功能在IE11上存在限制，目前IE11还存在细节上的问题：
- 鼠标在锚点上会有持续闪烁

