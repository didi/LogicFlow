# Pool / Lane 泳道图行为规范设计

**日期**：2026-07-29  
**作者**：brainstorming session  
**状态**：交互范围已二次确认，待实现  
**关联**：[packages/extension/ARCHITECTURE.md](../../../packages/extension/ARCHITECTURE.md)（Grouping 节）、[SelectionSelect 与 PoolElements 框选冲突修复设计](./2026-07-29-selection-pool-conflict-design.md)

> 后续修订：2026-08-10 的交互细节设计放开了“复制 Lane 到空白位置自动创建 Pool”的路径；本文中“粘贴不能到空白”的描述只代表第一轮设计约束。

---

## 背景

LogicFlow 当前在 `packages/extension/src/pool` 中提供 `PoolElements` 泳道图插件。它复用 `DynamicGroupNodeModel` 的容器能力，实现 `pool` 和 `lane` 两类节点。

前一次修复 #2418 时，我们已经确认 `PoolElements` 与 `DynamicGroup` 都会挂载到 `graphModel.dynamicGroup`，但两者暴露的 API 与语义并不完全一致。现在需要把泳道图自身的交互边界重新确认清楚，再决定后续实现中哪些能力沿用 DynamicGroup 的成熟语义，哪些能力必须进入 Pool 专属交互模型。

本次二次确认按五个维度展开：

1. 移动：pool、lane、普通节点分别如何移动，lane 如何排序和跨 pool 迁移。
2. 新增 / 删除：如何新增 lane，删除 lane/pool 时是否处理子节点，以及 lane 数量限制。
3. Resize：哪些对象允许 resize，pool 尺寸如何由 lane 反向决定。
4. 折叠：pool/lane 是否可折叠，折叠后尺寸、子节点和虚拟边如何处理。
5. 框选：框选后的移动、复制、删除如何处理父子关系。

本文档只定义目标行为、兼容性约束和验证清单。实现和修复不在本文档中完成。

## 总体原则

这次是体验升级，不是数据模型重做。PoolElements 仍然是一套固定的三层容器模型：

```text
pool
  └─ lane
       └─ flow node
```

- `pool`：外层容器，表达一个参与者、组织、系统、流程边界或责任范围。
- `lane`：`pool` 内的分区，表达角色、部门、阶段或子责任域。
- `flow node`：业务流程节点，例如任务、事件、网关、普通自定义节点。
- `edge`：业务节点之间的连线。跨同一 `pool` 内不同 `lane` 的连线应被允许。BPMN 场景中，跨 `pool` 的交互应区分 sequence flow 与 message flow。

结构化数据是最终可信来源，坐标只用于 hover、drop 命中和插入位置判断：

| 关系 | 数据位置 | 语义 |
| --- | --- | --- |
| `pool -> lane` | `pool.children` | 泳池直接包含的泳道，并表达 lane 顺序 |
| `lane -> node` | `lane.children` | 泳道直接包含的业务节点 |
| `lane -> pool` | `lane.properties.parent` | 泳道所属泳池 |
| `node -> lane` | `node.properties.parent` | 业务节点所属泳道 |
| `child -> parent` 索引 | `PoolElements.nodeLaneMap` | 运行时反向索引，便于快速查直接父容器 |

`pool.children` 不应包含普通业务节点。`lane.children` 不应包含其他 `lane`。第一阶段明确不支持 `pool -> pool` 和 `lane -> lane` 嵌套，也不支持矩阵泳道。若 lane 内需要表达更复杂的内部流程，应使用 `dynamic-group` 或 `subProcess`，而不是继续扩展泳道层级。

## 兼容性约束

已有用户应能无缝升级到新的体验：

- 不改变现有 `type: 'pool' | 'lane'`。
- 不改变现有 `children`、`properties.children`、`properties.parent` 数据结构。
- 旧图数据无需迁移，旧数据渲染后应自动进入新交互模型。
- 已有 API 保留，例如 `getLaneByNodeId`、`getLaneByBounds`、`PoolModel.addChildAbove`、`addChildBelow`、`addChildLeft`、`addChildRight`、`deleteChild`。
- 新增能力只通过可选配置或 additive API 提供，不删除旧方法。
- TypeScript 类型只新增可选字段，不收窄旧字段。
- 默认行为尽量贴近当前已有用户预期，例如删除默认级联删除子节点。
- 导出数据仍保持旧结构。新交互只要求更稳定地同步 `children`、`properties.parent` 和 `nodeLaneMap`。
- 旧数据里的 `pool.properties.width/height` 仍可作为首次渲染和无 lane 场景的初始尺寸参考；一旦 pool 有 lane，展示尺寸由 lane 布局计算。

