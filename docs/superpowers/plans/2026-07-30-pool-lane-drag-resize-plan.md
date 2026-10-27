# Pool Lane Drag Resize Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make PoolElements treat lane movement as in-pool ordering, preserve pool title space, keep pool content fully occupied by lanes, and keep lane resize behavior consistent with swimlane layout rules.

**Architecture:** `PoolElements` owns short-lived drag state and event routing. `PoolModel` owns lane order, pool/lane layout, and resize normalization. `PoolView` renders the insertion indicator from non-exported UI state on `PoolModel`.

**Tech Stack:** TypeScript, LogicFlow core models/events, MobX observables, Jest/jsdom, pnpm.

## Global Constraints

- Use `pnpm` only.
- Use TDD: write or update the failing test first, confirm it fails for the right reason, then implement.
- Change shared behavior in `packages/extension/src/pool`, not in examples.
- Preserve public API compatibility unless a task explicitly introduces a documented additive API.
- `pool.children` is the final source of lane order; coordinates are only interaction input.
- `pool` title area must always be preserved; only the content area is filled by lanes.
- Lane position drag is only in-pool reorder; lane cannot be dragged out of or across pools.
- Lane resize keeps the arrangement-axis size independent and synchronizes only the cross-axis size.
- Do not stage or commit changes automatically; leave all implementation changes in the working tree for user review.

---

## File Structure

- Modify `packages/extension/src/pool/PoolModel.ts`
  - Add ordered-lane helpers, insertion index calculation, reorder, unified layout, child-moving helper, and non-exported insertion indicator state.
- Modify `packages/extension/src/pool/index.ts`
  - Route lane drag lifecycle, block free lane movement, clear indicator state, and keep normal node membership behavior intact.
- Modify `packages/extension/src/pool/PoolView.ts`
  - Render the lane insertion indicator inside the pool content area.
- Modify `packages/extension/src/pool/LaneModel.ts`
  - Remove lane-drag behavior that moves the parent pool; keep lane children movement semantics focused on business nodes.
- Modify `packages/extension/__test__/pool/model.test.ts`
  - Unit tests for order helpers, lane drag move list, layout geometry, and non-exported UI state.
- Modify `packages/extension/__test__/pool/integration.test.ts`
  - Integration tests for add/delete/reorder/layout/resize behavior.
- Modify `packages/extension/__test__/pool/plugin.test.ts`
  - Plugin tests for drag state, move rules, insertion indicator updates, drop cleanup, and same-pool-only behavior.
- Optional modify `examples/vue3-app/src/views/PoolLaneWorkbenchView.vue`
  - Only after package behavior is implemented, expose a manual verification scenario for lane reorder/resize.

---

### Task 1: PoolModel Ordered Layout Core

**Files:**
- Modify: `packages/extension/src/pool/PoolModel.ts`
- Test: `packages/extension/__test__/pool/integration.test.ts`

**Interfaces:**
- Produces: `PoolModel.getOrderedLanes(): LaneModel[]`
- Produces: `PoolModel.layoutLanesByOrder(options?: { reason?: 'init' | 'add' | 'delete' | 'reorder' | 'resize'; resizedLaneId?: string; resizedAxis?: 'width' | 'height' }): void`
- Produces: `PoolModel.moveLaneWithChildren(lane: LaneModel, nextX: number, nextY: number): void`
- Consumes: existing `PoolModel.getLanes()`, `PoolModel.isHorizontal`, `poolConfig.titleSize`

- [ ] **Step 1: Write failing tests for layout from `pool.children` order**

Add tests to `packages/extension/__test__/pool/integration.test.ts`:

