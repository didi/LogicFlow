# Group 架构开放问题清单

**日期：** 2026-07-05  
**状态：** 待设计，本次不修复  
**来源：** `fix/dynamic_group_bugs` code review + 架构讨论  
**关联文档：**
- [code review](../superpowers/reviews/2026-07-05-fix-dynamic-group-bugs-code-review.md)
- [layout 分组感知设计](../superpowers/specs/2026-06-23-layout-group-aware-design.md)
- [动态分组成员语义设计](../superpowers/specs/2026-06-24-dynamic-group-membership-semantics-design.md)

---

## 说明

以下问题在当前实现中已观察到或已被推断，但涉及跨包架构决策，不适合在单次 bugfix PR 中解决。记录在此作为后续设计迭代的起点。每条问题附有当前状态描述和建议的设计方向，供下一个专项设计 spec 参考。

---

## Q1. Group 是否应成为 core 的一等公民

**当前状态**

`@logicflow/core` 的 `BaseNodeModel` 没有 `isGroup` / `children` 的任何类型声明。group 契约（`isGroup: true` + `children: Set<string>`）完全由 `@logicflow/extension` 的 `DynamicGroupNodeModel`、旧版 `GroupNodeModel`、`LaneModel`/`PoolModel` 各自声明，相互平行但没有共同基类。

`@logicflow/layout` 需要感知 group 才能完成分组感知布局，但它不能 import extension，于是用裸字段断言（鸭子类型）绕过了类型系统：

```ts
// packages/layout/src/utils/groupLayout.ts
export function isGroupModel(model: BaseNodeModel) {
  return !!(model as BaseNodeModel & { isGroup?: boolean }).isGroup
}
```

这是一个**隐性的跨层耦合**：layout 的正确性依赖 extension 在运行时把特定字段挂到 model 上，但这个约定没有类型保障、没有文档边界。

**影响范围**

- 任何新的 group 实现（自定义 group、未来 core 内置 group）若不知道这个约定，layout 会静默忽略它
- layout 测试必须引入 extension 插件才能运行集成用例，增加了测试耦合
- Pool/Lane/DynamicGroup 三条 group 实现线并行演进，容易产生语义漂移

**建议方向**

在 `@logicflow/core` 的 `BaseNodeModel` 中显式声明 group 相关的可选接口（`isGroup`、`children`），或提供一个 `GroupNodeModel` 抽象基类及对应的类型守卫 `isGroupModel`。extension 的各 group 实现改为 extends/implements core 的接口，layout 直接 import core 提供的守卫，消除隐性契约。

---

## Q2. Group 的图层（z-index / 渲染层序）问题

**当前状态**

group 节点与普通节点同处一个渲染层，z-index 由节点注册顺序决定。子节点在视觉上需要盖在 group 框之上，但当前没有系统性的图层保障机制——依赖节点追加顺序的副作用，折叠/展开、撤销重做、批量导入等操作都可能打乱这个顺序。

**影响范围**

- 子节点可能被 group 框遮挡，点击穿透到 group 而非子节点
- 嵌套 group 场景下内层 group 可能被外层 group 遮挡
- 折叠动画期间图层顺序短暂混乱

**建议方向**

明确 group 节点的渲染层策略：是在 core 层保证（如 group 节点始终渲染在子节点之下），还是由各 group 插件自行管理。如果由 core 保证，需要在 `GraphModel` 的节点排序逻辑中感知 group——这与 Q1 联动，core 需要先知道"什么是 group"。

---

## Q3. Layout 时 group 折叠和展开的不同处理方式

**当前状态**

`applyGroupResizeAndWarnings` 在 `computeBounds` 时读取子节点的当前尺寸，但没有区分子 group 当前是折叠态还是展开态。折叠态 group 的尺寸是折叠后的小尺寸（通常是标题栏高度），展开态是完整尺寸；父 group 如果以折叠态子 group 的尺寸计算边界，展开后子 group 溢出。

同样，布局引擎（dagre/elk）在分配子节点位置时，如果子 group 是折叠态，它的逻辑尺寸与视觉尺寸不符，可能导致布局结果与视觉呈现不一致。

**影响范围**

- 含折叠子 group 的图执行 layout 后，展开子 group 时出现溢出
- 折叠态下 layout 的节点间距计算不准确
- 折叠/展开切换后需要重新 layout 才能恢复正确的几何关系

**建议方向**

明确 layout 的语义约定：layout 应该以展开态尺寸还是折叠态尺寸作为布局基准？可选方向：
1. layout 强制展开所有 group 后执行，写回后恢复折叠状态
2. layout 读取展开态的逻辑尺寸（而非当前视觉尺寸）进行计算
3. 折叠态 group 作为叶节点参与父级布局，不展开其内部