Pool 可以复用 DynamicGroup 的底层容器能力，也可以复用成熟配置命名，例如 `cascadeDeleteChildren`。但 PoolElements 应拥有自己的交互规则层，不能继续把 lane 当成普通 DynamicGroup 自由拖拽节点处理。PoolElements 也不依赖 DynamicGroup 插件实例，因为两者不能同时稳定占用 `graphModel.dynamicGroup`。

## 命中与归属

普通节点拖入泳道时，交互分为两个阶段：

1. **drag / hover 阶段**：通过坐标判断候选 `lane`，显示可放入或不可放入反馈。
2. **drop 阶段**：检查目标 `lane` 是否允许接收该节点。只有成功后才更新 `children`、`properties.parent` 和 `nodeLaneMap`。

节点视觉上覆盖在 `lane` 上，不等于已经属于该 `lane`。这点对导入数据、复制粘贴、撤销重做和协同编辑都很重要。

命中规则应只把 `lane` 当作普通节点的可归属目标。`pool` 是 `lane` 的父容器，不应被普通业务节点直接命中为所属泳道。其他 `dynamic-group` 也不应被 `PoolElements` 当作 `lane`。

## 创建与新增

### 创建 Pool

创建一个空 `pool` 后，应至少存在一个默认 `lane`，让用户可以立即放置业务节点。

默认 `lane` 的创建不应依赖视图挂载时机。理想情况下，`lf.render()` 后立即读取 `getGraphData()` 时，数据中也应体现一致的 `pool -> lane` 关系。

### 新增 Lane

选中 `lane` 后，可以在其前后新增同方向 `lane`：

- 横向 pool：新增上方或下方 lane。
- 纵向 pool：新增左侧或右侧 lane。

新增后，`pool.children`、lane 顺序、位置、尺寸和导出数据应一致。新增 `lane` 默认继承参考 lane 的方向、交叉轴尺寸和必要样式配置，但不复制参考 lane 内的业务节点。只有用户执行复制 lane 时，才复制 lane 内业务节点和内部边。

## 删除与数量限制

删除 lane/pool 默认沿用当前 Pool 和 DynamicGroup 的已有语义：级联删除子节点。PoolElements 新增或透出同名配置：

```ts
type PoolElementsOptions = {
  cascadeDeleteChildren?: boolean
  minLaneCount?: number
}
```

- `cascadeDeleteChildren` 默认 `true`。删除 lane 时一并删除 lane 内业务节点，相关边进入 core 删除节点的标准清理流程。删除 pool 时一并删除内部 lane 和业务节点。
- `cascadeDeleteChildren: false` 时，只删除 lane/pool 容器，保留子节点在画布绝对位置，并清理 `children`、`properties.parent` 和 `nodeLaneMap`。
- 删除折叠 lane/pool 时，先恢复真实节点和真实边关系，再按 `cascadeDeleteChildren` 删除或释放子元素，避免虚拟边残留，也避免展开后边复活。
- `cascadeDeleteChildren: false` 删除折叠 lane 时，释放的子节点及其对外真实边必须保留，不能因删除虚拟边而被连带删除。
- 无论删除入口来自图标、快捷键、菜单还是 API，lane 从 pool 移除后都必须通过统一布局入口更新 pool 尺寸和剩余 lane 位置。

Lane 数量限制由插件级默认值和 pool 级覆盖共同决定：

```ts
type PoolProperties = {
  minLaneCount?: number
}
```

- `minLaneCount` 默认 `1`。
- `pool.properties.minLaneCount` 可以覆盖插件级默认值。
- 当某个 pool 当前 lane 数量 `<= minLaneCount` 时，不允许删除 lane。
- 将 lane 拖出原 pool 也会减少原 pool 的 lane 数，因此同样受 `minLaneCount` 约束。
- UI 删除按钮应禁用或隐藏；快捷键、菜单、API 删除也必须被规则拦截，不能只靠图标隐藏。
- 批量删除多个 lane 时，应先按 pool 分组计算删除后是否违反 `minLaneCount`。若任一 pool 违反限制，建议整体拒绝本次删除，避免用户误以为选区删除完全成功但只有一部分生效。

