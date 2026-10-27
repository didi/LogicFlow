# 泳道行为实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 在保持现有 pool/lane 数据和 API 兼容的前提下，升级 PoolElements 的移动、删除、resize、折叠、框选动作以及 demo 验证。

**架构：** 继续由 `packages/extension/src/pool` 下的 `PoolElements` 负责泳道交互。新增若干聚焦的小助手，分别处理 pool/lane 配置归一化、lane 顺序、归属同步、删除策略、跨 pool 移动、lane 粘贴校验等职责。语义相同的地方复用 DynamicGroup 的模型行为，但 Pool 专属的交互状态和布局仍放在 PoolElements / PoolModel / LaneModel 内。

**技术栈：** TypeScript、`@logicflow/core` 的 Preact 视图、MobX 节点模型、Jest + jsdom、Vue 3 demo 应用、pnpm。

## 全局约束

- 只使用 `pnpm`。
- 遵循 TDD：先写或更新失败测试，确认它因正确原因失败，再实现最小代码让测试通过。
- 只修改 `packages/extension/src` 下的源码，不改生成产物 `dist`、`es`、`lib`。
- 保持现有 `type: 'pool' | 'lane'`、`children`、`properties.children`、`properties.parent` 的兼容性。
- 保持现有 API，包括 `getLaneByNodeId`、`getLaneByBounds`、`addChildAbove`、`addChildBelow`、`addChildLeft`、`addChildRight`、`deleteChild`。
- 新增配置都必须是可选项：`cascadeDeleteChildren`、`minLaneCount`、`collapse.pool`、`collapse.lane`、`properties.collapsible`。
- `cascadeDeleteChildren` 默认值为 `true`。
- `minLaneCount` 默认值为 `1`。
- pool 本体不允许 resize；lane resize 驱动 pool 尺寸变化。
- lane 不能脱离 pool 独立存在。
- 不自动提交代码；计划中的 commit 命令只是人工检查点，必须在用户明确同意后才能执行。
- 影响用户体验的改动需要同步更新文档和 changeset。

---

## 文件结构

- 修改 `packages/extension/src/pool/index.ts`：PoolElements 配置、运行时映射、拖拽状态、lane 归属同步、删除策略、lane 粘贴行为、公共辅助方法、事件。
- 修改 `packages/extension/src/pool/PoolModel.ts`：lane 顺序布局、最小 lane 数校验、lane 新增/删除/迁移 API、lane 驱动 resize、pool 禁止 resize。
- 修改 `packages/extension/src/pool/LaneModel.ts`：折叠配置、lane 标题区折叠尺寸、移动辅助方法、导出宽高一致性。
- 修改 `packages/extension/src/pool/LaneView.ts`：`minLaneCount` 下的操作图标禁用/隐藏、必要时补齐折叠入口。
- 修改 `packages/extension/src/pool/PoolView.ts`：pool 级拖入轮廓和插入槽位渲染（如果 lane 视图还覆盖不到）。
- 修改 `packages/extension/src/pool/constant.ts`：`cascadeDeleteChildren`、`minLaneCount`、折叠默认值、lane/pool 标题尺寸等共享默认值。
- 修改 `packages/extension/__test__/pool/fixtures.ts`：补充两个 pool、lane 内节点、边、横纵向 pool、配置注入等测试数据。
- 修改/新增 `packages/extension/__test__/pool/*.test.ts`：覆盖删除、布局、跨 pool 移动、resize、折叠、复制/粘贴、兼容性等 TDD 测试。
- 如框选过滤需要补充 pool/lane 动作断言，再修改 `packages/extension/__test__/selection-select/pool-conflict.test.ts`。
- 修改 `examples/vue3-app/src/views/PoolLaneWorkbenchView.vue`：补齐所有维度的手工验证控制和调试面板。
- 仅当 workbench 路由缺失时，修改 `examples/vue3-app/src/router/index.ts`。
- 修改 `sites/docs/docs/tutorial/extension/pool.zh.md` 和 `sites/docs/docs/tutorial/extension/pool.en.md`：补充配置、行为和兼容性说明。
- 实现完成后新增 `.changeset/pool-lane-behavior-upgrade.md`：写明对用户可见的 patch/minor 变化。

---

### Task 1：Pool 配置与删除策略

**Files:**
- Modify: `packages/extension/src/pool/index.ts`
- Modify: `packages/extension/src/pool/PoolModel.ts`
- Modify: `packages/extension/src/pool/constant.ts`
- Modify: `packages/extension/__test__/pool/fixtures.ts`
- Test: `packages/extension/__test__/pool/delete-behavior.test.ts`

**Interfaces:**
- Produces: `PoolElements.cascadeDeleteChildren: boolean`
- Produces: `PoolElements.minLaneCount: number`
- Produces: `PoolElements.getPoolMinLaneCount(pool: PoolModel): number`
- Produces: `PoolModel.canRemoveLane(count?: number): boolean`
- Produces: `PoolModel.deleteChild(childId: string): boolean`

- [ ] **步骤 1：先写删除策略的失败测试**

Create `packages/extension/__test__/pool/delete-behavior.test.ts`:

```ts
/**
 * @jest-environment jsdom
 */
import LogicFlow from '@logicflow/core'
import { PoolElements } from '../../src/pool'
import { createContainer, createPoolGraphWithNodeInLane } from './fixtures'

function createPoolLF(options: Record<string, unknown> = {}) {
  return new LogicFlow({
    container: createContainer(),
    width: 1200,
    height: 800,
    allowResize: true,
    plugins: [[PoolElements, options]],
  } as any)
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('pool lane deletion policy', () => {
  test('deletes lane children by default', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const pool = lf.getNodeModelById('pool_1') as any
    const lane = lf.getNodeModelById('lane_1') as any

    expect(lane.children.has('rect_1')).toBe(true)

    const deleted = pool.deleteChild('lane_1')

    expect(deleted).toBe(true)
    expect(lf.getNodeModelById('lane_1')).toBeUndefined()
    expect(lf.getNodeModelById('rect_1')).toBeUndefined()
  })

  test('releases lane children when cascadeDeleteChildren is false', () => {
    const lf = createPoolLF({ cascadeDeleteChildren: false })
    lf.render(createPoolGraphWithNodeInLane())

    const pool = lf.getNodeModelById('pool_1') as any
    const rect = lf.getNodeModelById('rect_1') as any

    const deleted = pool.deleteChild('lane_1')

    expect(deleted).toBe(true)
    expect(lf.getNodeModelById('lane_1')).toBeUndefined()
    expect(lf.getNodeModelById('rect_1')).toBeDefined()
    expect(rect.properties.parent).toBeUndefined()
    expect((lf.extension.PoolElements as any).getLaneByNodeId('rect_1')).toBeUndefined()
  })

  test('honors plugin minLaneCount and pool override', () => {
    const lf = createPoolLF({ minLaneCount: 2 })
    lf.render(createPoolGraphWithNodeInLane())

    const pool = lf.getNodeModelById('pool_1') as any

    expect(pool.deleteChild('lane_1')).toBe(false)
    expect(lf.getNodeModelById('lane_1')).toBeDefined()

    pool.setProperties({
      ...pool.properties,
      minLaneCount: 1,
    })

    expect(pool.deleteChild('lane_1')).toBe(true)
    expect(lf.getNodeModelById('lane_1')).toBeUndefined()
  })
})
```

