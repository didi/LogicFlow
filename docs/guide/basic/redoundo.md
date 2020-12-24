# 撤销/重做 Undo/Redo

对画布中的所有操作进行撤销和重做，可以通过内置的控制栏工具在画布上展示撤销重做按钮，或者通过调用`LogicFlow`的 API 来实现。
## 方式一

控制栏工具默认开启，效果如下

<example :height="400" ></example>

## 方式二

```js
const lf = new LogicFlow(config: Object)
lf.undo() // 撤销一步
lf.redo() // 向前一步
```