---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 自动布局 (Layout)
order: 7
toc: content
---

在复杂的流程图中，手动排列节点和边缘可能既耗时又难以保持整洁。LogicFlow 提供了自动布局插件，能够自动计算节点位置和边的路径，使图表呈现出结构化且美观的效果。

## 安装

```shell
# npm
npm install @logicflow/layout

# yarn
yarn add @logicflow/layout

# pnpm
pnpm add @logicflow/layout
```

### UMD 方式使用

您也可以通过 CDN 直接引入 UMD 包：

```html
<!-- 引入 LogicFlow Core UMD -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/index.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core/lib/style/index.min.css" rel="stylesheet">
<!-- 引入 Layout UMD -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/layout/dist/index.min.js"></script>

<script>
  // 通过全局变量 Layout 访问 Dagre 插件
  const { Dagre } = Layout;
  
  // 创建 LogicFlow 实例并注册插件
  const lf = new LogicFlow.default({
    container: document.getElementById('container'),
    plugins: [Dagre]
  });
  
  // 使用布局功能
  lf.dagre.layout({
    rankdir: 'LR',
    nodesep: 50,
    ranksep: 100
  });
</script>
```

## 基本使用

### 注册插件

与其他 LogicFlow 插件一样，Layout 支持全局和局部两种注册方式：

```tsx | pure
import LogicFlow from "@logicflow/core";
import { Dagre } from "@logicflow/layout";

// 全局注册
LogicFlow.use(Dagre);

// 局部注册
const lf = new LogicFlow({
  container: document.getElementById('app'),
  plugins: [Dagre]
});
```

### 应用布局

注册完成后，您可以通过 LogicFlow 实例的 extension 属性访问 dagre 插件：

```tsx | pure
// 使用默认配置
lf.extension.dagre.layout();

// 使用自定义配置
lf.extension.dagre.layout({
  rankdir: 'TB',   // 从上到下的布局方向
  align: 'UL',     // 上左对齐
  nodesep: 60,     // 节点间距
  ranksep: 70      // 层级间距
});
```

## 布局配置选项

通过配置不同的选项，您可以自定义布局的外观和行为。以下是支持的选项：

| 参数名          | 类型    | 默认值       | 说明                                                                   |
| --------------- | ------- | ------------ | ---------------------------------------------------------------------- |
| rankdir         | string  | 'LR'         | 布局方向，'LR'(左到右), 'TB'(上到下), 'BT'(下到上), 'RL'(右到左)       |
| align           | string  | 'UL'         | 节点对齐方式，'UL'(上左), 'UR'(上右), 'DL'(下左), 'DR'(下右)           |
| nodesep         | number  | 100          | 节点间的水平间距(像素)                                                 |
| ranksep         | number  | 150          | 层级间的垂直间距(像素)                                                 |
| marginx         | number  | 120          | 图的水平边距(像素)                                                     |
| marginy         | number  | 120          | 图的垂直边距(像素)                                                     |
| ranker          | string  | 'tight-tree' | 排名算法，'network-simplex', 'tight-tree', 'longest-path'              |
| edgesep         | number  | 10           | 边之间的水平间距(像素)                                                 |
| acyclicer       | string  | undefined    | 如果设置为'greedy'，使用贪心算法查找反馈弧集，用于使图变为无环图       |
| isDefaultAnchor | boolean | false        | 是否使用默认锚点：true表示会自动调整连线锚点，根据布局方向计算边的路径 |

## 高级功能

### 应用布局后自动适配视图

布局调整后，您可能需要调整视图以显示所有节点：

```tsx | pure
// 先应用布局
lf.extension.dagre.layout();
// 然后适配视图
lf.fitView();
```

## 实际效果演示

### 默认锚点

如果节点是Logicflow的默认锚点（即上下左右4个锚点），且锚点信息并不具备业务含义。那么通过设置isDefaultAnchor 为true，就可以在布局中调整连线起终点锚点的位置。

<code id="react-portal-1" src="@/src/tutorial/extension/layout"></code>

### 自定义锚点

如果节点的锚点是自定义的，或者锚点是具备实际业务含义的，isDefaultAnchor 默认为false，那么布局中就不会调整连线的起终点锚点。

<code id="react-portal-2" src="@/src/tutorial/extension/layout/custom"></code>

## 使用建议

1. **复杂图形**：对于大型或复杂的流程图，先使用自动布局生成初始排列，然后进行手动微调
2. **动态更新**：在添加/删除节点后应用布局，使图形保持整洁
3. **方向选择**：根据业务流程的实际含义选择合适的布局方向
4. **参数调整**：通过调整节点间距和层级间距，找到最适合您图表的布局
