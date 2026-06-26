# DynamicGroup 删除分组时级联删除子节点 — 设计说明

**日期：** 2026-06-26  
**状态：** 待审阅  
**关联：** [2026-05-18-dynamic-group-fix-design.md](./2026-05-18-dynamic-group-fix-design.md)、[2026-06-24-dynamic-group-membership-semantics-design.md](./2026-06-24-dynamic-group-membership-semantics-design.md)、[dynamic-group.zh.md](../../../sites/docs/docs/tutorial/extension/dynamic-group.zh.md)

## 背景

删除 `dynamic-group` 节点时，`DynamicGroup` 插件在 `node:delete` 回调中会**级联删除**其 `children` 中的全部成员。该行为与旧版 `Group`、 `PoolElements` 一致，v1.1 升级说明亦有记载。

部分业务将 DG 视为**视觉容器**而非**复合对象**：删除分组框时不应删除内部流程节点，仅需解除成员关系。当前实现无配置项，无法 opt-out。

## 决策（已确认）

| 项 | 决策 |
| --- | --- |
| 配置名 | `cascadeDeleteChildren` |
| 配置层级 | **仅插件级** `pluginsOptions.dynamicGroup` |
| 默认值 | **`true`**（与现网一致，升级零成本） |
| `true` | 删除 DG 时递归删除全部成员（现状） |
| `false` | 仅删除 DG；成员保留在画布原位置，解除 `children` / `nodeGroupMap` |
| 范围 | **仅** `DynamicGroup` 插件；不改 legacy `Group`、`PoolElements`（可后续对齐） |
| 节点级覆盖 | **不做** |
| 版本 | **Minor 新能力**（非 breaking）；默认行为不变 |

## 行为定义

### `cascadeDeleteChildren: true`（默认）

与当前 `removeNodeFromGroup` 一致：

1. 对被删 DG 的每个 `childId`：`nodeGroupMap.delete(childId)` → `lf.deleteNode(childId)`。
2. 若成员本身为 DG，`node:delete` 再次触发，形成递归级联。
3. 其后逻辑不变：若被删节点是某组的子成员，从父组 `removeChild` 并清理 map。

### `cascadeDeleteChildren: false`

删除 DG **之前**，对其**直接成员**执行解组（不调用 `lf.deleteNode`）：

1. 遍历 `Array.from(groupModel.children)`（先拷贝再迭代，避免 mutate 中删集合）。
2. 对每个 `childId`：`group.removeChild(childId)` + `nodeGroupMap.delete(childId)`。
3. 子节点坐标不变；与其相连的边保留。
4. 若 DG 处于**折叠态**：
   - 被隐藏的直接成员恢复 `visible = true`；
   - 清理该 DG 注册的折叠虚拟边及 `collapsedEdgeState` 等临时状态，避免删组后残留僵尸虚拟边或错误隐藏的真实边。
5. 嵌套 DG：父组 `false` 时，子 DG 保留且仍拥有自己的 `children`；不会 flatten 整棵子树。

### 与 #2194 场景的关系

「先 `removeChild` 再删分组、子节点应可正常选中」属于 map 一致性修复，与本选项正交。`cascadeDeleteChildren: false` 的解组路径应复用与 `detachNodeFromGroup` 一致的 map / `children` 维护，并覆盖折叠态可见性。

## API

### 插件选项

```tsx
const lf = new LogicFlow({
  plugins: [DynamicGroup],
  pluginsOptions: {
    dynamicGroup: {
      cascadeDeleteChildren: false, // 删组时保留子节点；默认 true
    },
  },
})
```

扩展 `DynamicGroup` 实例字段 / options 类型：

```ts
interface DynamicGroupOptions {
  disallowEdgeConnectToGroup?: boolean
  cascadeDeleteChildren?: boolean // 默认 true
}
```

## 实现要点

**主改动文件：** `packages/extension/src/dynamic-group/index.ts`

### 新增

- 实例字段 `cascadeDeleteChildren: boolean = true`（`constructor` 中 `assign(this, options)` 覆盖）。
- `releaseGroupMembers(groupModel: DynamicGroupNodeModel)`：批量解组；折叠态时恢复可见性并清理本组虚拟边状态。
- 在 `removeNodeFromGroup` 分支：`cascadeDeleteChildren ? 现有级联 : releaseGroupMembers`。

### 折叠态清理

`releaseGroupMembers` 在分组处于折叠态时先调用 `groupModel.toggleCollapse(false)`，复用现有展开路径恢复真实边与成员可见性；**不要**在注销映射前 `deleteEdgeById` 删除虚拟边，否则会经 `onEdgeDelete` 误删真实边。

### 删除时序

`graphModel.deleteNode` 会在 emit `node:delete` **之前**删除以该节点为端点的边（含折叠虚拟边）。因此 `cascadeDeleteChildren: false` 时须在 `lf.deleteNode` 层先调用 `releaseGroupMembers`，再委托原始 `deleteNode`（插件 init 中包装，destroy 时还原）。

### 非目标

- 不修改 `packages/extension/src/materials/group`。
- 不在本期修改 `PoolElements.removeNodeFromGroup`（文档注明后续可对齐）。

## 测试

文件：`packages/extension/__test__/dynamic-group/membership.test.ts`（或新建 `delete-behavior.test.ts` 若用例过多）。

| ID | 场景 | 断言要点 |
| --- | --- | --- |
| D1 | 默认（未传 option）删含子节点的 DG | 子节点从 `graphModel` 移除 |
| D2 | `cascadeDeleteChildren: false` 删 DG | DG 消失；子节点仍在；`getGroupByNodeId(childId)` 为 `undefined` |
| D3 | D2 + 子节点有对外边 | 边仍存在 |
| D4 | 嵌套 DG，父 `false` | 子 DG 保留且仍含其 children |
| D5 | 折叠 DG + `false` | 成员可见；无残留虚拟边；真实边状态正确 |
| D6 | 先 `removeChild` 再删空 DG | 与 #2194 一致，选中子节点无报错（回归） |

## 文档与发布

### 文档站（实现阶段必做）

更新 `sites/docs/docs/tutorial/extension/dynamic-group.zh.md` 与 `.en.md` 的「插件配置项」表格：

- 新增 `cascadeDeleteChildren` 行：类型 `boolean`，默认 `true`，说明两种语义。
- **默认行为不变**：在表格或紧邻段落用醒目提示（引用块 / 加粗）说明「默认仍为删组即删子节点，与 v1.1 以来行为一致；仅当显式设为 `false` 时保留子节点」。

### CHANGELOG（发布阶段必做）

在 `packages/extension/CHANGELOG.md` 对应版本下记录：

- **Added**: `pluginsOptions.dynamicGroup.cascadeDeleteChildren`（默认 `true`）。
- 说明 `false` 时删组保留子节点；强调**默认未变**。

## 验证

```sh
pnpm test -- --testPathPattern="dynamic-group"
cd packages/extension && pnpm run dev
cd examples/dynamic-group-regression && pnpm dev
```

手动：在 regression 示例中增加「删组保留子节点」操作按钮（可选，非必须若单测覆盖充分）。
