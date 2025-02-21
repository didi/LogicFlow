# Change Log

## 2.0.11

### Patch Changes

- fix: 修复一些已知问题
  - fix(core): 修复节点旋转后锚点无法被接线的问题 fix #1871
  - fix(core): 修复旋转节点多选后移动位置异常问题 fix #1794
  - feat(core): 销毁时调用所有插件的 destroy 方法
  - fix: 修正错误提示
  - feat: 折线边支持配置节点相邻第一个拐点位置&曲线边支持配置调整线拉伸长度 fix #1953

## 2.0.10

### Patch Changes

- fix(core): 导出的边数据中默认带上连接锚点的ID fix #1991
- fix(core): 修复节点和文本同时支持拖拽场景下,拖拽文本时节点也跟随移动问题 fix #1520
- fix(core): 修复静默状态下点击节点和边会修修改节点和边的层级 fix #1588
- fix: 兼容不设置高度时,窗口变化后更新画布尺寸
- fix: 修复window resize失效问题
- fix(内存): 修复调用clearData之后，依然保持对节点的引用导致的内存溢出bug fix #1993
- fix: 修复设置 textDraggable 为 true 时，边、节点文本无法拖拽的 bug
- feat(core): 完善destory方法&增加性能测试demo
- fix(core/polyline): 修复流程图初次渲染时即使传入pointsList折线路径也会重置问题&新增修改折线pointsList的方法
- fix(core): 网格对齐改为开关控制 & 修复初始化时流程图偏移问题

## 2.0.9

### Patch Changes

- fix: 重新打包以加入最新改动内容

## 2.0.8

### Patch Changes

- fix(core): 修复已知问题,新增渐进连线能力
  - feat: 支持动态修改画布背景配置
  - fix(core): 修复使用label情况下双击节点会让节点进入文本编辑态问题
  - fix(core): 修复初始化画布时因为节点吸附网格导致的节点与边错位问题 #1954
  - feat(core): 增加节点和边的focus和blur事件上报 #1917
  - feat(core): line 和 polyline 增加getPath方法 #1929

## 2.0.7

### Patch Changes

