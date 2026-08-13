# Pool / Lane 交互细节实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 在不改变历史 `direction` 数据语义的前提下，完成 Pool/Lane 标题位置、折叠间距、提示样式、空 Pool 清理、空白粘贴建 Pool 和双框选模式 Demo。

**架构：** `packages/extension/src/pool` 继续拥有 Pool/Lane 的配置解析、布局和交互。标题位置只在 Pool 配置中定义 Lane 的默认规则，Lane 的可选本地字段仅作为覆盖；布局层通过统一的几何解析结果计算标题区、内容区、分隔线、折叠尺寸和 Lane 间距。共享 `DynamicGroup` 只保持继承契约，不在本轮修改其通用行为。

**技术栈：** TypeScript、MobX、LogicFlow Preact 视图、Jest + jsdom、Vue 3、pnpm。

## 全局约束

- 仅使用 `pnpm`，只编辑 `src` 源码，不编辑生成目录。
- 严格 TDD：每项先写失败测试，确认失败原因后再写最小实现。
- 保持 `direction: 'horizontal' | 'vertical'` 含义不变：前者 Lane 上下排列，后者 Lane 左右排列。
- `titlePosition` 支持 `top | right | bottom | left`；旧数据按 `horizontal -> left`、`vertical -> top` 推导。
- Pool 配置 `laneConfig.titlePosition` 是 Lane 默认标题位置；Lane 自身 `properties.titlePosition` 仅在明确给出时覆盖。
- `laneConfig.collapsedLaneGap` 默认 `12`；折叠 Lane 与相邻 Lane 的每一条相邻边均计入间距。
- Pool 折叠后只显示单一标题块；展开时恢复 Lane 原折叠状态并重新布局。
- Lane 移动到其他 Pool 后，原 Pool 无 Lane 时删除原 Pool。
- Lane 空白粘贴自动创建 Pool，保留 Lane 相对顺序、子节点和边。
- 不自动执行 `git add`、`git commit` 或推送；所有提交只能由用户明确授权后人工执行。
- 新增代码必须有必要中文注释；用户可见配置同步中英文文档和 changeset。

---

## 文件结构

- 修改 `packages/extension/src/pool/constant.ts`：标题位置类型、默认标题尺寸和折叠间距。
- 修改 `packages/extension/src/pool/utils.ts`：标题位置解析与标题/内容几何计算的纯函数。
- 修改 `packages/extension/src/pool/PoolModel.ts`：继承配置、带间距的 Lane 布局、Pool 折叠恢复、空 Pool 清理触发。
- 修改 `packages/extension/src/pool/LaneModel.ts`：Lane 局部标题覆盖、折叠尺寸、序列化展开尺寸。
- 修改 `packages/extension/src/pool/PoolView.ts`、`packages/extension/src/pool/LaneView.ts`：四边标题区、分隔线和 Pool 单标题折叠视图。
- 修改 `packages/extension/src/pool/index.ts`：跨 Pool 迁移后清理空源 Pool、Lane 空白粘贴建 Pool、提示状态。
- 新增/修改 `packages/extension/src/pool/style.ts`：Pool/Lane 专属拖拽样式由 PoolElements 局部注入，避免把 Pool 专属样式放入全局 extension style。
- 修改 `packages/extension/__test__/pool/fixtures.ts` 并新增 `title-layout.test.ts`、`collapse-gap.test.ts`；扩充 `lane-layout.test.ts`、`collapse.test.ts`、`copy-paste.test.ts`。
- 修改 `examples/vue3-app/src/views/PoolLaneWorkbenchView.vue`：标题位置控制和两种框选模式入口。
- 修改 `sites/docs/docs/tutorial/extension/pool.zh.md`、`sites/docs/docs/tutorial/extension/pool.en.md`、`.changeset/pool-lane-behavior-upgrade.md`。

---

### Task 1：标题配置和纯几何解析

**Files:**
- Modify: `packages/extension/src/pool/constant.ts`
- Modify: `packages/extension/src/pool/utils.ts`
- Modify: `packages/extension/__test__/pool/fixtures.ts`
- Test: `packages/extension/__test__/pool/title-layout.test.ts`

