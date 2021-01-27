# 自定义连线

## getShape

获取连线的 SVG 元素。

```ts
getShape(): h.JSX.Element
```

## getAttributes

获取连线的属性，其返回值如下：

|key|类型|描述|
|-|-|-|
|stroke|string|连线和箭头当前状态的颜色|
|strokeWidth|number|连线的宽度|
|strokeOpacity|number|连线透明度|
|selectedShadow|string|连线选中的阴影效果|
|isSelected|boolean|连线选中状态|
|isHoverd|boolean|连线是否被hoverd|
|properties|object|连线属性|
|hoverStroke|string|设置的连线被hover的颜色|
|selectedStroke|string|设置的连线被选中的颜色|

使用示例：

```ts
getAttributes() {
  const attributes = super.getAttributes();
  return Object.assign(attributes, {});
}
```

## getArrowStyle

获取连线的箭头样式，其返回值如下：

|key|类型|描述|
|-|-|-|
|stroke|string|箭头当前状态的颜色|
|strokeWidth|number|箭头的宽度|
|fill|string|箭头填充颜色|
|offset|number|箭头长度|
|verticalLength|number|箭头垂直于连线的距离|

使用示例：

```ts
getArrowStyle() {
  const style = super.getArrowStyle();
  style.fill = "transparent";
  return style;
}
```
