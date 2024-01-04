---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: MiniMap
order: 4
---

# MiniMap

### Start

```jsx | purex | pure
import LogicFlow from "@logicflow/core";
import { MiniMap } from "@logicflow/extension";
import "@logicflow/extension/lib/style/index.css";

LogicFlow.use(MiniMap);
```

### Show

The mini-map will not be shown by default, you need to enable it manually.

```jsx | purex | pure
// 1.1.0 and up
lf.extension.miniMap.show(leftPosition?: number, topPosition?: number)

// 1.1.0 and below
MiniMap.show(leftPosition?: number, topPosition?: number);
```

`show()` supports passing the values of the style attributes left and top to determine the position of the mini-map in the canvas.

Only left and top are provided because they can be used with the `lf.getPointByClient` API, but if you want to realize more flexible styles, you can set the styles directly by the class name.

- `lf-mini-map` - mini-map root element
- `lf-mini-map-header` - mini-map header element
- `lf-mini-map-graph` - mini-map canvas element
- `lf-mini-map-close` - mini-map close icon element

> ``MiniMap.show()`` must be called after ``lf.render()``.

### Hide

```jsx | purex | pure
// 1.1.0 or above
lf.extension.miniMap.hide();

// 1.1.0 and below
MiniMap.hide();
```

### example

<a href="https://codesandbox.io/embed/intelligent-matsumoto-t1dc5?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> Go to CodeSandbox for examples </a>
