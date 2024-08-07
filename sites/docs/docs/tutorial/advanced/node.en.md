---
nav: Guide
group:
  title: Intermediate
  order: 2
title: Node
order: 0
toc: content
---

## Connection rules

At some point, we may need to control how edges are connected, for example, the start node can't be
connected by other nodes, the end node can't be connected to other nodes, the user node must be
followed by a judgement node, etc. To achieve this effect, we need to set the following two
attributes for the node.

- `sourceRules` - check rules when the node is used as the start node (source) of an edge
- `targetRules` - check rules for when the node is the target of an edge.

Take a square for example, at the edge we want its next node to be only a circle node, then we
should add a check rule for `square` as a `source` node.

```tsx | pure
import { RectNode, RectNodeModel } from '@logicflow/core'

class SquareModel extends RectNodeModel {
  initNodeData(data) {
    super.initNodeData(data)

    const circleOnlyAsTarget = {
      message: 'The next node of a square node can only be a round node',
      validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {
        return targetNode.type === 'circle'
      },
    }
    this.sourceRules.push(circleOnlyAsTarget)
  }
}
```

In the above example, we added a checking rule to the `sourceRules` property of `model`, which is an
object for which we need to provide the `messgage` and `validate` properties.

The `message` attribute is the error message that is thrown when the check rule is not satisfied,
and `validate` is the callback function that is passed in to check the rule. The `validate` method
takes two arguments, the source and the target of the edge, and we can decide whether to pass
the check based on the information in the arguments, and its return value is a boolean.

:::warning
When we do an edge operation on the panel, LogicFlow checks each rule and will only connect if **all
** of them pass.
:::

When edging, LogicFlow throws the event `connection:not-allowed` externally if a custom rule is not
passed after the mouse is released (the `validate` method returns `false`).

```tsx | pure
lf.on('connection:not-allowed', (msg) => {
  console.log(msg)
});
```

Here is an example to show the connection state by **setting the style of the node in different
states** 👇.

In the node model, there is a state attribute, when the node connection rule check does not pass,
the value of the state attribute is 5. We can use this attribute to realize the effect of the hint
that the connection is a node.

<code id="node-connect" src="../../../src/tutorial/advanced/node/connect"></code>

## Move

There are times when we need more granular control over when a node can and cannot move, such as
when implementing a grouping plugin, where we need to control that grouped node children are not
allowed to move out of the group. Similar to the connectivity rules, we can add a rule function to
the node's `moveRules`.

```tsx | pure
class MovableNodeModel extends RectNodeModel {
  initNodeData(data) {
    super.initNodeData(data);
    this.moveRules.push((model, deltaX, deltaY) => {
      // ...
    });
  }
}
```

There is support in `graphModel` for adding global move rules, e.g. when moving node A, expect to
move node B along with it.

```tsx | pure
lf.graphModel.addNodeMoveRules((model, deltaX, deltaY) => {
  // If the move is a grouping, then the child nodes of the grouping move with it.
  if (model.isGroup && model.children) {
    lf.graphModel.moveNodes(model.children, deltaX, deltaY, true);
  }
  return true;
});
```

<code id="node-movable" src="../../../src/tutorial/advanced/node/movable"></code>

## Anchor Points

For various base type nodes, we have built-in default anchor points.LogicFlow supports customizing
the anchor point of a node by overriding the method of getting the anchor point.

<code id="node-sql" src="../../../src/tutorial/advanced/node/sql"></code>

In the above example, when we customize the anchors, we can not only define the number and position
of the anchors, but we can also add any attributes to the anchors. With these attributes, we can
then do a lot of additional things. For example, we can add a check rule to allow nodes to be
connected only from the right and not from the left, or we can add an id to save the current
connection from that anchor to that anchor when we get the data.

