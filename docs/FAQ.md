# FAQ

## LogicFlow 是否支持 Vue、React 或者 Angular？

支持。LogicFlow 是一个 JavaScript 库，不依赖任何宿主环境，在任何框架中都可以使用。

## LogicFlow 是对 bpmn.js 的封装吗？

不是。LogicFlow 不是基于 bpmn.js 实现的，bpmn.js 在拓展性上具有局限性，LogicFlow 提供了更加灵活的拓展机制，可以用来自定义 BPMN 元素。

目前，在 [@logicflow/extension](/guide/extension/bpmn-element.html) 包中已经实现了部分 BPMN 元素。

## LogicFlow 支持 IE 浏览器吗？

暂时不支持。LogicFLow 内部受到 MobX 5.x 版本的限制，不能兼容 IE。

你可以进入这个 [issue](https://github.com/didi/LogicFlow/issues/138) 查看 LogicFlow 对于兼容 IE 的最新讨论和进展。