- [ ] **步骤 2：运行删除测试并确认失败**

Run:

```sh
pnpm test -- packages/extension/__test__/pool/delete-behavior.test.ts --runInBand
```

Expected: FAIL because `PoolElements` does not expose `cascadeDeleteChildren` / `minLaneCount`, and `PoolModel.deleteChild()` does not return a boolean or release children.

- [ ] **步骤 3：补齐配置默认值**

In `packages/extension/src/pool/constant.ts`, add:

```ts
export const poolBehaviorConfig = {
  cascadeDeleteChildren: true,
  minLaneCount: 1,
  collapse: {
    pool: true,
    lane: true,
  },
}
```

In `packages/extension/src/pool/index.ts`, import it and add fields:

```ts
import { poolBehaviorConfig } from './constant'

export class PoolElements {
  cascadeDeleteChildren: boolean = poolBehaviorConfig.cascadeDeleteChildren
  minLaneCount: number = poolBehaviorConfig.minLaneCount

  constructor({ lf, options }: LogicFlow.IExtensionProps) {
    lf.register(PoolNode)
    lf.register(LaneNode)
    this.lf = lf
    assign(this, options)
    this.init()
  }

  getPoolMinLaneCount(pool: PoolModel) {
    const value = pool.properties?.minLaneCount
    return typeof value === 'number' ? value : this.minLaneCount
  }
}
```

- [ ] **步骤 4：实现释放子节点助手和布尔返回的删除逻辑**

In `packages/extension/src/pool/index.ts`, add:

```ts
releaseLaneMembers = (laneModel: LaneModel) => {
  if (laneModel.isCollapsed) {
    laneModel.toggleCollapse(false)
  }

  forEach(Array.from(laneModel.children), (childId) => {
    const child = this.lf.getNodeModelById(childId)
    laneModel.removeChild(childId)
    this.nodeLaneMap.delete(childId)
    child?.setProperties({
      ...child.properties,
      parent: undefined,
      relativeDistanceX: undefined,
      relativeDistanceY: undefined,
    })
  })
}
```

Update `removeNodeFromGroup` so lane/pool deletion honors the option:

```ts
if (model.isGroup && node.children) {
  const groupModel = model as LaneModel
  if (this.cascadeDeleteChildren) {
    forEach(Array.from(groupModel.children), (childId) => {
      this.nodeLaneMap.delete(childId)
      this.lf.deleteNode(childId)
    })
  } else {
    this.releaseLaneMembers(groupModel)
  }
}
```

In `packages/extension/src/pool/PoolModel.ts`, add:

```ts
getPoolPlugin(): any {
  return this.graphModel.dynamicGroup
}

getMinLaneCount(): number {
  const plugin = this.getPoolPlugin()
  if (typeof plugin?.getPoolMinLaneCount === 'function') {
    return plugin.getPoolMinLaneCount(this)
  }
  return this.properties?.minLaneCount ?? 1
}

canRemoveLane(count = 1): boolean {
  return this.getLanes().length - count >= this.getMinLaneCount()
}

deleteChild(childId: string): boolean {
  const lanes = this.getLanes()
  if (!this.canRemoveLane(1)) return false

  const laneToDelete = lanes.find((lane) => lane.id === childId)
  if (!laneToDelete) return false

  this.removeChild(childId)
  this.graphModel.deleteNode(childId)
  this.resizePool()
  this.resizeChildren()
  return true
}
```

- [ ] **步骤 5：运行删除测试和相关 pool 测试**

Run:

```sh
pnpm test -- packages/extension/__test__/pool/delete-behavior.test.ts packages/extension/__test__/pool/integration.test.ts --runInBand
```

Expected: PASS.

- [ ] **步骤 6：人工提交检查点**

Do not run this command unless the user explicitly approves committing:

```sh
git add packages/extension/src/pool/index.ts packages/extension/src/pool/PoolModel.ts packages/extension/src/pool/constant.ts packages/extension/__test__/pool/delete-behavior.test.ts
git commit -m "feat(extension): align pool lane deletion policy"
```

---

### Task 2：Lane 排序布局与池内重排

**Files:**
- Modify: `packages/extension/src/pool/PoolModel.ts`
- Modify: `packages/extension/src/pool/index.ts`
- Modify: `packages/extension/__test__/pool/fixtures.ts`
- Test: `packages/extension/__test__/pool/lane-layout.test.ts`

**Interfaces:**
- Produces: `PoolModel.getOrderedLanes(): LaneModel[]`
- Produces: `PoolModel.getLaneInsertIndex(point: { x: number; y: number }): number`
- Produces: `PoolModel.reorderLane(laneId: string, insertIndex: number): boolean`
- Produces: `PoolModel.layoutLanesByOrder(options?: LayoutLanesOptions): void`

- [ ] **步骤 1：先写 lane 排序布局的失败测试**

Create `packages/extension/__test__/pool/lane-layout.test.ts`:

```ts
/**
 * @jest-environment jsdom
 */
import { createPoolLF, createPoolGraphWithNodeInLane, createPoolWithTwoLanes } from './fixtures'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('pool ordered lane layout', () => {
  test('reorders horizontal lanes by insert index and moves lane children once', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const pool = lf.getNodeModelById('pool_1') as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const rect = lf.getNodeModelById('rect_1') as any
    const beforeDy = rect.y - lane1.y

    expect(pool.reorderLane('lane_1', 2)).toBe(true)

    expect(Array.from(pool.children)).toEqual(['lane_2', 'lane_1'])
    expect(rect.y - lane1.y).toBe(beforeDy)
    expect(pool.getOrderedLanes().map((lane: any) => lane.id)).toEqual(['lane_2', 'lane_1'])
  })

  test('returns false when reorder does not change order', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any

    expect(pool.reorderLane('lane_1', 0)).toBe(false)
    expect(Array.from(pool.children)).toEqual(['lane_1', 'lane_2'])
  })

  test('computes vertical insert index from x coordinate', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('vertical'))

    const pool = lf.getNodeModelById('pool_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any

    expect(pool.getLaneInsertIndex({ x: lane2.x + lane2.width, y: lane2.y })).toBe(2)
  })
})
```

- [ ] **步骤 2：运行 lane 排序测试并确认失败**

Run:

```sh
pnpm test -- packages/extension/__test__/pool/lane-layout.test.ts --runInBand
```

Expected: FAIL because the ordered layout APIs do not exist.

- [ ] **步骤 3：实现 lane 顺序相关 API**

In `packages/extension/src/pool/PoolModel.ts`, add types near imports:

```ts
type LayoutLanesReason =
  | 'init'
  | 'add'
  | 'delete'
  | 'reorder'
  | 'resize'
  | 'collapse'
  | 'move-to-pool'

type LayoutLanesOptions = {
  reason?: LayoutLanesReason
  resizedLaneId?: string
  resizedAxis?: 'width' | 'height'
}
```

Add methods:

```ts
getOrderedLanes() {
  return Array.from(this.children)
    .map((childId) => this.graphModel.getNodeModelById(childId))
    .filter((node: any) => node && String(node.type) === 'lane') as any[]
}

getLaneInsertIndex(point: { x: number; y: number }) {
  const lanes = this.getOrderedLanes()
  const axisValue = this.isHorizontal ? point.y : point.x

  for (let index = 0; index < lanes.length; index++) {
    const lane = lanes[index]
    const center = this.isHorizontal ? lane.y : lane.x
    if (axisValue < center) return index
  }

  return lanes.length
}

reorderLane(laneId: string, insertIndex: number): boolean {
  const ids = this.getOrderedLanes().map((lane: any) => lane.id)
  const originIndex = ids.indexOf(laneId)
  if (originIndex === -1) return false

  const normalizedIndex = Math.max(0, Math.min(insertIndex, ids.length))
  ids.splice(originIndex, 1)
  const nextIndex = normalizedIndex > originIndex ? normalizedIndex - 1 : normalizedIndex
  ids.splice(nextIndex, 0, laneId)

  if (ids.join('|') === this.getOrderedLanes().map((lane: any) => lane.id).join('|')) {
    return false
  }

  this.children = new Set(ids)
  this.setProperties({
    ...this.properties,
    children: ids,
  })
  this.layoutLanesByOrder({ reason: 'reorder' })
  return true
}
```

- [ ] **步骤 4：用 `layoutLanesByOrder` 统一布局内部逻辑**

In `PoolModel.ts`, add:

```ts
layoutLanesByOrder(_options: LayoutLanesOptions = {}) {
  const lanes = this.getOrderedLanes()
  if (lanes.length === 0) return

  if (this.isHorizontal) {
    const contentWidth = Math.max(...lanes.map((lane: any) => lane.width))
    const nextPoolWidth = contentWidth + poolConfig.titleSize
    const nextPoolHeight = lanes.reduce((sum: number, lane: any) => sum + lane.height, 0)

    this.width = nextPoolWidth
    this.height = nextPoolHeight

    let top = this.y - this.height / 2
    lanes.forEach((lane: any) => {
      lane.width = contentWidth
      this.moveLane(
        lane,
        this.x - this.width / 2 + poolConfig.titleSize + lane.width / 2,
        top + lane.height / 2,
      )
      lane.setProperties({
        ...lane.properties,
        parent: this.id,
        width: lane.width,
        height: lane.height,
      })
      top += lane.height
    })
  } else {
    const contentHeight = Math.max(...lanes.map((lane: any) => lane.height))
    const nextPoolWidth = lanes.reduce((sum: number, lane: any) => sum + lane.width, 0)
    const nextPoolHeight = contentHeight + poolConfig.titleSize

    this.width = nextPoolWidth
    this.height = nextPoolHeight

    let left = this.x - this.width / 2
    lanes.forEach((lane: any) => {
      lane.height = contentHeight
      this.moveLane(
        lane,
        left + lane.width / 2,
        this.y - this.height / 2 + poolConfig.titleSize + lane.height / 2,
      )
      lane.setProperties({
        ...lane.properties,
        parent: this.id,
        width: lane.width,
        height: lane.height,
      })
      left += lane.width
    })
  }

  this.updateTextPosition()
}
```

Replace existing `resizePool()` and `resizeChildren()` callers that follow add/delete/reorder with `layoutLanesByOrder({ reason: ... })`.

- [ ] **步骤 5：运行 lane 排序和现有集成测试**

Run:

```sh
pnpm test -- packages/extension/__test__/pool/lane-layout.test.ts packages/extension/__test__/pool/integration.test.ts --runInBand
```

Expected: PASS.

- [ ] **步骤 6：人工提交检查点**

Do not run unless explicitly approved:

```sh
git add packages/extension/src/pool/PoolModel.ts packages/extension/src/pool/index.ts packages/extension/__test__/pool/lane-layout.test.ts
git commit -m "feat(extension): add ordered pool lane layout"
```

---

### Task 3：Lane 跨 Pool 移动

**Files:**
- Modify: `packages/extension/src/pool/index.ts`
- Modify: `packages/extension/src/pool/PoolModel.ts`
- Modify: `packages/extension/src/pool/PoolView.ts`
- Modify: `packages/extension/__test__/pool/fixtures.ts`
- Test: `packages/extension/__test__/pool/lane-move.test.ts`

**Interfaces:**
- Produces: `PoolElements.getPoolByBounds(bounds, nodeData): PoolModel | undefined`
- Produces: `PoolElements.moveLaneToPool(laneId, targetPoolId, insertIndex): boolean`
- Produces: `PoolModel.moveLaneToPool(laneId, targetPoolId, insertIndex): boolean`
- Produces: `lane:not-allowed` event for illegal lane move targets.

- [ ] **步骤 1：补两个 pool 的 fixture，并先写失败移动测试**

In `packages/extension/__test__/pool/fixtures.ts`, add:

