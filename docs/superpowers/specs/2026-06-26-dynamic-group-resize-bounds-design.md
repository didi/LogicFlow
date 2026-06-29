# DynamicGroup Resize 最小边界设计说明

**日期：** 2026-06-26  
**状态：** 已实现  
**关联：** [dynamic-group.zh.md](../../../sites/docs/docs/tutorial/extension/dynamic-group.zh.md)、[packages/extension/ARCHITECTURE.md](../../../packages/extension/ARCHITECTURE.md)（Grouping 节）、[2026-05-18-dynamic-group-fix-design.md](./2026-05-18-dynamic-group-fix-design.md)

## 目标

1. 将 dynamic-group **缩小 resize 时不可小于子节点占地面积** 的行为改为**所有分组的默认行为**，不再依赖 `isRestrict: true`。
2. 解耦 **`isRestrict`** 语义：仅负责子节点移动范围限制；`autoResize` 仍要求 `isRestrict: true`。
3. **不新增** `padding` 或其它配置项；最小边界贴紧直接子节点的 `getBounds()` 并集。

## 非目标

- 新增 `padding` 或四边独立内边距配置
- 修改 `transformWithContainer` 与 `isRestrict` 的互斥关系（维持现状）
- 提供 opt-out 开关（如 `allowShrinkBelowChildren`）恢复旧 resize 行为
- 修改旧 `Group` 插件（`materials/group`）
- 修改 BPMN subProcess 相关逻辑
- 折叠态 resize 行为（沿用现有规则，本变更主要针对展开态）
- 修改 `autoResize` 扩大逻辑（维持现有 child bounds vs group bounds 比较）

## 背景与现状

当前 `packages/extension/src/dynamic-group/index.ts` 中：

- `addNodeResizeRules` 仅在 `model.isGroup && model.isRestrict` 时调用 `checkGroupBoundsWithChildren`。
- `checkGroupBoundsWithChildren` 遍历 `children` 集合中的**直接子节点**，用 `child.getBounds()` 判断 resize 后的分组 bounds 是否能包住所有子节点。
- 官方文档将「resize 不能小于子节点占地面积」与 `isRestrict` 绑定描述。
- `isRestrict: false` 时，分组可 resize 到比子节点更小，子节点视觉上会「溢出」外框。

`transformWithContainer`（`packages/extension/src/dynamic-group/node.ts`）控制分组 resize/rotate 时子节点是否联动变换。当 `isRestrict: true` 时，即使 `transformWithContainer: true` 也不生效——因 parent→child resize 递归判定与现有事件链冲突。本期**不改动**此互斥。

Pool/Lane（`packages/extension/src/pool/index.ts`）复制了相同的 `checkGroupBoundsWithChildren` 逻辑，且 resize rules 同样绑定 `isRestrict`。

## 已确认决策

| 项 | 决策 |
| --- | --- |
| resize 最小边界 | **所有** dynamic-group（及 Lane）默认生效，不再依赖 `isRestrict` |
| `isRestrict` 职责 | **仅**限制子节点不能拖出分组；`autoResize` 仍要求 `isRestrict: true` |
| `padding` | **不引入**；最小边界贴紧子节点 bounds |
| opt-out | **不提供**；作为 breaking change 在文档与 CHANGELOG 中说明 |
| `transformWithContainer` | 与 `isRestrict` 互斥，**维持现状** |
| `autoResize` | **维持现有逻辑**，不改动 |
| 实现方案 | **方案 A**：抽取共享 bounds 工具函数，`dynamic-group` 与 `pool` 共用 |

## 行为语义

### resize 最小边界（默认行为）

对所有 **展开态** 的 dynamic-group / lane 分组：

- 用户通过 resize 手柄**缩小**分组时，分组外框不得小于其**直接子节点**的占地面积。
- 仅统计 `children` 集合中的直接子节点（与现实现一致）；若直接子节点为嵌套 dynamic-group，使用该子组节点的 `getBounds()`。
- **无子节点**时：不施加额外 resize 约束（与现 `checkGroupBoundsWithChildren` 行为一致）。
- **扩大** resize 不受此规则限制。

### 最小边界计算公式

```text
childrenBounds = union( child.getBounds() for child in group.children )

resize 允许 ⟺  resize 后的 group bounds ⊇ childrenBounds
```

### `isRestrict`（解耦后）

| 能力 | 是否依赖 `isRestrict` |
| --- | --- |
| resize 缩小不小于子节点占地面积 | **否**（默认行为） |
| 子节点不能拖出分组外框 | **是** |
| `autoResize` 父组随子节点移动而扩大 | **是**（需 `isRestrict: true` 且 `autoResize: true`） |

`isRestrict` 下的子节点移动限制仍基于分组当前 `getBounds()`。

### `autoResize`（不变）

当 `isRestrict: true` 且 `autoResize: true` 时，子节点在父组内移动触达边缘时，父组自动扩大。逻辑与现有一致，按 child bounds 与 group bounds 比较扩展，**不涉及 padding**。

### `transformWithContainer`（不变）

