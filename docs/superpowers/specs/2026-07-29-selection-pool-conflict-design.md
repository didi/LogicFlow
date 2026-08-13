# SelectionSelect 与 PoolElements 框选冲突修复设计

**日期**：2026-07-29  
**作者**：brainstorming session  
**状态**：待实现  
**关联**：[#2418](https://github.com/didi/LogicFlow/issues/2418)、[packages/extension/ARCHITECTURE.md](../../../packages/extension/ARCHITECTURE.md)（Grouping 节）

---

## 背景

`SelectionSelect` 框选插件在 `PoolElements` 泳池/泳道场景下会报错：

```text
Uncaught TypeError: dynamicGroup_1.getGroupByNodeId is not a function
```

Issue #2418 反馈版本为 `@logicflow/core@2.2.3` 与 `@logicflow/extension@2.2.3`，使用框选即报错。

当前 extension 中有三套相关容器能力：

| 栈 | 插件 | 节点类型 | `graphModel` 挂载点 |
| --- | --- | --- | --- |
| DynamicGroup | `DynamicGroup` | `dynamic-group` | `graphModel.dynamicGroup` |
| Pool | `PoolElements` | `pool` / `lane` | `graphModel.dynamicGroup` |
| 旧 Group | `Group` | `group` | `graphModel.group` |

`DynamicGroup` 和 `PoolElements` 都挂到 `graphModel.dynamicGroup`，但插件实例 API 不同：

```typescript
// DynamicGroup
getGroupByNodeId(nodeId)

// PoolElements
getLaneByNodeId(nodeId)
```

## 问题根因

`SelectionSelect` 在框选结束后会拿到区域内所有元素：

```typescript
const elements = this.lf.graphModel.getAreaElement(...)
```

这些元素可能同时包含父容器和子元素。为了避免父子重复选中，框选插件会过滤掉“父容器也在本次框选结果中”的子元素。

现有逻辑只兼容旧 `Group` 和 `DynamicGroup`：

```typescript
const { dynamicGroup, group } = this.lf.graphModel

if (group) {
  const elementGroup = group.getNodeGroup(element.id)
  if (elements.includes(elementGroup)) return
}

if (dynamicGroup) {
  const elementGroup = dynamicGroup.getGroupByNodeId(element.id)
  if (elements.includes(elementGroup)) return
}
```

当 `PoolElements` 启用时，`graphModel.dynamicGroup` 指向 Pool 插件实例。Pool 插件没有 `getGroupByNodeId`，因此框选结束时抛出 TypeError。

## Pool / Lane 关系

`PoolElements` 的数据关系是固定三层：

```text
pool
  └─ lane
       └─ 普通节点
```

对应数据关系：

```text
pool.children = [laneId]
lane.properties.parent = poolId
lane.children = [nodeId]
node.properties.parent = laneId
```

`PoolElements.nodeLaneMap` 名称偏窄，实际记录的是直接父容器关系。渲染后会遍历所有带 `children` 的节点并登记：

```text
laneId -> poolId
nodeId -> laneId
```

因此 `getLaneByNodeId(nodeId)` 对框选去重可理解为“获取直接父容器”：

| 输入 | 返回 |
| --- | --- |
| 普通节点 id | 所属 lane |
| lane id | 所属 pool |
| pool id | `undefined` |

## 设计目标

- 修复 `SelectionSelect + PoolElements` 框选时报 `getGroupByNodeId is not a function`。
- 保持框选父子去重语义：父容器被框选时，不重复选中它的子元素。
- 兼容旧 `Group`、`DynamicGroup`、`PoolElements` 三类容器。
- 保持公共 API 兼容，不改变 `PoolElements` / `DynamicGroup` 的现有挂载点和方法名。

## 非目标

- 不重构 `graphModel.dynamicGroup` 单槽挂载设计。
- 不新增公开 API，例如 `getContainerByNodeId`。
- 不修改 Pool / Lane 的成员维护、拖拽入泳道、泳道 resize、删除泳道行为。
- 不改变 `DynamicGroup` 与旧 `Group` 的框选行为。

## 推荐方案

在 `SelectionSelect` 内部新增一个私有辅助方法，用中性语义获取元素的父容器：

```typescript
private getParentContainerByNodeId(nodeId: string) {
  const { dynamicGroup, group } = this.lf.graphModel

  if (typeof group?.getNodeGroup === 'function') {
    const legacyGroup = group.getNodeGroup(nodeId)
    if (legacyGroup) return legacyGroup
  }

  if (typeof dynamicGroup?.getGroupByNodeId === 'function') {
    return dynamicGroup.getGroupByNodeId(nodeId)
  }

  if (typeof dynamicGroup?.getLaneByNodeId === 'function') {
    return dynamicGroup.getLaneByNodeId(nodeId)
  }
}
```

框选结果过滤改为统一使用该方法：

```typescript
const parentContainer = this.getParentContainerByNodeId(element.id)
if (elements.includes(parentContainer)) {
  return
}
```

这样 `SelectionSelect` 的判断对象从“DynamicGroup 分组”收敛为更准确的“父容器”。Pool 场景只需兼容 `getLaneByNodeId`，无需让 `PoolElements` 假装实现完整 DynamicGroup 插件 API。

## 行为预期

| 场景 | 预期框选结果 |
| --- | --- |
| `dynamic-group + child` | 只选 `dynamic-group` |
| `lane + node` | 只选 `lane` |
| `pool + lane + node` | 只选 `pool` |
| 只框到 `node` | 选中 `node` |
| 无容器插件 | 保持普通框选行为 |

## 备选方案

### 方案 B：PoolElements 增加 `getGroupByNodeId`

在 `PoolElements` 中添加兼容方法：

```typescript
getGroupByNodeId(nodeId: string) {
  return this.getLaneByNodeId(nodeId)
}
```

该方案改动更小，但会让 Pool 插件暴露 DynamicGroup 命名的 API。由于 Pool 中返回值可能是 `lane` 或 `pool`，语义不够准确，本次不采用。

### 方案 C：抽象统一容器接口

为容器类插件设计统一内部接口，例如 `getParentContainerByNodeId` 或 `getContainerByNodeId`，由 `DynamicGroup` 与 `PoolElements` 分别实现。

该方案语义最好，但涉及 API 设计、类型声明、文档和迁移策略。对 #2418 来说范围偏大，本次不采用。

## 测试策略

遵循仓库 TDD 约定，先补失败测试，再实现。

建议新增测试文件：

```text
packages/extension/__test__/selection-select/pool-conflict.test.ts
```

测试重点：

1. `PoolElements + SelectionSelect` 下，父容器判断不调用不存在的 `getGroupByNodeId`，不抛 TypeError。
2. 框选结果包含 `pool + lane + node` 时，过滤后只保留 `pool`。
3. 框选结果包含 `lane + node` 时，过滤后只保留 `lane`。
4. `DynamicGroup + SelectionSelect` 原有父子去重行为保持不变。

人工验证使用 Vue3 复现页：

```text
examples/vue3-app
/selection-pool-conflict
```

操作步骤：

1. 启动 packages 监听：`pnpm run dev`
2. 启动示例：`cd examples/vue3-app && pnpm dev`
3. 打开 `/selection-pool-conflict`
4. 点击“开启框选”
5. 拖拽框选 `pool + lane + node`
6. 控制台无 `getGroupByNodeId is not a function`，选中结果符合上表

## 兼容性与风险

- 只修改 `SelectionSelect` 内部判断逻辑，不改变公开 API。
- 旧 `Group` 和 `DynamicGroup` 保持优先路径，避免影响既有场景。
- Pool 场景使用已有 `getLaneByNodeId`，不新增 `PoolElements` API。
- 风险点在于 `getLaneByNodeId` 名称偏窄但实际返回直接父容器；测试需覆盖 `lane -> pool` 和 `node -> lane` 两层关系。

## 验收清单

- [ ] `PoolElements + SelectionSelect` 框选不再抛 TypeError。
- [ ] 框选 `pool + lane + node` 只选中 `pool`。
- [ ] 框选 `lane + node` 只选中 `lane`。
- [ ] 框选普通节点仍可选中普通节点。
- [ ] DynamicGroup 父子去重行为不回退。
- [ ] Vue3 复现页可人工验证 #2418。
