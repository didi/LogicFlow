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

节点在`view`中维护了自身的`VNode`，Logic Flow 渲染节点时会实例化`view`，并主动调用`view`中的`getShape`方法来确定`VNode`该如何渲染，通过**复写**该方法就可以实现自定义节点的`view`。

### getShape

`getShape`方法可以返回任意 SVG 能识别的标签，这个返回的元素就是自定义节点的`VNode`，目前需要使用 Logic Flow 提供的 `h` 方法来创建 SVG 元素。

以自定义一个正方形（square）节点为例，直接通过继承`RectNode`来实现，我需要在`getShape`方法中返回一个 SVG 元素。

```js
lf.register('square', (RegisterParam) => {
  // h 方法由 Logic Flow 提供
  const { RectNode, RectNodeModel, h } = RegisterParam;
  class SquareView extends RectNode {
    // getShape 的返回值是一个通过 h 方法创建的 svg 元素
    getShape() {
      // 使用 h 方法创建一个矩形
      return h("rect", {
        // some attributies
      });
    }
  }
  return {
    view: SquareView,
    model: RectNodeModel,
  }
});

// 配置节点
lf.render({
  nodes: [
    {
      id: 10,
      type: 'square',
      x: 300,
      y: 200,
      text: '正方形',
      properties: {}
    },
  ]
});
```

在上面的代码中，`getShape`方法返回了一个没有任何属性的 rect 标签，Logic Flow 拿到这个返回值后会直接在`graph`中进行渲染。（此时节点还不能正常显示，`view`仍然缺少了`model`所提供的数据）

可以看出，`view`只专注于节点应该如何渲染，而渲染时所需要的据全部源自于`model`，Logic Flow 在`view`中提供了两个方法可以获取这些数据。

