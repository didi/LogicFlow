---
title: 1.0 升级到 1.1
order: 1
toc: content
---

### Breaking Changes

- 1.1 版本对插件进行规范，现在要求所有的插件必须使用 class 的方式实现。然后插件的方法可以通过`lf.extension.插件名称.插件方法`来调用。原来的`lf.插件方法`仍然可用，后续版本将废弃。
- `MiniMap` api 不兼容更新。`MiniMap.show()` -> `lf.extension.miniMap.show()`; `MiniMap.hide()` -> `lf.extension.miniMap.hide()`

### 1.1.30

> 发版时间: 未发布

- features
  - 设置选中元素 zIndex 为 9999，而不是始终保持最顶部。
  - group 节点默认导出的数据增加`isGroup:true`属性。
- bugfix
  - 修复了折线在调整为一条直线后继续调整导致连线错乱的问题。
  - 删除分组节点的同时会删除属于分组的子节点。
  - 修复分组嵌套时未能将拖入的节点放到正确分组的问题。[#803](https://github.com/didi/LogicFlow/issues/803)
  - 修复分组选中时未被放置到其他分组前面的问题。[#820](https://github.com/didi/LogicFlow/issues/820)

### 1.1.29

> 发版时间: 2022/09/24

- features

  - 增加插件`CurvedEdge`, 提供带弧度的折线。
  - `getAnchorLineStyle`增加参数 anchorInfo, 用于开发者自定义不同的锚点使用不同样式的连接线。[#766](https://github.com/didi/LogicFlow/issues/766)

- bugfix
  - 修复在 edge:add 事件中通过 changeEdgeId 修改 Id 后，不出现箭头的问题。[#788](https://github.com/didi/LogicFlow/issues/788)

### 1.1.28

> 发版时间: 2022/09/17

- features
  - 节点的缩放现在更加流畅了。
  - nodeModel 增加了 isShowAnchor 来控制是否显示锚点。
  - 增加了`anchor:dragend`事件，此事件在拖拽创建连线未成功时触发。[#759](https://github.com/didi/LogicFlow/issues/759)
  - 增加单独删除节点或边的某个属性 API: `lf.deleteProperty(id, key)`和`model.deleteProperty(key)`。
- bugfix
  - 修复了只读模式下，仍可以拖拽设置节点大小的问题。[#778](https://github.com/didi/LogicFlow/issues/778)
  - 修复了画布缩放后，节点放大缩小功能体验较差的问题。[#773](https://github.com/didi/LogicFlow/issues/773)

### 1.1.27

> 发版时间: 2022/09/13

- features
  - 增加自定义箭头功能。 [#755](https://github.com/didi/LogicFlow/issues/755)
  - addNode 方法添加的节点默认会放到 grid 上。[#756](https://github.com/didi/LogicFlow/issues/756)
- bugfix
  - 修复画布添加的 group 节点报错的问题。[#757](https://github.com/didi/LogicFlow/issues/757)
  - 修复自定义快捷键为字母时会被编辑文本触发的问题。[#760](https://github.com/didi/LogicFlow/issues/760)
  - 修复 HTML 节点中的 click 事件在非置顶节点中首次点击无效的问题。[#767](https://github.com/didi/LogicFlow/issues/767)

### 1.1.26

> 发版时间: 2022/08/27

- features
  - 增加 edgeGenerator 选项, 可自定义连边规则 [#739](https://github.com/didi/LogicFlow/pull/739) [@oe](https://github.com/oe)
  - 修正 BaseEdgeModel 构造函数属性初始化顺序 [#740](https://github.com/didi/LogicFlow/pull/740) [@oe](https://github.com/oe)

### 1.1.25

> 发版时间：2022/08/21

- features
  - 分组增加`isAllowAppendIn`方法，用来控制节点是否允许被添加到分组中。
- bugfix
  - fix [#734](https://github.com/didi/LogicFlow/issues/734): 分组限制分组子节点拖出分组拖动时显示异常。
  - fix: 修复分组嵌套分组时子分组内部节点无法跟随移动的问题。

### 1.1.24

> 发版时间：2022/08/11

- features
  - `getAreaElement`增加参数`ignoreHideElement`，支持忽略获取隐藏的节点。
  - `baseNodeModel`与`baseEdgeModel`增加参数`virtual`，导出的图数据会忽略`virtual`为`true`的元素
- bugfix
  - fix [#702](https://github.com/didi/LogicFlow/issues/702): 修复框选分组节点移动时，子节点连线会混乱 bug

### 1.1.23

> 发版时间：2022/08/04

- bugfix
  - fix [#719](https://github.com/didi/LogicFlow/pull/665): 修复 autoExpand 为 true 的模式下,边界自动扩充无法停止的问题

### 1.1.22

> 发版时间: 2022/07/13

- bugfix
  - fix [#665](https://github.com/didi/LogicFlow/pull/665): 修复页面存在多个流程图时只能下载第一个的问题。
  - fix [#673](https://github.com/didi/LogicFlow/pull/673): 修复小地图无法拖动的问题。

### 1.1.21

> 发版时间: 2022/07/02

- features

  - 增加初始化参数 autoExpand，控制节点拖动靠近画布边缘时是否自动扩充画布。

- bugfix
  - fix: 修复在弹框中不传宽高节点无法拖动的问题。
  - fix [#671](https://github.com/didi/LogicFlow/pull/671): 增加 es module 打包方式支持但强制声明不使用 tree shaking。

### 1.1.20

> 发版时间：2022/06/08

- features
  - 新增节点相关联路径高亮模式[#642](https://github.com/didi/LogicFlow/pull/642) [@MvCraK](https://github.com/MvCraK)
  - 新增开发模式使用非压缩版本[#644](https://github.com/didi/LogicFlow/pull/644) [@KeyToLove](https://github.com/KeyToLove)

### 1.1.19

> 发版时间：2022/05/31

- features
  - 连线新增了自定义首尾箭头功能[#638](https://github.com/didi/LogicFlow/pull/638)

### 1.1.18

> 发版时间：2022/05/23

- bugfix
  - 修复 minimap 小框拖动效果不正确的问题。

### 1.1.16

> 发版时间：2022/05/18

- features
  - `anchor:drop`只有在创建连线成功的时候才触发。用于区分手动创建的连线和自动创建的连线(`edge:add`)。
  - 增加批量注册 api `lf.batchRegister`
- bugfix
  - 修复小地图在画布移动的时候没有实时更新的问题。[#610](https://github.com/didi/LogicFlow/issues/610)

### 1.1.15

> 发版时间：2022/05/07

- features
  - 边和节点在选中的时候增加 class `lf-xx-selected`，用于支持 css 自定义边选中样式。
  - fitView api 增强，支持控制两边留白距离。[#585](https://github.com/didi/LogicFlow/issues/585)
  - [daxlex](https://github.com/daxlea)给边添加了默认动画效果[#606](https://github.com/didi/LogicFlow/pull/606)
- bugfix
  - 修复了边上的文本设置背景色后，不支持设置 padding 的问题。[#592](https://github.com/didi/LogicFlow/issues/592)

### 1.1.14

> 发版时间：2022/04/22

- bugfix
  - 编辑节点或者边文字的时候会触发键盘事件[#587](https://github.com/didi/LogicFlow/issues/587)

### 1.1.13

> 发版时间：2022/04/16

- features

  - `snapshot`插件增加`customCssRules`属性和`useGlobalRules`属性。

- bugfix
  - 修复了节点拖动的时候不容易对齐的问题[#555](https://github.com/didi/LogicFlow/issues/555)

### 1.1.12

> 发版时间: 2022/04/13

- features
  - 新增设置元素编辑、不可编辑状态 API。[setElementState](api/graph-model-api#setelementstate)
  - 新增 API [lf.renderRawData](api/detail#renderrawdata)
- bugfix
  - 修复了画布宽高传入参数值为 0 时，节点无法移动的问题。
  - 修复了连线偶尔不消失的问题. [#568](https://github.com/didi/LogicFlow/issues/568)

### 1.1.11

> 发版时间: 2022/03/29

- bugfix
  - 修复了拖拽节点，节点文案同步移动不正确的问题 [#548](https://github.com/didi/LogicFlow/issues/548)

### 1.1.9

> 发版时间: 2022/03/26

- features

  - 优化了鼠标移动到画布边缘滚动效果，现在支持持续滚动了。
  - 优化节点拖动效果，拖动节点时，鼠标位置不是节点中心点，而是保持相对位置。

- bugfix
  - 修复了分组内部的子节点之间的连线在分组收起时未被隐藏的问题。

### 1.1.8

> 发版时间: 2022/03/25

- features

  - [节点缩放](tutorial/extension-node-resize)插件支持设置放大缩小的最大最小值和调整灵敏度。
  - 新增[lf.fitView](api/detail#fitview)方法 [@lixianyu-icon](https://github.com/lixianyu-icon)。
  - 新增在连线时，鼠标移动到画布边缘画布自动滚动。[#534](https://github.com/didi/LogicFlow/issues/534)
  - 优化了移动节点到画布边缘的交互，现在移动节点到画布边缘会自动扩展画布大小。
  - 优化了移动节点的交互，现在如果节点不允许移动出分组范围后，鼠标再次回到分组内部时，节点会出现在鼠标位置。

- bugfix
  - 修复了`group`插件在多个`group`节点一起被折叠报错的问题。
  - 修复了内部元素阻止事件冒泡导致外部无法触发的问题，[#529](https://github.com/didi/LogicFlow/issues/529)、[#338](https://github.com/didi/LogicFlow/issues/338)。
  - 修复了分组折叠后使用 history 返回上一步，显示错误的问题 [#537](https://github.com/didi/LogicFlow/issues/537)

### 1.1.8 以下

- features

  - 新增`lf.getModelById`和`lf.getDataById`
  - 新增事件`graph:rendered`
  - `nodeModel`新增属性`autoToFront`, 控制节点选中时是否自动置顶，默认为 true.
  - `nodeModel`和`edgeModel`新增属性`visible`, 控制节点是否显示，默认为 true.
  - `nodeModel`的`getAnchorStyle`方法增加参数`anchorInfo`, 用于自定义锚点时，对一个节点上的锚点显示不同效果进行自定义。 `v1.1.3`
  - 自定义锚点支持设置`edgeAddable`属性，用于控制是否可以在此锚点手动创建连线。
  - 新增锚点事件`anchor:dragstart`和`anchor:drop`,用于在连线时对可连接节点进行高亮处理。 `v1.1.5`
  - `NodeResize`插件用法修改，不在全局设置`矩形`、`圆形`、`多边形`可缩放，而且按需引入自定义。

- bugfix

  - 修复了[#481](https://github.com/didi/LogicFlow/issues/481)首次导出后，删除远处存在的节点再进行导出，图片导出出现空白。
  - 修复了多边形在移动边的时候，偶尔边无法移动且报错的问题。
  - 修复了[#479](https://github.com/didi/LogicFlow/issues/479)不传入宽高时，宽度和高度不会随着窗口缩放再次适应。
  - 修复了[#488](https://github.com/didi/LogicFlow/issues/488) 换行后永远多一个换行符的问题。`v1.1.1`。
  - 修复了[#336](https://github.com/didi/LogicFlow/issues/336) 在某些中文输入下，文字内部不显示的问题。 `v1.1.3`
  - 修复了[#514](https://github.com/didi/LogicFlow/issues/514) 在修改连线起点和终点时不触发节点校验规则的问题。 `v1.1.5`

- docs
  - 新增[group 插件](tutorial/extension-component-control)
  - 新增[自定义插件教程](tutorial/extension-component-custom)
