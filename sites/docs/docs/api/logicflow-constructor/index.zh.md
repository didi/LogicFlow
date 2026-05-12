---
nav: API
group:
  title: LogicFlow
  order: 1
title: 构造方法
toc: content
order: 0
---

## 构造方法调用

```tsx | pure
import LogicFlow from '@logicflow/core'

const options: LogicFlow.Options = {
  // ...
}
new LogicFlow(options)
```

## 基础配置

| 选项 | 类型 | 必选 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| container | `HTMLElement` | ✅ | - | 图的 DOM 容器。 |
| width | number | - | - | 指定画布宽度，单位为 `px`，默认使用容器宽度。 |
| height | number | - | - | 指定画布高度，单位为 `px`，默认使用容器高度。 |
| autoExpand | boolean | - | false | 节点拖动靠近画布边缘时是否自动扩充画布。 |

## 画布配置

| 选项 | 类型 | 必选 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| background | false \| [`BackgroundConfig`](../type/MainTypes.zh.md#backgroundconfig背景配置) | - | false | 画布背景，默认无背景，支持传入参数配置。 |
| grid | number / boolean / [`GridOptions`](../type/MainTypes.zh.md#gridoptions网格配置) | - | false | 网格配置，支持关闭、默认点状网格或自定义参数。 |
| snapGrid | boolean | - | false | 是否开启网格吸附。 |
| partial | boolean | - | false | 是否开启局部渲染功能。 |
| animation | boolean \| `Partial<AnimationConfig>`（[`AnimationConfig`](../type/MainTypes.zh.md#animationconfig动画配置)） | - | - | 是否开启动画功能，可统一开关和单独配置。 |
| overlapMode | [`OverlapMode`](../type/MainTypes.zh.md#common实例基础配置项) | - | - | 元素重合堆叠模式。 |
| snapline | boolean | - | true | 是否启用节点辅助对齐线。 |
| stopScrollGraph | boolean | - | false | 禁止鼠标滚动移动画布。 |
| stopZoomGraph | boolean | - | false | 禁止缩放画布。 |
| stopMoveGraph | boolean \| 'vertical' \| 'horizontal' \| [number, number, number, number] | - | false | 禁止拖动画布。 |

## 编辑控制

| 选项 | 类型 | 必选 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| isSilentMode | boolean | - | false | 仅浏览不可编辑模式，默认不开启。 |
| guards | [`GuardsConfig`](../type/MainTypes.zh.md#guardsconfig守卫函数类型) | - | - | 守卫函数配置（`beforeClone`、`beforeDelete`）。 |
| disabledTools | `string[]` | - | - | 禁止启用的内置工具。 |
| adjustEdge | boolean | - | true | 允许调整边。 |
| adjustEdgeStartAndEnd | boolean | - | false | 是否允许拖动边端点调整连线。 |
| adjustNodePosition | boolean | - | true | 是否允许拖动节点。 |
| hideAnchors | boolean | - | false | 是否隐藏节点锚点。 |
| outline | boolean | - | false | 节点选择外侧选框是否展示。 |
| hoverOutline | boolean | - | true | 鼠标悬停时是否显示节点外框。 |
| nodeSelectedOutline | boolean | - | true | 节点选中时是否显示节点外框。 |
| edgeSelectedOutline | boolean | - | true | 边选中时是否显示边外框。 |
| nodeTextEdit | boolean | - | true | 允许节点文本编辑。 |
| edgeTextEdit | boolean | - | true | 允许边文本编辑。 |
| textEdit | boolean | - | true | 是否开启文本编辑。 |
| nodeTextDraggable | boolean | - | false | 允许节点文本拖拽。 |
| edgeTextDraggable | boolean | - | false | 允许边文本拖拽。 |
| multipleSelectKey | string | - | - | 多选按键（`meta` / `shift` / `alt`）。 |
| idGenerator | function | - | - | 自定义创建节点、连线时的 ID 生成规则。 |
| customTargetAnchor | [`customTargetAnchorType`](../type/MainTypes.zh.md#customtargetanchortype自定义锚点连接规则) | - | - | 自定义锚点连接规则。 |
| edgeGenerator | [`EdgeGeneratorType`](../type/MainTypes.zh.md#edgegeneratortype自定义边生成函数) | - | - | 连接节点及移动边时边的生成规则。 |
| customTrajectory | function | - | - | 自定义连线轨迹。 |

## 快捷键配置

| 选项 | 类型 | 必选 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| keyboard | [`KeyboardDef`](../type/MainTypes.zh.md#keyboarddef快捷键参数类型) | - | - | 自定义键盘相关配置。 |

内置快捷键（启用 `keyboard.enabled = true` 后可用）：

- `cmd + c` / `ctrl + c`：复制
- `cmd + v` / `ctrl + v`：粘贴
- `cmd + z` / `ctrl + z`：撤销
- `cmd + y` / `ctrl + y`：重做
- `backspace`：删除

## 主题配置

| 选项 | 类型 | 必选 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| style | [`Theme`](../type/Theme.zh.md#theme主题配置) | - | - | 样式配置，用于定义节点、边、文本、锚点等视觉效果。 |
| themeMode | string | - | - | 主题类型，内置支持 `default` / `dark` / `colorful` / `radius`。 |
| edgeType | [`EdgeType`](../type/MainTypes.zh.md#edgetype边类型) | - | `polyline` | 在图上编辑创建边的默认类型。 |

## 插件控制

| 选项 | 类型 | 必选 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| disabledPlugins | `string[]` | - | - | 初始化时禁用加载的插件。 |
| plugins | [`ExtensionConstructor`](../type/MainTypes.zh.md#extensionconstructor插件构造函数)`[]` | - | - | 当前实例加载的插件，不传则采用全局插件。 |
| pluginsOptions | any | - | - | 插件初始化选项。 |

## 历史记录

| 选项 | 类型 | 必选 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| history | boolean | - | true | 是否开启历史记录功能。 |
