# 边 Edge

和节点一样，LogicFlow也内置一些基础的边。LogicFlow 的内置边包括:
- 直线(line)
- 直角折线(polyline)
- 贝塞尔曲线(bezier)

效果如下：

<iframe src="https://codesandbox.io/embed/condescending-nash-lx1n1?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="condescending-nash-lx1n1"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

## 选择自定义边继承的内置边

```js
// 直线
import { LineEdge, PolylineEdgeModel } from "@logicflow/core";
// 折线
import { PolylineEdge, PolylineEdgeModel } from "@logicflow/core";
// 贝塞尔曲线
import { BezierEdge, BezierEdgeModel } from "@logicflow/core";
```

## 基于继承的自定义边

和节点一样，LogicFlow的边也支持基于继承的自定义机制。同样也只需同时继承`view`和`model`。
但是和节点不一样的是，由于边的编辑复杂度问题，绝大多数情况下，自定义边时不推荐自定义`view`。
只需要在自定义[edgeModel](/api/edgeModelApi.html)中样式类即可。

```js
import { PolylineEdgeModel } from "@logicflow/core";

class SequenceModel extends PolylineEdgeModel {
  setAttributes() {
    this.offset = 20;
  }
  getEdgeStyle() {
    const style = super.getEdgeStyle();
    const { properties } = this;
    if (properties.isActived) {
      style.strokeDasharray = "4 4";
    }
    style.stroke = "orange";
    return style;
  }
  getTextStyle() {
    const style = super.getTextStyle();
    style.color = "#3451F1";
    style.fontSize = 30;
    style.background.fill = "#F2F131";
    return style;
  }
  getOutlineStyle() {
    const style = super.getOutlineStyle();
    style.stroke = "red";
    style.hover.stroke = "red";
    return style;
  }
}

export default {
  type: "sequence",
  view: PolylineEdge,
  model: SequenceModel
};
```

[去codesandbox中编辑](https://codesandbox.io/s/logicflow-step5-i4xes?file=/step5/sequence.js)

## 保存锚点信息

默认情况下，LogicFlow只记录节点与节点的信息。但是在一些业务场景下，需要关注到锚点，比如在UML类图中的关联关系；或者锚点表示节点的入口和出口之类。这个时候需要重写连线的保存方法，将锚点信息也一起保存。

```js
class CustomEdgeModel2 extends LineEdgeModel {
  /**
   * 重写此方法，使保存数据是能带上锚点数据。
   */
  getData() {
    const data = super.getData();
    data.sourceAnchorId = this.sourceAnchorId;
    data.targetAnchorId = this.targetAnchorId;
    return data;
  }
}
```


<iframe src="https://codesandbox.io/embed/logicflow-base17-h5pis?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="logicflow-base17"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>


