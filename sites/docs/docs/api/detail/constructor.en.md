---
nav: API
title: Options
toc: content
order: 0
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

> All node instance operations on the flowchart, as well as events and behavior listening, are performed on the `LogicFlow` instance.

## Configure

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

| Options                                  | Type                                                                      | Required | Default    | Description                                                                                                                                                                                                                                                                                                                                    |
| :--------------------------------------- | :------------------------------------------------------------------------ | :------- | :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| container                                | `HTMLElement`                                                             | ✅        | -          | DOM container of the graph                                                                                                                                                                                                                                                                                                                     |
| width                                    | number                                                                    | -        | -          | Specify the width of the canvas in 'px', the default is to use the container width                                                                                                                                                                                                                                                             |
| height                                   | number                                                                    | -        | -          | Specify the height of the canvas in 'px', the default is to use the container height                                                                                                                                                                                                                                                           |
| background                               | false \| [BackgroundConfig](#BackgroundConfig)                            | -        | false      | Canvas background, no background by default                                                                                                                                                                                                                                                                                                    |
| grid                                     | number \| boolean \| [GridOptions](#GridOptions)                          | -        | false      | Grid, if set to `false` without grid on, it is 1px moving units, no grid background is drawn; if set to `true` on, it is 20px dotted grid by default                                                                                                                                                                                           |
| snapToGrid<Badge>Added in 2.0.10</Badge> | boolean                                                                   | -        | false      | Whether to enable grid snapping, when enabled, dragging nodes will move in grid size increments                                                                                                                                                                                                                                                |
| partial                                  | boolean                                                                   | -        | false      | Whether to enable localized rendering                                                                                                                                                                                                                                                                                                          |
| keyboard                                 | `KeyboardDef`[KeyboardDef](#KeyboardDef)                                  | -        | -          | Custom keyboard-related configuration                                                                                                                                                                                                                                                                                                          |
| [style](#style)                          | `Partial<LogicFlow.Theme>`                                                | -        | -          | Style                                                                                                                                                                                                                                                                                                                                          |
| edgeType                                 | `EdgeType`                                                                | -        | 'polyline' | The type of edge created on the graph, customized types are supported. <br>Base types: 'line' \| 'polyline' \| 'bezier'                                                                                                                                                                                                                        |
| isSilentMode                             | boolean                                                                   | -        | false      | Browse-only non-editable mode, not enabled by default                                                                                                                                                                                                                                                                                          |
| stopScrollGraph                          | boolean                                                                   | -        | false      | Disable mouse scrolling to move the canvas                                                                                                                                                                                                                                                                                                     |
| stopZoomGraph                            | boolean                                                                   | -        | false      | Disable scaling of the canvas                                                                                                                                                                                                                                                                                                                  |
| stopMoveGraph                            | boolean \| 'vertical' \| 'horizontal' \| [number, number, number, number] | -        | false      | Disable dragging the canvas                                                                                                                                                                                                                                                                                                                    |
| animation                                | boolean \| `Partial<AnimationConfig>`                                     | -        | -          | Whether to enable animation function, can be switched globally or configured individually                                                                                                                                                                                                                                                      |
| history                                  | boolean                                                                   | -        | true       | Whether to enable history function                                                                                                                                                                                                                                                                                                             |
| disabledPlugins                          | `string[]`                                                                | -        | -          | Disable loaded plugins when passing in initialization                                                                                                                                                                                                                                                                                          |
| [snapline](#snapline)                    | boolean                                                                   | -        | true       | Whether to enable node auxiliary alignment lines                                                                                                                                                                                                                                                                                               |
| guards                                   | `GuardsConfig`                                                            | -        | -          | Whether to add guard functions, supports two functions beforeClone and beforeDelete, function returns true to execute default logic, returns false to block                                                                                                                                                                                    |
| disabledTools                            | `string[]`                                                                | -        | -          | Disable built-in tools, logicflow built-in tools are 'multipleSelect' and 'textEdit' currently                                                                                                                                                                                                                                                 |
| adjustEdge                               | boolean                                                                   | -        | true       | Allow adjustment of edges                                                                                                                                                                                                                                                                                                                      |
| adjustEdgeStartAndEnd                    | boolean                                                                   | -        | false      | Whether to allow dragging edge endpoints to adjust connections                                                                                                                                                                                                                                                                                 |
| adjustNodePosition                       | boolean                                                                   | -        | true       | Whether to allow dragging of nodes                                                                                                                                                                                                                                                                                                             |
| hideAnchors                              | boolean                                                                   | -        | false      | Whether to hide node anchor points, hidden by default in silent mode                                                                                                                                                                                                                                                                           |
| outline                                  | boolean                                                                   | -        | false      | Whether to show the outer frame in node selection state                                                                                                                                                                                                                                                                                        |
| hoverOutline                             | boolean                                                                   | -        | true       | Whether to show the outer frame of the node when mouse hovers                                                                                                                                                                                                                                                                                  |
| nodeSelectedOutline                      | boolean                                                                   | -        | true       | Whether to show the outer frame when node is selected                                                                                                                                                                                                                                                                                          |
| edgeSelectedOutline                      | boolean                                                                   | -        | true       | Whether to show the outer frame when edge is selected                                                                                                                                                                                                                                                                                          |
| nodeTextEdit                             | boolean                                                                   | -        | true       | Allow node text to be editable                                                                                                                                                                                                                                                                                                                 |
| edgeTextEdit                             | boolean                                                                   | -        | true       | Allow edge text to be editable                                                                                                                                                                                                                                                                                                                 |
| textEdit                                 | boolean                                                                   | -        | true       | Whether to enable text editing                                                                                                                                                                                                                                                                                                                 |
| nodeTextDraggable                        | boolean                                                                   | -        | false      | Allow node text to be draggable                                                                                                                                                                                                                                                                                                                |
| edgeTextDraggable                        | boolean                                                                   | -        | false      | Allow edge text to be draggable                                                                                                                                                                                                                                                                                                                |
| multipleSelectKey                        | string                                                                    | -        | -          | Multi-select key, can choose meta(cmd), shift, alt. Support combination key clicks to achieve multi-selection                                                                                                                                                                                                                                  |
| idGenerator                              | function                                                                  | -        | -          | Custom rules for generating ids when creating nodes and edges                                                                                                                                                                                                                                                                                  |
| edgeGenerator                            | `EdgeGeneratorType`                                                       | -        | -          | Rules for generating edges when connecting nodes and moving edges                                                                                                                                                                                                                                                                              |
| plugins                                  | `ExtensionConstructor[]`                                                  | -        | -          | Plugins loaded by the current LogicFlow instance, uses global plugins if not passed                                                                                                                                                                                                                                                            |
| autoExpand                               | boolean                                                                   | -        | true       | Whether to automatically expand the canvas when nodes are dragged near the edge of the canvas. Note: If the canvas keeps scrolling when dragging nodes to a certain position, it's because there's an issue with the initialized canvas width and height. If the canvas width and height are variable, it's recommended to turn off autoExpand |
| overlapMode                              | `OverlapMode`                                                             | -        | -          | Element overlap stacking mode, default is edges at bottom, nodes at top, selected elements at the very top. Can be set to 1 for self-incrementing mode (commonly used in drawing tool scenarios)                                                                                                                                               |
| customTrajectory                         | function                                                                  | -        | -          | Custom connection trajectory                                                                                                                                                                                                                                                                                                                   |
| pluginsOptions                           | any                                                                       | -        | -          | Plugin initialization options, user-defined incoming, available in custom plugins                                                                                                                                                                                                                                                              |

## Type Definitions

### `BackgroundConfig`
Type definition for canvas background configuration. Since the canvas background layer is implemented using `div`, it also supports passing in other CSS styles
```tsx | pure
export type BackgroundConfig = {
  backgroundImage?: string, // Background image URL
  backgroundColor?: string, // Background color
  backgroundRepeat?: string, // Background image repeat mode
  backgroundPosition?: string, // Background image position
  backgroundSize?: string, // Background image size
  backgroundOpacity?: number, // Background opacity
  filter?: string, // Filter
  [key: any]: any, // Other custom styles
};
```

### `GridOptions`

Type definition for canvas grid configuration

```tsx | pure
export type GridOptions = {
  size?: number // Grid size
  visible?: boolean, // Whether grid lines are visible
  type?: 'dot' | 'mesh', // Grid style, currently built-in support for dot 'dot' and grid 'mesh'
  config?: {
    color: string, // Grid color
    thickness?: number, // Grid line width
  }
};
```

LogicFlow has set default grid configuration internally:
```tsx | pure
const defaultProps: GridOptions = {
  size: 10,
  visible: true,
  type: 'dot',
  config: {
    color: '#ababab',
    thickness: 1,
  },
}
```
When passing in grid configuration during initialization, it will be assigned

### `KeyboardDef`

Keyboard shortcuts are not enabled by default, supported options:

```tsx | pure
export interface KeyboardDef {
  enabled: boolean; // Whether to enable keyboard shortcuts
  shortcuts?: Array<{ // Custom shortcuts
    keys: string | string[];
    callback: Handler;
    action?: Action;
  }>;
}
```

Using built-in shortcuts:

```tsx | pure
const lf = new LogicFlow({
  keyboard: {
    enabled: true,
  },
});
```

Built-in shortcut functions include:

- `'cmd + c', 'ctrl + c'` Copy flowchart
- `'cmd + v', 'ctrl + v'` Paste flowchart
- `'cmd + z', 'ctrl + z'` Previous step
- `'cmd + y', 'ctrl + y'` Next step
- `'backspace'` Delete

Custom shortcuts:

```tsx | pure
const lf = new LogicFlow({
  keyboard: {
    enabled: true,
    shortcuts: [
      {
        keys: ["cmd + o", "ctrl + o"],
        callback: () => {
          // Custom logic
        },
      },
    ],
  },
});
```

### `style`

Themes can be configured through style, see the tutorial [Theme](../../tutorial/basic/theme.en.md) for detailed style options.

### `snapline`

Alignment lines, including node center points, top and bottom borders, left and right border alignment.

- In edit mode, alignment lines are enabled by default; set snapline to false to disable alignment lines.
- In non-editable mode, alignment lines are disabled.