`cascadeDeleteChildren: false` 只表示删除容器时释放子节点，不表示自动把子节点迁移到相邻 lane。自动迁移属于后续能力，本阶段不要求支持。

## 移动

### Pool 移动

移动 `pool` 时，`pool` 内所有 `lane` 以及这些 `lane` 的业务节点应一起移动。业务节点与所属 lane 的相对位置保持不变。视觉上覆盖在 pool/lane 上但未建立归属的节点不应跟随。

移动过程中，边端点应保持正确位置。若 core 的节点移动已经处理边端点，PoolElements 不应重复移动边。

### Lane 在所属 Pool 内移动

Lane 可以被拖动，拖动中允许显示中间态，符合 LogicFlow “即拖即看”的体验。但 drop 后不保留任意坐标，而是按所属 pool 的排列轴计算最终顺序：

- 横向 pool：按鼠标 y 坐标命中目标 lane 槽位；向下进入目标槽位时插到其后，向上进入时插到其前。
- 纵向 pool：按鼠标 x 坐标命中目标 lane 槽位；向右进入目标槽位时插到其后，向左进入时插到其前。
- 拖拽过程中 lane 跟随鼠标并置顶，其他 lane 在固定槽位中为候选位置腾挪；移动采用短动画。
- 泳道直接拖拽或被选中置顶时，泳道背景、其直接业务节点及这些节点关联的边视为同一视觉整体：泳道背景在最下层，关联边在中间层，业务节点在最上层。关联边指起点或终点属于该泳道直接业务节点的边，包括内部边和跨 lane / 跨 pool 的边。
- 拖拽结束或取消后，恢复拖拽开始前泳道、业务节点和关联边的层级；选中触发的置顶沿用现有分组语义，在取消选中后不立即重置。
- 当前候选位置显示插入指示线：横向 pool 为横线，纵向 pool 为竖线。指示线和预览顺序均为运行时状态，不写入导出数据。
- drop 后更新 `pool.children` 顺序，再统一重排所有 lanes。
- 最终状态不允许 lane 重叠。
- 如果 drop 后顺序未变化，不应产生无意义 history、事件或坐标抖动。
- Lane 直接拖拽期间不执行普通节点归属迁移逻辑。
- Pool 带动 lane 或 PoolModel 统一布局时，lane 仍然可以被内部程序移动。

重排完成后，lane 内已归属的业务节点随 lane 位移一起移动，并保持相对 lane 的位置不变。

每次 lane 重排或跨 pool 迁移完成后，所有关联边的标题位置必须基于最终边路径统一计算，不能沿用各 lane 依次移动期间产生的中间标题坐标。该规则同时适用于同 pool 排序、迁入其他 pool 和迁回原 pool。

### Lane 跨 Pool 移动

Lane 允许拖出原 pool，但只能放入另一个 pool：

- 拖到空白、普通节点、dynamic-group 或其他非 pool 目标时，显示禁止鼠标样式，不建立新归属。
- 在非 pool 目标松开时，lane 保持原有 `pool.children` 顺序和归属，并以短动画回到原泳池固定槽位；归位过程不产生顺序变更、history 记录或导出数据变化。
- 拖拽指针离开合法目标后，必须立即清空上一次候选 pool 与插入位置，避免 drop 误用过期候选结果。
- 无效放置归位时，lane、直接业务节点及关联边的标题坐标必须恢复到拖拽开始前的状态，不能只恢复节点和边的几何位置。
- 拖入另一个 pool 时，目标 pool 显示虚线可放入提示，鼠标样式切换为允许拖入。
- 合法目标的插入位置按目标 pool 排列轴计算：横向 pool 按 y 坐标，纵向 pool 按 x 坐标。
- 目标 pool 为空时，迁入 lane 成为第一条 lane。
- Drop 到目标 pool 后，从旧 pool 的 `children` 移除该 lane，插入新 pool 的 `children`，更新 lane 的 `properties.parent` 和 `nodeLaneMap`。
- Lane 内业务节点跟随 lane 一起迁移，保持相对位置。业务节点仍归属于该 lane，不直接归属于目标 pool。
- Lane 内部边正常跟随节点；跨 lane / 跨 pool 的边不因迁移被删除，除非业务校验另有规则。
- 如果迁出会让旧 pool 的 lane 数低于 `minLaneCount`，本次迁移应被拒绝或回退。仅当旧 pool 的 `minLaneCount` 为 `0` 且迁移后没有 lane 时，自动删除该空 pool。

