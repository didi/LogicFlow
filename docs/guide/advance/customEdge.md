# 自定义连线

同自定义节点一样，在具体业务中我们也可能需要对连线进行一定的自定义，比如流程中高亮表示这个流程的执行路径。

## 自定义连线的 View

自定义连线也在`view`中维护了自身的`VNode`，通过**复写**以下三个方法可以实现自定义连线的`view`。

- [getShape](/guide/advance/customEdge.html#getshape)
- [getAttributes](/guide/advance/customEdge.md#getattributes)
- [getArrowStyle](/guide/advance/customEdge.md#getarrowstyle)

### getShape

我们可以通过`getShape`方法返回 SVG 元素来实现连线的形状，但是内置的直线、折线和曲线已经能满足绝大部分需求，且连线的开发成本较高，这里不详细说明如何自定义连线的形状，如果有需要，建议直接阅读内部连线的[源码实现](https://github.com/didi/LogicFlow/blob/cdc19ddfb6774005b3f57cb4e27d54e8e25572b4/packages/core/src/view/edge/LineEdge.tsx)。也欢迎将你实现的自定义连线通过`extension`的方式提交 PR 给我们。

### getAttributes

例如我们想要实现一条进度连线，若当前进度连线已执行，则显示为绿色。

```js
lf.register('process', (RegisterParam) => {
  const { LineEdge, LineEdgeModel } = RegisterParam;
  class ProcessView extends PolylineEdge {
    getAttributes() {
      const attr = super.getAttributes();
      if (attr.properties.isExecuted) {
        attr.stroke = 'green';
      }
      return attr;
    }
  }
  return {
    view: ProcessView,
    model: LineEdgeModel,
  }
});
```

<example href="/examples/#/advance/custom-edge/process" :height="250" ></example>

连线的`getAttributes`方法返回值所包含的属性与节点的不同，访问 [API](/api/customEdgeApi.md#getattributes) 以查看更多细节。

### getArrowStyle

我们除了可以通过重写`getAttributes`来实现修改连线的样式，也可以通过重写`getArrowStyle`来实现对箭头样式的细粒度控制。

```js
lf.register('process', (RegisterParam) => {
  const { LineEdge, LineEdgeModel } = RegisterParam;
  class ProcessView extends PolylineEdge {
    getAttributes() {
      const attr = super.getAttributes();
      if (attr.properties.isExecuted) {
        attr.stroke = 'green';
      }
      return attr;
    }
    // 更改箭头样式
    getArrowStyle() {
      const style = super.getArrowStyle();
      style.fill = "transparent";
      return style;
    }
  }
  return {
    view: ProcessView,
    model: LineEdgeModel,
  }
});
```

<example href="/examples/#/advance/custom-edge/arrow" :height="250" ></example>

访问 [API](/api/customEdgeApi.md#getarrowstyle) 以查看`getArrowStyle`的更多细节。

## 自定义连线的 Model

连线的`model`中维护了以下内容。

- 连线的[通用属性](/api/edgeApi.html#通用属性)
- 连线的[边属性](/api/edgeApi.html#边属性)

为了保证连线的每一类属性都可以被正常设置，LF 在`model`的构造函数中按下图顺序对属性进行初始化。

<img src="../../assets/images/custom-edge-model.png" alt="连线属性初始化顺序" style="display: block; margin: 0 auto; zoom: 50%;"  />

与节点一致，当我们需要为连线的自定义各类属性时，也应通过`setAttributes`方法来进行设置，其使用方式参考自定义节点`model`的[章节](/guide/advance/customNode.html#自定义节点的-model)

## extendKey

当我们注册的自定义连线希望可以被其他自定义连线继承时，就需要为`view`和`model`都设置一个静态属性`extendKey`，以便在`lf.register`的第二个回调函数的参数中被访问到。

```ts
lf.register('CustomEdge', ({ BaseEdge, BaseEdgeModel }) => {
  class View extends BaseEdge {
    static extendKey = 'CustomEdgeView';
  }
  class Model extends BaseEdgeModel {
    static extendKey = 'CustomEdgeModel';
  }
  return {
    view: View,
    model: Model,
  }
});
```
