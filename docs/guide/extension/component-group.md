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

在实际业务中，我们建议和自定义节点一样，开发者基于自己的业务自定义分组，然后给分组取个符合自己业务的名字。例如在bpmn中的子分组，取名叫做`subProcess`。

```js
import { GroupNode } from '@logicflow/extension';

class MyGroup extends GroupNode.view {
}

class MyGroupModel extends GroupNode.model {
  initNodeData(data) {
    super.initNodeData(data);
    this.isRestrict = true;
    this.resizable = true;
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = '#AEAFAE';
    style.strokeDasharray = '3 3';
    style.strokeWidth = 1;
    return style;
  }
  getOutlineStyle() {
    const style = super.getOutlineStyle();
    style.stroke = 'transparent';
    style.hover.stroke = 'transparent';
    return style;
  }
}


lf.register({
  type: 'my-group',
  model: MyGroupModel,
  view: MyGroup
})
```

### 