**Interfaces:**
- Produces: `export type TitlePosition = 'top' | 'right' | 'bottom' | 'left'`
- Produces: `resolvePoolTitlePosition(properties): TitlePosition`
- Produces: `resolveLaneTitlePosition(laneProperties, poolProperties): TitlePosition`
- Produces: `getTitleLayout(bounds, position, titleSize)`，返回标题矩形、内容矩形、分隔线和文本锚点。

- [ ] **步骤 1：写失败测试**

在 `title-layout.test.ts` 覆盖以下断言：四个 Pool 标题边均返回正确的标题/内容矩形；Lane 未覆盖时使用 `pool.laneConfig.titlePosition`；Lane 覆盖值优先；无新字段的 horizontal/vertical 图分别解析为 left/top；标题区尺寸不影响另一轴。

```ts
expect(resolvePoolTitlePosition({ direction: 'horizontal' })).toBe('left')
expect(resolveLaneTitlePosition({}, { laneConfig: { titlePosition: 'bottom' } })).toBe('bottom')
expect(getTitleLayout({ x: 0, y: 0, width: 300, height: 200 }, 'right', 40).divider).toEqual(
  expect.objectContaining({ x1: 110, x2: 110 }),
)
```

- [ ] **步骤 2：运行并确认失败**

```sh
pnpm test -- packages/extension/__test__/pool/title-layout.test.ts --runInBand
```

预期：因解析函数和 `TitlePosition` 尚不存在而失败。

- [ ] **步骤 3：实现最小纯函数**

在 `constant.ts` 增加 `TitlePosition`、`poolConfig.titlePosition`、`laneConfig.collapsedLaneGap: 12`。在 `utils.ts` 实现解析优先级和四边几何；函数只接收 plain data，不读取 GraphModel，便于单测。对旧 `direction` 映射和右/下边界计算写中文注释。

- [ ] **步骤 4：运行通过测试和类型检查**

```sh
pnpm test -- packages/extension/__test__/pool/title-layout.test.ts --runInBand
pnpm --filter @logicflow/extension exec tsc --noEmit --pretty false
```

预期：测试全绿，类型检查退出码为 0。

### Task 2：Pool/Lane 标题渲染、分隔线和提示色统一

**Files:**
- Modify: `packages/extension/src/pool/PoolModel.ts`
- Modify: `packages/extension/src/pool/LaneModel.ts`
- Modify: `packages/extension/src/pool/PoolView.ts`
- Modify: `packages/extension/src/pool/LaneView.ts`
- Modify: `packages/extension/src/pool/style.ts`
- Test: `packages/extension/__test__/pool/title-layout.test.ts`

**Interfaces:**
- Consumes: Task 1 的 `resolve*TitlePosition()` 与 `getTitleLayout()`。
- Produces: `PoolModel.getResolvedTitlePosition()`、`LaneModel.getResolvedTitlePosition()`。

- [ ] **步骤 1：扩充失败测试**

断言 Pool/Lane 模型文本锚点来自解析后的标题边；PoolView 展开态存在标题矩形、内容矩形和一条分隔线；排序指示线 class 使用分组黄橙色样式，而不再出现 `#2f80ed`。

- [ ] **步骤 2：运行并确认失败**

```sh
pnpm test -- packages/extension/__test__/pool/title-layout.test.ts --runInBand
```

预期：当前 View 没有四边分隔线，模型仍按 `isHorizontal` 设置文字位置。

- [ ] **步骤 3：实现渲染与样式**

PoolModel/LaneModel 改为调用 Task 1 的几何函数更新文本位置和文本可用区域。PoolView/LaneView 使用同一结果绘制标题区、内容区和分隔线。Pool 的拖入边框和排序落位框改用 DynamicGroup 已使用的 `#feb663` / `#ffab03` 黄橙虚线；Pool 专属 CSS 放在 `pool/style.ts` 并由 PoolElements 注入，避免污染全局样式。

- [ ] **步骤 4：运行通过测试**

