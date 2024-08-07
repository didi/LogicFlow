---
title: Options
toc: content
order: 0
---

> All node instance operations on the flowchart, as well as events and behavior listening, are
> performed on the `LogicFlow` instance.

## configure

```tsx | purex | pure
import LogicFlow from '@logicflow/core'

const options: LogicFlow.Options = {
  //... 
}
new LogicFlow(options)
```

```tsx | pure
```

## constructor

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

| Options                   | Type                                                                      | Required | Default    | Description                                                                                                                                                                                                                                                                                                                                                                      |
|:--------------------------|:--------------------------------------------------------------------------|:---------|:-----------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| container                 | `HTMLElement`                                                             | ✅        | -          | DOM container of the graph                                                                                                                                                                                                                                                                                                                                                       |
| width                     | number                                                                    | -        | -          | Specify the width of the canvas in 'px', the default is to use the container width.                                                                                                                                                                                                                                                                                              |
| height                    | number                                                                    | -        | -          | Specify the height of the canvas in 'px', the default is to use the container height.                                                                                                                                                                                                                                                                                            |
| [background](#background) | false \| `BackgroundConfig`                                               | -        | false      | Background, no background by default                                                                                                                                                                                                                                                                                                                                             |
| [grid](#grid)             | number \| boolean \| `GridOptions`                                        | -        | false      | Grid, if set to `false` without grid on, it is 1px moving units, no grid background is drawn; if set to `true` on, it is 20px dotted grid by default                                                                                                                                                                                                                             |
| partial                   | boolean                                                                   | -        | false      | Whether to enable localized rendering.                                                                                                                                                                                                                                                                                                                                           |
| [keyboard](#keyboard)     | `Keyboard.KeyboardDef`                                                    | -        | -          | Custom keyboard-related configuration                                                                                                                                                                                                                                                                                                                                            |
| [style](#style)           | `Partial<LogicFlow.Theme>`                                                | -        | -          | Style                                                                                                                                                                                                                                                                                                                                                                            |
| edgeType                  | `EdgeType`                                                                | -        | 'polyline' | Edit the type of edges created on the graph, customized types are supported. <br>Base type： 'line' \| 'polyline' \| 'bezier'                                                                                                                                                                                                                                                     |
| isSilentMode              | boolean                                                                   | -        | false      | Browse only the non-editable mode, which is not turned on by default.                                                                                                                                                                                                                                                                                                            |
| stopScrollGraph           | boolean                                                                   | -        | false      | Disable mouse scrolling to move the canvas                                                                                                                                                                                                                                                                                                                                       |
| stopZoomGraph             | boolean                                                                   | -        | false      | Disable scaling of the canvas                                                                                                                                                                                                                                                                                                                                                    |
| stopMoveGraph             | boolean \| 'vertical' \| 'horizontal' \| [number, number, number, number] | -        | false      | Disable dragging the canvas                                                                                                                                                                                                                                                                                                                                                      |
| animation                 | boolean \| `Partial<AnimationConfig>`                                     | -        | -          | Whether to turn on the animation function, can be unified switch and individual configuration                                                                                                                                                                                                                                                                                    |
| history                   | boolean                                                                   | -        | true       | Whether to turn on the history function                                                                                                                                                                                                                                                                                                                                          |
| disabledPlugins           | `string[]`                                                                | -        | -          | Disable loaded plugins when passing in initialization.                                                                                                                                                                                                                                                                                                                           |
| [snapline](#snapline)     | boolean                                                                   | -        | true       | Whether to enable node auxiliary alignment lines                                                                                                                                                                                                                                                                                                                                 |
| guards                    | `GuardsConfig`                                                            | -        | -          | Whether to add guard function, function returns true then execute default logic, return false then block                                                                                                                                                                                                                                                                         |
| disabledTools             | `string[]`                                                                | -        | -          | Disable built-in tools, logicflow built-in tools are 'multipleSelect' and 'textEdit' currently.                                                                                                                                                                                                                                                                                  |
| adjustEdge                | boolean                                                                   | -        | true       | Allows adjustment of edges                                                                                                                                                                                                                                                                                                                                                       |
| adjustEdgeStartAndEnd     | boolean                                                                   | -        | false      | Whether to allow dragging the endpoints of an edge to adjust the linkage                                                                                                                                                                                                                                                                                                         |
| adjustNodePosition        | boolean                                                                   | -        | true       | Whether to allow dragging of nodes                                                                                                                                                                                                                                                                                                                                               |
| hideAnchors               | boolean                                                                   | -        | false      | Whether to hide the node's anchor point, default hidden in silent mode                                                                                                                                                                                                                                                                                                           |
| outline                   | boolean                                                                   | -        | false      | Whether the outer checkbox is displayed in the node selection state.                                                                                                                                                                                                                                                                                                             |
| hoverOutline              | boolean                                                                   | -        | true       | Show the outer frame of the node when the mouse hovers                                                                                                                                                                                                                                                                                                                           |
| nodeSelectedOutline       | boolean                                                                   | -        | true       | Show the outer frame of the node when the mouse is selected                                                                                                                                                                                                                                                                                                                      |
| edgeSelectedOutline       | boolean                                                                   | -        | true       | Show the outer frame of the edge when mouse hover                                                                                                                                                                                                                                                                                                                                |
| nodeTextEdit              | boolean                                                                   | -        | true       | Allow node text to be editable                                                                                                                                                                                                                                                                                                                                                   |
| edgeTextEdit              | boolean                                                                   | -        | true       | Allow edge text to be editable                                                                                                                                                                                                                                                                                                                                                   |
| textEdit                  | boolean                                                                   | -        | true       | Whether to enable text editing                                                                                                                                                                                                                                                                                                                                                   |
| nodeTextDraggable         | boolean                                                                   | -        | false      | Allow node text to be dragged                                                                                                                                                                                                                                                                                                                                                    |
| edgeTextDraggable         | boolean                                                                   | -        | false      | Allow edge text to be dragged                                                                                                                                                                                                                                                                                                                                                    |
| multipleSelectKey         | string                                                                    | -        | -          | Multi-select keys, including meta (cmd), shift and alt. Support key combination to click on elements to achieve multi-selection.                                                                                                                                                                                                                                                 |
| idGenerator               | function                                                                  | -        | -          | Customize the rules for generating ids when creating nodes and edges.                                                                                                                                                                                                                                                                                                            |
| edgeGenerator             | function                                                                  | -        | -          | Rules for generating edges when connecting nodes and moving edges                                                                                                                                                                                                                                                                                                                |
| plugins                   | Array                                                                     | -        | -          | The plug-in loaded by the current LogicFlow instance, or the global plug-in if it is not passed.                                                                                                                                                                                                                                                                                 |
| autoExpand                | boolean                                                                   | -        | -          | Whether to automatically expand the canvas when nodes are dragged near the edge of the canvas, default true. Note that if the canvas keeps scrolling when nodes are dragged to a certain position, it is because there is a problem with the width and height of the initialized canvas. It is recommended to turn off autoExpand if the canvas is of variable width and height. |
| overlapMode               | number                                                                    | -        | -          | The stacking mode for element overlap defaults to connected lines at the bottom, nodes at the top, and selected elements at the top. Can be set to 1 for self-incrementing mode (common for graphing tool scenes).                                                                                                                                                               |
| customTrajectory          | function                                                                  | -        | -          | Customize the connecting trajectory.                                                                                                                                                                                                                                                                                                                                             |
| pluginsOptions            | any                                                                       | -        | -          | Plugin initialization options, user-defined incoming, available in custom plugins.                                                                                                                                                                                                                                                                                               |

### `background`

No background default; support pass-through of any style property to the background layer

```tsx | pure
export
type
  BackgroundConfig = {
  backgroundImage?: string, // background image address
  backgroundColor?: string, // background color
  backgroundRepeat?: string, // background image duplication mode
  backgroundPosition?: string, // background image position
  backgroundSize?: string, // background image size
  backgroundOpacity?: number, // background image opacity
  filter?: string, // filter
  [key: string]: any, // pass-through of any style property to the background layer
}

```

### `grid`

Grid default on, support options:

```tsx | pure
export type GridOptions = {
  size?: number // grid size
  visible?: boolean, // visible or not, false hides the grid lines but keeps the grid effect
  type?: 'dot' | 'mesh', // grid style, built-in support for dot 'dot' and grid 'mesh' currently
  config?: {
    color: string, // grid color
    thickness?: number, // gridline width
  }
};
```

### `keyboard`

Keyboard shortcuts are not enabled by default, support options:

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

Using built-in shortcuts:

```tsx | pure
const lf = new LogicFlow({
  keyboard: {
    enabled: true,
  },
});
```

Built-in shortcut key function：

- `'cmd + c', 'ctrl + c'` Flowchart Replication
- `'cmd + v', 'ctrl + v'` Flowchart Paste
- `'cmd + z', 'ctrl + z'` Previous step
- `'cmd + y', 'ctrl + y'` Next step
- `'backspace'` Delete

Customized shortcut keys:

```tsx | pure
const lf = new LogicFlow({
  keyboard: {
    enabled: true,
    shortcuts: [
      {
        keys: ["cmd + o", "ctrl + o"],
        callback: () => {
          // Customized Logic
        },
      },
    ],
  },
});
```

### `style`

Themes can be configured by style, see the tutorial [Theme](../../tutorial/basic/theme.en.md) for
details of supported style options.

### `snapline`

Alignment line, including the center of the node, top and bottom borders, left and right borders
alignment.

- In editable mode, snaplines are turned on by default; set snapline false to turn them off.
- In non-editable mode, snapline is turned off.
