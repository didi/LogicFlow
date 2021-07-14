# 框选

```ts
import LogicFlow from '@logicflow/core';
import { SelectionSelect } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css'

LogicFlow.use(SelectionSelect);

```
### 开启

```ts
lf.openSelectionSelect();
```

### 关闭

```ts
lf.closeSelectionSelect();
```

<example href="/examples/#/extension/components/selection" :height="300" ></example>
### 默认状态

默认是否开启框选功能，受到页面是否允许拖动画布影响。画布可以拖动与选区不能同时存在。

```js
const lf = new LogicFlow({
  container: document.querySelector('#app'),
  stopMoveGraph: true,
})
```

如果`stopMoveGraph`为true，也就是不允许拖动画布，那么默认则可以进行框选。

如果`stopMoveGraph`不为true, 也就是允许拖动画布，那么默认则不可以进行框选。

大多数情况下，我们期望允许拖动画布，当用户点击拖拽面板后才开启选区。请参考[拖拽面板插件](/guide/extension/component-dnd-panel.html)

