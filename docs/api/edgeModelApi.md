# edgeModel

LogicFlow中所有的边都会有一个edgeModel与其对应。由于数据驱动视图的机制，我们对边的所有操作事实上就是对model的操作。大多数情况下，我们不建议直接对edgeModel的属性进行赋值操作，而是调用model或者[graphModel](graphModelApi.md)上提供的方法。

## 数据属性

边的数据属性是指在LogicFlow流程图保存时，保存边的数据。

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------- | :------------- |
| id    | String |  ✅  | 边 id|
| type | String | ✅ | 边类型 |
| sourceNodeId | string | ✅ | 开始节点Id |
| targetNodeId | string | ✅ | 结束节点Id |
| startPoint | Point | ✅ | 边的开始坐标 |
| endPoint | Point | ✅ | 边的坐标 |
| text | Object/String  |    | 边文本 |
| pointsList | Array  |    | 控制边的轨迹，`polyline`和`bezier`有，`line`没有 |
| properties | Object |    | 边的自定义属性 |

## 状态属性

一般用于自定义边的时候，基于状态属性进行更细粒度的样式显示。

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------ | :------------- |
| isSelected | boolean |  ✅ | 边是否被选中        |
| isHovered  | boolean |  ✅ | 边是否在hover状态   |
| isHitable  | boolean |  ✅ | 边是否可点击       |
| draggable  | boolean |  ✅ | 边是否可拖动       |
| visible  | boolean |  ✅ | 边是否显示, `1.1.0`新增 |

## 形状属性

一般用于自定义边的时候，形状属性可以通过`setAttributes`来设置。

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------ | :------------- |
| offset | number |   | polyline表示折线转折点基于节点的距离。 bezier表示控制曲线调整手柄的长度。|



## 其它属性

LogicFlow在`model`上还维护一些属性，开发者可以通过这些属性拿到一些信息。例如拿到`graphModel`, 节点的基础`model`类型等。

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------ | :------------- |
| graphModel | object |  ✅ | 整个画布对应的model，[详情见](/api/graphModelApi.html#width) |
| zIndex | number |  ✅ | 节点在z轴的高度，元素重合时，zIndex高的在上面。默认为0 |
| state | number |  ✅ | 元素状态，不同的状态对应着元素显示效果。DEFAULT = 1 默认显示；TEXT_EDIT = 2 此元素正在进行文本编辑；ALLOW_CONNECT = 4, 此元素允许作为当前边的目标节点；NOT_ALLOW_CONNECT = 5, 此元素不允许作为当前边的目标节点 |
| BaseType |string| ✅ | 当前model的基础类型，对于边，则固定为`edge`。主要用在节点和边混合的时候识别此`model`是节点还是边。 |
| modelType |string| ✅ | 当前model的类型，可取值有`edge`,`polyline`,`bezier`,`line` |
| sourceAnchorId| string | - | 连线起点锚点id |
| targetAnchorId| string | - | 连线终点锚点id |
| customTextPosition| boolean | - | 自定义连线文本位置 |


## 样式属性

LogicFlow所有的边最终都是以SVG DOM的方式渲染。svg的样式相关属性都不会直接存在`edgeModel`。当开发者想要对SVG DOM添加更多的[svg属性](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute)时，可以通过重写`edgeModel`上获取边样式属性方法来实现。

## getEdgeStyle

支持重写，自定义边文本样式属性. 默认为[主题 baseEdge](/api/themeApi.html#baseedge)

```js
class SequenceFlowModel extends PolylineModel {
  getEdgeStyle() {
    const style = super.getEdgeStyle();
    style.stroke = 'blue';
    style.strokeDasharray = '3 3';
    return style;
  }
}
```

## getTextStyle

支持重写，自定义边文本样式属性，默认为[主题 edgeText](/api/themeApi.html#edgetext)

```js
class SequenceFlowModel extends PolylineModel {
  getTextStyle() {
    const style = super.getTextStyle();
    style.color = 'blue';
    style.fontSize = '20';
    return style;
  }
}
```

## initEdgeData

支持重写，初始化边数据。

```js
class UserEdgeModel extends PolylineEdgeModel {
  initEdgeData(data) {
    super.initEdgeData(data);
    this.offset = 20;
  }
}
```

::: tip 提示
initEdgeData和setAttributes都可以对edgeModel的属性进行赋值，但是两者的区别在于：
- `initEdgeData`只在初始化的时候调用，用于初始化的属性。
- `setAttributes`除了初始化调用外，还会在properties发生变化了调用。

:::


## setAttributes

设置model形状属性，每次properties发生变化会触发

```js
class UserEdgeModel extends PolylineEdgeModel {
  setAttributes(data) {
    super(data);
    this.offset = 20;
  }
}
```

## createId

支持重写，自定义节点id的生成规则. 

::: warning 注意

1. 请保证此方法返回id的唯一性。
2. 此方法为同步方法，如果想要异步修改节点id, 请参考[#272](https://github.com/didi/LogicFlow/issues/272)
:::

```js
import { v4 as uuidv4 } from 'uuid';

class UserTaskModel extends RectNodeModel {
  createId() {
    return uuidv4()
  }
}
```

## getData

获取被保存时返回的数据。LogicFlow有固定边数据格式。如果期望在保存数据上添加数据，请添加到properties上。

不支持重写此方法

```js
const edgeModel = lf.getEdgeModelById('edge_1');
const edgeData = edgeModel.getData();
```

## getProperties

获取边属性

不支持重写此方法

```js
const edgeModel = lf.getEdgeModelById('edge_1');
const properties = edgeModel.getProperties();
```

## setProperties

设置节点properties

```js
const edgeModel = lf.getEdgeModelById('edge_1');
edgeModel.setProperties({
  // 自定义properties
})

```

## setText

设置边文本属性

| 名称 | 类型 | 必传 | 描述 |
| :- | :- | :- | :- |
| value | string | - |  文本值 |
| x | number | - | 边文本x坐标 |
| y | number | - | 边文本y坐标 |
| draggable | boolean | - | 文本是否可以拖动 |
| editable | boolean | - | 文本是否可以编辑 |

```js
const edgeModel = lf.getEdgeModelById('edge_1');
edgeModel.setText({
  value: '',
  x: 0,
  y: 0,
  draggable: false,
  editable: true,
})
```

## updateText

修改边文本内容

参数

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| value | string | true | 无 | 文本值 |


```js
const edgeModel = lf.getEdgeModelById('edge_1');
edgeModel.updateText('hello world');
```

## getTextPosition

支持重写，自定义连线上文本位置。