```ts
export function createTwoPoolGraph() {
  const first = createPoolGraphWithNodeInLane()
  return {
    nodes: [
      ...first.nodes,
      {
        id: 'pool_2',
        type: 'pool',
        x: 900,
        y: 260,
        text: '目标泳池',
        properties: {
          direction: 'horizontal',
          width: 520,
          height: 180,
          children: ['lane_3'],
        },
        children: ['lane_3'],
      },
      {
        id: 'lane_3',
        type: 'lane',
        x: 930,
        y: 260,
        width: 480,
        height: 180,
        text: '目标泳道',
        properties: {
          parent: 'pool_2',
          direction: 'horizontal',
          isHorizontal: true,
        },
      },
    ],
    edges: first.edges,
  }
}
```

Create `packages/extension/__test__/pool/lane-move.test.ts`:

```ts
/**
 * @jest-environment jsdom
 */
import { createPoolLF, createTwoPoolGraph } from './fixtures'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('pool lane cross-pool movement', () => {
  test('moves a lane and its children into another pool', () => {
    const lf = createPoolLF()
    lf.render(createTwoPoolGraph())

    const plugin = lf.extension.PoolElements as any
    const sourcePool = lf.getNodeModelById('pool_1') as any
    const targetPool = lf.getNodeModelById('pool_2') as any
    const lane = lf.getNodeModelById('lane_1') as any
    const rect = lf.getNodeModelById('rect_1') as any
    const beforeDx = rect.x - lane.x
    const beforeDy = rect.y - lane.y

    expect(plugin.moveLaneToPool('lane_1', 'pool_2', 1)).toBe(true)

    expect(sourcePool.children.has('lane_1')).toBe(false)
    expect(Array.from(targetPool.children)).toEqual(['lane_3', 'lane_1'])
    expect(lane.properties.parent).toBe('pool_2')
    expect(rect.properties.parent).toBe('lane_1')
    expect(rect.x - lane.x).toBe(beforeDx)
    expect(rect.y - lane.y).toBe(beforeDy)
    expect(plugin.getLaneByNodeId('lane_1')?.id).toBe('pool_2')
    expect(plugin.getLaneByNodeId('rect_1')?.id).toBe('lane_1')
  })

  test('rejects lane migration that would violate source minLaneCount', () => {
    const lf = createPoolLF({ minLaneCount: 2 })
    lf.render(createTwoPoolGraph())

    const plugin = lf.extension.PoolElements as any
    const sourcePool = lf.getNodeModelById('pool_1') as any

    expect(plugin.moveLaneToPool('lane_1', 'pool_2', 1)).toBe(false)
    expect(Array.from(sourcePool.children)).toEqual(['lane_1', 'lane_2'])
  })
})
```

- [ ] **步骤 2：运行移动测试并确认失败**

Run:

```sh
pnpm test -- packages/extension/__test__/pool/lane-move.test.ts --runInBand
```

Expected: FAIL because cross-pool lane movement APIs do not exist.

- [ ] **步骤 3：实现跨 pool 迁移 API**

In `PoolModel.ts`, add:

```ts
moveLaneToPool(laneId: string, targetPoolId: string, insertIndex: number): boolean {
  const targetPool = this.graphModel.getNodeModelById(targetPoolId) as any
  const lane = this.graphModel.getNodeModelById(laneId) as any
  if (!targetPool || String(targetPool.type) !== 'pool') return false
  if (!lane || String(lane.type) !== 'lane') return false
  if (!this.children.has(laneId)) return false
  if (!this.canRemoveLane(1)) return false

  const sourceIds = this.getOrderedLanes().map((item: any) => item.id).filter((id: string) => id !== laneId)
  this.children = new Set(sourceIds)
  this.setProperties({ ...this.properties, children: sourceIds })

  const targetIds = targetPool.getOrderedLanes().map((item: any) => item.id)
  const nextIndex = Math.max(0, Math.min(insertIndex, targetIds.length))
  targetIds.splice(nextIndex, 0, laneId)
  targetPool.children = new Set(targetIds)
  targetPool.setProperties({ ...targetPool.properties, children: targetIds })

  lane.setProperties({ ...lane.properties, parent: targetPool.id })

  this.layoutLanesByOrder({ reason: 'move-to-pool' })
  targetPool.layoutLanesByOrder({ reason: 'move-to-pool' })
  return true
}
```

In `PoolElements`, add:

```ts
moveLaneToPool = (laneId: string, targetPoolId: string, insertIndex: number) => {
  const lane = this.lf.getNodeModelById(laneId) as LaneModel
  const sourcePoolId = lane?.properties?.parent as string | undefined
  const sourcePool = sourcePoolId ? (this.lf.getNodeModelById(sourcePoolId) as PoolModel) : undefined
  if (!sourcePool || typeof sourcePool.moveLaneToPool !== 'function') return false

  const moved = sourcePool.moveLaneToPool(laneId, targetPoolId, insertIndex)
  if (moved) {
    this.nodeLaneMap.set(laneId, targetPoolId)
    forEach(Array.from(lane.children), (childId) => {
      this.nodeLaneMap.set(childId, laneId)
    })
  }
  return moved
}
```

- [ ] **步骤 4：补目标 pool 命中检测和事件结构**

In `PoolElements`, add:

```ts
getPoolByBounds(bounds: BoxBoundsPoint, nodeData: NodeData): PoolModel | undefined {
  const pools = filter(this.lf.graphModel.nodes, (node) => {
    return String(node.type) === 'pool' && isBoundsInLane(bounds, node) && node.id !== nodeData.id
  })
  if (pools.length <= 1) return pools[0] as PoolModel
  return pools.reduce((top: any, node: any) => (node.zIndex > top.zIndex ? node : top), pools[0]) as PoolModel
}

emitLaneMoveNotAllowed(lane: LaneModel, reason: string) {
  this.lf.emit('lane:not-allowed', {
    lane: lane.getData(),
    node: lane.getData(),
    reason,
  })
}
```

Use this helper in drop handling for illegal lane move targets.

- [ ] **步骤 5：运行移动测试和插件测试**

Run:

```sh
pnpm test -- packages/extension/__test__/pool/lane-move.test.ts packages/extension/__test__/pool/plugin.test.ts --runInBand
```

Expected: PASS.

- [ ] **步骤 6：人工提交检查点**

Do not run unless explicitly approved:

