---
nav: 指南
group:
  title: 进阶
  order: 2
title: 节点
order: 0
toc: content
---

## 连接规则

在某些时候，我们可能需要控制边的连接方式，比如开始节点不能被其它节点连接、结束节点不能连接其他节点、用户节点后面必须是判断节点等，要想达到这种效果，我们需要为节点设置以下两个属性。

- `sourceRules` - 当节点作为边的起始节点（source）时的校验规则
- `targetRules` - 当节点作为边的目标节点（target）时的校验规则

以正方形（square）为例，在边时我们希望它的下一节点只能是圆形节点（circle），那么我们应该给`square`
添加作为`source`节点的校验规则。

```tsx | pure
import { RectNode, RectNodeModel } from '@logicflow/core'

class SquareModel extends RectNodeModel {
  initNodeData(data) {
    super.initNodeData(data)

    const circleOnlyAsTarget = {
      message: '正方形节点下一个节点只能是圆形节点',
      validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {
        return targetNode.type === 'circle'
      },
    }
    this.sourceRules.push(circleOnlyAsTarget)
  }
}
```

在上例中，我们为`model`的`sourceRules`
属性添加了一条校验规则，校验规则是一个对象，我们需要为其提供`messgage`和`validate`属性。

`message`属性是当不满足校验规则时所抛出的错误信息，`validate`则是传入规则检验的回调函数。`validate`
方法有两个参数，分别为边的起始节点（source）和目标节点（target），我们可以根据参数信息来决定是否通过校验，其返回值是一个布尔值。

:::warning{title=提示}
当我们在面板上进行边操作的时候，LogicFlow 会校验每一条规则，只有**全部**通过后才能连接。
:::

在边时，当鼠标松开后如果没有通过自定义规则（`validate`方法返回值为`false`），LogicFlow
会对外抛出事件`connection:not-allowed`。

```tsx | pure
lf.on('connection:not-allowed', (msg) => {
  console.log(msg)
});
```

下面举个例子，通过**设置不同状态下节点的样式**来展示连接状态👇

在节点model中，有个state属性，当节点连接规则校验不通过时，state属性值为5。我们可以通过这个属性来实现连线是节点的提示效果。

<code id="node-connect" src="../../../src/tutorial/advanced/node/connect"></code>

## 移动

有些时候，我们需要更加细粒度的控制节点什么时候可以移动，什么时候不可以移动，比如在实现分组插件时，需要控制分组节点子节点不允许移动出分组。和连线规则类似，我们可以给节点的`moveRules`
添加规则函数。

```tsx | pure
class MovableNodeModel extends RectNodeModel {
  initNodeData(data) {
    super.initNodeData(data);
    this.moveRules.push((model, deltaX, deltaY) => {
      // 需要处理的内容
    });
  }
}
```

在`graphModel`中支持添加全局移动规则，例如在移动A节点的时候，期望把B节点也一起移动了。

```tsx | pure
lf.graphModel.addNodeMoveRules((model, deltaX, deltaY) => {
  // 如果移动的是分组，那么分组的子节点也跟着移动。
  if (model.isGroup && model.children) {
    lf.graphModel.moveNodes(model.children, deltaX, deltaY, true);
  }
  return true;
});
```

<code id="node-movable" src="../../../src/tutorial/advanced/node/movable"></code>

## 锚点

对于各种基础类型节点，我们都内置了默认锚点。LogicFlow支持通过重写获取锚点的方法来实现自定义节点的锚点。

<code id="node-sql" src="../../../src/tutorial/advanced/node/sql"></code>

上面的示例中，我们自定义锚点的时候，不仅可以定义锚点的数量和位置，还可以给锚点加上任意属性。有了这些属性，我们可以再做很多额外的事情。例如，我们增加一个校验规则，只允许节点从右边连出，从左边连入；或者加个id,
在获取数据的时候保存当前连线从那个锚点连接到那个锚点。

:::warning{title=注意}
一定要确保锚点id唯一，否则可能会出现在连线规则校验不准确的问题。
在实际开发中，存在隐藏锚点的需求，可以参考github
issue [如何隐藏锚点？](https://github.com/didi/LogicFlow/issues/454)，可以查看code
sandbox [示例](https://codesandbox.io/s/reverent-haslett-dkb9n?file=/step_14_hideAnchor/index.js)
:::

## 文本

LogicFlow支持自定义节点文本的外观和编辑状态。参考[nodeModel API](../../api/nodeModel.zh.md)
中的`textObject`

```tsx | pure
class CustomNodeModel extends RectNodeModel {
  initNodeData(data) {
    super.initNodeData(data)
    this.text.draggable = false; // 不允许文本被拖动
    this.text.editable = false; // 不允许文本被编辑
  }

  getTextStyle() {
    const style = super.getTextStyle();
    style.fontSize = 16;
    style.color = 'red';
    return style;
  }
}
```

## HTML 节点

LogicFlow内置了基础的HTML节点和其他基础节点不一样，我们可以利用LogicFlow的自定义机制，实现各种形态的HTML节点，而且HTML节点内部可以使用任意框架进行渲染。

下面是HTML节点的示例👇

<code id="node-html-node" src="../../../src/tutorial/advanced/node/htmlNode/index"></code>

## React 节点

因为自定义html节点对外暴露的是一个DOM节点，所以你可以使用框架现有的能力来渲染节点。在react中，我们利用`reactDom`
的`render`方法，将react组件渲染到dom节点上。

<code id="node-react-node" src="../../../src/tutorial/advanced/node/reactNode/index"></code>

## Vue 节点

<details> <summary>代码展开</summary>

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

## 外部通信

当需要自定义节点与外部交互时，比如点击自定义 HTML 节点上的按钮，触发外部方法，可以用 LogicFlow
的自定义事件机制来实现。

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

:::success{title=提示}
如果期望从外部传递一个方案给自定义节点使用。由于自定义节点中无法直接访问到`lf`实例，所以不支持直接给
lf 绑定一个方法。但是自定义节点可以拿到整个图的 model 对象，也就是`graphModel`
，所以可以把这个方法绑定到`graphModel`上。另外`lf`内置的方法`graphModel`
中基本都有，所以在开发自定义节点的时候可以使用`graphModel`获取流程图相关数据即可。
:::

## 更新

HTML节点目前通过修改properties触发节点更新。

```tsx | pure
 /**
 * @overridable 支持重写
 * 和react的shouldComponentUpdate类似，都是为了避免出发不必要的render.
 * 但是这里不一样的地方在于，setHtml方法，我们只在properties发生变化了后再触发。
 * 而x,y等这些坐标相关的方法发生了变化，不会再重新触发setHtml.
 */
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

如果期望其他内容的修改可以触发节点更新，可以重写shouldUpdate（相关issue: [#1208](https://github.com/didi/LogicFlow/issues/1208)）

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

