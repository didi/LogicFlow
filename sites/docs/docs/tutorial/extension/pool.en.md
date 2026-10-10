---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: Swimlane (Pool)
order: 14
toc: content
---

LogicFlow provides a swimlane solution built on the DynamicGroup mechanism. A pool (`pool`) contains multiple lanes (`lane`). Lanes hold business nodes, and the plugin can automatically assign nodes to lanes during drag/drop. It also provides built-in interactions to insert and delete lanes.

## Demonstration

<code id="react-portal" src="@/src/tutorial/extension/pool"></code>

## Using the Plugin

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

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `cascadeDeleteChildren` | `boolean` | `true` | Whether deleting a pool/lane also deletes its child lanes and nodes. When `false`, only the container is removed and children are released. |
| `minLaneCount` | `number` | `1` | Minimum number of lanes each pool must keep. A single pool can override it with `properties.minLaneCount`. When set to `0`, moving out the final lane removes the empty source pool. |
| `collapse.pool` | `boolean` | `true` | Whether pools can be collapsed. |
| `collapse.lane` | `boolean` | `true` | Whether lanes can be collapsed. |

### Title Position And Collapsed Lane Gap

`direction` continues to describe lane arrangement only: `horizontal` stacks lanes vertically and `vertical` lays them out side by side. Use `properties.titlePosition` for the Pool title edge and `properties.laneConfig.titlePosition` for the default Lane title edge. Both accept `top`, `right`, `bottom`, and `left`; a Lane can override the default through its own `properties.titlePosition`.

Existing graphs keep their historical appearance when these fields are omitted: `horizontal` resolves to a left title and `vertical` resolves to a top title. `laneConfig.collapsedLaneGap` defaults to `12` so edges remain visible between collapsed Lanes.

> **Compatibility:** Pool/lane hierarchy still uses `children` and `properties.parent`. Existing graph data does not need migration; all new options are optional.

> **Default delete behavior:** `cascadeDeleteChildren` defaults to `true`, matching the historical behavior. Deleting a lane also deletes its child nodes. Set it to `false` if your app should keep those nodes.

## Quick Start

Create a node with `type: 'pool'`. If no lanes exist when the pool is first rendered, a default lane is created automatically.

```ts | pure
lf.render({
  nodes: [
    {
      id: 'pool_1',
      type: 'pool',
      x: 400,
      y: 260,
      text: 'Pool',
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

## Data Format

Pool/Lane nodes are special nodes. You can use `children` to describe hierarchy. During interactions, the plugin also maintains `properties.parent` for child nodes automatically.

### Pool (`pool`)

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

### Lane (`lane`)

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

### Full Example

```ts | pure
lf.render({
  nodes: [
    {
      id: 'pool_1',
      type: 'pool',
      x: 500,
      y: 260,
      text: 'Pool (H)',
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
      text: 'Lane 1',
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
      text: 'Lane 2',
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
      text: 'Node A',
      properties: {
        parent: 'lane_1',
      },
    },
    {
      id: 'circle_1',
      type: 'circle',
      x: 620,
      y: 150,
      text: 'Node B',
      properties: {
        parent: 'lane_2',
      },
    },
  ],
  edges: [],
})
```

## Interactions

### Automatic Lane Assignment

When you drag/drop a node into a lane area, the plugin assigns the node to that lane. If the node already belongs to another lane, it is removed from the previous lane first.

### Moving And Pasting Lanes Between Pools

A lane cannot exist outside a pool. Dragging a lane only succeeds when the lane lands inside a target pool. Drops onto regular nodes, groups, or empty canvas areas are rejected. Cross-pool lane movement keeps the business nodes inside the lane at the same relative positions and updates `children` on both pools. When the source pool has `minLaneCount: 0` and becomes empty, the plugin removes it; with the default value of `1`, moving the final lane is rejected.

When pasting copied lanes, the plugin appends them to the uniquely selected target pool. If no target pool is selected, it creates a new pool as the pasted lanes' container.

### Reordering Lanes Within A Pool

Dragging a lane previews a reorder as soon as the pointer enters another lane slot: entering from below or the right inserts after that lane, while entering from above or the left inserts before it. The dragged lane is raised above the other lanes, which move between fixed slots with a short animation. Horizontal pools show a horizontal drop box and vertical pools show a vertical drop box. `pool.children` changes only after drop, so cancelling or dropping on an invalid target does not persist a transient position.

### Insert/Delete Lanes

When a lane is selected, operation icons appear on the right:

- Insert: insert a new lane before/after the current lane (Up/Down for horizontal pools, Left/Right for vertical pools)
- Delete: delete the current lane (one lane is kept by default; configure `minLaneCount` to change this)

### Resize And Collapse

Pools themselves cannot be resized. A selected Pool shows the same dashed outline placement as a resizable node, without resize controls. Resizing lanes drives the owning pool size. In a horizontal pool, changing a lane height changes the pool height, while changing a lane width syncs all lane widths. A collapsed lane keeps only its title area; its content area and child nodes are hidden.

## API

### Plugin API

After enabling the plugin, access the plugin instance via `lf.graphModel.dynamicGroup`:

#### getLaneByNodeId(nodeId)

Get the lane model that a node belongs to.

```ts | pure
const laneModel = lf.graphModel.dynamicGroup.getLaneByNodeId('node_1')
```

#### getLaneByBounds(bounds, nodeData)

Get the lane model for a given bounds. If multiple lanes overlap, the topmost lane is returned.

```ts | pure
const bounds = { minX: 100, minY: 100, maxX: 200, maxY: 200 }
const nodeData = { id: 'temp', type: 'rect' }
const laneModel = lf.graphModel.dynamicGroup.getLaneByBounds(bounds, nodeData)
```

### Pool Model Methods

#### getLanes

Get all lane models in the pool.

#### addChildAbove / addChildBelow / addChildLeft / addChildRight

Insert a new lane before/after a reference lane (depending on pool direction).

#### deleteChild(childId)

Delete a lane.

#### moveLaneToPool(laneId, targetPoolId, insertIndex)

Move a lane from the current pool to another pool at the given index. Returns `false` when the source pool would violate `minLaneCount`; when it is `0`, moving out the final lane removes the empty source pool.

### Lane Model Methods

#### getPoolId / getPoolModel

Get the owning pool of a lane.

## Events

### lane:not-allowed

Triggered when a node is not allowed to be appended into a lane:

```ts | pure
lf.on('lane:not-allowed', ({ lane, node }) => {
  console.log('not allowed', lane.id, node.id)
})
```

### lane:paste-not-allowed

Triggered when a copied lane cannot find a valid target pool:

```ts | pure
lf.on('lane:paste-not-allowed', ({ lane, reason }) => {
  console.log('paste not allowed', lane.id, reason)
})
```
