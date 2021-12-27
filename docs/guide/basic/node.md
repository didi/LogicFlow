# 节点 Node

LogicFlow 的内置了一些基础节点，开发者在实际应用场景中，可以基于这些基础节点，定义符合自己业务逻辑的节点。

## 认识LogicFlow的基础节点


LogicFlow是基于svg做的流程图可视化编辑工具，所以我们的节点和连线都是svg基本形状，对LogicFlow节点样式的修改，也就是对svg基本形状的修改。LogicFlow内部存在7种基础节点，分别为：

- 矩形：[rect](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/rect)
- 圆形: [circle](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/circle)
- 椭圆: [ellipse](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/ellipse)
- 多边形: [polygon](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/polygon)
- 菱形: `diamond`
- 文本: [text](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/text)
- HTML: `html`


下面我们看看把基础节点渲染到画布效果

<iframe src="https://codesandbox.io/embed/logicflow-step2-spxng?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="LogicFlow-step2"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>



## 基于继承的自定义节点

LogicFlow的基础节点是比较简单的，但是在业务中对节点外观要求可能有各种情况。LogicFlow提供了非常强大的自定义节点功能，可以支持开发者自定义各种节点。

::: warning 注意
LogicFlow推荐在实际应用场景中，所有的节点都使用自定义节点，将节点的type定义为符合项目业务意义的名称。而不是使用圆形、矩形这种仅表示外观的节点。
:::

