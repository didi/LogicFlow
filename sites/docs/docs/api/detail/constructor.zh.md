---
title: 初始化选项
toc: content
order: 0
---

> 流程图上所有的节点实例操作以及事件，行为监听都在 `LogicFlow` 实例上进行。

## 配置

```tsx | purex | pure
import LogicFlow from '@logicflow/core'

const options: LogicFlow.Options = {
  //... 
}
new LogicFlow(options)
```

## constructor

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

| 选项                        | 类型                                                                        | 必选 | 默认值        | 描述                                                                                                  |
|:--------------------------|:--------------------------------------------------------------------------|:---|:-----------|:----------------------------------------------------------------------------------------------------|
| container                 | `HTMLElement`                                                             | ✅  | -          | 图的 DOM 容器。                                                                                          |
| width                     | number                                                                    | -  | -          | 指定画布宽度，单位为 'px'，默认使用容器宽度。                                                                           |
| height                    | number                                                                    | -  | -          | 指定画布高度，单位为 'px'，默认使用容器高度。                                                                           |
| [background](#background) | false \| `BackgroundConfig`                                               | -  | false      | 背景，默认无背景。                                                                                           |
| [grid](#grid)             | number \| boolean \| `GridOptions`                                        | -  | false      | 网格，若设为`false`不开启网格，则为 1px 移动单位，不绘制网格背景，若设置为`true`开启则默认为 20px 点状网格。                                  |
| partial                   | boolean                                                                   | -  | false      | 是否开启局部渲染功能。                                                                                         |
| [keyboard](#keyboard)     | `Keyboard.KeyboardDef`                                                    | -  | -          | 自定义键盘相关配置。                                                                                          |
| [style](#style)           | `Partial<LogicFlow.Theme>`                                                | -  | -          | 样式。                                                                                                 |
| edgeType                  | `EdgeType`                                                                | -  | 'polyline' | 在图上编辑创建边的类型，支持自定义类型。<br>基础类型： 'line' \| 'polyline' \| 'bezier'                                      |
| isSilentMode              | boolean                                                                   | -  | false      | 仅浏览不可编辑模式，默认不开启。                                                                                    |
| stopScrollGraph           | boolean                                                                   | -  | false      | 禁止鼠标滚动移动画布。                                                                                         |
| stopZoomGraph             | boolean                                                                   | -  | false      | 禁止缩放画布。                                                                                             |
| stopMoveGraph             | boolean \| 'vertical' \| 'horizontal' \| [number, number, number, number] | -  | false      | 禁止拖动画布。                                                                                             |
| animation                 | boolean \| `Partial<AnimationConfig>`                                     | -  | -          | 是否开启动画功能，可统一开关和单独配置。                                                                                |
| history                   | boolean                                                                   | -  | true       | 是否开启历史记录功能。                                                                                         |
| disabledPlugins           | `string[]`                                                                | -  | -          | 传入初始化的时候，禁用加载的插件。                                                                                   |
| [snapline](#snapline)     | boolean                                                                   | -  | true       | 是否启用节点辅助对齐线。                                                                                        |
| guards                    | `GuardsConfig`                                                            | -  | -          | 是否增加守卫函数，支持两个函数 beforeClone、beforeDelete，函数返回 true 则执行默认逻辑，返回 false 则阻止。                            |
| disabledTools             | `string[]`                                                                | -  | -          | 禁止启用的内置工具，目前 logicflow 内置工具有'multipleSelect', 'textEdit'。                                           |
| adjustEdge                | boolean                                                                   | -  | true       | 允许调整边。                                                                                              |
| adjustEdgeStartAndEnd     | boolean                                                                   | -  | false      | 是否允许拖动边的端点来调整连线。                                                                                    |
| adjustNodePosition        | boolean                                                                   | -  | true       | 是否允许拖动节点。                                                                                           |
| hideAnchors               | boolean                                                                   | -  | false      | 是否隐藏节点的锚点，静默模式下默认隐藏。                                                                                |
| outline                   | boolean                                                                   | -  | false      | 节点选择状态下外侧的选框是否展示。                                                                                   |
| hoverOutline              | boolean                                                                   | -  | true       | 鼠标 hover 的时候是否显示节点的外框。                                                                              |
| nodeSelectedOutline       | boolean                                                                   | -  | true       | 节点被选中时是否显示节点的外框。                                                                                    |
| edgeSelectedOutline       | boolean                                                                   | -  | true       | 边被选中时是否显示边的外框。                                                                                      |
| nodeTextEdit              | boolean                                                                   | -  | true       | 允许节点文本可以编辑。                                                                                         |
| edgeTextEdit              | boolean                                                                   | -  | true       | 允许边文本可以编辑。                                                                                          |
| textEdit                  | boolean                                                                   | -  | true       | 是否开启文本编辑。                                                                                           |
| nodeTextDraggable         | boolean                                                                   | -  | false      | 允许节点文本可以拖拽。                                                                                         |
| edgeTextDraggable         | boolean                                                                   | -  | false      | 允许边文本可以拖拽。                                                                                          |
| multipleSelectKey         | string                                                                    | -  | -          | 多选按键, 可选 meta(cmd)、shift、alt。 支持组合键点击元素实现多选。                                                        |
| idGenerator               | function                                                                  | -  | -          | 自定义创建节点、连线时生成 id 规则。                                                                                |
| edgeGenerator             | `EdgeGeneratorType`                                                       | -  | -          | 连接节点及移动边时边的生成规则。                                                                                    |
| plugins                   | `ExtensionConstructor[]`                                                  | -  | -          | 当前 LogicFlow 实例加载的插件，不传则采用全局插件。                                                                     |
| autoExpand                | boolean                                                                   | -  | -          | 节点拖动靠近画布边缘时是否自动扩充画布, 默认 true。 注意，如果出现拖动节点到某个位置画布就不停滚动的问题，是因为初始化画布的时候宽高有问题。如果画布宽高不定，建议关闭 autoExpand。 |
| overlapMode               | `OverlapMode`                                                             | -  | -          | 元素重合的堆叠模式，默认为连线在下、节点在上，选中元素在最上面。可以设置为 1，表示自增模式（作图工具场景常用）。                                           |
| customTrajectory          | function                                                                  | -  | -          | 自定义连线轨迹。                                                                                            |
| pluginsOptions            | any                                                                       | -  | -          | 插件初始化选项，用户可自定义传入，在自定义插件中获取。                                                                         |

### `background`

背景默认无；支持透传任何样式属性到背景层

```tsx | pure
export type BackgroundConfig = {
  backgroundImage?: string, // 背景图片地址
  backgroundColor?: string, // 背景色
  backgroundRepeat?: string, // 背景图片重复
  backgroundPosition?: string, // 背景图片位置
  backgroundSize?: string, // 背景图片尺寸
  backgroundOpacity?: number, // 背景透明度
  filter?: string, // 滤镜
  [key: any]: any,
};
```

### `grid`

网格默认开启，支持选项：

```tsx | pure
export type GridOptions = {
  size?: number // 栅格
  visible?: boolean, // 是否可见，false则隐藏网格线但是保留栅格效果
  type?: 'dot' | 'mesh', // 网格样式，目前内置支持点状'dot'和网格'mesh'
  config?: {
    color: string, // 网格颜色
    thickness?: number, // 网格线宽度
  }
};
```

### `keyboard`

默认不开启键盘快捷操作, 支持选项

```tsx | pure
export interface KeyboardDef {
  enabled: boolean;
  shortcuts?: Array<{
    keys: string | string[];
    callback: Handler;
    action?: Action;
  }>;
}
```

使用内置快捷键

```tsx | pure
const lf = new LogicFlow({
  keyboard: {
    enabled: true,
  },
});
```

内置快捷键功能有：

- `'cmd + c', 'ctrl + c'` 同流程图复制
- `'cmd + v', 'ctrl + v'` 同流程图粘贴
- `'cmd + z', 'ctrl + z'` 上一步
- `'cmd + y', 'ctrl + y'` 下一步
- `'backspace'` 删除

自定义快捷键

```tsx | pure
const lf = new LogicFlow({
  keyboard: {
    enabled: true,
    shortcuts: [
      {
        keys: ["cmd + o", "ctrl + o"],
        callback: () => {
          // 自定义逻辑
        },
      },
    ],
  },
});
```

### `style`

可以通过 style 配置主题，详细支持的样式选项见教程[主题 Theme](../../tutorial/basic/theme.zh.md)

### `snapline`

对齐线，包含节点的中心点、上下边框、左右边框对齐。

- 在编辑模式下，默认开启对齐线，将 snapline 设置为 false，关闭对齐线。
- 在不可编辑模式下，对齐线关闭。
