---
nav: 指南
group:
  title: 基础
  order: 1
title: 网格 Grid
order: 4
toc: content
---

网格是指渲染/移动节点的最小单位。网格最主要的作用是在移动节点的时候，保证每个节点中心点的位置都是在网格上。这样更有利于节点直接的对齐。一般来说，网格的间隔越大，在编辑流程图的时候，节点就更好对齐；网格的间隔越小，拖动节点的感觉就更加流畅。

网格默认关闭，渲染/移动最小单位为 1px，若开启网格，则网格默认大小为 20px，渲染节点时表示以 20
为最小单位对齐到网络，移动节点时表示每次移动最小距离为 20px。

:::warning{title=注意}
在设置节点坐标时会按照网格的大小来对坐标进行转换，如设置中心点位置`{ x: 124, y: 138 }`
的节点渲染到画布后的实际位置为 `{ x: 120, y: 140 }`。所以使用 LogicFlow
替换项目中旧的流程设计器时，需要对历史数据的坐标进行处理。<br>
在实际开发中，如果期望节点既可以中心对齐，也可以按照两边对齐。那么自定义节点的宽高需要是 grid
的偶数倍。也就是假设 grid 为 20，那么所有的节点宽度最好是 20、40、80、120 这种偶数倍的宽度。
:::

## 开启网格

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

## 设置网格属性

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

## 示例

<a href="https://codesandbox.io/embed/logicflow-base8-hxtqr?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> 去 CodeSandbox 查看示例</a>
