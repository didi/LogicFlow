# 节点缩放

## 支持缩放的节点类型
目前节点缩放支持的节点类型如下：
- 矩形
- 椭圆
- 菱形
- HTML节点
## 使用
```js
import LogicFlow from '@logicflow/core';
import { NodeResize } from '@logicflow/extension';
import "@logicflow/core/dist/style/index.css";
import '@logicflow/extension/lib/style/index.css'
```

## 事件
节点缩放后抛出事件`node:resize`，抛出数据包括节点缩放前后的节点位置、节点大小信息， 数据为{oldNodeSize, newNodeSize}, 详细字段如下。
| 名称  | 类型   | 描述           |
| :---- | :----- | :------------- |
| id    | String | 节点 id|
| type | String | 节点类型 |
| modelType | String | 节点图形类型，已内部定义 |
| x | Number | 节点中心x轴坐标 |
| y | Number | 节点中心y轴坐标 |
| rx | Number | x轴半径(椭圆、菱形) |
| ry | Number | y轴半径(椭圆、菱形) |
| width | Number | 节点宽度(矩形) |
| height | Number | 节点高度(矩形) |

```js
lf.on('node:resize', ({oldNodeSize, newNodeSize}) => {
  console.log(oldNodeSize, newNodeSize)
})
```