:::warning
Is sure to ensure that the anchor id is unique, otherwise there may be problems with inaccurate
checksums in the concatenation rules.
In actual development, there is a need to hide anchors, you can refer to the GitHub
issue [How to hide anchors?](https://github.com/didi/LogicFlow/issues/454)，Go to CodeSandbox
for [examples](https://codesandbox.io/s/reverent-haslett-dkb9n?file=/step_14_hideAnchor/index.js)
:::

## Text

LogicFlow supports customizing the appearance and editing state of node text.
References [nodeModel API](../../api/nodeModel.en.md) `textObject`

```tsx | pure
class CustomNodeModel extends RectNodeModel {
  initNodeData(data) {
    super.initNodeData(data)
    this.text.draggable = false;
    this.text.editable = false;
  }

  getTextStyle() {
    const style = super.getTextStyle();
    style.fontSize = 16;
    style.color = 'red';
    return style;
  }
}
```

## HTML Nodes

LogicFlow built-in basic HTML nodes and other basic nodes are not the same, we can use LogicFlow's
customization mechanism, the implementation of a variety of forms of HTML nodes, and HTML nodes can
be rendered using any framework for the internal.

The following is an example of an HTML node 👇.

<code id="node-html-node" src="../../../src/tutorial/advanced/node/htmlNode/index"></code>

## React nodes

Since a custom html node exposes a DOM node to the outside world, you can use the framework's
existing capabilities to render the node. In react, we utilize the `render` method of `reactDom` to
render the React component to the dom node.

<code id="node-react-node" src="../../../src/tutorial/advanced/node/reactNode/index"></code>

## Vue Nodes

<details> <summary>code expansion</summary>

```tsx | pure
import { HtmlNode, HtmlNodeModel } from "@logicflow/core";
import { createApp, ref, h } from 'vue';
import VueNode from './VueNode.vue';

class VueHtmlNode extends HtmlNode {
  constructor(props) {
    super(props)
    this.isMounted = false
    this.r = h(VueNode, {
      properties: props.model.getProperties(),
      text: props.model.inputData,
    })
    this.app = createApp({
      render: () => this.r
    })
  }

  setHtml(rootEl) {
    if (!this.isMounted) {
      this.isMounted = true
      const node = document.createElement('div')
      rootEl.appendChild(node)
      this.app.mount(node)
    } else {
      this.r.component.props.properties = this.props.model.getProperties()
    }
  }
}

class VueHtmlNodeModel extends HtmlNodeModel {
  setAttributes() {
    this.width = 300;
    this.height = 100;
    this.text.editable = false;
    this.inputData = this.text.value
  }

  getOutlineStyle() {
    const style = super.getOutlineStyle();
    style.stroke = 'none';
    style.hover.stroke = 'none';
    return style;
  }
}

export default {
  type: 'vue-html',
  model: VueHtmlNodeModel,
  view: VueHtmlNode
}
```

</details>

## External Communication

When there is a need for a custom node to interact with the outside world, such as clicking a button
on a custom HTML node that triggers an external method, you can use LogicFlow's custom event
mechanism to do so.

```tsx | pure
// view.js
class VueHtmlNode extends HtmlNode {
  constructor(props) {
    super(props);
    this.isMounted = false;
    this.r = h(VueNode, {
      properties: props.model.getProperties(),
      text: props.model.inputData,
      onBtnClick: (i) => {
        props.graphModel.eventCenter.emit("custom:onBtnClick", i);
      },
    });
    this.app = createApp({
      render: () => this.r,
    });
  }

  setHtml(rootEl) {
    if (!this.isMounted) {
      this.isMounted = true;
      const node = document.createElement("div");
      rootEl.appendChild(node);
      this.app.mount(node);
    } else {
      this.r.component.props.properties = this.props.model.getProperties();
    }
  }

  getText() {
    return null;
  }
}

// flow.js
const lf = new LogicFlow();
lf.render();
lf.on("custom:onBtnClick", () => {});
```

:::success{title=tip}
If a scheme is expected to be passed externally for use in a custom node. Since `lf` instances are
not directly accessible in the custom node, binding a method directly to lf is not supported. But
the custom node has access to the model object of the entire graph, `graphModel`, so it is possible
to bind this method to `graphModel`. In addition, `lf` has basically all the built-in methods
in `graphModel`, so you can just use `graphModel` to get the flowchart related data when developing
a custom node.
:::

## Updates

HTML nodes currently trigger node updates by modifying properties.

```tsx | pure
class CustomComponent extends Component {
  // ...
  shouldUpdate() {
    if (this.preProperties && this.preProperties === this.currentProperties) return
    this.preProperties = this.currentProperties
    return true
  }

  componentDidMount() {
    if (this.shouldUpdate()) {
      this.setHtml(this.rootEl)
    }
  }

  componentDidUpdate() {
    if (this.shouldUpdate()) {
      this.setHtml(this.rootEl)
    }
  }

  //..
}
```

If you expect changes to other content to trigger node updates, you can override shouldUpdate
（related issue. [#1208](https://github.com/didi/LogicFlow/issues/1208)）

```tsx | pure
class CustomComponent extends Component {

  shouldUpdate() {
    if (this.preProperties &&
      this.preProperties === this.currentProperties &&
      this.preText === this.props.model.text.value
    ) {
      return
    }
    this.preProperties = this.currentProperties
    this.preText = this.props.model.text.value
    return true;
  }
}
```

