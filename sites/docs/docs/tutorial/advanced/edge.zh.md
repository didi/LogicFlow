---
nav: 指南
group:
  title: 进阶
  order: 2
title: 边
order: 1
toc: content
---

## React 边

使用以下方法可以基于 React 组件自定义边，你可以在边上添加任何你想要的 React 组件，甚至将原有的边通过样式隐藏，使用
React 重新绘制

<code id="edge-react" src="../../../src/tutorial/advanced/edge/reactEdge"></code>

## 锚点

默认情况下，LogicFlow 只记录节点与节点的信息。但是在一些业务场景下，需要关注到锚点，比如在 UML
类图中的关联关系；或者锚点表示节点的入口和出口之类。这个时候需要重写连线的保存方法，将锚点信息也一起保存。

```tsx | pure
class CustomEdgeModel2 extends LineEdgeModel {
  // 重写此方法，使保存数据是能带上锚点数据。
  getData() {
    const data = super.getData()
    data.sourceAnchorId = this.sourceAnchorId
    data.targetAnchorId = this.targetAnchorId
    return data
  }
}
```

<a href="https://codesandbox.io/embed/logicflow-base17-h5pis?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> 去 CodeSandbox 查看示例</a>

## 动画

由于 LogicFlow 是基于 svg 的流程图编辑框架，所以我们可以给 svg
添加动画的方式来给流程图添加动画效果。为了方便使用，我们也内置了基础的动画效果。在定义边的时候，可以将属性`isAnimation`
设置为 true 就可以让边动起来，也可以使用`lf.openEdgeAnimation(edgeId)`来开启边的默认动画。

```tsx | pure
class CustomEdgeModel extends PolylineEdgeModel {
  setAttributes() {
    this.isAnimation = true
  }

  getEdgeAnimationStyle() {
    const style = super.getEdgeAnimationStyle()
    style.strokeDasharray = '5 5'
    style.animationDuration = '10s'
    return style
  }
}
```

<code id="edge-animation" src="../../../src/tutorial/advanced/edge/animation"></code>
