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
  pluginsOptions: {
    PoolElements: {
      cascadeDeleteChildren: true,
      minLaneCount: 1,
      collapse: {
        pool: true,
        lane: true,
      },
    },
  },
})
```

## 配置项

| 配置 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `cascadeDeleteChildren` | `boolean` | `true` | 删除 pool/lane 时是否一并删除内部 lane 和业务节点。为 `false` 时只删除容器并释放子节点。 |
| `minLaneCount` | `number` | `1` | 每个 pool 至少保留的 lane 数量；单个 pool 可用 `properties.minLaneCount` 覆盖。设为 `0` 时，最后一条 lane 跨 pool 迁移后会自动删除原空 pool。 |
| `collapse.pool` | `boolean` | `true` | 是否允许 pool 折叠。 |
| `collapse.lane` | `boolean` | `true` | 是否允许 lane 折叠。 |

### 标题与折叠间距

`direction` 仍只表达泳道排列方向：`horizontal` 为上下排列，`vertical` 为左右排列。可通过 `properties.titlePosition` 设置 Pool 标题边，通过 `properties.laneConfig.titlePosition` 设置 Lane 默认标题边；两者均支持 `top`、`right`、`bottom`、`left`。Lane 可用自身的 `properties.titlePosition` 覆盖 Pool 默认值。

旧图不提供这些字段时保持历史显示：`horizontal` 使用左侧标题，`vertical` 使用顶部标题。`laneConfig.collapsedLaneGap` 默认 `12`，折叠 Lane 与相邻 Lane 间会预留该间距以保证连线可见。

> **兼容说明**：泳池泳道仍使用 `children` 和 `properties.parent` 表达层级关系。升级后旧数据无需迁移；新增配置都是可选项。

> **默认删除行为**：`cascadeDeleteChildren` 默认为 `true`，保持历史行为。删除 lane 会同时删除 lane 内业务节点；如果业务希望保留节点，请显式设为 `false`。

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
  minLaneCount?: number
  collapsible?: boolean
  children?: string[]
}
```

### 泳道（lane）

```ts
type LaneProperties = {
  parent?: string
  width?: number
  height?: number
  collapsible?: boolean
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

### Lane 跨 Pool 移动与粘贴

Lane 不能脱离 pool 独立存在。拖拽 lane 时，只有落入目标 pool 才会建立新的归属关系；目标为普通节点、分组或空白区域时会被拒绝。跨 pool 移动会保留 lane 内业务节点相对 lane 的位置，并同步更新旧/新 pool 的 `children`。当源 pool 的 `minLaneCount` 为 `0` 且迁移后没有 lane 时，插件会删除原空 pool；默认值为 `1` 时，最后一条 lane 的迁移会被拒绝。

复制 lane 时，如果当前唯一选中的目标是 pool，会把 lane 粘贴进该 pool；如果没有选中的目标 pool，粘贴会自动创建一个新 pool 作为容器。

### Lane 内排序

拖拽 lane 时，鼠标进入目标 lane 的槽位即触发候选排序：向下或向右进入时预览插入到目标之后，向上或向左进入时预览插入到目标之前。被拖拽的 lane 会置顶，其他 lane 在固定槽位中以动画腾挪；横向 pool 显示横向落位框，纵向 pool 显示纵向落位框。只有 drop 后才会更新 `pool.children`，取消或落入非法区域不会写入中间态。

### 插入/删除泳道

选中泳道后，泳道右侧会显示操作按钮：

- 插入：在当前泳道的前/后插入一条新泳道（横向泳池为“上/下”，竖向泳池为“左/右”）
- 删除：删除当前泳道（默认至少保留 1 条泳道，可通过 `minLaneCount` 调整）

### Resize 与折叠

Pool 本体不允许 resize。选中 Pool 时会显示与 resize 节点同位置的虚线边框作为选中反馈，但不会出现 resize 控制点。泳道尺寸变化会驱动所属 pool 重新计算尺寸；横向 pool 中调整 lane 高度会改变 pool 高度，调整 lane 宽度会同步所有 lane 的宽度。Lane 折叠后仅保留标题区，内容区和内部节点会隐藏。

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

#### moveLaneToPool(laneId, targetPoolId, insertIndex)

将当前 pool 内的 lane 移动到另一个 pool 的指定位置。若源 pool 会低于 `minLaneCount`，返回 `false`；当 `minLaneCount` 为 `0` 且迁出最后一条 lane 时，会删除原空 pool。

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

### lane:paste-not-allowed

复制粘贴 lane 时，如果粘贴位置没有可用目标 pool，会触发该事件：

```ts | pure
lf.on('lane:paste-not-allowed', ({ lane, reason }) => {
  console.log('paste not allowed', lane.id, reason)
})
```
