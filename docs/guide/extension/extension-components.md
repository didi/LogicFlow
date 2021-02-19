# 组件

`lf-extension`包中提供一些开箱即用的组件，快速支持产品中常见的功能，如控制面板、右键菜单等。

## 使用指南

```ts
import LogicFlow from '@logicflow/core';
import { Control, Menu, DndPanel } from '@logicflow/extension';
import '@logicflow/extension/lib/style.css';

LogicFlow.use(Control);
LogicFlow.use(Menu);
LogicFlow.use(DndPanel);
```

## 控制面板

注册`Control`组件后，Logic Flow 会在画布右上方创建一个控制面板，如下所示

<example href="/examples/#/extension/components/control" :height="190" ></example>

控制面板提供了常见的能力，放大缩小或者自适应画布的能力，同时也内置了 redo 和 undo 的功能，当然如果你不喜欢这样的 UI或功能，也可以基于`LogicFlow`提供的 [API](/api/logicFlowApi.html) 自己定义。

## 菜单

> 菜单指的是右键菜单  

`Menu`组件支持菜单包括，节点右键菜单、连线右键菜单、画布右键菜单，在各个菜单内置了默认功能。

- 节点右键菜单(nodeMenu)： 删除、复制、编辑文案
- 连线右键菜单(edgeMenu)：删除、编辑文案
- 画布右键菜单(graphMenu)：无

<example href="/examples/#/extension/components/menu" :height="300" ></example>

### 启用菜单

引入组件，启用默认菜单

```ts
import LogicFlow from '@logicflow/core';
import { Menu } from '@logicflow/extension';
import '@logicflow/extension/lib/style.css';

LogicFlow.use(Menu);
```

### 菜单配置项

菜单中的每一项功能，可以用一条配置进行表示。具体字段如下
|字段|类型| 作用| 是否必须|描述|
|:--|:--|:-|:--|:-|
|text|string|文案||菜单项展示的文案|
|className|string|class名称||每一项默认class为lf-menu-item，设置了此字段，calss会在原来的基础上添加className。|
|icon|boolean|是否创建icon的span展位||如果简单的文案不能丰富表示菜单，可以加个icon设置为true,对应的菜单项会增加class为lf-menu-icon的span，通过为其设置背景的方式，丰富菜单的表示，一般与className配合使用。|
|callback|Function|点击后执行的回调|✅|三种菜单回调中分别可以拿到节点数据/边数据/事件信息。|

节点右键菜单删除功能，示例如下：

```ts
{
  text: '删除',
  callback(node) {
    // node为该节点数据
    lf.deleteNode(node.id);
  },
},
```

### 追加菜单选项

通过`lf.addMenuConfig`方法可以在原有菜单的基础上追加新的选项，具体配置示例如下

```ts
import LogicFlow from '@logicflow/core';
import { Menu } from '@logicflow/extension';

// 注册组件
LogicFlow.use(Menu);
// 实例化 Logic Flow
const lf = new LogicFlow({
  container: document.getElementById('app');
});
// 为菜单追加选项（必须在 lf.render() 之前设置）
lf.addMenuConfig({
  nodeMenu: [
    {
      text: '分享',
      callback() {
        alert('分享成功！');
      }
    },
    {
      text: '属性',
      callback(node: any) {
        alert(`
          节点id：${node.id}
          节点类型：${node.type}
          节点坐标：(x: ${node.x}, y: ${node.y})`
        );
      },
    },
  ],
  edgeMenu: [
    {
      text: '属性',
      callback(edge: any) {
        alert(`
          边id：${edge.id}
          边类型：${edge.type}
          边坐标：(x: ${edge.x}, y: ${edge.y})
          源节点id：${edge.sourceNodeId}
          目标节点id：${edge.targetNodeId}`
        );
      },
    },
  ],
  graphMenu: [
    {
      text: '分享',
      callback() {
        alert('分享成功！');
      }
    },
  ],
});
lf.render();
```

### 重置菜单

如果默认菜单中存在不需要的选项，或者无法满足需求，可以通过`lf.setMenuConfig`重置菜单，更换为自定义菜单。

```ts
lf.setMenuConfig({
    nodeMenu: [
      {
        text: '删除',
        callback(node) {
          lf.deleteNode(node.id);
        },
      },
    ], // 覆盖默认的节点右键菜单
    edgeMenu: false, // 删除默认的边右键菜单
    graphMenu: [],  // 覆盖默认的边右键菜单，与false表现一样
  });
```

### 更改菜单选项

> 0.2.3+ 新增

支持通过参数来确定复写还是追加，推荐使用`Menu.changeMenuItem`方法代替以下两种设置方式：

- `lf.addMenuConfig`
- `lf.setMenuConfig`

```ts
const lf = new LogicFlow();

Menu.changeMenuItem(setType, {
  nodeMenu: [
    {
      text: '删除',
        callback(node) {
          lf.deleteNode(node.id);
      },
    },
  ],
})

lf.render();
```

setType 取值如下：

- `add` 追加
- `reset` 复写

### 菜单自由配置

> 从单个节点/边维度，设置其右键菜单，前提条件是需要实现自定义节点/自定义边