LogicFlow的自定义节点是基于继承来实现。开发者可以继承LogicFlow内置的节点，然后利用面向对象的[重写](https://baike.baidu.com/item/%E9%87%8D%E5%86%99/9355942?fr=aladdin)机制。重写节点样式相关的方法，来达到自定义节点的效果。

<img src="../../assets/images/custom-node.png" alt="节点继承原理" style="zoom: 80%;"  />

## 自定义一个业务节点

我们以定义一个如下图所示的用户任务节点为例，来实现一个基于内置矩形节点的自定义节点。

### 步骤1: 定义节点并注册

```js
// UserTaskNode.js
import { RectNode, RectNodeModel } from "@logicflow/core";

class UserTaskModel extends RectNodeModel {}

class UserTaskView extends RectNode {}

export default {
  type: "UserTask",
  view: UserTaskView,
  model: UserTaskModel
};

``` 

```js
// main.js
import UserNode from './UserNode.js'

const lf = new LogicFlow({
  container: document.querySelector('#container')
});
lf.register(UserNode);

lf.render({
  nodes: [
    {
      type: 'UserNode',
      x: 100,
      y: 100
    }
  ]
})
```

#### `model`和`view`

从上面的代码，可以看到，在自定义一个节点的时候，我们需要定义节点的`model`和`view`。这是因为由于LogicFlow基于MVVM模式，所有自定义节点和连线的时候，我们需要自定义`view`和`model`。大多数情况下，需要通过重写定义`model`上获取样式相关的方法和重写`view`上的`getShape`来定义更复杂的节点外观。

::: tip 

LogicFlow为了开发的时候将开发体验和现在前端流行的开发体验对齐，也为了在代码层面更好的理解，让更多的人可以参与进来，我们基于preact、mobx以MVVM模式进行开发。如果大家熟悉react开发的话，可以直接阅读我们的源码，你们可以发现整个项目阅读起来难度和你自己开发的项目差不多。**我们欢迎大家一起参与进来。**

:::


#### 选择自定义节点的model和view

LogicFlow内部存在7种基础节点, 自定义节点的时候可以基于需要选择任一一种来继承, 然后取一个符合自己业务意义的名字。

```js
// 矩形
import { RectNode, RectNodeModel } from "@logicflow/core";
// 圆形
import { CircleNode, CircleNodeModel } from "@logicflow/core";
// 椭圆
import { EllipseNode, EllipseNodeModel } from "@logicflow/core";
// 多边形
import { PolygonNode, PolygonNodeModel } from "@logicflow/core";
// 菱形
import { DiamondNode, DiamondNodeModel } from "@logicflow/core";
// 文本
import { TextNode, TextNodeModel } from "@logicflow/core";
// HTML
import { HtmlNode, HtmlNodeModel } from "@logicflow/core";
```

由于基于继承的自定义机制，LogicFlow还支持基于自定义节点的基础上，进行二次自定义。以`@logicflow/extension`中提供的可缩放节点为例。
LogicFlow基础节点不支持节点缩放，于是LogicFlow在`extension`包中，基于基础节点，封装了对节点缩放的逻辑，然后发布出去。这样开发者可以直接基于`extension`中的可缩放节点进行自定义。

```js
import { RectResize } from '@logicflow/extension'
class CustomNodeModel extends RectResize.model {}
class CustomNode extends RectResize.view {}
```

### 步骤2: 自定义节点model

```js
class UserTaskModel extends RectNodeModel {
  setAttributes() {
    this.width = 100;
    this.height = 100;
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = 'blue'
    return style;
  }
}
```

LogicFlow把自定义节点外观分为了`自定义节点样式属性`和`自定义节点形状属性`两种方式。

#### 自定义节点的样式属性

在LogicFlow中，外观属性表示控制着节点`边框`、`颜色`这类偏外观的属性。这些属性是可以直接通过[主题配置](/api/themeApi.html)来控制。自定义节点样式可以看做在主题的基础上基于当前节点的类型进行再次定义。例如在主题中对所有`rect`节点都定义其边框颜色为红色`stroke: red`。 那么可以在自定义节点`UserTask`的时候，重新定义`UserTask`边框为蓝色`stroke: blue`。

更细粒度的节点样式控制方法，详情见[API 样式属性](/api/nodeModelApi.html#样式属性)

#### 自定义节点的形状属性

在LogicFlow中，形状属性表示节点的宽`width`、高`height`，矩形的圆角`radius`, 圆形的半径`r`, 多边形的顶点`points`等这些控制着节点最终形状的属性。因为LogicFlow在计算节点的锚点、连线的起点终点的时候，会基于形状属性进行计算。对于形状属性的自定义，需要使用`setAttributes`。

LogicFlow对于不同的基础节点，存在一些各基础节点自己特有的形状属性。详情见[API 形状属性](/api/nodeModelApi.html#形状属性)


### 步骤3: 自定义节点view

```js
class UserTaskView extends RectNode {
  private getLabelShape() {
    const { model } = this.props;
    const { x, y, width, height } = model;
    const style = model.getNodeStyle();
    return h(
      "svg",
      {
        x: x - width / 2 + 5,
        y: y - height / 2 + 5,
        width: 25,
        height: 25,
        viewBox: "0 0 1274 1024"
      },
      h("path", {
        fill: style.stroke,
        d:
          "M655.807326 287.35973m-223.989415 0a218.879 218.879 0 1 0 447.978829 0 218.879 218.879 0 1 0-447.978829 0ZM1039.955839 895.482975c-0.490184-212.177424-172.287821-384.030443-384.148513-384.030443-211.862739 0-383.660376 171.85302-384.15056 384.030443L1039.955839 895.482975z"
      })
    );
  }
  /**
   * 完全自定义节点外观方法
   */
  getShape() {
    const { model, graphModel } = this.props;
    const { x, y, width, height, radius } = model;
    const style = model.getNodeStyle();
    return h("g", {}, [
      h("rect", {
        ...style,
        x: x - width / 2,
        y: y - height / 2,
        rx: radius,
        ry: radius,
        width,
        height
      }),
      this.getLabelShape()
    ]);
  }
}
```

#### h函数

`h`方法是LogicFlow对外暴露的渲染函数，其用法与`react`、`vue`的[createElement](https://cn.vuejs.org/v2/guide/render-function.html#createElement-%E5%8F%82%E6%95%B0)一致。但是这里我们需要创建的是`svg`标签，所以需要有一定的svg基础知识。但是大多数情况下，我们不会涉及太复杂的知识，只是简单的矩形、圆形、多边形这种。

```js
h(nodeName, attributes, [...children])

// <text x="100" y="100">文本内容</text>
h('text', { x: 100, y: 100 }, ['文本内容'])

/**
 * <g>
 *   <rect x="100" y="100" stroke="#000000" strokeDasharray="3 3"></rect>
 *   <text x="100" y="100">文本内容</text>
 * </g>
 */ 

h('g',{}, [
  h('rect', { x: 100, y: 100, stroke: "#000000", strokeDasharray="3 3"}),
  h('text', { x: 100, y: 100 }, ['文本内容'])
])

```


#### getShape

此方法作用就是定义最终渲染的图形, LogicFlow内部会将其返回的内容插入到svg DOM上。开发者不是一定需要重写此方法，只有在期望改变最终渲染图形svg DOM的时候才使用此方法。以上面是例子来说，`rect`节点最终渲染的svg DOM只是一个矩形。但是当我们想要在上面加一个图标的时候，那边必定需要修改到最终渲染图形的svg DOM了，这个时候就需要通过重写`getShape`来实现了。

LogicFlow定义一个节点的外观有三种方式，分别为**主题**、**自定义节点model**、**自定义节点view**。这三种方式优先级为`主题 < 自定义节点model < 自定义节点view`。他们的差异是：
- 主题：定义所有此基础类型节点的通用样式，例如定义所有`rect`节点的边框颜色、宽度等。
- 自定义节点model：定义此注册类型节点的样式。
- 自定义节点view: 定义此注册类型节点svg dom。
  
::: warning 注意
虽然`自定义节点view`优先级最高，功能也最完善，理论上我们可以完全通过`自定义节点view`实现任何我们想要的效果，但是此方式还是存在一些限制。 
1. `自定义节点view`最终生成的图形的形状属性必须和`model`中形状属性的一致，因为节点的锚点、外边框都是基于节点model中的`width`和`height`生成。
2. `自定义节点view`最终生成的图形整体轮廓必须和继承的基础图形一致，不能继承的`rect`而在getShape的时候返回的最终图形轮廓变成了圆形。因为LogicFlow对于节点上的连线调整、锚点生成等会基于基础图形进行计算。
:::

#### props

LogicFlow是基于`preact`开发的，我们自定义节点view的时候，可以通过`this.props`获取父组件传递过来的数据。`this.props`对象包含两个属性，分别为:

- `model`: 表示自定义节点的model
- [graphModel](/api/graphModelApi.html): 表示logicflow整个图的model

#### 图标的path如何获取

一般情况下，图标我们可以找UI或者去[iconfont.cn](https://www.iconfont.cn/)获得一个svg格式的文件。然后再IDE中以文本的方式打开，然后格式化，就可以看到代码。

代码中一般是最外层一个svg标签，里面是一个或者多个path。这个时候，我们使用前面提到的`h`方法来实现svg文件中的代码即可。

svg标签一般包括如下属性：
- `viewBox`: [viewBox](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/viewBox)属性允许指定一个给定的一组图形伸展以适应特定的容器元素。一般把svg标签上的`viewBox`属性值复制过来就行。
- `width`和`height`: 这个不需要使用svg标签上的`width`和`height`, 直接写成你期望的宽高就行。

path标签属性：

- `d`: 该属性定义了一个路径。直接复制svg代码过来即可, 不需要去关系d具体内容表示的含义。
- `fill`: 路径的填充颜色, 一般和节点的边框颜色一致，但是也可以按照业务需求自定义。

<iframe src="https://codesandbox.io/embed/logicflow-step3-mhge5?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="LogicFlow-step3"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>
