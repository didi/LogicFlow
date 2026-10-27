# PoolElements 与 DynamicGroup 严格隔离设计

> 状态说明：本文是后续架构隔离方案的设计稿，不是当前分支已完成的实现说明。当前分支仍沿用 `graphModel.dynamicGroup = PoolElements` 的兼容入口；请以源码和用户文档为当前行为准。

## 背景

`PoolElements` 泳道图插件复用了 `DynamicGroupNodeModel` 的容器、折叠和虚拟边能力。历史实现中，`PoolElements` 为了让 `PoolModel`、`LaneModel` 以及继承自 `DynamicGroupNodeModel` 的折叠逻辑拿到插件实例，直接写入：

```ts
graphModel.dynamicGroup = this
```

`DynamicGroup` 插件本身也写入同一个入口：

```ts
graphModel.dynamicGroup = this
```

这导致两个插件同时启用时，最后初始化的插件覆盖前一个插件。当前 Pool/Lane Workbench 的共存模式中插件顺序为：

```ts
[DynamicGroup, PoolElements, SelectionSelect, Control]
```

因此最终 `graphModel.dynamicGroup` 指向 `PoolElements`，而不是真正的 `DynamicGroup`。结果包括：DynamicGroup 拖入子节点不稳定、折叠 children 不生效、折叠虚拟边 registry 串用、SelectionSelect 父容器识别不准确，以及 `PoolElements.nodeLaneMap` 被 DynamicGroup 的 `GROUP_ADD_NODE` 事件污染。

本设计目标是让 `PoolElements` 不再依赖、复用或覆盖 `graphModel.dynamicGroup`，从架构上消除共存歧义。

## 目标

- `graphModel.dynamicGroup` 永远只代表 `DynamicGroup` 插件实例。
- `graphModel.poolElements` 永远只代表 `PoolElements` 插件实例。
- Pool/Lane 内部逻辑不再读取 `graphModel.dynamicGroup`。
- DynamicGroup 内部逻辑不读取 `graphModel.poolElements`。
- 公共插件可以显式同时识别 DynamicGroup 和 PoolElements，但不能通过兼容式混用接口猜测容器类型。
- `PoolElements.nodeLaneMap` 只维护 Pool/Lane 关系，不记录 DynamicGroup 成员关系。
- DynamicGroup 的拖入候选只识别真正的 `dynamic-group` 节点，不把 `pool` 或 `lane` 当作普通 DynamicGroup。

## 非目标

- 不重写 Pool/Lane 的数据结构。
- 不取消 `PoolModel`、`LaneModel` 对 `DynamicGroupNodeModel` 的继承。
- 不新增 fallback 让 `PoolElements` 继续写入 `graphModel.dynamicGroup`。
- 不让 DynamicGroup 插件感知 PoolElements。
- 不在 Demo 层绕过生产插件实现共存。

## 当前问题定位

### 共享入口覆盖

`DynamicGroup` 当前入口：

```ts
// packages/extension/src/dynamic-group/index.ts
graphModel.dynamicGroup = this
```

`PoolElements` 当前入口：

```ts
// packages/extension/src/pool/index.ts
graphModel.dynamicGroup = this
```

这让 `graphModel.dynamicGroup` 的实际类型取决于插件注册顺序。

### Pool/Lane 直接读取 dynamicGroup

以下 Pool/Lane 代码当前直接依赖 `graphModel.dynamicGroup`：

- `packages/extension/src/pool/index.ts`：插件初始化写入入口。
- `packages/extension/src/pool/PoolModel.ts`：`getPoolPlugin()`。
- `packages/extension/src/pool/LaneModel.ts`：`toggleCollapse()` 读取折叠配置。
- `packages/extension/src/pool/PoolView.ts`：折叠按钮显示判断。
- `packages/extension/src/pool/LaneView.ts`：折叠按钮显示判断。

这些都应迁移到 `graphModel.poolElements`。

