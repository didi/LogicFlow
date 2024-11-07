---
nav: 指南
group:
  title: 介绍
  order: 0
title: 升级到 2.0 版本
order: 7
toc: content
---
在`2.0`版本中，我们对项目基建、核心功能、插件的多个模块进行了优化，修复了一系列问题，主要有几个需要调整的地方：
1. CDN引入路径需要变更：
```html | pure
<!-- 原引入路径 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/logic-flow.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/style/index.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/Menu.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.css" />

<!-- 现引入路径 -->
<!-- 旧版本引入时，需要在包名后面加上版本号、路径也需要使用老的 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core@1.2.27/dist/logic-flow.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core@1.2.27/dist/style/index.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension@1.2.27/lib/Menu.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension@1.2.27/lib/style/index.css" />
<!-- 如果想直接引入2.0最新的版本，只需要复制下面这段代码即可 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/index.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core/lib/style/index.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/dist/index.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.min.css" />

```
2. 通过包管理器方式引入LogicFlow core包样式路径需要变更：
```js

// 1.x版本的引入方式
import "@logicflow/core/dist/style/index.css";
// 2.0版本的引入方式
import "@logicflow/core/lib/style/index.css";

```

3. pluginOptions参数传入的各插件的options需要根据插件名分割开
```js
// 这里以设置小地图是否显示连线配置项：showEdge为例
// 1.x版本
new LogicFlow({
  pluginsOptions: {
    showEdge, // MiniMap能正常显示
  },
})
// 2.0版本
new LogicFlow({
  pluginsOptions: {
    showEdge, // ❌MiniMap不能正常显示
    MiniMap: {
      showEdge,// ✅MiniMap能正常显示
    },
  },
})
```

4. Group插件提供的isAllowMoveTo方法和isInRange方法的参数名调整:
```
x1 → minX
y1 → minY
x2 → maxX
y2 → maxY
```
其他改动理论上对使用没有影响，以下是改动内容一览：

### 项目基建
**优化**
1. 补充项目中所有组件、方法的类型定义;
2. core 包中 preact -> preact/compat;
3. 移除dependences中的 jest 依赖， lodash -> lodash-es
4. 完善 README.md 以及 CONTRIBUTING 相关文档;

### Core

#### Node
**新能力**
1. 新增`node:resize`、`node:rotate` 和 `node:properties-change`事件

**优化**
1. 形状组件重构，一些方法进行了重命名
   1. `formateAnchorConnectValidateData` -> `formatAnchorConnectValidateData`;
   2. `setHoverON` -> `setHoverOn`;
   3. `setHoverOFF` -> `setHoverOff`;
2. 移除 TextNode getBackground 中 rectAttr下 y: y-1 的设置;
3. fakerNode 重命名为 fakeNode;
4. 节点文本支样式持通过`properties.textStylele`配置

**问题修复**
1. 通过 points 置原点并基于设定的 width 和 height 缩放的方法，解决多边形形状与边框定位异常的问题;

#### Edge
**新能力**
1. 新增 adjustEdgeStart 和 adjustEdgeEnd，可单独控制调整起始点或结束点;
2. 边文本支样式持通过`properties.textStylele`配置;

**问题修复**
1. 修复初始化时 edgeConfig 中 type 未传值场景下，未使用 graphModel.edgeType(默认边类型) 初始化边的 bug

#### Grid
**优化**
1. 由 Grid 类自行实现网格配置选项的初始化
2. 修改点状网格中点的最大半径计算逻辑，并增加相关注释

**问题修复**
1. 修正原有网格存在偏移的问题
2. 修正网格配置选项的类型声明

#### Graph
**优化**
1. 优化初始化时设置画布大小的逻辑：调整视窗时，画布大小可以同步更新;
2. 「Breaking Change」调整 pluginOptions 只传入插件对应的 options 数据（之前是全量传入）

**问题修复**
1. 修复 设置stopMoveGraph:true但没有设置stopScrollGraph:true，画布无法滚动 的问题;
2. 修复 GraphModel 中 getAreaElement 方法的 bug;

#### Tool
**bigfix**
修复 TextEditTool 无效的 bug，后注原因
   - TextEditTool 组件更新时，原先的 graphModel 和 LogicFlow props 不会触发组件的更新，通过将 textEditElement 传入触发组件更新
   - 移除代码中无用的 console
   - 更新依赖 @babel/plugin-proposal-class-properties -> @babel/plugin-transform-class-properties
   - EventArgs 相关类型由 unknown 改为 any

