---
title: LogicFlow 发布 2.0 版本
order: 0
toc: content
---

## 导读

LogicFlow 是一款滴滴客服技术团队开源的流程图编辑框架，它提供了一系列流程图交互、编辑所必需的功能和灵活的节点自定义、插件等拓展机制。自发布以来，LogicFlow 影响力持续增长，现已成为国内头部开源流程图编辑框架，GitHub star 数量已超过 7.4k，npm 下载量累计超过 900k。除了我们内部团队的使用外，还吸引了如美团、京东、华为等企业的技术团队在项目中应用 LogicFlow。

在开源后的平稳运营期间，我们逐渐发现了一些 LogicFlow 存在的短板：

- **简单定制场景下存在额外开发工作量**：LogicFlow 内置了一些基础图形类，用户可以结合诉求继承基础类做图形定制，但在一些诸如定制宽高、样式的简单定制场景下仍需要写继承逻辑，增加了使用成本；如果要定制一个基于前端框架(React 或 Vue)的图形，还需要通过特定的方法把组件挂载到节点上。
- **官方文档不够完善，用户上手成本较高**：现有版本的 README 和官方文档的引导性比较差，对刚接触的新手来说理解成本比较高；文档中对参数、属性、API 的细节描述存在缺失，想知道功能如何使用、如何配置需要从源码中查询。
- **工程目录复杂且缺乏引导，贡献者开发体验不佳**：LogicFlow 对外提供了 3 个功能包，在工程中以 monorepo 的方式进行管理。现有版本的源码工程中需要分别进入对应的目录下才能进行调试，项目调试指南没有在 README 中标明，需要用户自行寻找。

经过半年的努力，2.0 版本终于要和我们见面了。让我们一起看看 LogicFlow 2.0 带来了哪些新的变化吧！

## 2.0 带来了哪些变化

### 变化速查

- 产品功能增强：
  - 部分节点和边的属性支持初始化配置
  - 一系列插件进行了针对性的能力增强
  - 修复一系列已知问题；
- 新能力：
  - 新增 Label 插件，节点内容支持富文本
  - 新扩展包，支持基于 React/Vue 组件快速注册自定义节点
- 官网门户优化：
  - 首页整体结构调整：支持在首页在线调试画布，丰富首页展示内容
  - 文档优化：完善文档内容，增加文档内锚点导航，统一文档页交互
- 源码开发体验提升：
  - 重构项目结构，升级打包工具，优化开发流程

### 核心能力增强

LogicFLow 2.0 在功能性和稳定性方面都得到了显著提升，为用户和开发者提供了更强大的工具和能力支持。我们期待这些改进能带来更流畅的使用体验，并继续推动 LogicFLow 在各种应用场景中的广泛应用，主要功能变更点：

- **自定义形状和样式内置**：使用基础节点和边时，自定义形状和样式属性无需再通过继承的方式重新自定义，通过节点和边的 properties 属性进行配置，相同的能力，更快的实现。
<div>
  <img alt="自定义形状和样式内置" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/propertiesDemo.gif">
</div>

