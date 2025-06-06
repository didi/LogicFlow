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
   * 子节点是否限制移动范围
   * 启用后，子节点只能在分组范围内移动，不能拖拽到分组外
   * 同时限制resize不能超过children占地面积
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
   * 默认为 false，当设置为 true 时，对分组进行缩放或旋转操作，
   * 组内的节点也会同步进行相应的缩放或旋转
   */
  transformWithContainer?: boolean

  /**
   * 当前分组元素的 zIndex
   */
  zIndex?: number
  /**
   * 分组节点是否自动置顶
   * 当选中分组时，是否自动将分组及其子节点置于最顶层
   */
  autoToFront?: boolean
  
  /**
   * 节点是否允许添加到分组中的校验函数
   * 可以通过此函数自定义哪些节点可以被添加到分组中
   */
  isAllowAppendIn?: (nodeData: LogicFlow.NodeData) => boolean
} & IRectNodeProperties
```

### 默认配置

分组节点有以下默认配置：

```ts
// 分组节点默认展开时的大小
const DEFAULT_GROUP_EXPAND_WIDTH = 400
const DEFAULT_GROUP_EXPAND_HEIGHT = 230
// 分组节点默认收起时的大小
const DEFAULT_GROUP_COLLAPSE_WIDTH = 80
const DEFAULT_GROUP_COLLAPSE_HEIGHT = 60
// 默认 zIndex
const DEFAULT_BOTTOM_Z_INDEX = -10000
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
    collapsible: true,           // 允许折叠
    isCollapsed: false,          // 初始状态为展开
    width: 420,                  // 展开时的宽度
    height: 250,                 // 展开时的高度
    collapsedWidth: 80,          // 折叠时的宽度
    collapsedHeight: 60,         // 折叠时的高度
    radius: 5,                   // 圆角
    isRestrict: false,           // 不限制子节点移动范围
    autoResize: false,           // 不自动调整大小
    transformWithContainer: true, // 分组变换时同步变换子节点
    zIndex: -1000,               // 层级
    autoToFront: true,           // 选中时自动置顶
  },
}
```

### 完整配置示例

以下是一个完整的动态分组配置示例，展示了各种属性的使用：

```tsx | pure
import LogicFlow from '@logicflow/core'
import { DynamicGroup, dynamicGroup } from '@logicflow/extension'

// 自定义分组
class CustomGroup extends dynamicGroup.view {}

class CustomGroupModel extends dynamicGroup.model {
  initNodeData(data) {
    super.initNodeData(data)
    
    // 设置默认样式
    this.properties = {
      ...this.properties,
      collapsible: true,
      autoToFront: true,
      transformWithContainer: false,
    }
  }

  // 自定义分组样式
  getNodeStyle() {
    const style = super.getNodeStyle()
    style.stroke = '#1890ff'
    style.strokeWidth = 2
    style.fill = 'rgba(24, 144, 255, 0.1)'
    return style
  }

  // 自定义拖入高亮样式
  getAddableOutlineStyle() {
    const style = super.getAddableOutlineStyle()
    style.stroke = '#52c41a'
    style.strokeDasharray = '4 4'
    style.strokeWidth = 2
    return style
  }

  // 限制只允许特定类型的节点加入分组
  isAllowAppendIn(nodeData) {
    return ['rect', 'circle', 'diamond'].includes(nodeData.type)
  }
}

// 注册自定义分组
lf.register({
  type: 'custom-group',
  view: CustomGroup,
  model: CustomGroupModel,
})

