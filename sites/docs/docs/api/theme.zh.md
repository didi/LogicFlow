---
nav: API
title: 主题
toc: content
order: 2
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

主题可以对 LogicFlow
基础图形的外观进行统一设置。其属性与<a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute" target="_blank">svg 属性</a>
保持一致。
大多数情况下，我们只需要设置一些常用属性即可。

## 常用属性

- <a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke" target="_blank">stroke</a>属性定义了给定图形元素的外轮廓的颜色。
- <a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-dasharray" target="_blank">stroke-dasharray</a>
  属性可控制用来描边的点划线的图案范式。
- <a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-width" target="_blank">stroke-width</a> 
  属性指定了当前对象的轮廓的宽度。
- <a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/fill" target="_blank">fill</a> 属性用来定义给定图形元素内部的颜色。
- <a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/fill-opacity" target="_blank">fill-opacity</a> 属性指定了填色的不透明度或当前对象的内容物的不透明度。
- <a href="https://developer.mozilla.org/en/docs/Web/SVG/Attribute/font-size" target="_blank">font-size</a>属性定义文本字体大小。
- <a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/color" target="_blank">color</a>属性定义文本颜色。

由于 LogicFlow 推荐在实际业务中完全自定义节点的外观和样式，所以 LogicFlow
本身内置的主题样式只包含极少数必须的样式。开发者可以基于自己业务场景对其进行重新定义和扩展。

## 形状属性

