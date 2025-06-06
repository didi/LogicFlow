---
nav: 指南
group:
  title: 基础
  order: 1
title: 主题 Theme
order: 3
toc: content
---

LogicFlow 提供了完整的主题定制功能，支持通过多种方式设置和自定义主题样式。主题配置可以统一管理画布中所有元素的样式，包括节点、边、文本等。

## 主题配置项

主题配置支持以下主要类别：

- **基础主题**：基础节点和边的通用样式
- **节点主题**：各类节点（矩形、圆形、菱形等）的样式
- **边主题**：各类边（直线、折线、贝塞尔曲线等）的样式
- **文本主题**：节点文本、边文本的样式
- **其他元素**：锚点、箭头、对齐线等辅助元素的样式
- **画布配置**：背景和网格的样式

详细的主题配置参数见[主题 API](../../api/theme.zh.md)


## 主题配置方式

### 方式一：初始化配置

在创建 LogicFlow 实例时，通过 `style` 参数进行初始化配置。

```tsx | pure
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
  themeMode: 'radius', // 初始化设置圆角主题
}
const lf = new LogicFlow(config)
```

### 方式二：使用 setTheme 方法

在 LogicFlow 实例创建后，调用 `setTheme` 方法动态更新主题配置。

```tsx | pure
// 动态配置主题
lf.setTheme({
  rect: { fill: '#FFFFFF', stroke: '#1890FF' }, // 矩形样式
  circle: { r: 15, fill: '#1890FF' }, // 圆形样式
  nodeText: { fontSize: 14, color: '#333333' }, // 节点文本样式
  edgeText: { fontSize: 12, color: '#666666' }, // 边文本样式
  anchor: { r: 4, fill: '#FFFFFF', stroke: '#1890FF' }, // 锚点样式
}, 'radius')
```

## 内置主题模式<Badge>2.0.14新增</Badge>

LogicFlow 内置了四种主题模式，可以快速应用预设样式：

- `default`: 默认主题
- `dark`: 暗黑主题
- `colorful`: 彩色主题
- `radius`: 圆角主题

应用内置主题模式：

```tsx | pure
// 初始化时设置主题模式
const lf = new LogicFlow({
  // ... 其他配置
  themeMode: 'radius', // 设置圆角主题
})

// 动态切换主题模式
lf.setTheme({}, 'dark') // 应用暗黑主题
lf.setTheme({}, 'colorful') // 应用彩色主题

// 应用主题模式并自定义部分样式
lf.setTheme({
  rect: { fill: '#AECBFA' },
  circle: { fill: '#C9DAF8' }
}, 'radius')
```

## 自定义主题模式 <Badge>2.0.14新增</Badge>

LogicFlow 支持创建和管理自定义主题模式。通过 `addThemeMode` 方法可以添加新的主题模式：

```tsx | pure
// 注册自定义主题模式
LogicFlow.addThemeMode('customTheme', {
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

### 主题样式优先级

主题样式的应用优先级（从低到高）：

#### 节点、边、文本等元素样式优先级
1. 内置基础样式（defaultTheme）
2. 应用的主题模式样式（通过 `themeMode` 或 `setTheme` 的第二个参数设置）
3. 自定义样式（通过 `style` 或 `setTheme` 的第一个参数设置）

#### 背景和网格样式优先级
背景（background）和网格（grid）配置具有独立的更新机制，其优先级分为两个阶段：

**初始化阶段优先级**（从低到高）：
1. style 中的配置：通过构造函数 `style` 参数中的 `background` 和 `grid` 配置
2. 直接参数配置：通过构造函数中的 `background` 和 `grid` 参数设置的值（会覆盖 style 中的配置）

**运行时阶段优先级**（从低到高）：
1. 当前配置：初始化后的 `background` 和 `grid` 配置
2. 主题模式配置：调用 `setTheme(style, themeMode)` 时，themeMode 中的背景和网格配置会覆盖当前配置
3. 自定义配置：`setTheme(style, themeMode)` 中 style 参数的 `background` 和 `grid` 配置会覆盖主题模式配置

```tsx | pure
// 示例：背景和网格的优先级应用

// 初始化时：直接参数 > style 参数
const lf = new LogicFlow({
  style: {
    background: { color: '#f0f0f0' }, // 优先级较低
    grid: { size: 15 }                // 优先级较低
  },
  background: { color: '#f5f5f5' },   // 最终生效（覆盖 style 中的配置）
  grid: { size: 20 },                 // 最终生效（覆盖 style 中的配置）
})

// 运行时：style 参数 > themeMode 参数 > 当前配置
lf.setTheme({
  background: { color: '#ffffff' },   // 最终生效的背景配置
  grid: { size: 10, visible: true },  // 最终生效的网格配置
}, 'dark') // dark 主题模式的背景和网格配置会被 style 参数覆盖
```

## 使用示例
<code id="graphData" src="../../../src/tutorial/basic/instance/theme"></code>


