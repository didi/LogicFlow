---
title: 1.1 升级到 1.2
order: 0
toc: content
---

### Breaking Changes

- 在`1.2`版本中，我们规范了在自定义元素可重写方法在`model`和`view`中的区别。如果不改变元素的 DOM 结构，只是需要基于 model 中的属性来修改元素的样式，则可以通过重写 model 提供的获取样式的方法来实现。如果需要修改元素的 DOM 结构，则需要重写`view`中提供的修改 DOM 结构方法实现。详细修改的方法如下：

  1. `view`中的`getArrowStyle`废弃，使用`model`中的`getArrowStyle`替代。

- 在`1.2`版本，我们对源码中一些拼写错误进行了修改，但是不涉及到 LogicFlow 提供的 API。但是 LogicFlow 提供的基于继承的自定义机制，可以让熟悉 LogicFlow 源码的同学绕过 LogicFlow 文档上的 API 进行高度自定义，所以我们选择发布一个新的 minor 版本。若您是基于 LogicFlow 提供的 API 或者示例开发，可以直接升级。若您在 LogicFlow 上涉及到绕过 API 进行自定义，可以安装 VSCode 插件 `Code Spell Checker` 快速找到拼写错误。

- LogicFlow 在`1.1`提供了拖动节点或者连线到画布边界时会自动扩展画布区域，在后续收到的反馈来看，这个交互会带来一定的解释成本，所以在`1.2`版本默认关闭此功能。大家可以在初始化 LogicFlow 时传如参数`autoExpand`为`true`来开启，现在改成默认为`false`。

- 在`1.2`版本中，我们对 React 18 的支持做了优化。

## 1.2.10

