# DynamicGroup 分组修复设计说明

**日期：** 2026-05-18  
**状态：** 待审阅（已补充 TDD 测试用例）  
**关联：** [分组功能Bug综合分析报告.md](../../../分组功能Bug综合分析报告.md)、[packages/extension/ARCHITECTURE.md](../../../packages/extension/ARCHITECTURE.md)（Grouping 节）

## 目标

修复 `dynamic-group` 与 `DynamicGroup` 插件相关 Open Issue，使行为与官方文档一致，并满足已确认的嵌套与泳道组合场景。

## 非目标

- `bpmn:subProcess`、旧 `Group` 插件（`materials/group`）
- BPMN `adapterOut` 多层 subProcess（#2180）除非与本期 lane 内分组无冲突则可 defer

## 已确认决策

| 项 | 决策 |
| --- | --- |
| 边 / 折叠 | **方案甲**：统一边状态机 |
| 嵌套 | **统一策略**：支持 `dynamic-group` 同构嵌套；允许异构组合 Pool → Lane → DG → 普通节点 |
| Lane 内 DG | **本期测通**（含折叠、对外连线、组内成员） |
| #1673 | 本期修 |
| #2205 / #2332 | 本期修（layout / 格式化适配分组） |
| #1555 | 关闭 · 暂不修复（与全图节点统一四角 resize） |
| **分组节点名（LOCAL-3）** | **本期纳入、必要**：业务用户在画布建组并起名；**展开态与折叠态均可**双击编辑；`setTextPosition` 在两种态下分别锚定文案；折叠 ↔ 展开切换后组名不丢、位置不漂 |
| **折叠态组名展示（LOCAL-4）** | **方案 B**：折叠框宽固定（`collapsedWidth/Height`），组名超出宽度时 **ellipsis 省略号**；不随文案自动撑开折叠框 |

## 嵌套策略（统一）

```text
允许：
  dynamic-group → dynamic-group → 业务节点（rect 等）
  pool → lane → dynamic-group → 业务节点（rect 等）

实现要点：
  - DynamicGroupNodeModel.isAllowAppendIn：默认允许 dynamic-group 子组，业务可按需重写
  - LaneModel：继续禁止 lane ⊂ lane；允许 dynamic-group ⊂ lane
  - 数据格式保留 children 树，支持同构嵌套
```

## 边状态机（方案甲）

**折叠时（对每个相关真实边）：**

1. 若尚未记录，写入 `collapsedEdgeState: Map<edgeId, EdgeSnapshot>`（含 `pointsList`、端点、必要 properties）
2. `edge.visible = false`
3. 按需创建**独立 id** 的虚拟边；虚拟边 config 不修改原边 model 的 `pointsList`
4. 维护虚拟边 id 列表，展开时删除

**展开时：**

1. 删除本组创建的虚拟边
2. 对 `collapsedEdgeState` 中每条：若 `getEdgeModelById(id)` 不存在则跳过；存在则 `visible = true` 并恢复 snapshot
3. 清空本组临时状态

**删除边：**

- 插件监听 `edge:delete`，从所有分组的 `collapsedEdgeState` / 虚拟边登记中移除
- 维护 **`virtualEdgeId → realEdgeId`**（及反向）映射；删除虚拟边时 **只删除其对应的一条真实边**，并清理 snapshot，不得误删同组其它分支

**其它：**

- 修复 #2401：端点 / 锚点同步，避免 NaN
- 回归：`deleteEdge` + undo/redo

### 边界：同一外部节点多条分支连入分组（Gateway → DG）

**场景：** 判断节点 `G` 有两条边 `e1: G→A`、`e2: G→B`，`A/B` 均在同一 `dynamic-group` 内；折叠该分组。

| 维度 | 行为约定（本期必须满足） |
| --- | --- |
| 折叠后图数据 | **2 条虚拟边**（`e1`、`e2` 各一条），均为 `G → DG`，id 不同（如 `e1__0`、`e2__1`） |
| 折叠后真实边 | **2 条**仍保留，`visible=false`，分别与 `e1`、`e2` 一一对应 |
| 视觉 | 允许两条虚拟边 **路径重叠** 看起来像 1 条线；**不强制**合并为单条展示边（合并展示进 backlog） |
| 删除 1 条可见线 | 仅删除 **被选中虚拟边映射的那一条** 真实边（`e1` 或 `e2`）；**不得**两条一并删除 |
| 删除后折叠态 | 另一条虚拟边 **仍存在**（或仅剩 1 条虚拟边对应未删真实边）；无重复虚拟边、无 NaN |
| 展开后 | 仅 **未删除** 的分支恢复（`G→A` 或 `G→B`）；已删分支 **不得复活**；`getGraphData()` 边集合正确 |
| 禁止 | 展开后误恢复已删边；删虚拟边却留下 `visible=false` 的僵尸边；`collapsedEdgeState` 与图数据不一致 |

