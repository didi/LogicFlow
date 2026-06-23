---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 自动布局 (Layout)
order: 7
toc: content
---

在复杂流程图中，手动摆放节点与调整连线既耗时又容易混乱。

自动布局插件可以：
- 根据连线关系自动计算节点位置与层级顺序
- 支持布局方向（LR/TB/BT/RL）与对齐方式
- 支持节点间距、层级间距、边间距与画布边距配置
- 规划连线路径，减少交叉并保持整体走向一致
- 可选使用默认锚点自动调整连线起终点位置

使用后通常能获得层级清晰、间距统一、连线更少交叉的结构化布局，适合作为初始排版，再进行少量手动微调。

`@logicflow/layout` 提供 **Dagre** 与 **ElkLayout** 两个插件，调用方式一致，可按场景选择算法。二者共用分组布局参数（见 [Layout API 文档](../../api/extension/layout.zh.md)）。

**能力范围：**

- 会处理：节点位置、层级与间距；连线走向的基础规划；含 `dynamic-group` / 泳道等容器时的组内布局与越界检测
- 不会处理：业务规则校验、节点/边样式、分组成员关系维护（仍由 DynamicGroup / Pool 插件负责）

:::warning{title=含分组时请注意 resizeGroup}
默认 `resizeGroup: false`：**不会**修改分组宽高，但若子节点超出组框会在控制台告警。需要布局后自动撑开分组时，请显式传入 `resizeGroup: 'grow-only'` 或 `'fit'`。
:::

## 效果演示

### 默认锚点

如果节点是LogicFlow的默认锚点（即上下左右4个锚点），且锚点信息并不具备业务含义。那么通过设置isDefaultAnchor 为true，就可以在布局中调整连线起终点锚点的位置。

<code id="react-portal-1" src="@/src/tutorial/extension/layout"></code>

### 自定义锚点

如果节点的锚点是自定义的，或者锚点是具备实际业务含义的，isDefaultAnchor 默认为false，那么布局中就不会调整连线的起终点锚点。

<code id="react-portal-2" src="@/src/tutorial/extension/layout/custom"></code>

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
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/index.css" rel="stylesheet">
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
import { Dagre, ElkLayout } from "@logicflow/layout";

// 全局注册
LogicFlow.use(Dagre);
LogicFlow.use(ElkLayout);

// 局部注册
const lf = new LogicFlow({
  container: document.getElementById('app'),
  plugins: [Dagre, ElkLayout]
});
```

### 应用布局

注册完成后，通过 `lf.extension.dagre` 或 `lf.extension.elkLayout` 调用：

```tsx | pure
// Dagre — 同步
lf.extension.dagre.layout({ rankdir: 'TB', nodesep: 60, ranksep: 70 });

// ElkLayout — 异步，参数与 Dagre 对齐
await lf.extension.elkLayout.layout({ rankdir: 'TB', nodesep: 60, ranksep: 70 });
```

## 布局配置选项

### 通用参数（Dagre / ElkLayout 共用）

| 参数名          | 类型    | 默认值       | 说明                                                                   |
| --------------- | ------- | ------------ | ---------------------------------------------------------------------- |
| rankdir         | string  | 'LR'         | 布局方向，'LR'(左到右), 'TB'(上到下), 'BT'(下到上), 'RL'(右到左)       |
| align           | string  | 'UL'         | 节点对齐方式，'UL'(上左), 'UR'(上右), 'DL'(下左), 'DR'(下右)           |
| nodesep         | number  | 100          | 节点间的水平间距(像素)                                                 |
| ranksep         | number  | 150          | 层级间的垂直间距(像素)                                                 |
| marginx         | number  | 120          | 图的水平边距(像素)                                                     |
| marginy         | number  | 120          | 图的垂直边距(像素)                                                     |
| ranker          | string  | 'tight-tree' | 排名算法，'network-simplex', 'tight-tree', 'longest-path'              |
| isDefaultAnchor | boolean | false        | 是否使用默认锚点：true 表示会自动调整连线锚点，根据布局方向计算边的路径 |

ElkLayout 额外支持 `edgesep`、`acyclicer`、`elkOption`（透传 ELK 原生参数）。

### 分组布局参数（新增）

| 参数名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| groupId | string | — | 不传：布局全图；传入：仅布局该分组内部节点与组内边 |
| resizeGroup | `false \| 'grow-only' \| 'fit'` | `false` | 布局后是否调整分组尺寸 |
| groupPadding | number | 40 | 计算分组包围盒时的内边距，用于越界检测与尺寸调整 |

**`resizeGroup` 说明：**

- `false`：不改分组尺寸；子节点越界时控制台警告「节点超出group边界」
- `'grow-only'`：只扩大分组以包住子节点
- `'fit'`：按子节点包围盒贴合（可扩可缩）；变化时警告「调整了group尺寸」

当 `resizeGroup` 为 `'grow-only'` 或 `'fit'` 且分组 `resizable === false` 时，布局仍会改尺寸并警告「覆盖了 group.resizable=false」。

一次 `layout()` 调用内，同一分组的同类警告最多输出一次。

## 分组场景示例

与 [动态分组](./dynamic-group.zh.md)、[泳道](./pool.zh.md) 配合使用时，建议先明确是「全图排版」还是「只整理某个组内部」。

```tsx | pure
// 全图布局（默认不改分组框大小）
lf.extension.dagre.layout({ rankdir: 'TB' })

// 仅布局某个 dynamic-group 内部
lf.extension.dagre.layout({
  groupId: 'group_1',
  rankdir: 'LR',
  nodesep: 40,
})

// 组内布局并允许分组框随内容扩大
lf.extension.dagre.layout({
  groupId: 'group_1',
  resizeGroup: 'grow-only',
  groupPadding: 24,
})

// 泳道内节点：通常保持 resizeGroup: false，避免改动 lane/pool 结构
lf.extension.elkLayout.layout({
  groupId: 'lane_1',
  rankdir: 'LR',
  resizeGroup: false,
})
```

嵌套分组（组内含组）时，内层先处理；若启用 `resizeGroup`，外层分组可能随内层扩大而一并调整。

完整 API 说明见 [Layout API](../../api/extension/layout.zh.md)。

## 高级功能

### 应用布局后自动适配视图

布局调整后，您可能需要调整视图以显示所有节点：

```tsx | pure
// 先应用布局
lf.extension.dagre.layout();
// 然后适配视图
lf.fitView();
```


## 使用建议

1. **复杂图形**：对于大型或复杂的流程图，先使用自动布局生成初始排列，然后进行手动微调
2. **含分组**：默认 `resizeGroup: false` 只告警不扩框；需要包住子节点时再开 `'grow-only'` 或 `'fit'`
3. **泳道图**：lane 内布局建议保持 `resizeGroup: false`，避免破坏 pool/lane 联动尺寸
4. **动态更新**：在添加/删除节点后应用布局，使图形保持整洁
5. **方向选择**：根据业务流程的实际含义选择合适的布局方向
6. **参数调整**：通过调整节点间距和层级间距，找到最适合您图表的布局
