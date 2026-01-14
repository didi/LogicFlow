---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 泳池泳道 (Pool)
order: 14
toc: content
---

LogicFlow 支持泳池泳道能力。泳池（pool）用于承载多个泳道（lane），泳道用于承载业务节点，并支持在拖拽/放置时自动把节点加入对应泳道，同时提供插入/删除泳道的交互入口。

## 演示

<code id="react-portal" src="@/src/tutorial/extension/pool"></code>

## 使用插件

```tsx | pure
import LogicFlow from '@logicflow/core'
import { PoolElements } from '@logicflow/extension'
import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

const lf = new LogicFlow({
  container: document.querySelector('#container') as HTMLElement,
  plugins: [PoolElements],
  allowResize: true,
})
```

## 快速开始

只需要新增一个 `type: 'pool'` 的节点即可。泳池在首次渲染且没有泳道时，会自动创建一条默认泳道。

```ts | pure
lf.render({
  nodes: [
    {
      id: 'pool_1',
      type: 'pool',
      x: 400,
      y: 260,
      text: '泳池',
      properties: {
        direction: 'horizontal',
        width: 520,
        height: 360,
      },
    },
  ],
  edges: [],
})
```

## 数据格式

泳池/泳道基于 DynamicGroup 机制实现，因此它们仍然是“特殊节点”。在数据层面，你可以使用 `children` 来描述层级关系；同时插件也会在交互过程中自动维护子节点的 `properties.parent`。

### 泳池（pool）

```ts
type PoolProperties = {
  direction?: 'horizontal' | 'vertical'
  width?: number
  height?: number
  laneConfig?: Record<string, unknown>
  children?: string[]
}
```

### 泳道（lane）

```ts
type LaneProperties = {
  parent?: string
  width?: number
  height?: number
  isRestrict?: boolean
  autoResize?: boolean
  children?: string[]
}
```

### 完整示例

```ts | pure
lf.render({
  nodes: [
    {
      id: 'pool_1',
      type: 'pool',
      x: 500,
      y: 260,
      text: '横向泳池',
      properties: {
        direction: 'horizontal',
        width: 520,
        height: 360,
        children: ['lane_1', 'lane_2'],
      },
      children: ['lane_1', 'lane_2'],
    },
    {
      id: 'lane_1',
      type: 'lane',
      x: 540,
      y: 340,
      text: '泳道1',
      properties: {
        parent: 'pool_1',
        width: 440,
        height: 180,
        isRestrict: true,
        autoResize: false,
        children: ['rect_1'],
      },
      children: ['rect_1'],
    },
    {
      id: 'lane_2',
      type: 'lane',
      x: 540,
      y: 160,
      text: '泳道2',
      properties: {
        parent: 'pool_1',
        width: 440,
        height: 180,
        children: ['circle_1'],
      },
      children: ['circle_1'],
    },
    {
      id: 'rect_1',
      type: 'rect',
      x: 470,
      y: 350,
      text: '节点A',
      properties: {
        parent: 'lane_1',
      },
    },
    {
      id: 'circle_1',
      type: 'circle',
      x: 620,
      y: 150,
      text: '节点B',
      properties: {
        parent: 'lane_2',
      },
    },
  ],
  edges: [],
})
```

## 交互说明

### 节点自动归属泳道

当你把节点拖拽/放置到某条泳道区域内时，插件会自动把节点加入该泳道。若节点原本属于其他泳道，会先从旧泳道移除，再加入新泳道。

### 插入/删除泳道

选中泳道后，泳道右侧会显示操作按钮：

- 插入：在当前泳道的前/后插入一条新泳道（横向泳池为“上/下”，竖向泳池为“左/右”）
- 删除：删除当前泳道（至少保留 1 条泳道）

## API

### 插件类 API

启用插件后，可通过 `lf.graphModel.dynamicGroup` 访问插件实例方法：

#### getLaneByNodeId(nodeId)

根据节点 id 获取其所属泳道的模型。

```ts | pure
const laneModel = lf.graphModel.dynamicGroup.getLaneByNodeId('node_1')
```

#### getLaneByBounds(bounds, nodeData)

根据边界框获取该区域所属的泳道。当泳道重合时，优先返回最上层的泳道。

```ts | pure
const bounds = { minX: 100, minY: 100, maxX: 200, maxY: 200 }
const nodeData = { id: 'temp', type: 'rect' }
const laneModel = lf.graphModel.dynamicGroup.getLaneByBounds(bounds, nodeData)
```

### 泳池（pool）模型方法

#### getLanes

获取泳池内所有泳道模型。

#### addChildAbove / addChildBelow / addChildLeft / addChildRight

在指定泳道的前/后插入新泳道（方向由泳池布局决定）。

#### deleteChild(childId)

删除泳道。

### 泳道（lane）模型方法

#### getPoolId / getPoolModel

从泳道反查其所属泳池。

## 事件

### lane:not-allowed

当节点不被允许加入目标泳道时触发：

```ts | pure
lf.on('lane:not-allowed', ({ lane, node }) => {
  console.log('not allowed', lane.id, node.id)
})
```

