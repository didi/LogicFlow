# layout

layout 扩展包

## 安装
```shell
npm install @logicflow/layout
```
or
```shell
yarn add @logicflow/layout
```
or
```shell
pnpm add @logicflow/layout
```

## 使用方式

```js
import LogicFlow from '@logicflow/core';
import { Dagre, ElkLayout } from '@logicflow/layout';

// 提供两种布局插件：Dagre 和 ElkLayout。调用参数相同，按需使用即可
const lf = new LogicFlow({
  container: '#app',
  plugins: [Dagre, ElkLayout]
})

// 基本使用方式 - 无参数
lf.extension.dagre.layout()
lf.extension.elkLayout.layout()

// 使用布局参数
lf.extension.dagre.layout({
  rankdir: 'LR', // 从坐到右布局
  ranksep: 100    // 层级间距
  nodesep: 50,   // 节点间距
})
lf.extension.elkLayout.layout({
  rankdir: 'LR', // 从坐到右布局
  ranksep: 100    // 层级间距
  nodesep: 50,   // 节点间距
})
```

## DagreOption 参数说明

| 参数名 | 类型 | 默认值 | 说明 |
|-------|-----|-------|------|
| rankdir | string | 'LR' | 布局方向，'LR'(左到右), 'TB'(上到下), 'BT'(下到上), 'RL'(右到左) |
| align | string | 'UL' | 节点对齐方式，'UL'(上左), 'UR'(上右), 'DL'(下左), 'DR'(下右) |
| nodesep | number | 100 | 节点间的水平间距(像素) |
| ranksep | number | 150 | 层级间的垂直间距(像素) |
| marginx | number | 120 | 图的水平边距(像素) |
| marginy | number | 120 | 图的垂直边距(像素) |
| ranker | string | 'tight-tree' | 排名算法，'network-simplex', 'tight-tree', 'longest-path' |
| edgesep | number | 10 | 边之间的水平间距(像素) |
| acyclicer | string | undefined | 如果设置为'greedy'，使用贪心算法查找反馈弧集，用于使图变为无环图 |
| isDefaultAnchor | boolean | false | 是否是系统默认锚点（默认上下左右4个锚点），当为true时会自动调整连线的路径 |

## 布局方向示例

### 从左到右 (LR)

```js
lf.extension.dagre.layout({
  rankdir: 'LR'  // 默认值
})
```

### 从上到下 (TB)

```js
lf.extension.dagre.layout({
  rankdir: 'TB'
})
```

### 默认锚点的话（默认上下左右4个锚点）， 会自动调整连线的路径以及起终点位置

```js
lf.extension.dagre.layout({
  rankdir: 'TB',
  isDefaultAnchor: true  // 调整连线锚点
})
```