- fix: 修复一些问题
  - fix: 修复文本拖拽不符合预期的问题 by ChangeSuger
  - feat: 支持动态修改 Grid 的配置 by ChangeSuger
  - fix: 修复 2.x 与 1.x 下相同的网格线宽，Grid 表现不一致的问题 by ChangeSuger
  - fix: node:dnd-drag 增加事件数据 by HeatonZ
  - fix(extension): 【dynamic-group】修复mousemove和isCollapsed相关问题 by wbccb
  - fix: 修复 windows 系统 node20 环境下样式文件打包失败的问题 by ChangeSuger
  - fix: 修复 node:dnd-drag 事件的类型检查问题 by ChangeSuger
  - fix(example): 修复文档中vue3自定义组件不能正常显示bug by zkt2002
  - fix(core): 在没有拖拽的情况下，Control组件突然销毁，不触发cancelDrag(#1926) by wbccb
  - fix(core): 修复笔记本触摸板点击边事件失效 by wuchenguang1998
  - feat(examples): 添加动画边demo by DymoneLewis
  - fix(core): 类型定义 properties:change 改为 node:properties-change by HeatonZ
  - feat: node-registry 自定义properties类型 by HeatonZ
  - fix(core): 修复 polyline 与多边形节点的交点不正确的问题 by Yuan-ZW

## 2.0.6

### Patch Changes

- feat(core&extension): 解决 transform 相关问题 #1446
- fix(core&extension): 优化分组缩放时子元素是否缩放的逻辑，并解决元素缩放时出现的问题
- fix(extension): 解决动态分组 resize 时，建议增加参数控制子元素是否需要同时缩放的问题 close #1826

## 2.0.5

### Patch Changes

- fix(core&extension): fix bugs from issues
  - fix(core): update import path to relative path style to remove compile error in angular(修复angular中引用后编译报错问题)
  - fix(core): 修复BaseNodeModel的getData()拿不到width和height的问题(#1826)
  - fix(core): node => rotate+正常模式resize(#1428)
  - fix(core): 外部调用handleResize()没有传入anchor坐标不触发recalcRotatedResizeInfo方法
  - chore(core): rotate+正常模式resize的相关变量名称从anchor改为control

## 2.0.4

### Patch Changes

- fix: 修复节点文本设置draggable和editable不生效问题

## 2.0.3

### Patch Changes: Release 2.0.3 Version

- chore: 新增 rollup.config 将 extension less 文件打包成 css，并不在 js 中引入 less
- 解决 BaseEdgeModel 中 setProperty 方法使用 set 时报错的 bug
- isIe 调整为方法，解决 ssr 项目中 window is not defined 的问题 close #1524

## 2.0.2

### Patch Changes: Release 2.0.2 Version

- 修复自定义节点 Model 中 initNodeData 方法不生效
  - 修复circle、diamond、polygon、rect、ellipse 中 initNodeData 方法不生效
  - 修复官网教程- 基础教程- 节点文章中跳转错误
  - example中补充自定义circle、diamon、polygon节点
- 解决 Menu 插件 setMenuByType 为私有方法导致用户无法调用的 bug close #1773
- 修复单独引入less导致的用户侧启动服务报错的问题
- 修复文档中 core 包 css 资源地址错误的问题 close #1798
- 修复 model 中 width/height/radius 等 properties 传 0 无效的 bug

## 2.0.1

### Patch Changes: 修复 2.0 版本中 Core 包及 Extension 中 dynamic-group/label 等插件的 bug

- 修复初始化时 DyanmicGroup 插件折叠展开报错的问题 #1767
- 修复 RectNodeModel 初始化时设置 width、height、radius 为 0 时无效的 bug
- Rename: resizeFunction -> throttleResize 函数命名优化
- 修复 isRestrict 开启后子节点仍能拖拽出分组区域的 bug
- 优化分组旋转时，子节点的旋转逻辑，以分组中心为中心点旋转，并更新自身的 rotate 属性
- 增加 elementsModelMap 解决 Group 初始化时，children 中的元素未完成初始化导致 model 为空的bug
- Rename: outcomingEdgeList，getAnchorOutcomingEdge，outcoming -> outgoing#1449
- 修复画布加载完后新增节点时Label不展示问题 #1759
- 重新修改样式打包配置,用于修复引入插件包后起服务报错问题 #1760
- 修复画布切换后页面宽高变化时持续出现警告问题 #1756
- 统一数据类型, 修复textVal为数字时报错问题 #1612
- 修复节点id切换后某一次更新边拿不到NodeId问题 #864

## 2.0.0

### Major Changes: Release 2.0 New Version 🎉🎉🎉🎉

#### refactor: 重构 LogicFlow 项目结构，升级打包工具，使用 pnpm 做包管理工具

- rename index.tsx -> index.ts, update dependencies and declare module mobx-preact
- 配置 husky pre-commit
- 完善 LogicFlow.tsx 主文件类型定义
- update .gitignore
- git rm -r --cached sites/docs/.dumi/tmp
- add index.less
- 解决项目中 core 包 TypeScript 类型错误导致打包失败的问题

- 项目代码重构，包括 examples、extension 及 core 包

  - remove react-umi-app demo
  - rename lf-engine-browser -> engine-browser-examples
  - rename lf-engine-node -> engine-node-examples
  - extension 包中修改文件夹名大小写未生效，恢复成 Control 和 Node 文件夹，后续再处理
  - add feature-examples DEMO 项目，用于汇总所有官方 demo，后续再 docs 中使用
  - 完成 feature-examples 中 demo 的改造，增加 graph 页面
  - 优化 DndPanel 的demo
  - 开发 feature-examples 中 BPMN 插件 demo
  - feature-examples 中增加 BPMN demo
  - engine-browser-examples 中增加 graph demo，方便后续在 vite 环境下调试包功能，测试 umi 与 vite 是否一致
  - engine-browser-examples bpmn demo 更新
  - 新增 next-app 用来测试服务端渲染项目中 window is not defined 的问题
  - 修复 vue3-memory-leak 项目中引入 vue 文件报错的问题
  - 新增 vue3-app 用于测试 vue-node-registry，后续使用该项目开发 vue 组件或 demo
  - feature-examples 类型完善
  - 修复 engine-browser-examples 中类型错误问题
  - 优化 engine-browser-examples 样式
  - 补充自定义折线、圆角折线、节点选择示例 (#1680)
  - 添加insert-node-in-polyline，rules两个插件的demo
  - 增加测试vue3性能demo
  - 增加rect-label-node插件示例
  - 增加高亮插件说明文档 - 优化高亮插件示例

- 文件夹重命名，将大驼峰命名修改为 小写+短横线

  - DefaultAnimation.ts -> defaultAnimation.ts
  - DefatultTheme.ts -> defaultTheme.ts
  - history/History.ts -> history/index.ts
  - 并更新项目中各个文件的引用地址

- 解决 git config core.ignorecase 为 true 导致修改文件夹名大小写不生效的问题

  - 重命名 BPMN -> bpmn; Control -> control
  - 命名规范：文件夹名小写（name or name1-name2-name3）；.js or .ts 小驼峰；.tsx or .jsx 大驼峰
  - 新增 Vue3-memory-leak demo 用于定位内存泄漏的问题，后续基于此 demo 增加 LogicFlow destroy 的方法
  - 优化 properties 类型定义为 Record<string, any>，避免 unknow 引起的问题，后续再优化
  - 解决 graph demo 中发现 BezierEdge 初始化 path 为空的问题，可以看 -> BezierEdgeModel.ts 的改动

- 通过 git rm --cached Xxxx 移除修改大小写的文件夹内容

- 完善 README.md 以及 CONTRIBUTING 相关文档，解决 eslint 问题

  - 完善开源共享引导文档：README 以及 CONTRIBUTING
  - 项目根目录运行 pnpm run lint:ts，解决项目中 eslint 错误及 warning

- Update update_contributors.yml

- update package.json, add changesets to generate CHANGELOG

  - .gitnore add .umi/ and delete .npmrc file
  - dependencies 中 'workspace:latest' -> 'workspace:\*' 解决 changeset 中生成 CHANGELOG 报错的问题
  - update build-docs shell
  - add @changesets/cli and related scripts

- 更新 rollup config 并增加 umd 包使用 demo 文件

- npm 包 dependencies 中新增 lodash-es 依赖，解决引入项目中报错的问题

  - 开发节点文本换行等体验优化的功能
  - 解决 examples 中报错的问题

- 移除文档中 lodash-es 依赖，移除无用 console
- 优化代码注释歧义的问题
- 更新 turbo 版本并解决 extension 打包 core 依赖报错的问题

#### Core & Extension 更新

- core 包中 'preact' -> 'preact/compat' 解决 svg 属性问题
- 完成 core 包 roolup 打包及core 包中类型定义更新
- extension 包中代码重构，解决 TypeScript 类型定义的问题，完成打包改造
- core 包中类型定义完善，解决在 extension 包重构过程中遇到的 Core 包问题
- 优化 core 包中类型定义，增加 GraphData 类型，区别于 GraphConfigData
- 优化 bpmn 插件的导出内容
- 修复 GraphModel 中 getAreaElement 方法的 bug 及一些其他类型定义的优化

- 修复 GroupNode 中 getNodeStyle 解构后调用，BaseNodeModel 中 getNodeStyle 方法 this 为空的问题

  - 确认解构后赋值和直接 this.props.model.getNodeStyle() 方法调用的区别 -> this 指向的问题
  - LogicFlow Examples 中新增 Group 插件

- 主要修复 TextEditTool 无效的 bug，后注原因

  - TextEditTool 组件更新时，原先的 graphModel 和 LogicFlow props 不会触发组件的更新，通过将 textEditElement 传入触发组件更新
  - 移除代码中无用的 console
  - 更新依赖 @babel/plugin-proposal-class-properties -> @babel/plugin-transform-class-properties
  - EventArgs 相关类型由 unknown 改为 any

- 框选插件重构与示例内容丰富

  - 完善部分类型定义
  - 框选插件示例内容丰富
  - 修复使用框选插件后，网页滚轮事件被阻塞的问题
  - 修复缩放后框选元素与鼠标位移不一致的问题（#1102）
  - 增加新事件 selection:selected-area，返回框选范围（#1104）
  - 优化框选工具在缩放时的边距与外边框宽度计算

- feat: 小地图插件重构与相关示例增加

  - 优化画布移动时，小地图的更新策略，减少性能消耗
  - 小地图显示区域计算逻辑修改，现在由画布元素与视口共同决定
  - 优化小地图预览视窗的拖拽交互
  - 修复点击小地图预览视窗会触发不可预期的画布移动的问题
  - 新增小地图插件的示例

- selection-select 插件中 disabled 默认设置为 true

  - 用于解决当用于 stopMoveGraph 设置为 true 且启用了 selection-select 插件时，插件状态默认开启的 bug
  - 更新 LICENSE 文件，格式化内容
  - 其它 demo 的一些样式更新

- 移除 extension 包中 examples 文件夹，已转移到 examples/feature-examples 项目中
- 完善core包与group插件的类型定义
- 完善与修正core包的部分类型定义

- minimap插件功能完善与相关示例丰富

  - 小地图中可选择是否渲染连线，支持初始化时设置或通过`setShowEdge`方法更新设置
  - 更完善的代码注释与类型定义
  - 现在，小地图默认将位于画布的右下角，保留`show`方法设置画布位置的功能，新增`updatePosition`方法用于更新小地图相对画布的决定定位
  - 在小地图等示例中增加了新增功能的演示（连线可选渲染与位置调整）

- 完善 BaseEdge 和 BaseNode 泛型类型，内置节点 props 定义更新

- 重构 LogicFlow.tsx 以及 GraphMode 代码，代码按功能分区管理

  - Fix typo -> fakerNode 重命名为 fakeNode，意指虚拟节点
  - 主要重构 LogicFlow.tsx 中代码: 将代码按 Register，Nodes，Edges，Element，Text，EditConfig，Graph，EventCenter，History 等分模块管理
  - 重构 LogicFlow 中 getPointByClient 方法，通过重载，支持多种类型参数
  - 重构 LogicFlow 中 focusOn 方法，通过重载，支持多种传参方式

- core包类型定义完善

- 小地图插件新增功能与示例丰富

  - 小地图插件现在支持设置关闭小地图时的回调，用于外部更新小地图的显示状态（#829）
  - 小地图插件示例增加与新增功能相关的内容

- extension包的类型定义修复

  - 修复 349252c 提交后，extension 包中的类型错误问题
  - 为 BaseNode 的范型设置默认类型

- 修复小地图的预览视窗无法拖拽的问题

- 小地图设置回调逻辑调整为抛出事件

  - 删除原有设置关闭时回调的逻辑
  - 现在小地图插件在关闭时会抛出事件 `miniMap:close`，可以通过 `lf.on()` 监听该事件来设置小地图关闭时的回调

- 事件系统的类型定义完善

- 将节点 Resize 功能内置

  - 新增 Control 组件，用于控制节点放大缩小，并在 BaseNodeModel 中增加 resize 方法
  - 更新 GitHub Actions 任务名
  - 重命名 allowRotation -> allowRotate；后续增加 allowResize 选项，保持命名一致性
  - circle/diamond/ellipse/polygon 等节点增加 resize 能力
  - 节点 model 中增加初始化时 properties 的保存，调试多边形节点 outline 不符合预期的问题

    - 解决resize 结束后节点重新定位的问题
      - Control.tsx 中 new StepDrag 参数中 step 传入 graphModel.gridSize，保证调整时拖拽以 gridSize 为步长移动

  - 完成自定义节点内置功能的开发

    - 移除目前系统中无用的 defaultTheme 和 defaultAnimation 文件
    - 通过 points 置原点并基于设定的 width 和 height 缩放的方法，解决多边形形状与边框定位异常的问题

  - 网格组件重构
    - 修正原有网格存在偏移的问题
    - 修正网格配置选项的类型声明
    - 由 Grid 类自行实现网格配置选项的初始化
    - 将Grid相关的类型声明与静态成员与方法移至命名空间
    - 修改点状网格中点的最大半径计算逻辑，并增加相关注释

- 修复 HtmlREsize 节点 outlineStyle fill 默认为 黑色的 bug
- 统一 NodeResize 中 getResizeOutlineStyle fill 和 stroke 的返回值
- 更新插件相关类型定义，完善插件相关方法 use/installPlugins/installPlugin 的功能

  - 解决插件中一些类型问题
  - 测试并修复 LogicFlow.use api 的功能 bug
  - 调整安装插件的顺序，如有重名默认优先使用 plugins 中定义的插件

- 重构项目中 basic shape 组件，修复功能 bug、完善类型定义

  - rename formateAnchorConnectValidateData - formatAnchorConnectValidateData
  - rename setHoverON -> setHoverOn, setHoverOFF -> setHoverOff
  - 修复 Text 文本节点，文本不在节点中间的显示 bug，通过设置 dominantBaseline: central 解决
  - TextNode getBackground 中 rectAttr 设置 y: y-1, 移除该设置

- 新增 common 文件夹用于存放通用方法

- 增加用户设置画布 100% ，在调整视窗时，画布大小同步更新的逻辑，优化体验

  - 优化初始化时设置画布大小的逻辑
  - 优化 DEMO 代码，解决设置 theme 未生效的 bug（ 代码问题。在初始化时 style 覆盖了 defaultConfig 中的 style）

- 支持导出节点中的网络图片

- 修复线的 menu 无法正常显示的 bug (#1679)

  - 修复初始化时 edgeConfig 中 type 未传值场景下，未使用 graphModel.edgeType(默认边类型) 初始化边的 bug

- 优化 snapshot 交互体验，内容居中且开启拖拽画布，调整菜单顺序
- 完善snapshot使用方式和修复跨域报错
- 修复画布拖动阻止滚动 (#1700)

- 新增Label文本模式, 支持配置多文本和修改文本朝向

  - graphModel 中增加 textMode 属性，用于标识当前使用什么文本模式
  - BaseNodeMode and BaseEdgeModel 以及 graphModel 中增加 更新 textMode 的方法
  - 更新 tool 中 props 名称，logicflow -> lf，便于理解
  - 增加 next-label demo
  - 重构 editConfigModel.ts，完善配置项优先级从 textEdit(全局) -> nodeTextEdit/edgeTextEdit(分类) -> 元素本身 editable
  - 项目中后续可以移除 useLabelText 的判断逻辑及相关的事件触发
  - 配置 tool 名称通过 短横线 隔开的方式命名， eg: text-edit-tool, multiple-select-tool
  - tool 增加 disableTool 和 enableTool 的方法，用于互斥 Tool 注册时，禁用掉另一个
  - 优化 mediumEditor 的配置项及初始化流程。移除无用配置项，增加默认主题样式
  - 开发 NextLabel 插件，取得阶段性胜利
  - 移除 BaseNodeModel 中 useLabelText 相关逻辑
  - node:mousemove 事件中抛出 deltaX、deltaY 数据
  - 调整 Control 的范围大小，解决调整大小时，鼠标离开区域后切换回默认鼠标样式，体验不好
  - 调整 NextLabel 代码逻辑，LabelModel 只做数据的存储，不做更新。用于传递 props。在 Label 中触发
  - element 数据更新，LabelOverlay 渲染，Label 更新
  - 增加 API，updateTextMode 可切换 textMode 并更新页面

  - 增加双击节点 or 边增加 Label 的功能

    - 可传入设置样式 设置 label
    - 富文本编辑内容无法同步到 content 的问题
    - 如果 properties 中没有 \_label 配置项时，MediumEditor 初始化有点问题，选中文本无法显示工具栏
    - 更新完Label content 后，Label 拖拽无效的问题（isDragging state 更新时机问题）

  - 完成 Label 溢出模式配置能力开发
  - 将 PluginsOptions 中插件对应的属性值 当 props 传入到插件的实例化中
  - label 的 textOverflowMode 增加 'ellipsis' | 'wrap' | 'clip' | 'nowrap' | 'default' 配置项
  - 更新 Label dragging 时，兼容画布存在缩放的情况
  - 完成 Label 在节点旋转时，保持位置不变，且 Label 自身跟阶段旋转角度保持一致
  - 完成节点缩放时，Label 保持相对位置不变
  - 增加 labelWidth 配置，可以统一项目中 labelWidth 的宽度，也可做单独个性化配置
  - 优化 node:resize 以及 node:rotate 事件抛出的数据
  - 移除或注释项目中无用的 console

  - 移植 Label 在边上定位 的相关代码，在调整节点更新边时，保持 Label 位置

    - 根据 PR 整理代码中 Text 和 Label 相关逻辑，移除无效代码
    - next-label 中增加 Edge 计算相关的逻辑

  - 同步节点的 zIndex 到 Label 上，过滤掉 text 为空时的 Label
  - 修复 rangy.createClassApplier is not a function 的错误
  - 修复 isMultiple 对于双击节点或边增加 label 无效的 bug

- 调整core包tool文件夹

  - 将 snapline 移出 tool 文件夹，因为它本身非 tool，放这里面会有误导
  - 优化 tool 文件夹，将 tool 内容移至 index 中，并更新项目中相关导入

- 新增 adjustEdgeStart 和 adjustEdgeEnd，可单独控制调整起始点或结束点

  - 支持cmd - 鼠标滚动操作放大缩小画布
  - 节点文本支样式持通过properties传入textStylele配置

- 重构 core 包中 properties 类型定义，通过泛型的方式约束其类型

  - 修复 node-selection 中 properties 未定义类型导致的报错

- 升级 group 插件为 dynamic-group 插件

  - 完成 dynamic-group 插件 isCollased 初始化及groupAddable 状态即时更新
  - 优化 editConfigModel 中属性的初始化逻辑及其初始化值调整
  - 调小 ResizeControl 的范围 30 -> 15，原因是会盖住 Group 折叠的小按钮
  - 优化允许文本拖动的逻辑判断 -> nodeTextDraggable && draggable 才可以允许拖动

  - 开发节点缩放旋转时，同步缩放 or 旋转节点内部元素功能

    - 完善 node:resize 及 node:rotate 事件抛出的数据
    - 将 Control 中 resize 相关的方法提取到 utils/resize.ts 中，方便在插件中直接调用
    - 在 group 组件中监听 node:resize 和 node:rotate 事件，完成对子元素的更新

  - 测试 SelectionSelct 与 DynamicGroup 不兼容的问题并修复

- 边支持传入自定义样式
- 优化高亮插件功能
- **Breaking Change**调整 pluginOptions 只传入插件对应的 options 数据（之前是全量传入）

All notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.2.28](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.24...@logicflow/core@1.2.28) (2024-07-29)

### Bug Fixes

- **core:** snap the text pos of cloneNode to grid([#1545](https://github.com/didi/LogicFlow/issues/1545)) ([dc661bd](https://github.com/didi/LogicFlow/commit/dc661bd1a01c740eb886da8a98142d02dacced2d))
- error when diamondNode's edge is dragging ([4978bf1](https://github.com/didi/LogicFlow/commit/4978bf12fde753b731a03341cc9b3c63253fcbaa))
- optimize the experience of resizeNode ([135a8e3](https://github.com/didi/LogicFlow/commit/135a8e3385799c3c9c98634ad0fecb0532377001))
- 修复使用框选插件会阻塞页面滚轮事件问题 ([5266822](https://github.com/didi/LogicFlow/commit/52668221b1570606efa6caace2f6f7ae4d2bf935))
- 更新readme logo & publish 1.2.25 ([4da3db7](https://github.com/didi/LogicFlow/commit/4da3db7aebc892e685269340ca38a0b9a4f68c56))
- 框选拖动折线时更新起终点位置 ([27ca25b](https://github.com/didi/LogicFlow/commit/27ca25b02014e9b8f742702b70c0389687a6f4d5))

## [1.2.27](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.24...@logicflow/core@1.2.27) (2024-05-06)

### Bug Fixes

- **core:** snap the text pos of cloneNode to grid([#1545](https://github.com/didi/LogicFlow/issues/1545)) ([dc661bd](https://github.com/didi/LogicFlow/commit/dc661bd1a01c740eb886da8a98142d02dacced2d))
- error when diamondNode's edge is dragging ([4978bf1](https://github.com/didi/LogicFlow/commit/4978bf12fde753b731a03341cc9b3c63253fcbaa))
- optimize the experience of resizeNode ([135a8e3](https://github.com/didi/LogicFlow/commit/135a8e3385799c3c9c98634ad0fecb0532377001))
- 更新readme logo & publish 1.2.25 ([4da3db7](https://github.com/didi/LogicFlow/commit/4da3db7aebc892e685269340ca38a0b9a4f68c56))
- 框选拖动折线时更新起终点位置 ([27ca25b](https://github.com/didi/LogicFlow/commit/27ca25b02014e9b8f742702b70c0389687a6f4d5))

## [1.2.26](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.24...@logicflow/core@1.2.26) (2024-04-10)

### Bug Fixes

- **core:** snap the text pos of cloneNode to grid([#1545](https://github.com/didi/LogicFlow/issues/1545)) ([dc661bd](https://github.com/didi/LogicFlow/commit/dc661bd1a01c740eb886da8a98142d02dacced2d))
- 更新readme logo & publish 1.2.25 ([4da3db7](https://github.com/didi/LogicFlow/commit/4da3db7aebc892e685269340ca38a0b9a4f68c56))
- 框选拖动折线时更新起终点位置 ([27ca25b](https://github.com/didi/LogicFlow/commit/27ca25b02014e9b8f742702b70c0389687a6f4d5))

## [1.2.25](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.24...@logicflow/core@1.2.25) (2024-04-03)

### Bug Fixes

- 框选拖动折线时更新起终点位置 ([ad3afe1](https://github.com/didi/LogicFlow/commit/ad3afe1b3de4c30e9acd5d19ea49d0cb7f04cfd1))

## [1.2.24](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.23...@logicflow/core@1.2.24) (2024-04-03)

### Bug Fixes

- 修复nuxt使用报错 ([f8f7da9](https://github.com/didi/LogicFlow/commit/f8f7da9f87a0239eea7913a7c979a54940d6bd91))
- 修复选区插件无法触发鼠标事件的问题，同时兼容 Ctrl + 滚轮事件 ([129f101](https://github.com/didi/LogicFlow/commit/129f101faf2c3aae3d25917eb68ccabadbb93ec3))
- 锚点连线失败增加默认错误提示 ([05ed811](https://github.com/didi/LogicFlow/commit/05ed811591bee08951a404c70b44acd0f0a39643))

## [1.2.23](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.22...@logicflow/core@1.2.23) (2024-03-20)

### Bug Fixes

- 优化代码 ([10d311d](https://github.com/didi/LogicFlow/commit/10d311db4a816784bafe4266737d5af656716b6b))
- 增加获取锚点关联边的能力&修复边的起终点移动时报错问题 ([543fff7](https://github.com/didi/LogicFlow/commit/543fff7c0a14ebe5b3b5ebf1c5df773c7e6a0dc5))

### Features

- 自定义连线支持指定锚点 ([d344d38](https://github.com/didi/LogicFlow/commit/d344d3801cbb0bcbcf699c0bf91e661c55d67890))

## [1.2.22](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.19...@logicflow/core@1.2.22) (2024-02-05)

### Features

- update @logicflow/core @logicflow/extension version to 1.2.21 ([55b865b](https://github.com/didi/LogicFlow/commit/55b865b381354a75b04d339fec2f10b34cd12738))

## [1.2.19](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.18...@logicflow/core@1.2.19) (2024-02-05)

### Bug Fixes

- **core:** types build error ([fb4bb27](https://github.com/didi/LogicFlow/commit/fb4bb27602ca4cb9bd0f085a7421dbfa6049e18e))
- 修复stopMoveGraph从true置为false后画布仍无法移动问题 ([37b5c4a](https://github.com/didi/LogicFlow/commit/37b5c4aced4cfb66040f563316c4206b5d26716f))
- 修复静默模式切换后快捷键和拖拽节点状态不更新问题 ([#1491](https://github.com/didi/LogicFlow/issues/1491)) ([926f33e](https://github.com/didi/LogicFlow/commit/926f33e3f79ca148c00723c627d209f21f38fc25))

### Features

- **core:** add test for core ([6780155](https://github.com/didi/LogicFlow/commit/67801556fc104a3e77c70f7016a56dbe17f52185))

## [1.2.18](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.17...@logicflow/core@1.2.18) (2023-11-22)

### Bug Fixes

- **core:** anchorId missed after point adjusting([#1365](https://github.com/didi/LogicFlow/issues/1365)) ([d7778cc](https://github.com/didi/LogicFlow/commit/d7778cc7632b3cd60afadc18a47c4df60b23a587))
- **core:** fix Cannot read property 'document' of undefined bug([#1433](https://github.com/didi/LogicFlow/issues/1433)) ([9e1a2c9](https://github.com/didi/LogicFlow/commit/9e1a2c957adb01610544da3ff09eef607d7c51f2))
- **core:** rename textInput ([1681484](https://github.com/didi/LogicFlow/commit/1681484bcef0ae8a7fb5d54e6cefcc45d6020f8e))
- **core:** zIndex problem in overlapMode([#1395](https://github.com/didi/LogicFlow/issues/1395)) ([ae41283](https://github.com/didi/LogicFlow/commit/ae412831c16b7c07e502852b0c00baa2b6d685db))
- **core:** 修复 overflowMode 为 autoWrap 时，节点设置 textWidth 无效的 bug([#1432](https://github.com/didi/LogicFlow/issues/1432)) ([fa1cbc7](https://github.com/didi/LogicFlow/commit/fa1cbc7a4e2a4bb12b8c34997aaedd6f9bc552be))
- prevent node without anchors using InsertNodeInPolyline([#1077](https://github.com/didi/LogicFlow/issues/1077)) ([6e10d3a](https://github.com/didi/LogicFlow/commit/6e10d3ad6e5b26daa6cad865bbca0eb326dfd54b))

### Features

- **core:** enable lf-text-input style setting([#1390](https://github.com/didi/LogicFlow/issues/1390)) ([8a8a0f9](https://github.com/didi/LogicFlow/commit/8a8a0f937e4428c0a811b4cc8102c03fec568653))

## [1.2.17](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.16...@logicflow/core@1.2.17) (2023-10-25)

### Bug Fixes

- **core:** refresh the value of model when mouse down([#1370](https://github.com/didi/LogicFlow/issues/1370)) ([1cb45dd](https://github.com/didi/LogicFlow/commit/1cb45ddbbfdc0a0c8fd9e427d9a8dad0ad51eda9))
- **core:** use mobx reaction to track the value of stepDrag.model([#1370](https://github.com/didi/LogicFlow/issues/1370)) ([a1e3bc3](https://github.com/didi/LogicFlow/commit/a1e3bc3294b49edea4f1ac41886db6f3e1f3b45b))

## [1.2.16](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.15...@logicflow/core@1.2.16) (2023-10-19)

### Bug Fixes

- add edge copying when copying a group([#1346](https://github.com/didi/LogicFlow/issues/1346)) ([f53ec7f](https://github.com/didi/LogicFlow/commit/f53ec7f8eea1b9e1357e3dc21d509695e857bb3b))
- **core:** filter NaN cases in getVirtualRectSize ([045e80b](https://github.com/didi/LogicFlow/commit/045e80beba32d14efae4c32ae215b5eb1fde096c))
- **core:** restore rotation ([2748c17](https://github.com/didi/LogicFlow/commit/2748c177660e9b0849631750a1a68af50dd96781))
- **extension:** bug of menu initialization ([#1359](https://github.com/didi/LogicFlow/issues/1359)) ([fabd8d7](https://github.com/didi/LogicFlow/commit/fabd8d74cf998e6118499d3ddc49841ad5411480))

### Features

- anchor dragend事件参数增加edgeModel ([7b8a0ab](https://github.com/didi/LogicFlow/commit/7b8a0ab8045457ec212322a1d0e1dc265fb87954))
- **core:** implement custom path for connecting ([492a412](https://github.com/didi/LogicFlow/commit/492a41201faaaee84b3b0ae734763b4d5e4a2a37))
- **extension:** override addElements to support group-node copy([#1346](https://github.com/didi/LogicFlow/issues/1346)) ([e9d0139](https://github.com/didi/LogicFlow/commit/e9d0139da4446ec4451ba7c2516a1e440a951fec))

## [1.2.15](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.14...@logicflow/core@1.2.15) (2023-09-21)

### Bug Fixes

- **core:** wrong extreme value of draggable range ([46c3ce9](https://github.com/didi/LogicFlow/commit/46c3ce9e238cc849025792dcd9083431fcf61a81))

### Features

- **core:** add draggable range for graph([#1337](https://github.com/didi/LogicFlow/issues/1337)) ([ecc59bc](https://github.com/didi/LogicFlow/commit/ecc59bccb07e23fbe11986d5b38f5a5e99f4b4f1))

## [1.2.14](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.13...@logicflow/core@1.2.14) (2023-09-11)

### Features

- **core:** enable node rotation ([267ebc8](https://github.com/didi/LogicFlow/commit/267ebc8ff65f461c831fc631b89028ca98305858))
- **core:** optimize the using of matrix ([d13fc5c](https://github.com/didi/LogicFlow/commit/d13fc5c50dcc25727ca8646ea1afe9a250d444d5))
- **core:** trigger edge:adjust when adjusting bezier([#947](https://github.com/didi/LogicFlow/issues/947)) ([ad993c4](https://github.com/didi/LogicFlow/commit/ad993c448c004623e32f9534b3971cdf9d8e47bd))

## [1.2.13](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.12...@logicflow/core@1.2.13) (2023-09-08)

### Features

- **core:** add a new function to set outer g attributes.([#880](https://github.com/didi/LogicFlow/issues/880)) ([90aaccd](https://github.com/didi/LogicFlow/commit/90aaccdb87309b4cdad2691ed425cb16732d746c))
- **core:** export egde utils and sampling utils ([9a83d4a](https://github.com/didi/LogicFlow/commit/9a83d4a360c8a113bce46370aecac8e0a2ffb6ea))

## [1.2.12](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.11...@logicflow/core@1.2.12) (2023-08-16)

### Bug Fixes

- add a symbol to distinguish plugin registration method ([1e0a40a](https://github.com/didi/LogicFlow/commit/1e0a40a94f4f6ebeb584445c48dd10b13ee7504f))

### Features

- optimize BPMNAdapter; add input props when register plugin ([4e9a90e](https://github.com/didi/LogicFlow/commit/4e9a90ea2abedee1456119edf0f0c9164e8cc116))

## [1.2.11](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.10...@logicflow/core@1.2.11) (2023-08-10)

### Bug Fixes

- **core:** improve the appearance of Bezier curve arrows.([#951](https://github.com/didi/LogicFlow/issues/951)) ([d631e74](https://github.com/didi/LogicFlow/commit/d631e74bd06bbe4d6e749e2563ef5de2bb760a8b))

### Features

- create logicflow eninge ([c7d80f4](https://github.com/didi/LogicFlow/commit/c7d80f4b4c19cf82af9be49dd8fd44433327db58))

## [1.2.10](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.9...@logicflow/core@1.2.10) (2023-07-17)

**Note:** Version bump only for package @logicflow/core

## [1.2.9](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.8...@logicflow/core@1.2.9) (2023-06-21)

### Bug Fixes

- **core:** compute the first point direction of the rectangular polyline using the original width and height([#817](https://github.com/didi/LogicFlow/issues/817)) ([7a0a8ee](https://github.com/didi/LogicFlow/commit/7a0a8eedd24bc0aabb742c54c8e9671ccfd270a6))
- **core:** fix the background width of the text on the side is not displayed correctly in ellipsis mode([#1151](https://github.com/didi/LogicFlow/issues/1151)) ([b1e0380](https://github.com/didi/LogicFlow/commit/b1e03806b5d3d4156ac601a6c318639141768d9f))
- **core:** moveNodes() add the logic of the moveNode function to calculate the moving distance of the side text ([a89b630](https://github.com/didi/LogicFlow/commit/a89b6301a2355f7ced957d446721a697259b68c0))
- **core:** prevent isSilentMode=true from calling repeatedly([#1180](https://github.com/didi/LogicFlow/issues/1180)) ([d8a8f5a](https://github.com/didi/LogicFlow/commit/d8a8f5a18b237d994256dc6acc09daef281ca595))

## [1.2.8](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.6...@logicflow/core@1.2.8) (2023-05-30)

### Bug Fixes

- adjust edge cause text error when delete connected node ([9e0ac91](https://github.com/didi/LogicFlow/commit/9e0ac916ff0e932d7a03b3ca165a76c49453926a))
- fix the issue of getStartArrow not working.(didi[#1167](https://github.com/didi/LogicFlow/issues/1167)) ([691ed40](https://github.com/didi/LogicFlow/commit/691ed40465d3e3a0dfedc06064dd8df6f7c03e06))
- node:dnd-add event throwing parameter add mouse:event([#1170](https://github.com/didi/LogicFlow/issues/1170)) ([0b9f22d](https://github.com/didi/LogicFlow/commit/0b9f22d67a43eb396bb7a2ce0e0d04d2a44cb05f))
- remove unnecessary code ([e819c62](https://github.com/didi/LogicFlow/commit/e819c62628d361ed8be13f28755ce5122d2f7d3d))

## [1.2.6](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.5...@logicflow/core@1.2.6) (2023-05-13)

### Bug Fixes

- add input of convertLf2ProcessData ([a13ef07](https://github.com/didi/LogicFlow/commit/a13ef07023d7dc72f901193596de1a0e6332f376))
- add optional input of adpaterOut in class LogicFlow ([ff0f23e](https://github.com/didi/LogicFlow/commit/ff0f23edeef5436bad1e16cceb2c7c0698be3e06))
- keep use JSON.parse format input data.([#1153](https://github.com/didi/LogicFlow/issues/1153)) ([684a581](https://github.com/didi/LogicFlow/commit/684a5812eddc0c108a2f5c88ea971889f9371e22))
- 处理没有文本鼠标hover报错的问题 ([7b174f8](https://github.com/didi/LogicFlow/commit/7b174f8d717ff6077572e3527cb50348bed1f93d))

### Features

- support undefined as render param ([3577a15](https://github.com/didi/LogicFlow/commit/3577a15c109f4637dd2c8d4b6a35a155dc092fea))

## [1.2.5](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.3...@logicflow/core@1.2.5) (2023-05-03)

### Bug Fixes

- add new id to nodesMap in changeNodeId api ([8c4fee6](https://github.com/didi/LogicFlow/commit/8c4fee6751cc9113a27497aeaddc8400cc560c89))
- can not edit text when delete all text([#1067](https://github.com/didi/LogicFlow/issues/1067)) ([b01e4b9](https://github.com/didi/LogicFlow/commit/b01e4b92d8fd0d8f252c6dd81ca2d590821d591a))
- destory keyboard events while destoty LogicFlow.([#1110](https://github.com/didi/LogicFlow/issues/1110)) ([98e749c](https://github.com/didi/LogicFlow/commit/98e749c9c7849ea3f046705ac4fcb4b60d251629))
- fix ts's type bug ([93146ae](https://github.com/didi/LogicFlow/commit/93146aeb976ad4a5e849957c971dfefbcf17c44e))
- folded icon not working when overflowMode is set to ellipsis([#1099](https://github.com/didi/LogicFlow/issues/1099)) ([cc82b6d](https://github.com/didi/LogicFlow/commit/cc82b6d6762e377ba15293e9a59bc50bc584cdf4))
- getNodeDataById error handing for incorrect nodeId parameter ([8d74393](https://github.com/didi/LogicFlow/commit/8d74393f6c39bc23c4df29a8d6e69c33afdba26f))
- isolate mobx ([ff6c24f](https://github.com/didi/LogicFlow/commit/ff6c24ff838bafa5196e9d1046049984d9c120a7))
- observable object cannot appear twice([#837](https://github.com/didi/LogicFlow/issues/837)) ([16f338f](https://github.com/didi/LogicFlow/commit/16f338fe8df7a1cce546f5f5fa07b90864b902f4))
- set orient to auto while start point and end point is null ([3d55703](https://github.com/didi/LogicFlow/commit/3d55703ec46e7986e9a9968e65a50849d51d1ff0))

### Features

- optimize the local development process ([1e188be](https://github.com/didi/LogicFlow/commit/1e188be57f59bb35ee90740ae5b0a835e29e7d0a))
- support move selected nodes when disabled multipleSelect.([#894](https://github.com/didi/LogicFlow/issues/894)) ([5a97bcc](https://github.com/didi/LogicFlow/commit/5a97bcc098a15a472b0d63d62c6396cd3f8b05dd))
- the end marker of cubic bezier curve with light deflection ([cca4040](https://github.com/didi/LogicFlow/commit/cca4040d47b9fd7434308101b7533f428aeb1150))
- use deepclone instead of json parse([#304](https://github.com/didi/LogicFlow/issues/304)) ([502abde](https://github.com/didi/LogicFlow/commit/502abde9155c692f95e0de9c8e9171806de29701))

## [1.2.4](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.3...@logicflow/core@1.2.4) (2023-04-10)

### Bug Fixes

- observable object cannot appear twice([#837](https://github.com/didi/LogicFlow/issues/837)) ([16f338f](https://github.com/didi/LogicFlow/commit/16f338fe8df7a1cce546f5f5fa07b90864b902f4))

### Features

- optimize the local development process ([1e188be](https://github.com/didi/LogicFlow/commit/1e188be57f59bb35ee90740ae5b0a835e29e7d0a))
- use deepclone instead of json parse([#304](https://github.com/didi/LogicFlow/issues/304)) ([502abde](https://github.com/didi/LogicFlow/commit/502abde9155c692f95e0de9c8e9171806de29701))

## [1.2.3](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.2...@logicflow/core@1.2.3) (2023-03-25)

### Bug Fixes

- update edge path while move nodes([#1027](https://github.com/didi/LogicFlow/issues/1027)) ([9179b62](https://github.com/didi/LogicFlow/commit/9179b621018c51f60f5f12458cd1c487e50b4d63))

## [1.2.2](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.0...@logicflow/core@1.2.2) (2023-03-25)

### Bug Fixes

- keep the default browser reaction.([#1046](https://github.com/didi/LogicFlow/issues/1046)) ([533f747](https://github.com/didi/LogicFlow/commit/533f7477eccd2c48290d7550ad17f5487eca21e6))
- remove shape attributes from theme types.([#1052](https://github.com/didi/LogicFlow/issues/1052)) ([5a315a2](https://github.com/didi/LogicFlow/commit/5a315a2bfbe3a43ecdc2d558da1c3695a32ab342))
- update logicflow site url ([8774efe](https://github.com/didi/LogicFlow/commit/8774efe5eb8411819e1a44f8c4698111f6fb6ea5))

## [1.2.1](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.0...@logicflow/core@1.2.1) (2023-03-14)

**Note:** Version bump only for package @logicflow/core

# [1.2.0](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.0-next.5...@logicflow/core@1.2.0) (2023-03-13)

### Bug Fixes

- trigger extension render in difference env ([9be1f58](https://github.com/didi/LogicFlow/commit/9be1f58a3768fd48117e1143939c8a92f61191dc))

# [1.2.0-next.5](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.0-next.4...@logicflow/core@1.2.0-next.5) (2023-03-10)

### Bug Fixes

- compatiable witch React.StrictMode ([7da8266](https://github.com/didi/LogicFlow/commit/7da82668f2179b0be19fc9c425dd3bbcc15efd7f))
- 修复getData时出现报错的情况 ([12cbb06](https://github.com/didi/LogicFlow/commit/12cbb06ef3e45e76ea70a3d8128df66f5e47cd56))
- 修复初始化节点的时候不传入id导致箭头不显示的问题 ([dfff4cd](https://github.com/didi/LogicFlow/commit/dfff4cd1cf466ae881d297ed9785ef59ad65619a))

# [1.2.0-next.4](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.0-next.3...@logicflow/core@1.2.0-next.4) (2023-02-22)

**Note:** Version bump only for package @logicflow/core

# [1.2.0-next.3](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.0-next.2...@logicflow/core@1.2.0-next.3) (2023-02-13)

### Bug Fixes

- 修复边的isHoverd失效问题 ([0ebd6b6](https://github.com/didi/LogicFlow/commit/0ebd6b6218fc3225b918c2cb657d89b933537a75))

# [1.2.0-next.2](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.31...@logicflow/core@1.2.0-next.2) (2023-01-13)

### Bug Fixes

- getEndAnchor ([0f4e843](https://github.com/didi/LogicFlow/commit/0f4e843370351014a817b2dc07f9e8e6af581921))
- twoPointDistance无法获取target参数 ([c760a29](https://github.com/didi/LogicFlow/commit/c760a29abfe2acd76a6f276976451cc827215e95))
- typos ([ee9f3cd](https://github.com/didi/LogicFlow/commit/ee9f3cd40a819b13887938bf5e6018f77e575917))

### Features

- Modify the addNode event type ([122f42c](https://github.com/didi/LogicFlow/commit/122f42c06af5038e250418e5be6b65805050b902))
- node model增加getTaretAnchor方法获取手动连接边到节点时需要连接的锚点(默认返回距离目标位置最近的锚点) ([dfa0421](https://github.com/didi/LogicFlow/commit/dfa04212f6fe0bc5d8b3adfcb90827c1a770a336))
- 增加本文溢出省略时鼠标移动到文本tip显示全文 ([f14897a](https://github.com/didi/LogicFlow/commit/f14897a076c5ef75f1a7e9f05746bb44f75e92d0))
- **core&extension:** add pluginOptions attribute on lf instance ([47cd816](https://github.com/didi/LogicFlow/commit/47cd81647532a724456b191d0050f87e833cb968))

## [1.1.31](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.30...@logicflow/core@1.1.31) (2022-11-12)

# [1.2.0-next.1](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.2.0-next.0...@logicflow/core@1.2.0-next.1) (2022-10-10)

### Features

- separate select and setZindex behavior ([53d0293](https://github.com/didi/LogicFlow/commit/53d029317eea3161d63f4837ddea66b845a8e274))

# [1.2.0-next.0](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.29...@logicflow/core@1.2.0-next.0) (2022-09-29)

### Bug Fixes

- **core:** fix the arrow position and getArrow type,fixes [#851](https://github.com/didi/LogicFlow/issues/851) ([10eebe2](https://github.com/didi/LogicFlow/commit/10eebe2cba13c308c4e4a411c4561e58446723ea))

### Features

- add event parameter for node:dnd-add event ([35466b1](https://github.com/didi/LogicFlow/commit/35466b1801aae0783b8ae6b6d16e4a60bb4f6c31))
- allow use ctrl key to select multiple elements ([e46a2d2](https://github.com/didi/LogicFlow/commit/e46a2d25304f751fd0ee74722bed9f81b478003b))

## [1.1.30](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.29...@logicflow/core@1.1.30) (2022-10-30)

### Bug Fixes

- 处理折线没拖拽成直线后继续拖到报错的问题 ([8e1bf3f](https://github.com/didi/LogicFlow/commit/8e1bf3f9e0c80020bb0c4feffd26bcac70f73c89))
- keep GroupNode in bottom when select node ([9e3086a](https://github.com/didi/LogicFlow/commit/9e3086a3d5faac116c10ea3dc9ac6796b686ed24))

### Features

- keep typo ([3a017c8](https://github.com/didi/LogicFlow/commit/3a017c8855d66cb444388267de6c090bc0fb0c89))
- set selected element zindex 9999 instead of always front ([b8a2708](https://github.com/didi/LogicFlow/commit/b8a27085e7a86f3d6d8d654447d3c1d4116e5f16))

## [1.1.29](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.28...@logicflow/core@1.1.29) (2022-09-24)

### Bug Fixes

- Fix typo: currrentProperties -> currentProperties ([71650b7](https://github.com/didi/LogicFlow/commit/71650b7c51d1ffd9c8b828f26ad2189e3b9cb7a4))
- Fix typo: getBackgroud -> getBackground ([3ea0c36](https://github.com/didi/LogicFlow/commit/3ea0c369747b75b321a95b22af75d2afc07b9c7a))
- Fix typo: getCorssPointOfLine -> getCrossPointOfLine ([a2c44b0](https://github.com/didi/LogicFlow/commit/a2c44b09518f089df98eec711ea9b51f8351ac24))

### Features

- update turbo plugin ([ed512ca](https://github.com/didi/LogicFlow/commit/ed512ca21d21829cd7c114140b006964fc4090e4))

## [1.1.28](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.27...@logicflow/core@1.1.28) (2022-09-17)

### Features

- add api delete node and edge property ([9a7c729](https://github.com/didi/LogicFlow/commit/9a7c729c463f5de555d102aa8d22341adf9b3db7))

## [1.1.27](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.26...@logicflow/core@1.1.27) (2022-09-13)

**Note:** Version bump only for package @logicflow/core

## [1.1.26](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.25...@logicflow/core@1.1.26) (2022-08-27)

### Bug Fixes

- 修正 BaseEdgeModel 构造函数属性初始化顺序 ([b4f8f3a](https://github.com/didi/LogicFlow/commit/b4f8f3a0066f6cb0b95c79c4b5febbcf833a7386))

### Features

- 增加 edgeGenerator 选项, 可自定义连边规则 ([a9aff50](https://github.com/didi/LogicFlow/commit/a9aff50b87559c9549d2eb6943797a75e09d62a3))

## [1.1.25](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.24...@logicflow/core@1.1.25) (2022-08-21)

### Features

- group add isAllowAppendIn to support pick node append in group ([e54f798](https://github.com/didi/LogicFlow/commit/e54f79845996e763098cb5749100c76063160023))

## [1.1.24](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.23...@logicflow/core@1.1.24) (2022-08-11)

**Note:** Version bump only for package @logicflow/core

## [1.1.23](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.22...@logicflow/core@1.1.23) (2022-08-04)

**Note:** Version bump only for package @logicflow/core

## [1.1.22](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.21...@logicflow/core@1.1.22) (2022-07-13)

**Note:** Version bump only for package @logicflow/core

## [1.1.21](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.20...@logicflow/core@1.1.21) (2022-07-02)

### Bug Fixes

- 处理mini大小错误的问题 ([8ef7619](https://github.com/didi/LogicFlow/commit/8ef7619e8f994b9cee2b2544fd3f5bae9f8c0c57))
- 修复节点无法拖动的问题 ([f6caac9](https://github.com/didi/LogicFlow/commit/f6caac9eebaaf9146ed07d26705befd8c8b71298))

## [1.1.20](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.19...@logicflow/core@1.1.20) (2022-06-08)

### Bug Fixes

- edge:mouseenter trigger twice ([2b4e80a](https://github.com/didi/LogicFlow/commit/2b4e80a14ab21b47e7f6d0bc774006b244450a5c))
- foreignObject support style ([92e37f4](https://github.com/didi/LogicFlow/commit/92e37f403c93b48a612e97c73ffdcf374b5287c8))

### Features

- add highlight plugin ([8081f91](https://github.com/didi/LogicFlow/commit/8081f91c448d4ed204f517a555af59c13bbde55f))

## [1.1.19](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.18...@logicflow/core@1.1.19) (2022-06-01)

### Features

- arrow marker, fixes [#637](https://github.com/didi/LogicFlow/issues/637) ([98720b9](https://github.com/didi/LogicFlow/commit/98720b944fd17f343ecf7ec59a5f1d0e79b59a4d))

## [1.1.18](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.17...@logicflow/core@1.1.18) (2022-05-23)

**Note:** Version bump only for package @logicflow/core

## [1.1.17](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.16...@logicflow/core@1.1.17) (2022-05-23)

**Note:** Version bump only for package @logicflow/core

## [1.1.16](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.14...@logicflow/core@1.1.16) (2022-05-18)

### Bug Fixes

- remove unnecessary object ([fa6ad3f](https://github.com/didi/LogicFlow/commit/fa6ad3ff2c36a9a7979e03eb89ba2ca8c66b8a0b))

### Features

- add lf-node-select className to node when it is selected ([ce8f6ae](https://github.com/didi/LogicFlow/commit/ce8f6ae4f284de9896c3a0dc4791804b5bb7d23e))
- lf-edge-select className to edge when it is selected ([6c5c301](https://github.com/didi/LogicFlow/commit/6c5c3015913a6a148c09f621873b539a3bb282c0))
- setting horizontal and vertical offset separately for fitView ([37c464c](https://github.com/didi/LogicFlow/commit/37c464c1bb4539275e87c62e8c7e2d6701df742b))
- support edge animation ([d66edec](https://github.com/didi/LogicFlow/commit/d66edec3c834a13242446d26cf0ac630f24495e5))
- support wrapPadding for edge text which overflowMode is't autoWrap ([f5cc079](https://github.com/didi/LogicFlow/commit/f5cc0792dd9232dd0331312a2358519a96a9a278))
- triger anchor-drop event when edge created ([4b355c2](https://github.com/didi/LogicFlow/commit/4b355c2361134fb85bce23b1d660f15b1476ce80))

## [1.1.15](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.14...@logicflow/core@1.1.15) (2022-05-07)

### Bug Fixes

- remove unnecessary object ([b0b7507](https://github.com/didi/LogicFlow/commit/b0b7507443d5c8dd0d133bd109d26f036a1a945a))

### Features

- add lf-node-select className to node when it is selected ([ce8f6ae](https://github.com/didi/LogicFlow/commit/ce8f6ae4f284de9896c3a0dc4791804b5bb7d23e))
- lf-edge-select className to edge when it is selected ([6c5c301](https://github.com/didi/LogicFlow/commit/6c5c3015913a6a148c09f621873b539a3bb282c0))
- setting horizontal and vertical offset separately for fitView ([37c464c](https://github.com/didi/LogicFlow/commit/37c464c1bb4539275e87c62e8c7e2d6701df742b))
- support edge animation ([d66edec](https://github.com/didi/LogicFlow/commit/d66edec3c834a13242446d26cf0ac630f24495e5))
- support wrapPadding for edge text which overflowMode is't autoWrap ([f5cc079](https://github.com/didi/LogicFlow/commit/f5cc0792dd9232dd0331312a2358519a96a9a278))

## [1.1.14](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.13...@logicflow/core@1.1.14) (2022-04-22)

**Note:** Version bump only for package @logicflow/core

## [1.1.13](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.12...@logicflow/core@1.1.13) (2022-04-16)

### Features

- add useGlobalRules and customCssRules property ([88dadb8](https://github.com/didi/LogicFlow/commit/88dadb8e2c96d9f7ee4d4c286a6aa42c8941baaf))

## [1.1.12](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.12-alpha.0...@logicflow/core@1.1.12) (2022-04-13)

**Note:** Version bump only for package @logicflow/core

## [1.1.12-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.11...@logicflow/core@1.1.12-alpha.0) (2022-04-09)

### Bug Fixes

- cannot move node while width and height value is zero ([39238a2](https://github.com/didi/LogicFlow/commit/39238a27b741c7367b7a94c760d4083a2103239d))

### Features

- add api renderRawData ([07b3d80](https://github.com/didi/LogicFlow/commit/07b3d806052428a9d2edf66db2db7e0938ce010e))

## [1.1.11](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.10...@logicflow/core@1.1.11) (2022-03-29)

**Note:** Version bump only for package @logicflow/core

## [1.1.10](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.9...@logicflow/core@1.1.10) (2022-03-29)

**Note:** Version bump only for package @logicflow/core

## [1.1.9](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.9-alpha.1...@logicflow/core@1.1.9) (2022-03-26)

**Note:** Version bump only for package @logicflow/core

## [1.1.9-alpha.1](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.9-alpha.0...@logicflow/core@1.1.9-alpha.1) (2022-03-26)

### Features

- optimize move group children behavior ([d492f20](https://github.com/didi/LogicFlow/commit/d492f20a7205c81a709f7a151b9127a2709d81a4))
- optimize move node behavior ([d0e4e85](https://github.com/didi/LogicFlow/commit/d0e4e856cf58e92a98e309cdd698724bc1163295))

## [1.1.9-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.8-alpha.0...@logicflow/core@1.1.9-alpha.0) (2022-03-25)

### Bug Fixes

- 修复新增分组子节点未被记录的问题 ([24d9fc9](https://github.com/didi/LogicFlow/commit/24d9fc9d056f34141520da4a3f9482fe031ec325))

### Features

- optimize anchor line dragging behavior while near graph boundary ([0d798cc](https://github.com/didi/LogicFlow/commit/0d798ccbde91bae734e7b655d85709435626cb42))
- remove html demo ([a744bb2](https://github.com/didi/LogicFlow/commit/a744bb2a20d1e6fd6f7ea3b1269a9a45211501ad))

## [1.1.8](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.8-alpha.0...@logicflow/core@1.1.8) (2022-03-25)

### Bug Fixes

- 修复新增分组子节点未被记录的问题 ([24d9fc9](https://github.com/didi/LogicFlow/commit/24d9fc9d056f34141520da4a3f9482fe031ec325))

### Features

- optimize anchor line dragging behavior while near graph boundary ([0d798cc](https://github.com/didi/LogicFlow/commit/0d798ccbde91bae734e7b655d85709435626cb42))

## [1.1.8-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.7-alpha.0...@logicflow/core@1.1.8-alpha.0) (2022-03-25)

### Bug Fixes

- 修复了`group`插件在多个`group`节点一起被折叠报错的问题。 ([396736e](https://github.com/didi/LogicFlow/commit/396736e07c320985f7c779b272085ba1f66f1083))
- group undo cannot fold ([5860d7e](https://github.com/didi/LogicFlow/commit/5860d7ef4770f655fab1bb5ee6114dc63757b725))

### Features

- 调整translateCenter方法的挂载对象 ([d10a526](https://github.com/didi/LogicFlow/commit/d10a5263c1c922ee0b0356c01dde248dec6fe5d0))
- 画布居中代码优化 ([d06b162](https://github.com/didi/LogicFlow/commit/d06b16296c0e655c93f6e6670f09156c89c7204e))
- 优化画布图形居中虚拟矩形的计算规则，新增适应屏幕大小功能 ([e0c0ea1](https://github.com/didi/LogicFlow/commit/e0c0ea15f4962ca9502606fec6ddc070d65c78a7))
- 支持画布整体居中 ([39b1532](https://github.com/didi/LogicFlow/commit/39b15324bb978b2842f6638a9fa0626621910323))
- add node resize maxwidth and maxheight ([e98f575](https://github.com/didi/LogicFlow/commit/e98f575d19c5c7c9a74c7ad3302c1a8cb02bd5e3))
- add vue3 example ([9969b97](https://github.com/didi/LogicFlow/commit/9969b978d93ce863901d364bc5f01a9b9f6db269))
- optimize drag node behavior ([f88042d](https://github.com/didi/LogicFlow/commit/f88042d5623a0983003bd70098b4e0c12ba60d3d))

## [1.1.7](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.7-alpha.0...@logicflow/core@1.1.7) (2022-03-07)

**Note:** Version bump only for package @logicflow/core

## [1.1.7-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.6...@logicflow/core@1.1.7-alpha.0) (2022-03-03)

### Bug Fixes

- click node cancel edit text ([a514665](https://github.com/didi/LogicFlow/commit/a5146652b78d665d7058b7d810a26af07659ca43))

### Features

- add getAnchorShape function which allow rewrite anchor shape ([e5a7d77](https://github.com/didi/LogicFlow/commit/e5a7d77b898c93ece38e28fbdbef443ec8d23fcc))

## [1.1.6](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.5...@logicflow/core@1.1.6) (2022-03-02)

**Note:** Version bump only for package @logicflow/core

## [1.1.5](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.4...@logicflow/core@1.1.5) (2022-03-02)

### Bug Fixes

- change strokeDasharray type from array to string ([dd9d42e](https://github.com/didi/LogicFlow/commit/dd9d42ed26da46558592124533954f23b28aade2))
- edge animation demo ([e8895cc](https://github.com/didi/LogicFlow/commit/e8895cc230fccf007638db2cdfd79b25f7cba1b9))
- trigger dragstart when dragging ([5ff04c8](https://github.com/didi/LogicFlow/commit/5ff04c807364a03554135d57c49b4f181b6f2414))

### Features

- anchor add event api ([4309b81](https://github.com/didi/LogicFlow/commit/4309b81902280f0dacb7fb169b6b9c34f06de3f7))
- support animation ([c58c147](https://github.com/didi/LogicFlow/commit/c58c147c172901604834dda1a0dbb62a5f653579))

## [1.1.4](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.3...@logicflow/core@1.1.4) (2022-02-23)

### Bug Fixes

- change node state to default when create edge success ([9f57894](https://github.com/didi/LogicFlow/commit/9f57894034c9b6d86323e93d22a1185fe433843c))
- editConfigModel add isSilentMode ([8fcd571](https://github.com/didi/LogicFlow/commit/8fcd57143ccf1055a2c176ef417d7498ef178694))

### Features

- node model add incoming & outgoing ([8cf1469](https://github.com/didi/LogicFlow/commit/8cf14690b3c8378b11e5028700539a8fdb12bee1))
- update docs ([c60d9d7](https://github.com/didi/LogicFlow/commit/c60d9d75f167ac32d871810ef2c5f7dbc5403462))

## [1.1.3](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.3-alpha.0...@logicflow/core@1.1.3) (2022-02-18)

### Bug Fixes

- stop edit text when input enter + alt ([438daec](https://github.com/didi/LogicFlow/commit/438daec1de3378f25b245feda8a71bead6c96ba8))

## [1.1.3-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.1...@logicflow/core@1.1.3-alpha.0) (2022-02-18)

**Note:** Version bump only for package @logicflow/core

## [1.1.1](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.0...@logicflow/core@1.1.1) (2022-02-10)

### Features

- check width and height type ([141c667](https://github.com/didi/LogicFlow/commit/141c6678503870a9d7503864353ad6cc7493fd24))

# [1.1.0](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.0-alpha.7...@logicflow/core@1.1.0) (2022-02-09)

**Note:** Version bump only for package @logicflow/core

# [1.1.0-alpha.7](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.0-alpha.6...@logicflow/core@1.1.0-alpha.7) (2022-02-09)

**Note:** Version bump only for package @logicflow/core

# [1.1.0-alpha.6](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.0-alpha.4...@logicflow/core@1.1.0-alpha.6) (2022-01-27)

**Note:** Version bump only for package @logicflow/core

# [1.1.0-alpha.4](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.0-alpha.2...@logicflow/core@1.1.0-alpha.4) (2022-01-27)

### Bug Fixes

- use autoToFront property take node to front ([3a8a7cc](https://github.com/didi/LogicFlow/commit/3a8a7cc6a981f53837f8774aa3130b7e6d5593b9))

### Features

- add attribute visible to element ([4676427](https://github.com/didi/LogicFlow/commit/46764279f6667354b1d67186e0f131f764c3eb79))
- add getModelById & getDataById ([ad8d4e6](https://github.com/didi/LogicFlow/commit/ad8d4e62ff781914017ce478fa07ccdb36f0fe75))
- add graph:rendered event ([a3838c3](https://github.com/didi/LogicFlow/commit/a3838c385328bc9e3a41e39c555736d5f59de573))
- add group hook ([a955e7c](https://github.com/didi/LogicFlow/commit/a955e7ca151e0dd547a3995bbfed42e68f25183a))
- group support fold ([c1d8c10](https://github.com/didi/LogicFlow/commit/c1d8c109b25a3145c8c6858c4b6b5f0b6bf072ba))
- group support resize ([d9e2403](https://github.com/didi/LogicFlow/commit/d9e2403e00bce05c65d4d5b018ac3e2b9072cecd))

# [1.1.0-alpha.2](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.0-alpha.1...@logicflow/core@1.1.0-alpha.2) (2022-01-21)

**Note:** Version bump only for package @logicflow/core

# [1.1.0-alpha.1](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.1.0-alpha.0...@logicflow/core@1.1.0-alpha.1) (2022-01-21)

**Note:** Version bump only for package @logicflow/core

# [1.1.0-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.0.7...@logicflow/core@1.1.0-alpha.0) (2022-01-20)

**Note:** Version bump only for package @logicflow/core

## [1.0.7](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.0.7-alpha.1...@logicflow/core@1.0.7) (2022-01-18)

**Note:** Version bump only for package @logicflow/core

## [1.0.7-alpha.1](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.0.7-alpha.0...@logicflow/core@1.0.7-alpha.1) (2022-01-18)

### Bug Fixes

- addEdge return edgeModel ([e91f995](https://github.com/didi/LogicFlow/commit/e91f99502a9f7bafcf93e4aac1f32dfc3fb0a603))

## [1.0.7-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.0.4...@logicflow/core@1.0.7-alpha.0) (2022-01-18)

### Bug Fixes

- add virtual field ([5894ae0](https://github.com/didi/LogicFlow/commit/5894ae0104bc567ef4678662b8e571c1c1d19820))
- error name ([ef10a93](https://github.com/didi/LogicFlow/commit/ef10a93198b34017fbec7dedb4c66a39ceff5536))
- **core:** adjust polyline bugfix ([e87f2c9](https://github.com/didi/LogicFlow/commit/e87f2c9c772558b2de0d6850ca528a59cbafaf6f))
- typo ([facccdf](https://github.com/didi/LogicFlow/commit/facccdf3b98d44650c75e34a66ed33f5e0d8f75e))

### Features

- lf support plugins ([3dacdb6](https://github.com/didi/LogicFlow/commit/3dacdb6e39ff0fa84b0c3e525bf3e6d1b91a29f4))

## [1.0.4](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.0.0-alpha.12...@logicflow/core@1.0.4) (2022-01-12)

### Bug Fixes

- change edge type remove pointsList ([433c8e8](https://github.com/didi/LogicFlow/commit/433c8e805da226e37550c7abd770748f8c8a8bdc))
- focus on ([2301c09](https://github.com/didi/LogicFlow/commit/2301c094f2853591741101623da879ea7e0d22de))
- mini map viewport ([38c2408](https://github.com/didi/LogicFlow/commit/38c2408e0f8a76dd0b49b9271dd259fd8b6fa684))
- move edge not keep controls ([b8f28f3](https://github.com/didi/LogicFlow/commit/b8f28f38d943ab2881a2f375603025e01573c0d8))
- node updateText observable ([b04f96a](https://github.com/didi/LogicFlow/commit/b04f96abf639befeaa5cf22be9407955926a5118))
- rewrite text node getTextStyle ([2717203](https://github.com/didi/LogicFlow/commit/27172038a282404c02697986736bf10955117d16))
- typo EditConfigMode ([fed381b](https://github.com/didi/LogicFlow/commit/fed381b47ec3786f43d043c07c33f01458239840))

### Features

- release 1.0.0🎉🎉 ([670fed7](https://github.com/didi/LogicFlow/commit/670fed7fa3e0cb0ee39501251d177c693694ef59))

## [1.0.1](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.0.0-alpha.12...@logicflow/core@1.0.1) (2022-01-07)

### Bug Fixes

- focus on ([2301c09](https://github.com/didi/LogicFlow/commit/2301c094f2853591741101623da879ea7e0d22de))
- rewrite text node getTextStyle ([2717203](https://github.com/didi/LogicFlow/commit/27172038a282404c02697986736bf10955117d16))
- typo EditConfigMode ([fed381b](https://github.com/didi/LogicFlow/commit/fed381b47ec3786f43d043c07c33f01458239840))

### Features

- release 1.0.0🎉🎉 ([670fed7](https://github.com/didi/LogicFlow/commit/670fed7fa3e0cb0ee39501251d177c693694ef59))

# [1.0.0-alpha.12](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.0.0-alpha.11...@logicflow/core@1.0.0-alpha.12) (2021-12-30)

### Bug Fixes

- reset offset ([3ab0425](https://github.com/didi/LogicFlow/commit/3ab0425fdba12e934c0380b3f4229314071e630f))

# [1.0.0-alpha.11](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.0.0-alpha.10...@logicflow/core@1.0.0-alpha.11) (2021-12-29)

### Bug Fixes

- custom node ([2155c37](https://github.com/didi/LogicFlow/commit/2155c379144469848ea08511c9c1c145105f46df))

# [1.0.0-alpha.10](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.0.0-alpha.9...@logicflow/core@1.0.0-alpha.10) (2021-12-29)

### Bug Fixes

- history change ([1ed9799](https://github.com/didi/LogicFlow/commit/1ed9799a0321b1d5e761b3e25ae8d874d8c310f3))

### Features

- merge master ([2f418bc](https://github.com/didi/LogicFlow/commit/2f418bcbeb60ac7162718d6022047aeb326a50d8))

# [1.0.0-alpha.9](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.0.0-alpha.8...@logicflow/core@1.0.0-alpha.9) (2021-12-24)

### Features

- remove hideOutline ([be86fb1](https://github.com/didi/LogicFlow/commit/be86fb118bd8bb1bd67a999802544eb2d10df0da))

# [1.0.0-alpha.8](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.0.0-alpha.7...@logicflow/core@1.0.0-alpha.8) (2021-12-22)

### Bug Fixes

- recovery getAppend ([2518892](https://github.com/didi/LogicFlow/commit/2518892c656dc07008676206ca4da920e869ed99))

### Features

- use deepclone return style ([e2c2af3](https://github.com/didi/LogicFlow/commit/e2c2af3673ff64de71a2e2c3d3f3db8fa84737cf))

# [1.0.0-alpha.7](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.0.0-alpha.6...@logicflow/core@1.0.0-alpha.7) (2021-12-22)

### Bug Fixes

- node resize set default style ([b9def97](https://github.com/didi/LogicFlow/commit/b9def9763f1fa0464c42adeffebf37fe20543151))

# [1.0.0-alpha.6](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.0.0-alpha.4...@logicflow/core@1.0.0-alpha.6) (2021-12-22)

### Bug Fixes

- edge setProperties in vue ([ecdaf34](https://github.com/didi/LogicFlow/commit/ecdaf34ad170e410ad979af8413e87bf86e8345b))
- edge text use model getTextStyle ([85b36ef](https://github.com/didi/LogicFlow/commit/85b36efa14ed9e7a0a5d95e800489d4dfa65b6d6))
- lf.select -> lf.selectElementById ([f4eea2c](https://github.com/didi/LogicFlow/commit/f4eea2c23ec6ac44acbd404b35d94b74fbb69d00))
- selection events ([682ba34](https://github.com/didi/LogicFlow/commit/682ba345451a5c5b522ebcd510f9c9e29be5758e))

# [1.0.0-alpha.4](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.14...@logicflow/core@1.0.0-alpha.4) (2021-12-21)

### Bug Fixes

- html node ([a356297](https://github.com/didi/LogicFlow/commit/a3562974d2dac63f08e531784945bbeb9e25e81d))
- use model instead of getAttribute ([0e51cb0](https://github.com/didi/LogicFlow/commit/0e51cb0681c458bf68a69b8459ce0a4b91951ea4))

### Features

- 重构自定义锚点写法 ([657f911](https://github.com/didi/LogicFlow/commit/657f9113eff1207c910080507e94a22c69c10cce))
- custom edge ([81cd3be](https://github.com/didi/LogicFlow/commit/81cd3be6a9940553d2eec75b77a3472fdf75eb88))
- resize width and height ([8275dfb](https://github.com/didi/LogicFlow/commit/8275dfb539449c641c8f61c3f84ebad8a2046f8b))
- theme and outline ([1b7960d](https://github.com/didi/LogicFlow/commit/1b7960db3bab047e49d187bbb43578a0700d7eef))
- use loose class properties ([921a09b](https://github.com/didi/LogicFlow/commit/921a09ba4b30a819eb315316e174a7bccfc9ffc8))

# [1.0.0-alpha.3](https://github.com/didi/LogicFlow/compare/@logicflow/core@1.0.0-alpha.1...@logicflow/core@1.0.0-alpha.3) (2021-12-09)

**Note:** Version bump only for package @logicflow/core

# [1.0.0-alpha.1](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.13...@logicflow/core@1.0.0-alpha.1) (2021-12-09)

### Features

- 重构自定义锚点写法 ([657f911](https://github.com/didi/LogicFlow/commit/657f9113eff1207c910080507e94a22c69c10cce))
- use loose class properties ([921a09b](https://github.com/didi/LogicFlow/commit/921a09ba4b30a819eb315316e174a7bccfc9ffc8))

## [0.7.13](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.12...@logicflow/core@0.7.13) (2021-12-09)

### Features

- add node view types ([8b6a5ab](https://github.com/didi/LogicFlow/commit/8b6a5abf41967ff47d65e34a926d6b4ac37a9ad4))
- babel use loose mode ([7fed1fb](https://github.com/didi/LogicFlow/commit/7fed1fb9557e3ac7f6f7fc11ad3afcc1d3d7bad8))

## [0.7.13-alpha.1](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.13-alpha.0...@logicflow/core@0.7.13-alpha.1) (2021-12-07)

### Features

- babel use loose mode ([a48deef](https://github.com/didi/LogicFlow/commit/a48deef1c58e6e8d3f90463082207797fb9b771c))

## [0.7.13-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.12...@logicflow/core@0.7.13-alpha.0) (2021-12-07)

### Features

- add node view types ([b065a2d](https://github.com/didi/LogicFlow/commit/b065a2d7efc1d47cf0cf97ae73406640d8a20eb4))

## [0.7.12](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.11...@logicflow/core@0.7.12) (2021-12-04)

### Features

- 增加文本超出隐藏模式 ([0255275](https://github.com/didi/LogicFlow/commit/0255275ed99242da2167ea0f81f7346dc5ce5365))

## [0.7.11](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.10...@logicflow/core@0.7.11) (2021-11-30)

### Features

- support disabled tool in core package ([1c7527f](https://github.com/didi/LogicFlow/commit/1c7527fc75929c444d9e5fb4b0b70b87086694c8))

## [0.7.10](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.9...@logicflow/core@0.7.10) (2021-11-26)

**Note:** Version bump only for package @logicflow/core

## [0.7.9](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.8...@logicflow/core@0.7.9) (2021-11-23)

### Bug Fixes

- nodeResize outline bugfix ([8e76f5f](https://github.com/didi/LogicFlow/commit/8e76f5f8e79a18189f48339b85904b06d29cfda2))

## [0.7.8](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.7...@logicflow/core@0.7.8) (2021-11-22)

**Note:** Version bump only for package @logicflow/core

## [0.7.7](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.6...@logicflow/core@0.7.7) (2021-11-19)

### Features

- add context menu plugin ([8c5d7a8](https://github.com/didi/LogicFlow/commit/8c5d7a84309ba8d07fbbb99dcebcae81b521bd06))
- set textheight ([29e9738](https://github.com/didi/LogicFlow/commit/29e97388e765d17faaa17c8633b0408681435e06))

## [0.7.6](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.5...@logicflow/core@0.7.6) (2021-11-11)

### Bug Fixes

- custom element id ([cff9c18](https://github.com/didi/LogicFlow/commit/cff9c180e12df91de8921aa083e0bbafe4afc641))

## [0.7.5](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.4...@logicflow/core@0.7.5) (2021-11-08)

### Bug Fixes

- **core:** update text position after draging edge ([e430c14](https://github.com/didi/LogicFlow/commit/e430c14c3a0edec26ad0ba24afa7da70aa90421e))

## [0.7.4](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.3...@logicflow/core@0.7.4) (2021-11-04)

### Bug Fixes

- **core:** ts error ([83db114](https://github.com/didi/LogicFlow/commit/83db114f495307aa039ff45d743336f124a32221))

### Features

- **core:** add anchor properties ([21b245e](https://github.com/didi/LogicFlow/commit/21b245ef858761babd42a5de558a77a39ff1e6d6))
- **core:** adjust edge ([0490ae0](https://github.com/didi/LogicFlow/commit/0490ae08d6d681dfbcf19bf678c46e2179d98cb8))
- **core:** support anchor setting properties ([ecf7aaa](https://github.com/didi/LogicFlow/commit/ecf7aaa0daa963c08fde6f2c64de0790a4133f8c))

## [0.7.3](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.2...@logicflow/core@0.7.3) (2021-11-03)

### Bug Fixes

- edge setProperties observable ([9517468](https://github.com/didi/LogicFlow/commit/951746878c2bbd27fc9dae7f13fa0990a2a3ba3d))
- remove both sourceRuleResults and targetRuleResults ([1ba045a](https://github.com/didi/LogicFlow/commit/1ba045aa7c298989f214eecede053a9d507dd0a8))
- **core:** update evenetName of edge adjustment, fixes [#330](https://github.com/didi/LogicFlow/issues/330) ([a973de2](https://github.com/didi/LogicFlow/commit/a973de2b70caea9b441039e0659df51401aa321b))

### Features

- **core:** adjust edge startPoint or endPoint ([db96695](https://github.com/didi/LogicFlow/commit/db966950e59b5166e704ccd958e837e2fa3e1f6a))

## [0.7.2](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.1...@logicflow/core@0.7.2) (2021-10-22)

**Note:** Version bump only for package @logicflow/core

## [0.7.1](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.7.1-alpha.0...@logicflow/core@0.7.1) (2021-10-21)

**Note:** Version bump only for package @logicflow/core

## [0.7.1-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.6.16...@logicflow/core@0.7.1-alpha.0) (2021-10-21)

### Bug Fixes

- drag line not toFront ([f1db31d](https://github.com/didi/LogicFlow/commit/f1db31d5c95c339493090907af517481cefba987))
- this.setState warning ([7f7c498](https://github.com/didi/LogicFlow/commit/7f7c498dd50e25b44a291b3e5d96554144116f40))

### Features

- add change graph&node&edge id function ([13d1c0b](https://github.com/didi/LogicFlow/commit/13d1c0b0b6814dc9b65bd74a9bb704b633499554))
- add increase overlap mode ([06068e4](https://github.com/didi/LogicFlow/commit/06068e4caa11544b709697d101063838020dc4d1))
- add text background ([dd1a89f](https://github.com/didi/LogicFlow/commit/dd1a89fbb84bfc74e9bf7db251b546a03b783838))
- avoid add id in dom ([37cccb6](https://github.com/didi/LogicFlow/commit/37cccb6fc75451b25254c1ccda4c581f2bb5ce51)), closes [#309](https://github.com/didi/LogicFlow/issues/309)
- remove object attributes ([a242500](https://github.com/didi/LogicFlow/commit/a242500edf2e2e197cd0a015d2e490e474ff585e))
- save data include zIndex in increase mode ([cb79054](https://github.com/didi/LogicFlow/commit/cb7905489ee097bf2b157d3202527f7e5a6f39c9))

## [0.6.16](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.6.13...@logicflow/core@0.6.16) (2021-09-04)

### Bug Fixes

- **core:** isElementInArea fix ([9e8bd62](https://github.com/didi/LogicFlow/commit/9e8bd621e28ff9563f1a02e10708a6e421a01870))
- **examples:** modified examples page title ([3a9ae5e](https://github.com/didi/LogicFlow/commit/3a9ae5ed100405378ed468574ca61445bef44035))
- isElementInArea bugfix ([2050510](https://github.com/didi/LogicFlow/commit/2050510c98684266e152d7d733694c543bbb9c28))

## [0.6.13](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.6.12...@logicflow/core@0.6.13) (2021-08-19)

### Bug Fixes

- silent mode support recovery ([7c17585](https://github.com/didi/LogicFlow/commit/7c17585767426aad508ff3b14434ec5b05850ec5))
- text undefined cause undraggble ([640ec9e](https://github.com/didi/LogicFlow/commit/640ec9ef98a3fc73206b607e21a7294314d826f3))

### Features

- add config nodeSelectedOutline ([9b91cd0](https://github.com/didi/LogicFlow/commit/9b91cd0b5ab3a30bfe0575b6f297d59719f3a2d1))
- group ([2c75b81](https://github.com/didi/LogicFlow/commit/2c75b810d2bda185e37e029a5fe28503f299e412))
- merge master ([cead588](https://github.com/didi/LogicFlow/commit/cead5887df27bd7624c46000966257a73b5a95e0))
- mvp demo ([12d5e96](https://github.com/didi/LogicFlow/commit/12d5e9684bad4a465e1b57a1217aceed73453d59))
- 增加移动节点跳过校验规则功能 ([659b83e](https://github.com/didi/LogicFlow/commit/659b83eb8ab6c8f3a1f60333e11e24777795a14b))

## [0.6.12](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.6.5...@logicflow/core@0.6.12) (2021-08-17)

### Bug Fixes

- editconfig default type ([575e566](https://github.com/didi/LogicFlow/commit/575e566d528015ecdb5769700fb06194a34a4ad1))
- isArray not fit mobx array ([8392165](https://github.com/didi/LogicFlow/commit/839216534a7c80551a417617330d30e79121aa0c))
- **core:** code optimization ([b96dfb4](https://github.com/didi/LogicFlow/commit/b96dfb47b9ca0fa4f7182334c77db341b0515711))
- **core:** nodeText auto wrap build:type bugfix ([fb43025](https://github.com/didi/LogicFlow/commit/fb43025ed921f2f208950e476aebe640f9fda187))
- **extension:** snapshot forginObject in svg fix ([ef937a0](https://github.com/didi/LogicFlow/commit/ef937a08f2f4898b99376d06c25ee57c3f81fda2))

### Features

- add custom TextPosition ([352047d](https://github.com/didi/LogicFlow/commit/352047d942cc505f36272ba1a64bae33c13b5897))
- edgemodel support override getTextPosition ([5ede6f2](https://github.com/didi/LogicFlow/commit/5ede6f295c128c5f8c87af789105576f1f04ba57))
- set anchors id ([17c4105](https://github.com/didi/LogicFlow/commit/17c4105474084b01c656298b30c28d0cd2908a36))
- **core:** nodeText auto wrap ([f260d47](https://github.com/didi/LogicFlow/commit/f260d4700cdc86194a3a738fec3df27b9871cc10))
- **core:** nodeText auto wrap lineHeight ([fcc64c3](https://github.com/didi/LogicFlow/commit/fcc64c32a5ebccd74f64f51042d7bb0dfdf680ad))
- **core:** text auto wrap for customize element ([ddf51c5](https://github.com/didi/LogicFlow/commit/ddf51c561a28a9555a64cc146abca7e58ee46d12))
- 新增move节点采用绝对位置 ([c36d604](https://github.com/didi/LogicFlow/commit/c36d604f52ad3bfed0316d99b3dc0538f61ab339))

## [0.6.8](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.6.5...@logicflow/core@0.6.8) (2021-08-06)

### Bug Fixes

- **core:** code optimization ([b96dfb4](https://github.com/didi/LogicFlow/commit/b96dfb47b9ca0fa4f7182334c77db341b0515711))
- **core:** nodeText auto wrap build:type bugfix ([fb43025](https://github.com/didi/LogicFlow/commit/fb43025ed921f2f208950e476aebe640f9fda187))
- **extension:** snapshot forginObject in svg fix ([ef937a0](https://github.com/didi/LogicFlow/commit/ef937a08f2f4898b99376d06c25ee57c3f81fda2))

### Features

- edgemodel support override getTextPosition ([5ede6f2](https://github.com/didi/LogicFlow/commit/5ede6f295c128c5f8c87af789105576f1f04ba57))
- set anchors id ([17c4105](https://github.com/didi/LogicFlow/commit/17c4105474084b01c656298b30c28d0cd2908a36))
- **core:** nodeText auto wrap ([f260d47](https://github.com/didi/LogicFlow/commit/f260d4700cdc86194a3a738fec3df27b9871cc10))
- **core:** nodeText auto wrap lineHeight ([fcc64c3](https://github.com/didi/LogicFlow/commit/fcc64c32a5ebccd74f64f51042d7bb0dfdf680ad))
- **core:** text auto wrap for customize element ([ddf51c5](https://github.com/didi/LogicFlow/commit/ddf51c561a28a9555a64cc146abca7e58ee46d12))
- 新增move节点采用绝对位置 ([c36d604](https://github.com/didi/LogicFlow/commit/c36d604f52ad3bfed0316d99b3dc0538f61ab339))

## [0.6.5](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.6.4...@logicflow/core@0.6.5) (2021-07-29)

### Bug Fixes

- remove unnessage import ([cd02497](https://github.com/towersxu/logicflow/commit/cd024976b657c0b964e55cdcce1f086f395e2c8c))

### Features

- add node:dnd-drag event ([bf8a351](https://github.com/towersxu/logicflow/commit/bf8a3515c458014c33cc7fdc8f366c4d16b226b8))

## [0.6.4](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.6.2...@logicflow/core@0.6.4) (2021-07-28)

### Bug Fixes

- codesandbox import css ([a0eb60a](https://github.com/towersxu/logicflow/commit/a0eb60a3c61b152b9e06ba043d1e6eb5f2b00e95))

### Features

- all core style use one css ([3528505](https://github.com/towersxu/logicflow/commit/3528505c4be7305c10cf5dd4ab4df8dab599f6ae))

## [0.6.3](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.6.2...@logicflow/core@0.6.3) (2021-07-28)

### Bug Fixes

- codesandbox import css ([e3f71cc](https://github.com/towersxu/logicflow/commit/e3f71cc1bf62f6bbc23dc3cac2deccfde83d83a1))

## [0.6.2](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.6.1...@logicflow/core@0.6.2) (2021-07-28)

### Bug Fixes

- text undefined cause undraggble ([ae4f1db](https://github.com/towersxu/logicflow/commit/ae4f1db28efa5d7a5194be92df3922d7f6fdd7c5))
- 修复getSelectElements方法,即使选中元素,但是依然返回为undefined的bug ([12df9f2](https://github.com/towersxu/logicflow/commit/12df9f26020c3eeda0fa18c4f23d09ab1566c1cc))

## [0.6.1](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.6.0...@logicflow/core@0.6.1) (2021-07-19)

### Bug Fixes

- setProperties not observable in htmlNode ([9b47918](https://github.com/towersxu/logicflow/commit/9b47918a97b9d7b8df53c876dcea51d88d82ac4f))

# [0.6.0](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.4.11...@logicflow/core@0.6.0) (2021-07-14)

### Bug Fixes

- [#211](https://github.com/towersxu/logicflow/issues/211) ([3347137](https://github.com/towersxu/logicflow/commit/33471376ec4994eece9acf5266fe50d411aa99cd))
- new selection select ([4fc34d4](https://github.com/towersxu/logicflow/commit/4fc34d41e1000629362c141a8c6a2eb033ecf17d))
- reactive html node ([0909bd3](https://github.com/towersxu/logicflow/commit/0909bd3d423d0bb9ed72a8eb36dd69054810ba84))
- use html-node as model type ([944b895](https://github.com/towersxu/logicflow/commit/944b895e640a699d6ce0bdedd2d2ac04779489d1))
- use pluginName replace name ([2b2706a](https://github.com/towersxu/logicflow/commit/2b2706a4596eaee5fb6e88328a219ebc9366505c))

### Features

- add createUniqueId API ([edaf244](https://github.com/towersxu/logicflow/commit/edaf244cd3e2ae38ad58a61c83046edb1d7e5952))
- add html node ([373db63](https://github.com/towersxu/logicflow/commit/373db637fb8cca0416ff944dc5beda23f3082bf3))
- add idGenerator global option ([b6fd441](https://github.com/towersxu/logicflow/commit/b6fd4417e9d99dfd319889fdce1c6da7a1abcfb9))
- html node support old register method ([d83821b](https://github.com/towersxu/logicflow/commit/d83821b694d45a9ad968e9d51adb7e79e402c610))
- text:update event emit element data ([44a0d5d](https://github.com/towersxu/logicflow/commit/44a0d5d9a7ae77e28021208d7ecf2d7ef5a0707c))

# [0.5.0](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.4.11...@logicflow/core@0.5.0) (2021-06-18)

### Bug Fixes

- [#211](https://github.com/towersxu/logicflow/issues/211) ([3347137](https://github.com/towersxu/logicflow/commit/33471376ec4994eece9acf5266fe50d411aa99cd))
- use html-node as model type ([944b895](https://github.com/towersxu/logicflow/commit/944b895e640a699d6ce0bdedd2d2ac04779489d1))
- use pluginName replace name ([8bf1a08](https://github.com/towersxu/logicflow/commit/8bf1a0892e61f619204b7b621902f36f9ad3e204))

### Features

- add html node ([373db63](https://github.com/towersxu/logicflow/commit/373db637fb8cca0416ff944dc5beda23f3082bf3))
- text:update event emit element data ([36f1f2a](https://github.com/towersxu/logicflow/commit/36f1f2a5d57c70dada007a7ec92782d994528e5e))

## [0.4.15](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.4.11...@logicflow/core@0.4.15) (2021-06-17)

### Bug Fixes

- [#211](https://github.com/towersxu/logicflow/issues/211) ([3347137](https://github.com/towersxu/logicflow/commit/33471376ec4994eece9acf5266fe50d411aa99cd))
- use html-node as model type ([944b895](https://github.com/towersxu/logicflow/commit/944b895e640a699d6ce0bdedd2d2ac04779489d1))

### Features

- add html node ([373db63](https://github.com/towersxu/logicflow/commit/373db637fb8cca0416ff944dc5beda23f3082bf3))

## [0.4.14](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.4.11...@logicflow/core@0.4.14) (2021-06-16)

**Note:** Version bump only for package @logicflow/core

## [0.4.13](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.4.11...@logicflow/core@0.4.13) (2021-06-09)

**Note:** Version bump only for package @logicflow/core

## [0.4.11](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.4.9...@logicflow/core@0.4.11) (2021-05-31)

**Note:** Version bump only for package @logicflow/core

## [0.4.9](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.4.7...@logicflow/core@0.4.9) (2021-05-28)

### Bug Fixes

- 修复拖动触发点击事件的问题 ([19fd122](https://github.com/towersxu/logicflow/commit/19fd1226f0d26ccfddbe0df405907412e95b4535))

## [0.4.8](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.4.7...@logicflow/core@0.4.8) (2021-05-25)

### Bug Fixes

- 修复拖动触发点击事件的问题 ([19fd122](https://github.com/towersxu/logicflow/commit/19fd1226f0d26ccfddbe0df405907412e95b4535))

## [0.4.7](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.4.4...@logicflow/core@0.4.7) (2021-05-24)

### Features

- 自定义节点model支持获取graphModel ([4ae15aa](https://github.com/towersxu/logicflow/commit/4ae15aa243ae91184145be0df0cbb42baeb88de4))

## [0.4.6](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.4.5...@logicflow/core@0.4.6) (2021-05-21)

**Note:** Version bump only for package @logicflow/core

## [0.4.5](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.4.4...@logicflow/core@0.4.5) (2021-05-21)

### Features

- 自定义节点model支持获取graphModel ([71927f6](https://github.com/towersxu/logicflow/commit/71927f6947d27422bb0157898271d18d9ed2c84b))

## [0.4.4](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.4.3...@logicflow/core@0.4.4) (2021-05-19)

### Bug Fixes

- extenion render bind self instence ([afac922](https://github.com/towersxu/logicflow/commit/afac92287bf1c15b10151764c0a3fe0e4251be63))

### Features

- dndpanel support properties, related [#181](https://github.com/towersxu/logicflow/issues/181) ([765416c](https://github.com/towersxu/logicflow/commit/765416c6051559f529cb5af1fe9d5d14304f3cf1))

## [0.4.3](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.4.2...@logicflow/core@0.4.3) (2021-05-16)

### Bug Fixes

- mobx4 anchorsOffset it`s not an array ([4e05895](https://github.com/towersxu/logicflow/commit/4e05895fec0a00313f851cb5afa350b5c849d408))
- remove unnecessary console ([102bd81](https://github.com/towersxu/logicflow/commit/102bd8179d5dd5f84e677ad39b209f49d2ee3a1b))
- twoPointDistance methods support negative number ([3f9b719](https://github.com/towersxu/logicflow/commit/3f9b719bbc836c6d6d050d12d7c7c908c19b0bc6))

### Features

- **extension:** endEvent node hide anchor ([6e2333f](https://github.com/towersxu/logicflow/commit/6e2333f2af8a214530a2c2ed3c1dc5597fcd68f1))

## [0.4.2](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.3.6...@logicflow/core@0.4.2) (2021-05-13)

### Bug Fixes

- build support ie ([4a90d5e](https://github.com/towersxu/logicflow/commit/4a90d5e0bb20f8dfd2f4ab88db5c691894521298))
- ie11 transform no work ([f776592](https://github.com/towersxu/logicflow/commit/f776592b2d16675514e4f0e876b888d9ea14ebe9))
- occasionally read isAllPass of undefined ([dac3d41](https://github.com/towersxu/logicflow/commit/dac3d4118aff2699497512ca799912deaa0b4930))
- **core:** export function in util ([5ecae8a](https://github.com/towersxu/logicflow/commit/5ecae8a4d226a2a4e196461aef2e848a6ba7bb6c))
- save register API & add registerElement API ([916f6be](https://github.com/towersxu/logicflow/commit/916f6be2be6f16fde9f385010f3291d82ded4a23))
- update registerElement API in extension ([df25d11](https://github.com/towersxu/logicflow/commit/df25d110eee7051ee9357b11f669d80a3de1e0ea))

### Features

- register support config ([074c584](https://github.com/towersxu/logicflow/commit/074c58443df30b8d0a0beeee8deb1d0866f90f66))
- support class as extension ([ac66e9f](https://github.com/towersxu/logicflow/commit/ac66e9ffd6709a605c48b61281be102429524b82))
- support ie11 ([46df695](https://github.com/towersxu/logicflow/commit/46df6951b1af5b1e46bea4ed084aa6abd5ebddf0))
- type ([a14c1c2](https://github.com/towersxu/logicflow/commit/a14c1c2b540700dc1f7ca93b1b2abbf542b896e4))
- **extension:** rect node resize ([399afb5](https://github.com/towersxu/logicflow/commit/399afb545b421345ca3ea823d60f2d47db1e0d72))

## [0.4.1-alpha.1](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.4.0...@logicflow/core@0.4.1-alpha.1) (2021-05-12)

### Bug Fixes

- ie11 transform no work ([95a069b](https://github.com/towersxu/logicflow/commit/95a069bb18faba2bd3efc849217ee4ce019fed23))
- occasionally read isAllPass of undefined ([e413970](https://github.com/towersxu/logicflow/commit/e41397064f208c8f9daa76399397a69bdf4a133f))
- **core:** export function in util ([24655f3](https://github.com/towersxu/logicflow/commit/24655f3f2d4d539925847e3ced47e16c503d6ebb))
- **extension:** merge v0.4 ([3ce2a7c](https://github.com/towersxu/logicflow/commit/3ce2a7c13e02828c701b523135c0275011c592c8))

### Features

- support class as extension ([e3c40d1](https://github.com/towersxu/logicflow/commit/e3c40d1e3e648b58597f33cb8330b42ce6d76079))
- **extension:** rect node resize ([9d25526](https://github.com/towersxu/logicflow/commit/9d25526c8bdbf0a64ecf4b66d5b755e498ccc2cd))

## [0.4.1-alpha.0](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.4.0...@logicflow/core@0.4.1-alpha.0) (2021-05-06)

### Features

- support class as extension ([e3c40d1](https://github.com/towersxu/logicflow/commit/e3c40d1e3e648b58597f33cb8330b42ce6d76079))

# [0.4.0](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.3.6...@logicflow/core@0.4.0) (2021-04-30)

### Bug Fixes

- save register API & add registerElement API ([53304b3](https://github.com/towersxu/logicflow/commit/53304b3c5ad7ad78cc1ae1a282879614f881cf80))
- update registerElement API in extension ([7798dbb](https://github.com/towersxu/logicflow/commit/7798dbbeef4b4d021d02b5d21d55f81ef7161d1e))

### Features

- register support config ([cae7c98](https://github.com/towersxu/logicflow/commit/cae7c9807eff77fcad9de2907c286c03b01b6aa9))
- support ie11 ([902e813](https://github.com/towersxu/logicflow/commit/902e81394a2d5945d7ceecfee58875f57f938fc8))

## [0.3.6](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.3.4...@logicflow/core@0.3.6) (2021-04-29)

### Bug Fixes

- add more warning ([12f4bb3](https://github.com/towersxu/logicflow/commit/12f4bb36e34733855aeb760a5874fedd09b411de))
- change node type line ([31602bb](https://github.com/towersxu/logicflow/commit/31602bbbfb5282ef9b2d80d18c0a7492ed19f907))

### Features

- add change nodetype ([15878a1](https://github.com/towersxu/logicflow/commit/15878a1c8be6f9117c925792c66dcdbfd1b0aa77))
- **extension:** drop node in polyline ([94480ac](https://github.com/towersxu/logicflow/commit/94480ac5b2b8d989a2310a3b4c25e08abe9d10b6))

## [0.3.5](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.3.4...@logicflow/core@0.3.5) (2021-04-29)

### Bug Fixes

- add more warning ([12f4bb3](https://github.com/towersxu/logicflow/commit/12f4bb36e34733855aeb760a5874fedd09b411de))

### Features

- add change nodetype ([15878a1](https://github.com/towersxu/logicflow/commit/15878a1c8be6f9117c925792c66dcdbfd1b0aa77))
- **extension:** drop node in polyline ([94480ac](https://github.com/towersxu/logicflow/commit/94480ac5b2b8d989a2310a3b4c25e08abe9d10b6))

## [0.3.4](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.3.3...@logicflow/core@0.3.4) (2021-04-22)

**Note:** Version bump only for package @logicflow/core

## [0.3.3](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.3.2...@logicflow/core@0.3.3) (2021-04-21)

### Bug Fixes

- avoid reObserver view ([996fd65](https://github.com/towersxu/logicflow/commit/996fd6515d78b5331b08fd84025a148b45026cd9))
- drag text not allowed propagation ([9d6cc0c](https://github.com/towersxu/logicflow/commit/9d6cc0cc1c64fdc134e83f37794ca568ffbfca25))
- types ([37491ca](https://github.com/towersxu/logicflow/commit/37491cab07d7712aa4b94326424af3ded5031f75))

## [0.3.2](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.3.1...@logicflow/core@0.3.2) (2021-04-20)

### Bug Fixes

- show anchors when extend baseNode ([12bd0db](https://github.com/towersxu/logicflow/commit/12bd0db574b18b19aed8134b9e508f3c0a9ef6f4))
- show anchors when extend baseNode ([d78d7df](https://github.com/towersxu/logicflow/commit/d78d7dfabbdea171a104a22b48ad6e8662230c21))

### Features

- **core:** add clearData funcion in Logicflow ([2a5b345](https://github.com/towersxu/logicflow/commit/2a5b3450b88fd7d831bc25810726fa4de4255033))

## [0.3.1](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.3.0...@logicflow/core@0.3.1) (2021-04-19)

### Bug Fixes

- delete useless code ([8680810](https://github.com/towersxu/logicflow/commit/8680810fdb6600994bcf3b94e11061dad176bc51))
- format edge text value ([cc8aa22](https://github.com/towersxu/logicflow/commit/cc8aa224d158f547589a2e1f9e079d064df0b9e8))

# [0.3.0](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.3.0-alpha.5...@logicflow/core@0.3.0) (2021-04-13)

### Bug Fixes

- add hoverBackground ([aca87e6](https://github.com/towersxu/logicflow/commit/aca87e6feafb7c0745a192b110533fe96e27edc2))
- anchor hover style not hide ([2ea9e54](https://github.com/towersxu/logicflow/commit/2ea9e54b5df5030388e2cfbaca39680a88a7387a))
- edge updateText position ([e333787](https://github.com/towersxu/logicflow/commit/e3337878bed766eaab9345c9110e202cc477a56c))
- invalid setTheme for rect size ([4ed7e1a](https://github.com/towersxu/logicflow/commit/4ed7e1af69ddf31956e454748da4ea5adcb03be6))
- save input value when swich edit element ([972e4cd](https://github.com/towersxu/logicflow/commit/972e4cdaba7f7388fe59cb572ff598b976275c0b))
- **all:** add rimraf ([c526ad8](https://github.com/towersxu/logicflow/commit/c526ad840b1e2620a3221d416f7a03e9c6d3583c))
- **core:** fix the bug when drag edges ([36aed3a](https://github.com/towersxu/logicflow/commit/36aed3a455e9bfd04ad5a0b4aae294863184069c))

### Features

- **extension:** curved-edge ([1731b10](https://github.com/towersxu/logicflow/commit/1731b10e3e65ccf226b48d4fb572d90d2ad10dec))
- add the height field for hoverBackground and background ([4d38c8a](https://github.com/towersxu/logicflow/commit/4d38c8aadcd21e02f21f1b822c6a7832445b24bd))
- add updateAttributes API ([3112b69](https://github.com/towersxu/logicflow/commit/3112b6917998f6cbb2e306b1862eb3e2c4bd8e8f))
- added missing element tips ([71674cd](https://github.com/towersxu/logicflow/commit/71674cddc6096170fdc88d88b02a4d482f3c2f43))
- support setting line of dashes for edges ([4f39909](https://github.com/towersxu/logicflow/commit/4f39909af2260ff0ea696dd2db04ee4e5713b4bc))

# [0.3.0-alpha.5](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.3.0-alpha.4...@logicflow/core@0.3.0-alpha.5) (2021-03-30)

### Features

- edge text support hover style ([ffc75d4](https://github.com/towersxu/logicflow/commit/ffc75d45e0ef42b9dbca1be489fa749186aa81b0))

# [0.3.0-alpha.4](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.3.0-alpha.2...@logicflow/core@0.3.0-alpha.4) (2021-03-24)

### Bug Fixes

- the text content misalignment caused by switching nodes ([38193f7](https://github.com/towersxu/logicflow/commit/38193f7a28cb004c18dc7717f854d83269bf4194))
- **extension:** mini-map default disable control & selection-select ([297cecf](https://github.com/towersxu/logicflow/commit/297cecf4637ca7a045619a10cd9298feacc631ea))

# [0.3.0-alpha.3](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.3.0-alpha.2...@logicflow/core@0.3.0-alpha.3) (2021-03-23)

### Bug Fixes

- **extension:** mini-map default disable control & selection-select ([297cecf](https://github.com/towersxu/logicflow/commit/297cecf4637ca7a045619a10cd9298feacc631ea))

# [0.3.0-alpha.2](https://github.com/towersxu/logicflow/compare/@logicflow/core@0.3.0-alpha.1...@logicflow/core@0.3.0-alpha.2) (2021-03-22)

### Bug Fixes

- minimap extension custom disabled plugin ([3768d14](https://github.com/towersxu/logicflow/commit/3768d149b6a72e4c251e287432b6070dcbfabce6))
- move clone guard to shortcut ([c5643da](https://github.com/towersxu/logicflow/commit/c5643daa8ca7b2f905db81357444e5bba64a5ee7))

### Features

- change cloneElements to addElements ([6c59d74](https://github.com/towersxu/logicflow/commit/6c59d749a53e5263f5cf630702453054347215f6))

# [0.3.0-alpha.1](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.3.0-alpha.0...@logicflow/core@0.3.0-alpha.1) (2021-03-19)

### Bug Fixes

- custom shortcut replace default shortcut ([791a4e2](https://github.com/didi/LogicFlow/commit/791a4e20134ef251073e528b897a6568a38ae57f))
- vue reactive object side effect ([a2dc0f8](https://github.com/didi/LogicFlow/commit/a2dc0f86d920679df6a387985b36374c6c2aeb78))

### Features

- add getSelectElements function ([d6b5a81](https://github.com/didi/LogicFlow/commit/d6b5a81a76ba59cac319cb01a3187caf0fb216ea))

# [0.3.0-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.2.9...@logicflow/core@0.3.0-alpha.0) (2021-03-18)

### Bug Fixes

- 🐛 beforeClone is not be triggered by ctrl+v ([969ab8d](https://github.com/didi/LogicFlow/commit/969ab8d3e1f00bfaba2124389d5d48ce21c6f58f)), closes [#66](https://github.com/didi/LogicFlow/issues/66)
- 🐛 the incorrect way of anchor choice ([4811f65](https://github.com/didi/LogicFlow/commit/4811f6522ee7a817220ed472b1eb972dad562630))
- **core:** invalid style setting of snapline in setTheme function ([dc963d5](https://github.com/didi/LogicFlow/commit/dc963d5cb3480e2e469ce5cb46cc4fbf8975f73b))
- **core:** remove outline in container & copy incomplete elements ([370bbf5](https://github.com/didi/LogicFlow/commit/370bbf578416be6199fa4d4d424cb55fdb5c844c))
- **core:** select edge after mouseup event ([f24aafd](https://github.com/didi/LogicFlow/commit/f24aafdafbdb5ee3d9617df4600e71b70dda876e))
- **core:** trigger the edge:click and edge:dbclick with mousedown and mouseup ([b267188](https://github.com/didi/LogicFlow/commit/b267188c712e4ab363c958c4327d219634582641))

### Features

- 🎸 add anchorsOffset API ([f23317b](https://github.com/didi/LogicFlow/commit/f23317bf535222d3770ae39892071ca7d154df41))
- add mini-map extension ([fa621da](https://github.com/didi/LogicFlow/commit/fa621daf2cc6a05cd5265bfe5245f5424f97ae7e))
- custom active plugin & add updateText function ([c974e75](https://github.com/didi/LogicFlow/commit/c974e7521d8eb1395c9df63c5c5da8933e8a849a))
- extension add destroy property ([23e59e5](https://github.com/didi/LogicFlow/commit/23e59e5902976fced92ad67ddd72f74938113c96))
- resize node ([2bc595e](https://github.com/didi/LogicFlow/commit/2bc595eadea58e1597f730520b830efc41a0dac5))
- **core:** add disable extension config & extension need name ([8bd9355](https://github.com/didi/LogicFlow/commit/8bd93555b7f82eb30a4813c986e3e642c86578fb))
- **core:** add drap event ([746f5db](https://github.com/didi/LogicFlow/commit/746f5db4e5dcfd362f57524f2bfb40db2279030f))

## [0.2.9](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.2.8...@logicflow/core@0.2.9) (2021-03-10)

### Bug Fixes

- 🐛 no dbclick event was triggered when textEdit is false ([f295def](https://github.com/didi/LogicFlow/commit/f295def99aae5f92394056066884faf8d2967495))
- **core:** Fix the problem of invalid property settings in setProperties function ([3e28d4e](https://github.com/didi/LogicFlow/commit/3e28d4e8b0153830c8277bd81f0259374fa23b71))

## [0.2.8](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.2.7...@logicflow/core@0.2.8) (2021-03-05)

### Bug Fixes

- **core:** Compatible with the data of the vue project ([4d94215](https://github.com/didi/LogicFlow/commit/4d9421522444915ddb5534836c93ccf0b199481d))
- **core:** Fix the problem of invalid property settings in addNode and createEdge function ([54eb760](https://github.com/didi/LogicFlow/commit/54eb760b8e2d56fcc10ae1171427b275441e31c3))
- **core:** Pick standardized data in the constructor function of nodeModel ([fc6f6d7](https://github.com/didi/LogicFlow/commit/fc6f6d74968425e272b805c76692469dad449f53))
- 🐛 lack the outline style of edge ([babeaac](https://github.com/didi/LogicFlow/commit/babeaac2b6a4e9b864df0e740deddc9a6a21dfb9))
- 🐛 the render err of diamond ([01c85bb](https://github.com/didi/LogicFlow/commit/01c85bbee091222c3772dbf6cc3de282d2f7d097))

## [0.2.7](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.2.6...@logicflow/core@0.2.7) (2021-03-01)

### Bug Fixes

- 🐛 complete the type of nodes' common style ([971f63e](https://github.com/didi/LogicFlow/commit/971f63ec1b320f034263ab34e456eee970a3e06b))
- **core:** get vue project responsive data error ([e03d277](https://github.com/didi/LogicFlow/commit/e03d277b6cca2836f53f104f5e999208439a5fe0))

## [0.2.6](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.2.4...@logicflow/core@0.2.6) (2021-03-01)

### Bug Fixes

- **core:** immutable redo data ([7a5dac6](https://github.com/didi/LogicFlow/commit/7a5dac6d89b0b248a9055cacaa22dc423dc6c299))
- **extension:** 🐛fix undo error when custom text position ([fc6e7d7](https://github.com/didi/LogicFlow/commit/fc6e7d767889e8bbdd542a3c8006e352a86121c4))
- 🐛 add the type of diamond class ([90f70b5](https://github.com/didi/LogicFlow/commit/90f70b5dd378af9f7c6ee3abca0c2ebf5cb8e4b3))

### Features

- new plugin Selection & example ([2e4b489](https://github.com/didi/LogicFlow/commit/2e4b48958dff21617b6f7b08c9840deac0a178f0))
- **core:** add edit config update function ([695894c](https://github.com/didi/LogicFlow/commit/695894c4db9fa328d358be1d3917166b33aae990))
- **core:** copy paste and delete multiple selected elements ([4a5be86](https://github.com/didi/LogicFlow/commit/4a5be86c63c90b7c1c88e08e9d084e708307a80d))
- **core:** multiple elements drag moving ([a59065f](https://github.com/didi/LogicFlow/commit/a59065f7cebd745e2ba0e147c8356849384be9f9))
- **core:** support use meta key select multiple element ([e137f9f](https://github.com/didi/LogicFlow/commit/e137f9fdbdb6bf3f85c3f7ac9323785e445844c8))

## [0.2.4](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.2.3...@logicflow/core@0.2.4) (2021-02-20)

### Bug Fixes

- 🐛 fix error when moving edge ([9ac20c1](https://github.com/didi/LogicFlow/commit/9ac20c1c89a6909860e2de99eea2c333f2f4aa6c))

## [0.2.3](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.2.2...@logicflow/core@0.2.3) (2021-02-19)

### Bug Fixes

- **core:** print error when double click edge ([a890ef7](https://github.com/didi/LogicFlow/commit/a890ef7f81e559ef16da505568b1ddb94c7eb365))

## [0.2.2](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.2.1...@logicflow/core@0.2.2) (2021-02-08)

### Bug Fixes

- **core:** change the priority of events ([5373797](https://github.com/didi/LogicFlow/commit/53737978d109088a2aeac1b4492fcbd69d16ec35))

## [0.2.1](https://github.com/didi/LogicFlow/compare/@logicflow/core@0.1.0...@logicflow/core@0.2.1) (2021-02-08)

### Bug Fixes

- **core:** fix anchor error ([7a30f23](https://github.com/didi/LogicFlow/commit/7a30f238bda918be25caa6e9646846f379042b3c))
- **core:** fix checking repeatedly verification rules ([f0efbf4](https://github.com/didi/LogicFlow/commit/f0efbf481eb254bdaf29fd25b29ee1ee495d439b))
- **core:** fix textEdit deviation ([17db629](https://github.com/didi/LogicFlow/commit/17db629500d3887f26779440582c3ce3567bdab6))
- **core:** move the tool overlay out of the graph ([fcc586d](https://github.com/didi/LogicFlow/commit/fcc586df6d9e8f5188fb6d87bdb86aa461950f98))
- **core:** optimize anchor selection ([19d5fe8](https://github.com/didi/LogicFlow/commit/19d5fe8bd7b886656ce4ec96acbc7bbbdfff1ce4))
- **core:** recovery ellipse size ([81e8ed3](https://github.com/didi/LogicFlow/commit/81e8ed396db0bc32c26a9961298ad4a535ed02ad))
- Spelling errors EdgeConifg -> EdgeConfig and EdgeConfig Repeat Definitions in type/index.ts ([401dfb5](https://github.com/didi/LogicFlow/commit/401dfb533e860d03b60ddfc6d9a006900af38c35))

### Features

- **core:** add getPointByClient API ([983fa91](https://github.com/didi/LogicFlow/commit/983fa91cc70426f113c397ed89d75add50e634ad))
- **core:** add new configuration items ([66d562d](https://github.com/didi/LogicFlow/commit/66d562d90306c69d69f22823d174d11833cf70d0))
- **core:** Add stroke-dasharray vlaue to outline of node & edge ([4cb1bca](https://github.com/didi/LogicFlow/commit/4cb1bca0f5090de035adda717b9bb509c79753d7)), closes [#12](https://github.com/didi/LogicFlow/issues/12)
- **core:** Add the select function for logicflow ([6ae0671](https://github.com/didi/LogicFlow/commit/6ae067153cd2608018fd3da76bd6d00a08da4b3a))
- **core:** Create text for polyline at the double-click position ([ac7eeea](https://github.com/didi/LogicFlow/commit/ac7eeea0a3937350a4393500b24811352947fb49))
- **core:** support open text edit by double click anchor ([690d1d1](https://github.com/didi/LogicFlow/commit/690d1d1648237c06580f51439ec67e4d07931774))
- **core:** support setting hoverOutlineStrokeDash ([ad09324](https://github.com/didi/LogicFlow/commit/ad09324088cbb95d7bbe843cb4d745475cfeb92c))
- **core:** v0.2.0 ([f11d143](https://github.com/didi/LogicFlow/commit/f11d143a998ca68887f08e6ccd98604f165cec8a))
- **extension:** v0.2.0 ([ee67636](https://github.com/didi/LogicFlow/commit/ee676365b82d2d07d40cbc77e955eb3506690804))
- 替换文件夹名称 ([9155d8a](https://github.com/didi/LogicFlow/commit/9155d8a7af3cd0aff983f8a036bd3ffafd0d4d56))

# [0.2.0](https://github.com/didichuxing/LogicFlow/compare/@logicflow/core@0.1.0...@logicflow/core@0.2.0) (2021-02-01)

### Bug Fixes

- Spelling errors EdgeConifg -> EdgeConfig and EdgeConfig Repeat Definitions in type/index.ts ([401dfb5](https://github.com/didichuxing/LogicFlow/commit/401dfb533e860d03b60ddfc6d9a006900af38c35))
- **core:** fix anchor error ([7a30f23](https://github.com/didichuxing/LogicFlow/commit/7a30f238bda918be25caa6e9646846f379042b3c))
- **core:** fix checking repeatedly verification rules ([f0efbf4](https://github.com/didichuxing/LogicFlow/commit/f0efbf481eb254bdaf29fd25b29ee1ee495d439b))
- **core:** move the tool overlay out of the graph ([fcc586d](https://github.com/didichuxing/LogicFlow/commit/fcc586df6d9e8f5188fb6d87bdb86aa461950f98))

### Features

- 替换文件夹名称 ([9155d8a](https://github.com/didichuxing/LogicFlow/commit/9155d8a7af3cd0aff983f8a036bd3ffafd0d4d56))
- **core:** Add stroke-dasharray vlaue to outline of node & edge ([4cb1bca](https://github.com/didichuxing/LogicFlow/commit/4cb1bca0f5090de035adda717b9bb509c79753d7)), closes [#12](https://github.com/didichuxing/LogicFlow/issues/12)
- **core:** support open text edit by double click anchor ([690d1d1](https://github.com/didichuxing/LogicFlow/commit/690d1d1648237c06580f51439ec67e4d07931774))
- **core:** v0.2.0 ([f11d143](https://github.com/didichuxing/LogicFlow/commit/f11d143a998ca68887f08e6ccd98604f165cec8a))
- **extension:** v0.2.0 ([ee67636](https://github.com/didichuxing/LogicFlow/commit/ee676365b82d2d07d40cbc77e955eb3506690804))

# 0.1.0 (2020-12-29)

### Features

- init ([6ab4c32](https://github.com/didichuxing/LogicFlow/commit/6ab4c326063b9242010c89b6bf92885c3158e6b0))
- 更改包名增加scope ([27be341](https://github.com/didichuxing/LogicFlow/commit/27be3410c70f959093f928c792cf40f038e8adcc))
