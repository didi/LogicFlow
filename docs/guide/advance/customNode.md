# 自定义节点

> Logic Flow 的元素是基于 SVG 实现的，如果你对 SVG 的相关知识还不太熟悉，那么推荐你先了解一下 [SVG](https://developer.mozilla.org/zh-CN/docs/Web/SVG) 的基础内容。

## 原理

### 基于继承的自定义节点

Logic Flow 对外暴露了基础节点`BaseNode`和5个代表简单类型的节点`RectNode`、`CircleNode`、`PolygonNode`、`EllipseNode`、`DiamondNode`。

<img src="../../assets/images/custom-node.png" alt="节点继承原理" style="zoom: 80%;"  />

由上图可以看到，Logic Flow 提供的简单节点都继承自内部的`BaseNode`，因此，用户的`CustomNode`既可以通过继承简单类型节点实现，也可以直接继承`BaseNode`来实现。

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

在上面的代码中，`getShape`方法返回了一个没有任何属性的 rect 标签，Logic Flow 拿到这个返回值后会直接在`graph`中进行渲染。

此时节点还不能正常显示，因为`rect`标签缺少了`model`所提供的**动态**数据，注意，`view`只专注于节点应该如何渲染，而渲染时所需要的数据全部源自`model`，Logic Flow 在`view`中提供了两个方法来获取这些数据。

- [getShapeStyle](/guide/advance/customNode.html#getshapestyle)
- [getAttributes](/guide/advance/customNode.html#getattributes)

### getShapeStyle

`getShapeStyle`方法返回了节点在渲染时所需要的部分样式属性，这些[样式属性](/api/nodeApi.html#样式属性)源自节点的`model`。

```ts
// 为自定义节点复写 getShapeStyle
getShapeStyle() {
  const style = super.getShapeStyle();
  return Object.assign(style, {});
}
```

继续看前文中的正方形节点示例，现在我们通过`getShapeStyle`获取到`model`中的[样式属性](/api/nodeApi.html#样式属性)，并将其赋值给 rect 标签。

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

在上面的代码中，我们使用`lf.setTheme`方法为节点设置了`width`和`height`，这些样式会被传递给`model`，然后我们通过`getShapeStyle`方法去`model`中获取样式属性，并将其赋值给 rect 标签。

虽然节点已经可以显示了，但是它还不能正常使用，在 Logic Flow 中一个节点的基本功能（例：渲染位置）还受其自身的[数据属性](/api/nodeApi.md#通用属性)所影响，所以我们还要根据数据属性为节点标签设置必要的属性。

> 我们不推荐在`view`中直接修改节点的各类属性，因为节点的锚点和外边框的渲染都基于`model`，在`view`中设置的数据并不能影响到锚点和外边框，会导致渲染出现问题，所以直接在`model`中修改属性才是正确的姿势。此外通过`lf.setTheme`方法设置的样式是作用于全局的，对于单一类型的自定义节点，我们可以直接修改`model`中的样式属性。在下文，我们会学习如何在[model](/guide/advance/customNode.html#自定义节点的-model)中设置各种属性。

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

> 为了方便使用，`getAttributes`方法的返回值同样包含了`model`的样式属性。

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
        y: y - height / 2
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

你可能会疑惑，前文中已经提到了**不能在`view`中修改任何属性**，但在上例中，我们根据`properties.executed`的值修改了样式属性`stroke`，这是为什么？`properties`是一项特例，我们常常会在节点渲染好后对节点做一些操作，并根据`properties`的值去执行特定的逻辑，例如点击节点后，节点的 SVG 结构发生变化，这种运行时的场景就需要在`view`中执行，除此之外，我们仍然推荐不要在`view`中修改任何属性。

在`view`中根据`properties`修改样式属性时，唯一需要注意的点是不能修改**尺寸类**属性，因为节点的锚点和外边框获取不到修改后的值，具体的尺寸类属性如下。

| 属性 | 含义 | 对应节点类型 |
| :- | :- | :- |
| width | 宽 | 矩形（rect） |
| height | 高 | 矩形（rect） |
| r | 半径 | 圆形（circle） |
| rx | x 轴半径 | 椭圆（ellipse） |
| ry | y 轴半径 | 椭圆（ellipse） |

> Logic Flow 自定义节点最大的灵活性就在于`properties`属性，它可以实现大部分业务对于节点的逻辑需求。

## 自定义节点的 Model

节点的`model`中维护了以下内容：

- 节点的[通用属性](/api/nodeApi.md#通用属性)（包含数据属性、样式属性、附加属性、状态属性）
- 简单节点的[节点属性](/api/nodeApi.md#节点属性)

为了保证每一类属性都可以被正常设置，LF 在`model`的构造函数中按下图顺序对属性进行初始化。

<img src="../../assets/images/custom-node-model.png" alt="节点属性初始化顺序" style="display: block; margin: 0 auto; zoom: 50%;"  />

在 view 中我们可以通过`getShapeStyle`和`getAttributes`方法，从 model 里获取节点渲染时所需要的数据，接下来我们将学习如何在 model 中使用`setAttributes`方法来自定义这些数据。

### 数据属性

从上图可以看出，节点的数据属性在调用`setAttributes`之前已经被初始化，因此我们不需要对其再做任何改动，数据属性可以用来作为自定义其他属性的依据。

```ts
class Model extends BaseNodeModel {
  setAttributes() {
    // 读取数据属性的 properties.color，并根据其值设置样式属性 stroke
    const { properties: { color } } = this;
    this.stroke = color;
  }
}
```

### 样式属性

以正方形为例，在之前的示例中，我们通过`lf.setTheme`方法设置了矩形的全局样式，现在我们只设置`square`节点的样式。

```ts
lf.register('square', (RegisterParam) => {
  const { RectNode, RectNodeModel, h } = RegisterParam;
  class SquareView extends RectNode {
    // ...
  }
  // 自定义节点的 model
  class SquareModel extends RectNodeModel {
    // 设置自定义 width 和 height
    setAttributes() {
      this.width = 100;
      this.height = 100;
    }
  }
  return {
    view: SquareView,
    model: SquareModel,
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

在上面的代码中，我们直接在`setAttributes`中设置了`width`和`height`，现在节点`view`通过`getShapeStyle`获取的样式也就随之发生了变更。

### 附加属性

我们可以通过附加属性为节点设置锚点的数量和位置、连线时的校验规则、特有的菜单选项。

#### 设置锚点的数量和位置

以正方形节点为例，如果我们只想使用水平方向上的左右两个锚点，则需要设置附加属性`anchorsOffset`。

```ts
lf.register('square', (RegisterParam) => {
  const { RectNode, RectNodeModel, h } = RegisterParam;
  class SquareView extends RectNode {
    // ...
  }

  class SquareModel extends RectNodeModel {
    setAttributes() {
      const size = 100;
      this.width = size;
      this.height = size;
      // 设置自定义锚点
      // 只需要为每个锚点设置相对于节点中心的偏移量
      this.anchorsOffset = [
        [size / 2, 0], // x 轴上偏移 size / 2
        [-size / 2, 0], // x 轴上偏移 -size / 2
      ];
    }
  }
  return {
    view: SquareView,
    model: SquareModel,
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

在上例中，我们为`anchorsOffset`设置了一个数组，数组的每一项元素都是锚点相对于节点中心`(x, y)`的偏移量，例如`[size / 2, 0]`表示在 x 轴方向上从节点中心向右偏移宽度的一半，y 轴方向上不偏移。

#### 设置连线时的校验规则

在某些时候，我们可能需要控制连线的连接方式，比如开始节点不能被其它节点连接、结束节点不能连接其他节点、用户节点后面必须是判断节点等，要想达到这种效果，我们需要为节点设置以下两个属性。

- `sourceRules` - 当节点作为连线的起始节点（source）时的校验规则
- `targetRules` - 当节点作为连线的目标节点（target）时的校验规则

以正方形（square）为例，在连线时我们希望它的下一节点只能是圆形节点（circle），那么我们应该给`square`添加作为`source`节点的校验规则。

```ts
lf.register('square', (RegisterParam) => {
  const { RectNode, RectNodeModel, h } = RegisterParam;
  class SquareView extends RectNode {
    // ...
  }

  class SquareModel extends RectNodeModel {
    setAttributes() {
      // ...
      const circleOnlyAsTarget = {
        message: '正方形节点下一个节点只能是圆形节点',
        validate: (source, target) => {
          return target.type === 'circle';
        },
      };
      this.sourceRules.push(circleOnlyAsTarget);
    }
  }
  return {
    view: SquareView,
    model: SquareModel,
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

<example href="/examples/#/advance/custom-node/rule" :height="400" ></example>

在上例中，我们为`model`的`sourceRules`属性添加了一条校验规则，校验规则是一个对象，我们需要为其提供`messgage`和`validate`属性。

`message`属性是当不满足校验规则时所抛出的错误信息，`validate`则是传入规则检验的回调函数。`validate`方法有两个参数，分别为连线的起始节点（source）和目标节点（target），我们可以根据参数信息来决定是否通过校验，其返回值是一个布尔值。

> 当我们在面板上进行连线操作的时候，Logic Flow 会校验每一条规则，只有**全部**通过后才能连接。

在连线时，当鼠标松开后如果没有通过自定义规则（`validate`方法返回值为`false`），Logic Flow 会对外抛出事件`connection:not-allowed`。

```js
lf.on('connection:not-allowed', (msg) => {
  console.log(msg)
});
```

#### 特有的菜单选项

自定义节点的菜单功能依赖于 [@logicflow/extension](/guide/extension/extension-components.html#组件) 拓展包的[菜单](/guide/extension/extension-components.html#菜单)组件。

```ts
class Model extends BaseNodeModel {
  setAttributes() {
    this.menu = [
      {
        text: '删除',
        callback(node) {
          // node为该节点数据
          lf.deleteNode(node.id);
        },
      },
    ]
  }
}
```

在`model`中，我们可以直接设置`menu`属性以达到只为某一类节点设置菜单的效果，`menu`的类型是一个数组，数组的元素表示菜单项，菜单项的具体配置请查看拓展包中的[菜单配置项](/guide/extension/extension-components.html#菜单配置项)。

> 为某一种类型的节点设置菜单，并不是只有设置`model`的`menu`这一种方式，更便于自定义的方式是直接通过[事件系统](/guide/advance/event.html#节点事件)来监听右键事件，然后根据事件所返回的数据去渲染自己的组件，实际上，`@logicflow/extension`中的菜单组件就是基于这个机制开发的。

### 简单节点的节点属性

不同形状的简单节点所对应的 SVG 标签不同，其所需要的标签属性也略有不同，查看[节点 API](/api/nodeApi.html#节点属性) 以获取更过信息。

例如我们需要通过继承多边形（Polygon）来实现一个三角形的节点，直接修改多边形的节点属性`points`就可以快速得到这个效果。

```ts
lf.register('triangle', (RegisterParam) => {
  const { PolygonNode, PolygonNodeModel } = RegisterParam;
  class TriangleModel extends PolygonNodeModel {
    setAttributes() {
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

## extendKey

当我们注册的自定义节点希望可以被其他自定义节点继承时，就需要为`view`和`model`都设置一个静态属性`extendKey`，以便在`lf.register`的第二个回调函数的参数中被访问到。

```ts
lf.register('CustomNode', ({ BaseNode, BaseNodeModel }) => {
  class View extends BaseNode {
    static extendKey = 'CustomNodeView';
  }
  class Model extends BaseNodeModel {
    static extendKey = 'CustomNodeModel';
  }
  return {
    view: View,
    model: Model,
  }
});
```
