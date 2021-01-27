# 自定义节点

> Logic Flow 的元素是基于 SVG 实现的，如果你对 SVG 的相关知识还不太熟悉，那么推荐你先了解一下 [SVG](https://developer.mozilla.org/zh-CN/docs/Web/SVG) 的基础内容。

## 原理

### 基于继承的自定义节点

Logic Flow 对外暴露了基础节点`BaseNode`和5个代表简单类型的节点`RectNode`、`CircleNode`、`PolygonNode`、`EllipseNode`、`DiamondNode`。

![节点继承原理](../../assets/images/custom-node.png)

由上图可以看到，Logic Flow 提供的`RectNode`、`CircleNode`、`PolygonNode`都是继承自内部的`BaseNode`。因此，用户的`CustomNode`可以通过继承简单类型节点来实现，也可以直接继承`BaseNode`。

### MVVM

Logic Flow 内部是基于`MVVM`模式进行开发的，分别使用`preact`和`mobx`来处理 view 和 model，所以当我们自定义节点的时候，需要为这个节点定义`view`和`model`。

## 注册自定义节点

我们可以在创建`LogicFlow`实例之后，`render`之前，使用[`register`方法](/api/logicFlowApi.md#register)来注册自定义节点。

`register`的第一个参数告诉 Logic Flow 自定义节点的类型，第二个参数可以为自定义节点定义`view`和`model`。`register`的第二个参数是一个回调函数，它的参数包含了 Logic Flow 内部所有节点的`view`和`model`，因此，我们可以通过**继承**这些内部的`view`和`model`来实现自定义节点的`view`和`model`，下文详细介绍了注册自定义节点的细节。

## 自定义节点的类型

如果我们要注册一个`type`为`startEvent`的自定义节点，这个节点形状是一个圆形，那么可以通过继承内置的`Circle`节点（实际是继承`Circle`的`view`和`model`）来快速实现，例如：

```ts
// 注册自定义节点
lf.register('startEvent', (RegisterParam) => {
  const { CircleNode, CircleNodeModel } = RegisterParam;
  // 自定义节点的 view，CircleNode 是 Circle 的 view
  class StartEventView extends CircleNode {}
  // 自定义节点的 model，CircleNodeModel 是 Circle 的 model
  class StartEventModel extends CircleNodeModel {}
  return {
    view: StartEventView,
    model: StartEventModel,
  }
});

// 使用自定义节点
lf.render({
  nodes: [
    {
      id: 10,
      type: 'startEvent',
      x: 300,
      y: 200,
      text: '开始'
    },
  ]
});
```

访问 [API](/api/logicFlowApi.md#register) 来查看`register`提供的`view`和`model`全集。

## 自定义节点的 View

节点在`view`中维护了自身的`VNode`，Logic Flow 渲染节点时会实例化`view`，并主动调用`view`中的以下两个方法来确定`VNode`该如何渲染，通过**复写**这两个方法就可以实现自定义节点的`view`.

- [getShape](/guide/advance/customNode.html#getshape)
- [getAttributes](/guide/advance/customNode.html#getattributes)

### getShape

`getShape`方法可以返回任意 SVG 能识别的标签，这个返回的元素就是自定义节点的`VNode`，目前需要使用 Logic Flow 提供的 `h` 方法来创建 SVG 元素。

以自定义一个正方形（square）节点为例，我们直接通过继承`RectNode`来实现，只需要在继承`view`时复写`getShape`方法。

```js
lf.register('square', (RegisterParam) => {
  // h 方法由 Logic Flow 提供
  const { RectNode, RectNodeModel, h } = RegisterParam;
  class SquareView extends RectNode {
    // getShape 的返回值是一个通过 h 方法创建的 svg 元素
    getShape() {
      // 使用 h 方法创建一个矩形
      return h("rect", {
        x: 100,
        y: 100,
        width: 80,
        height: 80
      });
    }
  }
  return {
    view: SquareView,
    model: RectNodeModel,
  }
});
```

在上面的代码中，`getShape`方法返回了一个中心坐标为(100, 100)，宽度为80的正方形，Logic Flow 拿到这个返回值后会直接在`graph`中进行渲染。

> 图标这里有个小技巧，如果使用的是一个 svg 图标，那么可以直接用 IDE 打开，将里面的 path 和 viewBox 替换到上面就好了。

### getAttributes

目前`getShape`方法只能返回静态的`VNode`，在开发好自定义节点后，我们希望它的使用体验与内置节点一致，即通过`render`或`addNode`等 API 就可以直接使用，因此，Logic Flow 提供了`getAttributes`方法作为`VNode`和配置数据之间的桥梁。

`getAttributes`方法的返回值是一个对象，它包含了**所继承节点**的[数据属性](/api/nodeApi.md#通用属性)和[样式属性](/api/nodeApi.html#样式属性)，复写时，需要基于父类的`getAttributes`方法进行变动。

```ts
// 为自定义节点复写 getAttributes
getAttributes() {
  const attributes = super.getAttributes();
  return Object.assign(attributes, {});
}
```

仍然以正方形为例，现在我们直接使用配置数据来确定如何渲染。

```ts
lf.register('square', (RegisterParam) => {
  const { RectNode, RectNodeModel, h } = RegisterParam;
  class SquareView extends RectNode {
    getAttributes() {
      const attributes = super.getAttributes();
      // 覆盖 rect 节点的 width 和 height
      return Object.assign(attributes, { width: 80, height: 80 });
    }
    getShape() {
      const { x, y, width, height } = this.getAttributes();
      return h("rect", { x, y, width, height });
    }
  }
  return {
    view: SquareView,
    model: RectNodeModel,
  }
});

lf.render({
  nodes: [
    {
      id: 10,
      type: 'square',
      x: 300,
      y: 200,
      text: '正方形'
    },
  ]
});
```

在业务中，自定义节点常常会有许多附加的特性，例如根据不同的业务属性展现出不同的样式，对于这种需求，我们可以在配置节点的[数据属性](/api/nodeApi.md#通用属性)时通过`properties`进行设置。

```ts
lf.register('square', (RegisterParam) => {
  const { RectNode, RectNodeModel, h } = RegisterParam;
  class SquareView extends RectNode {
    getAttributes() {
      const attributes = super.getAttributes();
      // 读取 properties 中的附加属性
      const { properties } = attributes;
      const { width, height } = properties;
      return Object.assign(attributes, { width, height });
    }
    getShape() {
      const { x, y, width, height } = this.getAttributes();
      return h("rect", { x, y, width, height });
    }
  }
  return {
    view: SquareView,
    model: RectNodeModel,
  }
});

// 配置节点时，在 properties 中设置需要的附加属性
lf.render({
  nodes: [
    {
      id: 10,
      type: 'square',
      x: 300,
      y: 200,
      text: '正方形',
      properties: {
        width: 100,
        height: 100
      }
    },
  ]
});
```

`properties`可以放任何值，Logic Flow 内部不会使用它，当接入方需要存放一些和节点相绑定的数据时，可以将其加入到`properties`中。

> Logic Flow 自定义节点的灵活性就在于`getAttributes`方法和`properties`属性的使用，这两者的结合可以实现大部分业务对于节点的需求。

## 自定义节点的 Model

节点在`model`中维护了以下内容：

- 节点的**数据属性**和**样式属性**
- 多边形节点的**顶点坐标**
- 在连线时，节点作为`source`或`target`的**连线规则**

### 数据属性和样式属性

在前文中我们已经知道，为自定义节点的`view`定义`VNode`时，可以通过`getAttributes`方法来获取节点渲染时所需要的数据，实际上，这些数据全部源自于节点的`model`，因此在`model`中可以直接通过`this`进行访问。

### 顶点坐标

多边形节点（PolygonNode）在`model`中，额外维护了一个`points`属性，这个属性是一个数组，它包含了节点所有的顶点坐标，当继承多边形节点的`model`来实现自定义节点时，可以通过设置`points`来快速实现**任何形状的多边形**。

例如我们需要实现一个三角形的节点。

```ts
lf.register('triangle', (RegisterParam) => {
  const { PolygonNode, PolygonNodeModel } = RegisterParam;
  class TriangleModel extends PolygonNodeModel {
    // 覆盖 PolygonNodeModel 的 points 属性
    points = [
      [50, 0],
      [100, 80],
      [0, 80],
    ];
  }
  return {
    view: PolygonNode,
    model: TriangleModel,
  };
});
```

<example href="/examples/#/advance/custom-node/triangle" :height="200" ></example>

> 默认情况下，Logic Flow 会在每个顶点上生成一个可以连接的锚点。

### 连线规则

在某些时候，我们可能需要控制连线的连接方式，比如开始节点不能被其它节点连接、结束节点不能连接其他节点、用户节点后面必须是判断节点等。Logic Flow 在`model`中提供了以下两个方法来实现节点的连线规则。

- [getConnectedSourceRules](/guide/advance/customNode.md#getconnectedsourcerules)
- [getConnectedTargetRules](/guide/advance/customNode.md#getconnectedtargetrules)

#### getConnectedSourceRules

通过该方法能够获取当前节点作为连线开始点（source）的校验规则。它的的返回值是一个包含了多项校验规则的数组，每项规则都是一个对象，我们需要为其设置`messgage`和`validate`属性。

```ts
getConnectedSourceRules() {
  // 在所继承节点的连线规则的基础上添加新的规则
  const rules = super.getConnectedSourceRules();
  const rule = {
    message: '不满足连线的校验规则',
    validate: (source, target) => {
      // 校验规则
      return false;
    }
  }
  rules.push(rule);
  return rules;
}
```

在上面的代码中，`getConnectedSourceRules`方法在所继承节点的校验规则的基础上新增了一项 rule，rule 的`message`属性是当不满足校验规则时所抛出的错误信息，`validate`则是传入规则检验的回调函数。

`validate`方法有两个参数，分别为包含了自身数据属性的连线起始节点（source）和连线目标节点（target）。我们可以根据节点的情况，来返回`true or false`. `true`表示通过校验。

例如我们想实现一个用户节点（UserTask），在连线时它的下一节点只能是网关节点，那么我们应该给`UserTask`添加作为`source`节点的校验规则。

```ts
lf.register('userTask', (RegisterParam) => {
  const { RectNode, RectNodeModel } = RegisterParam;
  class UserTaskView extends RectNode {
    // 自定义形状
  }
  class UserTaskModel extends RectNodeModel {
    // 设置校验规则
    getConnectedSourceRules() {
      const rules = super.getConnectedSourceRules();
      const gateWayOnlyAsTarget = {
        message: '流程节点下一个节点只能是网关节点',
        validate: (source, target) => {
          let isValid = true;
          if (target.type !== 'gateway') isValid = false;
          return isValid;
        },
      };
      rules.push(gateWayOnlyAsTarget);
      return rules;
    }
  }
  return {
    view: UserTaskView,
    model: UserTaskModel,
  };
});
```

<example href="/examples/#/advance/custom-node/rule" :height="400" ></example>

当在面板上进行连线操作的时候，Logic Flow 会判断所有的规则是否通过，只有**全部**通过才能连接。

访问 [API](/api/modelApi.md#getconnectedsourcerules) 以查看`getConnectedSourceRules`方法的详细信息。

#### getConnectedTargetRules

同样，我们可以通过重写`getConnectedTargetRules`方法，来实现当节点作为目标节点（target）时的校验规则。访问 [API](/api/modelApi.md#getconnectedtargetrules) 以查看`getConnectedTargetRules`方法的详细信息。

#### 接收错误消息

在连线时，当鼠标松开后如果没有通过自定义规则（`validate`方法返回值为`false`），Logic Flow 会对外抛出事件`connection:not-allowed`。

```js
lf.on('connection:not-allowed', (msg) => {
  console.log(msg)
});
```