### 普通节点移动

普通节点拖入 `lane` 并通过校验后，应成为该 `lane` 的子节点。

普通节点从一个 `lane` 拖到另一个 `lane` 时，应先确认目标可接收，再完成归属迁移。若目标拒绝接收，应保留原归属，不能出现节点被原 `lane` 移除但没有新父容器的状态。

普通节点拖到空白区域时，是否移出原 `lane` 需要保持一致策略：

- 若原 `lane.isRestrict === true`，不允许拖出。
- 若允许拖出，则 drop 到空白后清除 `parent` 并从原 `lane.children` 移除。

普通节点拖到 `pool` 标题区或 `pool` 内容区但未命中具体 `lane` 时，不应归属到 `pool`。

## Resize

Pool 本体不允许 resize。Pool 的尺寸完全由内部 lane 的 resize 和布局结果决定，避免 pool 被直接拉伸后 lane 内容区出现空白、溢出或尺寸不一致。

- `pool.resizable = false`。
- UI 上不显示 pool 的 resize 控制点。
- API 层如果直接尝试 resize pool，应被规则拒绝或转成无效操作。
- Pool 的宽高由 lane 统一布局计算得出。
- 移动 pool 不影响该规则，pool 仍可以整体移动。

Lane 允许 resize，但 resize 后必须由所属 pool 统一重排。Resize 默认只改变容器边界，不缩放内部业务节点。

横向 pool 中，lanes 上下排列：

- 调整某个 `lane.height` 时，只改变当前 lane 高度，其他 lanes 高度不变。
- `pool.height = sum(all lane.height)`。
- 调整某个 `lane.width` 时，同步所有 lanes 的内容宽度。
- `pool.width = laneContentWidth + pool.titleSize`。
- 交叉轴宽度在放大后仍可缩小；本次 resize 的目标宽度应覆盖旧的最大宽度。
- Lane 不能被缩到小于内部子节点包围盒。
- 折叠 lane 的排列轴尺寸固定为 lane 标题区高度。

纵向 pool 中，lanes 左右排列：

- 调整某个 `lane.width` 时，只改变当前 lane 宽度，其他 lanes 宽度不变。
- `pool.width = sum(all lane.width)`。
- 调整某个 `lane.height` 时，同步所有 lanes 的内容高度。
- `pool.height = laneContentHeight + pool.titleSize`。
- 交叉轴高度在放大后仍可缩小；本次 resize 的目标高度应覆盖旧的最大高度。
- Lane 不能被缩到小于内部子节点包围盒。
- 折叠 lane 的排列轴尺寸固定为 lane 标题区宽度。

旧数据里如果有 `pool.properties.width/height`，仍作为首次渲染和无 lane 场景的初始尺寸参考。一旦 pool 有 lane，最终展示尺寸由 lane 布局计算。导出时可以继续带 `width/height`，保持旧数据格式兼容，但语义上它们是布局结果而不是用户直接 resize pool 的来源。

## 折叠与虚拟边

Pool 和 lane 都支持折叠，并提供插件级开关和节点级覆盖：

```ts
type PoolElementsOptions = {
  collapse?: {
    pool?: boolean
    lane?: boolean
  }
}

type PoolLaneProperties = {
  collapsible?: boolean
}
```

- `collapse.pool`、`collapse.lane` 默认 `true`。
- `properties.collapsible: false` 可以禁用单个 pool/lane 的折叠。
- 不配置时旧数据默认可折叠，无需补字段。

折叠行为沿用 DynamicGroup 的真实边/虚拟边模型：