```text
折叠前:  G ─e1─► A ─┐
         G ─e2─► B ─┤ 同在 DG 内
折叠后:  G ═virt(e1)═► DG     } 数据上 2 条，常重叠像 1 条
         G ═virt(e2)═► DG
删 virt(e1):  真实 e1 移除；virt(e2) 仍在；展开后仅 G─e2─►B
```

实现要点：创建虚拟边时登记 `virtualToReal: Map<string, string>`；`edge:delete` 若 id 为虚拟边，则 `deleteEdge(realId)` 并同步清理；展开时仅恢复仍在图内且 snapshot 有效的边。

## Pool 与 DynamicGroup 协作（Lane 内 DG 测通）

仅使用 `PoolElements` 时，`graphModel.dynamicGroup` 指向 Pool 插件，但 `collapseEdge` 依赖 `getGroupByNodeId`。

本期要求：

- Lane 内 `dynamic-group` 可拖入、成员 map 正确、折叠 / 展开 / 对外虚拟边行为与纯 DynamicGroup 场景一致
- 实现路径（实现阶段二选一，plan 中细化）：
  - **A.** `PoolElements` 实现 `getGroupByNodeId`（lane 内节点查 lane；DG 子节点查 DG 的 children + 可选委托）
  - **B.** 文档要求 lane 内分组场景同时启用 `DynamicGroup` + `PoolElements`，并解决 `graphModel.dynamicGroup` 单槽冲突（合并 API 或拆分 laneMap / groupMap）

验收必须包含：`examples/feature-examples` 泳道页 + 新增或扩展「lane 内含 dynamic-group」用例。

## 修复批次与 Issue

| 批次 | Issue | 说明 |
| --- | --- | --- |
| 1 | #2395, #2399, **#2400**, #2401, #1809 | 边状态机（#2400 与 #2399 同根因） |
| 2 | #2194, #2052, **#2412**, **LOCAL-2** | children ↔ map；拖放结束勿误移出组；叠放分组归属 |
| 3 | #1616, #2198 | 初始折叠、坐标 |
| 4 | #2205, #2332 | layout / 格式化 |
| 5 | ~~#1555~~（#1532、#1555 均关闭 · 暂不修复） | history、resize UI |
| 6 | **LOCAL-3**, **LOCAL-4** | 分组节点名可编辑；折叠态固定宽 + ellipsis |
| 额外 | #1673 | addNode + children |
| 不做 | #2180 | BPMN adapter 嵌套导出 |
| 关闭 · 暂不修复 | #1532 | resize undo 需多次（默认快速操作通常一次 undo；见 [issue #1532](https://github.com/didi/LogicFlow/issues/1532) 评论） |
| 关闭 · 暂不修复 | #1555 | 分组边中点单边 resize（全图节点统一四角缩放，见 [issue #1555](https://github.com/didi/LogicFlow/issues/1555) 评论） |
| 专项分支 | **LOCAL-1** | 组与子节点图层不一致；见分支 `design/dynamic-group-layering` 与 `2026-06-24-dynamic-group-layering-design.md` |

### 本期新增纳入（2026-05-18）

