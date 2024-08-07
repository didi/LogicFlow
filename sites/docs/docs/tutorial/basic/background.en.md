---
nav: Guide
group:
  title: Basics
  order: 1
title: Background
order: 5
toc: content
---

### Provides methods to modify the background of the canvas, including background color or background image, which is located at the bottom of the canvas. <Badge>info</Badge>

The `background` option sets the style of the background layer of the canvas when it is created, and
supports passthrough of any style attribute to the background layer. The default value of `false`
means no background.

```tsx | pure
const lf = new LogicFlow({
  background: false | BackgroundConfig,
})

type BackgroundConfig = {
  backgroundImage?: string,
  backgroundColor?: string,
  backgroundRepeat?: string,
  backgroundPosition?: string,
  backgroundSize?: string,
  backgroundOpacity?: number,
  filter?: string, // 滤镜
  [key: any]: any,
};
```

### Configuration items

### Set the background color

```tsx | pure
const lf = new LogicFlow({
  // ...
  background: {
    backgroundImage: "url(../asserts/img/grid.svg)",
    backgroundRepeat: "repeat",
  },
});
```

## example

<a href="https://codesandbox.io/embed/infallible-goldberg-mrwgz?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> Go to CodeSandbox for examples</a>
