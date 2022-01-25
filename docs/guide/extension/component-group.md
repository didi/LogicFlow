# 分组

LogicFlow支持分组，分组是LogicFlow内置的自定义节点。所以开发者可以在分组的基础上，参考自定义节点进行更多场景的自定义。

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

分组节点除了节点本身的属性以外，还有一些属于分组的特殊属性。我们可以在自定义的时候，控制这些属性来实现各种效果的分组。节点本身的属性和方法见[nodeModel](../../api/nodeModelApi.md)

### 状态属性

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------ | :------------- |
| isRestrict | boolean |  ✅ | 是否限制分组子节点拖出分组，默认false |
| resizable  | boolean |  ✅ | 分组是否支持手动调整大小，默认false   |

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

### getAddableOutlineStyle

设置拖动节点到分组上是，分组高亮的提示颜色。

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

## 示例
