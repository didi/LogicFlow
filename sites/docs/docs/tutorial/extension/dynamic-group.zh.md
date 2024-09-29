---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 动态分组 (DynamicGroup)
order: 8
toc: content
tag: 新插件
---

LogicFlow 支持动态分组。动态分组是 LogicFlow 内置的自定义节点, 是 Group 分组的升级版本（因为我们内置了 Node Resize 功能，且 Group 分组的功能命名不够规范，所以我们推出了升级版的 DynamicGroup 节点）。我们会持续在该插件中做能力增强，欢迎大家一起参与共建。

## 演示

<code id="react-portal" src="@/src/tutorial/extension/dynamic-group"></code>

## 使用插件

```tsx | pure
import LogicFlow from '@logicflow/core'
import { DynamicGroup } from '@logicflow/extension'
import '@logicflow/extension/es/style/index.css'

const lf = new LogicFlow({
  // ...
  plugins: [DynamicGroup],
})
lf.render({
  nodes: [
    {
      type: 'dynamic-group',
      x: 300,
      y: 300,
    },
  ],
})
```

## DynamicGroup 节点的数据格式

`dynamic-group`对 LogicFlow 来说是一种特殊的节点，所以其数据格式仍然和节点基本一致。只是相对于普通的节点，`dynamic-group`
节点多了一个`children`属性，用来存储其子节点 Id.

```tsx | pure
lf.render({
  nodes: [
    {
      type: "dynamic-group",
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

## 自定义分组节点

在实际业务中，我们建议和自定义节点一样，开发者基于自己的业务自定义分组，然后给分组取个符合自己业务的名字。例如在
bpmn 中的子分组，取名叫做`subProcess`，然后自定义分组节点的样式。

```tsx | pure
import { dynamicGroup } from "@logicflow/extension";

class CustomGroup extends dynamicGroup.view {
}

class CustomGroupModel extends dynamicGroup.model {
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = "#AEAFAE";
    style.strokeDasharray = "3 3";
    style.strokeWidth = 1;
    return style;
  }
}

lf.register({
  type: "my-custom-group",
  model: CustomGroup,
  view: CustomGroupModel,
});
```

## groupModel 的属性和方法

分组节点除了节点本身的属性以外，还有一些属于分组的特殊属性。我们可以在自定义的时候，控制这些属性来实现各种效果的分组。节点本身的属性和方法见 [nodeModel](../../api/nodeModel.zh.md)。

### 状态属性
```ts
export type IRectNodeProperties = {
  width?: number
  height?: number
  radius?: number
  style?: LogicFlow.CommonTheme
  textStyle?: LogicFlow.CommonTheme

  [key: string]: unknown
}

export type IGroupNodeProperties = {
  /**
   * 当前分组中的节点 id
   */
  children?: string[]
  /**
   * 分组节点是否可以折叠
   */
  collapsible?: boolean
  /**
   * 分组节点折叠状态
   */
  isCollapsed?: boolean
  /**
   * 子节点是否限制移动范围 + 
   * 限制resize不能超过children占地面积
   * 默认为 false，允许拖拽移除分组
   */
  isRestrict?: boolean
  /**
   * isRestrict 模式启用时，
   * 如果同时设置 autoResize 为 true，
   * 那么子节点在父节点中移动时，父节点会自动调整大小
   */
  autoResize?: boolean

  // 默认宽高作为 group 的展开宽高
  /**
   * 分组节点展开状态宽高
   */
  width?: number
  height?: number
  
  /**
   * 分组节点的收起状态宽高
   */
  collapsedWidth?: number
  collapsedHeight?: number

  /**
   * 缩放或旋转容器时，是否缩放或旋转组内节点
   * 默认为 false，缩放或旋转容器时，默认缩放或旋转组内节点
   */
  transformWithContainer?: boolean

  /**
   * 当前分组元素的 zIndex
   */
  zIndex?: number
  /**
   * 分组节点是否自动置顶
   */
  autoToFront?: boolean
} & IRectNodeProperties
```

group 的属性设置方式和节点一样，可以在 `groupModel` 的 `initNodeData` 或 `setAttributes` 方法中设置。也可以直接在节点初始化时，在 properties 中传入（推荐用法）

```ts
const dynamicGroupNodeConfig = {
  id: 'dynamic-group_1',
  type: 'dynamic-group',
  x: 500,
  y: 140,
  text: 'dynamic-group_1',
  resizable: true,
  rotatable: false,
  properties: {
    children: ["rect_3"],
    collapsible: true,
    width: 420,
    height: 250,
    radius: 5,
    isCollapsed: true,
    transformWithContainer: true,
  },
}
```

## API
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

### toggleCollapse

收起分组, 参数为`true`表示收起分组、`false` 表示展开分组

```tsx | pure
const groupModel = lf.getNodeModelById('group_id')
groupModel.toggleCollapse(true)
```

### isAllowAppendIn(nodeData)

校验是否允许传入节点添加到此分组中，默认所有的节点都可以。

```tsx | pure
class MyGroupModel extends dynamicGroup.model {
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
class MyGroupModel extends dynamicGroup.model {
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

## 关于泳道
:::info{title=关于泳道}
分组功能不是泳道，需要开发者在分组的基础上自己实现。后续 LogicFlow 提供的 Bpmn 全功能支持会支持 BPMN
泳道。也欢迎自己实现了的同学给我们 PR。
:::