### 继承折叠逻辑中的硬编码入口

`PoolModel` 和 `LaneModel` 折叠时会调用：

```ts
super.toggleCollapse(next)
```

该方法来自 `DynamicGroupNodeModel`。`DynamicGroupNodeModel.toggleCollapse()` 内部会调用：

```ts
this.collapseEdge(nextCollapseState, allRelatedEdges)
```

`DynamicGroupNodeModel.collapseEdge()` 当前写死读取：

```ts
graphModel.dynamicGroup.getGroupByNodeId(...)
graphModel.dynamicGroup.registerCollapsedVirtualEdge(...)
graphModel.dynamicGroup.unregisterCollapsedVirtualEdge(...)
```

在严格拆分后，Pool/Lane 折叠边逻辑必须走 `graphModel.poolElements`，不能继续走 `graphModel.dynamicGroup`。否则 Lane/Pool 的折叠边会查 DynamicGroup 的 `nodeGroupMap`，而不是 PoolElements 的 `nodeLaneMap`。

### 事件污染

DynamicGroup 和 PoolElements 都通过 `GROUP_ADD_NODE` 表达容器添加子节点：

```ts
ExtensionEventType.GROUP_ADD_NODE
```

PoolElements 当前监听该事件后无条件写入：

```ts
nodeLaneMap.set(childId, groupData.id)
```

当事件来自 DynamicGroup 时，这会把 DynamicGroup 成员关系错误写入 `nodeLaneMap`。

### 目标容器识别过宽

DynamicGroup 的目标容器查找当前使用：

```ts
node.isGroup
```

Pool/Lane 继承自 `DynamicGroupNodeModel`，也满足 `isGroup === true`。因此 DynamicGroup 拖入判断可能把 `pool` 或 `lane` 当成 DynamicGroup 候选。

## 设计原则

### 严格入口

`PoolElements` 初始化只写：

```ts
graphModel.poolElements = this
```

`DynamicGroup` 初始化只写：

```ts
graphModel.dynamicGroup = this
```

不要保留以下兼容兜底：

```ts
if (!graphModel.dynamicGroup) {
  graphModel.dynamicGroup = this
}
```

该兜底会继续让 `graphModel.dynamicGroup` 的语义变成“DynamicGroup 或 PoolElements”，不利于共存和排查。

### 显式选择插件来源

Pool/Lane 代码需要插件配置或 registry 时，明确读取：

```ts
graphModel.poolElements
```

DynamicGroup 代码需要插件配置或 registry 时，明确读取：

```ts
graphModel.dynamicGroup
```

不新增 `getContainerPlugin()` 这种隐式分发方法，避免重新形成“基类替子类猜插件来源”的模式。

### 保留继承，但切开插件依赖

`PoolModel` 和 `LaneModel` 可以继续调用 `super.toggleCollapse(next)` 复用以下逻辑：

- 更新折叠状态。
- 切换展开/折叠尺寸。
- 遍历 children 并切换 visible。
- 收集相关边。

但折叠边 registry 必须由 Pool/Lane 显式切换到 `graphModel.poolElements`。

## 方案

### 1. 新增 `graphModel.poolElements` 入口

在 `PoolElements.init()` 中把：

```ts
graphModel.dynamicGroup = this
```

改为：

```ts
graphModel.poolElements = this
```

不再写入 `graphModel.dynamicGroup`。

如果 TypeScript 类型中没有 `poolElements` 字段，应补充扩展类型或局部类型声明，避免大量 `as any` 扩散。

### 2. Pool/Lane 直接插件读取迁移

将 Pool/Lane 自身代码中的 `graphModel.dynamicGroup` 迁移为 `graphModel.poolElements`。

涉及位置：

```ts
// packages/extension/src/pool/PoolModel.ts
getPoolPlugin(): any {
  return this.graphModel.poolElements
}
```

```ts
// packages/extension/src/pool/LaneModel.ts
const plugin = this.graphModel.poolElements as any
```