- bugfix:
  - 修复使用可缩放节点进行缩放后，节点锚点位置错乱的问题.[#807](https://github.com/didi/LogicFlow/issues/807)&[#875](https://github.com/didi/LogicFlow/issues/875)
  - 修复 Menu 插件中菜单在画布边界被遮挡的问题.[#1019](https://github.com/didi/LogicFlow/issues/1019)
  - 修复 Control 插件中移除控制面板上的控制项，但对应的控制项不存在时报错的问题.

## 1.2.9

- bugfix:
  - 修复重复设置`isSilentMode = true`导致后续设置错误的问题. [#1180](https://github.com/didi/LogicFlow/issues/1180)
  - 修复文字省略出现背景长度异常的问题. [#1151](https://github.com/didi/LogicFlow/issues/1151)
  - 修复节点宽高比太大出现连线与节点边重合的问题. [#817](https://github.com/didi/LogicFlow/issues/817)
  - 修复移动节点时，节点对应的连线上文本未移动的问题. [#1194](https://github.com/didi/LogicFlow/pull/1194)
  - 修复打开嵌套分组时，内部子分组仍处于折叠状态的问题. [#1145](https://github.com/didi/LogicFlow/issues/1145)

## 1.2.8

- bugfix:
  - 修复了自定义连线开始箭头不生效的问题。[#1167](https://github.com/didi/LogicFlow/issues/1167)
  - 修复了调整连线起终点并删除原节点后，无法移动连线文本的问题。
  - 修复了 node:dnd-add 事件触发时，未抛出 event 对象的问题。[#1170](https://github.com/didi/LogicFlow/issues/1170)

## 1.2.7

- bugfix:
  - 修复了快照导出贝塞尔曲线不完整的问题。[#1147](https://github.com/didi/LogicFlow/issues/1147)
  - 修复了 bpmn xml 格式数据错误的问题。[#1155](https://github.com/didi/LogicFlow/issues/1155)

## 1.2.6

- bugfix:
  - 修复了在边上插入节点未触发两边节点校验规则的问题。[#1078](https://github.com/didi/LogicFlow/issues/1078)
  - 修复了 bpmn xml 格式数据某些属性错误的问题。[#1142](https://github.com/didi/LogicFlow/pull/1142)
  - 修复了 undefined 被 pick 后覆盖默认值导致某些问题。[#1153](https://github.com/didi/LogicFlow/issues/1153)

## 1.2.5

- bugfix:
  - 修复了 bpmnAdapter 在处理 xml 格式数据时支持不完整的问题。[#718](https://github.com/didi/LogicFlow/issues/718)
  - 修复了在边上插入节点未触发两边节点校验规则的问题。
  - 修改了 React 18 的兼容性问题。[#1089](https://github.com/didi/LogicFlow/issues/1089)
  - 修复了分组折叠按钮被遮挡的问题。[#1099](https://github.com/didi/LogicFlow/issues/1099)
  - 修复了文本节点内容被完全删除后不显示的问题。[#1067](https://github.com/didi/LogicFlow/issues/1067)
  - 修复了节点被多选选中后，移动一个节点不能带着其他选中节点移动的问题。[#894](https://github.com/didi/LogicFlow/issues/894)

## 1.2.4

- bugfix
  - LogicFlow bpmn 插件默认生成的 xml isExecutable 为 false。[#571](https://github.com/didi/LogicFlow/issues/571)

## 1.2.3

- bugfix
  - 修复了框选节点后，移动节点出现连线位置不正确的问题。[#1027](https://github.com/didi/LogicFlow/issues/1027)

### 1.2.2

- features
  - 增加自定义连线调整点样式方法`getAdjustPointShape`
- bugfix
  - 修复了主题的 typescript 类型定义错误。[#1052](https://github.com/didi/LogicFlow/issues/1052)
  - 修复了 group 节点导出的 children 属性包含虚拟节点的问题。[#1022](https://github.com/didi/LogicFlow/issues/1022)
  - 修复了开启快捷键后，浏览器的默认复制、粘贴功能失效的问题。[#1046](https://github.com/didi/LogicFlow/issues/1046)

### 1.2.1

- bugfix
  - 修复了`LogicFlow`插件不显示的问题。

### 1.2.0

- bugfix
  - 修复了`LogicFlow`在`React` 18 环境下的兼容性问题。

### 1.2.0-next.5

- bugfix
  - 修复了在 react 环境下，第一次选中 html 节点无法进行删除的问题。[#1029](https://github.com/didi/LogicFlow/issues/1029),[#933](https://github.com/didi/LogicFlow/issues/933)
  - 修复了在`React.StrictMode`模式下，部分插件在开发环境不能使用的问题。

### 1.2.0-next.4

- bugfix
  - 修复移动分组时，分组内子节点连线上的文本位置会变动的问题。[#1015](https://github.com/didi/LogicFlow/issues/1015)
  - 修复边上插入节点时，不容易插入的问题。[754](https://github.com/didi/LogicFlow/issues/754)
  - 修复边上插入节点时，开始节点和结束节点会被移动的问题。[#996](https://github.com/didi/LogicFlow/issues/996)
  - 修复分组嵌套时，无法折叠子分组的问题。[#1007](https://github.com/didi/LogicFlow/issues/1007)

### 1.2.0-next.3

- bugfix
  - 修复在调整边连接的节点后，偶现新的边不能被点击选择。[#974](https://github.com/didi/LogicFlow/issues/974)
  - 修复边的 isHovered 属性会一直保持 true，不会改为 false 的问题。[#989](https://github.com/didi/LogicFlow/issues/989)
  - 同时选中分组和分组内部的节点，会出现分组内部的节点移动距离错误的问题。[#1004](https://github.com/didi/LogicFlow/issues/1004)

### 1.2.0-next.2

- features
  - 增加本文溢出省略时鼠标移动到文本 tip 显示全文。[#984](https://github.com/didi/LogicFlow/issues/984)
  - 右键点击节点、连线默认会选中这个元素。[#949](https://github.com/didi/LogicFlow/pull/949)
- bugfix
  - 禁用画布右键框选功能修复可能会导致画布存在多个框选框不会消失的问题。[#984](https://github.com/didi/LogicFlow/issues/985)
  - 修复了开启`adjustEdgeStartAndEnd`后，调整连线导致 API 与默认新建连线不一致的问题。[973](https://github.com/didi/LogicFlow/pull/973)、[979](https://github.com/didi/LogicFlow/pull/979)、[968](https://github.com/didi/LogicFlow/pull/968)
  - anchor 的 drop 和 dragend 事件的参数传递优化成 event 对像不嵌套在 e 对像下。[#969](https://github.com/didi/LogicFlow/pull/969)
  - 修复了`CurvedEdge`插件在某些情况下，出现报错的问题。[#953](https://github.com/didi/LogicFlow/pull/953)
  - 拖拽新增节点时，不再触发`node:add`事件。[#916](https://github.com/didi/LogicFlow/pull/916)
  - 修复连线后，edgeModel.targetAnchorId 不准确问题。[#944](https://github.com/didi/LogicFlow/issues/944)
