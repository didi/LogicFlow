# layout

`@logicflow/layout` 提供 LogicFlow 自动布局能力，包含 **Dagre** 与 **ElkLayout** 两个插件。

## 安装

```shell
pnpm add @logicflow/core @logicflow/layout
```

## 基本使用

```js
import LogicFlow from '@logicflow/core'
import { Dagre, ElkLayout } from '@logicflow/layout'

const lf = new LogicFlow({
  container: '#app',
  plugins: [Dagre, ElkLayout],
})

lf.extension.dagre.layout({ rankdir: 'LR' })
lf.extension.elkLayout.layout({ rankdir: 'TB' })
```

## 分组布局（GroupLayoutOption）

Dagre / ElkLayout 共用以下参数（完整说明见文档站 [Layout API](https://site.logic-flow.cn)）：

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `groupId` | `string` | — | 不传：全图布局；传：仅布局该分组内部 |
| `resizeGroup` | `false \| 'grow-only' \| 'fit'` | `false` | 布局后是否调整分组尺寸 |
| `groupPadding` | `number` | `40` | 计算分组包围盒时的内边距 |

```js
// 仅布局组内，不改分组框（默认）
lf.extension.dagre.layout({ groupId: 'group_1', rankdir: 'LR' })

// 组内布局并扩大分组框
lf.extension.dagre.layout({
  groupId: 'group_1',
  resizeGroup: 'grow-only',
  groupPadding: 24,
})
```

**告警（console.warn）：**

- 子节点超出分组边界
- 实际调整了分组尺寸
- `resizeGroup` 覆盖了 `group.resizable === false`

## 通用布局参数

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| rankdir | 'LR' | LR / TB / BT / RL |
| align | 'UL' | UL / UR / DL / DR |
| nodesep | 100 | 同层节点间距 |
| ranksep | 150 | 层级间距 |
| isDefaultAnchor | false | 是否重算默认锚点与折线路径 |

ElkLayout 另支持 `elkOption` 透传 ELK 原生配置。

## 架构

见 [ARCHITECTURE.md](./ARCHITECTURE.md)。