LogicFlow 将`width`、`height`、`r`这些影响节点大小的属性叫做`形状属性`, `形状属性`
会影响锚点位置、连线计算。所以不支持在主题中配置，只支持在自定义时配置，详情见[NodeModel 形状属性](./model/nodeModel.zh.md#形状属性)。

## setTheme 设置

| 类型           | 名称                                                                                                                                                                        |
| :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 节点           | - [baseNode](#basenode) <br> - [rect](#rect) <br> - [circle](#circle) <br> - [diamond](#diamond) <br> - [ellipse](#ellipse) <br> - [polygon](#polygon) <br> - [text](#text) |
| 锚点           | [anchor](#anchor)                                                                                                                                                           |
| 文本           | - [nodeText](#nodetext) <br> - [edgeText](#edgetext)                                                                                                                        |
| 线             | -[baseEdge](#baseedge) <br> - [line](#line) <br> - [polyline](#polyline) <br> - [bezier](#bezier)                                                                           |
| 对齐线         | [snapline](#snapline)                                                                                                                                                       |
| 锚点拖出线     | [anchorLine](#anchorline)                                                                                                                                                   |
| 箭头           | [arrow](#arrow)                                                                                                                                                             |
| 连线两端调整点 | [edgeAdjust](#edgeadjust)                                                                                                                                                   |
| 选中/hover     | [outline](#outline)                                                                                                                                                         |

### baseNode

LogicFlow 内置所有的节点都是白色填充，黑色 2 边框。

```tsx | pure
lf.setTheme({
  baseNode: {
    fill: "#FFFFFF",
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### rect

LogicFlow 内置`rect`节点都是白色填充，黑色 2 边框。

```tsx | pure
lf.setTheme({
  rect: {
    fill: "#FFFFFF",
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### circle

LogicFlow 内置`circle`节点都是白色填充，黑色 2 边框。

```tsx | pure
lf.setTheme({
  circle: {
    fill: "#FFFFFF",
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### diamond

LogicFlow 内置`diamond`节点都是白色填充，黑色 2 边框。

```tsx | pure
lf.setTheme({
  diamond: {
    fill: "#FFFFFF",
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### ellipse

LogicFlow 内置`ellipse`节点都是白色填充，黑色 2 边框。

```tsx | pure
lf.setTheme({
  ellipse: {
    fill: "#FFFFFF",
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### polygon

LogicFlow 内置`polygon`节点都是白色填充，黑色 2 边框。

```tsx | pure
lf.setTheme({
  polygon: {
    fill: "#FFFFFF",
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### text

LogicFlow 内置`text`节点字体大小为 12, 颜色为黑色。

```tsx | pure
lf.setTheme({
  text: {
    color: "#000000",
    fontSize: 12,
    background: {
      fill: "transparent",
    },
  },
});
```

### anchor

LogicFlow 内置的锚点是一个半径为 4 的圆。在 hover 状态下回显示一个半径为 10 的圆。

```tsx | pure
lf.setTheme({
  anchor: {
    stroke: "#000000",
    fill: "#FFFFFF",
    r: 4,
    hover: {
      fill: "#949494",
      fillOpacity: 0.5,
      stroke: "#949494",
      r: 10,
    },
  },
});
```

### nodeText

LogicFlow 内置的节点文本

- `overflowMode`: 用于控制节点文本超出节点后的显示效果:
  - `default`为默认，即超出不处理。
  - `autoWrap`为超出了自动换行。
  - `ellipsis`为超出了隐藏，显示省略符号。

```tsx | pure
lf.setTheme({
  nodeText: {
    color: "#000000",
    overflowMode: "default",
    lineHeight: 1.2,
    fontSize: 12,
  },
});
```

### baseEdge

LogicFlow 内置所有的连线都是黑色连线，宽 2。

```tsx | pure
lf.setTheme({
  baseEdge: {
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### line

LogicFlow 内置`line`都是黑色连线，宽 2。

```tsx | pure
lf.setTheme({
  line: {
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### polyline

LogicFlow 内置`polyline`都是黑色连线，宽 2。

```tsx | pure
lf.setTheme({
  polyline: {
    stroke: "#000000",
    strokeWidth: 2,
  },
});
```

### bezier

LogicFlow 内置`bezier`都是黑色连线，宽 2。

- `adjustLine`: 曲线调整手柄的样式。
- `adjustAnchor`: 曲线调整点的样式。

```tsx | pure
lf.setTheme({
  bezier: {
    fill: "none",
    stroke: "#000000",
    strokeWidth: 2,
    adjustLine: {
      stroke: "#949494",
    },
    adjustAnchor: {
      r: 4,
      fill: "#949494",
      stroke: "#949494",
      fillOpacity: 1,
    },
  },
});
```

### edgeText

LogicFlow 内置的连线文本

- `textWidth`: 用于控制连线文本最大宽度。
- `overflowMode`: 用于控制连线文本超出节点后的显示效果。
  - `default`为默认，即超出不处理。
  - `autoWrap`为超出了自动换行。
  - `ellipsis`为超出了隐藏，显示省略符号。
- `background`: 用于控制连线文本对应的背景。

```tsx | pure
lf.setTheme({
  edgeText: {
    textWidth: 100,
    overflowMode: "default",
    fontSize: 12,
    background: {
      fill: "#FFFFFF",
    },
  },
});
```

### arrow

箭头的样式

- `offset`: 箭头长度
- `verticalLength`: 箭头垂直于边的距离

```tsx | pure
lf.setTheme({
  arrow: {
    offset: 10,
    verticalLength: 5,
  },
});
```

### anchorLine

在连线时，从锚点拖出的直线样式

```tsx | pure
lf.setTheme({
  anchorLine: {
    stroke: "#000000",
    strokeWidth: 2,
    strokeDasharray: "3,2",
  },
});
```

### snapline

对齐线样式

```tsx | pure
lf.setTheme({
  snapline: {
    stroke: "#949494",
    strokeWidth: 1,
  },
});
```

### edgeAdjust

当设置允许调整连线起点和终点时，连线两端调整点样式。

```tsx | pure
lf.setTheme({
  edgeAdjust: {
    r: 4,
    fill: "#FFFFFF",
    stroke: "#949494",
    strokeWidth: 2,
  },
});
```

### outline

节点和连线选中或者 hover 状态下的状态框样式。

```tsx | pure
lf.setTheme({
  outline: {
    fill: "transparent",
    stroke: "#949494",
    strokeDasharray: "3,3",
    hover: {
      stroke: "#949494",
    },
  },
});
```

## 主题背景和网格<Badge>2.1.0新增</Badge>

除了节点和边的样式外，LogicFlow 还支持设置画布的背景色和网格样式。

### 背景色设置

```tsx | pure
lf.setTheme({
  background: {
    background: '#f5f5f5' // 设置画布背景色
  }
});
```

### 网格样式设置

```tsx | pure
lf.setTheme({
  grid: {
    color: '#acacac', // 网格线颜色
    thickness: 1,     // 网格线宽度
    visible: true     // 是否显示网格
  }
});
```

### 背景和网格样式优先级

背景和网格样式的生效优先级从高到低如下：

1. 通过 `setTheme` 直接设置的样式（最高优先级）
```tsx | pure
// 直接设置样式，优先级最高
lf.setTheme({
  background: {
    background: '#f5f5f5'
  },
  grid: {
    color: '#acacac',
    thickness: 1
  }
});
```

2. 主题模式中的样式
```tsx | pure
// 主题模式中的样式，优先级次之
LogicFlow.addThemeMode('custom', {
  background: {
    background: '#ffffff'
  },
  grid: {
    color: '#e0e0e0',
    thickness: 1
  }
});
```

3. 默认主题样式（最低优先级）
```tsx | pure
// 默认主题样式
const defaultTheme = {
  background: {
    background: '#ffffff'
  },
  grid: {
    color: '#acacac',
    thickness: 1
  }
};
```

样式生效规则：
- 当切换主题模式时，会应用主题模式中定义的背景和网格样式
- 如果在切换主题模式后，通过 `setTheme` 设置了新的样式，会覆盖主题模式中的样式
- 主题模式中未定义的样式会继承默认主题的配置
- 清除主题模式（`clearThemeMode`）会恢复到默认主题样式

## 主题模式管理<Badge>2.1.0新增</Badge>

在2.1.0及之后的版本里，LogicFlow 提供了主题模式的管理功能，支持添加、删除和清除主题模式。

### 添加主题模式

使用 `addThemeMode` 方法可以添加新的主题模式：

```tsx | pure
// 添加一个名为 'custom' 的主题模式
LogicFlow.addThemeMode('custom', {
  baseNode: {
    fill: '#f0f0f0',
    stroke: '#333333',
    strokeWidth: 2,
  },
  background: {
    background: '#ffffff'
  },
  grid: {
    color: '#e0e0e0',
    thickness: 1
  }
});
```

### 删除主题模式

使用 `removeThemeMode` 方法可以删除指定的主题模式：

```tsx | pure
// 删除名为 'custom' 的主题模式
LogicFlow.removeThemeMode('custom');
```

### 清除所有主题模式

使用 `clearThemeMode` 方法可以清除所有自定义的主题模式，恢复到默认状态：

```tsx | pure
// 清除所有主题模式
LogicFlow.clearThemeMode();
```

### 主题模式切换

在添加主题模式后，可以通过 `setTheme` 方法切换到对应的主题模式：

```tsx | pure
// 切换到 'custom' 主题模式
lf.setTheme({}, 'custom');
```

### 主题模式继承

主题模式支持继承默认主题的配置，只需要在自定义主题中覆盖需要修改的部分：

```tsx | pure
// 继承默认主题，只修改部分配置
LogicFlow.addThemeMode('custom', {
  baseNode: {
    fill: '#f0f0f0',  // 只修改填充色
  },
  // 其他配置继承默认主题
});
```

### 背景和网格与主题模式

背景色和网格样式可以作为主题模式的一部分进行配置：

```tsx | pure
// 在主题模式中包含背景和网格配置
LogicFlow.addThemeMode('dark', {
  // 节点和边的样式
  baseNode: {
    fill: '#23272e',
    stroke: '#fefeff',
  },
  baseEdge: {
    stroke: '#fefeff',
  },
  // 背景和网格配置
  background: {
    background: '#23272e'
  },
  grid: {
    color: '#66676a',
    thickness: 1
  }
});
```

### 注意事项

1. 主题模式的名称不能重复，如果添加已存在的主题模式会收到警告提示。
2. 清除主题模式会删除所有自定义的主题配置，包括背景色和网格样式。
3. 主题模式的切换会完全覆盖当前的主题配置，建议在切换前保存重要的自定义配置。
4. 背景色和网格样式的设置会立即生效，不需要重新渲染画布。
5. 主题模式的内存管理：
   - 主题模式配置会一直存在于内存中，直到页面刷新或调用 `clearThemeMode`
   - 建议在不需要时及时清理不再使用的主题模式
   - 在组件卸载时，可以考虑调用 `clearThemeMode` 清理主题配置或调用`lf.destory()`销毁实例的方式来清理主题
6. 主题模式的继承机制：
   - 自定义主题会自动继承默认主题的配置
   - 可以通过覆盖特定属性来自定义主题样式
   - 未覆盖的属性将保持默认主题的配置
