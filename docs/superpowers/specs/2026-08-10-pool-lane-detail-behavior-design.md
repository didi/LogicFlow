# Pool / Lane 交互细节设计

## 背景

上一轮 Pool/Lane 改造已经完成基本移动、排序、复制、删除、resize、折叠和框选能力。本轮只调整已确认的体验细节，并保持旧数据可以无缝升级。

## 设计原则

- 不改变已有 `direction` 的数据含义。
- 新配置缺失时，按旧行为推导默认值。
- Pool、Lane 的尺寸计算必须使用最终布局后的标题区、折叠状态和折叠间距。
- 临时拖拽提示只影响渲染状态，不写入图数据。
- 生产代码中的复杂布局与状态转换补充必要中文注释。

## 标准与项目约定

BPMN 2.0 官方规范在图 119 和图 120 分别给出 “Two Lanes in a Vertical Pool” 与 “Two Lanes in a horizontal Pool”，确认两种泳道方向均为规范可表达的图形方式。规范的图形信息主要由 BPMNDI 的 Bounds 等图形数据表达，未将 Pool 标题边限定为唯一位置。因此标题边不以限制性规则固定，而作为产品配置能力提供。参考：[OMG BPMN 2.0.0 规范](https://www.omg.org/spec/BPMN/2.0/PDF)。

本项目沿用既有流程方向语义：`horizontal` 表示 Lane 上下排列，`vertical` 表示 Lane 左右排列。旧数据的标题位置默认映射为 `horizontal -> left`、`vertical -> top`，从而保证升级前后的视觉结果一致。

## 配置模型

Pool 增加独立的标题配置：

```ts
pool.properties = {
  titlePosition: 'left' | 'right' | 'top' | 'bottom',
  laneConfig: {
    titlePosition?: 'left' | 'right' | 'top' | 'bottom',
    collapsedLaneGap?: number,
  },
}
```

Lane 的 `properties.titlePosition` 为可选覆盖项：

- 未设置时，继承所属 Pool 的 `laneConfig.titlePosition`。
- Pool 的 Lane 默认标题位置未设置时，再按 Pool 的 `titlePosition` 推导。
- Pool 的 `titlePosition` 也未设置时，按旧 `direction` 推导。
- Lane 移入新 Pool 时，没有自身覆盖值的 Lane 立即使用目标 Pool 规则。

`collapsedLaneGap` 默认值为 `12px`。它只在折叠 Lane 与相邻 Lane 的边界产生间距；只要相邻边界的一侧 Lane 折叠，就需要预留该间距。

## 标题区与分隔线

- Pool 名称始终绘制在 Pool 标题区内。
- Lane 名称始终绘制在 Lane 标题区内。
- 标题区占据指定边，内容区占据剩余空间。
- 标题区和内容区之间绘制分隔线，分隔线方向和位置随标题边变化。
- Pool 与 Lane 的文字方向、对齐和可用文本区域都按最终标题边计算。
- Pool 与 Lane 的标题文字均在标题区内水平、垂直居中；折叠按钮也必须位于标题区内，并随标题边一起移动。按钮在标题条短轴居中、长轴靠起始端，以免遮挡居中的标题文字。

## 折叠

### Pool 折叠

Pool 折叠后使用与 DynamicGroup 一致的单一固定节点：Pool 默认 `120 x 80`，允许通过 `properties.collapsedWidth`、`properties.collapsedHeight` 覆盖。折叠以展开态左上角为基准，不渲染 Lane、内容区、分区边界或标题分隔线，Pool 名称与折叠按钮在该节点内居中/定位。

折叠 Pool 前记录每个 Lane 的折叠状态。展开 Pool 时先恢复各 Lane 的状态，再根据恢复后的 Lane 展开尺寸、折叠尺寸和间距重新布局并计算 Pool 宽高。

### Lane 折叠

Lane 折叠后只保留自己的完整标题块，内容节点隐藏，相关真实边替换为折叠虚拟边。折叠尺寸由 Pool 的排列方向决定：`horizontal`（Lane 上下排列）保留完整宽度并将高度收缩为标题区高度；`vertical`（Lane 左右排列）保留完整高度并将宽度收缩为标题区宽度。相邻 Lane 之间按 `collapsedLaneGap` 留出稳定空间，使 Lane 与 Lane 之间的连线有可绘制的通道。

新增 Lane 默认以展开状态创建，并使用目标 Pool 的展开尺寸和标题位置规则。删除折叠 Lane 或恢复 Lane 时，必须重新计算 Pool 尺寸和虚拟边端点。

## 拖拽提示样式

泳道进入 Pool 时复用普通分组节点进入提示的黄橙色虚线外框和允许状态；非法空白区域保持禁止状态。泳道排序时显示黄橙色虚线的插入槽位提示框，而不是一条边界线：横向 Pool 的提示框占满内容区宽度、高度等于被拖 Lane 或被框选 Lane 块的总高度；纵向 Pool 的提示框占满内容区高度、宽度等于对应 Lane 或 Lane 块的总宽度。提示框和目标高亮属于拖拽期间的临时 UI 状态。

Pool 本体不可 resize。选中 Pool 时使用与 resize 节点相同位置、外扩尺寸和主题的虚线边框作为直接选中反馈，但不显示 resize 控制点。

## 跨 Pool 移动

Lane 及其子节点、相关连线整体移动到目标 Pool，并在目标 Pool 内按照固定槽位重排。迁移前按源 Pool 校验 `minLaneCount`。只有源 Pool 显式配置为允许最少 `0` 条 Lane，且迁移完成后不再包含任何 Lane 时，才立即删除该空 Pool；迁移的 Lane、子节点和连线不受删除空 Pool 的影响。直接删除 Lane 仍遵守 `minLaneCount` 约束。

## 空白位置粘贴

剪贴板中包含一个或多个 Lane 且没有唯一选中的目标 Pool 时，允许粘贴到空白位置。系统以粘贴坐标创建一个新 Pool，再将 Lane 放入新 Pool 并保持相对顺序、尺寸、折叠状态和内部关系。新 Pool 优先复制首个源 Lane 所属 Pool 的标题、Lane 标题和折叠间距配置；源 Pool 配置不可用时，使用插件全局默认值。普通节点和边仍遵循既有粘贴规则。

## 框选 Demo

Pool/Lane Workbench 增加两种可切换入口：

1. `空白起点框选`：从画布空白处开始。
2. `任意起点框选`：可从 Pool、Lane 或其他节点本体开始。

两种模式共用同一场景、事件日志和图数据查看区。本轮先用于观察现有行为，不在 Demo 层绕过生产插件改变框选语义。

## 兼容性

- 不写入新字段的旧 Pool/Lane 按旧 `direction` 规则显示。
- 旧 Lane 的尺寸、子节点、边和折叠数据继续可读取。
- 新字段只增加配置表达能力，不要求用户迁移历史图数据。
- 复制到空白的新 Pool 是新增行为，不影响已有“粘贴到唯一选中 Pool”的路径。

## 验收与测试

- 四种 Pool 标题边，以及四种 Lane 标题边继承/覆盖组合。
- 标题区、内容区与分隔线在四个边上的位置和方向。
- 旧数据无新字段时的默认映射。
- Pool 折叠只保留单标题块，展开后恢复 Lane 状态并重新计算尺寸。
- Lane 折叠间距参与布局、Pool 尺寸、排序槽位和折叠虚拟边。
- `minLaneCount: 0` 时最后一个 Lane 跨 Pool 移动后删除空 Pool；默认最小值 `1` 时迁移被拒绝。
- 单个和多个 Lane 粘贴到空白位置时自动创建 Pool。
- Demo 中两种框选入口均可开启、关闭并观察选中结果。
- 运行 Pool、DynamicGroup、core 相关测试、类型检查、Demo 类型检查和 `git diff --check`。

## 本轮不包含

- 不重新定义 `direction` 的含义。
- 不改变框选插件的两种模式的底层语义。
- 不新增 Lane 以外节点的标题边配置。
- 不自动提交代码或创建 git commit。
