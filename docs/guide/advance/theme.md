# 主题 Theme 样式

LogicFlow 提供了设置主题的方法，便于用户统一设置其内部所有元素的样式。  
设置方式有两种：
- 初始化`LogicFlow`时作为配置传入
- 初始化后，调用`LogicFlow`的 setTheme 方法  
  
## 配置
new LogicFlow时作为将主题配置作为参数进行初始化。
  
```ts
// 方法1：new LogicFlow时作为配置传入
const config = {
  domId: 'app',
  width: 1000,
  height: 800,
  style: { // 设置默认主题样式
    rect: { // 矩形样式
      width: 100,
      height: 50,
      radius: 6,
      fill: '#34415b',
      strokeWidth: 0
      ...
    },
    circle: { // 圆形样式
      r: 40,
      fill: '#34415b',
      strokeWidth: 0
      ...
    },
    nodeText: { // 节点文本样式
      fontSize: 16,
      color: '#ffffff'
    },
    edgeText: { // 边文本样式
      fontSize: 16,
      color: '#ffffff'
    },
    anchor: { // 锚点样式
      fill: "#6edd97"
    }
    ...
  }
}
const lf = new LogicFlow(config);
```
## setTheme
调用LogicFlow的setTheme方法，`lf.setTheme`进行主题配置
```ts
// 方法2： 调用LogicFlow的setTheme方法 
lf.setTheme({
   rect: {
      width: 100,
      height: 50,
      radius: 6,
      fill: '#34415b',
      strokeWidth: 0
      ...
    },
    circle: {
      r: 40,
      fill: '#34415b',
      strokeWidth: 0
      ...
    },
    nodeText: {
      fontSize: 16,
      color: '#ffffff'
    },
    edgeText: {
      fontSize: 16,
      color: '#ffffff'
    },
    anchor: {
      fill: "#6edd97"
    }
    ...
})
```

<example :height="400" ></example>

> style 中填写需要覆盖的值，未填写的将会使用默认值，主题配置需要在数据render之前进行。  
> 
> 各个图形支持的属性和默认值在下方样式介绍中有详细讲解。

## 矩形

|key|type|description|default|
|-|-|-|-|
|width|number|宽度|100|
|height|number|高度|80|
|radius|number|圆角弧度|0|
|fill|color|填充颜色|#FFFFFF|
|fillOpacity|number|填充透明度|1|
|stroke|color|边框颜色|#000000|
|strokeWidth|number|边框宽度|2|
|strokeOpacity|number|边框透明度|1|
|opacity|number|整体透明度|1|
|outlineColor|color|外边框颜色|#000000|
|hoverOutlineColor|color|hover外边框颜色|#000000|
|outlineStrokeDashArray|string|控制用来描外边框的点划线的图案范式, 设置为空是为实线|'3,3'|
|hoverOutlineStrokeDashArray|string|控制用来描hover外边框的点划线的图案范式, 设置为空是为实线|'3,3'|
<details>
<summary>点击展开查看矩形样式设置</summary>

```ts
lf.setTheme({
  rect: {
    width: 100,
    height: 80,
    radius: 0,
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
    fillOpacity: 1,
    strokeOpacity: 1,
    opacity: 1,
    outlineColor: '#000000',
    hoverOutlineColor: '#000000',
    outlineStrokeDashArray: '3,3',
    hoverOutlineStrokeDashArray: '3,3'
  },
})
```
</details>

## 圆形

|key|type|description|default|
|-|-|-|-|
|r|number|半径|50|
|fill|color|填充颜色|#FFFFFF|
|fillOpacity|number|填充透明度|1|
|stroke|color|边框颜色|#000000|
|strokeWidth|number|边框宽度|2|
|strokeOpacity|number|边框透明度|1|
|opacity|number|整体透明度|1|
|outlineColor|color|外边框颜色|#000000|
|hoverOutlineColor|color|hover外边框颜色|#000000|
|outlineStrokeDashArray|string|控制用来描外边框的点划线的图案范式, 设置为空是为实线|'3,3'|
|hoverOutlineStrokeDashArray|string|控制用来描hover外边框的点划线的图案范式, 设置为空是为实线|'3,3'|
<details>
<summary>点击展开查看圆形样式设置</summary>

