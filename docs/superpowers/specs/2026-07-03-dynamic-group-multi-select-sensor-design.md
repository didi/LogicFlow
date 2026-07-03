# dynamic-group 多选拖拽感应区高亮修复设计

**日期**：2026-07-03  
**作者**：brainstorming session  
**状态**：待实现  

---

## 背景

LogicFlow 的 `dynamic-group` 插件在多节点拖拽进组时，感应区（sensor outline）高亮行为存在不确定性 bug：拖拽多个选中节点时，高亮哪个分组取决于 `forEach` 迭代顺序，结果随机。

---

## 问题根因

`onSelectionDrag` 对每个选中节点依次调用 `setActiveGroup`：

```typescript
onSelectionDrag = () => {
  const { nodes: selectedNodes } = this.lf.graphModel.getSelectElements()
  selectedNodes.forEach((node) => {
    this.setActiveGroup(node)  // 每次调用都会先关掉当前 activeGroup，再尝试设新的
  })
}
```

`setActiveGroup` 内部：先调用 `this.activeGroup.setAllowAppendChild(false)` 关掉当前高亮，再决定是否点亮新的。多次调用时，后一个节点的处理会覆盖前一个节点的结果。

**典型失败场景**：选中 A（在 Group X 内）和 B（不在任何组内）同时拖拽，迭代顺序为 [A, B] 时：

1. 迭代 A → Group X 亮起
2. 迭代 B → `setAllowAppendChild(false)` 关掉 Group X → `targetGroup=null` → 提前 return

最终 Group X 熄灭，用户看不到任何高亮，但 drop 后 A 会正确入组。

---

## 调研参考

| 工具 | 高亮方式 | 多组同时高亮 |
|:---|:---|:---:|
| React Flow | 每个节点独立调 `getIntersectingNodes`，CSS class 叠加 | ✅ |
| draw.io | 鼠标光标位置，单容器高亮 | ❌ |
| LF 当前 | 整个 selection 触发一次，单 `activeGroup` 引用 | ❌（且有 bug） |

React Flow 的做法最符合"每个节点各自找目标组、结果独立"的语义。

---

## 设计方案

### 核心思路

将 `activeGroup`（单引用）改为 `activeGroups`（Set），支持多组同时高亮。每帧拖拽时，先纯计算出"所有应该活跃的组"，再做一次 diff 更新视觉状态，消除迭代顺序的影响。

### 数据结构变更

```typescript
// Before
activeGroup?: DynamicGroupNodeModel

// After
activeGroups: Set<DynamicGroupNodeModel> = new Set()
```

### 新增私有辅助方法：`getTargetGroupForNode`

将"计算某节点目标组"的逻辑从 `setActiveGroup` 中提取出来，作为**纯计算、无副作用**的辅助方法：

```typescript
private getTargetGroupForNode(
  node: LogicFlow.NodeData
): DynamicGroupNodeModel | undefined {
  const nodeModel = this.lf.getNodeModelById(node.id)
  const bounds = nodeModel?.getBounds()
  if (!nodeModel || !bounds) return undefined

  const targetGroup = this.getGroupByBounds(bounds, node)
  if (!targetGroup) return undefined
  // 分组节点不能把自己设为目标组
  if (nodeModel.isGroup && targetGroup.id === node.id) return undefined
  // 检查分组是否允许插入
  if (!targetGroup.isAllowAppendIn(node)) return undefined

  return targetGroup
}
```

### `clearDragTargetHighlight` 重写

```typescript
clearDragTargetHighlight() {
  for (const group of this.activeGroups) {
    group.setAllowAppendChild(false)
  }
  this.activeGroups.clear()
}
```

### `setActiveGroup` 重写（单节点路径）

单节点拖拽（`onNodeDrag`）仍走此方法，语义不变（至多一个目标组），内部改用 Set：

