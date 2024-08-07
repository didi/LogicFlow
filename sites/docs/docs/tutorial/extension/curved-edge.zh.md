---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 圆角折线 (CurvedEdge)
order: 12
toc: content
---

LogicFlow core 包中内置了 直线(line)、直角折线(polyline)、贝塞尔曲线(bezier)三种基础连线。由于 svg 的 polyline 是不带圆角的，所以我们在 extension 包中提供了圆角弧线 CurvedEdge。

圆角折线的使用方式和 LogicFlow 的自定义连线一样，开发者可以通过继承 CurvedEdgeModel 和 CurvedEdge

```tsx | pure
import { CurvedEdge, CurvedEdgeModel } from '@logicflow/extension'

class myCurvedEdge extends CurvedEdge {
}

class myCurvedEdgeModel extends CurvedEdgeModel {
  initEdgeData(data) {
    super.initEdgeData(data)
    this.radius = 5
  }

  getEdgeStyle() {
    const style = super.getEdgeStyle()
    style.strokeWidth = 3
    style.stroke = 'rgb(130, 179, 102)'
    return style
  }

  setAttributes() {
    this.isAnimation = true
  }

  getEdgeAnimationStyle() {
    const style = super.getEdgeAnimationStyle()
    style.strokeDasharray = '15 5'
    style.animationDuration = '10s'
    style.stroke = 'rgb(130, 179, 102)'
    return style
  }
}
```