```ts
lf.setTheme({
  circle: {
    r: 50,
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
    fillOpacity: 1,
    strokeOpacity: 1,
    opacity: 1,
    outlineColor: '#000000',
    hoverOutlineColor: '#000000',
    outlineStrokeDashArray: '3,3',
    hoverOutlineStrokeDashArray: '3,3'
  },
})
```
</details>

## 椭圆

|key|type|description|default|
|-|-|-|-|
|rx|number|x轴尺寸|55|
|ry|number|y轴尺寸|45|
|fill|color|填充颜色|#FFFFFF|
|fillOpacity|number|填充透明度|1|
|stroke|color|边框颜色|#000000|
|strokeWidth|number|边框宽度|2|
|strokeOpacity|number|边框透明度|1|
|opacity|number|整体透明度|1|
|outlineColor|color|外边框颜色|#000000|
|hoverOutlineColor|color|hover外边框颜色|#000000|
|outlineStrokeDashArray|string|控制用来描外边框的点划线的图案范式, 设置为空是为实线|'3,3'|
|hoverOutlineStrokeDashArray|string|控制用来描hover外边框的点划线的图案范式, 设置为空是为实线|'3,3'|
<details>
<summary>点击展开查看椭圆样式设置</summary>

```ts
lf.setTheme({
  ellipse: {
    rx: 50,
    ry: 50,
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
    fillOpacity: 1,
    strokeOpacity: 1,
    opacity: 1,
    outlineColor: '#000000',
    hoverOutlineColor: '#000000',
    outlineStrokeDashArray: '3,3',
    hoverOutlineStrokeDashArray: '3,3'
  },
})
```
</details>

## 文本

|key|type|description|default|
|-|-|-|-|
|color|color|字体颜色|#000000|
|fontSize|number|字体大小|1|
|fontWeight|string/number|字体粗细|normal|
|fontFamily|string|字体名称|''|
<details>
<summary>点击展开查看文本样式设置</summary>

```ts
lf.setTheme({
  text: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'normal',
    fontFamily: '',
  },
})
```
</details>

## 节点文本

|key|type|description|default|
|-|-|-|-|
|color|color|字体颜色|#000000|
|fontSize|number|字体大小|1|
|fontWeight|string/number|字体粗细|normal|
|fontFamily|string|字体名称|''|
|dx|number|水平偏移量|None|
|dy|number|垂直偏移量|None|
|textAnchor|string|对齐方式|inherit|
|rotate|number|文字旋转角度|0|
|textLength|number|文本长度|None|
|lengthAdjust|string|文本伸缩方式|'spacing'|
<details>
<summary>点击展开查看节点文本样式设置</summary>

```ts
lf.setTheme({
  nodeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'normal',
    fontFamily: '',
  },
})
```
</details>

## 菱形

|key|type|description|default|
|-|-|-|-|
|rx|number|x轴尺寸|50|
|ry|number|y轴尺寸|50|
|fill|color|填充颜色|#FFFFFF|
|fillOpacity|number|填充透明度|1|
|stroke|color|边框颜色|#000000|
|strokeWidth|number|边框宽度|2|
|strokeOpacity|number|边框透明度|1|
|opacity|number|整体透明度|1|
|outlineColor|color|外边框颜色|#000000|
|hoverOutlineColor|color|hover外边框颜色|#000000|
|outlineStrokeDashArray|string|控制用来描外边框的点划线的图案范式, 设置为空是为实线|'3,3'|
|hoverOutlineStrokeDashArray|string|控制用来描hover外边框的点划线的图案范式, 设置为空是为实线|'3,3'|
<details>
<summary>点击展开查看多边形样式设置</summary>