| 来源 | 编号 | 说明 |
| --- | --- | --- |
| GitHub | [#2412](https://github.com/didi/LogicFlow/issues/2412) | `isRestrict` + `isAllowAppendIn=false` 时组内拖放松手误出组；修 `addNodeToGroup` 先删后加逻辑 |
| GitHub | [#2400](https://github.com/didi/LogicFlow/issues/2400) | 收起时丢 `pointsList`；并入批次 1 |
| Demo 体验 | **LOCAL-1** | 组内节点与分组框 zIndex 不一致（**专项分支** `design/dynamic-group-layering`，本期不修复） |
| Demo 体验 | **LOCAL-2** | 两分组叠放，折叠/展开组 1 导致节点归属组 2 |
| 产品 | **LOCAL-3** | 动态分组节点支持修改节点名；**展开态 + 折叠态**均可编辑；组名在折叠/展开切换后保持 |

## 主要改动文件

- `packages/extension/src/dynamic-group/model.ts`（边状态机、折叠、getHistoryData）
- `packages/extension/src/dynamic-group/index.ts`（map 同步、edge:delete）
- `packages/extension/src/dynamic-group/node.ts`（初始折叠时机）
- `packages/extension/src/pool/*`（Lane 内 DG、getGroupByNodeId 或协作方案）
- `packages/layout/*`（#2205、#2332）
- `packages/core/*`（#1673，若根因在 addNode）
- `packages/extension/ARCHITECTURE.md`（已记录栈关系；必要时补一句 lane 内 DG）

## 验收清单

- [ ] 折叠 → 删对外边 → 展开：边不复活（#2395）
- [ ] **Gateway 双分支入 DG**：折叠后删其中一条虚拟边，展开后仅余对应分支，另一条仍正常（见边界节、E7）
- [ ] 手调折线 → 折叠 → 展开：路径保留（#2399）
- [ ] 折叠 / 展开：无 NaN、线不消失（#2401）
- [ ] 删组 / 移子节点：无 map 残留报错（#2194、#2052）
- [ ] `isCollapsed: true` 首屏位置正确（#1616、#2198）
- [x] 格式化 / layout 后子节点仍在组内（#2205、#2332）
- [x] 分组 resize 撤销一次到位（#1532，**关闭 · 暂不修复**）；单边 resize（#1555，**关闭 · 暂不修复**）
- [x] addNode 带 children 单层建组（#1673）
- [ ] **Lane 内 dynamic-group**：成员、对外连线、折叠 / 展开测通
- [x] **#2412**：`isRestrict` + 拒绝入组时，组内拖放不出组
- [ ] **LOCAL-1**：组与子节点图层一致（**不在本期**；见 `design/dynamic-group-layering`）
- [ ] **LOCAL-2**：重叠分组折叠/展开不误迁移归属
- [ ] **LOCAL-3**：`nodeTextEdit: true` 时，**展开态与折叠态**均可双击改组名；切换折叠/展开后组名不丢、文案仍在组框内
- [ ] **LOCAL-4**：折叠态固定 `collapsedWidth`，组名过长显示省略号，不撑开折叠框
- [ ] Pool 示例回归：无 lane / 移动 / resize 回归

## 开发与验证方式（TDD）

**流程：** 按批次 **先写失败测试 → 实现 → 测试变绿**；每批次单独提交，避免一次改完全部 Issue。

**运行测试（仓库根目录）：**

```sh
pnpm test -- packages/extension/__test__/dynamic-group
pnpm test -- packages/extension/__test__/pool
pnpm test -- packages/layout/__test__/dynamic-group   # 批次 4 新增后
```

> `packages/extension/package.json` 的 `test` 脚本当前为占位，本期在根目录 `jest` 跑 extension 下用例；实现 plan 中可增加 `extension` 包级 `test` 转发。

**测试基建（对齐现有 `__test__/pool`）：**

| 文件 | 职责 |
| --- | --- |
| `packages/extension/__test__/dynamic-group/fixtures.ts` | `createContainer`、`createDynamicGroupLF()`（`plugins: [DynamicGroup]`）、标准图数据工厂 |
| `packages/extension/__test__/dynamic-group/*.test.ts` | 按批次拆分的 Jest 用例（`@jest-environment jsdom`） |
| `packages/extension/__test__/dynamic-group/pool-lane-dg.test.ts` | Lane 内 DG（`PoolElements`，可共用/扩展 `pool/fixtures`） |
| `packages/layout/__test__/dynamic-group-layout.test.ts` | #2205 / #2332（批次 4） |

**可选：** `packages/extension/__test__/dynamic-group/model.unit.test.ts` — 仅测 `collapseEdge` 等纯逻辑（mock `graphModel`），减少 DOM 依赖；与集成测二选一或并存。

---

## 自动化测试用例（按批次）

### 批次 1 — 边状态机（#2395、#2399、#2401、#1809）

文件：`collapse-edge.test.ts`

| ID | 用例 | 断言要点 |
| --- | --- | --- |
| E1 | 外节点 ↔ 组内节点连线，折叠 → `deleteEdge` → 展开 | 展开后**无**该边（不复活） |
| E2 | 折叠前设置自定义 `pointsList`，折叠 → 展开 | `pointsList` 与折叠前一致（或误差 &lt; ε） |
| E3 | 折叠状态下拖拽/调整与边相关的锚点后展开 | 边 `visible`，端点无 `NaN`，`getData()` 可序列化 |
| E4 | 组内 ↔ 组内边，折叠 | 不生成多余虚拟边；展开后仍仅一条真实边 |
| E5 | 外组折叠 + 内组展开（若图中有 lane 内 DG 则放 pool 文件） | 对外虚拟边挂在**最近可折叠祖先**（与方案甲一致） |
| E6 | `deleteEdge` 后 `undo` / `redo` | 与 E1/E2 组合，状态一致、无重复虚拟边 |
| E7 | **Gateway 双分支**：`G→A`、`G→B` 同在 DG 内，折叠 DG | 存在 **2** 条 `virtual` 边，`source=G`、`target=DG`；真实 `e1/e2` 均 `visible=false` |
| E7a | E7 后 **删除其中一条** 虚拟边（按 id 指定，模拟用户选中叠在上层的那条） | 对应真实边从 `graphModel` 移除；**另一条**虚拟边仍在；无抛错、无 NaN |
| E7b | E7a 后 **展开** DG | 仅剩余分支的真实边存在（如只删 `e1` 则展开后仅有 `G→B`）；已删的 `G→A` **不出现** |
| E7c | E7 后 **依次删除两条** 虚拟边再展开 | 展开后 `G` 与 DG 内节点 **无** 对外连线；`getGraphData().edges` 无残留 |

### 批次 2 — 成员 map（#2194、#2052）

文件：`membership.test.ts`

| ID | 用例 | 断言要点 |
| --- | --- | --- |
| M1 | `removeChild` 后 `dynamicGroup.getGroupByNodeId(childId)` | `undefined` |
| M2 | 删除分组节点 | 其 `children` 在 map 中全部清除；选中子节点不抛错 |
| M3 | 新建空组 A，再建组 B，将节点拖入 B | 节点只出现在 B.`children` / B 的 map，不受 A 影响 |
| M4 | `group:add-node` 与 `removeChild` / `node:delete` | `children` 与 `nodeGroupMap` 始终一致 |
| M5 | **#2412**：`isRestrict` + `isAllowAppendIn` 恒 false，组内节点拖放仍在原组 bounds 内 | 松手后仍在原组 `children` / map；不可拖出组外 |
| M6 | **LOCAL-2**：两重叠 DG，组 1 含节点 A，折叠再展开组 1 | A 仍归属组 1，不进入组 2 `children` |

### 批次 3 — 初始折叠与坐标（#1616、#2198）

文件：`collapse-init.test.ts`

| ID | 用例 | 断言要点 |
| --- | --- | --- |
| C1 | `render` 数据 `isCollapsed: true`（子节点在 children 中） | 首屏子节点 `visible=false`；组宽高为 `collapsedWidth/Height` |
| C2 | C1 渲染后立即 `getData()` | 组 `x/y` 与「展开语义」一致（#2198：无二次偏移） |
| C3 | 先展开再折叠再展开 | 组位置与首次展开相比无累计漂移 |

**LOCAL-1（图层）** 已移至专项分支 `design/dynamic-group-layering`；对应设计见 `2026-06-24-dynamic-group-layering-design.md`，不在本分支实现 `z-index.test.ts` 中的 Z1/Z2。

### 批次 4 — layout / 格式化（#2205、#2332）

文件：`packages/layout/__test__/dynamic-group-layout.test.ts`

| ID | 用例 | 断言要点 |
| --- | --- | --- |
| L1 | 含 `dynamic-group` + `children` 的图调用 layout API | layout 后子节点仍在组 `children` 内；相对位置或 bounds 在组内 |
| L2 | 格式化/等效 `getGraphData` 往返 | 子节点不「逃出」组框（#2205） |

### 批次 5 — history 与 resize UI（#1532、#1555 均关闭 · 暂不修复）

文件：`history-resize.test.ts`

| ID | 用例 | 断言要点 |
| --- | --- | --- |
| H1 | 分组 resize 一次 → `undo` 一次 | 宽高与坐标回到 resize 前（#1532，**关闭 · 暂不修复**） |
| R1 | 展开态分组 `resizable: true` | 存在单边 resize 控件（#1555，**关闭 · 暂不修复**；当前与全图节点一致为四角） |
| R2 | `isCollapsed: true` | `getResizeControl()` 为 null（与主流行为一致） |

### 批次 6 — 分组节点名可编辑（LOCAL-3）

文件：`group-text-edit.test.ts`

**背景：** 当前 `DynamicGroupNodeModel.initNodeData` 写死 `text.editable = false`；示例层强行改 `editable` 或把 `text` 改成对象而未同步坐标，会导致文案偏离组框（回归示例已验证不可用）。

**实现要点（`model.ts` / `node.ts`）：**

- 在 `nodeTextEdit === true` 时允许分组文案编辑；未开启时保持现网 `editable: false`
- **展开态、折叠态**均须能进入文本编辑（`collapsible: true` 且 `isCollapsed` 时不应额外禁用）
- 编辑能力走 core 文本编辑链路；编辑完成或折叠/展开后调用 `setTextPosition()` 重算锚点
- 展开态：标题在组框上沿内侧（`y - height/2 + 15`）；折叠态：标题在收起框内（`text.x = x`, `text.y = y`）
- 折叠态编辑后的 `text` 坐标在展开时须换算到展开语义（与 `getHistoryData` #1810 同一套坐标系，避免 history/展开跳变）
- 禁止在示例里 re-register 覆盖 `dynamic-group` 作为长期方案

| ID | 用例 | 断言要点 |
| --- | --- | --- |
| T1 | **展开态**，`nodeTextEdit: true`，双击改组名 | `getData().text.value` 更新；`text` 仍在展开态 `setTextPosition` 位置 |
| T2 | **折叠态**，先 `toggleCollapse(true)` 再双击改组名 | 组名更新；`text` 在折叠态 `setTextPosition` 位置（组框内） |
| T3 | T1 改名后折叠 → 再展开 | 组名保持 T1 的值；展开后位置正确、不漂出组框 |
| T4 | T2 改名后展开 | 组名保持 T2 的值；展开后位置正确 |
| T5 | `nodeTextEdit: false` | 展开/折叠两种态下 `text.editable === false`，不可编辑 |

### 批次 6b — 折叠态组名省略号（LOCAL-4）

文件：`group-text-edit.test.ts`（与 LOCAL-3 同文件）

**方案 B：** 折叠后 `width/height` 仍仅用 `collapsedWidth/Height`（默认 80×60），**不**按组名测宽；标题超出折叠框宽度时显示省略号（`textOverflow: ellipsis` 或等价实现）。

| ID | 用例 | 断言要点 |
| --- | --- | --- |
| T6 | 折叠态，组名长于 `collapsedWidth` 能容纳的宽度 | 视觉上/测宽表现为 ellipsis，不撑开折叠框 |
| T7 | T6 后展开 | 显示完整组名，无省略 |

### 额外 — addNode（#1673）

文件：`add-node.test.ts`（或并入 `membership.test.ts`）

| ID | 用例 | 断言要点 |
| --- | --- | --- |
| N1 | `addNode({ type: 'dynamic-group', children: ['r1'], ... })` 且子节点已存在 | 不抛错；`children` / map 正确 |
| N2 | 单次 `addNode` 同时创建组 + 多个子 id | 组与子节点关系一次建立 |

### 嵌套策略

文件：`nesting.test.ts`

| ID | 用例 | 断言要点 |
| --- | --- | --- |
| X1 | 将 `dynamic-group` 拖入另一 `dynamic-group` | 入组成功；外组 `children`、`nodeGroupMap`、折叠/展开联动正确 |
| X2 | 将 `dynamic-group` 拖入 `lane` | 入组成功；map / `properties.parent` 正确 |

### Pool + Lane 内 DG（本期必测）

文件：`pool-lane-dg.test.ts`

| ID | 用例 | 断言要点 |
| --- | --- | --- |
| P1 | lane 内含 `dynamic-group`，组内含 rect，对外连线 | 折叠 DG：虚拟边 / 隐藏逻辑与 E1–E3 一致 |
| P2 | P1 + 移动 lane / pool | 组与子节点同步移动，无重复位移 |
| P3 | 仅 `PoolElements` 时 `getGroupByNodeId`（实现 A 后） | DG 内子节点能解析到所属 DG；lane 内非 DG 节点解析到 lane |

---

## TDD 执行顺序（与实现批次一致）

```text
1. 新增 fixtures + 空测试骨架（全 skip 或 expect 占位失败）
2. 批次 1：E1–E7c 红灯 → 改 model/index 边状态机（含 `virtualToReal` 映射）→ 绿灯
3. 批次 2：M1–M4 红灯 → 改 map 单写入口 → 绿灯
4. 批次 3：C1–C3 → 批次 4：L1–L2 → 批次 5：H1,R1,R2 → 批次 6：T1–T5 → N1–N2
5. X1–X2、P1–P3（可与 2/3 并行，但 P1 依赖批次 1）
6. 全量：pnpm test -- packages/extension/__test__/dynamic-group packages/extension/__test__/pool
7. 手动：examples/feature-examples dynamic-group / pool 页
```

**完成定义：** 上表用例全部通过 + 验收清单勾选 + 无新增 lint 回归。

## 手动验证（补充）

```sh
cd packages/extension && pnpm run build
cd examples/feature-examples && pnpm start
```
