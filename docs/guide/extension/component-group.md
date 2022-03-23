# 分组

LogicFlow支持分组。分组是LogicFlow内置的自定义节点, 所以开发者可以在分组的基础上，参考自定义节点进行更多场景的自定义。

## 默认分组

```js
import LogicFlow from '@logicflow/core';
import "@logicflow/core/dist/style/index.css";
import { Group } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css'

const lf = new LogicFlow({
  // ...
  plugins: [
    Group
  ]
})
lf.render({
  nodes: [
    {
      type: 'group',
      x: 300,
      y: 300
    }
  ]
})
```

## group的数据格式

`group`对LogicFlow来说是一种特殊的节点，所以其数据格式仍然和节点基本一致。但是相对于普通的节点，`group`节点多了一个`children`属性，用来存储其子节点Id.

```js
lf.render({
  nodes: [
    {
      type: "group",
      x: 400,
      y: 400,
      children: ["rect_2"]
    },
    {
      id: "rect_2",
      type: "circle",
      x: 400,
      y: 400
    }
  ]
})
```

## 自定义分组

在实际业务中，我们建议和自定义节点一样，开发者基于自己的业务自定义分组，然后给分组取个符合自己业务的名字。例如在bpmn中的子分组，取名叫做`subProcess`，然后自定义分组节点的样式。

```js
import { GroupNode } from '@logicflow/extension';

class MyGroup extends GroupNode.view {
}
class MyGroupModel extends GroupNode.model {
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = '#AEAFAE';
    style.strokeDasharray = '3 3';
    style.strokeWidth = 1;
    return style;
  }
}

lf.register({
  type: 'my-group',
  model: MyGroupModel,
  view: MyGroup
})

```

## groupModel的属性和方法

分组节点除了节点本身的属性以外，还有一些属于分组的特殊属性。我们可以在自定义的时候，控制这些属性来实现各种效果的分组。节点本身的属性和方法见[nodeModel](../../api/nodeModelApi.md)。

### 状态属性

| 名称  | 类型   |  描述           |
| :---- | :----- | :------------- |
| isRestrict | boolean | 是否限制分组子节点拖出分组，默认false |
| resizable  | boolean |  分组是否支持手动调整大小，默认false   |
| foldable  | boolean |  分组是否显示展开收起按钮，默认false   |
| width  | number |  分组宽度   |
| height  | number |   分组高度   |
| foldedWidth  | number |  分组折叠后的宽度   |
| foldedHeight  | number |  分组折叠后的高度   |
| isFolded  | boolean |  只读，表示分组是否被折叠。   |
| isGroup  | boolean |  只读，永远为true, 用于识别`model`为`group`。   |

group的属性设置方式和节点一样，可以在`groupModel`的`initNodeData`或`setAttributes`方法中设置。

```js
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

```js
const groupModel = lf.getNodeModelById('group_id');
const node = lf.addNode({
  type: 'rect',
  x: groupModel.x,
  y: groupModel.y
});
groupModel.addChild(node.id);
```

### removeChild

从分组中移除某个子节点。

```js
const groupModel = lf.getNodeModelById('group_id');
groupModel.removeChild('node_id_1');
```

### foldGroup

收起分组, 参数为`true`表示收起分组、false表示展开分组

```js
const groupModel = lf.getNodeModelById('group_id');
groupModel.foldGroup(true);
```

### getAddableOutlineStyle

设置拖动节点到分组上时，分组高亮的提示效果样式。

```js
class MyGroupModel extends GroupNode.model {
  getAddableOutlineStyle() {
    const style = super.getAddableOutlineStyle();
    style.stroke = '#AEAFAE';
    style.strokeDasharray = '3 3';
    return style;
  }
}
```

::: warning 如何阻止节点连接到分组上?
分组是一种特殊的节点，所以仍然可以通过[自定义连接规则校验](http://logic-flow.org/guide/basic/node.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E8%BF%9E%E6%8E%A5%E8%A7%84%E5%88%99%E6%A0%A1%E9%AA%8C)来实现不允许节点和分组直接相连。但是请不要将分组的锚点数量设置为0，因为在分组被折叠时，会通过分组的锚点与外部节点相连来表示分组内部节点与外部节点的关系。
:::


## 示例

<iframe src="https://codesandbox.io/embed/bold-moore-vgvpf?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="bold-moore-vgvpf"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

::: tip 关于泳道
分组功能不是泳道，需要开发者在分组的基础上自己实现。后续LogicFlow提供的Bpmn全功能支持会支持BPMN泳道。也欢迎自己实现了的同学给我们PR。
:::