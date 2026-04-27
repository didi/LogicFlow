---
nav: 指南
group:
  title: 基础
  order: 1
title: 画布
order: 4
toc: content
---

本页介绍与画布外观和编辑辅助相关的三项能力：**网格**（对齐与吸附的最小单位）、**背景**（画布底层样式），以及**对齐线**（拖动节点时与其他节点对齐参考）。

## 网格

网格是指渲染/移动节点的最小单位。网格最主要的作用是在移动节点的时候，保证每个节点中心点的位置都是在网格上。这样更有利于节点之间的对齐。一般来说，网格的间隔越大，在编辑流程图的时候，节点就更好对齐；网格的间隔越小，拖动节点的感觉就更加流畅。

网格默认关闭，渲染/移动最小单位为 1px，若开启网格，则网格默认大小为 20px，渲染节点时表示以 20
为最小单位对齐到网格，移动节点时表示每次移动最小距离为 20px。

:::warning{title=注意}
在设置节点坐标时会按照网格的大小来对坐标进行转换，如设置中心点位置`{ x: 124, y: 138 }`
的节点渲染到画布后的实际位置为 `{ x: 120, y: 140 }`。所以使用 LogicFlow
替换项目中旧的流程设计器时，需要对历史数据的坐标进行处理。<br>
在实际开发中，如果期望节点既可以中心对齐，也可以按照两边对齐。那么自定义节点的宽高需要是 grid
的偶数倍。也就是假设 grid 为 20，那么所有的节点宽度最好是 20、40、80、120 这种偶数倍的宽度。
:::

### 开启网格

在创建画布的时候通过配置 `grid` 来设置网格属性

开启网格并应用默认属性：

```tsx | pure
const lf1 = new LogicFlow({
  grid: true,
})

// 等同于默认属性如下
const lf2 = new LogicFlow({
  grid: {
    size: 20,
    visible: true,
    type: 'dot',
    config: {
      color: '#ababab',
      thickness: 1,
    },
  },
})
```

### 设置网格属性

支持设置网格大小、类型、网格线颜色和宽度等属性。

```tsx | pure
export type GridOptions = {
  size?: number  // 设置网格大小
  visible?: boolean,  // 设置是否可见，若设置为false则不显示网格线但是仍然保留size栅格的效果
  type?: 'dot' | 'mesh', // 设置网格类型，目前支持 dot 点状和 mesh 线状两种
  config?: {
    color: string,  // 设置网格的颜色
    thickness?: number,  // 设置网格线的宽度
  }
};
```

### 网格对齐（snapGrid）

`grid` 和 `snapGrid` 是一组强关联配置，但职责不同：

- `grid`：控制网格怎么显示，以及网格尺寸（`size`、`visible`、`type` 等）
- `snapGrid`：控制节点拖拽、放置时是否吸附到网格

也就是说，`grid` 偏“网格参数与视觉”，`snapGrid` 偏“编辑行为开关”。

#### 如何开启网格对齐

`snapGrid` 属于编辑配置，可以在初始化时传入，也可以在运行时动态更新：

```tsx | pure
const lf = new LogicFlow({
  container: document.querySelector('#app'),
  grid: {
    size: 20,
    visible: true,
    type: 'dot',
  },
  snapGrid: true, // 初始化时开启网格吸附
})

// 运行时切换
lf.updateEditConfig({
  snapGrid: false,
})
```

更多编辑配置（包含 `snapGrid`）见 [editConfigModel](../../api/runtime-model/graphModel.zh.md#editconfigmodel)。

### 网格示例

<a href="https://codesandbox.io/embed/logicflow-base8-hxtqr?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> 去 CodeSandbox 查看示例</a>

## 背景

LogicFlow 支持在画布最底层设置背景层样式，包括背景颜色或背景图片等。创建画布时，通过 `background` 选项来配置；默认值为 `false` 表示不启用背景层。

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
  [key: string]: any,
};
```

### 设置背景图片

```tsx | pure
const lf = new LogicFlow({
  // ...
  background: {
    backgroundImage: "url(../asserts/img/grid.svg)",
    backgroundRepeat: "repeat",
  },
});
```

### 背景示例

<a href="https://codesandbox.io/embed/infallible-goldberg-mrwgz?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> 去 CodeSandbox 查看示例</a>

## 对齐线

对齐线能够在节点移动过程中，将移动节点的位置与画布中其他节点位置进行对比，辅助位置调整。位置对比有如下两个方面。

- 节点中心位置
- 节点的边框

### 对齐线使用

普通编辑模式下，默认开启对齐线，也可通过配置进行关闭。
在 [静默模式](../advanced/silent-mode.zh.md#静默模式) 下，无法移动节点，所以关闭了对齐线功能，无法通过配置开启。

```tsx | pure
// 关闭对齐线功能
const lf = new LogicFlow({
  snapline: false,
})
```

### 对齐线样式设置

对齐线的样式包括颜色和宽度，可以通过设置主题的方式进行修改。

```tsx | pure
// 默认配置
// {
//   stroke: '#1E90FF',
//   strokeWidth: 1,
// }

// 修改对齐线样式
lf.setTheme({
  snapline: {
    stroke: '#1E90FF', // 对齐线颜色
    strokeWidth: 1, // 对齐线宽度
  },
})
```

<example :height="400" ></example>

更多样式修改参见 [主题](./theme.zh.md)。
