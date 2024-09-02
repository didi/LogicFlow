---
nav: API
title: nodeModel
toc: content
order: 1
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

LogicFlow 中所有的节点都会有一个 nodeModel 与其对应。由于数据驱动视图的机制，我们对节点的所有操作事实上就是对
model 的操作。大多数情况下，我们不建议直接对 nodeModel 的属性进行赋值操作，而是调用 model
或者 [graphModel](./graphModel.zh.md) 上提供的方法。

:::error{title=警告}
在对 LogicFlow 内部源码不熟悉的情况下，对 model 的属性进行赋值操作可能会引起很多不符合预期的问题。例如在
model 中`x`,`y`表示节点的位置，如果想要移动节点直接修改`x`,`y`
的话，会出现节点被移动了，而节点上的文本、节点相连的边都没有动。所以想要移动节点，最好的方法还是调用`graphModel`
上的`moveNode`方法来实现。
:::

nodeModel 上节点属性有很多，由于用途不一样，我们对其进行了分类。

## 数据属性

节点的数据属性是指 LogicFlow 图数据是用于标识节点的数据。在流程图保存时一般都只保存节点的数据属性。

| 名称         | 类型                | 是否必须 | 描述                  |
|:-----------|:------------------|:-----|:--------------------|
| id         | string            | ✅    | 节点 id               |
| type       | string            | ✅    | 节点类型                |
| x          | number            | ✅    | 节点中心 x 轴坐标          |
| y          | number            | ✅    | 节点中心 y 轴坐标          |
| text       | TextObject/string |      | 节点文本                |
| properties | Object            |      | 包含节点样式、形状属性和业务自定义属性 |

**TextObject**

| 名称        | 类型      | 是否必须 | 描述                       |
|:----------|:--------|:-----|:-------------------------|
| value     | string  |      | 文本内容                     |
| x         | number  | ✅    | 文本中心 x 轴坐标               |
| y         | number  | ✅    | 文本中心 y 轴坐标               |
| draggable | boolean | ✅    | 文本是否允许被拖动调整位置，保存时不会保存此属性 |
| editable  | boolean | ✅    | 文本是否允许被双击编辑，保存时不会保存此属性   |

## 状态属性

一般用于自定义节点的时候，基于状态属性进行更细粒度的样式显示。

| 名称           | 类型      | 是否必须 | 描述              |
|:-------------|:--------|:-----|:----------------|
| isSelected   | boolean | ✅    | 节点是否被选中         |
| isHovered    | boolean | ✅    | 节点是否在 hover 状态  |
| isHitable    | boolean | ✅    | 节点是否可点击         |
| draggable    | boolean | ✅    | 节点是否可拖动         |
| isShowAnchor | boolean | ✅    | 是否显示锚点          |
| isDragging   | boolean | ✅    | 是否在拖动           |
| visible      | boolean | ✅    | 是否显示, `1.1.0`新增 |

## 形状属性

