# 主题

主题可以对LogicFlow基础图形的外观进行统一设置。其属性与[svg属性](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute)保持一致。
大多数情况下，我们只需要设置一些常用属性即可。

## 常用属性

- [stroke](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke)属性定义了给定图形元素的外轮廓的颜色。
- [stroke-dasharray](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-dasharray)属性可控制用来描边的点划线的图案范式。
- [stroke-width](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-width)属性指定了当前对象的轮廓的宽度。
- [fill](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/fill)属性用来定义给定图形元素内部的颜色。
- [fill-opacity](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/fill-opacity)属性指定了填色的不透明度或当前对象的内容物的不透明度。
- [font-size](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-size)属性定义文本字体大小
- [color](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/color)属性定义文本颜色

由于LogicFlow推荐在实际业务中完全自定义节点的外观和样式，所以LogicFlow本身内置的主题样式只包含极少数必须的样式。开发者可以基于自己业务场景对其进行重新定义和扩展。

## baseNode

LogicFlow内置所有的节点都是白色填充，黑色2边框。

```js
lf.setTheme({
  baseNode: {
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
  }
})
```

## rect

LogicFlow内置`rect`节点都是白色填充，黑色2边框。

```js
lf.setTheme({
  rect: {
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
  }
})
```


## circle

LogicFlow内置`circle`节点都是白色填充，黑色2边框。

```js
lf.setTheme({
  circle: {
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
  }
})
```

## diamond

LogicFlow内置`diamond`节点都是白色填充，黑色2边框。

```js
lf.setTheme({
  diamond: {
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
  }
})
```

## ellipse

LogicFlow内置`ellipse`节点都是白色填充，黑色2边框。

```js
lf.setTheme({
  ellipse: {
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
  }
})
```

## polygon

LogicFlow内置`polygon`节点都是白色填充，黑色2边框。

```js
lf.setTheme({
  polygon: {
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
  }
})
```

## text

LogicFlow内置`text`节点字体大小为12, 颜色为黑色。

```js
lf.setTheme({
  text: {
    fill: '#000000',
    fontSize: 12,
  },
})
```

## anchor

LogicFlow内置的锚点是一个半径为4的圆。在hover状态下回显示一个半径为10的圆。

```js
lf.setTheme({
  anchor: {
    stroke: '#000000',
    fill: '#FFFFFF',
    r: 4,
    hover: {
      fill: '#949494',
      fillOpacity: 0.5,
      stroke: '#949494',
      r: 10,
    },
  },
})
```

## nodeText

LogicFlow内置的节点文本

- `overflowMode`: 用于控制节点文本超出节点后的显示效果:
  - `default`为默认，即超出不处理。
  - `autoWrap`为超出了自动换行。
  - `ellipsis`为超出了隐藏，显示省略符号。

```js
lf.setTheme({
  nodeText: {
    color: '#000000',
    overflowMode: 'default',
    lineHeight: 1.2,
    fontSize: 12,
  },
})
```

## baseEdge

LogicFlow内置所有的连线都是黑色连线，宽2。

```js
lf.setTheme({
  baseEdge: {
    stroke: '#000000',
    strokeWidth: 2,
  }
})
```

## line

LogicFlow内置`line`都是黑色连线，宽2。

```js
lf.setTheme({
  line: {
    stroke: '#000000',
    strokeWidth: 2,
  }
})
```

## polyline

LogicFlow内置`polyline`都是黑色连线，宽2。

```js
lf.setTheme({
  polyline: {
    stroke: '#000000',
    strokeWidth: 2,
  }
})
```

## polyline

LogicFlow内置`polyline`都是黑色连线，宽2。

- `offset`表示折线转折点基于节点的距离。

```js
lf.setTheme({
  polyline: {
    offset: 30,
    stroke: '#000000',
    strokeWidth: 2,
  }
})
```

## bezier

LogicFlow内置`bezier`都是黑色连线，宽2。

- `offset`：和折线`offset`不一样，此属性是控制曲线调整手柄的长度。
- `adjustLine`: 曲线调整手柄的样式。
- `adjustAnchor`: 曲线调整点的样式。

```js
lf.setTheme({
  bezier: {
    fill: 'none',
    stroke: '#000000',
    strokeWidth: 2,
    offset: 100,
    adjustLine: {
      stroke: '#949494',
    },
    adjustAnchor: {
      r: 4,
      fill: '#949494',
      stroke: '#949494',
      fillOpacity: 1,
    },
  },
})
```

## edgeText

LogicFlow内置的连线文本

- `textWidth`: 用于控制连线文本最大宽度。
- `overflowMode`: 用于控制连线文本超出节点后的显示效果。
   - `default`为默认，即超出不处理。
   - `autoWrap`为超出了自动换行。
   - `ellipsis`为超出了隐藏，显示省略符号。
- `background`: 用于控制连线文本对应的背景。

```js
lf.setTheme({
  edgeText: {
    textWidth: 100,
    overflowMode: 'default',
    fontSize: 12,
    background: {
      fill: '#FFFFFF',
    },
  },
})
```

## arrow

箭头的样式

- `offset`: 箭头长度
- `verticalLength`: 箭头垂直于边的距离

```js
lf.setTheme({
  arrow: {
    offset: 10,
    verticalLength: 5,
  },
})
```

## anchorLine

在连线是，从锚点拖出的直线样式

```js
lf.setTheme({
  anchorLine: {
    stroke: '#000000',
    strokeWidth: 2,
    strokeDasharray: '3,2',
  },
})
```

## snapline

对齐线样式

```js
lf.setTheme({
  snapline: {
    stroke: '#949494',
    strokeWidth: 1,
  },
})
```

## edgeAdjust

当设置允许调整连线起点和终点时，连线两端调整点样式。

```js
lf.setTheme({
  edgeAdjust: {
    r: 4,
    fill: '#FFFFFF',
    stroke: '#949494',
    strokeWidth: 2,
  },
})
```

## outline

节点和连线选中或者hover状态下的状态框样式。

```js
lf.setTheme({
  outline: {
    fill: 'transparent',
    stroke: '#949494',
    strokeDasharray: '3,3',
    hover: {
      stroke: '#949494',
    },
  },
})
```