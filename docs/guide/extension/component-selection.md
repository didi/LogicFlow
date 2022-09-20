# 框选 SelectionSelect

```ts
import LogicFlow from '@logicflow/core';
import { SelectionSelect } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css'

LogicFlow.use(SelectionSelect);

```
### 开启

```ts
lf.openSelectionSelect();

// 1.1.0新增用法
lf.extension.selectionSelect.openSelectionSelect();
```

### 关闭

```ts
lf.closeSelectionSelect();
// 1.1.0新增用法
lf.extension.selectionSelect.closeSelectionSelect();
```

<!-- <example href="/examples/#/extension/components/selection" :height="300" ></example> -->
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

### 设置选区灵敏度

- 默认需要框选整个节点才选中节点
- 默认需要框选边的起点、终点才选中边

可以调用插件方法`setSelectionSense`来重新设置

|参数|默认值|描述|
|-|-|-| 
|isWholeEdge|true|是否要边的起点终点都在选区范围才算选中|
|isWholeNode|true|是否要节点的全部点都在选区范围才算选中|

用法：

```js
lf.extension.selectionSelect.setSelectionSense(false, true);
```

### 示例

<iframe src="https://codesandbox.io/embed/trusting-archimedes-m0bn4r?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="logicflow-selection"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>