```sh
git add packages/extension/src/pool/index.ts packages/extension/src/pool/PoolModel.ts packages/extension/src/pool/PoolView.ts packages/extension/__test__/pool/fixtures.ts packages/extension/__test__/pool/lane-move.test.ts
git commit -m "feat(extension): support lane movement between pools"
```

---

### Task 4：Lane 驱动 Resize 与 Pool 禁止 Resize

**Files:**
- Modify: `packages/extension/src/pool/PoolModel.ts`
- Modify: `packages/extension/src/pool/LaneModel.ts`
- Modify: `packages/extension/src/pool/index.ts`
- Test: `packages/extension/__test__/pool/resize.test.ts`

**Interfaces:**
- Produces: pool resize rule returning `false` for `model.type === 'pool'`.
- Produces: lane resize path calling `layoutLanesByOrder({ reason: 'resize', resizedLaneId, resizedAxis })`.

- [ ] **步骤 1：先写 resize 失败测试**

Create `packages/extension/__test__/pool/resize.test.ts`:

```ts
/**
 * @jest-environment jsdom
 */
import { createPoolLF, createPoolGraphWithNodeInLane, createPoolWithTwoLanes } from './fixtures'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('pool lane resize', () => {
  test('keeps pool itself non-resizable', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any

    expect(pool.resizable).toBe(false)
  })

  test('horizontal lane height resize changes only that lane height and pool height', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any

    lane1.height += 40
    pool.layoutLanesByOrder({ reason: 'resize', resizedLaneId: 'lane_1', resizedAxis: 'height' })

    expect(pool.height).toBe(lane1.height + lane2.height)
  })

  test('horizontal lane width resize syncs all lane widths', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any

    lane1.width += 60
    pool.layoutLanesByOrder({ reason: 'resize', resizedLaneId: 'lane_1', resizedAxis: 'width' })

    expect(lane2.width).toBe(lane1.width)
    expect(pool.width).toBe(lane1.width + pool.titleSize)
  })

  test('does not shrink a lane below its child bounds', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const plugin = lf.extension.PoolElements as any
    const lane = lf.getNodeModelById('lane_1') as any

    expect(plugin.checkGroupBoundsWithChildren(lane, 0, 0, 10, 10)).toBe(false)
  })
})
```

- [ ] **步骤 2：运行 resize 测试并确认失败**

Run:

```sh
pnpm test -- packages/extension/__test__/pool/resize.test.ts --runInBand
```

Expected: FAIL for missing layout resize behavior or pool resize guard gaps.

- [ ] **步骤 3：把 node:resize 接到统一布局入口**

In `PoolModel.addEventListeners()`, replace ad hoc lane resize math with:

```ts
this.graphModel.eventCenter.on('node:resize', ({ data }) => {
  if (!this.children.has(data.id)) return
  const resizedNode = this.graphModel.getNodeModelById(data.id)
  if (!resizedNode || String(resizedNode.type) !== 'lane') return

  this.layoutLanesByOrder({
    reason: 'resize',
    resizedLaneId: data.id,
    resizedAxis: this.isHorizontal ? 'height' : 'width',
  })
})
```

Keep `checkGroupBoundsWithChildren()` in `PoolElements` as the guard for lane child bounds.

- [ ] **步骤 4：确保 pool resize 被拒绝**

In `PoolElements.init()` resize rule:

```ts
graphModel.addNodeResizeRules((model, deltaX, deltaY, width, height) => {
  if (String(model.type) === 'pool') return false
  if (model.isGroup) {
    return this.checkGroupBoundsWithChildren(
      model as LaneModel,
      deltaX,
      deltaY,
      width,
      height,
    )
  }
  return true
})
```

- [ ] **步骤 5：运行 resize 和 model 测试**

Run:

```sh
pnpm test -- packages/extension/__test__/pool/resize.test.ts packages/extension/__test__/pool/model.test.ts --runInBand
```

Expected: PASS.

- [ ] **步骤 6：人工提交检查点**

Do not run unless explicitly approved:

```sh
git add packages/extension/src/pool/PoolModel.ts packages/extension/src/pool/LaneModel.ts packages/extension/src/pool/index.ts packages/extension/__test__/pool/resize.test.ts
git commit -m "feat(extension): drive pool size from lane resize"
```

---

### Task 5：Pool 与 Lane 折叠

**Files:**
- Modify: `packages/extension/src/pool/index.ts`
- Modify: `packages/extension/src/pool/LaneModel.ts`
- Modify: `packages/extension/src/pool/PoolModel.ts`
- Modify: `packages/extension/src/pool/PoolView.ts`
- Modify: `packages/extension/src/pool/LaneView.ts`
- Test: `packages/extension/__test__/pool/collapse.test.ts`

**Interfaces:**
- Produces: `PoolElements.collapse: { pool: boolean; lane: boolean }`
- Produces: `PoolElements.isCollapseAllowed(model): boolean`
- Produces: `LaneModel.toggleCollapse(collapse?: boolean): void`
- Produces: lane collapsed axis size equals lane title size.

- [ ] **步骤 1：先写折叠失败测试**

Create `packages/extension/__test__/pool/collapse.test.ts`:

```ts
/**
 * @jest-environment jsdom
 */
import { createPoolLF, createPoolGraphWithNodeInLane } from './fixtures'
import { laneConfig } from '../../src/pool/constant'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('pool lane collapse', () => {
  test('collapses a lane to its title area and hides children', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const lane = lf.getNodeModelById('lane_1') as any
    const rect = lf.getNodeModelById('rect_1') as any
    const expandedHeight = lane.height

    lane.toggleCollapse(true)

    expect(lane.isCollapsed).toBe(true)
    expect(lane.height).toBe(laneConfig.titleSize)
    expect(lane.expandHeight).toBe(expandedHeight)
    expect(rect.visible).toBe(false)

    lane.toggleCollapse(false)

    expect(lane.isCollapsed).toBe(false)
    expect(lane.height).toBe(expandedHeight)
    expect(rect.visible).toBe(true)
  })

  test('respects plugin collapse.lane false and node collapsible false', () => {
    const lf = createPoolLF({ collapse: { pool: true, lane: false } })
    lf.render(createPoolGraphWithNodeInLane())

    const lane = lf.getNodeModelById('lane_1') as any

    lane.toggleCollapse(true)

    expect(lane.isCollapsed).toBe(false)

    const lf2 = createPoolLF()
    lf2.render(createPoolGraphWithNodeInLane())
    const lane2 = lf2.getNodeModelById('lane_1') as any
    lane2.setProperties({ ...lane2.properties, collapsible: false })

    lane2.toggleCollapse(true)

    expect(lane2.isCollapsed).toBe(false)
  })
})
```

