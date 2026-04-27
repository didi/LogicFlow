---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 右键菜单 (Menu)
order: 1
toc: content
---

在使用流程图工具进行编辑时，用户的注意力往往集中在画布区域。相比频繁移动鼠标去点击顶部菜单栏或使用快捷键，直接在节点、边或空白区域右键操作会更高效、符合直觉。为了更好地贴合用户的操作习惯，LogicFlow内置了右键菜单，让常用操作触手可及，提升整体编辑体验。

## 启用

引入并启用默认菜单

```tsx | pure
import LogicFlow from "@logicflow/core";
import { Menu } from "@logicflow/extension";
import "@logicflow/extension/lib/style/index.css";

LogicFlow.use(Menu); // 全局引入

const lf = new LogicFlow({
  plugins: [Menu], // 局部引入
})
```

默认情况下，菜单插件支持节点菜单、边菜单、画布菜单，并内置了以下功能：

- 节点右键菜单(nodeMenu)： 删除、复制、编辑文案
- 边右键菜单(edgeMenu)：删除、编辑文案
- 画布右键菜单(graphMenu)：无

当然，只支持这些配置项是远远不够的，因此我们还支持用户定制菜单配置项。

## 菜单配置项

菜单中的每一项功能，可以用一条配置进行表示。具体字段如下:

| 字段      | 类型             | 作用                       | 是否必须 | 描述                                                                                                                                                                                                                                                                                          |
| --------- | ---------------- | -------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| text      | string           | 文案                       |          | 菜单项展示的文案                                                                                                                                                                                                                                                                              |
| className | string           | class 名称                 |          | 每一项默认 class 为 lf-menu-item，设置了此字段，class 会在原来的基础上添加 className。                                                                                                                                                                                                        |
| icon      | boolean / string | 是否创建 icon 的 span 展位 |          | 如果简单的文案不能丰富表示菜单，可以加个 icon。设置为 `true` 时会创建一个 class 为 `lf-menu-icon` 的空图标容器。<br/>`2.1.0`版本开始，支持多种图标格式：图片文件路径（如 `./icon.png`）、base64 图片数据（如 `data:image/png;base64,...`）、CSS 类名或 HTML 内容。一般与 className 配合使用。 |
| disabled  | boolean          | 是否禁用菜单项             |          | 设置为 true 时，菜单项会显示为灰色且无法点击。可以通过 `changeMenuItemDisableStatus` 方法动态修改此状态。                                                                                                                                                                                     |
| callback  | Function         | 点击后执行的回调           | ✅        | 三种菜单回调中分别可以拿到节点数据/边数据/事件信息。                                                                                                                                                                                                                                          |

这里以节点右键菜单删除功能的写法为例：

```tsx | pure
// 定义一个做节点删除动作的菜单项
const menuItem = {
  className: "lf-menu-delete",
  icon: true,
  callback: (node) => {
    // 删除节点，并触发一个自定义事件 custom-node:deleted，把当前删除的节点信息抛出去
    lf.graphModel.deleteNode(node.id);
    lf.graphModel.eventCenter.emit("custom-node:deleted", node);
  },
}
```

## API

### addMenuConfig

通过`addMenuConfig`方法可以在原有菜单的基础上追加新的选项，具体配置示例如下：

```tsx | pure
import LogicFlow from '@logicflow/core'
import { Menu } from '@logicflow/extension'

import NodeData = LogicFlow.NodeData
import EdgeData = LogicFlow.EdgeData
import Position = LogicFlow.Position

// 实例化 LogicFlow
const lf = new LogicFlow({
  container: document.getElementById('app'),
  // 注册插件
  plugins: [Menu],
})
// 为菜单追加选项
// 也可以通过调用 lf.extension.menu.addMenuConfig 设置菜单，二者效果是相同的
lf.addMenuConfig({
  nodeMenu: [
    {
      text: '分享',
      callback() {
        alert('分享成功！')
      },
    },
    {
      text: '属性',
      callback(node: NodeData) {
        alert(`
              节点id：${node.id}
              节点类型：${node.type}
              节点坐标：(x: ${node.x}, y: ${node.y})
            `)
      },
    },
  ],
  edgeMenu: [
    {
      text: '属性',
      callback(edge: EdgeData) {
        const {
          id,
          type,
          startPoint,
          endPoint,
          sourceNodeId,
          targetNodeId,
        } = edge
        alert(`
              边id：${id}
              边类型：${type}
              边起点坐标：(startPoint: [${startPoint.x}, ${startPoint.y}])
              边终点坐标：(endPoint: [${endPoint.x}, ${endPoint.y}])
              源节点id：${sourceNodeId}
              目标节点id：${targetNodeId}
            `)
      },
    },
  ],
  graphMenu: [
    {
      text: '分享',
      callback() {
        alert('分享成功！')
      },
    },
    {
      text: '添加节点',
      callback(data: Position) {
        lf.addNode({
          type: 'rect',
          x: data.x,
          y: data.y,
        })
      },
    },
  ],
})
lf.render()
```

### setMenuConfig

如果默认菜单中存在不需要的选项，或者无法满足需求，可以通过`lf.setMenuConfig`覆盖默认菜单，实现自定义菜单的效果。

```tsx | pure
lf.setMenuConfig({
  nodeMenu: [
    {
      text: "删除",
      callback(node) {
        lf.deleteNode(node.id);
      },
    },
  ], // 覆盖默认的节点右键菜单
  edgeMenu: false, // 删除默认的边右键菜单
  graphMenu: [], // 覆盖默认的边右键菜单，与false表现一样
});
```

### setMenuByType

除了上面的复写整个菜单外，还可以使用`lf.setMenuByType`为指定类型的元素设置菜单。

