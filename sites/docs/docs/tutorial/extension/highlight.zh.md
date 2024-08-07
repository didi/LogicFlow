---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 高亮 (Highlight)
order: 12
toc: content
tag: 优化
---

当一张画布上的元素逐渐增多时，快速分辨出当前获焦的节点是谁，都连了几条线，连到了哪些节点上的难度也会逐渐增大，为了方便用户快速看清当前获焦节点的关联信息，我们提供了高亮功能。

## 启用
```tsx | purex | pure

import LogicFlow from '@logicflow/core'
import { Highlight } from '@logicflow/extension'
import '@logicflow/extension/es/index.css'

LogicFlow.use(Highlight)
```

## 配置项
| 字段     | 类型      | 作用              | 是否必须 | 描述                                                                                                                 |
|--------|---------|-----------------|------|--------------------------------------------------------------------------------------------------------------------|
| mode   | string  | 高亮类型，用于控制高亮展示效果 |      | 该配置项支持传入三个值：<br/>1. 'single': 高亮当前节点/边<br/>2. 'path': 高亮当前节点/边所在路径上所有的边和节点<br/>3. 'neighbour': 高亮当前节点/边直接关联的所有边和节点 |
| enable | boolean | 是否启用高亮          |      | 该配置项用于控制是否展示高亮效果                                                                                                   |

## 默认状态
默认情况下，高亮插件处于启用状态，使用的是 高亮当前节点/边所在路径上所有的边和节点 模式，鼠标移入节点内部就会生效。

## API
Highlight插件对外提供了修改状态的API:

### setMode
设置高亮方式，用法：

```tsx | purex | pure
lf.extension.highlight.setMode('single');

```

### setEnable
设置启用状态，用法：

```tsx | purex | pure
// 设置不启用高亮
lf.extension.highlight.setEnable(false);

```