- [getShapeStyle](/guide/advance/customNode.html#getshapestyle)
- [getAttributes](/guide/advance/customNode.html#getattributes)

### getShapeStyle

`getShapeStyle`方法返回了节点在渲染时所需要的部分样式属性，这些属性源自节点所对应的`model`。

```ts
// 为自定义节点复写 getShapeStyle
getShapeStyle() {
  const style = super.getShapeStyle();
  return Object.assign(style, {});
}
```

继续看前文中的正方形节点示例，现在我们通过`getShapeStyle`获取到`model`中的[样式属性](/api/nodeApi.html#样式属性)，并将其赋值给 rect 标签上。

```js
lf.register('square', (RegisterParam) => {
  const { RectNode, RectNodeModel, h } = RegisterParam;
  class SquareView extends RectNode {
    // 获取 model 中的样式属性
    getShapeStyle() {
      const style = super.getShapeStyle();
      return Object.assign(style, {});
    }
    getShape() {
      const style = this.getShapeStyle();
      return h("rect", {
        ...style
      });
    }
  }
  return {
    view: SquareView,
    model: RectNodeModel,
  }
});

// 通过 setTheme 将 model 中的 width 和 height 设为 100
lf.setTheme({
  rect: {
    width: 100,
    height: 100
  }
});

lf.render({
  nodes: [
    {
      id: 10,
      type: 'square',
      x: 300,
      y: 200,
      text: '正方形',
      properties: {}
    },
  ]
});
```

在上面的代码中，我们通过`getShapeStyle`方法获取到了`model`所维护的样式属性，并将其传递给 rect 标签。

> 我们不推荐在`view`中直接修改节点的各类属性，因为在 LF 中，锚点和外边框的渲染数据都基于`model`的数据，在`view`中设置的数据并不能影响到锚点和外边框，进而导致渲染出现问题，所以直接在`model`中修改属性是正确的姿势。此外通过`lf.setTheme`方法设置的样式是作用于全局的，对于自定义节点，我们推荐直接修改`model`中的样式属性。在下文，我们会学习如何在[model](/guide/advance/customNode.html#自定义节点的-model)中设置各种属性。

现在节点的基本样式已经可以正常渲染了，但是在 Logic Flow 中，一个节点的基本功能（例：渲染位置）还受其自身的[数据属性](/api/nodeApi.md#通用属性)所影响，所以我们还要根据数据属性为节点标签设置必要的属性。

### getAttributes

除了样式属性以外，Logic Flow 还为我们提供了节点的[数据属性](/api/nodeApi.md#通用属性)，我们可以通过`getAttributes`进行获取。

```ts
// 为自定义节点复写 getAttributes
getAttributes() {
  const attributes = super.getAttributes();
  return Object.assign(attributes, {});
}
```

仍然以自定义的正方形节点为例，现在我们要把 rect 所需要的属性补充完整。

```ts
lf.register('square', (RegisterParam) => {
  const { RectNode, RectNodeModel, h } = RegisterParam;
  class SquareView extends RectNode {
    getShapeStyle() {
      const style = super.getShapeStyle();
      return Object.assign(style, {});
    }
    // 获取 model 中的数据属性
    getAttributes() {
      const attributes = super.getAttributes();
      return Object.assign(attributes, {});
    }
    getShape() {
      const style = this.getShapeStyle();
      const { width, height } = style; 
      const { x, y } = this.getAttributes();
      // rect 标签的 x，y 对应的是图形的左上角
      // 所以我们要将矩形的中心移动到 x，y
      const position = {
        x: x - width / 2,
        y: y - height /2
      }
      return h("rect", {
        ...style,
        ...position
      });
    }
  }
  return {
    view: SquareView,
    model: RectNodeModel,
  }
});

lf.setTheme({
  rect: {
    width: 100,
    height: 100
  }
});

lf.render({
  nodes: [
    {
      id: 10,
      type: 'square',
      x: 300,
      y: 200,
      text: '正方形',
      properties: {}
    },
  ]
});
```

在上面的代码中，我们通过`getAttributes`方法获取到了节点`model`中的数据属性，并将 rect 元素与数据属性中的`(x, y)`对齐，到此为止，一个自定义正方形节点已经可以正常显示并使用了。🎉

### 自定义属性 `properties`

在业务中，自定义节点常常会有许多附加的特性，例如根据不同的业务属性展现出不同的样式，对于这种需求，我们可以在配置节点的[数据属性](/api/nodeApi.md#通用属性)时通过`properties`进行设置。

```ts
lf.register('square', (RegisterParam) => {
  const { RectNode, RectNodeModel, h } = RegisterParam;
  class SquareView extends RectNode {
    getShapeStyle() {
      const style = super.getShapeStyle();
      return Object.assign(style, {});
    }
    getAttributes() {
      const attributes = super.getAttributes();
      return Object.assign(attributes, {});
    }
    getShape() {
      const style = this.getShapeStyle();
      const { width, height } = style; 
      const { x, y, properties } = this.getAttributes();
      const position = {
        x: x - width / 2,
        y: y - height /2
      }
      // 读取 properties 中的附加属性
      const { executed } = properties;
      // 如果节点已经执行，则边框显示为绿色
      if (executed) style.stroke = '#2da54e';
      return h("rect", {
        ...style,
        ...position
      });
    }
  }
  return {
    view: SquareView,
    model: RectNodeModel,
  }
});

lf.setTheme({
  rect: {
    width: 100,
    height: 100
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
        executed: true
      }
    },
  ]
});
```

`properties`可以放任何值，Logic Flow 内部不会使用它，当接入方需要存放一些和节点相绑定的数据时，可以将其加入到`properties`中。

> Logic Flow 自定义节点的灵活性就在于`getAttributes`方法和`properties`属性的使用，这两者的结合可以实现大部分业务对于节点的需求。

## 自定义节点的 Model

节点在`model`中维护了以下内容：

- 节点的[数据属性](/api/nodeApi.md#通用属性)和[样式属性](/api/nodeApi.html#样式属性)
- 在连线时，节点作为`source`或`target`的**连线规则**
- 简单节点的[节点属性](/api/nodeApi.md#节点属性)

### 数据属性和样式属性

在前文中我们已经知道，为自定义节点的`view`定义`VNode`时，可以通过`getShapeStyle`和`getAttributes`方法来获取节点渲染时所需要的数据，这些数据全部源自于节点的`model`，我们可以在`model`中修改这些属性来实现自定义节点的部分效果。

#### 自定义节点的样式属性

以正方形的`width`和`height`为例，在之前的示例中，我们通过`lf.setTheme`方法设置矩形的全局样式，现在我们只对`square`节点的样式进行设置。

```ts
lf.register('square', (RegisterParam) => {
  const { RectNode, RectNodeModel, h } = RegisterParam;
  class SquareView extends RectNode {
    getShape() {
      const style = super.getShapeStyle();
      const { width, height } = style; 
      const { x, y } = this.getAttributes();
      const position = {
        x: x - width / 2,
        y: y - height /2
      }
      return h("rect", {
        ...style,
        ...position
      });
    }
  }
  // 自定义节点的 model
  class SquareModel extends RectNodeModel {
    constructor(data, graphModel) {
      super(data, graphModel);
      this.width = 100;
      this.height = 100;
    }
  }
  return {
    view: SquareView,
    model: SquareModel,
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
      properties: {}
    },
  ]
});
```

在上面的代码中，我们直接在`model`的构造函数里面设置了`width`和`height`，现在节点`view`通过`getShapeStyle`获取的样式也就随之发生了变更。同时可以看到，在自定义`model`时，我们需要提供一个构造函数，并在内部调用`super`方法进行初始化，Logic Flow 会为构造函数提供两个参数。

- `data` - 配置节点时的[数据属性](/api/nodeApi.md#通用属性)
- `graphModel` - LF 内部数据（继承自`BaseNodeModel`时不存在该参数；不建议做任何改动，后续版本会删掉。）

#### 自定义节点的数据属性

在[数据属性](/api/nodeApi.md#通用属性)中，我们可以设置节点的起始位置、文本内容及其位置、自定义属性等，这些数据最终都会被传入`model`进行初始化，所以我们同样可以在`model`中对这些值进行重新定义。

以正方形节点为例，现在我们想要自定义节点的文本位置。

```ts
lf.register('square', (RegisterParam) => {
  const { RectNode, RectNodeModel, h } = RegisterParam;
  class SquareView extends RectNode {
    getShape() {
      const style = super.getShapeStyle();
      const { width, height } = style; 
      const { x, y } = this.getAttributes();
      const position = {
        x: x - width / 2,
        y: y - height /2
      }
      return h("rect", {
        ...style,
        ...position
      });
    }
  }
  // 自定义节点的 model
  class SquareModel extends RectNodeModel {
    constructor(data, graphModel) {
      super(data, graphModel);
      this.width = 100;
      this.height = 100;
      // 设置节点的文本位置
      this.text = {
        ...this.text, // 必需。super() 已经为 text 设置了部分内部数据
        y: this.text.y + 70
      }
    }
  }
  return {
    view: SquareView,
    model: SquareModel,
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
      properties: {}
    },
  ]
});
```

### 简单节点的节点属性

不同形状的简单节点所对应的 SVG 标签不同，其所需要的标签属性也略有不同，查看[节点API](/api/nodeApi.html#节点属性)以获取更过信息。

例如我们需要实现一个三角形的节点。

```ts
lf.register('triangle', (RegisterParam) => {
  const { PolygonNode, PolygonNodeModel } = RegisterParam;
  class TriangleModel extends PolygonNodeModel {
    constructor(data, graphModel) {
      super(data, graphModel);
      // 多边形的节点属性 points
      this.points = [
        [50, 0],
        [100, 80],
        [0, 80],
      ];
    }
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
