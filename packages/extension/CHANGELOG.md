# Change Log

## 2.0.0

### Major Changes： Release 2.0 New Version 🎉🎉🎉🎉

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
   - 命名规范：文件夹名小写（name or  name1-name2-name3）；.js or .ts 小驼峰；.tsx or .jsx 大驼峰
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
   - dependencies 中 'workspace:latest' -> 'workspace:*' 解决 changeset 中生成 CHANGELOG 报错的问题
   - update build-docs shell
   - add @changesets/cli and related scripts

 - 更新 rollup config 并增加 umd 包使用 demo 文件

 - npm 包 dependencies 中新增 lodash-es 依赖，解决引入项目中报错的问题
   - 开发节点文本换行等体验优化的功能
   - 解决 examples 中报错的问题

 - 移除文档中 lodash-es 依赖，移除无用 console
 - 优化代码注释歧义的问题
 - 更新 turbo 版本并解决 extension 打包 core 依赖报错的问题

#### Core & Extension

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
  - rename  setHoverON -> setHoverOn, setHoverOFF -> setHoverOff
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
    - 如果 properties 中没有 _label 配置项时，MediumEditor 初始化有点问题，选中文本无法显示工具栏
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

### Patch Changes

- Updated dependencies
  - @logicflow/core@2.0.0

All notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.2.28](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.23...@logicflow/extension@1.2.28) (2024-07-29)

### Bug Fixes