```ts
// packages/extension/src/pool/PoolView.ts
const plugin = model.graphModel.poolElements as any
```

```ts
// packages/extension/src/pool/LaneView.ts
const plugin = model.graphModel.poolElements as any
```

这些地方不应 fallback 到 `dynamicGroup`。

### 3. 抽出折叠边共享实现

`DynamicGroupNodeModel.collapseEdge()` 当前同时承担“算法”和“registry 来源选择”。需要把 registry 来源显式参数化。

推荐新增内部方法：

```ts
type CollapseEdgeRegistry = {
  getGroupByNodeId(nodeId: string): BaseNodeModel | undefined
  registerCollapsedVirtualEdge(
    virtualId: string,
    groupId: string,
    realEdgeId: string,
  ): void
  unregisterCollapsedVirtualEdge(virtualId: string): void
}

protected createVirtualEdgeWithRegistry(
  edgeConfig: EdgeConfig,
  realEdgeId: string,
  registry?: CollapseEdgeRegistry,
) {
  const virtualEdge = this.graphModel.addEdge(edgeConfig)
  virtualEdge.virtual = true
  virtualEdge.text.editable = false
  virtualEdge.isCollapsedEdge = true

  registry?.registerCollapsedVirtualEdge(virtualEdge.id, this.id, realEdgeId)

  return virtualEdge
}

protected collapseEdgeWithRegistry(
  collapse: boolean,
  edges: BaseEdgeModel[],
  registry?: CollapseEdgeRegistry,
) {
  // 复用当前 collapseEdge 的边分类、虚拟边创建、真实边隐藏/恢复逻辑。
  // 唯一变化：所有 registry 查询和登记都使用传入 registry。
}
```

`DynamicGroupNodeModel` 默认实现明确使用 `graphModel.dynamicGroup`：

```ts
createVirtualEdge(edgeConfig: EdgeConfig, realEdgeId: string) {
  return this.createVirtualEdgeWithRegistry(
    edgeConfig,
    realEdgeId,
    this.graphModel.dynamicGroup,
  )
}

collapseEdge(collapse: boolean, edges: BaseEdgeModel[]) {
  this.collapseEdgeWithRegistry(
    collapse,
    edges,
    this.graphModel.dynamicGroup,
  )
}
```

### 4. PoolModel / LaneModel 显式 override 折叠边 registry

`PoolModel` 和 `LaneModel` 继续复用 `super.toggleCollapse(next)`，但 override `createVirtualEdge()` 和 `collapseEdge()`：

```ts
createVirtualEdge(edgeConfig: EdgeConfig, realEdgeId: string) {
  return this.createVirtualEdgeWithRegistry(
    edgeConfig,
    realEdgeId,
    this.graphModel.poolElements,
  )
}

collapseEdge(collapse: boolean, edges: BaseEdgeModel[]) {
  this.collapseEdgeWithRegistry(
    collapse,
    edges,
    this.graphModel.poolElements,
  )
}
```

这样 `DynamicGroupNodeModel.toggleCollapse()` 内部执行：

```ts
this.collapseEdge(...)
```

时，Pool/Lane 实例会走自己的 override 方法，从而使用 `graphModel.poolElements`。

### 5. PoolElements 事件隔离

PoolElements 的 `onGroupAddNode` 只处理 Pool/Lane 相关事件。

建议先严格只处理 Lane 添加普通业务节点：

```ts
onGroupAddNode = ({ data: groupData, childId }) => {
  if (String(groupData.type) !== 'lane') return

  this.nodeLaneMap.set(childId, groupData.id)
  const lane = this.lf.getNodeModelById(groupData.id) as LaneModel | undefined
  if (lane && String(lane.type) === 'lane') {
    this.syncLaneChildZIndex(lane, childId)
  }
}
```

