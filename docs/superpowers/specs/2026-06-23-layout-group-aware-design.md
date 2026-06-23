# 自动布局分组感知设计说明

**日期：** 2026-06-23  
**状态：** 已实现并修复（#2205、#2332）  
**关联 Issue：** #2205（Dagre 格式化后子节点逃出分组，**已修复**）、#2332（ELK 未适配分组，**已修复**）  
**关联文档：** [packages/layout/ARCHITECTURE.md](../../../packages/layout/ARCHITECTURE.md)、[layout API](../../../sites/docs/docs/api/extension/layout.zh.md)、[dynamic-group 修复设计](./2026-05-18-dynamic-group-fix-design.md)（批次 4 引用本设计，本文档独立描述 layout 侧方案）

---

## 1. 背景与问题

### 1.1 现象

在启用 `DynamicGroup` 的图中执行 Dagre 或 ELK 自动布局后：

- 组内节点（`children` 成员）被摆到**全局绝对坐标**，视觉上跑出组框；
- `children` / `nodeGroupMap` 等**成员关系多数仍在**，主要是几何与视觉不一致；
- 展开 / 折叠切换后问题更明显。

回归场景：`examples/dynamic-group-regression` → `layout-format-escape`（#2205 / #2332）。

### 1.2 根因

```text
布局引擎（Dagre / ELK）
  → 将分组与子节点当作平级节点参与 flat 布局
  → 各自得到独立的全局 (x, y)

写回层
  → renderRawData 全量重绘，直接覆盖节点坐标
  → 子节点坐标与组框 width/height 脱钩
```

`@logicflow/layout` 原先**没有「复合节点 / 分层 scope」**概念，也未在布局后做组框与成员的边界对齐或尺寸后处理。

---

## 2. 目标

| 项 | 说明 |
| --- | --- |
| 修复 #2205 / #2332 | 布局后组内节点保持在组框内（或明确告警），成员关系不被破坏 |
| 统一 Dagre / ELK 语义 | 共用 `groupLayout.ts` pipeline，两引擎仅在「如何算坐标」上不同 |
| 组内布局 API | 支持 `groupId` 仅布局指定分组内部，组外节点不动 |
| 可选组尺寸调整 | `resizeGroup` 控制布局后是否改组框尺寸，默认保守 |
| 嵌套分组 | 全图布局时自底向上处理各层 scope；resize 自底向上 |
| 泳道 / Pool | 默认不 resize；不破坏 lane/pool 既有 resize 耦合 |
| 可验证 | 单元测试 + 回归示例 + 文档 |

## 3. 非目标

| 项 | 说明 |
| --- | --- |
| 维护 `children` / `nodeGroupMap` | 仍由 `DynamicGroup`、`PoolElements`、旧 `Group` 负责 |
| 复用 DynamicGroup `autoResize` 事件链 | layout 内独立 bbox 计算，避免与拖拽 resize 逻辑纠缠 |
| `fit` 越界策略字段 | 不做 `shrink` / `allow-overflow` 等 overflow 策略枚举 |
| `scope: 'outer-only'` | 一期不支持「仅布局组外」 |
| 选中 group 时子节点 UI 联动 | 属 editor 交互 backlog，不在本 spec 范围 |
| BPMN subProcess 多层 adapter | 与 #2180 相关，defer |
| ELK compound/nesting 作为对外行为差异 | nesting 仅作实现细节，对外行为与 Dagre 一致 |

---

## 4. 方案对比

### 方案 A（推荐）：共享 pipeline + 分层 scope

```text
groupLayout.ts（共享）
  resolveLayoutScopes → 按 scope 跑引擎 → 坐标合并 / 对齐 → applyGroupResizeAndWarnings → renderRawData

Dagre / ELK（引擎层）
  每个 scope 独立调用 dagre / elkjs
```

**优点：** 行为一致、测试一套、跨组边投影规则统一、与 DynamicGroup 解耦。  
**缺点：** 全图多 scope 时可能多跑几次引擎（可接受）。

### 方案 B：ELK 原生 nesting，Dagre 两阶段

ELK 用 compound graph；Dagre 手动 Phase 1/2。

**优点：** ELK 单次调用可能更快。  
**缺点：** 两套行为、跨组边与 resize 后处理易分叉，#2205/#2332 需双倍验收。

### 方案 C：layout 前展平为虚拟复合节点

布局时把每个 group 替换为一个大方块节点，布局后再展开。

**优点：** 改动面小。  
**缺点：** 组内相对坐标与跨组边处理复杂，nested group 难维护。

**决策：采用方案 A。**

---

## 5. 对外 API

### 5.1 新增字段（Dagre / ElkLayout 共用）

类型定义位于 `packages/layout/src/utils/groupLayout.ts`：

