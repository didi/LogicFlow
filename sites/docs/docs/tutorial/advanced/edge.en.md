---
nav: Guide
group:
  title: Intermediate
  order: 2
title: Edge
order: 1
toc: content
---

## React edge

You can customize the edges based on React components using the following method, you can add any
React component you want to the edges, or even hide the original edges by styling them and redrawing
them using React

<code id="edge-react" src="../../../src/tutorial/advanced/edge/reactEdge"></code>

## Anchor Points

By default, LogicFlow only records node to node information. However, in some business scenarios, it
is necessary to pay attention to the anchor points, such as the correlation relationship in the UML
class diagram; or the anchor points indicate the entrance and exit of the nodes and so on. At this
time, you need to rewrite the save method of connectivity to save the anchor point information
together.

```tsx | pure
class CustomEdgeModel2 extends LineEdgeModel {
  // Rewrite this method to save the data with the anchors.
  getData() {
    const data = super.getData()
    data.sourceAnchorId = this.sourceAnchorId
    data.targetAnchorId = this.targetAnchorId
    return data
  }
}
```

<a href="https://codesandbox.io/embed/logicflow-base17-h5pis?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank">
Go to CodeSandbox for examples</a>

## Animation

Since LogicFlow is a flowchart editing framework based on svg, we can animate flowcharts the same
way we animate svg. For ease of use, we have built-in basic animation effects as well. When defining
edges, you can set the property `isAnimation` to true to make the edge move, or you can
use `lf.openEdgeAnimation(edgeId)` to turn on the default animation for edges.

```tsx | pure
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

<code id="edge-animation" src="../../../src/tutorial/advanced/edge/animation"></code>