如果后续确认 Pool 添加 Lane 也必须通过该事件维护 `nodeLaneMap`，应显式增加 `pool` 分支，并校验 `childId` 对应节点类型为 `lane`。不能让 `dynamic-group` 事件进入 `nodeLaneMap`。

### 6. DynamicGroup 目标识别隔离

DynamicGroup 的 `getGroupByBounds()` 不应继续用：

```ts
node.isGroup
```

作为目标容器条件。

应改成只识别：

```ts
String(node.type) === 'dynamic-group'
```

这避免 Pool/Lane 因继承 `DynamicGroupNodeModel` 被 DynamicGroup 插件当成候选容器。

DynamicGroup 内部递归处理 children 时仍可根据实际需要判断 `model.isGroup`，但“拖入目标容器识别”必须收窄为 `dynamic-group`。

### 7. SelectionSelect 显式支持两个入口

`SelectionSelect` 是公共插件，可以同时识别 legacy group、DynamicGroup 和 PoolElements。

当前逻辑中从 `dynamicGroup` 上兼容查 `getLaneByNodeId` 的方式应移除。拆分后查询应明确：

```ts
const { group, dynamicGroup, poolElements } = this.lf.graphModel

if (typeof group?.getNodeGroup === 'function') {
  const legacyGroup = group.getNodeGroup(nodeId)
  if (legacyGroup) return legacyGroup
}

if (typeof dynamicGroup?.getGroupByNodeId === 'function') {
  const parent = dynamicGroup.getGroupByNodeId(nodeId)
  if (parent) return parent
}

if (typeof poolElements?.getLaneByNodeId === 'function') {
  return poolElements.getLaneByNodeId(nodeId)
}
```

建议优先级为：

```text
legacy group -> dynamic-group -> lane
```

如果后续业务希望 Lane 优先，可以单独调整 SelectionSelect 的查询顺序，但不要再让 DynamicGroup 承担 Lane 查询。

### 8. 示例与 Workbench 调整

Pool/Lane Workbench 已经有三种模式：

- 只 Pool。
- Pool + DynamicGroup。
- 只 DynamicGroup。

共存修复后应在右侧 debug 面板或日志中明确展示：

```ts
graphModel.dynamicGroup
graphModel.poolElements
lf.extension.dynamicGroup
lf.extension.PoolElements
```

旧的 `SelectionPoolConflictView` 如果仍用于验证，也应更新打印逻辑，不再把 PoolElements 当成 `graphModel.dynamicGroup`。

## 兼容性影响

该方案有一个明确的用户可见变化：

以前只启用 `PoolElements` 时，用户可能通过以下方式拿到 PoolElements 插件实例：

```ts
lf.graphModel.dynamicGroup
```

严格拆分后，该入口不再代表 PoolElements。用户应改用：

```ts
lf.graphModel.poolElements
```

或更推荐使用插件系统已有入口：

```ts
lf.extension.PoolElements
```

这是语义修正。若后续实施该隔离方案，为了避免用户误解，需要在 changeset 和文档中说明：

> PoolElements will no longer reuse `graphModel.dynamicGroup`. Use `lf.extension.PoolElements` or `graphModel.poolElements` for Pool/Lane plugin APIs.

## 测试矩阵

### 入口隔离

- 只注册 `DynamicGroup`：
  - `graphModel.dynamicGroup` 存在。
  - `graphModel.poolElements` 不存在。
  - DynamicGroup 拖入、折叠 children 正常。

- 只注册 `PoolElements`：
  - `graphModel.poolElements` 存在。
  - `graphModel.dynamicGroup` 不应被 PoolElements 写入。
  - Lane 拖入、折叠、虚拟边正常。

- 同时注册 `DynamicGroup` 和 `PoolElements`：
  - `graphModel.dynamicGroup` 指向 DynamicGroup 插件。
  - `graphModel.poolElements` 指向 PoolElements 插件。
  - 注册顺序不应导致二者互相覆盖。

### 归属隔离

