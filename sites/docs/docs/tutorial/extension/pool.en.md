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
})
```

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
  children?: string[]
}
```

### Lane (`lane`)

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

### Insert/Delete Lanes

When a lane is selected, operation icons appear on the right:

- Insert: insert a new lane before/after the current lane (Up/Down for horizontal pools, Left/Right for vertical pools)
- Delete: delete the current lane (at least one lane is kept)

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

