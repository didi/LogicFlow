---
nav: API
group:
  title: 扩展插件
  order: 4
title: 自动布局 (Layout)
toc: content
order: 1
---

`@logicflow/layout` 提供 **Dagre** 与 **ElkLayout** 两个布局插件。二者共用同一套分组布局选项（`GroupLayoutOption`），仅在底层算法上不同。

使用教程与示例见 [自动布局插件文档](../../tutorial/extension/layout.zh.md)。

## 注册与调用

```tsx | pure
import LogicFlow from '@logicflow/core'
import { Dagre, ElkLayout } from '@logicflow/layout'

const lf = new LogicFlow({
  container: document.getElementById('app'),
  plugins: [Dagre, ElkLayout],
})

// 全图布局
lf.extension.dagre.layout({ rankdir: 'TB' })
lf.extension.elkLayout.layout({ rankdir: 'TB' })

// 仅布局某个分组内部
lf.extension.dagre.layout({
  groupId: 'group_1',
  rankdir: 'LR',
  nodesep: 40,
})
```

## `Dagre.layout(option?)`

基于 [dagre.js](https://github.com/dagrejs/dagre) 的同步布局。

### 通用布局参数

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `rankdir` | `'LR' \| 'TB' \| 'BT' \| 'RL'` | `'LR'` | 布局方向 |
| `align` | `'UL' \| 'UR' \| 'DL' \| 'DR'` | `'UL'` | 节点对齐 |
| `nodesep` | `number` | `100` | 同层节点间距 |
| `ranksep` | `number` | `150` | 层级间距 |
| `marginx` | `number` | `120` | 水平边距 |
| `marginy` | `number` | `120` | 垂直边距 |
| `ranker` | `'network-simplex' \| 'tight-tree' \| 'longest-path'` | `'tight-tree'` | 分层算法 |
| `isDefaultAnchor` | `boolean` | `false` | 为 `true` 时按布局方向重算折线边路径与默认锚点 |

### 分组布局参数（新增）

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `groupId` | `string` | — | **不传**：布局全图；**传入**：仅布局该分组 `children` 内的节点与组内边，组外节点位置不变 |
| `resizeGroup` | `false \| 'grow-only' \| 'fit'` | `false` | 布局后是否调整分组宽高，见下文 |
| `groupPadding` | `number` | `40` | 计算分组包围盒时的内边距，用于越界检测与尺寸调整 |

:::warning{title=默认会检测越界，但不会改分组尺寸}
`resizeGroup` 默认为 `false`。布局完成后若子节点超出分组边界，会在控制台输出 `[LogicFlow Layout] 节点超出group边界: <groupId>`，**不会**自动修改分组 `width` / `height`。
:::

### `resizeGroup` 行为

| 值 | 行为 |
| --- | --- |
| `false`（默认） | 不调整分组尺寸；若越界则 `console.warn` |
| `'grow-only'` | 仅扩大分组（不缩小），使包围盒包住子节点 + `groupPadding` |
| `'fit'` | 按子节点包围盒 + `groupPadding` 贴合（可扩大也可缩小） |

当 `resizeGroup` 为 `'grow-only'` 或 `'fit'` 时：

- 会实际写入分组的 `width`、`height` 及 `properties.width/height`。
- 若分组 `resizable === false`，**仍会调整尺寸**，并额外警告：`resizeGroup 覆盖了 group.resizable=false`。
- 尺寸发生变化时会警告：`调整了group尺寸: <groupId>`。

一次 `layout()` 调用内，同一分组的同类警告最多输出一次。

### 示例

```tsx | pure
// 全图布局，默认不改分组尺寸
lf.extension.dagre.layout({ rankdir: 'TB', nodesep: 50 })

// 只整理某个 dynamic-group 内部
lf.extension.dagre.layout({
  groupId: 'task_group',
  rankdir: 'LR',
  ranksep: 60,
})

// 组内布局并允许分组框随内容扩大
lf.extension.dagre.layout({
  groupId: 'task_group',
  resizeGroup: 'grow-only',
  groupPadding: 24,
})

// 组内布局并贴合子节点（可缩小分组框）
lf.extension.dagre.layout({
  groupId: 'task_group',
  resizeGroup: 'fit',
})
```

## `ElkLayout.layout(option?)`

基于 [elkjs](https://github.com/kieler/elkjs) 的异步布局，**分组相关参数与 Dagre 完全一致**。额外支持：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `edgesep` | `number` | 边间距 |
| `acyclicer` | `'greedy'` | 环处理策略 |
| `elkOption` | `LayoutOptions` | 透传 ELK 原生布局参数 |

```tsx | pure
await lf.extension.elkLayout.layout({
  rankdir: 'TB',
  groupId: 'lane_1',
  resizeGroup: false,
})
```

## 分组类型支持

布局通过 `isGroup` 与 `children` 识别容器，适用于：

| 类型 | 说明 |
| --- | --- |
| `dynamic-group` | 动态分组；支持 `groupId` 内层布局与嵌套 |
| `lane` / `pool` | 泳道图；默认 `resizeGroup: false`，避免破坏泳池结构 |
| 旧版 `group` | 仍按 `isGroup` 处理，建议迁移到 DynamicGroup |

嵌套分组时，内层先处理，外层再根据内层结果决定是否扩容（当 `resizeGroup` 启用时）。

## 类型导出

```tsx | pure
import type {
  DagreOption,
  ElkLayoutOption,
  GroupLayoutOption,
  ResizeGroupMode,
} from '@logicflow/layout'
```

## 相关文档

- [动态分组插件](../../tutorial/extension/dynamic-group.zh.md)
- [泳道 / 泳池](../../tutorial/extension/pool.zh.md)
- 包内架构说明：`packages/layout/ARCHITECTURE.md`
