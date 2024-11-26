---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 富文本标签 (Label)
order: 7
toc: content
tag: 新插件
---

LogicFlow
内部提供了节点文本以及文本编辑能力，但是有时候我们需要更加丰富的文本内容，比如支持多行文本、富文本等。这时候我们可以选择使用`Label`
插件。

## 演示

<code id="react-portal" src="@/src/tutorial/extension/label"></code>

## 使用插件

```tsx | purex | pure
import LogicFlow from "@logicflow/core";
import { Label } from "@logicflow/extension";
import "@logicflow/extension/lib/style/index.css";

// 两种使用方式
// 通过 use 方法引入插件
LogicFlow.use(Label);

// 或者通过配置项启用插件（可以配置插件属性）
const lf = new LogicFlow({
  container: document.querySelector('#app'),
  plugins: [Label],
  pluginsOptions: {
    label: {
      // ...labelOptions
    },
  },
});
```

## 配置项

### 插件级

Label插件支持一些初始化属性。具体字段如下:

| 字段             | 类型                                                    | 默认值     | 是否必须 | 描述                                                         |
| ---------------- | ------------------------------------------------------- | ---------- | -------- | ------------------------------------------------------------ |
| isMultiple       | boolean                                                 | `true`     |          | 是否允许一个节点或边拥有多个 Label                           |
| maxCount         | number                                                  | `Infinity` |          | 当允许多个 Label 时，限制 Label 的最大数量                   |
| labelWidth       | number                                                  | -          |          | 每个 Label 的宽度，可以统一设置配合 textOverflowMode 使用    |
| textOverflowMode | 'ellipsis' \| 'wrap' \| 'clip' \| 'nowrap' \| 'default' | `default`  |          | 文本溢出显示模式，配合 CSS 样式实现，与 CSS 配置项表现一致。 |

### 元素级

如果启用了 Label 插件，我们同时也支持元素级别的属性配置，有两种场景：
1. 默认以 Label 为文本渲染模式，初始化时，使用 NodeConfig or EdgeConfig 中的 text 属性作为 Label 的文本内容。
```ts
const nodeConfig = {
  id: '2',
  type: 'circle',
  x: 350,
  y: 100,
  properties: {},
  text: {
    x: 350,
    y: 100,
    value: '圆形',
  },
}
```
2. 我们也支持用户直接用 Label 配置初始化 Label
```ts
export interface NodeConfig<P extends PropertiesType = PropertiesType> {
  id?: string
  type: string
  x: number
  y: number
  text?: TextConfig | string
  zIndex?: number
  properties?: P
  virtual?: boolean // 是否虚拟节点
  rotate?: number

  rotatable?: boolean // 节点是否可旋转
  resizable?: boolean // 节点是否可缩放

  [key: string]: any
}

export type LabelConfig = {
  id?: string // label唯一标识
  x: number
  y: number
  content?: string // 富文本内容
  value: string // 纯文本内容
  rotate?: number // 旋转角度
  // 样式属性
  style?: h.JSX.CSSProperties // label自定义样式

  // 编辑状态属性
  editable?: boolean
  draggable?: boolean
  labelWidth?: number
  textOverflowMode?: 'ellipsis' | 'wrap' | 'clip' | 'nowrap' | 'default'
}

export type LabelOption = {
  // 是否支持多个 label
  isMultiple: boolean
  // 允许设置多个 label 时最大个数
  maxCount?: number
}

export type LabelNodeConfig = NodeConfig<{
  _label?: string | LabelConfig | LabelConfig[]
  _labelOptions?: LabelOption
}>
```
也就是说，在初始化 Node 或 Edge 的数据 properties 中添加 _label 和 _labelOptions 字段，即可配置单个 Label 的内容和属性。

:::info{title=注意，插件默认内置了富文本编辑模式}
- 双击文本进入编辑状态时，选中文本会弹出富文本编辑器，支持用户编辑富文本内容
- 后续我们会增加开关，支持用户自定义是否启用富文本编辑模式
:::

## API
### lf.extension.label.updateTextMode(mode)
用于更新当前使用 Text 还是 Label 显示文本

```ts
// 更新 Label 文本显示模式
updateTextMode = (textMode: 'text' | 'label'): void => {}
```
