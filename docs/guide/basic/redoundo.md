# 撤销/重做 Undo/Redo

对画布中的所有操作进行撤销和重做，可以通过内置的[控制栏工具](/guide/extension/component-control.html)。在画布上展示撤销重做按钮，或者通过调用`LogicFlow`的 API 来实现。

```js
const lf = new LogicFlow(config: Object)
lf.undo() // 撤销一步
lf.redo() // 向前一步
```