- `transformWithContainer: true`：分组 resize/rotate 时，子节点按比例缩放或绕组中心旋转。
- `isRestrict: true` 时：即使 `transformWithContainer: true`，联动仍不生效（现有 `node.ts` guard 保持不变）。
- 本次新增的默认 resize 最小边界与 `transformWithContainer` **独立生效**：非 `isRestrict` 分组在 `transformWithContainer: true` 下仍可联动缩放，但缩小仍受最小边界约束。

## Breaking Change 说明

**旧行为：** `isRestrict: false` 时，可将分组 resize 到小于子节点占地面积。

**新行为：** 所有 dynamic-group 默认不可缩小到子节点以下（与旧 `isRestrict: true` 的 resize 约束一致）。

**迁移：** 无配置开关。依赖「允许缩小到子节点以下」的业务需调整交互预期或布局逻辑。

文档（`.zh.md` / `.en.md`）须用醒目格式（blockquote 或 bold）说明此默认行为变更；发布时在 `packages/extension/CHANGELOG.md` 记录 **Changed**。

## API 变更

**无新增属性。**

### 文档语义更新（`isRestrict` 描述）

更新前（摘要）：

> 子节点是否限制移动范围；同时限制 resize 不能超过 children 占地面积

更新后（摘要）：

> 子节点是否限制移动范围，不能拖拽到分组外。resize 最小边界为所有分组默认行为。

## 实现方案

### 共享工具函数

新增于 `packages/extension/src/dynamic-group/utils.ts`：

```ts
/**
 * 计算直接子节点的 bounds 并集。
 * 无有效子节点时返回 null。
 */
export function getChildrenBounds(
  groupModel: Pick<DynamicGroupNodeModel, 'children'>,
  getNodeById: (id: string) => BaseNodeModel | undefined,
): BoxBoundsPoint | null

/**
 * 判断 groupBounds 是否完全包含 childrenBounds。
 */
export function isGroupBoundsContainsChildren(
  groupBounds: BoxBoundsPoint,
  childrenBounds: BoxBoundsPoint,
): boolean
```

### 改动清单

| 文件 | 改动 |
| --- | --- |
| `dynamic-group/utils.ts` | 新增 `getChildrenBounds`、`isGroupBoundsContainsChildren` |
| `dynamic-group/index.ts` | `addNodeResizeRules` 条件改为 `model.isGroup`；`checkGroupBoundsWithChildren` 调用共享工具 |
| `pool/index.ts` | 删除重复的 `checkGroupBoundsWithChildren` 实现，import 共享工具；`addNodeResizeRules` 条件改为 `model.isGroup` |
| `dynamic-group/model.ts` | **不改** |
| `dynamic-group/node.ts` | **不改** |
| `sites/docs/docs/tutorial/extension/dynamic-group.zh.md` | 更新语义、breaking change |
| `sites/docs/docs/tutorial/extension/dynamic-group.en.md` | 同上 |
| `packages/extension/CHANGELOG.md` | 发布时记录 |

### `checkGroupBoundsWithChildren` 重构要点

现有逻辑（简化）：

```ts
// resize 后的 group bounds
groupMinX <= child.minX && ... && groupMaxY >= child.maxY  // 逐 child 判断
```

新逻辑：

```ts
const childrenBounds = getChildrenBounds(groupModel, id => lf.getNodeModelById(id))
if (!childrenBounds) return true
const groupBounds = { minX: groupMinX, minY: groupMinY, maxX: groupMaxX, maxY: groupMaxY }
return isGroupBoundsContainsChildren(groupBounds, childrenBounds)
```

## 测试计划

新增 `packages/extension/__test__/dynamic-group/resize-bounds.test.ts`：

| ID | 场景 | 预期 |
| --- | --- | --- |
| R1 | `isRestrict: false`，有子节点，尝试缩小到子节点以下 | resize 被阻止 |
| R2 | 无子节点 | resize 不受最小边界约束 |
| R3 | 直接子节点为 nested dynamic-group | 以子组 `getBounds()` 参与并集 |
| R4 | `isRestrict + autoResize` | autoResize 行为与现有一致 |
| R5 | `isRestrict: false + transformWithContainer: true` | 缩小仍受约束；扩大时子节点联动缩放（若 resize 成功） |

### 回归示例

在 `examples/dynamic-group-regression` 增加场景：默认 resize 约束的可视化演示（不含 padding 控件）。

### 验证命令

```sh
pnpm --filter @logicflow/extension test -- resize-bounds
pnpm --filter @logicflow/extension build
```

## 属性职责速查（变更后）

| 属性 | 职责 |
| --- | --- |
| （默认） | resize 缩小不得小于直接子节点占地面积 |
| `isRestrict` | 子节点不能拖出分组；`autoResize` 的前提 |
| `autoResize` | 子节点移动时父组自动扩大 |
| `transformWithContainer` | 分组 resize/rotate 时子节点联动；与 `isRestrict` 互斥 |

## 风险与 reviewer 关注

1. **Breaking change 影响面**：所有未设 `isRestrict` 的分组 resize 行为变化；需在 docs 与 CHANGELOG 醒目说明。
2. **Pool/Lane 一致性**：须与 dynamic-group 共用工具函数，避免两套逻辑漂移。
3. **`transformWithContainer` 边界**：非 `isRestrict` 分组在联动缩放 + 最小边界同时生效时的 UX（缩小到边界后停止，扩大时子节点仍联动）需在 R5 覆盖。
