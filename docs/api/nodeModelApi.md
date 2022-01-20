# nodeModel

LogicFlow中所有的节点都会有一个nodeModel与其对应。由于数据驱动视图的机制，我们对节点的所有操作事实上就是对model的操作。大多数情况下，我们不建议直接对nodeModel的属性进行赋值操作，而是调用model或者[graphModel](graphModelApi.md)上提供的方法。

:::warning 警告
在对LogicFlow内部源码不熟悉的情况，对model的属性进行赋值操作可能会引起很多不符合预期的问题。例如在model中`x`,`y`表示节点的位置，如果想要移动节点直接修改`x`,`y`的话，会出现节点被移动了，而节点上的文本、节点相连的边都没有动。所以想要移动节点，最好的方法还是调用`graphModel`上的`moveNode`方法来实现。
:::


nodeModel上节点属性有很多，由于用途不一样，我们对其进行了分类。

## 数据属性

节点的数据属性是指LogicFlow图数据是用于标识节点的数据。在流程图保存时一般都只保存节点的数据属性。

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------- | :------------- |
| id    | String |  ✅  | 节点 id|
| type | String | ✅ | 节点类型 |
| x | number | ✅ | 节点中心x轴坐标 |
| y | number | ✅ | 节点中心y轴坐标 |
| text | Object/String  |    | 节点文本 |
| properties | Object |    | 节点业务自定义属性 |

## 状态属性

一般用于自定义节点的时候，基于状态属性进行更细粒度的样式显示。

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------ | :------------- |
| isSelected | boolean |  ✅ | 节点是否被选中        |
| isHovered  | boolean |  ✅ | 节点是否在hover状态   |
| isHitable  | boolean |  ✅ | 节点是否可点击       |
| draggable  | boolean |  ✅ | 节点是否可拖动       |

## 形状属性

