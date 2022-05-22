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

##基于React组件自定义边

使用以下方法可以基于React组件自定义边，你可以在边上添加任何你想要的React组件，甚至将原有的边通过样式隐藏，使用React重新绘制

```js
import React from "react";
import ReactDOM from "react-dom";
import { BaseEdgeModel, LineEdge, h } from "@logicflow/core";

const DEFAULT_WIDTH = 48;
const DEFAULT_HEIGHT = 32;

class CustomEdgeModel extends BaseEdgeModel {
  getEdgeStyle() {
    const edgeStyle = super.getEdgeStyle();
    //可以自己设置线的显示样式，甚至隐藏掉原本的线，自己用react绘制
    edgeStyle.strokeDasharray = "4 4";
    edgeStyle.stroke = "#DDDFE3";
    return edgeStyle;
  }
}

const CustomLine: React.FC = () => {
  return <div className="custom-edge">aaa</div>;
};

class CustomEdgeView extends LineEdge {
  getEdge() {
    const { model } = this.props;
    const {
      customWidth = DEFAULT_WIDTH,
      customHeight = DEFAULT_HEIGHT
    } = model.getProperties();
    const id = model.id;
    const edgeStyle = model.getEdgeStyle();
    const { startPoint, endPoint } = model;
    const lineData = {
      x1: startPoint.x,
      y1: startPoint.y,
      x2: endPoint.x,
      y2: endPoint.y
    };
    const positionData = {
      x: (startPoint.x + endPoint.x - customWidth) / 2,
      y: (startPoint.y + endPoint.y - customHeight) / 2,
      width: customWidth,
      height: customHeight
    };
    const wrapperStyle = {
      width: customWidth,
      height: customHeight
    };

    setTimeout(() => {
      ReactDOM.render(<CustomLine />, document.querySelector("#" + id));
    }, 0);
    return h("g", {}, [
      h("line", { ...lineData, ...edgeStyle }),
      h("foreignObject", { ...positionData }, [
        h("div", {
          id,
          style: wrapperStyle,
          className: "lf-custom-edge-wrapper"
        })
      ])
    ]);
  }

  getArrow() {
    return h("g", {}, []);
  }

  getAppend() {
    return h("g", {}, []);
  }
}

export default {
  type: "CustomEdge",
  view: CustomEdgeView,
  model: CustomEdgeModel
};

```

### 示例

<iframe src="https://codesandbox.io/embed/zealous-monad-2q21no?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="logicflow-base25"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

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

## 自定义边文本位置

默认情况下，边上文本的位置是用户双击点击边时的位置。如果是通过API的方式给边添加的文本，文本位置按照如下规则。

- line: 起点和终点中间
- polyline: 最长线段中间
- bezier: 起点、终点、调整点中间

LogicFlow支持开发者自定义文本位置，例如文本位置永远在边起点旁边。定义方式为将属性`customTextPosition`设置为true, 然后重写`getTextPosition`方法, 此方法发回的坐标就是文本的坐标。

```js
class CustomEdgeModel extends PolylineEdgeModel {
  customTextPosition = true;
  getTextPosition() {
    const position = super.getTextPosition();
    const currentPositionList = this.points.split(" ");
    const pointsList = [];
    currentPositionList &&
      currentPositionList.forEach((item) => {
        const [x, y] = item.split(",");
        pointsList.push({ x: Number(x), y: Number(y) });
      });
    if (currentPositionList.length > 1) {
      let [x1, y1] = currentPositionList[0].split(",");
      let [x2, y2] = currentPositionList[1].split(",");
      let distance = 50;
      x1 = Number(x1);
      y1 = Number(y1);
      x2 = Number(x2);
      y2 = Number(y2);
      if (x1 === x2) {
        // 垂直
        if (y2 < y1) {
          distance = -50;
        }
        position.y = y1 + distance;
        position.x = x1;
      } else {
        if (x2 < x1) {
          distance = -50;
        }
        position.x = x1 + distance;
        position.y = y1 - 10;
      }
    }
    return position;
  }
}
```

### 示例

<iframe src="https://codesandbox.io/embed/laughing-dream-x3v87?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="logicflow-base25"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

## 给边开启动画

由于LogicFlow是基于svg的流程图编辑框架，所以我们可以给svg添加动画的方式来给流程图添加动画效果。为了方便使用，我们也内置了基础的动画效果。在定义边的时候，可以将属性`isAnimation`设置为true就可以让边动起来，也可以使用`lf.openEdgeAnimation(edgeId)`来开启边的默认动画。

```js
class CustomEdgeModel extends PolylineEdgeModel {
  setAttributes() {
    this.isAnimation = true;
  }
  getEdgeAnimationStyle() {
    const style = super.getEdgeAnimationStyle();
    style.strokeDasharray = "5 5";
    style.animationDuration = "10s";
    return style;
  }
}
``` 

### 示例

<iframe src="https://codesandbox.io/embed/suspicious-tree-hw82v8?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="logicflow026-edgeAnimation"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>
