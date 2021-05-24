# BaseNodeModel

LogicFlow的自定义节点是基于继承`model`和`view`来实现的，理论上所有的节点都继承自`BaseNodeModel`。因此也可以通过重写`BaseNodeModel`上的部分方法来达到自定义效果。详情请参考[自定义节点](/guide/advance/customNode.html)。

## id

`属性`

节点Id, 请不要直接修改节点Id。 目前节点的Id只能在初始化的时候生成，不能后续修改。

```ts

```

## targetRules

`属性`

作为连线目标节点时的校验规则

## sourceRules

`属性`

作为连线起始节点时的校验规则

## properties

`属性`, `observable`

用于存放非节点基础属性之前的属性，例如业务属性。

## modelType

`属性`

节点形状类型，用于内部或者插件开发时识别节点形状。

## type

`属性`

节点类型名称，用于业务识别节点代表的类型。

例如`bpmn:startEvent`是一个带有业务意义的`type`, 其对应的节点形状类型是`circle`。

## x

`属性`

节点中心在画布所处的水平坐标位置。

## y

`属性`

节点中心在画布所处的垂直坐标位置。

## graphModel

`属性`

[详情](/api/graphModelApi.html)

## width

`属性`

节点宽度

## height

`属性`

节点高度

## isSelected

`属性`

节点是否被选中

## isHovered

`属性`

节点是否被hover

## isHitable

`属性`

节点是否允许用户点击

## draggable

`属性`

节点是否允许拖动

## zIndex

`属性`

## text

`属性`

节点文本

## setAttributes

`方法`

设置节点自定义属性，建议自定义节点的时候，使用此方法来设置model上的属性。

```ts
class cNode extend BaseNodeModel {
  setAttributes() {
    this.width = 100;
  }
}
```

## getData

`方法`

获取节点数据，一般用于获取需要持久化的数据

```ts
class cNode extend BaseNodeModel {
  getData() {
    const d = super.getData()
    console.log(d);
    return d;
  }
}
```

## getProperties

`方法`

获取节点属性

```ts
class cNode extend BaseNodeModel {
  getProperties() {
    const p = super.getProperties()
    console.log(p);
    return d;
  }
}
```

## isAllowConnectedAsSource

`方法`

在连线的时候，是否允许这个节点为source节点，连线到target节点。

```ts
class cNode extend BaseNodeModel {
  isAllowConnectedAsSource(target) {
    return false;
  }
}
```

## getConnectedSourceRules

`方法`

获取当前节点作为连接的起始节点规则。

```ts
class cNode extend BaseNodeModel {
  getConnectedSourceRules() {
    const rules = super.getConnectedSourceRules()
    return rules;
  }
}
```

## isAllowConnectedAsTarget

`方法`

在连线的时候，是否允许这个节点未target节点

## getConnectedTargetRules

`方法`

获取当前节点作为连接的目标节点规则。

## getAnchorsByOffset

`方法`

获取节点锚点的偏移量

```ts
class cNode extend BaseNodeModel {
  getAnchorsByOffset() {
    const offset = super.getAnchorsByOffset()
    return offset;
  }
}
```

## move

`方法`

移动节点,

参数

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| deltaX | number | true | 无 | x轴移动距离 |
| deltaY | number | true | 无 | y轴移动距离 |


## moveTo

`方法`

移动节点到某位置

参数

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| x | number | true | 无 | x坐标 |
| y | number | true | 无 | y坐标 |

## moveText

`方法`

移动节点文本

## updateText

`方法`

修改节点文本内容

参数

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| value | string | true | 无 | 文本值 |

## setSelected

`方法`

设置节点为选择状态

## setHovered

`方法`

设置节点hover状态

## setHitable

`方法`

设置节点是否允许点击

## setProperties

`方法`

设置节点属性

## setZIndex

`方法`

设置节点zIndex