- 折叠 lane 时，保留 lane 标题区，隐藏内容区、lane 内业务节点和内部真实边。
- lane 标题区尺寸固定为 `40px`，横向 pool 使用其作为折叠 lane 高度，纵向 pool 使用其作为折叠 lane 宽度。
- 折叠 lane 后，连接到 lane 内部节点的外部边改为连接到 lane，并创建虚拟边。
- 虚拟边不显示真实边的业务标题；展开后恢复真实边及其原始标题。
- 横向 pool 中，折叠 lane 的高度变为 lane 标题区高度。
- 纵向 pool 中，折叠 lane 的宽度变为 lane 标题区宽度。
- 所属 pool 重新布局其他 lanes，内容区不出现重叠。
- 展开 lane 时恢复折叠前 lane 尺寸、业务节点、真实边和布局。
- 从折叠 lane 新增泳道时，新泳道默认展开，并使用参考泳道的展开宽高，不继承折叠尺寸或折叠状态。
- 折叠 pool 时，隐藏内部全部 lane、业务节点和内部真实边，只显示 compact pool 节点。
- 折叠 pool 后，外部连接改为连接到 pool，并创建虚拟边。
- 展开 pool 时恢复内部 lane 的折叠前状态；若某些 lane 在 pool 折叠前已经折叠，展开 pool 后仍保持这些 lane 的折叠态。
- 外层 pool 折叠时，不能重复为已经由内层 lane 折叠生成的关系创建重复虚拟边。
- 虚拟边和真实边之间必须建立双向映射，删除任意一方都要清理另一方，避免展开后边复活。

删除折叠 lane/pool 时，先恢复真实边和节点可见性，再按 `cascadeDeleteChildren` 删除或释放子元素。

## 选择与框选

选择行为应降低误操作：

- 点击业务节点，优先选中业务节点。
- 点击 `lane` 空白区域，选中 `lane`。
- 点击 `pool` 标题或空白区域，选中 `pool`。
- 框选只覆盖业务节点时，只选业务节点。
- 框选同时覆盖 `lane` 与其子节点时，保留 lane，过滤子节点。
- 框选同时覆盖 `pool`、`lane`、业务节点时，保留 pool，过滤下层元素。
- 框选覆盖多个同级 lanes 时，保留这些 lanes。
- 框选覆盖 pool 外普通节点和某个 pool 时，两者都保留，因为它们不是父子关系。
- 点击选中 lane 时，除选中态外还应提升 lane 及其直接业务节点、关联边的视觉层级，层级顺序与 lane 直接拖拽一致。

这个规则与 #2418 的修复保持一致：Pool 场景下要把 `getLaneByNodeId` 理解为“获取直接父容器”。

### 框选后移动

框选移动遵循“子节点跟随父节点走”：

- 只移动父子去重后的选中元素。
- Pool 被选中时，lane 和 lane 内业务节点跟随 pool。
- 单个或多个 lane 被选中时，lane 内业务节点和关联边跟随 lane；lane 不能自由移动到画布空白、普通节点或普通分组。
- 同一 pool 内移动多个 lanes 时，被选 lanes 作为一个连续块参与槽位排序，保持块内原顺序，只显示一个块级插入槽位。
- 框选拖拽开始时固定原 pool 的槽位边界和顺序；即使被选 lane 已随鼠标移动，命中和插入判断仍以固定槽位为准，避免预览位置反复跳变。
- 移动多个 lanes 到新 pool 时，作为连续块插入目标 pool，保持原顺序；子节点、内部边和跨 lane 边一同更新位置。
- 跨 pool 移动前按源 pool 整体校验 `minLaneCount`。任一源 pool 删除选中 lanes 后不满足限制时，整体拒绝并归位，不允许部分迁移。
- 普通节点被单独选中时，按普通节点拖入/拖出 lane 的规则处理归属。
- 避免同一个业务节点既跟随父容器移动，又作为独立节点再次移动。

### 框选后复制粘贴

复制使用父子去重后的入口，但复制的是完整容器结构：

- 复制 pool：复制 pool、内部 lanes、lane 内业务节点、选中范围内的内部边。
- 复制一个或多个 lane：复制 lane、lane 内业务节点、选中范围内的内部边；多个 lane 保持原顺序，作为连续块粘贴。
- 复制普通节点：只复制普通节点和选中范围内相关边。
- 副本必须生成新 id，并重建副本内部的 `children`、`properties.parent`、`nodeLaneMap`。
- 副本不能引用原图中的 parent/children id。

Lane 不能脱离 pool 存在，因此 lane 粘贴必须解析目标 pool：

- 只有当前选中 pool 时，才允许粘贴 lane；该选中 pool 是唯一合法目标。
- lane 副本作为连续块插入选中 pool 的末尾，默认展开。
- 未选中 pool 时，本次粘贴不创建任何 lane；不根据鼠标位置或原 lane 的 parent 回退推断目标。
- 插件可抛出 `lane:paste-not-allowed` 事件，事件数据带上被拒绝的 lane 数据和原因。
- LogicFlow 库本身不内置 toast 或弹窗；是否展示业务提示由使用方监听事件决定。
- 不允许创建游离 lane，也不允许通过粘贴把 lane 放到空白画布、普通节点或 dynamic-group 中。