[//]: # (![自定义形状和样式内置]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/propertiesDemo.gif&#41;)
<p align=center>优化后效果</p>

- **节点 Resize 能力内置：** 通过全局设置 allowResize，或者给节点/边数据配置 resizable 属性就能直接开启 resize 缩放能力，无需再引入 NodeResize 插件。

<div>
  <img alt="自定义形状和样式内置" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/resize&rotateDemo.gif">
</div>

[//]: # (![节点 Resize 能力内置]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/resize&rotateDemo.gif&#41;)
<p align=center>优化后效果</p>

- **网格和画布优化**：优化了网格的内部逻辑，增加了画布自适应宽度、提高画布移动和滚动稳定性。
- **事件和状态优化**：修复了触摸板点击事件不生效、静默模式下快捷键和拖拽状态不更新的问题，确保了事件触发的稳定性和状态更新的及时性。
- **锚点功能增强**：修复了锚点相关的多个问题，包括连接边数量限制、自定义节点锚点的连线回显问题，并增加了默认错误提示。
- **Polyline 和克隆节点修复**：解决了 polyline 折线在拖动时回退问题，修复 cloneNode 方法复制节点后文本位置的错误问题。

### **扩展插件优化**

在 2.0 版本, 我们对多个插件进行了能力完善，提升插件性能，并带来了 多文本插件（Label） 和 动态分组插件（DynamicGroup），进一步丰富 LogicFlow 插件生态系统。

- **小地图插件优化**

由于小地图插件在实际使用过程中存在一些功能缺陷且性能较差，因此我们重构了小地图插件的实现逻辑，提升预览视窗交互流畅度和功能可靠性的同时还改进了小地图的更新策略，以减少画布移动时的性能消耗。
<div style="display: flex; justify-content: space-between">
  <img alt="MiniMap 1.x版本" style="border-radius: 5px; text-align: center; width: 49%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/minimapOldDemo.gif">
  <img alt="MiniMap 2.0版本" style="border-radius: 5px; text-align: center; width: 49%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/mini-map.gif">
</div>

[//]: # (![MiniMap 1.x版本]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/minimapOldDemo.gif&#41;![MiniMap 2.0版本]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/mini-map.gif&#41;)
新旧能力对比（左：旧 右：新）

- **画布导出插件优化**

尽管 1.0 版本下提供了画布导出能力，但功能单一难以满足用户诉求。因此，我们对导出功能做了增强支持更多参数配置，并修复了在线图片无法导出、开启局部渲染后导出图片不全的问题。

<div style="display: flex; justify-content: space-between">
  <img alt="Snapshot 1.x版本" style="border-radius: 5px; text-align: center; width: 49%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/snapshotOldDemo.gif">
  <img alt="Snapshot 2.0版本" style="border-radius: 5px; text-align: center; width: 49%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/snapshot.gif">
</div>

[//]: # (![Snapshot 1.x版本]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/snapshotOldDemo.gif&#41;![Snapshot 2.0版本]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/snapshot.gif&#41;)

新旧能力对比（左：旧 右：新）

- **框选插件优化**

1.0 版本下的框选插件实现简单，且存在阻塞页面滚动的问题，在 2.0 版本中我们调整了框选插件逻辑，修复问题的同时还丰富了插件的配置能力，支持用户配置框选判定范围和启用状态。

<div style="display: flex; justify-content: space-between">
  <img alt="SelectionSelect 1.x版本" style="border-radius: 5px; text-align: center; width: 49%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/selectionSelectOldDemo.gif">
  <img alt="SelectionSelect 2.0版本" style="border-radius: 5px; text-align: center; width: 49%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/selection-select.gif">
</div>

[//]: # (![SelectionSelect 1.x版本]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/selectionSelectOldDemo.gif&#41;![SelectionSelect 2.0版本]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/selection-select.gif&#41;)

新旧能力对比（左：旧 右：新）

- **全新的 DynamicGroup 插件**

1.0 版本 Group 插件在 API 命名以及实现方案上存在缺陷，比较多的 issue 都与之关联。而 Group 又是使用场景比较多的插件，因此，我们在节点内置 Resize 功能的基础上，推出了全新的 DynamicGroup 插件，欢迎大家使用，希望能够带来更好的体验。

<div>
  <img alt="DynamicGroup 插件" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/dynamic-group.gif">
</div>

[//]: # (![DynamicGroup 插件]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/dynamic-group.gif&#41;)

- **新增多文本插件**

LogicFlow 内置了文本显示及文本编辑能力，内置的文本在配置能力上不够丰富，且样式受限于 SVG text 节点和 foreignObject 节点的特性，在文本溢出模式配置上也体验不佳。

因此我们推出了 Label 插件，旨在增强节点和边上的文本展示。Label 插件主要有以下一些特性：

1.  提供了全局以及节点维度配置项，用户可灵活自定义；
2.  内置了富文本编辑能力，编辑态下选中文本即可增加富文本样式；
3.  每个节点或边上可以设置多个文本，增强显示能力。

<div>
  <img alt="Label 插件" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/label.gif">
</div>

[//]: # (![Label 插件]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/label.gif&#41;)

### 全新自定义节点扩展包

LogicFlow 虽然提供了通过继承 HTMLNode 自定义 HTML 节点的能力，但从用户反馈来看，这种方式不够直观且可能因为销毁时机不对而出现内存泄漏的性能问题。

通过对业内其它流程图产品研究对比，我们发现增强该能力对于提升用户开发体验非常有帮助。

因此我们提供了两个独立的包  `@logiclfow/react-node-registry`、`@logiclfow/vue-node-registry`，以一种更直观且快捷的方式来自定义 HTML 节点 —— 即使用 React 或 Vue 组件来注册节点。 它既可以直接复用宿主系统中已引入的丰富的组件库，也可以基于 React 和 Vue 开发方式来自定义节点内容。

### 建设更优质的官网门户

**主题更新，提升用户使用体验**

为了方便大家了解 LogicFlow 的能力，我们将首页 Banner 改造成了功能演示画布，大家可以在画布上自由配置节点内容，体验 LogicFlow 的能力。

<div>
  <img alt="Homepage Banner" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/homepageBanner.gif">
</div>

[//]: # (![Homepage Banner]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/homepageBanner.gif&#41;)

增加了合作伙伴展示模块（欢迎使用 LogicFlow 且有意向的企业联系我们)

<div>
  <img alt="Company List" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/comanylist.png">
</div>

[//]: # (![Company List]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/comanylist.png&#41;)

**文档内容页展示模式统一**

增加文档区占比，提升页面空间利用率。文档目录和文档内锚点路由拆分开，展示在文档内容两侧，方便用户更快速地找到所需模块。

<div>
  <img alt="统一网站布局结构" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/website-layout.png">
</div>

[//]: # (![统一网站布局结构]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/website-layout.png&#41;)

**快速上手内容调整**

我们重新调整了快速上手部分的内容。针对不同的使用场景，我们提供了更易于上手和理解的 demo，大家可以复制到本地并轻松地创建属于你的第一个 LogicFlow 应用。

<div>
  <img alt="快速上手" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/getting-started.png">
</div>

[//]: # (![快速上手]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/getting-started.png&#41;)

**实例方法内容补充并分类**

在 API 模块我们将方法按模块分类并且补充了已知的缺失内容，方便大家更高效地检索自己需要的内容。

<div>
  <img alt="实例方法" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/instance-method.png">
</div>

[//]: # (![实例方法]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/instance-method.png&#41;)

**完善基础示例并支持在线调试**

为了帮助大家前期快速学习了解 LogicFlow，我们新增了一系列基础示例并支持在线调试能力，大家可以结合自己的实际诉求选择示例快速调试。

<div>
  <img alt="示例列表" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/demo-list.png">
  <img alt="实例详情" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/demo-detail.png">
</div>

[//]: # (![示例列表]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/demo-list.png&#41;![示例详情]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/demo-detail.png&#41;)

### **更好的开发体验**

由于我们工程结构、文档等诸多原因，开发者很难参与到社区贡献，我们在 2.0 版本对工程结构进行了完善和规范，并丰富了贡献者引导文档，旨在降低贡献者的上手难度。欢迎大家积极参与贡献，一起向创造「最好的流程图框架」努力。

## 谁在使用

XIAOJUSURVEY 是滴滴开源的企业级问卷系统，一经开源便受到社区广泛关注。XIAOJUSURVEY 选择了 LogicFlow 作为跳转逻辑编排的核心技术栈，简化了复杂的逻辑规则编排和响应机制，使用户能够更直观地配置和管理跳转逻辑。

<div>
  <img alt="XIAOJUSURVEY" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/xiaoju-survey.png">
</div>

[//]: # (![XIAOJUSURVEY]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/xiaoju-survey.png&#41;)

马上使用可查：[XIAOJUSURVEY 跳转逻辑](https://github.com/didi/xiaoju-survey)

## 未来规划

### 功能规划

- **持续优化核心功能：**
  - 从用户需求出发，持续优化现有功能使用过程中的差体验，比如移动端适配
  - 丰富画布布局能力，包括线的布局算法、自动美化布局功能
- **丰富生态系统：** 开发更多插件、扩展包和官方示例，丰富 LogicFLow 的生态系统，支持用户更好地实现自定义和集成需求。

### 运营规划

- **输出文章与课程：** 定期发布 LogicFlow 实践经验沉淀文章；发布图编辑技术解读课程，帮助大家深入了解图编辑技术。
- **建立激励制度：** 建立核心贡献者社群并设定贡献激励机制，鼓励更多用户参与开发和贡献。
- **组织技术方案活动：** 开放技术方案讨论渠道，让社区成员参与决策和方案优化。
- **代码审查（CR）：** 设立代码审查流程，确保贡献的代码质量，并促进团队与社区的紧密合作。

## 致谢

首先，衷心感谢每一位为 LogicFlow 项目做出贡献的开发者以及所有的 LogicFlow 用户。正因为有大家的付出，LogicFlow 才得以不断成长和完善。

同时，感谢 X6 和 ReactFlow 等项目，通过对比，我们才能更好地了解自身的不足，并有针对性地进行优化和提升。

最后，特别感谢所有参与本版本开发的贡献者

[javaskip](https://github.com/javaskip), [boyongjiong](https://github.com/boyongjiong), [DymoneLewis](https://github.com/DymoneLewis), [ChangeSuger](https://github.com/ChangeSuger), [FanSun521](https://github.com/FanSun521), [CWsuper](https://github.com/CWsuper), [yiidot](https://github.com/yiidot), [iamlqw](https://github.com/iamlqw)

## 结语

在 LogicFlow 的发展过程中，我们深知开发者体验的重要性。我们致力于让每一位开发者都能轻松上手，迅速解决实际问题。通过不断优化，我们希望 LogicFlow 在流程图编辑领域能够成为开发者首选的工具，我们为此也会不断坚持前行。

## 联系我们

我们非常欢迎大家积极参与贡献，也欢迎大家联系我们与我们交流，如果能有个 Star 就更好啦～

- LogicFlow 官方网站： <https://site.logic-flow.cn/>
- github 仓库地址：<https://github.com/didi/LogicFlow>
- 交流群
  - 官方微信：请添加「LogicFlow 官方号 👨 」
      <div>
        <img alt="LogicFlow WeChat 官方号" style="border-radius: 18px; margin-left: 20px" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/wechat.png" width="300">
      </div>
  - QQ 讨论群：
      <div>
        <img alt="LogicFlow QQ 交流群" style="border-radius: 18px; margin-left: 20px" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/qq.png" width="300">
      </div>
  - 邮箱：<logicflow_official@163.com>
