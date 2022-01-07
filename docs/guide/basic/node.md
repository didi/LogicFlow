# 节点 Node

LogicFlow 的内置了一些基础节点，开发者在实际应用场景中，可以基于这些基础节点，定义符合自己业务逻辑的节点。

## 认识LogicFlow的基础节点


LogicFlow是基于svg做的流程图编辑框架，所以我们的节点和连线都是svg基本形状，对LogicFlow节点样式的修改，也就是对svg基本形状的修改。LogicFlow内部存在7种基础节点，分别为：

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

## 选择自定义节点继承的基础节点

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

### 二次自定义

由于基于继承的自定义机制，LogicFlow还支持基于自定义节点的基础上，进行二次自定义。以`@logicflow/extension`中提供的可缩放节点为例。

LogicFlow基础节点不支持节点缩放，于是LogicFlow在`extension`包中，基于基础节点，封装了对节点缩放的逻辑，然后发布出去。这样开发者可以直接基于`extension`中的可缩放节点进行自定义。

```js
import { RectResize } from '@logicflow/extension'
class CustomNodeModel extends RectResize.model {}
class CustomNode extends RectResize.view {}
```


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
import UserTask from './UserTaskNode.js'

const lf = new LogicFlow({
  container: document.querySelector('#container')
});
lf.register(UserTask);