复制 pool 不受 lane 粘贴限制，因为 pool 副本本身会带着内部 lanes。

### 框选后删除

删除使用父子去重后的入口：

- 删除 pool：删除该 pool，内部 lane/业务节点是否删除由 `cascadeDeleteChildren` 决定。
- 删除 lane：删除该 lane，内部业务节点是否删除由 `cascadeDeleteChildren` 决定。
- 删除普通节点：从所属 `lane.children` 和 `nodeLaneMap` 清理该节点。
- 删除多个 lanes 时，按 pool 分组计算是否违反 `minLaneCount`；若违反，建议整体拒绝本次删除。

## 连线

同一 `pool` 内跨 `lane` 连线应允许。

普通流程图场景可以允许跨 `pool` 连线。BPMN 场景需要更严格的语义校验：跨 `pool` 不应默认创建 sequence flow，应使用 message flow 或由 BPMN 插件规则处理。

## 第一阶段不支持

- Pool 嵌套 pool。
- Lane 嵌套 lane。
- Matrix / 矩阵泳道。
- Resize 时整体缩放内部业务节点。
- Lane 自动迁移子节点到相邻 lane。
- 游离 lane。
- PoolElements 与 DynamicGroup 在同一画布同时作为两个独立容器系统混用。

Lane 和 Pool 的折叠/展开属于第一阶段支持能力，但不应直接复用普通 DynamicGroup 的自由移动语义。若 lane 内需要更复杂的层级结构，第一阶段使用 `dynamic-group` 或 `subProcess` 表达。

## 代码设计草案

第一阶段应避免继续把 `lane` 当作普通 `DynamicGroup` 迁移。代码职责建议拆成三层：

- `PoolElements`：负责拖拽事件、候选目标、候选插入位置、非法目标事件、状态清理和配置默认值。
- `PoolModel`：负责 `pool.children` 顺序、lane 尺寸计算、统一布局、跨 pool 迁移和 `minLaneCount` 校验。
- `PoolView` / `LaneView`：负责渲染标题区、内容区、折叠态、插入槽位提示和拖入虚线反馈。

### PoolElements 交互态

拖拽排序和跨 pool 迁移使用短生命周期状态，不写入导出数据：

```ts
type LaneDragState = {
  laneId: string
  originPoolId: string
  targetPoolId?: string
  originIndex: number
  insertIndex: number
  mode: 'reorder' | 'move-to-pool'
}
```

拖拽开始时，根据 `lane.properties.parent` 固定原 pool。拖拽过程中可以根据鼠标位置寻找目标 pool，但只有 drop 到合法目标时才更新 `children` 和 `parent`。拖到非法目标时，显示禁止鼠标样式并清理候选插入态。

移动规则中应区分 `pool`、`lane`、普通业务节点：

```ts
if (model.type === 'pool') return true
if (model.type === 'lane') return true
```

Lane 本体允许拖动以保留中间态，但 drop 后必须通过 PoolModel 统一重排，不能保留任意拖拽坐标。

### PoolModel 统一布局

`PoolModel` 应收敛出一个主布局入口：

```ts
layoutLanesByOrder(options?: {
  reason?: 'init' | 'add' | 'delete' | 'reorder' | 'resize' | 'collapse' | 'move-to-pool'
  resizedLaneId?: string
  resizedAxis?: 'width' | 'height'
})
```

该方法只以 `pool.children` 作为最终顺序来源。坐标只用于交互阶段计算候选插入位置，不作为最终结构来源。

配套方法建议为：

```ts
getOrderedLanes()
getPoolContentRect()
getLaneInsertIndex(point)
reorderLane(laneId, insertIndex)
moveLaneToPool(laneId, targetPoolId, insertIndex)
moveLaneWithChildren(lane, nextX, nextY)
canRemoveLane(count = 1)
```

`layoutLanesByOrder()` 负责：