---

## Q4. Layout resize 两阶段执行的时序问题

**当前状态**

`applyGroupResizeAndWarnings` 在 `scopes.forEach` 内部的每个 scope 执行结束后立即被调用，而不是等所有 scope 的位置计算完成后统一执行。同时 `sortGroupsByDepthDesc` 当前按深度**降序**（外层先、内层后）处理，导致外层 group 依据内层 group resize 前的旧尺寸计算边界。

这是 code review C2 的直接根因，但即便修正排序方向为升序，分散在 scope 循环内调用的架构仍有隐患：如果某个 scope 的布局结果影响另一个 scope 的节点坐标（跨 scope 共享节点），resize 的顺序仍不可靠。

**建议方向**

将 resize 逻辑拆成独立的第二 pass：所有 scope 的布局计算完成后，统一按 depth 升序做一次 resize propagation。两个 pass 职责分离：第一 pass 只算位置，第二 pass 只做 group 尺寸适配。

> **注意**：C2 中的排序方向（升序 vs 降序）是独立的算法 bug，与架构升级无关，届时需要单独标记修复。

---

## Q5. Group 序列化契约不一致

**当前状态**

`children` 字段在不同上下文中类型不同：

| 上下文 | 类型 | 来源 |
|---|---|---|
| 运行时 model（`DynamicGroupNodeModel`） | `Set<string>` | 由 `initNodeData` / `addChild` 维护 |
| `getGraphData()` 序列化输出 | `string[]` | `getData()` 转换 |
| layout 读取 | `Set<string>`（运行时） | `getGroupChildren` 调用 `Array.from` |

layout 依赖运行时的 `Set`，但这个依赖没有任何类型约束。如果调用方在 layout 前后做了 `getGraphData` / `renderRawData` 的完整序列化往返，`children` 会变成 `string[]` 而非 `Set`，layout 会因为 `Array.from(string[])` 降格为单字符数组而出错（虽然实际场景中不太会这样调用）。

**建议方向**

在 core 的 group 接口（Q1 的产出）中明确 `children` 在 model 层的正式类型，并在 `getGroupChildren` 中做防御性处理（兼容 `string[]` 和 `Set<string>`）。

---

## Q6. `calcDepth` 无环检测

**当前状态**

`sortGroupsByDepthDesc` 中的 `calcDepth` 使用 memoization 避免重复计算，但没有环检测。如果 `nodeGroupMap` 或 `children` 因 bug 出现了循环引用（A 的 children 包含 B，B 的 children 包含 A），`calcDepth` 会无限递归，导致调用栈溢出。

**建议方向**

加入 `visiting: Set<string>` 追踪当前递归路径，检测到环时 warn 并提前返回 0，而不是崩溃。

---

## Q7. Pool/Lane 与 DynamicGroup 的 activeGroup 语义分叉

**当前状态**

`DynamicGroup` 已将高亮逻辑从单引用 `activeGroup?: LaneModel` 重构为 `activeGroups: Set` + diff 更新，用于支持多选拖拽时节点悬停多个 group 的高亮去重。`PoolElements`（`packages/extension/src/pool/index.ts`）仍使用旧的单引用模式，两者实现了相同的拖拽高亮行为，但底层语义不一致。

多选拖拽节点到跨越多个 Lane 时，Pool 侧会出现与 DynamicGroup 修复前相同的高亮错乱问题。

**建议方向**

将 `activeGroups: Set` + `getTargetGroupForNode` + diff 更新模式提炼为共享逻辑（util 函数或基类方法），Pool/DynamicGroup 统一使用，消除实现分叉。此项与 Q1 联动：如果 group 升格为 core 一等公民，这部分逻辑可以考虑放在 core 的 group 基类中。

---

## 优先级建议

| 问题 | 影响面 | 建议时机 |
|---|---|---|
| Q1（core 一等公民） | 架构级，其他问题的基础 | 下一个专项设计迭代 |
| Q2（图层） | 用户可见，影响可用性 | Q1 之后，需要 core 感知 group |
| Q3（折叠/展开 layout 语义） | 功能级，影响 layout 准确性 | layout 专项迭代 |
| Q4（resize 两阶段） | 功能级，Q3 设计时一并处理 | layout 专项迭代，届时修复 C2 排序方向 |
| Q5（序列化契约） | 防御性，当前不易触发 | Q1 时一并梳理 |
| Q6（环检测） | 防御性，崩溃风险 | 低成本，可随手修复 |
| Q7（Pool/Lane 分叉） | 功能级，影响 Pool 多选场景 | 可单独 PR，不依赖 Q1 |
