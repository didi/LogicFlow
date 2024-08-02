---
nav: Guide
group:
  title: Basics
  order: 1
title: Theme
order: 3
toc: content
---

LogicFlow provides a way to set the theme, which makes it easy for users to set the style of all elements inside it in a uniform way.
There are two ways to set a theme:

- Initialize `LogicFlow` and pass it in as configuration.
- After initialization, call the setTheme method of `LogicFlow`.

See [Theme API](../../api/theme.en.md) for theme configuration parameters.

## Configuration

The topic configuration is initialized as a parameter when new LogicFlow is created.

```tsx | pure
// Method 1: Passed in as configuration in new LogicFlow
const config = {
  domId: 'app',
  width: 1000,
  height: 800,
  style: { // Setting the default theme style
    rect: { ... }, // Rectangle Style
    circle: { ... },
    nodeText: { ... },
    edgeText: { ... },
    anchor: { ... },
    // ...,
  },
}
const lf = new LogicFlow(config)
```

## setTheme

Call LogicFlow's setTheme method, `lf.setTheme`, to configure the theme.

```tsx | pure
// Method 2: Call LogicFlow's setTheme method
lf.setTheme({
  rect: {...},
  circle: {...},
  nodeText: {...},
  edgeText: {...},
  anchor: {...},
  ...
})
```

<a href="https://codesandbox.io/embed/logicflow-step6-err2o?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> Go to CodeSandbox for examples </a>