- 按 `pool.children` 顺序排列 lanes。
- 保留 pool 标题区。
- 让 pool 内容区被 lanes 完整填满。
- Resize 时只同步会导致内容区空白的交叉方向尺寸。
- 折叠 lane 时使用标题区尺寸参与排列。
- 移动 lane 内业务节点，保持其相对 lane 的位置。
- 同步 `pool.children`、lane `properties.parent` 和导出数据。

现有 `resizePool()`、`resizeChildren()`、`resizeChildrenWithNewLane()` 后续应逐步收敛到这个统一入口，避免新增、删除、排序、resize、折叠各自维护一套布局逻辑。

### 交互反馈

插入槽位和拖入虚线都是交互态，不参与 graph data。可以在 `PoolModel` 上保留不导出的 observable UI 状态，由 view 读取并渲染。

横向 pool 的插入槽位：

- x 从 `pool.left + pool.titleSize` 开始。
- width 为 `pool.width - pool.titleSize`。
- y 为候选 lane 边界。
- 不进入左侧 pool 标题区。

纵向 pool 的插入槽位：

- y 从 `pool.top + pool.titleSize` 开始。
- height 为 `pool.height - pool.titleSize`。
- x 为候选 lane 边界。
- 不进入顶部 pool 标题区。

目标 pool 的可放入反馈应复用普通节点拖进 group 时的虚线语义，让用户明确当前 lane 可以放入该 pool。非法目标使用鼠标禁止样式；是否额外展示业务提示由使用方监听事件决定。

## 后续 Demo 验证清单

下一步应在 `examples/vue3-app` 或最接近的泳道图验证页中提供可复现场景和状态观测。该页不承担修复逻辑，只提供人工发现问题的入口。

| 分类 | 验证项 | 预期 |
| --- | --- | --- |
| 初始化 | 创建横向 pool | 自动出现一个 lane，导出数据包含 `pool.children` |
| 初始化 | 创建纵向 pool | 自动出现一个 lane，lane 位于标题区之外 |
| 兼容 | 渲染旧 pool/lane 数据 | 无需迁移，`children`、`parent`、尺寸和索引一致 |
| 新增 lane | 横向新增上方/下方 lane | 视觉顺序、`pool.children`、导出数据一致 |
| 新增 lane | 纵向新增左侧/右侧 lane | 视觉顺序、`pool.children`、导出数据一致 |
| 删除 lane | 默认删除 lane | 级联删除内部节点和相关边 |
| 删除 lane | `cascadeDeleteChildren: false` | 删除 lane，保留内部节点并清理归属 |
| 删除 lane | 删除到 `minLaneCount` | 操作被拒绝 |
| 拖入 | 普通节点拖入 lane | lane 高亮，drop 后建立归属 |
| 拖出 | 节点从 lane 拖到空白 | 根据 restrict 策略留在 lane 或解除归属 |
| 拖入拒绝 | 节点从 lane 拖到拒绝接收的 lane | 原归属不丢失，触发 `lane:not-allowed` |
| 命中边界 | 节点拖到 pool 标题区 | 不归属到 pool |
| 移动 | 移动 pool | lane 和已归属业务节点一起移动 |
| 移动 | lane 在原 pool 内排序 | 中间态跟随，drop 后按轴向重排，不允许重叠 |
| 框选移动 | 多个 lane 在原 pool 内排序 | 被选 lanes 作为连续块排序，保持块内顺序，只显示一个插入槽位 |
| 移动 | lane 拖到其他 pool | 合法迁移，内部节点跟随，新旧 pool 关系一致 |
| 框选移动 | 多个 lane 拖到其他 pool | 被选 lanes 作为连续块迁移；任一源 pool 不满足数量限制时整体回退 |
| 框选复制 | 复制多个 lane 到选中 pool | 副本作为连续块插入目标 pool 末尾，默认展开 |
| 框选复制 | 未选中 pool 时粘贴 lane | 不创建游离 lane，也不根据鼠标或原 parent 推断目标 |
| 移动 | lane 拖到非法目标 | 鼠标禁止样式，不建立新归属 |
| 移动 | 迁出后违反 `minLaneCount` | 迁移被拒绝或回退 |
| resize | pool resize 控制点 | 不显示或不可操作 |
| resize | 横向 pool 调整 lane 高度 | 只改变当前 lane 高度，pool 高度变为所有 lane 高度总和 |
| resize | 横向 pool 调整 lane 宽度 | 同步所有 lane 宽度，pool 保留标题区后更新宽度 |
| resize | 纵向 pool 调整 lane 宽度 | 只改变当前 lane 宽度，pool 宽度变为所有 lane 宽度总和 |
| resize | 纵向 pool 调整 lane 高度 | 同步所有 lane 高度，pool 保留标题区后更新高度 |
| 折叠 | 折叠 lane | 只保留标题区，内部节点/边隐藏，pool 重新布局 |
| 折叠 | 展开 lane | 恢复真实节点、真实边和折叠前尺寸 |
| 折叠 | 折叠 pool | 只显示 compact pool，内部 lane/node/edge 隐藏 |
| 折叠 | pool 展开后 lane 状态 | 恢复 pool 折叠前的 lane 折叠状态 |
| 选择 | 点击 node / lane 空白 / pool 标题 | 选中对象符合优先级 |
| 框选 | 框选 node | 只选 node |
| 框选 | 框选 lane + node | 只选 lane |
| 框选 | 框选 pool + lane + node | 只选 pool |
| 框选移动 | 移动选中 pool/lane | 子节点跟随父节点，不重复移动 |
| 复制 | 复制完整 pool | 新旧 id 关系隔离，子节点和内部边指向副本 |
| 复制 | 复制 lane 到目标 pool | lane 与内部节点完整复制，副本归属于目标 pool |
| 复制 | lane 无目标 pool 粘贴 | 不创建游离 lane，可触发 `lane:paste-not-allowed` |
| 删除 | 框选删除 pool/lane | 按父子去重后的容器删除，并遵守 `cascadeDeleteChildren` |
| 删除 | 批量删除违反 `minLaneCount` | 整体拒绝 |
| 连线 | 同 pool 跨 lane 连线 | 连线保持有效 |
| 连线 | 跨 pool 连线 | 普通模式允许，BPMN 模式另行校验 |
| 重渲染 | 连续调用 `lf.render()` | `nodeLaneMap` 无旧映射残留 |
| 导出 | 任意操作后 `getGraphData()` | `children` 与 `properties.parent` 一致 |

