---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 渐进连线
order: 6
toc: content
tag: 新插件
---

渐进连线 是流程图工具中一种动态交互方式，通过动态交互和智能吸附，帮助用户在拖拽过程中实现节点之间的精准连接。简化了操作的同时还提升了复杂流程设计的效率和体验。

## 演示

<code id="react-portal" src="@/src/tutorial/extension/proximity-connect"></code>


## 功能介绍
本插件支持两种场景下的渐进连线：
- 拖拽节点连线：鼠标拖拽节点移动过程中，根据当前节点的位置找距离最近的可连接的锚点连线
- 拖拽锚点连线：鼠标拖拽节点锚点过程中，根据鼠标当前所在位置找到距离最近的可连接的锚点连线

插件内部会监听以下几个事件，做一些动作
| 事件             | 插件行为                                                                                                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| node:dragstart   | 将当前拖拽的节点数据存储到插件中                                                                                                                                                                    |
| node:drag        | 1. 遍历画布上所有节点，计算每个节点上每个锚点与当前拖拽节点上每个锚点的距离，找出距离最短且可以连线的一组锚点存储下来<br/>2. 判断当前最短距离是否小于阈值，是的话就创建一条虚拟边，展示最终连线效果 |
| node:drop        | 删除虚拟边，创建真实边                                                                                                                                                                              |
| anchor:dragstart | 将当前拖拽的节点和触发锚点的数据存储到插件中                                                                                                                                                        |
| anchor:drag      | 1. 遍历画布上所有节点，找出距离当前鼠标所在位置最短且可以连线的一个锚点存储到插件中<br/>2. 判断当前最短距离是否小于阈值，是的话就创建一条虚拟边，展示最终连线效果                                   |
| anchor:dragend   | 删除虚拟边，创建真实边                                                                                                                                                                              |

> 一些Tip：
> 1. 找锚点前会先判断目前画布上是否已有同锚点同方向的连线，如果有，不会再创建连线；
> 2. 找锚点过程中会先取锚点数据判断当前的一组锚点是否可连线，如果不可连线不会生成虚拟边；

## 使用插件

```tsx | purex | pure
import LogicFlow from "@logicflow/core";
import { ProximityConnect } from "@logicflow/extension";
import "@logicflow/core/es/index.css";
import "@logicflow/extension/lib/style/index.css";

// 两种使用方式
// 通过 use 方法引入插件
LogicFlow.use(ProximityConnect);

// 或者通过配置项启用插件（可以配置插件属性）
const lf = new LogicFlow({
  container: document.querySelector('#app'),
  plugins: [ProximityConnect],
  pluginsOptions: {
    proximityConnect: {
      // enable, // 插件是否启用
      // distance, // 渐进连线阈值
      // reverseDirection, // 连线方向
    }
  },
});
```

## 配置项

菜单中的每一项功能，可以用一条配置进行表示。具体字段如下:

| 字段             | 类型    | 默认值                                          | 是否必须 | 描述                                                                                                             |
| ---------------- | ------- | ----------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| enable           | boolean | `true`                                          |          | 是否启用插件                                                                                                     |
| distance         | number  | 100                                             |          | 渐进连线阈值                                                                                                     |
| reverseDirection | boolean | false                                           |          | 是否创建反向连线<br/>默认连线方向是当前拖拽的节点指向最近的节点<br/>设置为true后会变为最近的节点指向当前拖拽节点 |
| virtualEdgeStyle | object  | { strokeDasharray: '10,10', stroke: '#acacac' } |          | 虚拟线样式                                                                                                       |



## API
### setThresholdDistance(distance)
用于修改连线阈值

```ts
setThresholdDistance = (distance: 'number'): void => {}
```
### setReverseDirection(reverse)
用于修改创建连线的方向

```ts
setReverseDirection = (reverse: 'boolean'): void => {}
```
### setEnable(enable)
用于设置插件启用状态

```ts
setEnable = (enable: 'boolean'): void => {}
```
### setVirtualEdgeStyle(style)
设置虚拟边样式

```ts
setVirtualEdgeStyle = (style: 'Record<string, unknown>'): void => {}
```
