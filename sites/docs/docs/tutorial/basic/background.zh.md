---
nav: 指南
group:
  title: 基础
  order: 1
title: 背景 Background
order: 5
toc: content
---

### 提供可以修改画布背景的方法，包括背景颜色或背景图片，背景层位于画布的最底层。 <Badge>info</Badge>

创建画布时，通过 `background` 选项来设置画布的背景层样式，支持透传任何样式属性到背景层。默认值为 `false` 表示没有背景。

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

## 配置项

### 设置背景颜色

```tsx | pure
const lf = new LogicFlow({
  // ...
  background: {
    backgroundImage: "url(../asserts/img/grid.svg)",
    backgroundRepeat: "repeat",
  },
});
```

## 示例

<a href="https://codesandbox.io/embed/infallible-goldberg-mrwgz?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> 去 CodeSandbox 查看示例</a>