### Extension

#### 框选插件
**新能力s**
1. 增加`selection:selected-area`事件，返回框选范围;
2. 框选插件默认启用状态改为不启用，如需初始化时就启用框选，在LogicFlow实例创建后调用`lf.extension.selectionSelect.open()`方法开启框选;
**问题修复**
1. 修复框选启用后，页面滚动事件被阻塞的问题;
2. 修复缩放后，框选边距与外边框宽度计算问题;

#### 小地图插件
**新能力s**
1. 支持配置小地图展示位置;
2. 支持选择是否渲染连线，支持初始化时设置或通过`setShowEdge`方法更新设置;
3. 小地图显示内容优化，目前会有画布元素与视口位置共同决定展示内容;
4. 优化小地图预览实况的拖拽交互体验;
5. 增加小地图关闭的回调事件`miniMap:close`;
**问题修复**
1. 优化画布移动时，小地图的更新策略，减少性能消耗;
2. 修复点击小地图预览视窗会触发不可预期的画布移动的问题;
3. 修复小地图的预览视窗无法拖拽的问题;

#### NodeResize插件
**优化**
在1.x版本中，节点缩放能力需要通过引入NodeResize插件实现，在2.0版本中，我们将resize能力内置到基础节点上;同时还支持了节点旋转能力可配置。
1. 用户可以通过全局配置项`allowResize`、`allowRotate`设置当前实例中所有节点是否可缩放、可旋转;
2. 也可以在初始化渲染传入数据的`properties`中增加`resizable`、`rotatable`参数控制单个节点是否可旋转可缩放，在内部，节点的`resizable`和`rotatable`默认为`true`;

:::warning{title=Tip}
  缩放能力内置后，NodeResize插件会逐步废弃
:::

3. 统一 NodeResize 中 getResizeOutlineStyle fill 和 stroke 的返回值;

**问题修复**
1. 解决resize 结束后节点重新定位的问题;
2. 修复 HtmlREsize 节点 outlineStyle fill 默认为 黑色的 bug;

#### Snapshot插件
**优化**
1. 优化 bpmn 插件的导出内容;
2. 支持导出节点中的网络图片;
3. 完善snapshot使用方式，支持自定义导出的文件名、文件类型、图片宽高、背景颜色、图片质量等属性;

**问题修复**
1. 修复开启局部渲染后导出内容缺失问题;

#### Group插件
在2.0版本里，我们重写了分组插件相关逻辑，将 Group 插件升级为 [Dynamic Group 插件](extension/dynamic-group.zh.md)
**新能力s**
1. 支持分组节点缩放旋转时，内部元素也随之同步缩放旋转;

**优化**
1. 调小 ResizeControl 的范围 30 -> 15，原因是会盖住 Group 折叠的小按钮;
2. 优化允许文本拖动的逻辑判断 -> nodeTextDraggable && draggable 才可以允许拖动;

#### HighLight插件
**新能力s**
1. 支持高亮邻居节点模式;
2. 支持外部传参配置高亮形式;

**ptimizations**
1. 补充功能介绍文档[HighLight 插件](extension/highlight.zh.md)

#### 「New」Label插件
**新能力s**
在2.0版本里，我们新增了一种文本展现形式：Label，这种形式与现有Text形式文本之间的主要区别点在于：
1. 支持一个节点/一条边 上可以添加多个文本，且可以设置文本朝向;
2. 自带富文本编辑能力，支持设置局部文本样式;
3. 使用新的位置计算算法，优化节点和边调整时，关联文本的移动体验;
欢迎大家使用，功能介绍传送门：[Label 插件](extension/label.zh.md)

**优化**
1. 优化文本可编辑配置项的赋值优先级：textEdit(全局) > nodeTextEdit/edgeTextEdit(分类) > 元素本身 editable;
2. graphModel 中增加 textMode 属性，用于标识当前使用什么文本模式;
3. BaseNodeMode、 BaseEdgeModel 以及 graphModel 中增加 更新 textMode 的方法;`updateTextMode`;
4. 为文本模块增加可监听的事件;


### Engine
**优化**
1. 重构 engine 模块代码，使用 sandbox.js 解决 iframe 频繁 append 导致的性能问题
2. @logicflow/engine 默认使用 browser 执行代码，node 端也使用 @nyariv/sandboxjs 执行代码片段，保持两端一致