- 普通节点拖入 DynamicGroup：
  - DynamicGroup 的 `children` 包含该节点。
  - DynamicGroup 的 `nodeGroupMap` 记录该节点。
  - PoolElements 的 `nodeLaneMap` 不记录该 DynamicGroup 关系。

- 普通节点拖入 Lane：
  - Lane 的 `children` 包含该节点。
  - PoolElements 的 `nodeLaneMap` 记录该节点。
  - DynamicGroup 的 `nodeGroupMap` 不记录该 Lane 关系。

- DynamicGroup 与 Lane/Pool 有几何重叠时：
  - DynamicGroup 插件只把 `dynamic-group` 当作目标。
  - PoolElements 插件只把 `lane` 当作普通节点目标。

### 折叠隔离

- DynamicGroup 折叠：
  - 只隐藏 DynamicGroup children。
  - 虚拟边登记到 DynamicGroup 插件的 collapsed edge maps。

- Lane 折叠：
  - 只隐藏 Lane children。
  - 虚拟边登记到 PoolElements 插件的 collapsed edge maps。
  - 不访问 DynamicGroup 插件的 `nodeGroupMap`。

- Pool 折叠：
  - Lane 状态快照、恢复和布局正常。
  - 虚拟边登记到 PoolElements 插件。

### SelectionSelect

- 框选 DynamicGroup 子节点时，识别 DynamicGroup parent。
- 框选 Lane 子节点时，识别 Lane parent。
- 同一节点同时存在 DynamicGroup 和 Lane 关系时，按约定优先级 `dynamic-group -> lane` 返回父容器。

## 验证命令

最小验证建议：

```sh
pnpm exec jest packages/extension/__test__/dynamic-group --runInBand
pnpm exec jest packages/extension/__test__/pool --runInBand
pnpm --filter @logicflow/extension build
pnpm --dir examples/vue3-app test:unit src/views/__tests__/PoolLaneWorkbenchView.spec.ts --run
pnpm --dir examples/vue3-app build-only
pnpm exec prettier --check packages/extension/src/dynamic-group/model.ts packages/extension/src/dynamic-group/index.ts packages/extension/src/pool/index.ts packages/extension/src/pool/PoolModel.ts packages/extension/src/pool/LaneModel.ts packages/extension/src/pool/PoolView.ts packages/extension/src/pool/LaneView.ts packages/extension/src/components/selection-select/index.ts examples/vue3-app/src/views/PoolLaneWorkbenchView.vue
```

不要声明未运行的验证。

## 实施顺序建议

1. 补入口隔离失败测试，证明 PoolElements 当前会覆盖 `graphModel.dynamicGroup`。
2. 新增 `graphModel.poolElements` 并移除 PoolElements 对 `graphModel.dynamicGroup` 的写入。
3. 将 Pool/Lane 直接读取插件实例的位置迁移到 `poolElements`。
4. 抽出 `collapseEdgeWithRegistry` 和 `createVirtualEdgeWithRegistry`。
5. 在 PoolModel / LaneModel 中 override `collapseEdge` 和 `createVirtualEdge`，显式使用 `poolElements`。
6. 给 PoolElements 的 `GROUP_ADD_NODE` 监听加类型过滤。
7. 收窄 DynamicGroup 的目标容器识别条件。
8. 更新 SelectionSelect 的父容器查询逻辑。
9. 更新 Workbench debug 信息和相关测试。
10. 添加 changeset 和必要文档说明兼容变化。

## 风险与回滚

主要风险是已有用户依赖 `lf.graphModel.dynamicGroup` 访问 PoolElements。这是历史混用入口，不再保留。回滚方式是恢复 PoolElements 写入 `graphModel.dynamicGroup`，但这会重新引入 DynamicGroup 共存问题，不建议作为长期方案。

实现中应避免大范围重构。每一步都应有独立测试证明行为变化，尤其是折叠虚拟边 registry 的归属隔离。
