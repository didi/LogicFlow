---
nav: 指南
group:
  title: 基础
  order: 1
title: 主题 Theme
order: 3
toc: content
---

LogicFlow 提供了设置主题的方法，便于用户统一设置其内部所有元素的样式。
设置方式有两种：

- 初始化`LogicFlow`时作为配置传入
- 初始化后，调用`LogicFlow`的 setTheme 方法

主题配置参数见[主题 API](../../api/theme.zh.md)

## 配置

new LogicFlow 时作为将主题配置作为参数进行初始化。

```tsx | pure
// 方法1：new LogicFlow时作为配置传入
const config = {
  domId: 'app',
  width: 1000,
  height: 800,
  style: { // 设置默认主题样式
    rect: { ... }, // 矩形样式
    circle: { ... }, // 圆形样式
    nodeText: { ... }, // 节点文本样式
    edgeText: { ... }, // 边文本样式
    anchor: { ... }, // 锚点样式
    // ...,
  },
}
const lf = new LogicFlow(config)
```

## setTheme

调用 LogicFlow 的 setTheme 方法，`lf.setTheme`进行主题配置

```tsx | pure
// 方法2： 调用LogicFlow的setTheme方法
lf.setTheme({ // 设置默认主题样式
  rect: {...}, // 矩形样式
  circle: {...}, // 圆形样式
  nodeText: {...}, // 节点文本样式
  edgeText: {...}, // 边文本样式
  anchor: {...}, // 锚点样式
  ...
})
```

<a href="https://codesandbox.io/embed/logicflow-step6-err2o?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> 去 CodeSandbox 查看示例</a>