// 渲染数据
lf.render({
  nodes: [
    {
      id: 'group_1',
      type: 'custom-group',
      x: 300,
      y: 200,
      text: '我的分组',
      properties: {
        children: ['node_1', 'node_2'],
        collapsible: true,
        width: 400,
        height: 300,
        isRestrict: true,
        autoResize: true,
      },
    },
    {
      id: 'node_1',
      type: 'rect',
      x: 250,
      y: 150,
      text: '节点1',
    },
    {
      id: 'node_2',
      type: 'circle',
      x: 350,
      y: 250,
      text: '节点2',
    },
  ],
})
```

## API

### 基础方法

#### addChild

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

#### removeChild

从分组中移除某个子节点。

```tsx | pure
const groupModel = lf.getNodeModelById("group_id");
groupModel.removeChild("node_id_1");
```

#### toggleCollapse

收起或展开分组，参数为`true`表示收起分组、`false` 表示展开分组，不传参数则切换当前状态。

```tsx | pure
const groupModel = lf.getNodeModelById('group_id')
// 收起分组
groupModel.toggleCollapse(true)
// 展开分组
groupModel.toggleCollapse(false)
// 切换状态
groupModel.toggleCollapse()
```

#### getNodesInGroup

获取分组内的所有节点ID列表。

```tsx | pure
const groupModel = lf.getNodeModelById('group_id') as DynamicGroupNodeModel;
const nodeIds = groupModel.getNodesInGroup(groupModel);
console.log('分组内的节点ID:', nodeIds);
```

### 校验方法

#### isAllowAppendIn(nodeData)

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

### 样式方法

#### getAddableOutlineStyle

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

#### getResizeOutlineStyle

设置分组缩放时的边框样式。

```tsx | pure
class MyGroupModel extends dynamicGroup.model {
  getResizeOutlineStyle() {
    const style = super.getResizeOutlineStyle();
    style.stroke = "#1890ff";
    style.strokeWidth = 1;
    return style;
  }
}
```

#### getAnchorStyle

设置分组锚点的样式。

```tsx | pure
class MyGroupModel extends dynamicGroup.model {
  getAnchorStyle() {
    const style = super.getAnchorStyle();
    style.stroke = "#1890ff";
    style.fill = "#ffffff";
    return style;
  }
}
```

### 实用方法

#### setAllowAppendChild

设置分组是否处于可添加子节点的状态。

```tsx | pure
const groupModel = lf.getNodeModelById('group_id') as DynamicGroupNodeModel;
// 设置为可添加状态
groupModel.setAllowAppendChild(true);
// 设置为不可添加状态
groupModel.setAllowAppendChild(false);
```

#### toBack

将分组节点置于底层。

```tsx | pure
const groupModel = lf.getNodeModelById('group_id') as DynamicGroupNodeModel;
groupModel.toBack();
```

## 插件类 API

DynamicGroup 插件类提供了一些实用的方法，你可以通过 `lf.graphModel.dynamicGroup` 访问这些方法：

### getGroupByNodeId

根据节点ID获取该节点所属的分组。

```tsx | pure
const nodeGroup = lf.graphModel.dynamicGroup.getGroupByNodeId('node_1');
if (nodeGroup) {
  console.log('节点所属分组:', nodeGroup.getData());
}
```

### getGroupByBounds

根据边界框获取指定位置及其所属的分组。当分组重合时，优先返回最上层的分组。

```tsx | pure
const bounds = {
  minX: 100,
  minY: 100,
  maxX: 200,
  maxY: 200
};
const nodeData = { id: 'test', type: 'rect' };
const group = lf.graphModel.dynamicGroup.getGroupByBounds(bounds, nodeData);
if (group) {
  console.log('该区域所属分组:', group.getData());
}
```

### sendNodeToFront

提高元素的层级，如果是分组，同时提高其子元素的层级。

```tsx | pure
const nodeModel = lf.getNodeModelById('group_1');
lf.graphModel.dynamicGroup.sendNodeToFront(nodeModel);
```

## 插件事件

DynamicGroup 插件会触发以下事件，你可以通过监听这些事件来实现自定义的业务逻辑：

### 分组相关事件

| 事件名              | 说明                         | 事件对象                                          |
| :------------------ | :--------------------------- | :------------------------------------------------ |
| `group:add-node`    | 节点加入到分组中触发         | `{ data: 分组数据, childId: 新加入节点的id }`     |
| `group:remove-node` | 节点从分组中移除触发         | `{ data: 分组数据, childId: 移除节点的id }`       |
| `group:not-allowed` | 节点不允许加入到分组中时触发 | `{ group: 分组数据, node: 被禁止加入的节点信息 }` |

### 事件监听示例

```tsx | pure
// 监听节点加入分组事件
lf.on('group:add-node', ({ data, childId }) => {
  console.log(`节点 ${childId} 已加入分组 ${data.id}`)
  
  // 可以在这里执行自定义逻辑，比如更新UI状态
  updateGroupInfo(data.id, childId, 'add')
})

// 监听节点移出分组事件
lf.on('group:remove-node', ({ data, childId }) => {
  console.log(`节点 ${childId} 已从分组 ${data.id} 中移除`)
  
  updateGroupInfo(data.id, childId, 'remove')
})

// 监听节点被禁止加入分组事件
lf.on('group:not-allowed', ({ group, node }) => {
  console.log(`节点 ${node.id} 不允许加入分组 ${group.id}`)
  
  // 可以显示提示信息
  showNotification(`节点类型 ${node.type} 不能加入此分组`)
  
  // 如果需要删除被拒绝的节点
  // lf.deleteNode(node.id)
})
```

## 高级用法

### 限制模式 (isRestrict)

启用限制模式后，子节点将被限制在分组范围内，无法拖拽到分组外部：

```tsx | pure
const restrictedGroup = {
  type: 'dynamic-group',
  x: 300,
  y: 200,
  properties: {
    isRestrict: true,        // 启用限制模式
    autoResize: true,        // 启用自动调整大小
    width: 400,
    height: 300,
  },
}

// 在限制模式下，子节点移动时分组会自动调整大小以容纳所有子节点
```

### 折叠功能详解

分组的折叠功能会自动处理以下事项：

1. **节点隐藏**：折叠时隐藏所有子节点，展开时恢复显示
2. **连线处理**：自动创建虚拟连线来表示分组内外的连接关系
3. **尺寸变化**：在折叠和展开状态之间切换尺寸

```tsx | pure
// 监听分组状态变化
lf.on('node:properties-change', ({ id, properties, preProperties }) => {
  const node = lf.getNodeModelById(id)
  if (node?.isGroup) {
    const wasCollapsed = preProperties.isCollapsed
    const isCollapsed = properties.isCollapsed
    
    if (wasCollapsed !== isCollapsed) {
      console.log(`分组 ${id} 状态变化: ${isCollapsed ? '折叠' : '展开'}`)
    }
  }
})
```

### 联动变换 (transformWithContainer)

启用 `transformWithContainer` 后，对分组进行缩放或旋转时，子节点也会同步变换：

```tsx | pure
const transformGroup = {
  type: 'dynamic-group',
  x: 300,
  y: 200,
  properties: {
    transformWithContainer: true,  // 启用联动变换
    width: 400,
    height: 300,
  },
}

// 现在对分组进行缩放或旋转时，子节点会保持相对位置进行同步变换
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