LogicFlow 的形状属性主要是控制基础节点的主要外观。形状属性可以通过`setAttributes`或者`initNodeData`
来设置。具体设置方式见[自定义节点的形状属性](../../tutorial/basic/node.zh.md#2-形状属性)。

| 名称     | 类型                | 是否必须 | 描述                                    |
|:-------|:------------------|:-----|:--------------------------------------|
| width  | number            | ✅    | 节点的宽度                                 |
| height | number            | ✅    | 高度的高度                                 |
| radius | number            |      | 矩形节点特有，节点的圆角                          |
| r      | number            |      | 圆形节点特有，圆的半径。对于圆形节点，会自动基于半径计算出节点的高度和宽度 |
| rx     | number            |      | 椭圆节点和菱形节点存在，水平圆角的半径。会自动基于半径计算出节点的宽度   |
| ry     | number            |      | 椭圆节点和菱形节点存在，垂直圆角的半径。会自动基于半径计算出节点的高度   |
| points | [number,number][] |      | 多边形节点特有，多边形顶点。会自定基于顶点计算出节点的宽度和高度      |

## 其它属性

LogicFlow 在`model`上还维护一些属性，开发者可以通过这些属性拿到一些信息。例如拿到`graphModel`,
节点的基础`model`类型等。

| 名称          | 类型                     | 是否必须 | 描述                                                                                                                                        |
|:------------|:-----------------------|:-----|:------------------------------------------------------------------------------------------------------------------------------------------|
| graphModel  | GraphModel             | ✅    | 整个画布对应的 model，详情见[graphModelApi](./graphModel.zh.md)                                                                                        |
| zIndex      | number                 | ✅    | 节点在 z 轴的高度，元素重合时，zIndex 高的在上面, 默认为 1                                                                                                      |
| state       | number                 | ✅    | 元素状态，不同的状态对应着元素显示效果。DEFAULT = 1 默认显示；TEXT_EDIT = 2 此元素正在进行文本编辑；ALLOW_CONNECT = 4, 此元素允许作为当前边的目标节点；NOT_ALLOW_CONNECT = 5, 此元素不允许作为当前边的目标节点 |
| BaseType    | string                 | ✅    | 当前 model 的基础类型，对于节点，则固定为`node`。主要用在节点和边混合的时候识别此`model`是节点还是边。                                                                             |
| modelType   | string                 | ✅    | 当前 model 的类型，可取值有`node`, `rect-node`,`circle-node`,`polygon-node`,`ellipse-node`,`diamond-node`, `html-node`,`text-node`                  |
| moveRules   | `Model.NodeMoveRule[]` |      | 节点被移动之前的校验规则                                                                                                                              |
| sourceRules | `Model.ConnectRule[]`  |      | 节点连接其它节点时的校验规则                                                                                                                            |
| targetRules | `Model.ConnectRule[]`  |      | 节点被其它节点连接时的校验规则                                                                                                                           |
| autoToFront | boolean                | ✅    | 控制节点选中时是否自动置顶，默认为 true.                                                                                                                   |
| incoming    | object                 | ✅    | 进入当前节点的所有边和节点，`v1.1.4`                                                                                                                    |
| outgoing    | object                 | ✅    | 离开当前节点的所有边和节点, `v1.1.4`                                                                                                                   |
| virtual     | boolean                | -    | 是否为虚拟节点，默认 false。当为 true 时导出数据不会包含此元素。 `v1.1.24`                                                                                          |

:::info{title=modelType与type的区别是什么?}
在自定义节点的时候，`type`可以是开发者自定义的任何值，但是在 LogicFlow
内部，涉及到这个节点的计算时，我们需要感知到这个节点的具体形状，这个时候不能用`type`,
而是要用`modelType`来判断。
:::

## 样式属性

LogicFlow 所有的节点最终都是以 SVG DOM 的方式渲染。但是除了形状属性之外，所有的其他属于 svg
的属性都不会直接存在`nodeModel`。当开发者想要对 SVG DOM
添加更多的 <a href="https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute" target="_blank">svg 属性</a>
时，可以通过重写`nodeModel`上获取节点样式属性方法来实现。

## 方法

### getNodeStyle

支持重写，自定义节点样式属性，默认为[主题 baseNode](../theme.zh.md#basenode)

```tsx | pure
class UserTaskModel extends RectNodeModel {
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = "blue";
    style.strokeDasharray = "3 3";
    return style;
  }
}
```

### getTextStyle

支持重写，自定义节点文本样式属性，默认为[主题 nodeText](../theme.zh.md#nodetext)

```tsx | pure
class UserTaskModel extends RectNodeModel {
  getTextStyle() {
    const style = super.getTextStyle();
    style.fontSize = 16;
    return style;
  }
}
```

### getAnchorStyle

支持重写，自定义节点锚点样式属性，默认为[主题 anchor](../theme.zh.md#anchor)

```tsx | pure
class UserTaskModel extends RectNodeModel {
  getAnchorStyle(anchorInfo) {
    const style = super.getAnchorStyle(anchorInfo);
    style.stroke = "rgb(24, 125, 255)";
    style.r = 3;
    style.hover.r = 8;
    style.hover.fill = "rgb(24, 125, 255)";
    style.hover.stroke = "rgb(24, 125, 255)";
    return style;
  }
}
```

### getAnchorLineStyle

支持重写，自定义节点锚点拖出连接线的样式属性，默认为[主题 anchorline](../theme.zh.md#anchorline)

```tsx | pure
class UserTaskModel extends RectNodeModel {
  getAnchorLineStyle(anchorInfo) {
    const style = super.getAnchorLineStyle();
    style.stroke = "rgb(24, 125, 255)";
    return style;
  }
}
```

### getOutlineStyle

支持重写，自定义节点轮廓框的样式属性，默认为[主题 outline](../theme.zh.md#outline)

```tsx | pure
class UserTaskModel extends RectNodeModel {
  getOutlineStyle() {
    const style = super.getOutlineStyle();
    style.stroke = "red";
    style.hover.stroke = "red";
    return style;
  }
}
```

### initNodeData

支持重写，初始化节点数据，将传入的图数据（data）转换为节点属性, 所以需要调用`super.initNodeData`触发转换方法。

- 在`super.initNodeData`之前，对图数据进行处理。
- 在`super.initNodeData`之后，对节点属性进行初始化。

```tsx | pure
class UserTaskModel extends RectResize.model {
  initNodeData(data) {
    // 可以在super之前，强制设置节点文本位置不居中，而且在节点下面
    if (!data.text || typeof data.text === "string") {
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

:::info{title=提示}
initNodeData 和 setAttributes 都可以对 nodeModel 的属性进行赋值，但是两者的区别在于：<br>

- `initNodeData`只在节点初始化的时候调用，用于初始化节点的属性。
- `setAttributes`除了初始化调用外，还会在 properties 发生变化了调用。
  :::

以上面代码为例，由于节点缩放的时候，会更新 properties 中的缩放后的大小，也就会触发`setAttributes`
。如果在`setAttributes`中定义节点的初始大小的话，会导致节点无法缩放。

### setAttributes

设置 model 形状属性，每次 properties 发生变化会触发

```tsx | pure
class UserTaskModel extends RectNodeModel {
  setAttributes() {
    const size = this.properties.scale || 1;
    this.width = 100 * size;
    this.height = 80 * size;
  }
}
```

### createId

支持重写，自定义节点 id 的生成规则.

:::warning{title=注意}

1. 请保证此方法返回 id 的唯一性。<br>
2. 此方法为同步方法，如果想要异步修改节点 id,
   请参考 <a href="https://github.com/didi/LogicFlow/issues/272" target="_blank">issues</a>。
   :::

```tsx | pure
import { v4 as uuidv4 } from "uuid";

class UserTaskModel extends RectNodeModel {
  createId() {
    return uuidv4();
  }
}
```

### formatText

初始化文本

参数 `data: LogicFlow.NodeConfig`

```tsx | pure
class UserTaskModel extends RectNodeModel {
  formatText(data: LogicFlow.NodeConfig) {
    console.log('data', data);
    const defaultText = {
      value: '',
      x: data.x,
      y: data.y,
      draggable: false,
      editable: true,
    }
    if (!data.text) {
      data.text = { ...defaultText }
    } else {
      if (typeof data.text === 'string') {
        data.text = {
          ...defaultText,
          value: data.text,
        }
      }
      // ...
    }
  }
}
```

### getData

获取被保存时返回的数据。LogicFlow 有固定节点数据格式。如果期望在保存数据上添加数据，请添加到 properties
上。

不支持重写此方法

```tsx | pure
const nodeModel = lf.getNodeModelById("node_1");
const nodeData = nodeModel.getData();
```

### getProperties

获取节点属性

不支持重写此方法

```tsx | pure
const nodeModel = lf.getNodeModelById("node_1");
const properties = nodeModel.getProperties();
```

### getDefaultAnchor

重新设置默认锚点, 可以给锚点加上 id 等自定义属性，用于对锚点的验证。

```tsx | pure
class cNode extends RectNodeModel {
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
        id: `${id}_1`,
        edgeAddable: false
      },
    ]
  }
}
```

锚点属性

| 名称          | 类型      | 是否必须 | 描述                     |
|:------------|:--------|:-----|:-----------------------|
| x           | number  | ✅    | 锚点 x 坐标                |
| y           | number  | ✅    | 锚点 y 坐标                |
| id          | string  | ✅    | 锚点 id                  |
| edgeAddable | boolean | ✅    | 是否允许此锚点手动创建连线，默认为 true |

### getConnectedSourceRules

获取当前节点作为边的起始节点规则。

支持重写，重写的时候，可以自定义添加额外规则。所有的规则中，有任一规则不满足，则禁止连线。

```tsx | pure
class EndNodeModel extends CircleNodeModel {
  getConnectedSourceRules(): ConnectRule[] {
    const rules = super.getConnectedSourceRules();
    const geteWayOnlyAsTarget = {
      message: "结束节点只能连入，不能连出！",
      validate: (
        source: BaseNodeModel,
        target: BaseNodeModel,
        sourceAnchor,
        targetAnchor
      ) => {
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

### getConnectedTargetRules

获取当前节点作为边的目标节点规则。

支持重写，重写的时候，可以自定义添加额外规则。所有的规则中，有任一规则不满足，则禁止连线。

```tsx | pure
class StartEventModel extends CircleNodeModel {
  getConnectedTargetRules() {
    const rules = super.getConnectedTargetRules();
    const notAsTarget = {
      message: "起始节点不能作为边的终点",
      validate: () => false,
    };
    rules.push(notAsTarget);
    return rules;
  }
}
```

### isAllowMoveNode

是否允许移动节点

参数 `deltaX: number, deltaY: number`

返回值 `boolean | Model.IsAllowMove`

```tsx | pure
class UserTaskModel extends RectNodeModel {
  isAllowMoveNode(deltaX: number, deltaY: number) {
    let isAllowMoveX = true
    let isAllowMoveY = true
    // 处理
    return {
      x: isAllowMoveX,
      y: isAllowMoveY,
    }
  }
}

```

### isAllowConnectedAsSource

在连接边时，是否允许这个节点为 source 节点，边到 target 节点

参数
| 名称 | 类型 | 是否必填 | 描述 |
| ------| -------------- | --- | -- |
| target | `BaseNodeModel` | ✅ | 目标节点 |
| sourceAnchor | `Model.AnchorConfig` | ✅ | 源锚点 |
| targetAnchor | `Model.AnchorConfig` | ✅ | 目标锚点 |
| edgeId | `string` | - | 调整后边的 id |

返回值 `LogicFlow.ConnectRuleResult` <a href="https://github.com/didi/LogicFlow/issues/926#issuecomment-1371823306" target="_blank">详见issues</a>

### isAllowConnectedAsTarget

在连线时，判断是否允许这个节点为 target 节点

参数
| 名称 | 类型 | 是否必填 | 描述 |
| ------| -------------- | --- | -- |
| source | `BaseNodeModel` | ✅ | 源节点 |
| sourceAnchor | `Model.AnchorConfig` | ✅ | 源锚点 |
| targetAnchor | `Model.AnchorConfig` | ✅ | 目标锚点 |
| edgeId | `string` | - | 调整后边的 id |

返回值 `LogicFlow.ConnectRuleResult`
<a href="https://github.com/didi/LogicFlow/issues/926#issuecomment-1371823306" target="_blank">详见issues</a>

### getRotateControlStyle

获取当前节点旋转控制点的样式

```tsx | pure
getRotateControlStyle()
```

### getTargetAnchor

获取目标锚点

入参：`position: LogicFlow.Point`

返回值：`BaseNodeModel.AnchorInfo`

### anchors

获取锚点

返回值： `LogicFlow.Point[]`

```tsx | pure
const { anchors } = node
```

### getAnchorInfo

获取锚点信息

入参：`anchorId?: string`

### updateText

修改节点文本内容

参数

| 名称    | 类型     | 必传   | 默认值 | 描述  |
|:------|:-------|:-----|:----|:----|
| value | string | true | 无   | 文本值 |

```tsx | pure
const nodeModel = lf.getNodeModelById("node_1");
nodeModel.updateText("hello world");
```

### setZIndex

设置节点 zIndex

```tsx | pure
const nodeModel = lf.getNodeModelById("node_1");
nodeModel.setZIndex(999);
```

### setProperties

设置节点 properties

```tsx | pure
lf.on("node:click", ({ data }) => {
  lf.getNodeModelById(data.id).setProperties({
    disabled: !data.properties.disabled,
    scale: 2,
  });
});
```

### setProperty

设置节点 property

入参 `key: string, value: unknown`

### deleteProperty

删除节点的某个属性

```tsx | pure
lf.on("node:click", ({ data }) => {
  lf.getNodeModelById(data.id).deleteProperty("disabled");
  lf.getNodeModelById(data.id).deleteProperty("scale");
});
```

### moveText

移动文本

入参：`deltaX: number, deltaY: number`

### moveTo

移动到

入参：`x: number, y: number, isIgnoreRule: boolean = false`

返回值：`boolean`

```tsx | pure
this.node.moveTo(200, 100)
```

### move

移动

入参：`deltaX: number, deltaY: number, isIgnoreRule: boolean = false`

返回值：`boolean`

```tsx | pure
this.move(0, 24 / 2);
```

### getMoveDistance

获取移动距离

入参：`deltaX: number, deltaY: number, isIgnoreRule: boolean = false`

返回值：`Model.VectorType`

### setSelected

设置 Selected

入参：`isSelected: boolean = true`

```tsx | pure
  this.node.setSelected(true);
```

### setHovered

设置 Hovered

入参：`isHovered: boolean = true`

### setHittable

设置 Hittable

入参：`isHittable: boolean`

### setIsShowAnchor

设置是否显示锚点

入参：`isShowAnchor: boolean = true`

### updateAttributes

更新属性

入参：`attributes: LogicFlow.AttributesType`

### setElementState

设置 Node | Edge 等 model 的状态

入参：`state: ElementState, additionStateData?: Model.AdditionStateDataType | undefined,`

### setStyle

设置 Style

入参：`key: string, value: unknown`

### setStyles

设置 Styles

入参：`styles: LogicFlow.CommonTheme`

### updateStyles

更新 Styles

入参：`styles: LogicFlow.CommonTheme`

### setEnableRotate

设置启用旋转

入参：`flag: boolean`