```typescript
export type ResizeGroupMode = false | 'grow-only' | 'fit'

export interface GroupLayoutOption {
  /** 不传：全图分层布局；传：仅布局该 group 的 direct children */
  groupId?: string
  /**
   * 布局后分组尺寸策略，默认 false。
   * false：不调整；grow-only：只扩不缩；fit：按子节点包围盒贴合（可扩可缩）。
   */
  resizeGroup?: ResizeGroupMode
  /** 计算组框包围盒时的内边距，默认 40；用于越界检测与尺寸调整 */
  groupPadding?: number
}
```

`DagreOption extends GraphLabel, GroupLayoutOption`  
`ElkLayoutOption extends GroupLayoutOption`

**已有字段**（`rankdir`、`nodesep`、`ranksep`、`isDefaultAnchor`、`elkOption` 等）语义不变。

**明确不做：** `fit: 'shrink' | 'allow-overflow'` 类 overflow 策略字段。

### 5.2 布局范围语义

| 调用方式 | 行为 |
| --- | --- |
| 不传 `groupId` | **全图分层布局**：各 group 的 direct children 各自 scope 内布局（最深 group 优先），最后 layout 顶层节点；跨层边投影到 scope 内可见端点 |
| 传 `groupId` | **仅组内布局**：只 layout 该 group 的 direct children 与组内边；组中心、组外节点不动；结果对齐到组中心 |

不做 `scope` 三态枚举；「仅组外」一期不支持。

### 5.3 `resizeGroup` 与 `resizable`

| `resizeGroup` | 行为 |
| --- | --- |
| `false`（**默认**） | 不改 group `width`/`height`；布局后检测越界并 `console.warn` |
| `'grow-only'` | 仅扩大组框以包住子节点 + `groupPadding` |
| `'fit'` | 按子节点包围盒 + `groupPadding` 贴合，可扩可缩 |

**覆盖规则：** 当 `resizeGroup` 为 truthy（`'grow-only'` | `'fit'`）时，**覆盖** `group.resizable === false`，仍调整尺寸，并额外 warn。

**不复用** DynamicGroup 的 `autoResize`：layout 自行计算 bbox，写入 `width`/`height` 及 `properties.width/height`。

---

## 6. 布局 Pipeline

```text
layout(options)
  │
  ├─ resolveLayoutScopes(allNodes, allEdges, options.groupId)
  │     groupId 有值 → 单 scope（该 group 的 children）
  │     groupId 无值 → 多 scope：
  │         1. 各 group（按深度降序，最深先 layout）
  │         2. 顶层节点（无 parent 的节点；跨组边投影到 scope 端点）
  │
  ├─ 对每个 scope 调用引擎（Dagre / ELK）
  │     group scope：layout 完成后 alignScopedLayoutToGroup（对齐到组中心）
  │     外层 scope 移动 group 时：moveGroupDescendantsBy（子树整体平移）
  │
  ├─ applyGroupResizeAndWarnings(allModels, allNodeData, options)
  │     按深度降序处理各 group；内层 resize 后外层重新评估
  │
  ├─ processEdges（重算折线路径）
  │
  └─ renderRawData
```

### 6.1 Group 识别

- `model.isGroup === true` → 视为 group（DynamicGroup、Lane、Pool、legacy Group）
- 子成员来自 `model.children`（`Set<string>`）
- **不 import** `@logicflow/extension`，对 core model duck typing

### 6.2 跨组边投影

scope 内若边的端点不在当前 scope，沿 parent 链向上找到 scope 内最近可见节点作为投影端点；两端投影后相同则丢弃该边（避免自环）。

### 6.3 嵌套 group

- **全图 layout：** 最深 group 先 layout 其 direct children；group 作为节点参与外层 scope；外层移动 group 时整棵子树平移
- **resize：** `applyGroupResizeAndWarnings` 自底向上；内层扩大后外层在同一 pass 内可跟随扩大（当 `resizeGroup` 启用时）

### 6.4 Pool / Lane

- Lane、Pool 继承 DynamicGroup，`isGroup === true`，参与上述 pipeline
- **默认 `resizeGroup: false`**：不改变 lane/pool 几何，仅越界 warn
- **不实现** pool↔lane 标题区、lane 间耦合 resize（属 extension pool 域）
- 变更 group 几何时须回归 `group-layout.test.ts` 泳道用例及 `packages/extension/__test__/pool`

---

## 7. 告警语义

一次 `layout()` 调用内，**同一 group 同类 warn 最多一次**。文案保持简短：

