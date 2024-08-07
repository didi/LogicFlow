---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: Label
order: 7
toc: content
tag: New
---

LogicFlow provides built-in node text and text editing capabilities, but sometimes we need richer text content, such as multi-line text or rich text. In such cases, you can use the `Label` plugin.

## Demonstration

<code id="react-portal" src="@/src/tutorial/extension/label"></code>

## Using the Plugin

```tsx | purex | pure
import LogicFlow from "@logicflow/core";
import { Label } from "@logicflow/extension";
import "@logicflow/extension/lib/style/index.css";

// Two ways to use the plugin
// Register the plugin using the use method
LogicFlow.use(Label);

// Or enable the plugin via configuration (you can configure plugin properties)
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

## Configuration Options

### Plugin-Level

Each feature in the menu can be represented by a single configuration. The specific fields are as follows:

| Field               | Type                                                      | Default Value | Required | Description                                      |
|---------------------|-----------------------------------------------------------|---------------|----------|--------------------------------------------------|
| isMultiple          | boolean                                                   | `true`        |          | Whether a node or edge can have multiple Labels. |
| maxCount            | number                                                    | `Infinity`    |          | When multiple Labels are allowed, the maximum number of Labels. |
| labelWidth          | number                                                    | -             |          | The width of each Label, can be uniformly set and used with textOverflowMode. |
| textOverflowMode    | 'ellipsis' \| 'wrap' \| 'clip' \| 'nowrap' \| 'default' | `default`     |          | Text overflow display mode, consistent with CSS configuration. |

### Element-Level

When the Label plugin is enabled, you can also configure properties at the element level in two scenarios:

1. By default, the Label is used for text rendering. During initialization, the `text` property in NodeConfig or EdgeConfig is used as the Label's text content.
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
    value: 'Circle',
  },
}
```
2. Users can also initialize Labels directly with Label configuration.
```ts
export interface NodeConfig<P extends PropertiesType = PropertiesType> {
  id?: string
  type: string
  x: number
  y: number
  text?: TextConfig | string
  zIndex?: number
  properties?: P
  virtual?: boolean // Whether the node is virtual
  rotate?: number

  rotatable?: boolean // Whether the node is rotatable
  resizable?: boolean // Whether the node is resizable

  [key: string]: any
}

export type LabelConfig = {
  id?: string // Unique identifier for the label
  x: number
  y: number
  content?: string // Rich text content
  value: string // Plain text content
  rotate?: number // Rotation angle
  // Style properties
  style?: h.JSX.CSSProperties // Custom style for the label

  // Edit state properties
  editable?: boolean
  draggable?: boolean
  labelWidth?: number
  textOverflowMode?: 'ellipsis' | 'wrap' | 'clip' | 'nowrap' | 'default'
}

export type LabelOption = {
  // Whether multiple labels are supported
  isMultiple: boolean
  // Maximum number of labels allowed when multiple labels are supported
  maxCount?: number
}

export type LabelNodeConfig = NodeConfig<{
  _label?: string | LabelConfig | LabelConfig[]
  _labelOptions?: LabelOption
}>
```
In other words, by adding `_label` and `_labelOptions` fields in the properties of Node or Edge initialization data, you can configure the content and attributes of a single Label.

:::info{title=Note:Plugin-includes-rich-text-editing-mode-by-default}
- When double-clicking the text to enter edit mode, the selected text will display a rich text editor, allowing users to edit rich text content.
- A switch will be added in the future to allow users to customize whether to enable rich text editing mode.
:::

## API

### lf.extension.label.updateTextMode(mode)

Updates whether to use Text or Label for displaying text.

```ts
// Update Label text display mode
updateTextMode = (textMode: 'text' | 'label'): void => {}
```