```sh
pnpm test -- packages/extension/__test__/pool/title-layout.test.ts --runInBand
pnpm test -- packages/extension/__test__/pool/lane-layout.test.ts --runInBand
```

预期：标题位置、分隔线和既有排序测试均通过。

### Task 3：折叠单标题视图和 Lane 间距布局

**Files:**
- Modify: `packages/extension/src/pool/PoolModel.ts`
- Modify: `packages/extension/src/pool/LaneModel.ts`
- Modify: `packages/extension/src/pool/PoolView.ts`
- Modify: `packages/extension/__test__/pool/collapse.test.ts`
- Test: `packages/extension/__test__/pool/collapse-gap.test.ts`

**Interfaces:**
- Produces: `PoolModel.getCollapsedLaneGapBefore(index, lanes): number` 或等价纯布局辅助方法。
- Produces: Pool 折叠前 Lane 状态快照及展开后的 `layoutLanesByOrder({ reason: 'collapse' })` 恢复路径。

- [ ] **步骤 1：写失败测试**

覆盖：Pool 无论 Lane 当前是否折叠，折叠后只保留标题块；展开后恢复每条 Lane 的原折叠状态；一个折叠 Lane 与展开相邻 Lane 的实际边界距离为 `12`；两个相邻折叠 Lane 也只在共享边界计算一次间距；Pool 总宽/高、排序插入槽位和虚拟边端点均包含间距。

```ts
firstLane.toggleCollapse(true)
expect(secondLane.getBounds().minY - firstLane.getBounds().maxY).toBe(12)
pool.toggleCollapse(true)
expect(pool.getData().width).toBe(poolConfig.titleSize)
pool.toggleCollapse(false)
expect(firstLane.isCollapsed).toBe(true)
```

- [ ] **步骤 2：运行并确认失败**

```sh
pnpm test -- packages/extension/__test__/pool/collapse-gap.test.ts --runInBand
pnpm test -- packages/extension/__test__/pool/collapse.test.ts --runInBand
```

预期：现有布局只累加 Lane 宽高，Pool 折叠仍经过 DynamicGroup 的双区尺寸逻辑。

- [ ] **步骤 3：实现最小状态和布局修复**

在 PoolModel 的布局累计中，对每条 Lane 之前的相邻边界按“任一侧折叠”增加一次 gap；位置游标、Pool 主轴尺寸、`getLaneInsertIndex()` 与指示线坐标共享同一累计结果。Pool 折叠覆写为单标题尺寸并保存 Lane 折叠状态；展开后先恢复快照，再布局。Lane 折叠尺寸由有效标题边决定，`getData()` 持久化 `expandWidth` / `expandHeight`，保证序列化重渲染仍能展开。

- [ ] **步骤 4：运行通过测试**

```sh
pnpm test -- packages/extension/__test__/pool/collapse-gap.test.ts --runInBand
pnpm test -- packages/extension/__test__/pool/collapse.test.ts --runInBand
pnpm test -- packages/extension/__test__/dynamic-group/collapse-edge.test.ts --runInBand
```

预期：Pool 测试与 DynamicGroup 折叠边回归测试均通过。

### Task 4：空源 Pool 清理与 Lane 空白粘贴建 Pool

**Files:**
- Modify: `packages/extension/src/pool/PoolModel.ts`
- Modify: `packages/extension/src/pool/index.ts`
- Modify: `packages/extension/__test__/pool/fixtures.ts`
- Modify: `packages/extension/__test__/pool/copy-paste.test.ts`
- Test: `packages/extension/__test__/pool/lane-move.test.ts`

**Interfaces:**
- Produces: `PoolElements.removeEmptyPool(pool: PoolModel): void`，只删除已无 Lane 的 Pool。
- Produces: `PoolElements.createPoolForPastedLanes(lanes, pasteOffset): PoolModel`。

- [ ] **步骤 1：写失败测试**

