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

- 初始化 `LogicFlow` 时通过 `style` 参数配置传入
- 初始化后，调用 `LogicFlow` 实例的 `setTheme` 方法

详细的主题配置参数见[主题 API](../../api/theme.zh.md)

## 主题配置方式

### 方式一：初始化配置

在创建 LogicFlow 实例时，通过 `style` 参数进行初始化配置。

```tsx | pure
// 方法1：通过 style 参数配置主题
const config = {
  container: document.querySelector('#container'),
  width: 1000,
  height: 800,
  style: { // 设置默认主题样式
    rect: { fill: '#FFFFFF', strokeWidth: 2 }, // 矩形样式
    circle: { r: 15, fill: '#1E90FF' }, // 圆形样式
    nodeText: { fontSize: 14, color: '#333333' }, // 节点文本样式
    edgeText: { fontSize: 12, color: '#666666' }, // 边文本样式
    anchor: { stroke: '#999999', fill: '#FFFFFF' }, // 锚点样式
  },
  themeMode: 'radius', //初始化设置圆角主题
}
const lf = new LogicFlow(config)
```

### 方式二：使用 setTheme 方法

在 LogicFlow 实例创建后，调用 `setTheme` 方法动态更新主题配置。

**参数** 

| 名称      | 类型                                | 必传 | 默认值    | 描述       |
| :-------- | :---------------------------------- | :--- | :-------- | :--------- |
| style     | [Theme](../../api/type/Theme.zh.md) | -    | -         | 自定义样式 |
| themeMode | string                              | -    | `default` | 主题类型   |

```tsx | pure
// 方法2：调用 setTheme 方法动态配置主题
lf.setTheme({
  rect: { fill: '#FFFFFF', stroke: '#1890FF' }, // 矩形样式
  circle: { r: 15, fill: '#1890FF' }, // 圆形样式
  nodeText: { fontSize: 14, color: '#333333' }, // 节点文本样式
  edgeText: { fontSize: 12, color: '#666666' }, // 边文本样式
  anchor: { r: 4, fill: '#FFFFFF', stroke: '#1890FF' }, // 锚点样式
}, 'radius')
```

## 内置主题模式

LogicFlow 内置了四种主题模式，可以快速应用预设样式：

- `default`: 默认主题
- `dark`: 暗黑主题
- `colorful`: 彩色主题
- `radius`: 圆角主题

应用内置主题模式：

```tsx | pure
const lf = new LogicFlow({
  // ..., // 其他配置
  themeMode: 'radius', //初始化设置圆角主题
})
// 应用暗黑主题
lf.setTheme({}, 'dark')

// 应用彩色主题
lf.setTheme({}, 'colorful')

// 应用圆角主题，并自定义部分样式
lf.setTheme({
  rect: { fill: '#AECBFA' },
  circle: { fill: '#C9DAF8' }
}, 'radius')
```

## 自定义主题模式

使用者可以通过 `addThemeMode` 方法添加自定义主题模式：

```tsx | pure
// 注册自定义主题模式
lf.addThemeMode('customTheme', {
  baseNode: { fill: '#EFF5FF', stroke: '#4B83FF' },
  rect: { radius: 8 },
  circle: { r: 25 },
  nodeText: { fontSize: 16, color: '#4B83FF' },
  edgeText: { fontSize: 14, background: { fill: '#EEF7FE' } },
  arrow: { offset: 6, verticalLength: 3 },
})

// 应用自定义主题
lf.setTheme({}, 'customTheme')
```

## 主题样式优先级

设置主题样式的优先级（从高到低）：
1. 内置基础样式（defaultTheme）
2. 应用的主题模式样式（初始化时通过`themeMode`传入或通过`setTheme`第二个参数设置）
3. 自定义样式（初始化时通过`style`传入或通过`setTheme`第一个参数传入）

## 使用示例
<code id="graphData" src="../../../src/tutorial/basic/instance/theme"></code>