```ts
test('lays out horizontal lanes from pool.children order without overlap', () => {
  const lf = createPoolLF()
  lf.render(createPoolWithTwoLanes('horizontal'))

  const { pool } = getPoolAndLanes(lf)
  const lane1 = lf.getNodeModelById('lane_1') as any
  const lane2 = lf.getNodeModelById('lane_2') as any

  pool.children = new Set(['lane_2', 'lane_1'])
  pool.layoutLanesByOrder({ reason: 'reorder' })

  expect(pool.getOrderedLanes().map((lane: any) => lane.id)).toEqual([
    'lane_2',
    'lane_1',
  ])
  expect(lane2.y).toBeLessThan(lane1.y)
  expect(lane1.x).toBe(lane2.x)
  expect(lane1.width).toBe(lane2.width)
  expect(pool.height).toBe(lane1.height + lane2.height)
})

test('lays out vertical lanes from pool.children order without overlap', () => {
  const lf = createPoolLF()
  lf.render(createPoolWithTwoLanes('vertical'))

  const { pool } = getPoolAndLanes(lf)
  const lane1 = lf.getNodeModelById('lane_1') as any
  const lane2 = lf.getNodeModelById('lane_2') as any

  pool.children = new Set(['lane_2', 'lane_1'])
  pool.layoutLanesByOrder({ reason: 'reorder' })

  expect(pool.getOrderedLanes().map((lane: any) => lane.id)).toEqual([
    'lane_2',
    'lane_1',
  ])
  expect(lane2.x).toBeLessThan(lane1.x)
  expect(lane1.y).toBe(lane2.y)
  expect(lane1.height).toBe(lane2.height)
  expect(pool.width).toBe(lane1.width + lane2.width)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest packages/extension/__test__/pool/integration.test.ts --runInBand`

Expected: FAIL because `pool.layoutLanesByOrder` and `pool.getOrderedLanes` are not defined.

- [ ] **Step 3: Implement minimal ordered layout methods**

In `packages/extension/src/pool/PoolModel.ts`, add methods that:

```ts
getOrderedLanes() {
  return Array.from(this.children)
    .map((childId) => this.graphModel.getNodeModelById(childId))
    .filter((node) => node && String(node.type) === 'lane')
}

layoutLanesByOrder(options = {}) {
  const lanes = this.getOrderedLanes()
  if (lanes.length === 0) return

  if (this.isHorizontal) {
    const contentWidth = Math.max(...lanes.map((lane: any) => lane.width))
    this.width = contentWidth + poolConfig.titleSize
    this.height = lanes.reduce((sum: number, lane: any) => sum + lane.height, 0)
    let top = this.y - this.height / 2
    lanes.forEach((lane: any) => {
      lane.width = contentWidth
      const nextX = this.x - this.width / 2 + poolConfig.titleSize + contentWidth / 2
      const nextY = top + lane.height / 2
      this.moveLaneWithChildren(lane, nextX, nextY)
      top += lane.height
    })
  } else {
    const contentHeight = Math.max(...lanes.map((lane: any) => lane.height))
    this.width = lanes.reduce((sum: number, lane: any) => sum + lane.width, 0)
    this.height = contentHeight + poolConfig.titleSize
    let left = this.x - this.width / 2
    lanes.forEach((lane: any) => {
      lane.height = contentHeight
      const nextX = left + lane.width / 2
      const nextY = this.y - this.height / 2 + poolConfig.titleSize + contentHeight / 2
      this.moveLaneWithChildren(lane, nextX, nextY)
      left += lane.width
    })
  }
  this.updateTextPosition()
}
```

Rename the existing `moveLane` body to `moveLaneWithChildren` for now, preserving behavior. Do not remove old callers yet; have `moveLane` call `moveLaneWithChildren` to keep compatibility:

```ts
moveLane(lane: any, newX: number, newY: number) {
  this.moveLaneWithChildren(lane, newX, newY)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec jest packages/extension/__test__/pool/integration.test.ts --runInBand`

Expected: PASS for existing tests and the two new layout tests.

---

### Task 2: Reorder API and Add/Delete Migration

**Files:**
- Modify: `packages/extension/src/pool/PoolModel.ts`
- Test: `packages/extension/__test__/pool/integration.test.ts`

**Interfaces:**
- Consumes: `PoolModel.layoutLanesByOrder`
- Produces: `PoolModel.reorderLane(laneId: string, insertIndex: number): boolean`
- Produces: add/delete lane flows that update `pool.children` order before layout.

- [ ] **Step 1: Write failing tests for reorder and no-op reorder**

Add tests:

```ts
test('reorders a lane by updating pool.children before layout', () => {
  const lf = createPoolLF()
  lf.render(createPoolWithTwoLanes('horizontal'))

  const { pool } = getPoolAndLanes(lf)
  const changed = pool.reorderLane('lane_2', 0)

  expect(changed).toBe(true)
  expect(Array.from(pool.children)).toEqual(['lane_2', 'lane_1'])
  expect(pool.getOrderedLanes().map((lane: any) => lane.id)).toEqual([
    'lane_2',
    'lane_1',
  ])
})

test('reorderLane returns false when visual order does not change', () => {
  const lf = createPoolLF()
  lf.render(createPoolWithTwoLanes('horizontal'))

  const { pool } = getPoolAndLanes(lf)

  expect(pool.reorderLane('lane_1', 0)).toBe(false)
  expect(Array.from(pool.children)).toEqual(['lane_1', 'lane_2'])
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest packages/extension/__test__/pool/integration.test.ts --runInBand`

