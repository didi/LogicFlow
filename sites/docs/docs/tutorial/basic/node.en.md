---
nav: Guide
group:
  title: Basics
  order: 1
title: Node
order: 1
toc: content
---

LogicFlow has built-in some basic nodes, and developers can, in practical application scenarios,
define nodes that fit their business logic based on these basic nodes.

## Understanding Basic Nodes

LogicFlow is a flowchart editing framework based on SVG. Therefore, our nodes and connections are
basic SVG shapes. Modifying the style of LogicFlow nodes is essentially modifying the SVG basic
shapes. There are seven types of basic nodes built into LogicFlow, namely:

1. <a href="https://developer.mozilla.org/en/docs/Web/SVG/Element/rect" target="_blank">rect</a>
2. <a href="https://developer.mozilla.org/en/docs/Web/SVG/Element/circle" target="_blank">circle</a>
3. <a href="https://developer.mozilla.org/en/docs/Web/SVG/Element/ellipse" target="_blank">
   ellipse</a>
4. <a href="https://developer.mozilla.org/en/docs/Web/SVG/Element/polygon"    target="_blank">
   polygon</a>
5. `diamond`
6. <a href="https://developer.mozilla.org/en/docs/Web/SVG/Element/text" target="_blank">text</a>
7. `html`

<code id="node-shapes" src="../../../src/tutorial/basic/node/shapes"></code>

The basic nodes in LogicFlow are relatively simple, but in business scenarios, there may be various
requirements for the appearance of nodes. LogicFlow provides a powerful custom node feature that
supports developers in creating various custom nodes. The following is an introduction to custom
nodes based on inheritance.

## Custom nodes

LogicFlow implements custom nodes and edges based on inheritance. Developers can inherit the
built-in nodes of LogicFlow and then use
object-oriented <a href="https://baike.baidu.com/item/%E9%87%8D%E5%86%99/9355942?fr=aladdin" target="_blanl">overriding</a> 
mechanisms. By overriding methods related to node styles, developers can achieve the effect of
customizing node styles.

![logicflow-1.0-2.png](../../../public/logicflow-8-7.jpg)

:::warning
LogicFlow recommends that in practical application scenarios, all nodes use custom nodes, and the
node types are defined with names that align with the project's business meaning, rather than using
shapes like circles or rectangles that only represent appearance.
:::

### Node `model` and `view`

`model`: Data layer containing various styles (such as borders, colors), shapes (dimensions, vertex
positions), and business properties of nodes.

`view`: View layer controlling the final rendering effects of nodes. By modifying the `model`,
custom nodes can be created, while more complex SVG elements can be customized on the `view`.

LogicFlow is based on the MVVM pattern. When customizing a node, we can redefine its `model`
and `view`. This involves overriding methods in the `model` to obtain style-related information and
overriding `getShape` in the `view` to define complex node appearances.

Here's an example of customizing a node by inheriting and overriding the `model`. Customizing nodes
can be achieved using different approaches 😊.

<code id="node-custom" src="../../../src/tutorial/basic/node/custom"></code>