| 条件 | 消息（示意） |
| --- | --- |
| 子节点超出组框 | `[LogicFlow Layout] 节点超出group边界: <groupId>` |
| 实际修改了 group 尺寸 | `[LogicFlow Layout] 调整了group尺寸: <groupId>` |
| `resizeGroup` truthy 且 `group.resizable === false` | `[LogicFlow Layout] resizeGroup 覆盖了 group.resizable=false: <groupId>` |

不打印节点列表、像素细节。

---

## 8. 与 DynamicGroup 修复设计的关系

[2026-05-18-dynamic-group-fix-design.md](./2026-05-18-dynamic-group-fix-design.md) 批次 4 将 #2205/#2332 列为「layout / 格式化适配分组」。**本文档是 layout 包的独立设计说明**，不修改 dynamic-group 修复 spec 正文。

DynamicGroup 侧负责：成员关系、折叠虚拟边、restrict/autoResize 拖拽行为。  
Layout 侧负责：布局 scope、坐标写回、可选 resize、越界检测。

---

## 9. 验证策略

### 9.1 单元测试

`packages/layout/__test__/group-layout.test.ts`：

| 用例 | 覆盖点 |
| --- | --- |
| `resizeGroup=false` + 越界 | 不改尺寸 + overflow warn |
| 全图分层布局 containment | 嵌套分组 + 跨层级边投影后子节点仍在组内 |
| 全图多 scope warn 去重 | 同一 group 同类 warn 一次 |
| `resizeGroup='grow-only'` + `resizable=false` | 强制扩大 + override warn |
| `resizeGroup='fit'` | 可缩小组框 + 尺寸变化 warn |
| 嵌套 group | 内外层 resize /  containment |
| Pool + Lane | 默认不 resize |

```sh
pnpm test -- packages/layout/__test__/group-layout.test.ts
```

### 9.2 手动回归

`examples/dynamic-group-regression` → `layout-format-escape`：

- 组内 A/B/C + 组外起/中/终 + 跨组边
- 控件：`LayoutFormatEscapeControls`（引擎 Dagre/ELK、全图/组内、resizeGroup、padding、resizable、组宽高）
- 步骤：应用配置 → 执行布局 → 目视 containment → 「打印归属」核对 children

### 9.3 文档

| 路径 | 内容 |
| --- | --- |
| `sites/docs/docs/tutorial/extension/layout.*.md` | 使用教程 |
| `sites/docs/docs/api/extension/layout.*.md` | API 参考 |
| `packages/layout/ARCHITECTURE.md` | 包内架构 |
| `packages/layout/README.md` | 快速入口 |

---

## 10. 实现状态（截至 2026-06-23）

| 模块 | 状态 |
| --- | --- |
| `groupLayout.ts` — scope / align / resize / warn | ✅ 已实现 |
| `resolveLayoutScopes` 全图分层 | ✅ 已实现 |
| Dagre / ELK 接入 | ✅ 已实现 |
| `GroupLayoutOption` 导出 | ✅ 已实现 |
| 单元测试 | ✅ 8 用例通过 |
| 文档站 + ARCHITECTURE | ✅ 已更新 |
| 回归示例控件面板 | ✅ 已实现 |
| tsconfig 排除 `__test__`（dev watch） | ✅ 已修复 |

---

## 11. 后续可选工作（非本期）

| 项 | 说明 |
| --- | --- |
| 选中 group 的 drill-down / 父虚线框 | 参考 Figma / draw.io；属 `packages/core` 交互 |
| ELK 单次 compound 调用 | 性能优化，须保证与 Dagre 行为一致 |
| `outerOnly` 布局 | 若有真实需求再加 |
| CHANGELOG /  minor 发版说明 | 发版前补充 |

---

## 12. 已确认决策摘要

| 项 | 决策 |
| --- | --- |
| 引擎策略 | Dagre / ELK 共用 `groupLayout.ts` pipeline |
| 布局范围 | 可选 `groupId`；无 `scope` 枚举 |
| 新增 API | `groupId`、`resizeGroup`、`groupPadding` |
| 无 `fit` overflow 字段 | 越界仅 warn，不做 shrink 策略 |
| `resizeGroup` 默认 | `false` |
| `resizeGroup` 类型 | `false \| 'grow-only' \| 'fit'` |
| truthy `resizeGroup` | 覆盖 `resizable=false` 并 warn |
| resize 实现 | layout 独立 bbox，不复用 autoResize 链 |
| 嵌套 | scope 与 resize 均自底向上 |
| Pool/Lane | 默认不 resize；专项测试 |

---

## 13. 审阅清单

- [x] API 默认值与文档一致（`resizeGroup: false`）
- [x] 全图布局时子节点不再参与 flat 顶层布局
- [x] 组内布局不改变组外节点
- [x] 告警文案与去重符合第 7 节
- [x] 泳道场景无意外 resize
- [x] 回归示例可覆盖 Dagre #2205 与 ELK #2332