Expected: FAIL because `reorderLane` is not defined.

- [ ] **Step 3: Implement `reorderLane`**

Add to `PoolModel`:

```ts
reorderLane(laneId: string, insertIndex: number): boolean {
  const laneIds = Array.from(this.children).filter((id) => {
    const node = this.graphModel.getNodeModelById(id)
    return node && String(node.type) === 'lane'
  })
  const originIndex = laneIds.indexOf(laneId)
  if (originIndex === -1) return false

  const withoutLane = laneIds.filter((id) => id !== laneId)
  const nextIndex = Math.max(0, Math.min(insertIndex, withoutLane.length))
  withoutLane.splice(nextIndex, 0, laneId)
  if (withoutLane.join('|') === laneIds.join('|')) return false

  this.children = new Set(withoutLane)
  const lane = this.graphModel.getNodeModelById(laneId)
  lane?.setProperties({ ...lane.properties, parent: this.id })
  this.layoutLanesByOrder({ reason: 'reorder' })
  return true
}
```

Update `addLane`, `createDefaultLane`, and `deleteChild` so they call `layoutLanesByOrder({ reason: 'add' | 'delete' | 'init' })` after maintaining `this.children`. Keep public methods `addChildAbove`, `addChildBelow`, `addChildLeft`, `addChildRight`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec jest packages/extension/__test__/pool/integration.test.ts --runInBand`

Expected: PASS.

---

### Task 3: Lane Resize Rules

**Files:**
- Modify: `packages/extension/src/pool/PoolModel.ts`
- Test: `packages/extension/__test__/pool/integration.test.ts`

**Interfaces:**
- Consumes: `layoutLanesByOrder({ reason: 'resize', resizedLaneId, resizedAxis })`
- Produces: horizontal/vertical resize normalization.

- [ ] **Step 1: Write failing resize tests**

Add tests:

```ts
test('horizontal lane height resize only changes that lane height and pool height sum', () => {
  const lf = createPoolLF()
  lf.render(createPoolWithTwoLanes('horizontal'))

  const { pool } = getPoolAndLanes(lf)
  const lane1 = lf.getNodeModelById('lane_1') as any
  const lane2 = lf.getNodeModelById('lane_2') as any

  lane1.height = 240
  pool.layoutLanesByOrder({
    reason: 'resize',
    resizedLaneId: lane1.id,
    resizedAxis: 'height',
  })

  expect(lane1.height).toBe(240)
  expect(lane2.height).toBe(180)
  expect(pool.height).toBe(420)
})

test('horizontal lane width resize syncs all lane widths and pool title space', () => {
  const lf = createPoolLF()
  lf.render(createPoolWithTwoLanes('horizontal'))

  const { pool } = getPoolAndLanes(lf)
  const lane1 = lf.getNodeModelById('lane_1') as any
  const lane2 = lf.getNodeModelById('lane_2') as any

  lane1.width = 520
  pool.layoutLanesByOrder({
    reason: 'resize',
    resizedLaneId: lane1.id,
    resizedAxis: 'width',
  })

  expect(lane1.width).toBe(520)
  expect(lane2.width).toBe(520)
  expect(pool.width).toBe(520 + poolConfig.titleSize)
})

test('vertical lane width resize only changes that lane width and pool width sum', () => {
  const lf = createPoolLF()
  lf.render(createPoolWithTwoLanes('vertical'))

  const { pool } = getPoolAndLanes(lf)
  const lane1 = lf.getNodeModelById('lane_1') as any
  const lane2 = lf.getNodeModelById('lane_2') as any

  lane1.width = 240
  pool.layoutLanesByOrder({
    reason: 'resize',
    resizedLaneId: lane1.id,
    resizedAxis: 'width',
  })

  expect(lane1.width).toBe(240)
  expect(lane2.width).toBe(180)
  expect(pool.width).toBe(420)
})

