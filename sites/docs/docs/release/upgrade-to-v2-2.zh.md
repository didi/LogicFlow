---
title: 2.2.0 测试版本ChangeLog
order: 3
toc: content
---

## 2.2.0(alpha) - 2025.12.2

### Added
1. 移动端适配
 - 主要改动：除了over、enter和leave事件外，其余事件都将MouseEvent升级成PointerEvent，并复用事件处理函数，保障大部分功能平滑迁移
 - 效果：
   1. 支持节点的拖拽、双击修改文本，单击节点出现轮廓支持调整节点尺寸和旋转
   2. 支持边的连接、拖动调整折线中段和端点、贝塞尔曲线可以调整
   3. 支持画布的拖拽、双指缩放功能
   4. 支持插件中拖拽小地图来移动画布的功能、框选功能、长按节点/边/画布显示对应菜单
// 一个演示视频

### Bugs
1. 必须在画布上点右键，快捷键才会生效

## 2.2.0-alpha.1 - 2025.12.16

### Features
1. 锚点优化：
 - 支持用户指定连线默认连入的锚点
 - 支持设置连线是否必须拖拽到锚点附近释放才会创建连线
2. 边上插入节点 插件优化：边上插入节点时指向插入位置改为指向距离插入位置最近的锚点

### Fixed
1. 修复getSnapshotBlob传svg时返回的不是svg格式文件的问题
2. 修复electron环境下引用插件报错问题

## 2.2.0-alpha.2 - 2025.12.16

### Fixed
1. 修复2.2.0-alpha.0版本引入的 "必须在画布上点右键，快捷键才会生效"问题

## 2.2.0-alpha.3 - 2025.12.18

### Changed
1. 整体UI美化
  a. 折线边优化：
   - 设置圆角能力改为内置实现，支持用户通过properties.radius设置折线圆角
   - 折线边第一个拐点与节点之间的间距由 固定值10 改成 箭头的offset+5 ，并支持用户通过properties.offset设置折线边的间距
   <img width="100%" alt="边优化效果" src="https://github.com/user-attachments/assets/2b7ce088-af9e-4025-9d2e-330c4922739f" />
  b. 多边形优化
    - 优化圆角生成逻辑，与折线边圆角生成规则拉齐
    - 样式取值优化：从 merge(主题样式, properties设置的自定义样式) 改为 merge(主题样式, new LogicFlow时style中传的样式, properties设置的自定义样式)
    <img width="100%" alt="1" src="https://github.com/user-attachments/assets/26bada96-aca0-4dd2-aac0-dee19576073b" />

  c. vue-node-registry/react-node-registry能力扩展：支持标题卡片模式，用户可以通过properties传参展示出固定结构的自定义节点，降低集成成本
   <img width="100%" alt="框架节点改造" src="https://github.com/user-attachments/assets/1c78da5c-26ed-4e91-8f3a-7ecab2cb5792" />

  d. 网格能力增强：
    - 新增支持配置定点加粗
    - 调整初始化配置取值逻辑：固定的default配置 -> 主题的默认grid配置
    <img width="100%" alt="网格效果对比" src="https://github.com/user-attachments/assets/de65add9-2f40-48cb-be04-daf1765e47a1" />

  e. 默认主题美化：
    - 融合radius主题配置（2.2前themeMode支持的传入值radius将在本版本将删除）并调整默认配色；
    - 新增retro主题类型保留2.2版本前的样式，供有需要的用户使用；
    <img width="100%" alt="主题对比" src="https://github.com/user-attachments/assets/81dbcbc7-ae13-460e-af78-a1e926931a7f" />

  f. 其他主题细节配置项优化
    - 节点外框支持配置与节点之间的间距
    - html支持通过主题配置样式，并支持配置阴影
    - 多选框支持配置与选中元素之间的间距
    - 新增edgeOutline配置项，支持单独配置连线外框的样式

  g. 插件优化
    - 菜单支持隐藏文案，只展示icon，优化icon
    - 动态分组节点展开态的文本展示位置从水平垂直居中改为水平居中 + 垂直顶部对齐，以实现默认有子元素时分组文本不被遮挡的效果，新增方法支持用户继承重写以自定义分组节点展开时的文本位置
    - 右键菜单、小地图、拖拽面板UI优化

## 2.2.0-alpha.4

- 新增 ELK 布局插件（ElkLayout），基于 elkjs 的 layered 算法进行自动布局，可自动计算节点位置与连线路径。
- 与 Dagre 使用方式一致，可与 Dagre 并存使用，按需选择：
  - 安装：@logicflow/layout
  - 注册：import { ElkLayout } from '@logicflow/layout'，通过 LogicFlow.use(ElkLayout) 或 plugins: [ElkLayout]
  - 调用：lf.extension.elkLayout.layout(options)
- 主要配置项（与 Dagre 对齐）：
  - rankdir（LR/TB/BT/RL）、align（UL/UR/DL/DR）、nodesep、ranksep、marginx、marginy、ranker、edgesep、acyclicer、isDefaultAnchor
- 支持通过 elkOption 透传 ELK 原生布局参数，用于覆盖默认布局策略细节。