覆盖：将源 Pool 的最后一个 Lane 移入目标 Pool 后源 Pool 不存在、目标 Pool 保留迁移 Lane 的子节点和边；复制单 Lane/多 Lane 到没有唯一选中 Pool 的位置时新增 Pool；新 Pool 继承首个源 Lane 所属 Pool 的 `titlePosition`、`laneConfig.titlePosition`、`collapsedLaneGap`；内部边和跨复制 Lane 边均重新指向副本。

- [ ] **步骤 2：运行并确认失败**

```sh
pnpm test -- packages/extension/__test__/pool/lane-move.test.ts --runInBand
pnpm test -- packages/extension/__test__/pool/copy-paste.test.ts --runInBand
```

预期：源 Pool 留在图中，空白 Lane 粘贴被拒绝或没有 Pool 容器。

- [ ] **步骤 3：实现最小迁移和粘贴路径**

跨 Pool 成功迁移后，在源 Pool 已完成成员、映射和目标布局更新后检查 `getOrderedLanes().length === 0`，再删除源 Pool，不能调用级联 Lane 删除路径。粘贴解析时保留“唯一选中 Pool”现有优先级；否则从源 Lane 的源 Pool 配置构造新 Pool，先创建 Pool、再注册复制 Lane、最后按统一布局放入。边收集必须以源选区和源节点 ID 映射为依据，不能从刚创建的副本节点反查。

- [ ] **步骤 4：运行通过测试**

```sh
pnpm test -- packages/extension/__test__/pool/lane-move.test.ts --runInBand
pnpm test -- packages/extension/__test__/pool/copy-paste.test.ts --runInBand
```

预期：迁移、复制、内部边与跨 Lane 边断言均通过。

### Task 5：Workbench、文档和全量验证

**Files:**
- Modify: `examples/vue3-app/src/views/PoolLaneWorkbenchView.vue`
- Modify: `sites/docs/docs/tutorial/extension/pool.zh.md`
- Modify: `sites/docs/docs/tutorial/extension/pool.en.md`
- Modify: `.changeset/pool-lane-behavior-upgrade.md`

- [ ] **步骤 1：先补 Demo 场景和人工验收清单**

在 Workbench 增加 Pool 标题位置、Lane 默认标题位置和折叠间距控制；保留 Lane 局部覆盖示例。并列增加 `空白起点框选` 和 `任意起点框选` 按钮，两者复用同一图数据、日志和调试面板，不修改 SelectionSelect 的底层语义。

- [ ] **步骤 2：更新文档和 changeset**

中英文文档说明四边标题配置、旧 `direction` 默认映射、折叠间距、空 Pool 自动清理和空白粘贴新 Pool。新增 extension patch changeset，明确这是一项兼容性升级。

- [ ] **步骤 3：运行自动验证**

```sh
pnpm test -- packages/extension/__test__/pool --runInBand
pnpm test -- packages/extension/__test__/dynamic-group/collapse-edge.test.ts --runInBand
pnpm --filter @logicflow/core exec tsc --noEmit --pretty false
pnpm --filter @logicflow/extension exec tsc --noEmit --pretty false
cd examples/vue3-app && pnpm exec vue-tsc --noEmit
git diff --check
```

预期：全部退出码为 0。

- [ ] **步骤 4：手工 Demo 验收**

启动 `pnpm run dev` 和 `examples/vue3-app`，验证：四边标题、标题分隔线、拖入黄橙虚线、折叠 Lane 间距和连线、Pool 单标题折叠与展开恢复、最后 Lane 跨 Pool 后源 Pool 消失、单/多 Lane 空白粘贴建 Pool、两种框选模式入口。记录任何与预期不符的行为后再进入下一轮修复。

---

## 计划自检

- Spec 覆盖：标题位置/兼容、分隔线、黄橙提示、折叠 Pool、Lane 折叠间距、空 Pool 删除、空白粘贴和双框选 Demo 分别由 Task 1-5 覆盖。
- 边界：不修改 Core 或 DynamicGroup 通用语义；DynamicGroup 测试只作为继承回归验证。
- 占位符：无未完成占位项；每个任务包含失败测试、失败验证、最小实现和通过验证。
- 提交：遵循用户“不可自动提交”约束，计划不包含任何自动提交命令。