- **extension:** perform topGroupZIndex calibration when add node([#1535](https://github.com/didi/LogicFlow/issues/1535)) ([2d6e41c](https://github.com/didi/LogicFlow/commit/2d6e41c3e25df2a95887980652241963710e8e11))
- **extension:** trigger updateEdgePointByAnchors() after moveTo([#1384](https://github.com/didi/LogicFlow/issues/1384)) ([65e7027](https://github.com/didi/LogicFlow/commit/65e7027170583a3f0a6ce07bc06d15a230e6e8fb))
- optimize the experience of resizeNode ([135a8e3](https://github.com/didi/LogicFlow/commit/135a8e3385799c3c9c98634ad0fecb0532377001))
- 修复使用框选插件会阻塞页面滚轮事件问题 ([5266822](https://github.com/didi/LogicFlow/commit/52668221b1570606efa6caace2f6f7ae4d2bf935))
- 修复选区插件无法触发鼠标事件的问题，同时兼容 Ctrl + 滚轮事件 ([129f101](https://github.com/didi/LogicFlow/commit/129f101faf2c3aae3d25917eb68ccabadbb93ec3))
- 更新readme logo & publish 1.2.25 ([4da3db7](https://github.com/didi/LogicFlow/commit/4da3db7aebc892e685269340ca38a0b9a4f68c56))

## [1.2.27](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.23...@logicflow/extension@1.2.27) (2024-05-06)

### Bug Fixes

- **extension:** perform topGroupZIndex calibration when add node([#1535](https://github.com/didi/LogicFlow/issues/1535)) ([2d6e41c](https://github.com/didi/LogicFlow/commit/2d6e41c3e25df2a95887980652241963710e8e11))
- **extension:** trigger updateEdgePointByAnchors() after moveTo([#1384](https://github.com/didi/LogicFlow/issues/1384)) ([65e7027](https://github.com/didi/LogicFlow/commit/65e7027170583a3f0a6ce07bc06d15a230e6e8fb))
- optimize the experience of resizeNode ([135a8e3](https://github.com/didi/LogicFlow/commit/135a8e3385799c3c9c98634ad0fecb0532377001))
- 修复选区插件无法触发鼠标事件的问题，同时兼容 Ctrl + 滚轮事件 ([129f101](https://github.com/didi/LogicFlow/commit/129f101faf2c3aae3d25917eb68ccabadbb93ec3))
- 更新readme logo & publish 1.2.25 ([4da3db7](https://github.com/didi/LogicFlow/commit/4da3db7aebc892e685269340ca38a0b9a4f68c56))

## [1.2.26](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.23...@logicflow/extension@1.2.26) (2024-04-10)

### Bug Fixes

- **extension:** perform topGroupZIndex calibration when add node([#1535](https://github.com/didi/LogicFlow/issues/1535)) ([2d6e41c](https://github.com/didi/LogicFlow/commit/2d6e41c3e25df2a95887980652241963710e8e11))
- **extension:** trigger updateEdgePointByAnchors() after moveTo([#1384](https://github.com/didi/LogicFlow/issues/1384)) ([65e7027](https://github.com/didi/LogicFlow/commit/65e7027170583a3f0a6ce07bc06d15a230e6e8fb))
- 修复选区插件无法触发鼠标事件的问题，同时兼容 Ctrl + 滚轮事件 ([129f101](https://github.com/didi/LogicFlow/commit/129f101faf2c3aae3d25917eb68ccabadbb93ec3))
- 更新readme logo & publish 1.2.25 ([4da3db7](https://github.com/didi/LogicFlow/commit/4da3db7aebc892e685269340ca38a0b9a4f68c56))

## [1.2.25](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.24...@logicflow/extension@1.2.25) (2024-04-03)

**Note:** Version bump only for package @logicflow/extension

## [1.2.24](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.23...@logicflow/extension@1.2.24) (2024-04-03)

### Bug Fixes

- 修复选区插件无法触发鼠标事件的问题，同时兼容 Ctrl + 滚轮事件 ([129f101](https://github.com/didi/LogicFlow/commit/129f101faf2c3aae3d25917eb68ccabadbb93ec3))

## [1.2.23](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.22...@logicflow/extension@1.2.23) (2024-03-20)

### Bug Fixes

- 修复多实例时非首个实例导出不正确问题 ([27148c0](https://github.com/didi/LogicFlow/commit/27148c0e9c9db64daa09b279cb2e3b1578fccc93))

## [1.2.22](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.20...@logicflow/extension@1.2.22) (2024-02-05)

### Features

- update @logicflow/core @logicflow/extension version to 1.2.21 ([55b865b](https://github.com/didi/LogicFlow/commit/55b865b381354a75b04d339fec2f10b34cd12738))

## [1.2.20](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.19...@logicflow/extension@1.2.20) (2024-02-05)

### Bug Fixes

- **extension:** 修复task判定附加边界事件时的坐标判定问题 ([5ffdffd](https://github.com/didi/LogicFlow/commit/5ffdffd37e70c076bae9a52f0fc685375e64022e))

## [1.2.19](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.18...@logicflow/extension@1.2.19) (2023-11-22)

### Bug Fixes

- **extension:** 修复「小地图鼠标放上去会出现浮层展示」bug([#1419](https://github.com/didi/LogicFlow/issues/1419)) ([0a47b2d](https://github.com/didi/LogicFlow/commit/0a47b2d0ac833e4fe9b207a43ba02d22df72d07d))
- prevent node without anchors using InsertNodeInPolyline([#1077](https://github.com/didi/LogicFlow/issues/1077)) ([6e10d3a](https://github.com/didi/LogicFlow/commit/6e10d3ad6e5b26daa6cad865bbca0eb326dfd54b))

## [1.2.18](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.17...@logicflow/extension@1.2.18) (2023-10-25)

### Bug Fixes

- **extension:** optimize radius and variable name ([b0810b4](https://github.com/didi/LogicFlow/commit/b0810b47f3aaf1b1b1576861f46f687ca002d13e))
- **extension:** the outermost edges translate 0 when copy a group([#1379](https://github.com/didi/LogicFlow/issues/1379)) ([8368622](https://github.com/didi/LogicFlow/commit/836862282032838f65e8f66d4a70fa4acce5b466))

## [1.2.17](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.16...@logicflow/extension@1.2.17) (2023-10-19)

### Bug Fixes

- add edge copying when copying a group([#1346](https://github.com/didi/LogicFlow/issues/1346)) ([f53ec7f](https://github.com/didi/LogicFlow/commit/f53ec7f8eea1b9e1357e3dc21d509695e857bb3b))
- **extension:** bug of menu initialization ([#1359](https://github.com/didi/LogicFlow/issues/1359)) ([fabd8d7](https://github.com/didi/LogicFlow/commit/fabd8d74cf998e6118499d3ddc49841ad5411480))

### Features

- **extension:** add test for curved-edge ([c2a92dc](https://github.com/didi/LogicFlow/commit/c2a92dc1b7eba19fc3e2a68d91c17da7ba5759e4))
- **extension:** override addElements to support group-node copy([#1346](https://github.com/didi/LogicFlow/issues/1346)) ([e9d0139](https://github.com/didi/LogicFlow/commit/e9d0139da4446ec4451ba7c2516a1e440a951fec))

## [1.2.16](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.15...@logicflow/extension@1.2.16) (2023-09-21)

### Bug Fixes

- **extension:** add group:remove-node and group:add-node event([#800](https://github.com/didi/LogicFlow/issues/800)) ([58b78a0](https://github.com/didi/LogicFlow/commit/58b78a06d07128d858ee9dfa54602e2a71e82e23))

### Features

- **core:** add draggable range for graph([#1337](https://github.com/didi/LogicFlow/issues/1337)) ([ecc59bc](https://github.com/didi/LogicFlow/commit/ecc59bccb07e23fbe11986d5b38f5a5e99f4b4f1))

## [1.2.15](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.14...@logicflow/extension@1.2.15) (2023-09-11)

### Features

- **core:** enable node rotation ([267ebc8](https://github.com/didi/LogicFlow/commit/267ebc8ff65f461c831fc631b89028ca98305858))
- **extension:** remove lf-rotate when using snapshot to export canvas ([8aa6053](https://github.com/didi/LogicFlow/commit/8aa60532b1ab7d1f5b52305e7e87aaff3774252e))

## [1.2.14](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.13...@logicflow/extension@1.2.14) (2023-09-08)

**Note:** Version bump only for package @logicflow/extension

## [1.2.13](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.12...@logicflow/extension@1.2.13) (2023-08-16)

### Bug Fixes

- **extension:** change the way export icons and bpmnUtils ([434b167](https://github.com/didi/LogicFlow/commit/434b1679427f1a3492c9ce5f3d7712c006953db2))
- **extension:** modify the content in bpmn-elements/README.md ([1b37586](https://github.com/didi/LogicFlow/commit/1b37586cb498feb6398b0a36410882d0c710cf3e))

## [1.2.12](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.11...@logicflow/extension@1.2.12) (2023-08-16)

### Bug Fixes

- **extension:** change default value of cancelActivity ([0fb5f35](https://github.com/didi/LogicFlow/commit/0fb5f35d4da2e133b6c15f55e7f5da15c4f5d68b))
- **extension:** ensure dpr>=1 when exporting images([#1222](https://github.com/didi/LogicFlow/issues/1222)) ([ac3a774](https://github.com/didi/LogicFlow/commit/ac3a7742a04f4b322c0b0505434a2f0324fa241b))
- **extension:** remove package ids from extension ([a3fb1a8](https://github.com/didi/LogicFlow/commit/a3fb1a8d2a1cf87c2c6ea34d28ebebf9a064afd1))

### Features

- optimize BPMNAdapter; add input props when register plugin ([4e9a90e](https://github.com/didi/LogicFlow/commit/4e9a90ea2abedee1456119edf0f0c9164e8cc116))

## [1.2.11](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.10...@logicflow/extension@1.2.11) (2023-08-10)

### Bug Fixes

- **extension:** fix types error when run build:types ([f3aaf91](https://github.com/didi/LogicFlow/commit/f3aaf9169df7039527f28cfe2c9be5eb575e8933))
- **extension:** nodeGroupMap was not set correctly when adding a group ([8874af5](https://github.com/didi/LogicFlow/commit/8874af562fd2dca17f285ef1c4cb91ba75626852))
- **extension:** wrong GroupNode import lead to the failed deployment ([01442a4](https://github.com/didi/LogicFlow/commit/01442a44a1ee816bc3860c4bf8b5f0f8d6877ec2))

### Features

- create logicflow eninge ([c7d80f4](https://github.com/didi/LogicFlow/commit/c7d80f4b4c19cf82af9be49dd8fd44433327db58))
- **extension:** new bpmn plugin ([bd3e76a](https://github.com/didi/LogicFlow/commit/bd3e76ad76bdab13ea8e2f8e22fb7a248fea1a86))
- **extension:** perfecting readme.md in extension/bpmn-elements ([492a277](https://github.com/didi/LogicFlow/commit/492a2770c7380cde284fba5de995fb77308f97f7))

## [1.2.10](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.9...@logicflow/extension@1.2.10) (2023-07-17)

### Bug Fixes

- calculate the pos of the menu considering the bounds([#1019](https://github.com/didi/LogicFlow/issues/1019)) ([43961a6](https://github.com/didi/LogicFlow/commit/43961a61190c7efc22f088f320d34ca60b9a5f4f))
- use anchors to adjust the pos of edges during dragging([#807](https://github.com/didi/LogicFlow/issues/807)[#875](https://github.com/didi/LogicFlow/issues/875)) ([83c7385](https://github.com/didi/LogicFlow/commit/83c7385f43ed24cd9b13cce60e0218b2bba561b2))
- 修正Control移除item不正确的问题 ([560a007](https://github.com/didi/LogicFlow/commit/560a0076212cab6b014e614c8f0b3f0e06157299))

## [1.2.9](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.8...@logicflow/extension@1.2.9) (2023-06-21)

### Bug Fixes

- **extension:** store the state of the children before folding, and restore the state when the parent is expanded([#1145](https://github.com/didi/LogicFlow/issues/1145)) ([9ca39a6](https://github.com/didi/LogicFlow/commit/9ca39a617eda51544641c6eadec4e101ea30d923))
- fix the bug of getting error snapshot after scaling the graph ([bad2c59](https://github.com/didi/LogicFlow/commit/bad2c594796692321d6184f71ad49c8875d5fe6f))

## [1.2.8](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.7...@logicflow/extension@1.2.8) (2023-05-30)

**Note:** Version bump only for package @logicflow/extension

## [1.2.7](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.6...@logicflow/extension@1.2.7) (2023-05-17)

### Bug Fixes

- add dragging translation to offset while getting snapshot ([e2fe1fe](https://github.com/didi/LogicFlow/commit/e2fe1fe91fa70ae676389a3d137963c9b129e9d7))
- fix bad case about bezier line in snapshot output.didi[#1147](https://github.com/didi/LogicFlow/issues/1147) ([7923619](https://github.com/didi/LogicFlow/commit/792361993ea954635895c4879edece7d90d86f8f))
- remove extra content in bpmnAdapter output ([865a1c6](https://github.com/didi/LogicFlow/commit/865a1c62da10586280b0165410d833f4bf154c3a))
- remove extra content in bpmnAdapter output(didi[#1155](https://github.com/didi/LogicFlow/issues/1155)) ([57a6750](https://github.com/didi/LogicFlow/commit/57a67500219e95c95b0a662edff277df347f1c6e))
- remove extra content in bpmnAdapter output(issue[#1155](https://github.com/didi/LogicFlow/issues/1155)) ([f76064e](https://github.com/didi/LogicFlow/commit/f76064e079a10904ca7aeeb860e19df96a34021f))
- resolve issue with incomplete display of minimap ([08a2c51](https://github.com/didi/LogicFlow/commit/08a2c51f8a08df6d767fa78a9fbba044dd1179ca))

## [1.2.6](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.5...@logicflow/extension@1.2.6) (2023-05-13)

### Bug Fixes

- add input of convertLf2ProcessData ([a13ef07](https://github.com/didi/LogicFlow/commit/a13ef07023d7dc72f901193596de1a0e6332f376))
- add optional input in BpmnAdapter ([d88d290](https://github.com/didi/LogicFlow/commit/d88d290a5ac79dfc89401554a23ef46d82cc77a0))
- add optional input of adpaterOut in class LogicFlow ([ff0f23e](https://github.com/didi/LogicFlow/commit/ff0f23edeef5436bad1e16cceb2c7c0698be3e06))
- remove extra $ in json2xml.ts ([9c04d85](https://github.com/didi/LogicFlow/commit/9c04d85869c4861e7c3171e0ccce7301bd435c24))
- 修复边上插入节点的规则问题 ([a7e577e](https://github.com/didi/LogicFlow/commit/a7e577e0ba25a68c1b1987440af4545576eb2183))
- 处理没有文本鼠标hover报错的问题 ([7b174f8](https://github.com/didi/LogicFlow/commit/7b174f8d717ff6077572e3527cb50348bed1f93d))

## [1.2.5](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.3...@logicflow/extension@1.2.5) (2023-05-03)

### Bug Fixes

- add xml node type reference, support #comment parsing ([78b04b3](https://github.com/didi/LogicFlow/commit/78b04b38db46f2fd86d383668396c88555bed1b4))
- add xml node type reference, support #comment parsing ([b2ff0d4](https://github.com/didi/LogicFlow/commit/b2ff0d495c0e7062bd83f8b7cf33eb260e154efa))
- downgrade jest version to fix the compiling error of yargs types ([cda318d](https://github.com/didi/LogicFlow/commit/cda318d79199bd50b2a5cb2c744cfdb7a81d1fa8))
- edge insertion node checking rules ([#1078](https://github.com/didi/LogicFlow/issues/1078)) ([e40df4d](https://github.com/didi/LogicFlow/commit/e40df4d7d73e7826fd8fb640b6d20baa02c2f45e))
- fix a mistake ([aa8eb09](https://github.com/didi/LogicFlow/commit/aa8eb0986537eb424c6a8430bb32d314461299d8))
- fix bug 571 ([90ba0cf](https://github.com/didi/LogicFlow/commit/90ba0cf5b84d1c15be503ba26ccae23e1a4e1d50))
- fix bugs in code review ([f0ade3c](https://github.com/didi/LogicFlow/commit/f0ade3c40e8ef773237ef1158a2284538e0440e9))
- fix bugs in extension/src/bpmn-adapter/index.ts ([b96c882](https://github.com/didi/LogicFlow/commit/b96c882399394d08d0b92403ae521d2300b596c9))
- fix execution bug in xml ⇄ json ([4551d99](https://github.com/didi/LogicFlow/commit/4551d992e933434cc72aaac7d646a7340f32b11f))
- fix the bug of cdata-transformation in extension: bpmn-adapter ([d690412](https://github.com/didi/LogicFlow/commit/d6904129489f5ef82321483b4f76b2706c445a54))
- fix the transformation of xml⇋json in extension: bpmn-adapter ([f7a9421](https://github.com/didi/LogicFlow/commit/f7a9421cf3ddd6c2d4046407e47ee25f581aa540))
- fix ts's type bug ([93146ae](https://github.com/didi/LogicFlow/commit/93146aeb976ad4a5e849957c971dfefbcf17c44e))
- folded icon not working when overflowMode is set to ellipsis([#1099](https://github.com/didi/LogicFlow/issues/1099)) ([cc82b6d](https://github.com/didi/LogicFlow/commit/cc82b6d6762e377ba15293e9a59bc50bc584cdf4))
- observable object cannot appear twice([#837](https://github.com/didi/LogicFlow/issues/837)) ([16f338f](https://github.com/didi/LogicFlow/commit/16f338fe8df7a1cce546f5f5fa07b90864b902f4))

## [1.2.4](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.3...@logicflow/extension@1.2.4) (2023-04-10)

### Bug Fixes

- fix bug 571 ([90ba0cf](https://github.com/didi/LogicFlow/commit/90ba0cf5b84d1c15be503ba26ccae23e1a4e1d50))
- observable object cannot appear twice([#837](https://github.com/didi/LogicFlow/issues/837)) ([16f338f](https://github.com/didi/LogicFlow/commit/16f338fe8df7a1cce546f5f5fa07b90864b902f4))

## [1.2.3](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.2...@logicflow/extension@1.2.3) (2023-03-25)

**Note:** Version bump only for package @logicflow/extension

## [1.2.2](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.0...@logicflow/extension@1.2.2) (2023-03-25)

### Bug Fixes

- export images compatible with Firefox([#269](https://github.com/didi/LogicFlow/issues/269)) ([d87065e](https://github.com/didi/LogicFlow/commit/d87065e404a6569fb16ee5c0d4c01bb67c2e117d))
- update logicflow site url ([8774efe](https://github.com/didi/LogicFlow/commit/8774efe5eb8411819e1a44f8c4698111f6fb6ea5))
- virtual models cannot be included in group children.([#1022](https://github.com/didi/LogicFlow/issues/1022)) ([76d559d](https://github.com/didi/LogicFlow/commit/76d559d64f2033e541d8a1d631e240f8f9644ad9))

## [1.2.1](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.0...@logicflow/extension@1.2.1) (2023-03-14)

**Note:** Version bump only for package @logicflow/extension

# [1.2.0](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.0-next.5...@logicflow/extension@1.2.0) (2023-03-13)

### Bug Fixes

- trigger extension render in difference env ([9be1f58](https://github.com/didi/LogicFlow/commit/9be1f58a3768fd48117e1143939c8a92f61191dc))

# [1.2.0-next.5](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.0-next.4...@logicflow/extension@1.2.0-next.5) (2023-03-10)

**Note:** Version bump only for package @logicflow/extension

# [1.2.0-next.4](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.0-next.3...@logicflow/extension@1.2.0-next.4) (2023-02-22)

**Note:** Version bump only for package @logicflow/extension

# [1.2.0-next.3](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.0-next.2...@logicflow/extension@1.2.0-next.3) (2023-02-13)

**Note:** Version bump only for package @logicflow/extension

# [1.2.0-next.2](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.31...@logicflow/extension@1.2.0-next.2) (2023-01-13)

### Bug Fixes

- issues890 ([0aa4312](https://github.com/didi/LogicFlow/commit/0aa431230879735a63cb9701364b4ab27bde5610))
- move lodash-es to dependencies ([b9c5206](https://github.com/didi/LogicFlow/commit/b9c5206a6cdc0d36aecdbc89889238f3f1973de0))
- typos ([ee9f3cd](https://github.com/didi/LogicFlow/commit/ee9f3cd40a819b13887938bf5e6018f77e575917))
- **extension:** minimap remove console ([f788d87](https://github.com/didi/LogicFlow/commit/f788d873a73be89bb15c2d0a5b0a70848580c7ad))
- **extension:** minimap remove console ([521f76c](https://github.com/didi/LogicFlow/commit/521f76c4d3db9b44421748daefb706f927a642d6))

### Features

- add event to dnd-penal ([9707cfb](https://github.com/didi/LogicFlow/commit/9707cfb927f13b0e6dd022230c5466f145d48cf8))
- **core&extension:** add pluginOptions attribute on lf instance ([47cd816](https://github.com/didi/LogicFlow/commit/47cd81647532a724456b191d0050f87e833cb968))
- **extension:** minimap enhance, fixes [#802](https://github.com/didi/LogicFlow/issues/802) ([15c6ca3](https://github.com/didi/LogicFlow/commit/15c6ca3d53026b6a18ffd41d0ff3167add96b7fd))
- **extension:** minimap pirvate modifier ([238fc5f](https://github.com/didi/LogicFlow/commit/238fc5f42fd5e20fb9cc57f10e45380e574c0f64))

## [1.1.31](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.30...@logicflow/extension@1.1.31) (2022-11-12)

# [1.2.0-next.1](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.2.0-next.0...@logicflow/extension@1.2.0-next.1) (2022-10-10)

### Bug Fixes

- remove console ([1fa5696](https://github.com/didi/LogicFlow/commit/1fa56964c4b8c91c242610a7cefa669796a8712d))

# [1.2.0-next.0](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.29...@logicflow/extension@1.2.0-next.0) (2022-09-29)

**Note:** Version bump only for package @logicflow/extension

## [1.1.30](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.29...@logicflow/extension@1.1.30) (2022-10-30)

**Note:** Version bump only for package @logicflow/extension

## [1.1.29](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.28...@logicflow/extension@1.1.29) (2022-09-24)

### Features

- add curved edge ([b64928a](https://github.com/didi/LogicFlow/commit/b64928a486385aaa13f9dc07a28e790c982f5ada))
- update turbo plugin ([ed512ca](https://github.com/didi/LogicFlow/commit/ed512ca21d21829cd7c114140b006964fc4090e4))

## [1.1.28](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.27...@logicflow/extension@1.1.28) (2022-09-17)

**Note:** Version bump only for package @logicflow/extension

## [1.1.27](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.26...@logicflow/extension@1.1.27) (2022-09-13)

**Note:** Version bump only for package @logicflow/extension

## [1.1.26](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.25...@logicflow/extension@1.1.26) (2022-08-27)

**Note:** Version bump only for package @logicflow/extension

## [1.1.25](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.24...@logicflow/extension@1.1.25) (2022-08-21)

### Bug Fixes

- 修复分组嵌套分组时子分组内部节点无法跟随移动的问题 ([c7edb01](https://github.com/didi/LogicFlow/commit/c7edb013907b474a65ed495817f983a3f1aafcae))

### Features

- group add isAllowAppendIn to support pick node append in group ([e54f798](https://github.com/didi/LogicFlow/commit/e54f79845996e763098cb5749100c76063160023))

## [1.1.24](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.23...@logicflow/extension@1.1.24) (2022-08-11)

**Note:** Version bump only for package @logicflow/extension

## [1.1.23](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.22...@logicflow/extension@1.1.23) (2022-08-04)

**Note:** Version bump only for package @logicflow/extension

## [1.1.22](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.21...@logicflow/extension@1.1.22) (2022-07-13)

**Note:** Version bump only for package @logicflow/extension

## [1.1.21](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.20...@logicflow/extension@1.1.21) (2022-07-02)

### Bug Fixes

- **extension-selection:** 修复开启selection后,右键仍会出现上下文菜单的问题 ([d15330c](https://github.com/didi/LogicFlow/commit/d15330cdbfc3f2018bf58058014a12ec6147e154))

## [1.1.20](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.19...@logicflow/extension@1.1.20) (2022-06-08)

### Features

- add highlight plugin ([8081f91](https://github.com/didi/LogicFlow/commit/8081f91c448d4ed204f517a555af59c13bbde55f))

## [1.1.19](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.18...@logicflow/extension@1.1.19) (2022-06-01)

**Note:** Version bump only for package @logicflow/extension

## [1.1.18](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.17...@logicflow/extension@1.1.18) (2022-05-23)

**Note:** Version bump only for package @logicflow/extension

## [1.1.17](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.16...@logicflow/extension@1.1.17) (2022-05-23)

### Bug Fixes

- use blank:drop instead of graph:transform ([c7fc211](https://github.com/didi/LogicFlow/commit/c7fc211438715528651ef4923849a793c325a2c8))

## [1.1.16](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.14...@logicflow/extension@1.1.16) (2022-05-18)

**Note:** Version bump only for package @logicflow/extension

## [1.1.15](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.14...@logicflow/extension@1.1.15) (2022-05-07)

**Note:** Version bump only for package @logicflow/extension

## [1.1.14](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.13...@logicflow/extension@1.1.14) (2022-04-22)

### Bug Fixes

- update turbo adapter ([205e6c8](https://github.com/didi/LogicFlow/commit/205e6c8e7cb8809ad1f04ec6b8c92b5d25416257))

## [1.1.13](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.12...@logicflow/extension@1.1.13) (2022-04-16)

### Features

- add useGlobalRules and customCssRules property ([88dadb8](https://github.com/didi/LogicFlow/commit/88dadb8e2c96d9f7ee4d4c286a6aa42c8941baaf))

## [1.1.12](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.12-alpha.0...@logicflow/extension@1.1.12) (2022-04-13)

**Note:** Version bump only for package @logicflow/extension

## [1.1.12-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.11...@logicflow/extension@1.1.12-alpha.0) (2022-04-09)

**Note:** Version bump only for package @logicflow/extension

## [1.1.11](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.10...@logicflow/extension@1.1.11) (2022-03-29)

**Note:** Version bump only for package @logicflow/extension

## [1.1.10](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.9...@logicflow/extension@1.1.10) (2022-03-29)

**Note:** Version bump only for package @logicflow/extension

## [1.1.9](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.9-alpha.1...@logicflow/extension@1.1.9) (2022-03-26)

**Note:** Version bump only for package @logicflow/extension

## [1.1.9-alpha.1](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.9-alpha.0...@logicflow/extension@1.1.9-alpha.1) (2022-03-26)

### Features

- optimize move group children behavior ([d492f20](https://github.com/didi/LogicFlow/commit/d492f20a7205c81a709f7a151b9127a2709d81a4))
- optimize move node behavior ([d0e4e85](https://github.com/didi/LogicFlow/commit/d0e4e856cf58e92a98e309cdd698724bc1163295))

## [1.1.9-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.8-alpha.0...@logicflow/extension@1.1.9-alpha.0) (2022-03-25)

### Bug Fixes

- 修复新增分组子节点未被记录的问题 ([24d9fc9](https://github.com/didi/LogicFlow/commit/24d9fc9d056f34141520da4a3f9482fe031ec325))

## [1.1.8](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.8-alpha.0...@logicflow/extension@1.1.8) (2022-03-25)

### Bug Fixes

- 修复新增分组子节点未被记录的问题 ([24d9fc9](https://github.com/didi/LogicFlow/commit/24d9fc9d056f34141520da4a3f9482fe031ec325))

## [1.1.8-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.7-alpha.0...@logicflow/extension@1.1.8-alpha.0) (2022-03-25)

### Bug Fixes

- 修复了`group`插件在多个`group`节点一起被折叠报错的问题。 ([396736e](https://github.com/didi/LogicFlow/commit/396736e07c320985f7c779b272085ba1f66f1083))
- group undo cannot fold ([5860d7e](https://github.com/didi/LogicFlow/commit/5860d7ef4770f655fab1bb5ee6114dc63757b725))
- node resize can`t set shape attributes ([9811e93](https://github.com/didi/LogicFlow/commit/9811e931adcab3e9c4ec5836e40d5ca766eb04e4))

### Features

- add node resize maxwidth and maxheight ([e98f575](https://github.com/didi/LogicFlow/commit/e98f575d19c5c7c9a74c7ad3302c1a8cb02bd5e3))
- optimize drag node behavior ([f88042d](https://github.com/didi/LogicFlow/commit/f88042d5623a0983003bd70098b4e0c12ba60d3d))

## [1.1.7](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.7-alpha.0...@logicflow/extension@1.1.7) (2022-03-07)

### Bug Fixes

- node resize can`t set shape attributes ([9811e93](https://github.com/didi/LogicFlow/commit/9811e931adcab3e9c4ec5836e40d5ca766eb04e4))

## [1.1.7-alpha.1](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.7-alpha.0...@logicflow/extension@1.1.7-alpha.1) (2022-03-04)

### Bug Fixes

- node resize can`t set shape attributes ([9811e93](https://github.com/didi/LogicFlow/commit/9811e931adcab3e9c4ec5836e40d5ca766eb04e4))

## [1.1.7-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.6...@logicflow/extension@1.1.7-alpha.0) (2022-03-03)

### Performance Improvements

- 优化layout trunk ([e261441](https://github.com/didi/LogicFlow/commit/e261441e6b3ab928939bda43101dd5e0348da9f8))

## [1.1.6](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.5...@logicflow/extension@1.1.6) (2022-03-02)

**Note:** Version bump only for package @logicflow/extension

## [1.1.5](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.4...@logicflow/extension@1.1.5) (2022-03-02)

**Note:** Version bump only for package @logicflow/extension

## [1.1.4](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.3...@logicflow/extension@1.1.4) (2022-02-23)

**Note:** Version bump only for package @logicflow/extension

## [1.1.3](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.3-alpha.0...@logicflow/extension@1.1.3) (2022-02-18)

**Note:** Version bump only for package @logicflow/extension

## [1.1.3-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.1...@logicflow/extension@1.1.3-alpha.0) (2022-02-18)

### Features

- remove console ([7771e65](https://github.com/didi/LogicFlow/commit/7771e6591dd25e51077930da4fe985d5e280d7e9))

## [1.1.2](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.1...@logicflow/extension@1.1.2) (2022-02-10)

### Features

- remove console ([7771e65](https://github.com/didi/LogicFlow/commit/7771e6591dd25e51077930da4fe985d5e280d7e9))

## [1.1.1](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.0...@logicflow/extension@1.1.1) (2022-02-10)

### Features

- check width and height type ([141c667](https://github.com/didi/LogicFlow/commit/141c6678503870a9d7503864353ad6cc7493fd24))

# [1.1.0](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.0-alpha.7...@logicflow/extension@1.1.0) (2022-02-09)

**Note:** Version bump only for package @logicflow/extension

# [1.1.0-alpha.7](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.0-alpha.6...@logicflow/extension@1.1.0-alpha.7) (2022-02-09)

### Features

- group listen node:dnd-drag event ([3934d9c](https://github.com/didi/LogicFlow/commit/3934d9cb40dbe38aafccf4f94b0c880204fd1c1d))

# [1.1.0-alpha.6](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.0-alpha.4...@logicflow/extension@1.1.0-alpha.6) (2022-01-27)

### Bug Fixes

- not create new edge while edge source and target both in group ([9ec3197](https://github.com/didi/LogicFlow/commit/9ec31975a81f0fc75f13fd54b6624dbd953b04c2))

# [1.1.0-alpha.5](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.0-alpha.4...@logicflow/extension@1.1.0-alpha.5) (2022-01-27)

### Bug Fixes

- not create new edge while edge source and target both in group ([9ec3197](https://github.com/didi/LogicFlow/commit/9ec31975a81f0fc75f13fd54b6624dbd953b04c2))

# [1.1.0-alpha.4](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.0-alpha.2...@logicflow/extension@1.1.0-alpha.4) (2022-01-27)

### Bug Fixes

- extensition-GroupShrink console->throw error ([c7cf0ef](https://github.com/didi/LogicFlow/commit/c7cf0effc1ba5ac171dfe345400ffe307386f0da))
- use autoToFront property take node to front ([3a8a7cc](https://github.com/didi/LogicFlow/commit/3a8a7cc6a981f53837f8774aa3130b7e6d5593b9))

### Features

- add attribute visible to element ([4676427](https://github.com/didi/LogicFlow/commit/46764279f6667354b1d67186e0f131f764c3eb79))
- add extension-GroupShrink ([99e5414](https://github.com/didi/LogicFlow/commit/99e5414be5ac0168128320f255eb0882251c7a9c))
- add graph:rendered event ([a3838c3](https://github.com/didi/LogicFlow/commit/a3838c385328bc9e3a41e39c555736d5f59de573))
- add group hook ([a955e7c](https://github.com/didi/LogicFlow/commit/a955e7ca151e0dd547a3995bbfed42e68f25183a))
- group support fold ([c1d8c10](https://github.com/didi/LogicFlow/commit/c1d8c109b25a3145c8c6858c4b6b5f0b6bf072ba))
- group support getAddableOutlineStyle ([a34f58c](https://github.com/didi/LogicFlow/commit/a34f58c11e9e73ab6dfd9536ac0980368281e62c))
- group support resize ([d9e2403](https://github.com/didi/LogicFlow/commit/d9e2403e00bce05c65d4d5b018ac3e2b9072cecd))

# [1.1.0-alpha.2](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.0-alpha.1...@logicflow/extension@1.1.0-alpha.2) (2022-01-21)

**Note:** Version bump only for package @logicflow/extension

# [1.1.0-alpha.1](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.1.0-alpha.0...@logicflow/extension@1.1.0-alpha.1) (2022-01-21)

**Note:** Version bump only for package @logicflow/extension

# [1.1.0-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.0.7...@logicflow/extension@1.1.0-alpha.0) (2022-01-20)

### Features

- change MiniMap.show -> lf.extension.miniMap.show ([39e1a2f](https://github.com/didi/LogicFlow/commit/39e1a2fb254e480418275641880f454e5101e0c3))
- **extension:** htmlNode resize ([24209af](https://github.com/didi/LogicFlow/commit/24209afc16f8dd7acf824fd5231ee3e8266d45d7))

## [1.0.7](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.0.7-alpha.1...@logicflow/extension@1.0.7) (2022-01-18)

**Note:** Version bump only for package @logicflow/extension

## [1.0.7-alpha.1](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.0.7-alpha.0...@logicflow/extension@1.0.7-alpha.1) (2022-01-18)

### Features

- add lfJson2Xml and lfXml2Json ([928a0d4](https://github.com/didi/LogicFlow/commit/928a0d42fd7cba383fe4768d1eafd01b59b668c3))

## [1.0.7-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.0.4...@logicflow/extension@1.0.7-alpha.0) (2022-01-18)

### Bug Fixes

- bpmn example use new control ([eb11ffa](https://github.com/didi/LogicFlow/commit/eb11ffa464e563946b58f7e0f18e2bc58383d9c0))
- dnd-panel render ([26799eb](https://github.com/didi/LogicFlow/commit/26799ebe5ff1f396cb01c14b71ae8482ba4e2f50))
- graphDownload ([2e94d30](https://github.com/didi/LogicFlow/commit/2e94d300b15784e6b29fde731c1eb87cacb82869))
- pattern callback ([1d29050](https://github.com/didi/LogicFlow/commit/1d290501712f74b13a1e4f5d3ae2d85109aa55dd))
- rewrite control extension ([2e70363](https://github.com/didi/LogicFlow/commit/2e70363b7f1ac9fb3e0924f4cc439d412c6e492e))
- type error ShapeItem ([9551c6d](https://github.com/didi/LogicFlow/commit/9551c6d4cd973e3f8f1dab71cb908b755deb401c))
- typo ([facccdf](https://github.com/didi/LogicFlow/commit/facccdf3b98d44650c75e34a66ed33f5e0d8f75e))

## [1.0.4](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.0.0-alpha.12...@logicflow/extension@1.0.4) (2022-01-12)

### Bug Fixes

- mini map viewport ([38c2408](https://github.com/didi/LogicFlow/commit/38c2408e0f8a76dd0b49b9271dd259fd8b6fa684))

### Features

- release 1.0.0🎉🎉 ([670fed7](https://github.com/didi/LogicFlow/commit/670fed7fa3e0cb0ee39501251d177c693694ef59))
- remove node selection ([92d4b7a](https://github.com/didi/LogicFlow/commit/92d4b7a88727b8dd213487f09e1117afa5c48310))

## [1.0.1-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.0.0-alpha.12...@logicflow/extension@1.0.1) (2022-01-07)

### Features

- release 1.0.0🎉🎉 ([670fed7](https://github.com/didi/LogicFlow/commit/670fed7fa3e0cb0ee39501251d177c693694ef59))
- remove node selection ([92d4b7a](https://github.com/didi/LogicFlow/commit/92d4b7a88727b8dd213487f09e1117afa5c48310))

# [1.0.0-alpha.12](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.0.0-alpha.11...@logicflow/extension@1.0.0-alpha.12) (2021-12-30)

**Note:** Version bump only for package @logicflow/extension

# [1.0.0-alpha.11](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.0.0-alpha.10...@logicflow/extension@1.0.0-alpha.11) (2021-12-29)

**Note:** Version bump only for package @logicflow/extension

# [1.0.0-alpha.10](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.0.0-alpha.9...@logicflow/extension@1.0.0-alpha.10) (2021-12-29)

**Note:** Version bump only for package @logicflow/extension

# [1.0.0-alpha.9](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.0.0-alpha.8...@logicflow/extension@1.0.0-alpha.9) (2021-12-24)

### Features

- remove hideOutline ([be86fb1](https://github.com/didi/LogicFlow/commit/be86fb118bd8bb1bd67a999802544eb2d10df0da))

# [1.0.0-alpha.8](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.0.0-alpha.7...@logicflow/extension@1.0.0-alpha.8) (2021-12-22)

**Note:** Version bump only for package @logicflow/extension

# [1.0.0-alpha.7](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.0.0-alpha.6...@logicflow/extension@1.0.0-alpha.7) (2021-12-22)

### Bug Fixes

- node resize set default style ([b9def97](https://github.com/didi/LogicFlow/commit/b9def9763f1fa0464c42adeffebf37fe20543151))

# [1.0.0-alpha.6](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.0.0-alpha.4...@logicflow/extension@1.0.0-alpha.6) (2021-12-22)

### Bug Fixes

- edge setProperties in vue ([ecdaf34](https://github.com/didi/LogicFlow/commit/ecdaf34ad170e410ad979af8413e87bf86e8345b))
- lf.select -> lf.selectElementById ([f4eea2c](https://github.com/didi/LogicFlow/commit/f4eea2c23ec6ac44acbd404b35d94b74fbb69d00))
- mini map ([822adf9](https://github.com/didi/LogicFlow/commit/822adf9bddc53f9c82cd26790e8f83b9eb67f093))

# [1.0.0-alpha.4](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.14...@logicflow/extension@1.0.0-alpha.4) (2021-12-21)

### Bug Fixes

- use model instead of getAttribute ([0e51cb0](https://github.com/didi/LogicFlow/commit/0e51cb0681c458bf68a69b8459ce0a4b91951ea4))
- version typo ([edc73ed](https://github.com/didi/LogicFlow/commit/edc73ede58859412fa1183fb3237013e4c56e9ad))

### Features

- custom edge ([81cd3be](https://github.com/didi/LogicFlow/commit/81cd3be6a9940553d2eec75b77a3472fdf75eb88))
- use loose class properties ([921a09b](https://github.com/didi/LogicFlow/commit/921a09ba4b30a819eb315316e174a7bccfc9ffc8))

# [1.0.0-alpha.3](https://github.com/didi/LogicFlow/compare/@logicflow/extension@1.0.0-alpha.1...@logicflow/extension@1.0.0-alpha.3) (2021-12-09)

**Note:** Version bump only for package @logicflow/extension

# [1.0.0-alpha.1](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.13...@logicflow/extension@1.0.0-alpha.1) (2021-12-09)

### Bug Fixes

- version typo ([edc73ed](https://github.com/didi/LogicFlow/commit/edc73ede58859412fa1183fb3237013e4c56e9ad))

### Features

- use loose class properties ([921a09b](https://github.com/didi/LogicFlow/commit/921a09ba4b30a819eb315316e174a7bccfc9ffc8))

## [0.7.13](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.12...@logicflow/extension@0.7.13) (2021-12-09)

### Bug Fixes

- add disabled_delete attr in node-selection ([6b103d5](https://github.com/didi/LogicFlow/commit/6b103d56add41d22e35391627588288cadced47b))
- add disableNodeSelection callback in node-selection ([de21347](https://github.com/didi/LogicFlow/commit/de21347a9dff06a079ab7fe7ca35dc89f2206538))
- fix addNodeSelection methods in node-selection plugin ([f75afd4](https://github.com/didi/LogicFlow/commit/f75afd4678de91c11d97aa1c628a0b8417f01ed9))

### Features

- babel use loose mode ([7fed1fb](https://github.com/didi/LogicFlow/commit/7fed1fb9557e3ac7f6f7fc11ad3afcc1d3d7bad8))

## [0.7.13-alpha.1](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.13-alpha.0...@logicflow/extension@0.7.13-alpha.1) (2021-12-07)

### Features

- babel use loose mode ([a48deef](https://github.com/didi/LogicFlow/commit/a48deef1c58e6e8d3f90463082207797fb9b771c))

## [0.7.13-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.12...@logicflow/extension@0.7.13-alpha.0) (2021-12-07)

### Bug Fixes

- fix addNodeSelection methods in node-selection plugin ([f75afd4](https://github.com/didi/LogicFlow/commit/f75afd4678de91c11d97aa1c628a0b8417f01ed9))

## [0.7.12](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.11...@logicflow/extension@0.7.12) (2021-12-04)

**Note:** Version bump only for package @logicflow/extension

## [0.7.11](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.10...@logicflow/extension@0.7.11) (2021-11-30)

### Features

- support disabled tool in core package ([1c7527f](https://github.com/didi/LogicFlow/commit/1c7527fc75929c444d9e5fb4b0b70b87086694c8))

## [0.7.10](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.9...@logicflow/extension@0.7.10) (2021-11-26)

### Features

- add mind map plugin ([11ae7e0](https://github.com/didi/LogicFlow/commit/11ae7e06f878cb6b8c82f2f73f74e8e4620fecb6))
- hide mind map ([2aa1120](https://github.com/didi/LogicFlow/commit/2aa112002023b87188c9b132dbeb6c77e92e17bf))

## [0.7.9](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.8...@logicflow/extension@0.7.9) (2021-11-23)

### Bug Fixes

- context menu edge icon position ([f06ead4](https://github.com/didi/LogicFlow/commit/f06ead4e687498550012e654765430d1fa1f48a2))
- nodeResize outline bugfix ([8e76f5f](https://github.com/didi/LogicFlow/commit/8e76f5f8e79a18189f48339b85904b06d29cfda2))

### Features

- context-menu use className ([e58eaea](https://github.com/didi/LogicFlow/commit/e58eaea67aaf7c8f420aed849a4f77b753a1bc6c))

## [0.7.8](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.7...@logicflow/extension@0.7.8) (2021-11-22)

### Bug Fixes

- nodeResize getResizeShape bugfix ([e617013](https://github.com/didi/LogicFlow/commit/e617013f979cd67dbe438dad141f0eef25690aa2))

### Features

- export context menu ([f0ff960](https://github.com/didi/LogicFlow/commit/f0ff960a2518cfe0e3f9d2a5abb843b87957def6))

## [0.7.7](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.6...@logicflow/extension@0.7.7) (2021-11-19)

### Features

- add context menu plugin ([8c5d7a8](https://github.com/didi/LogicFlow/commit/8c5d7a84309ba8d07fbbb99dcebcae81b521bd06))

## [0.7.6](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.5...@logicflow/extension@0.7.6) (2021-11-11)

### Bug Fixes

- minimap become invisible when repeat init ([ad488fd](https://github.com/didi/LogicFlow/commit/ad488fde9041834e9e809eb38904c013751d9cc8))

## [0.7.5](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.4...@logicflow/extension@0.7.5) (2021-11-08)

**Note:** Version bump only for package @logicflow/extension

## [0.7.4](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.3...@logicflow/extension@0.7.4) (2021-11-04)

**Note:** Version bump only for package @logicflow/extension

## [0.7.3](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.2...@logicflow/extension@0.7.3) (2021-11-03)

**Note:** Version bump only for package @logicflow/extension

## [0.7.2](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.1...@logicflow/extension@0.7.2) (2021-10-22)

**Note:** Version bump only for package @logicflow/extension

## [0.7.1](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.7.1-alpha.0...@logicflow/extension@0.7.1) (2021-10-21)

**Note:** Version bump only for package @logicflow/extension

## [0.7.1-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.6.16...@logicflow/extension@0.7.1-alpha.0) (2021-10-21)

## 0.7.1-alpha.0 (2021-10-21)

### Bug Fixes

- format bpmn xml ([e3c9159](https://github.com/didi/LogicFlow/commit/e3c91599ced342ac64d92f54228bf8145cf52378))

### Features

- add increase overlap mode ([06068e4](https://github.com/didi/LogicFlow/commit/06068e4caa11544b709697d101063838020dc4d1))
- avoid add id in dom ([37cccb6](https://github.com/didi/LogicFlow/commit/37cccb6fc75451b25254c1ccda4c581f2bb5ce51)), closes [#309](https://github.com/didi/LogicFlow/issues/309)
- remove object attributes ([a242500](https://github.com/didi/LogicFlow/commit/a242500edf2e2e197cd0a015d2e490e474ff585e))

## [0.6.16](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.6.13...@logicflow/extension@0.6.16) (2021-09-04)

### Bug Fixes

- **examples:** modified examples page title ([3a9ae5e](https://github.com/didi/LogicFlow/commit/3a9ae5ed100405378ed468574ca61445bef44035))
- **extension:** snapshot bugfix after zooming ([c23c0fa](https://github.com/didi/LogicFlow/commit/c23c0fa2d8ec0825f4319def7b98388cc3a09997))

## [0.6.13](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.6.12...@logicflow/extension@0.6.13) (2021-08-19)

### Bug Fixes

- **extension:** init isDefalutStopMoveGraph of SelectionSelect ([88ec07b](https://github.com/didi/LogicFlow/commit/88ec07bb5d4d7ae6e242e68e46e4bc4278f5a17e))

### Features

- group ([2c75b81](https://github.com/didi/LogicFlow/commit/2c75b810d2bda185e37e029a5fe28503f299e412))
- merge master ([cead588](https://github.com/didi/LogicFlow/commit/cead5887df27bd7624c46000966257a73b5a95e0))
- mvp demo ([12d5e96](https://github.com/didi/LogicFlow/commit/12d5e9684bad4a465e1b57a1217aceed73453d59))
- 增加移动节点跳过校验规则功能 ([659b83e](https://github.com/didi/LogicFlow/commit/659b83eb8ab6c8f3a1f60333e11e24777795a14b))

## [0.6.12](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.6.5...@logicflow/extension@0.6.12) (2021-08-17)

### Bug Fixes

- **extension:** snapshot forginObject in svg fix ([ef937a0](https://github.com/didi/LogicFlow/commit/ef937a08f2f4898b99376d06c25ee57c3f81fda2))

### Features

- add custom TextPosition ([352047d](https://github.com/didi/LogicFlow/commit/352047d942cc505f36272ba1a64bae33c13b5897))
- edgemodel support override getTextPosition ([5ede6f2](https://github.com/didi/LogicFlow/commit/5ede6f295c128c5f8c87af789105576f1f04ba57))
- increase width and height of snapshot data ([e223510](https://github.com/didi/LogicFlow/commit/e2235105899982a2a63c83d613c0268d111deecd))
- set anchors id ([17c4105](https://github.com/didi/LogicFlow/commit/17c4105474084b01c656298b30c28d0cd2908a36))
- **extension:** support for obtaining snapshot data ([aac9fe0](https://github.com/didi/LogicFlow/commit/aac9fe0fa62573ae43faa5f7473df3761f10d2cc))

## [0.6.8](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.6.5...@logicflow/extension@0.6.8) (2021-08-06)

### Bug Fixes

- **extension:** snapshot forginObject in svg fix ([ef937a0](https://github.com/didi/LogicFlow/commit/ef937a08f2f4898b99376d06c25ee57c3f81fda2))

### Features

- edgemodel support override getTextPosition ([5ede6f2](https://github.com/didi/LogicFlow/commit/5ede6f295c128c5f8c87af789105576f1f04ba57))
- set anchors id ([17c4105](https://github.com/didi/LogicFlow/commit/17c4105474084b01c656298b30c28d0cd2908a36))
- **extension:** support for obtaining snapshot data ([aac9fe0](https://github.com/didi/LogicFlow/commit/aac9fe0fa62573ae43faa5f7473df3761f10d2cc))

## [0.6.5](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.6.4...@logicflow/extension@0.6.5) (2021-07-29)

**Note:** Version bump only for package @logicflow/extension

## [0.6.4](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.6.2...@logicflow/extension@0.6.4) (2021-07-28)

**Note:** Version bump only for package @logicflow/extension

## [0.6.3](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.6.2...@logicflow/extension@0.6.3) (2021-07-28)

**Note:** Version bump only for package @logicflow/extension

## [0.6.2](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.6.1...@logicflow/extension@0.6.2) (2021-07-28)

**Note:** Version bump only for package @logicflow/extension

## [0.6.1](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.6.0...@logicflow/extension@0.6.1) (2021-07-19)

**Note:** Version bump only for package @logicflow/extension

# [0.6.0](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.11...@logicflow/extension@0.6.0) (2021-07-14)

### Bug Fixes

- new selection select ([4fc34d4](https://github.com/towersxu/logicflow/commit/4fc34d41e1000629362c141a8c6a2eb033ecf17d))
- use pluginName replace name ([2b2706a](https://github.com/towersxu/logicflow/commit/2b2706a4596eaee5fb6e88328a219ebc9366505c))
- 修复control组件某些情况下无法销毁的问题 ([47fc75d](https://github.com/towersxu/logicflow/commit/47fc75dd942cba1c5cd441110b4d4e2e07ffc7a3))
- **textension:** rename function getShapeReise to getResizeShape ([88d6d53](https://github.com/towersxu/logicflow/commit/88d6d531dd6232a2abb952468fae0086813bce78))

### Features

- 解决bpmn element 导出model和view存在的问题 ([c6a259a](https://github.com/towersxu/logicflow/commit/c6a259af7af307795ab6b07d1a23c5208b6a89e4))
- **extension:** node resize update ([5434840](https://github.com/towersxu/logicflow/commit/5434840692f741dfb71e385e07f1fe539f3355b1))

# [0.5.0](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.11...@logicflow/extension@0.5.0) (2021-06-18)

### Bug Fixes

- use pluginName replace name ([8bf1a08](https://github.com/towersxu/logicflow/commit/8bf1a0892e61f619204b7b621902f36f9ad3e204))
- 修复control组件某些情况下无法销毁的问题 ([47fc75d](https://github.com/towersxu/logicflow/commit/47fc75dd942cba1c5cd441110b4d4e2e07ffc7a3))
- **textension:** rename function getShapeReise to getResizeShape ([88d6d53](https://github.com/towersxu/logicflow/commit/88d6d531dd6232a2abb952468fae0086813bce78))

### Features

- **extension:** node resize update ([5434840](https://github.com/towersxu/logicflow/commit/5434840692f741dfb71e385e07f1fe539f3355b1))

## [0.4.15](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.11...@logicflow/extension@0.4.15) (2021-06-17)

### Bug Fixes

- 修复control组件某些情况下无法销毁的问题 ([47fc75d](https://github.com/towersxu/logicflow/commit/47fc75dd942cba1c5cd441110b4d4e2e07ffc7a3))
- **textension:** rename function getShapeReise to getResizeShape ([88d6d53](https://github.com/towersxu/logicflow/commit/88d6d531dd6232a2abb952468fae0086813bce78))

### Features

- **extension:** node resize update ([5434840](https://github.com/towersxu/logicflow/commit/5434840692f741dfb71e385e07f1fe539f3355b1))

## [0.4.14](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.11...@logicflow/extension@0.4.14) (2021-06-16)

### Bug Fixes

- 修复control组件某些情况下无法销毁的问题 ([4f2875d](https://github.com/towersxu/logicflow/commit/4f2875d601d0c959d70861fc2c901748f7c75616))
- **textension:** rename function getShapeReise to getResizeShape ([88d6d53](https://github.com/towersxu/logicflow/commit/88d6d531dd6232a2abb952468fae0086813bce78))

### Features

- **extension:** node resize update ([5434840](https://github.com/towersxu/logicflow/commit/5434840692f741dfb71e385e07f1fe539f3355b1))

## [0.4.13](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.11...@logicflow/extension@0.4.13) (2021-06-09)

### Bug Fixes

- **textension:** rename function getShapeReise to getResizeShape ([88d6d53](https://github.com/towersxu/logicflow/commit/88d6d531dd6232a2abb952468fae0086813bce78))

### Features

- **extension:** node resize update ([5434840](https://github.com/towersxu/logicflow/commit/5434840692f741dfb71e385e07f1fe539f3355b1))

## [0.4.12](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.11...@logicflow/extension@0.4.12) (2021-05-31)

**Note:** Version bump only for package @logicflow/extension

## [0.4.11](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.10...@logicflow/extension@0.4.11) (2021-05-31)

**Note:** Version bump only for package @logicflow/extension

## [0.4.10](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.9...@logicflow/extension@0.4.10) (2021-05-28)

### Bug Fixes

- use Control. \_\_tool ([c739586](https://github.com/towersxu/logicflow/commit/c739586dd261ead077b2c86fefb7c6cc726b6f33))

## [0.4.9](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.7...@logicflow/extension@0.4.9) (2021-05-28)

### Bug Fixes

- extension destroy domContainer is undefined ([6f8fe13](https://github.com/towersxu/logicflow/commit/6f8fe1379aa5307ef2ba48bfb6d5072dfa132f33))

## [0.4.8](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.7...@logicflow/extension@0.4.8) (2021-05-25)

**Note:** Version bump only for package @logicflow/extension

## [0.4.7](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.4...@logicflow/extension@0.4.7) (2021-05-24)

### Features

- 自定义节点model支持获取graphModel ([4ae15aa](https://github.com/towersxu/logicflow/commit/4ae15aa243ae91184145be0df0cbb42baeb88de4))

## [0.4.6](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.5...@logicflow/extension@0.4.6) (2021-05-21)

**Note:** Version bump only for package @logicflow/extension

## [0.4.5](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.4...@logicflow/extension@0.4.5) (2021-05-21)

### Features

- 自定义节点model支持获取graphModel ([71927f6](https://github.com/towersxu/logicflow/commit/71927f6947d27422bb0157898271d18d9ed2c84b))

## [0.4.4](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.3...@logicflow/extension@0.4.4) (2021-05-19)

### Features

- dndpanel support properties, related [#181](https://github.com/towersxu/logicflow/issues/181) ([765416c](https://github.com/towersxu/logicflow/commit/765416c6051559f529cb5af1fe9d5d14304f3cf1))
- **docs:** add docs for NodeResize ([2a629bc](https://github.com/towersxu/logicflow/commit/2a629bc77641a88d63dbb3263f60b85a26bf227c))

## [0.4.3](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.2...@logicflow/extension@0.4.3) (2021-05-16)

### Bug Fixes

- polygon case error ([6c6e821](https://github.com/towersxu/logicflow/commit/6c6e821fb5fbc2d678235264b8caca42c97f44d2))
- remove unnecessary console ([102bd81](https://github.com/towersxu/logicflow/commit/102bd8179d5dd5f84e677ad39b209f49d2ee3a1b))
- typo ([5326634](https://github.com/towersxu/logicflow/commit/5326634b74768b6d630e83279983a68d1265fa83))

### Features

- **extension:** endEvent node hide anchor ([6e2333f](https://github.com/towersxu/logicflow/commit/6e2333f2af8a214530a2c2ed3c1dc5597fcd68f1))

## [0.4.2](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.3.6...@logicflow/extension@0.4.2) (2021-05-13)

### Bug Fixes

- build support ie ([4a90d5e](https://github.com/towersxu/logicflow/commit/4a90d5e0bb20f8dfd2f4ab88db5c691894521298))
- change the points type ([766c34b](https://github.com/towersxu/logicflow/commit/766c34b1276b3c0221bf0aeb6e7b7716e3b362dc))
- loop path unique ([dc88286](https://github.com/towersxu/logicflow/commit/dc88286ea09cb00b2b64e5d4ab5a751d2fdae03e))
- occasionally read isAllPass of undefined ([dac3d41](https://github.com/towersxu/logicflow/commit/dac3d4118aff2699497512ca799912deaa0b4930))
- types ([a49bf16](https://github.com/towersxu/logicflow/commit/a49bf16e8ee994f1bacc4015deb054a9eeb44895))
- update registerElement API in extension ([df25d11](https://github.com/towersxu/logicflow/commit/df25d110eee7051ee9357b11f669d80a3de1e0ea))

### Features

- add get flow path extension ([6a15d11](https://github.com/towersxu/logicflow/commit/6a15d110b83f92b0c147cb6935735f5345090f7f))
- auto layout tmp ([ac58232](https://github.com/towersxu/logicflow/commit/ac58232150d58bd655b9e2180df9b545fbf46c0c))
- register support config ([074c584](https://github.com/towersxu/logicflow/commit/074c58443df30b8d0a0beeee8deb1d0866f90f66))
- support class as extension ([ac66e9f](https://github.com/towersxu/logicflow/commit/ac66e9ffd6709a605c48b61281be102429524b82))
- support ie11 ([46df695](https://github.com/towersxu/logicflow/commit/46df6951b1af5b1e46bea4ed084aa6abd5ebddf0))
- support keep path id ([65c42e6](https://github.com/towersxu/logicflow/commit/65c42e6820ee512d2527e999304d03a8a5c48713))
- **extension:** node resize ([35e3a0a](https://github.com/towersxu/logicflow/commit/35e3a0a4291fea87fe55238d1ca377664b2676ed))
- **extension:** rect node resize ([399afb5](https://github.com/towersxu/logicflow/commit/399afb545b421345ca3ea823d60f2d47db1e0d72))

## [0.4.1-alpha.1](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.0...@logicflow/extension@0.4.1-alpha.1) (2021-05-12)

### Bug Fixes

- loop path unique ([64d4023](https://github.com/towersxu/logicflow/commit/64d4023ccc822861d5fc4160222d02c0c2e5b814))
- occasionally read isAllPass of undefined ([e413970](https://github.com/towersxu/logicflow/commit/e41397064f208c8f9daa76399397a69bdf4a133f))
- types ([601777a](https://github.com/towersxu/logicflow/commit/601777a2717056e9b2aff48e631d4de4d2aa1718))
- **extension:** merge v0.4 ([3ce2a7c](https://github.com/towersxu/logicflow/commit/3ce2a7c13e02828c701b523135c0275011c592c8))

### Features

- add get flow path extension ([251fc88](https://github.com/towersxu/logicflow/commit/251fc88d801000c5854da8cd1b85d55a52f82c96))
- auto layout tmp ([356214e](https://github.com/towersxu/logicflow/commit/356214e6e202601769b93bb1ead137e3ce674939))
- support class as extension ([e3c40d1](https://github.com/towersxu/logicflow/commit/e3c40d1e3e648b58597f33cb8330b42ce6d76079))
- support keep path id ([8713aaf](https://github.com/towersxu/logicflow/commit/8713aafc3968601eb2486ca2df6fd95d7986ea52))
- **extension:** node resize ([5e2577c](https://github.com/towersxu/logicflow/commit/5e2577cd87d81c036fd5bbff174959b58b6c88ef))
- **extension:** rect node resize ([9d25526](https://github.com/towersxu/logicflow/commit/9d25526c8bdbf0a64ecf4b66d5b755e498ccc2cd))

## [0.4.1-alpha.0](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.4.0...@logicflow/extension@0.4.1-alpha.0) (2021-05-06)

### Features

- add get flow path extension ([a56dd9a](https://github.com/towersxu/logicflow/commit/a56dd9a820c06d6c7036f044c643468d3592c336))
- support class as extension ([e3c40d1](https://github.com/towersxu/logicflow/commit/e3c40d1e3e648b58597f33cb8330b42ce6d76079))
- support keep path id ([fc7d3a8](https://github.com/towersxu/logicflow/commit/fc7d3a8917c0871d7e5b55f200a67cd41f0537fc))

# [0.4.0](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.3.6...@logicflow/extension@0.4.0) (2021-04-30)

### Bug Fixes

- change the points type ([a845deb](https://github.com/towersxu/logicflow/commit/a845debe66c734ea248718c79379f45af84f2a4b))
- update registerElement API in extension ([7798dbb](https://github.com/towersxu/logicflow/commit/7798dbbeef4b4d021d02b5d21d55f81ef7161d1e))

### Features

- register support config ([cae7c98](https://github.com/towersxu/logicflow/commit/cae7c9807eff77fcad9de2907c286c03b01b6aa9))
- support ie11 ([902e813](https://github.com/towersxu/logicflow/commit/902e81394a2d5945d7ceecfee58875f57f938fc8))

## [0.3.6](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.3.4...@logicflow/extension@0.3.6) (2021-04-29)

### Features

- **extension:** drop node in polyline ([94480ac](https://github.com/towersxu/logicflow/commit/94480ac5b2b8d989a2310a3b4c25e08abe9d10b6))

## [0.3.5](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.3.4...@logicflow/extension@0.3.5) (2021-04-29)

### Features

- **extension:** drop node in polyline ([94480ac](https://github.com/towersxu/logicflow/commit/94480ac5b2b8d989a2310a3b4c25e08abe9d10b6))

## [0.3.4](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.3.3...@logicflow/extension@0.3.4) (2021-04-22)

### Bug Fixes

- unexpect text position ([7559183](https://github.com/towersxu/logicflow/commit/7559183b1d218317cfe83396dc065b803362a948))

## [0.3.3](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.3.2...@logicflow/extension@0.3.3) (2021-04-21)

### Bug Fixes

- avoid reObserver view ([996fd65](https://github.com/towersxu/logicflow/commit/996fd6515d78b5331b08fd84025a148b45026cd9))
- bpmn exclusive gateway element text position ([baff6fe](https://github.com/towersxu/logicflow/commit/baff6fe2ffa1822791785470d55fbb49c048f9c6))
- types ([37491ca](https://github.com/towersxu/logicflow/commit/37491cab07d7712aa4b94326424af3ded5031f75))

## [0.3.2](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.3.1...@logicflow/extension@0.3.2) (2021-04-20)

### Bug Fixes

- show anchors when extend baseNode ([12bd0db](https://github.com/towersxu/logicflow/commit/12bd0db574b18b19aed8134b9e508f3c0a9ef6f4))

## [0.3.1](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.3.0...@logicflow/extension@0.3.1) (2021-04-19)

### Bug Fixes

- Gradient has outdated direction syntax ([48fdc1f](https://github.com/towersxu/logicflow/commit/48fdc1f3663d7f3a2c51563cbe7979332c9def18))
- menu error in vue ([4f123a9](https://github.com/towersxu/logicflow/commit/4f123a9e32ab17e3ecf30d5bbfaa773734e28437))

# [0.3.0](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.3.0-alpha.5...@logicflow/extension@0.3.0) (2021-04-13)

### Bug Fixes

- minimap support register node ([3a692e6](https://github.com/towersxu/logicflow/commit/3a692e6448d775ebdbd9c6f26fce79102c77fb3e))
- set the start position of selection when mouse is down ([c7d3715](https://github.com/towersxu/logicflow/commit/c7d3715b956ed99e80bcb19a51d2e21432cd1037))
- support custom style by class for mini-map ([4c97625](https://github.com/towersxu/logicflow/commit/4c97625774f65ed3d59caefc5c691fabf0adc499))
- **all:** add rimraf ([c526ad8](https://github.com/towersxu/logicflow/commit/c526ad840b1e2620a3221d416f7a03e9c6d3583c))

### Features

- **extension:** curved-edge ([1731b10](https://github.com/towersxu/logicflow/commit/1731b10e3e65ccf226b48d4fb572d90d2ad10dec))
- add the switch of SelectionSelect in Extension ([35baa89](https://github.com/towersxu/logicflow/commit/35baa89a9ded2be1ce1fe7392fc9e75121f8e0d7))
- add the UMD dist of BpmnAdapter and TurboAdapter in extension ([2edac3b](https://github.com/towersxu/logicflow/commit/2edac3b7b7fb6deb873f7268a5fdb9cc116ed8b3))
- **extension:** turbo-adapter ([1b4c99e](https://github.com/towersxu/logicflow/commit/1b4c99e1a2d1f996e4e3b65d39d6b586f0f69937))

# [0.3.0-alpha.5](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.3.0-alpha.4...@logicflow/extension@0.3.0-alpha.5) (2021-03-30)

### Features

- edge text support hover style ([ffc75d4](https://github.com/towersxu/logicflow/commit/ffc75d45e0ef42b9dbca1be489fa749186aa81b0))

# [0.3.0-alpha.4](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.3.0-alpha.2...@logicflow/extension@0.3.0-alpha.4) (2021-03-24)

### Bug Fixes

- **extension:** mini-map default disable control & selection-select ([297cecf](https://github.com/towersxu/logicflow/commit/297cecf4637ca7a045619a10cd9298feacc631ea))

# [0.3.0-alpha.3](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.3.0-alpha.2...@logicflow/extension@0.3.0-alpha.3) (2021-03-23)

### Bug Fixes

- **extension:** mini-map default disable control & selection-select ([297cecf](https://github.com/towersxu/logicflow/commit/297cecf4637ca7a045619a10cd9298feacc631ea))

# [0.3.0-alpha.2](https://github.com/towersxu/logicflow/compare/@logicflow/extension@0.3.0-alpha.1...@logicflow/extension@0.3.0-alpha.2) (2021-03-22)

### Bug Fixes

- minimap extension custom disabled plugin ([3768d14](https://github.com/towersxu/logicflow/commit/3768d149b6a72e4c251e287432b6070dcbfabce6))

# [0.3.0-alpha.1](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.3.0-alpha.0...@logicflow/extension@0.3.0-alpha.1) (2021-03-19)

### Features

- add getSelectElements function ([d6b5a81](https://github.com/didi/LogicFlow/commit/d6b5a81a76ba59cac319cb01a3187caf0fb216ea))

# [0.3.0-alpha.0](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.2.9...@logicflow/extension@0.3.0-alpha.0) (2021-03-18)

### Bug Fixes

- 🐛 add the name field for the extension components ([24a2831](https://github.com/didi/LogicFlow/commit/24a28316e90070f48813c29c5d3a95f00b0eb4bc))
- mini map import error type ([99767e2](https://github.com/didi/LogicFlow/commit/99767e28f12e96b4181ae281b2ef4ac419719c75))
- typo menu ([ad797e3](https://github.com/didi/LogicFlow/commit/ad797e3e6d4a3f8ebd36c044cf3b90865cd0c66d))

### Features

- add mini map extension ([10d4056](https://github.com/didi/LogicFlow/commit/10d405662c1cefaa8f1172e41f4419e5170807b8))
- add mini-map extension ([fa621da](https://github.com/didi/LogicFlow/commit/fa621daf2cc6a05cd5265bfe5245f5424f97ae7e))
- extension add destroy property ([23e59e5](https://github.com/didi/LogicFlow/commit/23e59e5902976fced92ad67ddd72f74938113c96))
- mini map position required ([907990e](https://github.com/didi/LogicFlow/commit/907990e5b1d10ee7b66ceac1a1104a4f46b00a6c))
- resize node ([2bc595e](https://github.com/didi/LogicFlow/commit/2bc595eadea58e1597f730520b830efc41a0dac5))
- **core:** add disable extension config & extension need name ([8bd9355](https://github.com/didi/LogicFlow/commit/8bd93555b7f82eb30a4813c986e3e642c86578fb))

## [0.2.9](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.2.8...@logicflow/extension@0.2.9) (2021-03-10)

**Note:** Version bump only for package @logicflow/extension

## [0.2.8](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.2.7...@logicflow/extension@0.2.8) (2021-03-05)

**Note:** Version bump only for package @logicflow/extension

## [0.2.7](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.2.6...@logicflow/extension@0.2.7) (2021-03-01)

**Note:** Version bump only for package @logicflow/extension

## [0.2.6](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.2.5...@logicflow/extension@0.2.6) (2021-03-01)

### Bug Fixes

- **extension:** 🐛fix undo error when custom text position ([fc6e7d7](https://github.com/didi/LogicFlow/commit/fc6e7d767889e8bbdd542a3c8006e352a86121c4))
- **extension:** fix adapter out data ([3941c4b](https://github.com/didi/LogicFlow/commit/3941c4ba2939ec1bcf452543e1da486fe2f64f9f))

### Features

- new plugin Selection & example ([2e4b489](https://github.com/didi/LogicFlow/commit/2e4b48958dff21617b6f7b08c9840deac0a178f0))
- **core:** copy paste and delete multiple selected elements ([4a5be86](https://github.com/didi/LogicFlow/commit/4a5be86c63c90b7c1c88e08e9d084e708307a80d))
- **core:** support use meta key select multiple element ([e137f9f](https://github.com/didi/LogicFlow/commit/e137f9fdbdb6bf3f85c3f7ac9323785e445844c8))

## [0.2.5](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.2.4...@logicflow/extension@0.2.5) (2021-02-23)

### Bug Fixes

- 🐛 fix the result of setting menu in model ([74494a5](https://github.com/didi/LogicFlow/commit/74494a5060620b7b2193ae73c1b41697dc36fd9e))
- **extension:** 🐛 fix bpmn demo download not work ([6cec577](https://github.com/didi/LogicFlow/commit/6cec57778ee833675176fe957a5a442ec21c1727))

## [0.2.4](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.2.3...@logicflow/extension@0.2.4) (2021-02-20)

**Note:** Version bump only for package @logicflow/extension

## [0.2.3](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.2.2...@logicflow/extension@0.2.3) (2021-02-19)

**Note:** Version bump only for package @logicflow/extension

## [0.2.2](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.2.1...@logicflow/extension@0.2.2) (2021-02-08)

### Bug Fixes

- **core:** change the priority of events ([5373797](https://github.com/didi/LogicFlow/commit/53737978d109088a2aeac1b4492fcbd69d16ec35))

## [0.2.1](https://github.com/didi/LogicFlow/compare/@logicflow/extension@0.1.0...@logicflow/extension@0.2.1) (2021-02-08)

### Bug Fixes

- **core:** fix checking repeatedly verification rules ([f0efbf4](https://github.com/didi/LogicFlow/commit/f0efbf481eb254bdaf29fd25b29ee1ee495d439b))

### Features

- **extension:** v0.2.0 ([ee67636](https://github.com/didi/LogicFlow/commit/ee676365b82d2d07d40cbc77e955eb3506690804))
- 替换文件夹名称 ([9155d8a](https://github.com/didi/LogicFlow/commit/9155d8a7af3cd0aff983f8a036bd3ffafd0d4d56))

# [0.2.0](https://github.com/didichuxing/LogicFlow/compare/@logicflow/extension@0.1.0...@logicflow/extension@0.2.0) (2021-02-01)

### Bug Fixes

- **core:** fix checking repeatedly verification rules ([f0efbf4](https://github.com/didichuxing/LogicFlow/commit/f0efbf481eb254bdaf29fd25b29ee1ee495d439b))

### Features

- 替换文件夹名称 ([9155d8a](https://github.com/didichuxing/LogicFlow/commit/9155d8a7af3cd0aff983f8a036bd3ffafd0d4d56))
- **extension:** v0.2.0 ([ee67636](https://github.com/didichuxing/LogicFlow/commit/ee676365b82d2d07d40cbc77e955eb3506690804))

# 0.1.0 (2020-12-29)

### Features

- init ([6ab4c32](https://github.com/didichuxing/LogicFlow/commit/6ab4c326063b9242010c89b6bf92885c3158e6b0))
- 更改包名增加scope ([27be341](https://github.com/didichuxing/LogicFlow/commit/27be3410c70f959093f928c792cf40f038e8adcc))
