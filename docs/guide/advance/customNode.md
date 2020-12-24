# 自定义节点

> 在实际使用中，我们往往需要基于各自的业务自定义节点。比如需要实现一个满足bpmn规范的流程图，我们则需要一个圆形表示`startEvent`，一个矩形表示`userTask`，一个圆柱体表示`dataStoreReference`。这个时候我们就可以使用自定义的方式来实现。

## 原理

**基于继承的自定义节点**

Logic Flow 对外暴露了基础节点`BaseNode`和3个代表简单类型的节点`RectNode`、`CircleNode`、`PolygonNode`。

![节点继承原理](../../assets/images/custom-node.png)

由上图可以看到，Logic Flow 内置了基础的`BaseNode`, `RectNode`、`CircleNode`、`PolygonNode`都是继承了`BaseNode`。然后是`CustomNode`, 他们可以继承`RectNode`、`CircleNode`、`PolygonNode`,也可以直接继承`BaseNode`。

**MVVM**

Logic Flow 内部是基于`MVVM`模式进行开发的，使用了`preact`来处理 view 的渲染和`mobx`来管理model。所以当我们需要高度自定义节点的时候，需要同时定义这个节点的`view`和`model`。当然，大多数情况下，我们只需要自定义`view`即可。

## 注册自定义节点

在创建了`LogicFlow`实例后，render 之前，我们可以使用`register`方法来注册自定义节点。

**自定义节点名称**

例如我们注册一个开始节点，这个节点长得和内置的`circle`节点一样，只是最后生成的 type 变成了`startEvent`, 那么我们可以如下实现：
```ts
const lf = new LogicFlow({
  container: document.querySelector('#container'),
});

lf.register('startEvent', ({ CircleNode, CircleNodeModel }) => {
  return {
    view: CircleNode,
    model: CircleNodeModel,
  }
})
lf.render({
  nodes: [
    {
      type: 'startEvent',
      x: 300,
      y: 200,
      text: '开始'
    },
  ]
})
```

**给节点内部增加其它元素**

我们可以通过在节点内部任意位置增加文本和图片，例如`userTask`节点需要在左上角增加一个图标。我们则可以通过重写`view`中的`getShape`方法来实现。

```js
class UserTaskNode extends RectNode {
  getLabelShape() {
    const attributes = this.getAttributes();
    const {
      x,
      y,
      width,
      height,
      stroke,
    } = attributes;
    return h(
      'svg',
      {
        x: x - width / 2 + 5,
        y: y - height / 2 + 5,
        width: 25,
        height: 25,
        viewBox: '0 0 1274 1024',
      },
      h(
        'path',
        {
          fill: stroke,
          d: 'M655.807326 287.35973m-223.989415 0a218.879 218.879 0 1 0 447.978829 0 218.879 218.879 0 1 0-447.978829 0ZM1039.955839 895.482975c-0.490184-212.177424-172.287821-384.030443-384.148513-384.030443-211.862739 0-383.660376 171.85302-384.15056 384.030443L1039.955839 895.482975z',
        },
      ),
    );
  }
  getShape() {
    const attributes = this.getAttributes();
    const {
      x,
      y,
      width,
      height,
      fill,
      stroke,
      strokeWidth,
      radius,
    } = attributes;

    return h(
      'g',
      {
      },
      [
        h(
          'rect',
          {
            x: x - width / 2,
            y: y - height / 2,
            rx: radius,
            ry: radius,
            fill,
            stroke,
            strokeWidth,
            width,
            height,
          },
        ),
        this.getLabelShape(),
      ],
    );
  }
}
```

<example href="/examples/#/advance/custom-node/content" :height="200" ></example>

从上面的代码中，`getShape`方法会返回表示节点形状的`VNode`。这个`VNode`可以是任意 svg 能识别的标签。这里我们返回的就是一个矩形和一个图标。这个图标的位置可以通过直接调用`this.getAttributes()`拿到，除了位置，还有很多这个节点相关的属性都能拿到。

> 图标这里有个小技巧，如果使用的是一个 svg 图标，那么可以直接用 IDE 打开，将里面的 path 和 viewBox 替换到上面就好了。

**自定义形状**

Logic Flow 内置了`RectNode`、`CircleNode`、`PolygonNode`分别对应着矩形、圆形和多边形三种基础形状，我们可以里面上面说的重写机制，修改这些节点的大小，颜色等。当我们需要其他形状的时候，可以直接通过继承`BaseNode`来实现更多的形状。例如我们需要实现一个三角形的节点。