验证页还应提供一个只读调试面板，展示：

- 当前选中元素。
- 所有 pool 的 `children`。
- 所有 lane 的 `children`。
- 所有 lane / node 的 `properties.parent`。
- `PoolElements.nodeLaneMap`。
- 最近的 `lane:not-allowed`、`lane:paste-not-allowed`、`node:add`、`node:drop`、`selection:selected` 等事件。

## 已知风险候选

以下内容来自只读代码调研，需要后续通过 demo 或测试确认：

1. `getLaneByBounds` 当前按 `isGroup` 命中，可能把 `pool` 或其他 group 当作 lane。
2. 已有 lane 成员拖到拒绝接收的目标时，当前逻辑可能先移出原 lane，再发现目标拒绝，导致归属丢失。
3. 默认 lane 在 `PoolView.componentDidMount` 创建，数据初始化依赖视图时机。
4. `PoolModel.addEventListeners()` 注册全局 resize 监听，未看到模型销毁时解绑。
5. `moveLane` 移动子节点后又手动移动边端点，需要确认是否与 core 行为重复。
6. Lane 当前 `toggleCollapse()` 明确禁用折叠，需要改为受配置控制。
7. Pool 当前 `resizable = false` 已接近目标，但仍需验证外部 resize API 是否会被规则拒绝。
8. Pool 当前 `addElements` 会复制 group-like 节点，需要补 lane 粘贴目标 pool 的约束，避免游离 lane。

这些候选问题不应直接进入修复。每一项都应先在验证页或自动化测试中复现，再设计最小修复。

## 后续路径

1. 用户评审并确认本文档的行为规范。
2. 按“后续 Demo 验证清单”在验证页中补齐泳道图场景。
3. 用户基于验证页手动发现并标记问题。
4. 对已确认问题按优先级进入修复：先补失败测试，再改 `packages/extension/src/pool`。
5. 每个用户可见修复都补 changeset。

## 验收标准

- 文档明确 `pool`、`lane`、业务节点的关系和交互边界。
- 文档明确兼容旧数据和旧 API，不要求用户迁移。
- 文档按移动、新增/删除、resize、折叠、框选五个维度覆盖团队讨论结论。
- 后续 demo 验证清单足够覆盖主要泳道图交互。
- 文档没有要求当前立即修改实现。
- 用户确认后，可以直接进入实现计划设计。