```ts
lf.setTheme({
  diamond: {
    rx: 50,
    ry: 50,
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
    fillOpacity: 1,
    strokeOpacity: 1,
    opacity: 1,
    outlineColor: '#000000',
    hoverOutlineColor: '#000000',
    outlineStrokeDashArray: '3,3',
    hoverOutlineStrokeDashArray: '3,3'
  },
})
```
</details>

## 多边形

|key|type|description|default|
|-|-|-|-|
|fill|color|填充颜色|#FFFFFF|
|fillOpacity|number|填充透明度|1|
|stroke|color|边框颜色|#000000|
|strokeWidth|number|边框宽度|2|
|strokeOpacity|number|边框透明度|1|
|opacity|number|整体透明度|1|
|outlineColor|color|外边框颜色|#000000|
|hoverOutlineColor|color|hover外边框颜色|#000000|
|outlineStrokeDashArray|string|控制用来描外边框的点划线的图案范式, 设置为空是为实线|'3,3'|
|hoverOutlineStrokeDashArray|string|控制用来描hover外边框的点划线的图案范式, 设置为空是为实线|'3,3'|
<details>
<summary>点击展开查看多边形样式设置</summary>

```ts
lf.setTheme({
  polygon: {
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
    fillOpacity: 1,
    strokeOpacity: 1,
    opacity: 1,
    outlineColor: '#000000',
    hoverOutlineColor: '#000000',
    outlineStrokeDashArray: '3,3',
    hoverOutlineStrokeDashArray: '3,3'
  },
})
```
</details>

## 锚点

|key|type|description|default|
|-|-|-|-|
|r|number|半径|4|
|fill|color|填充颜色|#FFFFFF|
|fillOpacity|number|填充透明度|1|
|stroke|color|边框颜色|#000000|
|strokeWidth|number|边框宽度|1|
|strokeOpacity|number|边框透明度|1|
|opacity|number|整体透明度|1|
|outlineColor|color|外边框颜色|#000000|
|outlineStrokeDashArray|string|控制用来描外边框的点划线的图案范式, 设置为空是为实线|'3,3'|
<details>
<summary>点击展开查看锚点样式设置</summary>

```ts
lf.setTheme({
  anchor: {
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
    fillOpacity: 1,
    strokeOpacity: 1,
    opacity: 1,
    outlineColor: '#000000',
    outlineStrokeDashArray: '3,3',
  },
})
```
</details>


## 锚点hover

|key|type|description|default|
|-|-|-|-|
|r|number|半径|10|
|fill|color|填充颜色|#1E90FF|
|fillOpacity|number|填充透明度|0.5|
|stroke|color|边框颜色|#4169E1|
|strokeWidth|number|边框宽度|1|
|strokeOpacity|number|边框透明度|1|
|opacity|number|整体透明度|1|
<details>
<summary>点击展开查看锚点hover样式设置</summary>

```ts
lf.setTheme({
  anchorHover: {
    r: 10, 
    fill: '#1E90FF',
    fillOpacity: 0.5,
    stroke: '#4169E1',
    strokeWidth: 1,
    strokeOpacity: 1,
    opacity: 1,
  },
})
```
</details>

## 锚点连线

|key|type|description|default|
|-|-|-|-|
|stroke|color|连线颜色|#000000|
|strokeWidth|number|连线宽度|2|
|strokeDasharray|string|图案范式|'3,2'|
<details>
<summary>点击展开查看锚点连线样式设置</summary>

```ts
lf.setTheme({
  anchorLine: {
    stroke: '#000000',
    strokeWidth: 2,
    strokeDasharray: '3,2',
  },
})
```
</details>

## 直线

|key|type|description|default|
|-|-|-|-|
|stroke|color|连线颜色|#000000|
|strokeWidth|number|连线宽度|2|
|strokeDashArray|string|控制连线的点划线的图案范式, 设置为空是为实线|'1,0'|
|hoverStroke|color|连线hover颜色|#000000|
|selectedStroke|color|连线选中颜色|#000000|
|outlineColor|color|外边框颜色|#000000|
|outlineStrokeDashArray|string|控制用来描外边框的点划线的图案范式, 设置为空是为实线|'3,3'|
<details>
<summary>点击展开查看直线样式设置</summary>