```tsx | pure
lf.setMenuByType({
  type: "bpmn:startEvent",
  menu: [
    {
      text: "分享111",
      callback() {
        console.log("分享成功222！");
      },
    },
  ],
});
```

### changeMenuItemDisableStatus<Badge>2.1.0新增</Badge>

为了提供更灵活的交互，在2.1.0版本新增提供了动态控制菜单项禁用状态的功能，可以根据业务逻辑动态地禁用或启用特定的菜单项。

```tsx | pure
lf.changeMenuItemDisableStatus(menuKey, text, disabled)
```

参数说明：
- `menuKey`: 菜单类型，可选值为 `'nodeMenu'` | `'edgeMenu'` | `'graphMenu'` | `'selectionMenu'`
- `text`: 要操作的菜单项文本
- `disabled`: 是否禁用，`true` 为禁用，`false` 为启用

#### 使用示例

```tsx | pure
// 禁用节点菜单中的"删除"选项
lf.changeMenuItemDisableStatus('nodeMenu', '删除', true)

// 启用边菜单中的"属性"选项
lf.changeMenuItemDisableStatus('edgeMenu', '属性', false)

// 禁用画布菜单中的"分享"选项
lf.changeMenuItemDisableStatus('graphMenu', '分享', true)
```

#### 配置时设置禁用状态

也可以在配置菜单时直接设置某些菜单项为禁用状态：

```tsx | pure
lf.addMenuConfig({
  nodeMenu: [
    {
      text: '删除',
      disabled: true, // 初始状态为禁用
      callback(node: NodeData) {
        lf.deleteNode(node.id)
      },
    },
    {
      text: '复制',
      disabled: false, // 初始状态为启用
      callback(node: NodeData) {
        lf.cloneNode(node.id)
      },
    },
  ],
})
```

## 选区菜单

在使用了选区插件后，选区插件也会出现菜单，默认情况下选区菜单只有删除操作。
和其他菜单项一样，可以调用Menu插件提供的方法对选区菜单配置进行修改。

```tsx | pure
// 一个🌰：设置选区菜单不展示
lf.setMenuByType({
  type: "lf:defaultSelectionMenu",
  menu: [],
});
```

## 为自定义节点设置菜单

除了上面的为画布通用元素设置菜单外，LogicFlow还支持为自定义节点设置菜单：

```tsx | pure

// index.js
import { RectNode, CustomeModel } from "./custom.ts";
// 注册自定义节点
lf.register({
  type: "custome_node",
  view: RectNode,
  model: CustomeModel,
});
// 设置自定义节点菜单
lf.setMenuByType({
  type: "custome_node",
  menu: [
    {
      className: "lf-menu-delete",
      icon: true,
      callback: (node) => {
        lf.graphModel.deleteNode(node.id);
        lf.graphModel.eventCenter.emit("custom:event", node);
      },
    },
    {
      text: "edit",
      className: "lf-menu-item",
      callback: (node) => {
        this.lf.graphModel.setElementStateById(node.id, 2);
      },
    },
    {
      text: "copy",
      className: "lf-menu-item",
      disabled: false, // 可以设置禁用状态
      callback: (node) => {
        this.lf.graphModel.cloneNode(node.id);
      },
    }
  ],
});

lf.on("custom:event", (node) => {
  console.log(node);
});
```

## 自定义菜单样式

Menu插件为其展示的每个DOM都设置了 class ，用户可以根据菜单结构中的 class 覆盖原有样式，设置符合宿主风格的样式。

- 菜单：lf-menu
- 菜单项：lf-menu-item、用户自定义的 className
- 菜单项-文案：lf-menu-item-text
- 菜单项-图标：lf-menu-item-icon,需要将菜单项配置 icon 设置为 true
- 禁用菜单项：lf-menu-item__disabled，菜单项被禁用时会自动添加此 class

通过设置这些 class，可以覆盖默认样式，美化字体颜色，设置菜单项 icon 等。

## 自定义菜单Icon<Badge>2.1.0新增</Badge>
菜单组件现在支持多种图标配置方式，可以通过 `MenuItem` 的 `icon` 字段来设置图标，目前支持以下几种Icon设置方式：

#### 1. 布尔值（兼容老逻辑）
```typescript
{
  text: '删除',
  icon: true, // 创建空的图标容器
  callback: (node) => { /* ... */ }
}
```

#### 2. CSS类名（单个类名）
```typescript
{
  text: '删除',
  icon: 'fa-trash', // 添加多个类名
  callback: (node) => { /* ... */ }
}

// 或者使用点开头
{
  text: '删除',  
  icon: '.fa .fa-trash', // 添加多个类名
  callback: (node) => { /* ... */ }
}
```

#### 3. 图片文件路径

:::warning{title=Tip}
目前只支持 `png` `jpg` `jpeg` `gif` `svg` `webp` `ico` `bmp` 格式的图片
:::

```typescript
{
  text: '删除',
  icon: './assets/icons/delete.png', // 本地图片文件
  callback: (node) => { /* ... */ }
}

{
  text: '复制',
  icon: 'https://example.com/icons/copy.png', // 远程图片
  callback: (node) => { /* ... */ }
}
```

#### 5. HTML内容
```typescript
{
  text: '删除',
  icon: '<i class="fa fa-trash"></i>', // 直接插入HTML
  callback: (node) => { /* ... */ }
}

// SVG图标
{
  text: '编辑',
  icon: '<svg width="16" height="16"><path d="..."/></svg>',
  callback: (node) => { /* ... */ }
}
```

## 功能演示
<code id="react-portal" src="@/src/tutorial/extension/menu"></code>