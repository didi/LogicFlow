---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 小地图 (MiniMap)
order: 4
toc: content
tag: 优化
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

LogicFlow 的画布小地图是一个缩略图视图，帮助用户快速导航和定位大型或复杂图表的不同区域。

本文是 2.0 版本最新语法，2.0 版本以前请移步<a href="https://docs.logic-flow.cn/docs/#/zh/guide/extension/component-minimap" target="_blank">旧版</a>。

## 演示

<code id="react-portal" src="@/src/tutorial/extension/mini-map"></code>

## 使用

### 1. 注册

两种注册方式，全局注册和局部注册，区别是全局注册每一个 `lf` 实例都可以使用。

```tsx | pure
import LogicFlow from "@logicflow/core";
import { MiniMap } from "@logicflow/extension";

// 全局注册
LogicFlow.use(MiniMap);

// 局部注册
const lf = new LogicFlow({
  ...config,
  plugins: [MiniMap]
});

```

### 2. 配置

在初始化 `lf` 实例时可以通过 `pluginsOptions` 自定义配置 mini-map 的能力。

```tsx | pure

const miniMapOptions: MiniMap.MiniMapOption = {
  ...options
}

const lf = new LogicFlow({
  ...config,
  plugins: [MiniMap],
  pluginsOptions: {
    miniMap: miniMapOptions,
  },
});

```

`miniMapOptions` 配置如下：

| 属性名  | 类型 | 默认值 | 必填 | 描述   |
| --------- | -------- | -------------------------- | -------- | -------------------------------------------------------------- |
| width           | number  | 150   | - | 小地图中画布的宽度                                   |
| height          | number  | 220   | - | 小地图中画布的高度                                   |
| showEdge        | boolean | false | - | 在小地图的画布中是否渲染边                            |
| headerTitle     | string  | 导航   |  - | 小地图标题栏的文本内容，默认不显示                    |
| isShowHeader    | boolean | false | - | 是否显示小地图的标题栏                               |
| isShowCloseIcon | boolean | false | - | 是否显示关闭按钮                                    |
| leftPosition    | number  | -     | - | 小地图与画布左边界的左边距，优先级高于`rightPosition`   |
| rightPosition   | number  | 0     | - | 小地图与画布右边界的右边距，优先级低于`leftPosition`    |
| topPosition     | number  | -     | - | 小地图与画布上边界的上边距，优先级高于`bottomPosition`  |
| bottomPosition  | number  | 0     | - | 小地图与画布下边界的下边距，优先级低于`topPosition`     |

## API

### show

引入 mini-map 后默认不展示，需要手动开启显示。

```tsx | pure

lf.extension.miniMap.show(left?: number, top?: number): void

```

`show()` 支持传入样式属性 left 和 top 的值，用来确定 mini-map 在画布中相对于左上角的位置，不传默认显示在画布右下角。

只提供 left 和 top 这两个值是因为可以与`lf.getPointByClient` API 配合使用，如果想实现更加灵活的样式，可以直接通过类名设置样式。

- `lf-mini-map` - mini-map 根元素
- `lf-mini-map-header` - mini-map 头部元素
- `lf-mini-map-graph` - mini-map 画布元素
- `lf-mini-map-close` - mini-map 关闭图标元素

> `MiniMap.show()`必须在`lf.render()`后调用。

### hide

隐藏 mini-map。

```tsx | pure

lf.extension.miniMap.hide(): void

```

### reset

重置 mini-map 的缩放和平移，本质是重置画布的缩放和平移。

```tsx | pure

lf.extension.miniMap.reset(): void

```

内部实现：

```tsx | pure

lf.resetTranslate()
lf.resetZoom()

```

### updatePosition

更新小地图在画布中的位置。

```tsx | pure

lf.extension.miniMap.updatePosition(MiniMapPosition): void

```

`MiniMapPosition` 参数如下：

```tsx | pure

export type AbsolutePosition = Partial<
  Record<'left' | 'right' | 'top' | 'bottom', number>
>

export type MiniMapPosition =
  | 'left-top' // 表示迷你地图位于容器的左上角
  | 'right-top' // 表示迷你地图位于容器的右上角
  | 'left-bottom' // 表示迷你地图位于容器的右上角
  | 'right-bottom' // 表示迷你地图位于容器的右下角。
  | AbsolutePosition // 自定义小地图在画布上的位置

```

### setShowEdge

设置小地图的画布中是否显示边。

```tsx | pure

lf.extension.miniMap.setShowEdge(showEdge: boolean): void

```

`showEdge`: `true` 显示，`false` 隐藏。

## 事件

mini-map 事件。

| 事件名  | 说明 | 事件对象 |
| --------- | -------- | --------------------------- |
| miniMap:close | 小地图隐藏 | {} |