test('vertical lane height resize syncs all lane heights and pool title space', () => {
  const lf = createPoolLF()
  lf.render(createPoolWithTwoLanes('vertical'))

  const { pool } = getPoolAndLanes(lf)
  const lane1 = lf.getNodeModelById('lane_1') as any
  const lane2 = lf.getNodeModelById('lane_2') as any

  lane1.height = 520
  pool.layoutLanesByOrder({
    reason: 'resize',
    resizedLaneId: lane1.id,
    resizedAxis: 'height',
  })

  expect(lane1.height).toBe(520)
  expect(lane2.height).toBe(520)
  expect(pool.height).toBe(520 + poolConfig.titleSize)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest packages/extension/__test__/pool/integration.test.ts --runInBand`

Expected: FAIL because the current layout always uses max/sum without respecting `resizedAxis` semantics.

- [ ] **Step 3: Implement resize-axis normalization**

Inside `layoutLanesByOrder`, before computing pool size:

```ts
const resizedLane =
  options.resizedLaneId &&
  lanes.find((lane: any) => lane.id === options.resizedLaneId)

if (this.isHorizontal && options.reason === 'resize' && options.resizedAxis === 'width' && resizedLane) {
  lanes.forEach((lane: any) => {
    lane.width = resizedLane.width
  })
}

if (!this.isHorizontal && options.reason === 'resize' && options.resizedAxis === 'height' && resizedLane) {
  lanes.forEach((lane: any) => {
    lane.height = resizedLane.height
  })
}
```

Keep arrangement-axis sizes independent:

- Horizontal `height` stays per lane.
- Vertical `width` stays per lane.

Update `PoolModel.addEventListeners()` so a lane `node:resize` computes `resizedAxis` from `index` and calls `layoutLanesByOrder({ reason: 'resize', resizedLaneId: data.id, resizedAxis })`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec jest packages/extension/__test__/pool/integration.test.ts --runInBand`

Expected: PASS.

---

### Task 4: Block Free Lane Drag and Remove Parent Pool Movement

**Files:**
- Modify: `packages/extension/src/pool/index.ts`
- Modify: `packages/extension/src/pool/LaneModel.ts`
- Test: `packages/extension/__test__/pool/model.test.ts`
- Test: `packages/extension/__test__/pool/plugin.test.ts`

**Interfaces:**
- Consumes: existing `graphModel.addNodeMoveRules`.
- Produces: move rule where pool can move, lane cannot free-move, normal nodes keep restrict behavior.

- [ ] **Step 1: Write failing tests**

Add to `model.test.ts`:

```ts
test('lane drag should not include its parent pool in moved nodes', () => {
  const lf = createPoolLF()
  lf.render(createPoolWithTwoLanes())

  const lane = lf.getNodeModelById('lane_1') as any
  const pool = lf.getNodeModelById('pool_1') as any

  lane.isDragging = true

  expect(lane.getNodesInGroup(lane)).not.toContain(pool.id)
})
```

Add to `plugin.test.ts`:

```ts
test('move rule blocks lane free movement but allows pool movement', () => {
  const lf = createPoolLF()
  lf.render(createPoolWithTwoLanes())

  const pool = lf.getNodeModelById('pool_1') as any
  const lane = lf.getNodeModelById('lane_1') as any

  expect(pool.isAllowMoveNode(20, 0)).toEqual({ x: true, y: true })
  expect(lane.isAllowMoveNode(20, 0)).toBe(false)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest packages/extension/__test__/pool/model.test.ts packages/extension/__test__/pool/plugin.test.ts --runInBand`

Expected: FAIL because lane move includes parent pool and lane movement is allowed.

- [ ] **Step 3: Implement move restrictions**

In `LaneModel.getNodesInGroup`, remove this behavior:

```ts
if (isDragging && parent) {
  nodeIds.push(parent as string)
}
```

In `PoolElements.init()` move rule:

```ts
if (String(model.type) === 'pool') {
  return true
}
if (String(model.type) === 'lane') {
  return false
}
```

Leave normal business node movement logic unchanged.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec jest packages/extension/__test__/pool/model.test.ts packages/extension/__test__/pool/plugin.test.ts --runInBand`

Expected: PASS.

---

### Task 5: Lane Drag State and Insert Index

**Files:**
- Modify: `packages/extension/src/pool/PoolModel.ts`
- Modify: `packages/extension/src/pool/index.ts`
- Test: `packages/extension/__test__/pool/plugin.test.ts`

**Interfaces:**
- Consumes: `PoolModel.getOrderedLanes`, `PoolModel.reorderLane`
- Produces: `PoolModel.getLaneInsertIndex(point: LogicFlow.Position): number`
- Produces: `PoolModel.setLaneInsertionIndex(index?: number): void`
- Produces: `PoolElements.laneDragState`

- [ ] **Step 1: Write failing tests for same-pool drag candidates**

Add to `plugin.test.ts`:

```ts
test('lane drag updates insertion index on its original pool only', () => {
  const lf = createPoolLF()
  lf.render(createPoolWithTwoLanes('horizontal'))

  const pool = lf.getNodeModelById('pool_1') as any
  const lane2 = lf.getNodeModelById('lane_2') as any

  lf.graphModel.eventCenter.emit('node:dragstart', {
    data: lane2.getData(),
    e: { clientX: 530, clientY: 350 },
  })
  lf.graphModel.eventCenter.emit('node:mousemove', {
    data: lane2.getData(),
    e: { clientX: 530, clientY: 120 },
    deltaX: 0,
    deltaY: -230,
  })

  expect(pool.laneInsertionIndex).toBe(0)
})

test('lane drop reorders original pool and clears insertion state', () => {
  const lf = createPoolLF()
  lf.render(createPoolWithTwoLanes('horizontal'))

  const pool = lf.getNodeModelById('pool_1') as any
  const lane2 = lf.getNodeModelById('lane_2') as any

  lf.graphModel.eventCenter.emit('node:dragstart', {
    data: lane2.getData(),
    e: { clientX: 530, clientY: 350 },
  })
  lf.graphModel.eventCenter.emit('node:mousemove', {
    data: lane2.getData(),
    e: { clientX: 530, clientY: 120 },
    deltaX: 0,
    deltaY: -230,
  })
  lf.graphModel.eventCenter.emit('node:drop', {
    data: lane2.getData(),
    e: { clientX: 530, clientY: 120 },
  })

  expect(Array.from(pool.children)).toEqual(['lane_2', 'lane_1'])
  expect(pool.laneInsertionIndex).toBeUndefined()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest packages/extension/__test__/pool/plugin.test.ts --runInBand`

Expected: FAIL because lane drag state and insertion index APIs do not exist.

- [ ] **Step 3: Implement lane insertion APIs**

In `PoolModel.ts`, import `observable` / `action` from `mobx` if needed and add:

```ts
@observable laneInsertionIndex?: number

setLaneInsertionIndex(index?: number) {
  this.laneInsertionIndex = index
}

getLaneInsertIndex(point: LogicFlow.Position): number {
  const lanes = this.getOrderedLanes()
  if (lanes.length <= 1) return 0
  const axisValue = this.isHorizontal ? point.y : point.x
  const boundaries = lanes.map((lane: any) =>
    this.isHorizontal ? lane.y : lane.x,
  )
  const index = boundaries.findIndex((center) => axisValue < center)
  return index === -1 ? lanes.length : index
}
```

In `PoolElements`, add private drag state and handlers:

```ts
private laneDragState?: LaneDragState

onLaneDragStart = ({ data, e }) => { /* initialize from lane.properties.parent */ }
onLaneDragMove = ({ data, e }) => { /* convert client point and set pool insertion */ }
onLaneDragDrop = ({ data }) => { /* reorder if changed and clear */ }
```

Register:

```ts
lf.on(EventType.NODE_DRAGSTART, this.onLaneDragStart)
lf.on(EventType.NODE_MOUSEMOVE, this.onLaneDragMove)
lf.on(EventType.NODE_DROP, this.onLaneDragDrop)
lf.on(EventType.NODE_MOUSEUP, this.onLaneDragDrop)
```

Do not look for another pool during drag; always use `laneDragState.poolId`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec jest packages/extension/__test__/pool/plugin.test.ts --runInBand`

Expected: PASS.

---

### Task 6: PoolView Insertion Indicator

**Files:**
- Modify: `packages/extension/src/pool/PoolView.ts`
- Test: `packages/extension/__test__/pool/model.test.ts`

**Interfaces:**
- Consumes: `PoolModel.laneInsertionIndex`, `PoolModel.getOrderedLanes`
- Produces: `PoolView.getLaneInsertionIndicator(): h.JSX.Element | null`

- [ ] **Step 1: Write failing geometry tests on the model helper**

Prefer testing a model helper instead of JSX shape internals. Add to `model.test.ts`:

```ts
test('horizontal insertion indicator stays out of pool title area', () => {
  const lf = createPoolLF()
  lf.render(createPoolWithTwoLanes('horizontal'))

  const { pool } = getPoolAndLanes(lf)
  pool.setLaneInsertionIndex(1)

  const rect = pool.getLaneInsertionIndicatorRect()

  expect(rect.x).toBe(pool.x - pool.width / 2 + poolConfig.titleSize)
  expect(rect.width).toBe(pool.width - poolConfig.titleSize)
})

test('vertical insertion indicator stays below pool title area', () => {
  const lf = createPoolLF()
  lf.render(createPoolWithTwoLanes('vertical'))

  const { pool } = getPoolAndLanes(lf)
  pool.setLaneInsertionIndex(1)

  const rect = pool.getLaneInsertionIndicatorRect()

  expect(rect.y).toBe(pool.y - pool.height / 2 + poolConfig.titleSize)
  expect(rect.height).toBe(pool.height - poolConfig.titleSize)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest packages/extension/__test__/pool/model.test.ts --runInBand`

Expected: FAIL because `getLaneInsertionIndicatorRect` is not defined.

- [ ] **Step 3: Implement model geometry and view rendering**

In `PoolModel.ts`:

```ts
getLaneInsertionIndicatorRect() {
  if (this.laneInsertionIndex === undefined) return undefined
  const size = 6
  const left = this.x - this.width / 2
  const top = this.y - this.height / 2
  const lanes = this.getOrderedLanes()

  if (this.isHorizontal) {
    const boundaryY =
      this.laneInsertionIndex === 0
        ? top
        : this.laneInsertionIndex >= lanes.length
          ? top + this.height
          : lanes[this.laneInsertionIndex].y - lanes[this.laneInsertionIndex].height / 2
    return {
      x: left + poolConfig.titleSize,
      y: boundaryY - size / 2,
      width: this.width - poolConfig.titleSize,
      height: size,
    }
  }

  const boundaryX =
    this.laneInsertionIndex === 0
      ? left
      : this.laneInsertionIndex >= lanes.length
        ? left + this.width
        : lanes[this.laneInsertionIndex].x - lanes[this.laneInsertionIndex].width / 2
  return {
    x: boundaryX - size / 2,
    y: top + poolConfig.titleSize,
    width: size,
    height: this.height - poolConfig.titleSize,
  }
}
```

In `PoolView.getShape()`, append an indicator `rect` if the helper returns a rect. Use theme-friendly default styling:

```ts
const indicatorRect = model.getLaneInsertionIndicatorRect?.()
const indicator = indicatorRect
  ? h('rect', {
      ...indicatorRect,
      fill: '#2563eb',
      opacity: 0.85,
      rx: 3,
      ry: 3,
      pointerEvents: 'none',
    })
  : null
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec jest packages/extension/__test__/pool/model.test.ts --runInBand`

Expected: PASS.

---

### Task 7: Regression Sweep and Demo Wiring

**Files:**
- Modify: `examples/vue3-app/src/views/PoolLaneWorkbenchView.vue` only if the current demo lacks controls for lane reorder/resize inspection.
- Test: all pool tests.

**Interfaces:**
- Consumes: implemented package behavior.
- Produces: manual verification support.

- [ ] **Step 1: Run package pool tests**

Run: `pnpm exec jest packages/extension/__test__/pool --runInBand`

Expected: PASS, all pool tests green.

- [ ] **Step 2: Run extension build**

Run: `pnpm --filter @logicflow/extension build:esm`

Expected: PASS, TypeScript compilation succeeds.

- [ ] **Step 3: Run Vue demo build**

Run: `pnpm --filter vue3-app build-only`

Expected: PASS.

- [ ] **Step 4: Manual verification in vue3 demo**

Use the existing `PoolLaneWorkbenchView.vue` page to verify:

- Drag lane_2 above lane_1: insertion slot appears, lane does not overlap, `pool.children` changes after drop.
- Drag lane outside original pool: it snaps to nearest legal slot in original pool and does not move to another pool.
- Resize horizontal lane height: only that lane height changes, pool height updates.
- Resize horizontal lane width: all lane widths sync, pool width keeps title area.
- Resize vertical lane width: only that lane width changes, pool width updates.
- Resize vertical lane height: all lane heights sync, pool height keeps title area.

Expected: no runtime errors in the console, debug panel shows consistent `pool.children`, lane `children`, and `properties.parent`.

---

## Self-Review

- Spec coverage: lane in-pool reorder, no cross-pool movement, pool title preservation, content fill, resize axis semantics, insertion indicator, and TDD validation are each mapped to tasks.
- Placeholder scan: no placeholder markers are present.
- Type consistency: `layoutLanesByOrder`, `getOrderedLanes`, `reorderLane`, `getLaneInsertIndex`, `setLaneInsertionIndex`, and `getLaneInsertionIndicatorRect` are introduced before later tasks consume them.