[lf.register](../../api/detail/index.en.md#register): Register custom nodes. After registration,
custom nodes can be used.

:::info

LogicFlow in order to develop the development experience and now front-end popular development
experience alignment, but also in order to better understand the code level, so that more people can
participate in, we based on preact, mobx to MVVM mode development. If you are familiar with react
development, you can directly read our source code, you can find the whole project to read the
difficulty, and you develop your own project is about the same. **We welcome you to join us.**

:::

There are 7 kinds of base nodes in LogicFlow, you can choose any one of them to inherit when you
customize the node, and then take a name that meets your business meaning. Take the scalable node
provided in @logicflow/extension as an example: LogicFlow base node does not support node scaling,
so LogicFlow encapsulates the logic of node scaling based on the base node in the extension package,
and then releases it. So LogicFlow encapsulates the logic of node scaling based on the base node in
the extension package and releases it.

```tsx | pure
import { RectResize } from "@logicflow/extension";

class CustomNodeModel extends RectResize.model {
}

class CustomNode extends RectResize.view {
}
```

### Customizing node `model`

LogicFlow categorizes custom node appearance into two ways: `custom node style attribute`
and `custom node shape attribute`. For more details on how to define them,
see [NodeModelApi](../../api/model/nodeModel.en.md)。

#### 1. style attributes

In LogicFlow, the appearance attributes represent the control of the node's `border`, `color`, and
other appearance-oriented attributes. These properties can be controlled directly
through [theme-configuration](../../api/theme.en.md). Customizing node styles can be seen as
redefining the theme based on the current node type.

For example, if all `rect` nodes in the theme have their border color defined as red `stroke: red`,
then you can redefine `UserTask` to have a blue `stroke: blue` border when customizing the
node `UserTask`. For more granular node style control,
see [API Style Attributes](../../api/model/nodeModel.en.md#style-attributes).

```tsx | pure
class UserTaskModel extends RectNodeModel {
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = 'blue';
    return style;
  }
}
```

#### 2. Shape attributes

In LogicFlow, shape properties refer to attributes that control the final appearance of nodes, such
as `width` and `height` for dimensions, `radius` for rounded rectangles, `r` for circles (radius),
and `points` for polygons (vertices). These properties are crucial as LogicFlow calculates anchor
points for nodes and start/end points for connections based on them. Customizing shape properties
requires modification within the `setAttributes` method or `initNodeData` method.

LogicFlow has some shape attributes specific to each base node.
See [API Shape Attributes](../../api/model/nodeModel.en.md#shape-attributes) for details.

```tsx | pure
class customRectModel extends RectNodeModel {
  initNodeData(data) {
    super.initNodeData(data);
    this.width = 200;
    this.height = 80;
  }

  // or
  setAttributes() {
    this.width = 200;
    this.height = 80;
  }
}
```

:::warning

If you don't set the shape attribute in `model`, but directly define the shape attribute such as
width and height of the generated graphic directly in `view`, the anchor position and outline size
will be incorrect. Also, the position of the connecting lines may be misplaced.

:::

#### 3. Customizing node styles based on properties attributes

In the previous LogicFlow example, it was mentioned that both nodes and edges in the `graph data`
retain a properties field. This field allows developers not only to modify elements' `styles`
and `shapes`, but also to store their own `business` attributes. Therefore, when customizing node
styles, developers can use properties from
the [properties](../../api/model/nodeModel.en.md#data-attributes) to control how nodes display different
styles.

<code id="custom-rect" src="../../../src/tutorial/basic/node/properties"></code>

:::info

If you don't understand why `this.properties` prints out as a Proxy object, you can't see the
properties. Please check the <a href="https://github.com/didi/LogicFlow/issues/530" target="_blank">issue</a>, Printing a Proxy
object using `{ ...this.properties }`.

:::

### Customizing node `view`

LogicFlow can define the basic shape, style and other attributes of a node when customizing the
node's `model`. However, when you need a more complex node, you can use the custom node `view`
provided by LogicFlow.

The following is an example of a node `view`. Click `node1` several times to try it out.

<code id="node-custom-view" src="../../../src/tutorial/basic/node/custom-view"></code>

Here the `h function` is used for the return of `Shape`. The `h` method is a rendering function
exposed by LogicFlow, and its usage is the same as `react` and `vue`'
s <a href="https://v2.vuejs.org/v2/guide/render-function#createElement-Arguments" target="_blank">createElement</a> .
But here we need to create `svg` tags, so some basic knowledge of svg is required.

To give a few simple examples.

```tsx | pure
h(nodeName, attributes, [...children])

// <text x="100" y="100">Text content</text>
h('text', { x: 100, y: 100 }, ['Text content'])

/**
 * <g>
 *   <rect x="100" y="100" stroke="#000000" strokeDasharray="3 3"></rect>
 *   <text x="100" y="100">Text content</text>
 * </g>
 */

h('g', {}, [
  h('rect', { x: 100, y: 100, stroke: "#000000", strokeDasharray: "3 3" }),
  h('text', { x: 100, y: 100 }, ['Text content'])
])
```

#### The `getShape` method

This method defines the final rendered shape, and LogicFlow internally inserts its return into the
svg DOM. Developers do not necessarily need to override this method, but should only use it if they
want to change the svg DOM of the final rendered shape. In the example above, the final rendered svg
DOM of the `rect` node is just a rectangle. But when we want to add an icon to it, we need to change
the svg DOM of the final rendered graphic, which is done by overriding `getShape`.

LogicFlow defines the appearance of a node in three ways, namely **theme**, **custom node model**, *
*custom node view**. These three approaches are prioritized
as `theme < custom node mod < custom node view`.Their differences：

- Theme: defines common styles for all nodes of this base type, e.g. defines border color, width,
  etc. for all `rect` nodes.
- Custom node model: Defines the data for this registered type of node, storing and managing
  attributes such as style, shape, and business-related information of the node.
- Custom node view: Defines the `SVG DOM` for this registered type of node, visualizing the data
  from the `model` based on its attributes, rendering the information into a graphical form visible
  to the user.

:::warning
Although `custom node view` has the highest priority and the most complete function, theoretically
we can realize any effect we want through `custom node view`, but there are still some limitations
in this way.<br>

1. The shape attributes of the final graphic generated by the `custom node view` must be the same as
   the shape attributes in the `model`, because the anchor points and borders of the nodes are
   generated based on the `width` and `height` of the node's model.<br>
2. `Custom node view` must be consistent with the inherited base shape, not `rect` which is
   inherited, but the final shape returned by getShape will be round. This is because LogicFlow will
   base on the base graph for adjusting the lines on the nodes, generating anchor points, and so on.
   :::

#### Some thoughts 🤔️

##### 1. Why the `x`,`y` of `rect` is not `x`,`y` directly from `model`?

In all the base nodes of LogicFlow, `x`,`y` inside `model` are uniformly representing the center
point. However, the `getShape` method gives us a way to generate the svg dom directly, and in the
svg, there is a difference in controlling the position of the shape:

- `rect`: the position of the shape is represented by `x`, `y`, but it is represented by the
  coordinates of the top left corner of the shape. So generally the upper-left corner coordinates
  are calculated by centering and subtracting half the width and height of the node.

```tsx | pure
const { x, y, width, height, radius } = this.props.model;
// svg dom <rect x="100" y="100" width="100" height="80">
h("rect", {
  ...style,
  x: x - width / 2,
  y: y - height / 2,
  rx: radius, // Notice it's rx and not radius.
  ry: radius,
  width,
  height
})
```

- `circle` and `ellipse`: indicate the position of the figure by `cx`, `cy`, meaning the coordinates
  of the center point.

```tsx | pure
const { x, y, r } = this.props.model;
// svg dom <circle cx="100", cy="100", r="20">
h("circle", {
  ...style,
  r,
  cx: x,
  cy: y,
})
```

```tsx
const { x, y, rx, ry } = this.props.model;
// svg dom <ellipse cx="100", cy="100", rx="20" ry="10">
h("ellipse", {
  ...style,
  cx: x,
  cy: y,
  rx,
  ry
})
```

- `polygon`: All vertex coordinates already contain positions

```tsx | pure
const { x, y, points } = this.props.model;
const pointStr = points.map((point) => {
  return `${point[0] + x}, ${point[1] + y}`
}).join(" ");
// svg dom <polygon points="100,10 250,150 200,110" >
h("polygon", {
  ...style,
  r,
  points: pointStr,
})
```

:::info{title=Customize the view of the rectangle with the radius setting.}
In `model`, `radius` is the shape attribute of the rectangle node. But when customizing `view`, you
need to note that svg doesn't use `radius` to set the rounded corners of the rectangle,
but <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/rx" target="_blank">rx</a>, ry. So when
customizing `view`'s rectangle, you need to assign the value of `radius` in the model to `rx`
and `ry`. you need to assign `radius` to `rx` and `ry` in the model when customizing the rectangle
of `view`, otherwise the rounded corners won't take effect.
:::

##### 2. How does props work?

LogicFlow is developed based on `preact`, when we customize the node view, we can get the data
passed from the parent component through `this.props`. The `this.props` object contains two
properties, they are.

- `model`: represents the model of the custom node
- [graphModel](../../api/model/graphModel.en.md): the model for the entire graph of logicflow

##### 3. How to get the path of an icon?

Generally, for icons we can look for the UI or go to <a href="https://www.iconfont.cn/?lang=en-us" target="_blank">iconfont.co.uk</a> to
get a file in svg format. Then open it as text in IDE and format it to see the code. The code is
usually an outermost svg tag with one or more paths inside. at this point, we can just use the `h`
method mentioned earlier to implement the code in the svg file.

The svg tag typically includes the following attributes:

- `viewBox`: The <a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/viewBox" target="_blank">viewBox</a>
  attribute allows a given set of graphic stretches to be specified to fit a particular container
  element. It is generally sufficient to copy the value of the `viewBox` attribute from the svg tag.
- `width` and `height`: This doesn't need to use the `width` and `height` on the svg tag, just write
  the width and height you expect.

The path tag attribute:

- `d`: This attribute defines a path. You can copy the svg code directly, you don't need to worry
  about the meaning of d.
- `fill`: fill color of the path, generally consistent with the node's border color, but can also be
  customized according to business needs.

This chapter introduces the basic nodes here, if there are more needs for the node please move to
the [advanced-node](../advanced/node.en.md) to view.