```ts
this.lf.register('triangle', ({ PolygonNode, PolygonNodeModel }) => {
  class TriangleNode extends PolygonNode {
  }
  class TriangleModel extends PolygonNodeModel {
    constructor(data, graphModel) {
      super(data, graphModel);
      this.points = [
        [50, 0],
        [100, 80],
        [0, 80],
      ];
    }
  }
  return {
    view: TriangleNode,
    model: TriangleModel,
  };
});
```

<example href="/examples/#/advance/custom-node/shape" :height="200" ></example>

从上面代码可以看到，自定义多边形，需要重新自定义 model 中的 points, 这个 points 表示着多边形中这个形状对应的点。默认情况下，我们会在每个点上生成一个可以连接的锚点。


## 自定义属性

通过`graph`渲染节点的时候，我们需要传入表示节点的数据。其格式如下:

```ts
type NodeConfig = {
  id?: string;
  type?: string;
  x: number;
  y: number;
  text?: {
    x: number;
    y: number;
    value: number;
  }
  properties?: Record<string, any>;
}
```

一般来说，对于一个节点，我们只需要`type`、`x`、`y`、`text`就可以完整的图中的一个节点的所有可见信息了。`type`控制这个节点的类型，`x`、`y`控制着节点所处的位置，`text`控制着节点上的文本。

虽然每种类型的节点在画布上，都对应着渲染其自己的形状。 但是在实际业务中，可能存在虽然节点的类型是相同的，但是因为不同的业务属性，可能会表现为不同的颜色、大小之类的。这种业务属性，我们可以通过 properties 传递到节点中。然后我们在创建节点的时候，依据不同业务属性，创建 UI 不同的节点。

例如我们通过 properties 传入一个表示大小的属性，然后在创建的时候，依据这个大小的属性来控制节点显示为不同大小的节点。

```ts
class BeginNode extends RectNode {
  getAttributes() {
    const attributes = super.getAttributes();
    const { properties } = attributes;
    if (properties.size === 'big') {
        attributes.width = attributes.width * 1.3;
        attributes.height = attributes.height * 1.3;
    }
    return attributes;
  }
}
```

<example href="/examples/#/advance/custom-node/properties" :height="200" ></example>

`properties`可以放任何值，Logic Flow内部不会使用它。当接入方需要存放一些和节点相绑定的数据时，可以将其加入到`properties`中。

## 自定义连线规则

在某些时候，我们可能需要控制连线的连接方式，比如开始节点不能被其它节点连接、结束节点不能连接其他节点、用户节点后面必须是判断节点等等。Logic Flow提供了自定义节点规则功能来实现这个需求。

同上面的自定义外观，Logic Flow内部有`getConnectedSourceRules`和`getConnectedTargetRules`两个公共方法，分别返回当前节点作为连线开始点和作为连接目标点时的校验规则。当在面板上进行连线操作的时候，会判断所有的规则是否通过，只有通过了才能连接。

这里我们先看看示例，比如我们想实现用户节点的下一个节点只能是网关节点。那么我们这个应该给用户节点配置作为连线`source`的规则。

```ts
class UserTaskNode extends RectNode {
  /* ignore other code*/

  getConnectedSourceRules(): ConnectRule[] {
    const rules = super.getConnectedSourceRules();
    const gateWayOnlyAsTarget = {
      message: '流程节点下一个节点只能是网关节点',
      validate: (source: BaseNode, target: BaseNode) => {
        let isValid = true;
        if (target.type !== EXCLUSIVE_GATEWAY_NAME) {
          isValid = false;
        }
        return isValid;
      },
    };
    rules.push(gateWayOnlyAsTarget);
    return rules;
  }
}
```

<example href="/examples/#/advance/custom-node/edge" :height="400" ></example>

从上面的代码可以看到，我们在原有的校验规则基础上，给新增了一个`gateWayOnlyAsTarget`规则，这个规则传入的是一个对象，对象拥有 message 和 validate 两个属性。message 是当规则不满足的时候，会抛出错误提示。`validate`则是传入规则检验的回调函数。

`validate`传入的参数有两个，分别为连线的起始节点和连线的目标节点。你则可以自己根据节点的情况，来返回`true or false`. `true`表示通过校验。

同样，我们也可以通过重写`getConnectedTargetRules`方法，来实现当节点作为目标节点的统一判断。比如开始节点不能作为任何节点的目标节点。虽然我们也可以通过重写每个节点的`getConnectedSourceRules`来使其不能连接开始节点，但是这样太过于麻烦。

**接收错误消息**

当连线的时候，在鼠标松开的时候如果没有通过自定义规则，会对外抛出事件`connection:not-allowed`。

```js
lf.on('connection:not-allowed', (msg) => {
  console.log(msg)
});
```
