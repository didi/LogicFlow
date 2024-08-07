---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 分组 (Group)
order: 15
toc: content
tag: 即将废弃
---

LogicFlow 支持分组。分组是 LogicFlow 内置的自定义节点, 所以开发者可以在分组的基础上，参考自定义节点进行更多场景的自定义。

## 默认分组

```tsx | pure
import LogicFlow from '@logicflow/core'
import '@logicflow/core/es/style/index.css'
import { Group } from '@logicflow/extension'
import '@logicflow/extension/es/style/index.css'

const lf = new LogicFlow({
  // ...
  plugins: [Group],
})
lf.render({
  nodes: [
    {
      type: 'group',
      x: 300,
      y: 300,
    },
  ],
})
```

## group 的数据格式

`group`对 LogicFlow
来说是一种特殊的节点，所以其数据格式仍然和节点基本一致。但是相对于普通的节点，`group`
节点多了一个`children`属性，用来存储其子节点 Id.

```tsx | pure
lf.render({
  nodes: [
    {
      type: "group",
      x: 400,
      y: 400,
      children: ["rect_2"],
    },
    {
      id: "rect_2",
      type: "circle",
      x: 400,
      y: 400,
    },
  ],
});
```

## 自定义分组

在实际业务中，我们建议和自定义节点一样，开发者基于自己的业务自定义分组，然后给分组取个符合自己业务的名字。例如在
bpmn 中的子分组，取名叫做`subProcess`，然后自定义分组节点的样式。

```tsx | pure
import { GroupNode } from "@logicflow/extension";

class MyGroup extends GroupNode.view {
}

class MyGroupModel extends GroupNode.model {
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = "#AEAFAE";
    style.strokeDasharray = "3 3";
    style.strokeWidth = 1;
    return style;
  }
}

lf.register({
  type: "my-group",
  model: MyGroupModel,
  view: MyGroup,
});
```

## groupModel 的属性和方法

分组节点除了节点本身的属性以外，还有一些属于分组的特殊属性。我们可以在自定义的时候，控制这些属性来实现各种效果的分组。节点本身的属性和方法见[nodeModel](../../api/nodeModel.zh.md)。

### 状态属性

| 名称           | 类型      | 描述                                |
|:-------------|:--------|:----------------------------------|
| isRestrict   | boolean | 是否限制分组子节点拖出分组，默认 false            |
| resizable    | boolean | 分组是否支持手动调整大小，默认 false             |
| foldable     | boolean | 分组是否显示展开收起按钮，默认 false             |
| width        | number  | 分组宽度                              |
| height       | number  | 分组高度                              |
| foldedWidth  | number  | 分组折叠后的宽度                          |
| foldedHeight | number  | 分组折叠后的高度                          |
| isFolded     | boolean | 只读，表示分组是否被折叠。                     |
| isGroup      | boolean | 只读，永远为 true, 用于识别`model`为`group`。 |

group 的属性设置方式和节点一样，可以在`groupModel`的`initNodeData`或`setAttributes`方法中设置。

```tsx | pure
class MyGroupModel extends GroupNode.model {
  initNodeData(data) {
    super.initNodeData(data);
    this.isRestrict = true;
    this.resizable = true;
    this.foldable = true;
    this.width = 500;
    this.height = 300;
    this.foldedWidth = 50;
    this.foldedHeight = 50;
  }
}
```

### addChild

将某个节点设置为分组的子节点。注意，此方法只会添加关系，不会自动将节点移动到分组里面。

```tsx | pure
const groupModel = lf.getNodeModelById("group_id");
const node = lf.addNode({
  type: "rect",
  x: groupModel.x,
  y: groupModel.y,
});
groupModel.addChild(node.id);
```

### removeChild

从分组中移除某个子节点。

```tsx | pure
const groupModel = lf.getNodeModelById("group_id");
groupModel.removeChild("node_id_1");
```

### foldGroup

收起分组, 参数为`true`表示收起分组、false 表示展开分组

```tsx | pure
const groupModel = lf.getNodeModelById("group_id");
groupModel.foldGroup(true);
```

### isAllowAppendIn(nodeData)

校验是否允许传入节点添加到此分组中，默认所有的节点都可以。

```tsx | pure
class MyGroupModel extends GroupNode.model {
  isAllowAppendIn(nodeData) {
    // 设置只允许custom-rect节点被添加到此分组中
    return nodeData.type === "custom-rect";
  }
}
```

:::info{title=提示}
在节点不被允许添加到分组中时，节点仍然会显示在用户放的位置，只是这个节点不属于分组。如果你希望添加的节点被删除，可以监听`group:not-allowed`
事件，然后手动删除这个节点。
:::

### getAddableOutlineStyle

设置拖动节点到分组上时，分组高亮的提示效果样式。

```tsx | pure
class MyGroupModel extends GroupNode.model {
  getAddableOutlineStyle() {
    const style = super.getAddableOutlineStyle();
    style.stroke = "#AEAFAE";
    style.strokeDasharray = "3 3";
    return style;
  }
}
```

:::info{title=如何阻止节点连接到分组上?}
分组是一种特殊的节点，所以仍然可以通过[自定义连接规则校验](../advanced/node.zh.md#连接规则)
来实现不允许节点和分组直接相连。但是请不要将分组的锚点数量设置为
0，因为在分组被折叠时，会通过分组的锚点与外部节点相连来表示分组内部节点与外部节点的关系。
:::

## 示例

<a href="https://codesandbox.io/embed/bold-moore-vgvpf?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> 去 CodeSandbox 查看示例</a>

:::info{title=关于泳道}
分组功能不是泳道，需要开发者在分组的基础上自己实现。后续 LogicFlow 提供的 Bpmn 全功能支持会支持 BPMN
泳道。也欢迎自己实现了的同学给我们 PR。
:::