lf.render({
  nodes: [
    {
      type: 'UserTask',
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


### 步骤2: 自定义节点model

```js
class UserTaskModel extends RectNodeModel {
  setAttributes() {
    this.width = 100;
    this.height = 100;
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    const properties = this.properties;
    if (properties.statu === 'pass') {
      style.stroke = "green";
    } else if (properties.statu === 'reject') {
      style.stroke = "red";
    } else {
      style.stroke = "rgb(24, 125, 255)";
    }
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

#### 基于properties属性自定义节点样式

在实际业务中，存在这样的情况，例如在审批场景中，自定义的审批节点存在3种状态：

一种是流程还没有走到这个节点的默认状态，一种是流程审批通过状态，一种是审批不通过的驳回状态。在外观上我们需要对不同的状态显示不同的颜色。LogicFlow的图数据中提到，不论是节点还是边，LogicFlow都保留了properties字段，用于给开发者存放自己的业务属性。在上面示例中，`properties`的`statu`属性就是一个自定义的业务属性，开发者在自定义节点样式的时候，可以基于`properties`中的属性来控制节点显示不同的样式。


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

#### 为什么`rect`的`x`,`y`不是直接从`model`中获取的`x`, `y`?

在LogicFlow所有的基础节点中，`model`里面的`x`,`y`都是统一表示中心点。但是`getShape`方法给我们提供直接生成svg dom的方式，在svg中, 对图形位置的控制则存在差异：

- `rect`: 通过`x`, `y`表示图形的位置，但是表示是图形左上角坐标。 所以一般通过中心点，然后减去节点的宽高的一般计算出左上角坐标。

```js
const { x, y, width, height, radius } = this.props.model;
// svg dom <rect x="100" y="100" width="100" height="80">
h("rect", {
  ...style,
  x: x - width / 2, 
  y: y - height / 2,
  rx: radius,
  ry: radius,
  width,
  height
}),
```

- `circle`和`ellipse`: 通过`cx`, `cy`表示图形的位置，含义为中心点的坐标。

```js
const { x, y, r } = this.props.model;
// svg dom <circle cx="100", cy="100", r="20">
h("circle", {
  ...style,
  r, // 半径保持不变
  cx: x, 
  cy: y,
})

// 椭圆
const { x, y, rx, ry } = this.props.model;
// svg dom <ellipse cx="100", cy="100", rx="20" ry="10">
h("ellipse", {
  ...style,
  cx: x, 
  cy: y,
  rx,
  ry
})
```

- `polygon`: 所有的顶点坐标已包含位置

```js
const { x, y, points } = this.props.model;
const pointStr = points.map((point) => {
    return `${point[0] + x}, ${point[1] + y}`
  }).join(" ");
// svg dom <polygon points="100,10 250,150 200,110" >
h("polygon", {
  ...style,
  r, // 半径保持不变
  points: pointStr, // 
})
```

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

## 自定义节点的锚点

以正方形节点为例，如果我们只想使用水平方向上的左右两个锚点，则需要设置附加属性`anchorsOffset`。

```ts
import { RectNode, RectNodeModel } from '@logicflow/core';

class SquareModel extends RectNodeModel {
  setAttributes() {
    const size = 80;
    this.width = size;
    this.height = size;
    // 设置自定义锚点
    // 只需要为每个锚点设置相对于节点中心的偏移量
    this.anchorsOffset = [
      [size / 2, 0], // x 轴上偏移 size / 2
      [-size / 2, 0], // x 轴上偏移 -size / 2
    ];
  }
}
```

<example
  :height="250"
  iframeId="iframe-2"
  href="/examples/#/advance/custom-node/anchor"
/>

在上例中，我们为`anchorsOffset`设置了一个数组，数组的每一项都是锚点相对于节点中心`(x, y)`的偏移量，例如`[size / 2, 0]`表示在 x 轴方向上从节点中心向右偏移宽度的一半，y 轴方向上不偏移。

## 自定义连接规则校验

在某些时候，我们可能需要控制边的连接方式，比如开始节点不能被其它节点连接、结束节点不能连接其他节点、用户节点后面必须是判断节点等，要想达到这种效果，我们需要为节点设置以下两个属性。

- `sourceRules` - 当节点作为边的起始节点（source）时的校验规则
- `targetRules` - 当节点作为边的目标节点（target）时的校验规则

以正方形（square）为例，在边时我们希望它的下一节点只能是圆形节点（circle），那么我们应该给`square`添加作为`source`节点的校验规则。

```ts
import { RectNode, RectNodeModel } from '@logicflow/core';
class SquareModel extends RectNodeModel {
  setAttributes() {
    const size = 80;
    const circleOnlyAsTarget = {
      message: "正方形节点下一个节点只能是圆形节点",
      validate: (source: any, target: any) => {
        return target.type === "circle";
      },
    };

    this.width = size;
    this.height = size;
    this.anchorsOffset = [
      [size / 2, 0],
      [-size / 2, 0]
    ];
    this.sourceRules.push(circleOnlyAsTarget);
  }
}

```

<example
  :height="400"
  iframeId="iframe-3"
  href="/examples/#/advance/custom-node/rule"
/>

在上例中，我们为`model`的`sourceRules`属性添加了一条校验规则，校验规则是一个对象，我们需要为其提供`messgage`和`validate`属性。

`message`属性是当不满足校验规则时所抛出的错误信息，`validate`则是传入规则检验的回调函数。`validate`方法有两个参数，分别为边的起始节点（source）和目标节点（target），我们可以根据参数信息来决定是否通过校验，其返回值是一个布尔值。

> 当我们在面板上进行边操作的时候，Logic Flow 会校验每一条规则，只有**全部**通过后才能连接。

在边时，当鼠标松开后如果没有通过自定义规则（`validate`方法返回值为`false`），Logic Flow 会对外抛出事件`connection:not-allowed`。

```js
lf.on('connection:not-allowed', (msg) => {
  console.log(msg)
});
```

## 自定义HTML节点

LogicFlow内置了基础的HTML节点和其他基础节点不一样，我们可以利用LogicFlow的自定义机制，实现各种形态的HTML节点，而且HTML节点内部可以使用任意框架进行渲染。

<example
  :height="280"
  iframeId="iframe-6"
  href="/examples/#/advance/custom-node/html"
/>

```ts
class UmlModel extends HtmlNodeModel {
  setAttributes() {
    this.text.editable = false; // 禁止节点文本编辑
    // 设置节点宽高和锚点
    const width = 200;
    const height = 130;
    this.width = width;
    this.height = height;
    this.anchorsOffset = [
      [width / 2, 0],
      [0, height / 2],
      [-width / 2, 0],
      [0, -height/2],
    ]
  }
}
class UmlNode extends HtmlNode {
  currrentProperties: string;
  setHtml(rootEl: HTMLElement) {
    const { properties } = this.props.model;
  
    const el = document.createElement('div');
    el.className = 'uml-wrapper';
    const html = `
      <div>
        <div class="uml-head">Head</div>
        <div class="uml-body">
          <div>+ ${properties.name}</div>
          <div>+ ${properties.body}</div>
        </div>
        <div class="uml-footer">
          <div>+ setHead(Head $head)</div>
          <div>+ setBody(Body $body)</div>
        </div>
      </div>
    `
    el.innerHTML = html;
    // 需要先把之前渲染的子节点清除掉。
    rootEl.innerHTML = '';
    rootEl.appendChild(el);
  }
}
```

### 使用react编写html节点

以为自定义html节点对外暴露的是一个DOM节点，所以你可以使用框架现有的能力来渲染节点。在react中，我们利用`reactDom`的`render`方法，将react组件渲染到dom节点上。

```jsx
import { HtmlNodeModel, HtmlNode } from '@logicflow/core';
import React from 'react';
import ReactDOM from 'react-dom';
import './uml.css';

function Hello(props) {
  return (
    <>
      <h1 className="box-title">title</h1>
      <div className="box-content">
        <p>{props.name}</p>
        <p>{props.body}</p>
        <p>content3</p>
      </div>
    </>
  )
}

class BoxxModel extends HtmlNodeModel {
  setAttributes() {
    this.text.editable = false;
    const width = 200;
    const height = 116;
    this.width = width;
    this.height = height;
    this.anchorsOffset = [
      [width / 2, 0],
      [0, height / 2],
      [-width / 2, 0],
      [0, -height/2],
    ]
  }
}
class BoxxNode extends HtmlNode {
  setHtml(rootEl: HTMLElement) {
    const { properties } = this.props.model;
    ReactDOM.render(<Hello name={properties.name} body={properties.body}/>, rootEl);
  }
}

const boxx = {
  type: 'boxx',
  view: BoxxNode,
  model: BoxxModel
}

export default boxx;


```

```jsx
// page.jsx

import box from './box.tsx';
export default function PageIndex() {
  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph_html') as HTMLElement
    });
    lf.register(box);
    lf.render({
      nodes: [
        {
          id: 11,
          type: 'boxx',
          x: 350,
          y: 100,
          properties: {
            name: 'turbo',
            body: 'hello'
          }
        },
      ]
    });
    lf.on('node:click', ({ data}) => {
      lf.setProperties(data.id, {
        name: 'turbo',
        body: Math.random()
      })
    });
  }, []);

  return (
    <>
      <div id="graph_html" className="viewport" />
    </>
  )
}
```
