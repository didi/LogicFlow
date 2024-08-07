# 圆角折线 CurvedEdge

LogicFlow core包中内置了 直线(line)、直角折线(polyline)、贝塞尔曲线(bezier)三种基础连线。由于svg的polyline是不带圆角的，所以我们在extension包中提供了圆角弧线 CurvedEdge。

圆角折线的使用方式和LogicFlow的自定义连线一样，开发者可以通过继承CurvedEdgeModel和CurvedEdge

```js
import { CurvedEdge, CurvedEdgeModel } from '@logicflow/extension'

class myCurvedEdge extends CurvedEdge {}
class myCurvedEdgeModel extends CurvedEdgeModel {
  initEdgeData(data) {
    super.initEdgeData(data);
    this.radius = 5;
  }
  getEdgeStyle() {
    const style = super.getEdgeStyle();
    style.strokeWidth = 3;
    style.stroke = 'rgb(130, 179, 102)'
    return style;
  }
  setAttributes() {
    this.isAnimation = true;
  }
  getEdgeAnimationStyle() {
    const style = super.getEdgeAnimationStyle();
    style.strokeDasharray = "15 5";
    style.animationDuration = "10s";
    style.stroke = 'rgb(130, 179, 102)'
    return style;
  }
}
```
