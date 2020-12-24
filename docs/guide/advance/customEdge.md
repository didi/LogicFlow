# 自定义连线

同自定义节点一样，在具体业务中我们也可能需要对连线进行一定的自定义，比如流程中高亮表示这个流程的执行路径。

## 使用方法

自定义连线使用的方法与自定义节点相同，该方法（`getAttributes`）除了返回节点的构造函数，还会返回连线的构造函数。

### getAttributes

```js
lf.register('customPolyline', ({ PolylineEdge, PolylineEdgeModel }) => {
  class CustomPolylineEdge extends PolylineEdge {
    static extendKey = "CustomPolylineEdge";
    getAttributes() {
      const attr = super.getAttributes();
      if (attr.properties.isExecuted) {
        attr.stroke = 'red';
      }
      return attr;
    }
  }
  class CustomPolylineEdgeModel extends PolylineEdgeModel {}
  return {
    view: CustomPolylineEdge,
    model: CustomPolylineEdgeModel,
  }
});
```

如上代码所示，我们可以依据当前的业务状态，重新设置当前 edge 的 attributes。

attributes 的内容为：

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


### extendKey

在注册的时候，我们自定义的 class 会有一个静态属性`extendKey`, 当你注册的元素希望能继续被其它元素继承的时候，则必须使用这个属性标识你注册的元素的`class.name`。

详细原因请参考：[自定义节点原理](./)

### getArrowStyle

我们除了可以通过重写`getAttributes`来实现修改连线的样式，也可以通过重写`getArrowStyle`来实现对箭头样式的细粒度控制。

```js
lf.register('customPolyline', ({ PolylineEdge, PolylineEdgeModel }) => {
  class CustomPolylineEdge extends PolylineEdge {
    static extendKey = 'CustomPolylineEdge';
    getArrowStyle() {
      const style = super.getArrowStyle();
      style.fill = 'transparent'
      return style;
    }
  }
  class CustomPolylineEdgeModel extends PolylineEdgeModel {}
  return {
    view: CustomPolylineEdge,
    model: CustomPolylineEdgeModel,
  }
});
```

|key|类型|描述|
|-|-|-|
|stroke|string|箭头当前状态的颜色|
|strokeWidth|number|箭头的宽度|
|fill|string|箭头填充颜色|
|offset|number|箭头长度|
|verticalLength|number|箭头垂直于连线的距离|

### getShape

Logic Flow的自定义机制是基于类的继承来实现，理论上可以通过`getShape`实现任何想要的连线方式。但是由于开发成本较高，而且内置的直线、折线和即将支持的曲线能满足绝大部分需求，这里不详细说明如何自定义连线的形状和交互了。如果有需要，建议阅读源码。也欢迎将你实现的自定义连线通过`extension`的方式提交 PR 给我们。

## 示例

<example :height="250" ></example>