- [ ] **步骤 2：运行折叠测试并确认失败**

Run:

```sh
pnpm test -- packages/extension/__test__/pool/collapse.test.ts --runInBand
```

Expected: FAIL because `LaneModel.toggleCollapse()` currently forces expanded state.

- [ ] **步骤 3：实现折叠配置判断**

In `PoolElements`, add:

```ts
collapse = poolBehaviorConfig.collapse

isCollapseAllowed(model: any): boolean {
  if (model.properties?.collapsible === false) return false
  if (String(model.type) === 'pool') return this.collapse?.pool !== false
  if (String(model.type) === 'lane') return this.collapse?.lane !== false
  return true
}
```

- [ ] **步骤 4：替换 LaneModel 里的折叠覆盖实现**

In `LaneModel.ts`, replace the no-op `toggleCollapse()` with:

```ts
toggleCollapse(collapse?: boolean) {
  const plugin = this.graphModel.dynamicGroup as any
  if (typeof plugin?.isCollapseAllowed === 'function' && !plugin.isCollapseAllowed(this)) {
    this.isCollapsed = false
    this.setProperties({ ...this.properties, isCollapsed: false })
    return
  }

  const next = typeof collapse === 'boolean' ? collapse : !this.isCollapsed
  if (next === this.isCollapsed) return

  if (next) {
    this.expandWidth = this.width
    this.expandHeight = this.height
    if (this.properties.isHorizontal) {
      this.height = laneConfig.titleSize
    } else {
      this.width = laneConfig.titleSize
    }
  } else {
    this.width = this.expandWidth
    this.height = this.expandHeight
  }

  super.toggleCollapse(next)
  const pool = this.getPoolModel()
  pool?.layoutLanesByOrder?.({ reason: 'collapse' })
}
```

- [ ] **步骤 5：运行折叠和 dynamic-group 回归测试**

Run:

```sh
pnpm test -- packages/extension/__test__/pool/collapse.test.ts packages/extension/__test__/dynamic-group/collapse-edge.test.ts --runInBand
```

Expected: PASS; DynamicGroup collapse behavior does not regress.

- [ ] **步骤 6：人工提交检查点**

Do not run unless explicitly approved:

```sh
git add packages/extension/src/pool/index.ts packages/extension/src/pool/LaneModel.ts packages/extension/src/pool/PoolModel.ts packages/extension/src/pool/PoolView.ts packages/extension/src/pool/LaneView.ts packages/extension/__test__/pool/collapse.test.ts
git commit -m "feat(extension): support pool lane collapse"
```

---

### Task 6：框选动作与 Lane 复制/粘贴

**Files:**
- Modify: `packages/extension/src/pool/index.ts`
- Modify: `packages/extension/src/components/selection-select/index.ts` only if needed for action-level parent filtering
- Test: `packages/extension/__test__/pool/copy-paste.test.ts`
- Test: `packages/extension/__test__/selection-select/pool-conflict.test.ts`

**Interfaces:**
- Produces: `PoolElements.getPasteTargetPool(node, distance): PoolModel | undefined`
- Produces: `lane:paste-not-allowed` event when copied lane has no valid target pool.
- Preserves: copy pool creates a complete pool/lane/node clone tree.

- [ ] **步骤 1：先写复制/粘贴失败测试**

Create `packages/extension/__test__/pool/copy-paste.test.ts`:

```ts
/**
 * @jest-environment jsdom
 */
import { createPoolLF, createPoolGraphWithNodeInLane, createTwoPoolGraph } from './fixtures'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('pool lane copy paste', () => {
  test('copies a whole pool with lanes and lane children', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const sourcePool = lf.getNodeModelById('pool_1') as any
    const added = lf.addElements({ nodes: [sourcePool.getData()], edges: [] }, 80)

    const copiedPool = added.nodes.find((node: any) => String(node.type) === 'pool') as any
    expect(copiedPool).toBeDefined()
    expect(copiedPool.id).not.toBe('pool_1')
    expect(copiedPool.children.size).toBeGreaterThan(0)
    const copiedLaneId = Array.from(copiedPool.children)[0] as string
    const copiedLane = lf.getNodeModelById(copiedLaneId) as any
    expect(copiedLane.properties.parent).toBe(copiedPool.id)
    expect(copiedLane.children.size).toBeGreaterThan(0)
  })

  test('does not paste a lane without a target pool and emits event', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const lane = lf.getNodeModelById('lane_1') as any
    const onNotAllowed = jest.fn()

    lf.on('lane:paste-not-allowed', onNotAllowed)

    const added = lf.addElements({ nodes: [lane.getData()], edges: [] }, 2000)

    expect(added.nodes.filter((node: any) => String(node.type) === 'lane')).toHaveLength(0)
    expect(onNotAllowed).toHaveBeenCalledTimes(1)
  })

  test('pastes a copied lane into a target pool', () => {
    const lf = createPoolLF()
    lf.render(createTwoPoolGraph())

    const lane = lf.getNodeModelById('lane_1') as any
    const targetPool = lf.getNodeModelById('pool_2') as any
    const laneData = lane.getData()
    laneData.x = targetPool.x
    laneData.y = targetPool.y

    const added = lf.addElements({ nodes: [laneData], edges: [] }, 0)
    const copiedLane = added.nodes.find((node: any) => String(node.type) === 'lane') as any

    expect(copiedLane).toBeDefined()
    expect(copiedLane.properties.parent).toBe('pool_2')
    expect(targetPool.children.has(copiedLane.id)).toBe(true)
  })
})
```

- [ ] **步骤 2：运行复制/粘贴测试并确认失败**

Run:

```sh
pnpm test -- packages/extension/__test__/pool/copy-paste.test.ts --runInBand
```

Expected: FAIL because lane paste currently can create group-like nodes without target pool constraints.

- [ ] **步骤 3：补 lane 粘贴目标解析**

In `PoolElements`, add:

```ts
getPasteTargetPool(node: LogicFlow.NodeData): PoolModel | undefined {
  if (String(node.type) !== 'lane') return undefined

  const nodeModelLike = {
    id: node.id ?? '__lane_paste__',
    getBounds: () => ({
      minX: (node.x ?? 0) - ((node.width ?? 0) / 2),
      minY: (node.y ?? 0) - ((node.height ?? 0) / 2),
      maxX: (node.x ?? 0) + ((node.width ?? 0) / 2),
      maxY: (node.y ?? 0) + ((node.height ?? 0) / 2),
    }),
  }
  return this.getPoolByBounds(nodeModelLike.getBounds(), node)
}
```