- 通过自定义节点，设置其menu，从而为节点设置定制的自定义菜单

  ```ts
  lf.register('custome_node', ({ RectNode, RectNodeModel }) => {
    class CustomeModel extends RectNodeModel {
      constructor(data, graphModel) {
        super(data, graphModel);
        this.stroke = '#1E90FF';
        this.fill = '#F0F8FF';
        this.radius = 10;
        // 右键菜单自由配置，也可以通过节点的properties或者其他属性条件更换不同菜单
        this.menu = [
          {
            className: 'lf-menu-delete',
            icon: true,
            callback(node) {
              const comfirm = window.confirm('你确定要删除吗？');
              comfirm && lf.deleteNode(node.id);
            },
          },
          {
            text: 'edit',
            className: 'lf-menu-item',
            callback(node) {
              lf.editNodeText(node.id);
            },
          },
          {
            text: 'copy',
            className: 'lf-menu-item',
            callback(node) {
              lf.cloneNode(node.id);
            },
          },
        ];
      }
    }
    return {
      view: RectNode,
      model: CustomeModel,
    };
  });
  ```

- 通过自定义边，设置其menu，从而为边设置定制的自定义菜单

```ts
lf.register('custome_edge', ({ PolylineEdge, PolylineEdgeModel }) => {
  class CustomeModel extends PolylineEdgeModel {
    constructor(data, graphModel) {
      super(data, graphModel);
        // 右键菜单自由配置，也可以通过边的properties或者其他属性条件更换不同菜单
      this.menu = [
        {
          className: 'lf-menu-delete',
          icon: true,
          callback(edge) {
            const comfirm = window.confirm('你确定要删除吗？');
            comfirm && lf.deleteEdge(edge.id);
          },
        },
      ];
    }
  }
  return {
    view: PolylineEdge,
    model: CustomeModel,
  };
});
// 设置默认连线的类型为自定义连线类型
lf.setDefaultEdgeType('custome_edge');
```

```css
// css 设置
.lf-menu-delete .lf-menu-item-icon{
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url('./delete.png') no-repeat;
  background-size: 20px;
}
```

### 菜单样式

根据菜单结构中的class覆盖原有样式，设置符合宿主风格的样式。

- 菜单：lf-menu
- 菜单项：lf-menu-item、用户自定义的className
- 菜单项-文案：lf-menu-item-text
- 菜单项-文案：lf-menu-item-icon,需要将菜单项配置icon设置为true
通过对设置这些class，可以覆盖默认样式，美化字体颜色，设置菜单项icon等。

注意，以上介绍的菜单配置必须在 `lf.render()`之前调用。

## 拖拽面板

注册`DndPanel`组件后，Logic Flow 会在画布左上方创建一个拖拽面板，如下所示

<example href="/examples/#/extension/components/dnd-panel"></example>

`DndPanel`组件在 Logic Flow 内置节点的基础上新增了三种类型，分别是`star`（五角星）、`triangle`（三角形）和`hexagon`（六边形），如果只想使用其中的某几个图形，可以通过`setShapeList`方法来实现。

```ts
// 注册插件
LogicFlow.use(DndPanel);

// 示例化 LogicFlow
const lf = new LogicFlow();

// 只保留 rect 和 circle
lf.setShapeList([
  {
    type: 'rect',
    text: '矩形'
  },
  {
    type: 'circle',
    text: '圆形'
  }
]);

lf.render();
```

在上面的代码中，我们通过`setShapeList`方法为 Dnd 组件重新配置了节点列表，目前 Dnd 面板支持的节点如下。

| 名称 | 类型 |
| :- | :- |
| rect | 矩形 |
| circle | 圆形 |
| polygon | 菱形 |
| star | 五角星 |
| triangle | 三角形 |
| hexagon | 六边形 |

## 自定义组件

当内置组件的功能或样式不能满足业务需求时，我们可以根据 Logic Flow 提供的 [API](/api/logicFlowApi.html) 自己实现相应的组件，例如[拖拽示例](/guide/basic/dnd.html)中的拖拽面板。

Logic Flow 维护了一个覆盖在`Graph`之上的组件层，这个组件层会向所包含的组件传递一些数据，如果想要将自己的组件插入到这一层中，我们需要暴露一个含有`install`方法的对象，以便将组件注册进 Logic Flow，除此之外还要提供一个`render`方法，Logic Flow 会将自身实例、内部数据以及组件层 DOM 传入进来。

> 将组件插入内部组件层完全是可选的。

以上文中的拖拽面板为例，其基本结构如下。

```js
// 若开发环境为 Rect
import React from 'react';
import ReactDom from 'react-dom';
import YourApp from 'YourApp.jsx';

const Dnd = {
  install(lf) {},
  render(lf, container) {
    ReactDom.render(<YourApp />, container);
  }
}
```

```js
// 若开发环境为 Vue
import createApp from 'vue';
import YourApp from 'YourApp.vue';

const Dnd = {
  install(lf) {},
  render(lf, container) {
    createApp(YourApp).mount(`#${container.id}`);
  }
}
```

自定义组件的详细案例请参考拖拽面板的实现[源码](https://github.com/didi/LogicFlow/blob/master/packages/extension/src/components/dnd-panel/index.ts)
