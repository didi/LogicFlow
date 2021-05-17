# 节点缩放

## 支持缩放的节点类型
目前节点缩放支持的节点类型如下：
- 矩形
- 椭圆
- 菱形

## 使用
```js
import LogicFlow from '@logicflow/core';
import { NodeResize } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css'
LogicFlow.use(NodeResize);
```
<example href="/examples/#/extension/node-resize" :height="450" ></example>

## 个性化配置
### step
缩放控制点拖动step，step默认取值为2，当设置了网格grid之后，默认取值为 2 * grid。也可以手动设置。
```js
import { NodeResize } from '@logicflow/extension';
NodeResize.step = 4;
LogicFlow.use(NodeResize);
```
### 样式
支持节点缩放边框以及控制点样式调整，支持的样式以及默认值如下:
```js 
// 边框和contol拖动点样式的设置
  style: {
    outline: {
      stroke: '#000000',
      strokeWidth: 1,
      strokeDasharray: '3,3',
    },
    controlPoint: {
      width: 7,
      height: 7,
      fill: '#FFFFFF',
      stroke: '#000000',
    },
  },
```
使用如下：
```js
 NodeResize.style.outline = {
  ...NodeResize.style.outline,
  stroke: '#1E90FF',
  strokeDasharray: '',
}
LogicFlow.use(NodeResize);
```
更过细节见 [节点缩放的实现方案](/article/NodeResize.html)