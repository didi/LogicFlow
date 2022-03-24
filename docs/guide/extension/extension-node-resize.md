# 节点缩放
## 使用

LogicFlow在extension包中提供了`RectResize`、`EllipseResize`、`DiamonResize`、`HtmlResize`这4种支持缩放的基础节点, 每个节点都有`view`和`model`这两个属性。节点的缩放也是利用LogicFlow的自定义节点机制，使开发者可以继承这4种可以缩放的节点，来实现节点的缩放。

以我们需要一个可以缩放的矩形为例，在以前我们不支持节点缩放时，我们自定义节点方式为：
```js
// 不可以缩放的节点
import { RectNode, RectNodeModel } from '@logicflow/core'
class CustomNode extends RectNode {}
class CustomNodeModel extends RectNodeModel {}
export default {
  type: 'custom-node',
  model: CustomNodeModel,
  view: CustomNode
}
```

如果我们期望自定义的节点可以缩放，那么则改成：
```js
// 支持缩放的节点
import { RectResize } from '@logicflow/extension'
class CustomNode extends RectResize.view {}
class CustomNodeModel extends RectResize.model {}
export default {
  type: 'custom-node',
  model: CustomNodeModel,
  view: CustomNode
}
```

### 设置节点的形状属性

LogicFlow把节点的宽高、半径等属性称之为[形状属性](/api/nodeModelApi.html#形状属性)，我们可以重写model中的[initNodeData](/api/nodeModelApi.html#getoutlinestyle)或者[setAttributes](/api/nodeModelApi.html#setattributes)方法来设置节点的形状属性。但是当节点可以缩放后，我们不能在`setAttributes`中设置宽高，只能在`initNodeData`中设置。

```js
class ResizableRectModel extends RectResize.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.width = 100;
    this.height = 40;
  }
}
```

### 自定义节点的view

在自定义节点中提到过，对于样式属性比较复杂的节点，我们可以重写`view`中的`getShape`方法来实现自定义节点真实渲染的外观。但是由于自定义节点需要在节点外观上填加用于缩放的调整点，所以对于自定义可缩放节点的view，我们需要重写`getResizeShape`, 而不是`getShape`。

```js
import { RectResize } from '@logicflow/extension';

class ResizableRectModel extends RectResize.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.width = 100;
    this.height = 40;
    this.text.draggable = true;
  }
}
class ResizableRectView extends RectResize.view {
  /**
   * 此方法替代自定义节点的getShape方法。
   */
  getResizeShape() {
    const { model } = this.props;
    const { x, y, width, height, radius, properties } = model;
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
    ]);
  }
}

export default {
  type: "resizable-rect",
  view: ResizableRectView,
  model: ResizableRectModel
};

```

## 事件

节点缩放后抛出事件`node:resize`，抛出数据包括节点缩放前后的节点位置、节点大小信息， 数据为{oldNodeSize, newNodeSize}, 详细字段如下。

| 名称  | 类型   | 描述           |
| :---- | :----- | :------------- |
| id    | String | 节点 id|
| type | String | 节点类型 |
| modelType | String | 节点图形类型，已内部定义 |
| x | Number | 节点中心x轴坐标 |
| y | Number | 节点中心y轴坐标 |
| rx | Number | x轴半径(椭圆、菱形) |
| ry | Number | y轴半径(椭圆、菱形) |
| width | Number | 节点宽度(矩形) |
| height | Number | 节点高度(矩形) |

```js
lf.on('node:resize', ({oldNodeSize, newNodeSize}) => {
  console.log(oldNodeSize, newNodeSize)
})
```

## 设置放大缩小的最大最小值 

`v1.1.8`后，节点的放大缩小支持设置最大值和最小值。 

```js
class ResizableRectModel extends RectResize.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.width = 100;
    this.height = 40;
    this.maxWidth = 400;
    this.maxHeight = 400;
  }
}
```

## 设置放大缩小的调整默认距离

`v1.1.8`后，支持设置节点的`girdSize`属性，用来控制鼠标移动多少距离后开始缩放节点。

```js
class ResizableRectModel extends RectResize.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.gridSize = 400;
  }
}
```

::: tip 关于节点缩放的gridSize
大多数情况下，为了保证节点的`整齐`，便于节点之间的上下左右对齐。`logicflow`默认在放大缩小时，只有鼠标移动的距离达到初始化画布传入的`gridSize`两倍时才改变节点的大小。但是这样会有一个缺点，那就是调整的时候有卡顿的感觉。可以再不改变初始化`gridSize`的情况下，单独设置每个节点的`gridSize`来让放大缩小节点更流畅。
:::

## 设置调整边框样式

可放大缩小节点在被选中时，会贴着节点显示一个虚线框（矩形没有）。可以通过重写`getResizeOutlineStyle`方法实现自定义其样式。

```js
class ResizableRectModel extends RectResize.model {
  getResizeOutlineStyle() {
    return {
      stroke: '#000000',
      strokeWidth: 1,
      strokeDasharray: '3,3',
    };
  }
}
```

## 设置调整点样式

可放大缩小节点在被选中时，会在虚线框的四个角生成调整节点大小的操作点，可以通过重写`getControlPointStyle`方法实现自定义其样式。


```js
class ResizableRectModel extends RectResize.model {
  getControlPointStyle() {
    return {
      width: 7,
      height: 7,
      fill: '#FFFFFF',
      stroke: '#000000',
    };
  }
}
```


地址: [https://codesandbox.io/s/prod-resonance-ztpvtv](https://codesandbox.io/s/prod-resonance-ztpvtv?file=/step_26_nodeResize/index.js)

<iframe src="https://codesandbox.io/embed/prod-resonance-ztpvtv?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="prod-resonance-ztpvtv"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>