- [ ] **步骤 4：更新 `lf.addElements` 覆盖逻辑**

In the pool `lf.addElements` override, branch lane nodes before `lf.addNode`:

```ts
forEach(selectedNodes, (node) => {
  if (String(node.type) === 'lane') {
    const targetPool = this.getPasteTargetPool(node)
    if (!targetPool) {
      this.lf.emit('lane:paste-not-allowed', {
        lane: node,
        reason: 'missing-target-pool',
      })
      return
    }
    const insertIndex = targetPool.getLaneInsertIndex({ x: node.x ?? targetPool.x, y: node.y ?? targetPool.y })
    const model = lf.addNode(this.removeChildrenInGroupNodeData({
      ...node,
      properties: {
        ...node.properties,
        parent: targetPool.id,
      },
    }))
    targetPool.children = new Set([
      ...targetPool.getOrderedLanes().map((lane: any) => lane.id).slice(0, insertIndex),
      model.id,
      ...targetPool.getOrderedLanes().map((lane: any) => lane.id).slice(insertIndex),
    ])
    targetPool.setProperties({ ...targetPool.properties, children: Array.from(targetPool.children) })
    if (node.id) nodeIdMap[node.id] = model.id
    elements.nodes.push(model)
    const children = node.properties?.children ?? node.children
    const { edgesData } = this.initGroupChildNodes(nodeIdMap, children, model as LaneModel, distance)
    edgesInnerGroup.push(...edgesData)
    targetPool.layoutLanesByOrder({ reason: 'add' })
    return
  }

  const originId = node.id
  const children = node.properties?.children ?? node.children
  const model = lf.addNode(this.removeChildrenInGroupNodeData(node))
  if (originId) nodeIdMap[originId] = model.id
  elements.nodes.push(model)
  if (model.isGroup) {
    const { edgesData } = this.initGroupChildNodes(nodeIdMap, children, model as LaneModel, distance)
    edgesInnerGroup.push(...edgesData)
  }
})
```

- [ ] **步骤 5：运行复制/粘贴和框选冲突测试**

Run:

```sh
pnpm test -- packages/extension/__test__/pool/copy-paste.test.ts packages/extension/__test__/selection-select/pool-conflict.test.ts --runInBand
```

Expected: PASS.

- [ ] **步骤 6：人工提交检查点**

Do not run unless explicitly approved:

```sh
git add packages/extension/src/pool/index.ts packages/extension/src/components/selection-select/index.ts packages/extension/__test__/pool/copy-paste.test.ts packages/extension/__test__/selection-select/pool-conflict.test.ts
git commit -m "feat(extension): constrain lane copy paste to pools"
```

---

### Task 7：Demo Workbench 与文档

**Files:**
- Modify: `examples/vue3-app/src/views/PoolLaneWorkbenchView.vue`
- Modify: `examples/vue3-app/src/router/index.ts` if the route is missing
- Modify: `sites/docs/docs/tutorial/extension/pool.zh.md`
- Modify: `sites/docs/docs/tutorial/extension/pool.en.md`
- Add: `.changeset/pool-lane-behavior-upgrade.md`

**Interfaces:**
- Produces: Vue route `/pool-lane-workbench` with controls for all spec verification categories.
- Produces: Docs for `cascadeDeleteChildren`, `minLaneCount`, `collapse`, cross-pool lane movement, pool non-resize, and lane paste constraints.

- [ ] **步骤 1：补 demo 控件和事件日志**

In `PoolLaneWorkbenchView.vue`, ensure these controls exist:

```ts
const behaviorOptions = ref({
  cascadeDeleteChildren: true,
  minLaneCount: 1,
  collapse: {
    pool: true,
    lane: true,
  },
})

const listenedEvents = [
  'lane:not-allowed',
  'lane:paste-not-allowed',
  'node:add',
  'node:drop',
  'node:delete',
  'selection:selected',
]
```

When creating LogicFlow, pass options:

```ts
const lf = new LogicFlow({
  container: containerRef.value,
  width: 1200,
  height: 760,
  allowResize: true,
  plugins: [[PoolElements, behaviorOptions.value], SelectionSelect, Control],
} as any)
```

Add buttons for:

```ts
function deleteSelectedLane() {
  const lf = lfRef.value
  if (!lf) return
  const lane = lf.graphModel.getSelectElements().nodes.find((node: any) => String(node.type) === 'lane')
  if (!lane) return
  const model = lf.getNodeModelById(lane.id) as any
  model.getPoolModel()?.deleteChild(lane.id)
  refreshDebug()
}

function toggleSelectedCollapse() {
  const lf = lfRef.value
  if (!lf) return
  const node = lf.graphModel.getSelectElements().nodes[0] as any
  if (!node) return
  const model = lf.getNodeModelById(node.id) as any
  model?.toggleCollapse?.()
  refreshDebug()
}
```

- [ ] **步骤 2：补 demo 检查清单 UI**

In the template, include sections for:

```vue
<section class="checklist">
  <h2>验证维度</h2>
  <ul>
    <li>移动：pool 整体移动、lane 排序、lane 跨 pool、非法目标拒绝</li>
    <li>新增/删除：默认级联、保留子节点、minLaneCount</li>
    <li>Resize：pool 无控制点、lane resize 驱动 pool</li>
    <li>折叠：pool/lane 折叠、展开、折叠态删除</li>
    <li>框选：移动、复制、删除的父子去重</li>
  </ul>
</section>
```

Add debug tables for:

```vue
<pre>{{ rawDataText }}</pre>
<table>
  <tbody>
    <tr v-for="row in nodeLaneMapRows" :key="row.childId">
      <td>{{ row.childId }}</td>
      <td>{{ row.parentId }}</td>
    </tr>
  </tbody>
</table>
```

- [ ] **步骤 3：更新中文文档**

In `sites/docs/docs/tutorial/extension/pool.zh.md`, add an options table:

```md
| 配置 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `cascadeDeleteChildren` | `boolean` | `true` | 删除 pool/lane 时是否一并删除内部 lane 和业务节点。为 `false` 时只删除容器并释放子节点。 |
| `minLaneCount` | `number` | `1` | 每个 pool 至少保留的 lane 数量；单个 pool 可用 `properties.minLaneCount` 覆盖。 |
| `collapse.pool` | `boolean` | `true` | 是否允许 pool 折叠。 |
| `collapse.lane` | `boolean` | `true` | 是否允许 lane 折叠。 |
```

Add behavior notes:

```md
> **兼容说明**：泳池泳道仍使用 `children` 和 `properties.parent` 表达层级关系。升级后旧数据无需迁移；新增配置都是可选项。

> **默认删除行为**：`cascadeDeleteChildren` 默认为 `true`，保持历史行为。删除 lane 会同时删除 lane 内业务节点；如果业务希望保留节点，请显式设为 `false`。
```

- [ ] **步骤 4：更新英文文档**

In `sites/docs/docs/tutorial/extension/pool.en.md`, add equivalent text:

```md
| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `cascadeDeleteChildren` | `boolean` | `true` | Whether deleting a pool/lane also deletes its child lanes and nodes. When `false`, only the container is removed and children are released. |
| `minLaneCount` | `number` | `1` | Minimum number of lanes each pool must keep. A single pool can override it with `properties.minLaneCount`. |
| `collapse.pool` | `boolean` | `true` | Whether pools can be collapsed. |
| `collapse.lane` | `boolean` | `true` | Whether lanes can be collapsed. |
```

Add behavior notes:

```md
> **Compatibility:** Pool/lane hierarchy still uses `children` and `properties.parent`. Existing graph data does not need migration; all new options are optional.

> **Default delete behavior:** `cascadeDeleteChildren` defaults to `true`, matching the historical behavior. Deleting a lane also deletes its child nodes. Set it to `false` if your app should keep those nodes.
```

- [ ] **步骤 5：新增 changeset**

Create `.changeset/pool-lane-behavior-upgrade.md`:

```md
---
'@logicflow/extension': minor
---

feat: upgrade PoolElements lane interactions with configurable deletion, lane count limits, lane-driven resize, pool/lane collapse, and safer lane copy-paste behavior.
```

- [ ] **步骤 6：校验 demo 构建和 changeset 状态**

Run:

```sh
pnpm -C examples/vue3-app build
pnpm exec changeset status
```

Expected: Vue app build succeeds, changeset status lists `@logicflow/extension` as a minor bump.

- [ ] **步骤 7：人工提交检查点**

Do not run unless explicitly approved:

```sh
git add examples/vue3-app/src/views/PoolLaneWorkbenchView.vue examples/vue3-app/src/router/index.ts sites/docs/docs/tutorial/extension/pool.zh.md sites/docs/docs/tutorial/extension/pool.en.md .changeset/pool-lane-behavior-upgrade.md
git commit -m "docs(extension): document pool lane behavior upgrade"
```

---

### Task 8：最终回归检查

**Files:**
- No source edits expected unless a regression is found.
- Review: all files modified in Tasks 1-7.

**Interfaces:**
- Produces: verified extension behavior and a manual demo checklist result.

- [ ] **步骤 1：运行聚焦的 Jest 套件**

Run:

```sh
pnpm test -- packages/extension/__test__/pool packages/extension/__test__/selection-select/pool-conflict.test.ts packages/extension/__test__/dynamic-group --runInBand
```

Expected: PASS.

- [ ] **步骤 2：构建 extension**

Run:

```sh
pnpm --filter @logicflow/extension build
```

Expected: build succeeds and writes generated outputs only to ignored build folders.

- [ ] **步骤 3：如果改动触及源码，再运行 TypeScript lint**

Run:

```sh
pnpm run lint:ts
```

Expected: PASS or only auto-fixes in touched source. Review any auto-fixes before staging.

- [ ] **步骤 4：运行手工 demo**

Run packages watch in terminal 1:

```sh
pnpm run dev
```

Run Vue demo in terminal 2:

```sh
pnpm -C examples/vue3-app dev
```

Open `/pool-lane-workbench` and verify:

```text
1. Existing horizontal and vertical pool data renders without migration.
2. Deleting a lane defaults to deleting children.
3. Setting cascadeDeleteChildren=false releases children.
4. minLaneCount blocks delete and lane migration.
5. Lane reorder shows live movement but drop produces non-overlapping ordered lanes.
6. Lane can move into another pool and carry children.
7. Lane cannot move to blank canvas, ordinary nodes, or dynamic-group targets.
8. Pool has no resize handles; lane resize recalculates pool size.
9. Lane collapse keeps title area only; pool collapse hides descendants.
10. Selection move/copy/delete uses parent-child de-duplication.
11. Lane paste without target pool creates no lane and logs lane:paste-not-allowed.
12. getGraphData keeps children and properties.parent consistent.
```

Expected: every checklist item matches the spec.

- [ ] **步骤 5：检查 git diff**

Run:

```sh
git diff --stat
git diff -- packages/extension/src/pool packages/extension/__test__/pool sites/docs/docs/tutorial/extension examples/vue3-app/src/views/PoolLaneWorkbenchView.vue .changeset
```

Expected: diffs are scoped to PoolElements, tests, docs, demo, and changeset.

- [ ] **步骤 6：人工最终提交检查点**

Do not run unless explicitly approved:

```sh
git add packages/extension/src/pool packages/extension/__test__/pool packages/extension/__test__/selection-select sites/docs/docs/tutorial/extension examples/vue3-app/src/views/PoolLaneWorkbenchView.vue examples/vue3-app/src/router/index.ts .changeset/pool-lane-behavior-upgrade.md
git commit -m "feat(extension): upgrade pool lane behavior"
```

---

## 自检

- 覆盖检查：任务已覆盖兼容性、删除默认值、`minLaneCount`、pool/lane 移动、lane 跨 pool 迁移、普通节点归属、pool 禁止 resize、lane 驱动 resize、pool/lane 折叠、框选移动/复制/删除、lane 粘贴约束、文档、changeset 和 demo 验证。
- 占位符检查：计划里没有 TBD/TODO/留空式描述；代码片段都给出了具体文件、方法、事件和命令。
- 类型一致性：`cascadeDeleteChildren`、`minLaneCount`、`collapse`、`collapsible`、`layoutLanesByOrder`、`getLaneInsertIndex`、`reorderLane`、`moveLaneToPool`、`lane:paste-not-allowed` 在各任务里保持一致。
- 风险说明：因为用户明确不允许自动提交，所以计划中的 commit 命令只作为人工检查点存在。