```ts
lf.setTheme({
  line: {
    stroke: '#000000',
    strokeWidth: 2,
    strokeDashArray: '1,0',
    hoverStroke: '#000000',
    selectedStroke: '#000000',
    selectedShadow: true,
    outlineColor: '#000000',
    outlineStrokeDashArray: '3,3',
  },
})
```
</details>

## 折线

|key|type|description|default|
|-|-|-|-|
|stroke|color|连线颜色|#000000|
|strokeWidth|number|连线宽度|2|
|strokeDashArray|string|控制连线的点划线的图案范式, 设置为空是为实线|'1,0'|
|hoverStroke|color|连线hover颜色|#000000|
|selectedStroke|color|连线选中颜色|#000000|
|outlineColor|color|外边框颜色|#000000|
|offset|number|折线起终点距离节点的偏移|30|
|outlineStrokeDashArray|string|控制用来描外边框的点划线的图案范式, 设置为空是为实线|'3,3'|
<details>
<summary>点击展开查看折线样式设置</summary>

```ts
lf.setTheme({
  polyline: {
    stroke: '#000000',
    strokeWidth: 2,
    strokeDashArray: '1,0',
    hoverStroke: '#000000',
    selectedStroke: '#000000',
    selectedShadow: true,
    offset: 30,
    outlineColor: '#000000',
    outlineStrokeDashArray: '3,3',
  },
})
```
</details>

## 连线文本

|key|type|description|default|
|-|-|-|-|
|color|color|字体颜色|#000000|
|fontSize|number|字体大小|1|
|fontWeight|string/number|字体粗细|normal|
|fontFamily|string|字体名称|''|
|background|BackgroundObject|文本背景(矩形)|[BackgroundObject](/guide/advance/theme.html#backgroundobject)|
|hoverBackground|BackgroundObject|文本背景(矩形)|null|
|dx|number|水平偏移量|None|
|dy|number|垂直偏移量|None|
|textAnchor|string|对齐方式|inherit|
|rotate|number|文字旋转角度|0|
|textLength|number|文本长度|None|
|lengthAdjust|string|文本拉伸或压缩方式|'spacing'|

### `BackgroundObject`

|key|type|description|default|
|-|-|-|-|
|fill|color|填充颜色|transparent|
|height|number|高度|20|
|stroke|number|边框颜色|transparent|
|radius|number|圆角弧度|0|

<details>
<summary>点击展开查看连线文本样式设置</summary>

```ts
lf.setTheme({
  edgeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'normal',
    fontFamily: '',
    background: {
      fill: 'transparent',
      height: 20,
      stroke: 'transparent',
      radius: 0,
    },
    hoverBackground: {
      fill: 'transparent',
      height: 20,
      stroke: 'transparent',
      radius: 0,
    },
  },
})
```

</details>


## 箭头

|key|type|description|default|
|-|-|-|-|
|offset|number|箭头长度|10|
|verticalLength|number|箭头垂直于连线的距离|5|
<details>
<summary>点击展开查看箭头样式设置</summary>

```ts
lf.setTheme({
  arrow: {
    offset: 10, // 箭头长度
    verticalLength: 5, // 箭头垂直于连线的距离
  },
})
```
</details>


</details>


## 对齐线

|key|type|description|default|
|-|-|-|-|
|stroke|color|对齐线颜色|#1E90FF|
|strokeWidth|number|对齐线宽度|1|
<details>
<summary>点击展开查看对齐线样式设置</summary>

```ts
lf.setTheme({
  snapline: {
    stroke: '#1E90FF', // 对齐线颜色
    strokeWidth: 1, // 对齐线宽度
  },
})
```
</details>