LogicFlow的形状属性主要是控制基础节点的主要外观。形状属性可以通过`setAttributes`或者`initNodeData`来设置。具体设置方式见[自定义节点的形状属性](/guide/basic/node.html#自定义节点的形状属性)。

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------ | :------------- |
| width | number |  ✅ | 节点的宽度        |
| height  | number |  ✅ | 高度的高度   |
| radius  | number |   | 矩形节点特有，节点的圆角       |
| r  | number |   | 圆形节点特有，圆的半径。对于圆形节点，会自动基于半径计算出节点的高度和宽度 |
| rx  | number |   | 椭圆节点和菱形节点存在，水平圆角的半径。会自动基于半径计算出节点的宽度 |
| ry  | number |   | 椭圆节点和菱形节点存在，垂直圆角的半径。会自动基于半径计算出节点的高度 |
| points  | [number,number][] |   | 多边形节点特有，多边形顶点。会自定基于顶点计算出节点的宽度和高度 |


## 其它属性

LogicFlow在`model`上还维护一些属性，开发者可以通过这些属性拿到一些信息。例如拿到`graphModel`, 节点的基础`model`类型等。

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------ | :------------- |
| graphModel | object |  ✅ | 整个画布对应的model，[详情见](/api/graphModelApi.html#width) |
| zIndex | number |  ✅ | 节点在z轴的高度，元素重合时，zIndex高的在上面, 默认为1 |
| state | number |  ✅ | 元素状态，不同的状态对应着元素显示效果。DEFAULT = 1 默认显示；TEXT_EDIT = 2 此元素正在进行文本编辑；ALLOW_CONNECT = 4, 此元素允许作为当前边的目标节点；NOT_ALLOW_CONNECT = 5, 此元素不允许作为当前边的目标节点 |
| BaseType |string| ✅ | 当前model的基础类型，对于节点，则固定为`node`。主要用在节点和边混合的时候识别此`model`是节点还是边。 |
| modelType |string| ✅ | 当前model的类型，可取值有`node`, `rect-node`,`circle-node`,`polygon-node`,`ellipse-node`,`diamond-node`, `html-node`,`text-node` |

::: tip modelType与type的区别是什么？

在自定义节点的时候，`type`可以是开发者自定义的任何值，但是在LogicFlow内部，涉及到这个节点的计算时，我们需要感知到这个节点的具体形状，这个时候不能用`type`, 而是要用`modelType`来判断。

:::
## 样式属性

LogicFlow所有的节点最终都是以SVG DOM的方式渲染。但是除了形状属性之外，所有的其他属于svg的属性都不会直接存在`nodeModel`。当开发者想要对SVG DOM添加更多的[svg属性](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute)时，可以通过重写`nodeModel`上获取节点样式属性方法来实现。

## getNodeStyle

支持重写，自定义节点样式属性. 默认为[主题 baseNode](/api/themeApi.html#basenode)

```js
class UserTaskModel extends RectNodeModel {
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = 'blue';
    style.strokDasharray = '3 3';
    return style;
  }
}
```

## getTextStyle

支持重写，自定义节点文本样式属性，默认为[主题 nodeText](/api/themeApi.html#nodetext)

```js
class UserTaskModel extends RectNodeModel {
  getTextStyle() {
    const style = super.getTextStyle();
    style.fontSize = 16;
    return style;
  }
}
```

## getAnchorStyle

支持重写，自定义节点锚点样式属性，默认为[主题 anchor](/api/themeApi.html#anchor)

```js
class UserTaskModel extends RectNodeModel {
  getAnchorStyle() {
    const style = super.getAnchorStyle();
    style.stroke = "rgb(24, 125, 255)";
    style.r = 3;
    style.hover.r = 8;
    style.hover.fill = "rgb(24, 125, 255)";
    style.hover.stroke = "rgb(24, 125, 255)";
    return style;
  }
}
```

## getAnchorLineStyle

支持重写，自定义节点锚点拖出连接线的样式属性，默认为[主题 anchorline](/api/themeApi.html#anchorline)

```js
class UserTaskModel extends RectNodeModel {
  getAnchorLineStyle() {
    const style = super.getAnchorLineStyle();
    style.stroke = "rgb(24, 125, 255)";
    return style;
  }
}
```

### getOutlineStyle

支持重写，自定义节点轮廓框的样式属性，默认为[主题 outline](/api/themeApi.html#outline)

```js
class UserTaskModel extends RectNodeModel {
  getOutlineStyle() {
    const style = super.getOutlineStyle();
    style.stroke = "red";
    style.hover.stroke = "red";
    return style;
  }
}
```

## initNodeData

支持重写，初始化节点数据，将传入的图数据（data）转换为节点属性, 所以需要调用`super.initNodeData`触发转换方法。

- 在`super.initNodeData`之前，对图数据进行处理。
- 在`super.initNodeData`之后，对节点属性进行初始化。

```js
class UserTaskModel extends RectResize.model {
  initNodeData(data) {
    // 可以在super之前，强制设置节点文本位置不居中，而且在节点下面
    if (!data.text || typeof data.text === 'string') {
      data.text = {
        value: data.text || "",
        x: data.x,
        y: data.y + 40,
      };
    }
    super.initNodeData(data);
    this.width = 100;
    this.height = 80;
  }
}
```

::: tip 提示
initNodeData和setAttributes都可以对nodeModel的属性进行赋值，但是两者的区别在于：
- `initNodeData`只在节点初始化的时候调用，用于初始化节点的属性。
- `setAttributes`除了初始化调用外，还会在properties发生变化了调用。

以上面代码为例，由于节点缩放的时候，会更新properties中的缩放后的大小，也就会触发`setAttributes`。如果在`setAttributes`中定义节点的初始大小的话，会导致节点无法缩放。
:::

## setAttributes

设置model形状属性，每次properties发生变化会触发

```js
class UserTaskModel extends RectNodeModel {
  setAttributes() {
    const size = this.properties.scale || 1;
    this.width = 100 * size
    this.height = 80 * size
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

获取被保存时返回的数据。LogicFlow有固定节点数据格式。如果期望在保存数据上添加数据，请添加到properties上。

不支持重写此方法

```js
const nodeModel = lf.getNodeModelById('node_1');
const nodeData = nodeModel.getData();
```

## getProperties

获取节点属性

不支持重写此方法

```js
const nodeModel = lf.getNodeModelById('node_1');
const properties = nodeModel.getProperties();
```

## getDefaultAnchor

重新设置默认锚点, 可以给锚点加上id等自定义属性，用于对锚点的验证。

```ts
class cNode extend RectNodeModel {
  // 定义节点只有左右两个锚点. 锚点位置通过中心点和宽度算出来。
  getDefaultAnchor() {
    const { width, height, x, y, id } = this;
    return [
      {
        x: x - width / 2,
        y,
        name: 'left',
        id: `${id}_0`
      },
      {
        x: x + width / 2,
        y,
        name: 'right',
        id: `${id}_1`
      },
    ]
  }
}
```

## getConnectedSourceRules

获取当前节点作为边的起始节点规则。

支持重写，重写的时候，可以自定义添加额外规则。所有的规则中，有任一规则不满足，则禁止连线。

```ts
class EndNodeModel extends CircleNodeModel {
  getConnectedSourceRules(): ConnectRule[] {
    const rules = super.getConnectedSourceRules();
    const geteWayOnlyAsTarget = {
      message: '结束节点只能连入，不能连出！',
      validate: (source: BaseNodeModel, target: BaseNodeModel, sourceAnchor, targetAnchor) => {
        let isValid = true;
        if (source) {
          isValid = false;
        }
        return isValid;
      },
    };
    rules.push(geteWayOnlyAsTarget);
    return rules;
  }
}
```

## getConnectedTargetRules

获取当前节点作为边的目标节点规则。

支持重写，重写的时候，可以自定义添加额外规则。所有的规则中，有任一规则不满足，则禁止连线。

```js
class StartEventModel extends CircleNodeModel {
  getConnectedTargetRules() {
    const rules = super.getConnectedTargetRules();
    const notAsTarget = {
      message: '起始节点不能作为边的终点',
      validate: () => false,
    };
    rules.push(notAsTarget);
    return rules;
  }
}
```

## setText

设置节点文本

| 名称 | 类型 | 必传 | 描述 |
| :- | :- | :- | :- |
| value | string | - |  文本值 |
| x | number | - | 节点文本x坐标 |
| y | number | - | 节点文本y坐标 |
| draggable | boolean | - | 文本是否可以拖动 |
| editable | boolean | - | 文本是否可以编辑 |

```js
const nodeModel = lf.getNodeModelById('node_1');
nodeModel.setText({
  value: '',
  x: 0,
  y: 0,
  draggable: false,
  editable: true,
})
```


## updateText

修改节点文本内容

参数

| 名称 | 类型 | 必传 | 默认值 | 描述 |
| :- | :- | :- | :- | :- |
| value | string | true | 无 | 文本值 |


```js
const nodeModel = lf.getNodeModelById('node_1');
nodeModel.updateText('hello world');
```

## setZIndex

设置节点zIndex

```js
const nodeModel = lf.getNodeModelById('node_1');
nodeModel.setZIndex(999);
```

## setProperties

设置节点properties

```js
lf.on("node:click", ({ data }) => {
  lf.setProperties(data.id, {
    disabled: !data.properties.disabled,
    scale: 2
  });
});

```