```typescript
setActiveGroup = (node: LogicFlow.NodeData) => {
  const targetGroup = this.getTargetGroupForNode(node)

  const next = new Set<DynamicGroupNodeModel>()
  if (targetGroup) next.add(targetGroup)

  // diff 更新：只变动有变化的组
  for (const group of this.activeGroups) {
    if (!next.has(group)) group.setAllowAppendChild(false)
  }
  for (const group of next) {
    if (!this.activeGroups.has(group)) group.setAllowAppendChild(true)
  }

  this.activeGroups = next
}
```

### `onSelectionDrag` 重写（多节点路径，修复核心 bug）

```typescript
onSelectionDrag = () => {
  const { nodes: selectedNodes } = this.lf.graphModel.getSelectElements()

  // 1. 纯计算：每个节点独立找目标组，结果合并为 Set
  const next = new Set<DynamicGroupNodeModel>()
  selectedNodes.forEach((node) => {
    const targetGroup = this.getTargetGroupForNode(node)
    if (targetGroup) next.add(targetGroup)
  })

  // 2. diff 更新：只操作有变化的组，避免无谓视觉抖动
  for (const group of this.activeGroups) {
    if (!next.has(group)) group.setAllowAppendChild(false)
  }
  for (const group of next) {
    if (!this.activeGroups.has(group)) group.setAllowAppendChild(true)
  }

  this.activeGroups = next
}
```

---

## 行为对比

| 场景 | 修复前 | 修复后 |
|:---|:---|:---|
| A、B 都在 Group X 内同时拖拽 | 随机亮 / 不亮 | Group X 稳定亮起 |
| A 进 GA，B 进 GB | 随机只亮一个，且可能被消除 | GA、GB 同时亮起 |
| A 进 GA，B 不在任何组 | GA 被 B 的迭代消除，不亮 | GA 亮起 ✓ |
| 单节点拖拽 | 正常 | 不变，行为一致 |
| drop 逻辑（`addNodeToGroup`） | 不涉及 | 不变（独立计算，不依赖 activeGroups）|

---

## 向后兼容

- `activeGroup` 属性被移除，改为 `activeGroups`。该属性无公开文档、不在 `.d.ts` 类型导出中，外部直接访问 `plugin.activeGroup` 的用法不存在于官方示例，影响极小。
- `clearDragTargetHighlight`、`setActiveGroup` 是内部方法，签名不变，行为兼容。
- drop 逻辑（`onNodeDrop`、`onSelectionDrop`、`addNodeToGroup`）**不做任何修改**。

---

## 不在本次范围内

经调研和讨论，以下改动不纳入本次修复：

| 项目 | 原因 |
|:---|:---|
| 改为鼠标坐标驱动的感应区检测 | draw.io/React Flow 均不采用，现有 bounds 检测是行业惯例 |
| 多节点 drop 原子性（全部入组或全部不入组） | draw.io/React Flow 均采用各节点独立判断，当前行为符合行业惯例 |
| `autoResize` 从 `isRestrict` 门控解耦 | 当前为有意设计，有明确注释，不在本次范围 |
| 单节点感应区从"完全在内"改为"中心在内" | 低优先级，独立评估 |

---

## 改动文件

| 文件 | 改动类型 |
|:---|:---|
| `packages/extension/src/dynamic-group/index.ts` | 核心改动：新增 `getTargetGroupForNode`，重写 `setActiveGroup`、`onSelectionDrag`、`clearDragTargetHighlight`，将 `activeGroup` 替换为 `activeGroups` |

---

## 验证方式

1. 构建 `packages/extension`
2. 在 `examples/feature-examples` 或 `examples/dynamic-group-regression` 中手动验证：
   - 多选节点拖入同一个分组 → 分组感应区稳定亮起
   - 多选节点分别拖向两个不同分组 → 两个分组同时亮起
   - 多选节点中部分在组内、部分在组外 → 有效的分组亮起，组外节点不影响高亮
   - 单节点拖入分组 → 行为与之前一致
