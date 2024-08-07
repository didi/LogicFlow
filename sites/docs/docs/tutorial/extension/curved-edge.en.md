---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: CurvedEdge
order: 12
toc: content
---

The LogicFlow core package has three built-in baselines: line, polyline, and bezier. Since SVG polyline does not have rounded corners, we provide CurvedEdge in the extension package.

Rounded edges are used in the same way as LogicFlow's custom edges, by inheriting CurvedEdgeModel and CurvedEdge.

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
