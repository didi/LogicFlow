---
nav: API
title: 实例
toc: content
order: 2
---

## **简介**

这篇文档中主要介绍`LogicFlow`各个配置项的类型定义

## 实例相关

### **Common（实例基础配置项）**
| 属性名           | 类型                                                                               | 描述                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| container        | [HTMLElement]('https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement')      | 用于挂载 LogicFlow 画布的 DOM 节点。                                                 |
| width            | numbe （可选）                                                                     | 画布的宽度。                                                                         |
| height           | number （可选）                                                                    | 画布的高度。                                                                         |
| background       | false \| BackgroundConfig （可选）                                                 | 画布的背景配置，可以是 `false` 或者 `BackgroundConfig` 对象。                        |
| grid             | number \| boolean \| GridOptions （可选）                                          | 网格配置，可以是网格大小的数值、布尔值或者 `GridOptions` 对象。                      |
| partial          | boolean （可选）                                                                   | 是否启用局部渲染。                                                                   |
| keyboard         | KeyboardDef （可选）                                                               | 键盘配置。                                                                           |
| style            | Partial<LogicFlow.Theme> （可选）                                                  | 主题样式配置。                                                                       |
| edgeType         | EdgeType （可选）                                                                  | 边的类型。                                                                           |
| adjustEdge       | boolean （可选）                                                                   | 是否允许调整边。                                                                     |
| textMode         | TextMode （可选）                                                                  | 文本模式。                                                                           |
| edgeTextMode     | TextMode （可选）                                                                  | 边文本模式。                                                                         |
| nodeTextMode     | TextMode （可选）                                                                  | 节点文本模式。                                                                       |
| allowRotate      | boolean （可选）                                                                   | 是否允许节点旋转。                                                                   |
| allowResize      | boolean （可选）                                                                   | 是否允许节点缩放。                                                                   |
| isSilentMode     | boolean （可选）                                                                   | 是否为静默模式。在静默模式下，画布中的节点和边不可移动，不可进行文案修改，没有锚点。 |
| stopScrollGraph  | boolean （可选）                                                                   | W是否停止滚动画布。                                                                  |
| stopZoomGraph    | boolean （可选）                                                                   | 是否停止缩放画布。                                                                   |
| stopMoveGraph    | boolean \| 'vertical' \| 'horizontal' \| [number, number, number, number] （可选） | 是否停止移动画布，可以是布尔值、字符串或数组。                                       |
| animation        | boolean \| Partial<`AnimationConfig`> （可选）                                     | 动画配置，可以是布尔值或者 `AnimationConfig` 对象。                                  |
| history          | boolean （可选）                                                                   | 是否启用历史记录。                                                                   |
| outline          | boolean （可选）                                                                   | 是否启用轮廓。                                                                       |
| snapline         | boolean （可选）                                                                   | 是否启用对齐线。                                                                     |
| textEdit         | boolean （可选）                                                                   | 是否启用文本编辑。                                                                   |
| guards           | GuardsConfig （可选）                                                              | 守卫配置。                                                                           |
| overlapMode      | OverlapMode （可选）                                                               | 重叠模式。                                                                           |
| plugins          | ExtensionType[] （可选）                                                           | 插件列表。                                                                           |
| pluginsOptions   | Record<string, any> （可选）                                                       | 插件选项。                                                                           |
| disabledPlugins  | string[] （可选）                                                                  | 禁用的插件列表。                                                                     |
| disabledTools    | string[] （可选）                                                                  | 禁用的工具列表。                                                                     |
| idGenerator      | (type?: string) => string （可选）                                                 | ID 生成器函数。                                                                      |
| edgeGenerator    | EdgeGeneratorType （可选）                                                         | 边生成器函数。                                                                       |
| customTrajectory | (props: CustomAnchorLineProps) => h.JSX.Element （可选）                           | 自定义轨迹函数。                                                                     |
| [key: string]    | unknown                                                                            | 其他自定义属性。                                                                     |


### **BackgroundConfig（背景配置）**
| 属性名           | 类型                                                                                   | 描述                                                |
| ---------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------- |
| backgroundImage  | string （可选）                                                                        | 背景图片地址。                                      |
| backgroundRepeat | 'repeat' \| 'repeat-x' \| 'repeat-y' \| 'no-repeat' \| 'initial' \| 'inherit' （可选） | 背景平铺方式，效果同 CSS `background-repeat` 属性。 |
| [key: string]    | any                                                                                    | 允许扩展额外的CSS样式。                             |

该类型主要用于约束初始化时传入的`background`参数，传入的属性最终会直接作用在`LogicFlow`画布的背景图层`BackgroundOverlay`上。

### **GridOptions（网格配置）**
| 属性名           | 类型                                            | 描述                                                                                |
| ---------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------- |
| size             | number （可选）                                 | 网格格子间距。                                                                      |
| visible          | boolean （可选）                                | 网格是否可见                                                                        |
| type             | 'dot' \| 'mesh' （可选）                        | 网格类型，可选值：`dot` 点状网格                                                    | `mesh` 交叉线网格 |
| config           | { color?: string, thickness?: number } （可选） | 网格线配置                                                                          |
| config.color     | string （可选）                                 | 网格线颜色                                                                          |
| config.thickness | number （可选）                                 | 网格的宽度，对于 `dot` 点状网格，表示点的大小；对于 `mesh` 交叉线网格，表示线的宽度 |

### **KeyboardDef（快捷键参数类型）**
| 属性名             | 类型                                                                             | 描述                                                                                |
| ------------------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| enabled            | boolean                                                                          | 网格格子间距。                                                                      |
| shortcuts          | Array<{ keys: string \| string[], callback: Handler, action?: Action }> （可选） | 网格是否可见                                                                        |
| shortcuts.keys     | string \| string[]                                                               | 网格线配置                                                                          |
| shortcuts.callback | Handler                                                                          | 网格的宽度，对于 `dot` 点状网格，表示点的大小；对于 `mesh` 交叉线网格，表示线的宽度 |
| shortcuts.action   | Action （可选）                                                                  | 网格的宽度，对于 `dot` 点状网格，表示点的大小；对于 `mesh` 交叉线网格，表示线的宽度 |

### **EdgeType（边类型）**
```ts
export type EdgeType = 'line' | 'polyline' | 'bezier' | string
```
定义边的类型，可选值：
- `'line'`：直线
- `'polyline'`：折线
- `'bezier'`：贝塞尔曲线
- `string`：其他自定义类型

### **AnimationConfig（动画配置）**
| 属性名 | 类型    | 描述                 |
| ------ | ------- | -------------------- |
| node   | boolean | 是否对节点启用动画。 |
| edge   | boolean | 是否对边启用动画。   |

### **EdgeGeneratorType（自定义边生成函数）**
``` ts
export type EdgeGeneratorType = (
  sourceNode: LogicFlow.NodeData,
  targetNode: LogicFlow.NodeData,
  currentEdge?: Partial<LogicFlow.EdgeConfig>,
) => any
```
| 属性名      | 类型                                   | 描述                 |
| ----------- | -------------------------------------- | -------------------- |
| sourceNode  | LogicFlow.NodeData                     | 起始节点数据。       |
| targetNode  | LogicFlow.NodeData                     | 目标节点数据。       |
| currentEdge | Partial<LogicFlow.EdgeConfig> （可选） | 当前连线的部分配置。 |

该类型主要用于约束初始化时传入的`edgeGenerator`参数。

例如在创建实例的时候加入下面的代码，就能实现矩形节点连出的边是曲线边，其他节点连出的边是折线边的效果：
``` typescript
edgeGenerator: (sourceNode, targetNode, currentEdge) => {
  // 起始节点类型 rect 时使用bezier
  if (sourceNode.type === 'rect') return 'bezier'
  if (currentEdge) return currentEdge.type
  return 'polyline'
},
```

### **GuardsConfig（守卫函数类型）**
```ts
export interface GuardsConfig {
  beforeClone?: (data: NodeData | GraphData) => boolean
  beforeDelete?: (data: NodeData | EdgeData) => boolean
}
```
| 属性名       | 类型                                              | 描述                                                |
| ------------ | ------------------------------------------------- | --------------------------------------------------- |
| beforeClone  | (data: NodeData \| GraphData) => boolean （可选） | 克隆节点/图形前的拦截函数，返回 `false` 则阻止克隆. |
| beforeDelete | (data: NodeData \| EdgeData) => boolean （可选）  | 删除节点/边前的拦截函数，返回 `false` 则阻止删除。  |


### **AppendConfig（折线边选区信息）**
| 属性名     | 类型           | 描述                                                                   |
| ---------- | -------------- | ---------------------------------------------------------------------- |
| startIndex | number         | 折线边选区起点位置。这表示新元素将相对于现有元素插入的位置。           |
| endIndex   | number         | 折线边选区终点位置。这表示新元素将追加到的位置。                       |
| direction  | Direction      | 折线边选区方向。此属性指定新元素添加的方向，这会影响元素的布局和连接。 |
| draggable  | boolean (可选) | 是否可以拖动选区。这允许 LogicFlow 画布中调整某段折线的位置。          |
| start      | Point          | 选区起点坐标。由 `Point` 类型表示，包括 x 和 y 坐标。                  |
| end        | Point          | 选区终点坐标。与起点相同，也由 `Point` 类型表示。                      |

### **ArrowConfig（箭头配置）**
| 属性名      | 类型   | 描述                                                                                                          |
| ----------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| markerStart | string | 这个属性用来设置箭头起点的样式。通常，它是一个指向 SVG 标记的 URL 或一个预定义的标记类型。                    |
| markerEnd   | string | 这个属性用来设置箭头终点的样式。和 `markerStart` 类似，它也是一个指向 SVG 标记的 URL 或一个预定义的标记类型。 |

### **AttributesType（通用属性类型）**

```typescript
export type AttributesType = Record<string, any>
```
AttributesType 是一个通用类型，允许任何字符串作为键，值可以是任何类型。这提供了一种方法，可以向 LogicFlow 元素附加自定义属性，而不需要提前定义每个可能的属性。

### **RegisterConfig（注册配置）**
`RegisterConfig` 类型定义注册新元素的配置，它包含以下属性：
| 属性名         | 类型                                          | 描述                                                                                                                                    |
| -------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| type           | string                                        | 指定要注册的图元素类型。此字段为必填项。                                                                                                |
| view           | ComponentType<any> & { isObserved?: boolean } | 表示与图元素关联的视图组件。它可以是任何 React 组件类型，并且可以包含一个可选的 `isObserved` 布尔值，指示该组件是否应被观察以检测更改。 |
| model          | GraphElementCtor                              | 定义图元素的模型构造函数。此字段为必填项，应为 `BaseNodeModelCtor` 或 `BaseEdgeModelCtor` 类型。                                        |
| isObserverView | boolean (可选)                                | 指示视图是否为观察者视图。如果设为 `true`，表示视图会响应模型的变化。                                                                   |

### **RegisterElement（注册元素配置）**

`RegisterElement` 类型定义注册新元素类型的配置，它包含以下属性：
| 属性名 | 类型                     | 描述                                                                                           |
| ------ | ------------------------ | ---------------------------------------------------------------------------------------------- |
| view   | React.ComponentType<any> | 表示与元素关联的可视化组件。它可以是任何有效的 React 组件，用于在 LogicFlow 画布上渲染该元素。 |
| model  | any                      | 表示元素的底层数据模型。它定义了元素的行为和属性，使其能够在 LogicFlow 框架内进行交互和操作。  |

### **RegisterElementFunc**

`RegisterElementFunc` 定义了注册元素的函数类型。它接受一个 `params` 参数，该参数包含注册过程中所需的各种属性，并返回一个 `RegisterElement` 对象。

```ts
export type RegisterElementFunc = (params: RegisterParam) => RegisterElement
```

#### 参数

| 参数名 | 类型          | 描述                           |
| ------ | ------------- | ------------------------------ |
| params | RegisterParam | 包含注册过程中所需的各种属性。 |

#### 属性

| 属性名        | 类型     | 描述                                                   |
| ------------- | -------- | ------------------------------------------------------ |
| h             | Function | 用于创建虚拟 DOM 元素的 hyperscript 函数的引用。       |
| [key: string] | any      | 用户定义的其他属性，可包括任何与元素注册相关的键值对。 |

#### 返回值

| 返回值 | 类型                     | 描述                                 |
| ------ | ------------------------ | ------------------------------------ |
| view   | React.ComponentType<any> | 表示元素可视部分的组件。             |
| model  | any                      | 与元素关联的模型，定义其行为和属性。 |

### **RegisterParam**

`RegisterParam` 类型定义了以方法方式注册元素时，方法返回值的类型

```typescript
export type RegisterParam = {
  h: typeof h;
  [key: string]: unknown;
}
```
| 属性名        | 类型     | 描述                                                   |
| ------------- | -------- | ------------------------------------------------------ |
| h             | Function | 用于创建虚拟 DOM 元素的 hyperscript 函数的引用。       |
| [key: string] | any      | 用户定义的其他属性，可包括任何与元素注册相关的键值对。 |

`RegisterParam` 类型通常与 `RegisterElementFunc` 结合使用，以下是 `RegisterParam` 在注册函数中的使用示例：
```typescript
const registerElement: RegisterElementFunc = (params: RegisterParam) => {
  const { h, customProperty } = params;
  // 使用 h 创建虚拟 DOM 元素
  return {
    view: h('div', { className: 'custom-element' }, customProperty),
    model: CustomModel,
  };
};
```


### **BaseNodeModelCtor（基础节点构造函数）**
`BaseNodeModelCtor` 类型是 LogicFlow 框架中用于创建 `BaseNodeModel` 实例的构造函数类型。它主要用于确保任何分配给它的构造函数都符合 `BaseNodeModel` 预期的结构和行为。该类型对于在 LogicFlow 中使用节点模型时维护类型安全性和一致性至关重要。
以下是LogicFlow用`BaseNodeModelCtor`约束渲染数据转换成`nodeModel`的例子：
``` ts
const Model = this.getModel(node.type) as BaseNodeModelCtor
if (!Model) {
  throw new Error(
    `找不到${node.type}对应的节点，请确认是否已注册此类型节点。`,
  )
}
```

### **BaseEdgeModelCtor（基础边构造函数）**
`BaseEdgeModelCtor` 类型是 LogicFlow 框架中用于创建 `BaseEdgeModel` 实例的构造函数类型。它主要在render渲染数据时用来约束转换model的类型，确保任何创建的边模型都符合 `BaseEdgeModel` 规定的结构和行为。
以下是LogicFlow用`BaseEdgeModelCtor`约束渲染数据转换成`edgeModel`的例子：
``` ts
const Model = this.getModel(
  edge.type ?? currEdgeType,
) as BaseEdgeModelCtor
if (!Model) {
  throw new Error(`找不到${edge.type}对应的边。`)
}
```




## 画布相关

### **GraphConfigData（流程图渲染数据类型）**
`GraphConfigData` 是 LogicFlow 流程图渲染数据的类型。

| 属性名 | 类型                          | 描述                                                                                                                                               |
| ------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| nodes  | `NodeConfig[]` \| `undefined` | 一个可选的数组，包含图中节点的配置。每个节点由 [NodeConfig](./nodeConfig.zh.md) 接口定义，包括 `id`、`type`、`x`、`y` 以及其他可选配置。           |
| edges  | `EdgeConfig[]` \| `undefined` | 一个可选的数组，包含图中边的配置。每条边由 [EdgeConfig](./edgeConfig.zh.md) 接口定义，包括 `id`、`sourceNodeId`、`targetNodeId` 以及其他可选配置。 |

### **GraphData（画布数据）**
`GraphData` 是 LogicFlow 渲染数据导出时的数据类型。
```typescript
interface GraphData {
    nodes: NodeData[]; // 图中的节点数组，每个节点由 NodeData 接口定义。
    edges: EdgeData[]; // 图中的边数组，每条边由 EdgeData 接口定义。
}
```

| 属性名 | 类型       | 描述                                                                                                                           |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| nodes  | NodeData[] | 这个属性是一个包含图中所有连接节点的数组。每个节点是 `NodeData` 类型的数据，包括节点 Id 和节点文本。                           |
| edges  | EdgeData[] | 这个属性是一个包含图中所有连接节点的边的数组。每条边是 `EdgeData` 类型的数据，包括源节点和目标节点、边的类型以及任何附加属性。 |

`GraphData` 通常在 `LogicFlow` 框架获取流程图数据时使用。它提供了一种结构化的方法来定义图中元素的关系和属性，确保数据一致且易于管理。


下面是一个使用 `GraphData` 接口的示例：

```typescript
const graphData = lf.getGraphData()
console.log(graphData)
// {
//     nodes: [
//         {
//             id: 'node_1',
//             type: 'rect',
//             x: 100,
//             y: 100,
//             text: {
//                 value: 'Start',
//                 x: 100,
//                 y: 100,
//             },
//         },
//         {
//             id: 'node_2',
//             type: 'circle',
//             x: 300,
//             y: 200,
//             text: {
//                 value: 'End',
//                 x: 300,
//                 y: 200,
//             },
//         },
//     ],
//     edges: [
//         {
//             id: 'edge_1',
//             type: 'polyline',
//             sourceNodeId: 'node_1',
//             targetNodeId: 'node_2',
//         },
//     ],
// };
```

在这个示例调用的`getGraphData` 方法返回了一个GraphData类型的图数据，这个图由一个矩形、一个圆形和一条折线组成


### **GraphElement**
LogicFlow画布上的边和节点统称为元素，`GraphElement` 定义的就是元素的类型，它有两个取值`BaseNodeModel` 或 `BaseEdgeModel`。主要用来约束从画布上取元素信息的返回值，例如`getModelById`接口返回的就是这个类型的数据
```ts
/**
 * 获取节点或边对象
 * @param id id
 */
getModelById(id: string): LogicFlow.GraphElement | undefined {
  return this.graphModel.getElement(id)
}
```

### **GraphElementCtor（画布元素构造函数）**
`GraphElementCtor` 类型是一个联合类型，表示 LogicFlow 框架中图元素的构造函数。它可以是 `BaseNodeModelCtor` 或 `BaseEdgeModelCtor`，用于定义图元素在 LogicFlow 系统中的创建和管理方式。

```typescript
export type GraphElementCtor = BaseNodeModelCtor | BaseEdgeModelCtor;
```


### **Position（坐标类型）**
`Position` 类型是 LogicFlow 框架中的基础类型，用于表示二维空间中的一个点。

| 属性名 | 类型   | 描述                                        |
| ------ | ------ | ------------------------------------------- |
| x      | number | 表示位置的水平坐标，指示点在 x 轴上的位置。 |
| y      | number | 表示位置的垂直坐标，指示点在 y 轴上的位置。 |

### **Point（点类型）**

`Point` 类型表示二维空间中的一个点，LogicFlow中的大部分点数据（例如锚点、起点、终点）都是通过这个类型约束，扩展自 `Position` 类型。它包括以下属性：

| 属性名        | 类型   | 描述                                                          |
| ------------- | ------ | ------------------------------------------------------------- |
| id (可选)     | string | 点的唯一标识符。可以用于在各种操作或数据结构中引用该点。      |
| x             | number | 点在二维空间中的 x 坐标。                                     |
| y             | number | 点在二维空间中的 y 坐标。                                     |
| [key: string] | any    | 允许为 `Point` 类型添加其他属性，提供了灵活性以适应各种用例。 |

### **PointTuple（点坐标组）**
`PointTuple` 类型是一个表示二维空间中点的元组。它由两个数值组成，分别对应点的 x 坐标和 y 坐标。例如获取制定范围内所有元素的函数`getAreaElement`接收的参数`leftTopPoint`、`rightBottomPoint`就是这个类型。

### **PropertiesType（元素属性）**
`PropertiesType`定义了流程图元素properties属性的类型，它包括以下属性：

| 属性名        | 类型                         | 描述                                                                                 |
| ------------- | ---------------------------- | ------------------------------------------------------------------------------------ |
| width         | number (可选)                | 指定元素的宽度。                                                                     |
| height        | number (可选)                | 指定元素的高度。                                                                     |
| rx            | number (可选)                | 定义元素圆角的 x 轴半径。                                                            |
| ry            | number (可选)                | 定义元素圆角的 y 轴半径。                                                            |
| style         | LogicFlow.CommonTheme (可选) | 允许为元素应用通用主题样式。                                                         |
| textStyle     | LogicFlow.CommonTheme (可选) | 允许为元素内的文本应用通用主题样式。                                                 |
| [key: string] | any (可选)                   | 这个索引签名允许向 `PropertiesType` 接口添加任何其他属性，提供了自定义属性的灵活性。 |

### **TextConfig（文本配置）**
`TextConfig` 类型用于定义文本元素的配置。它包括指定文本内容、位置以及编辑和拖动的附加选项的属性。

| 属性名       | 类型                                         | 描述                                                                                                                                                                                 |
| ------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| value        | string                                       | 要显示的实际文本内容。                                                                                                                                                               |
| x            | number                                       | 在画布上定位文本的 x 坐标。                                                                                                                                                          |
| y            | number                                       | 在画布上定位文本的 y 坐标。                                                                                                                                                          |
| editable     | boolean (可选)                               | 一个标志，指示文本是否可以由用户编辑。如果设置为 `true`，文本元素将是可编辑的。                                                                                                      |
| draggable    | boolean (可选)                               | 一个标志，指示文本是否可以在画布上拖动。如果设置为 `true`，文本元素将是可拖动的。                                                                                                    |
| overflowMode | 'default' \| 'autoWrap' \| 'ellipsis' (可选) | 该属性定义文本在超过指定宽度时的行为。<br> - `default`: 无特殊处理，允许溢出。<br> - `autoWrap`: 当文本超过宽度时自动换行。<br> - `ellipsis`: 当文本溢出时在末尾显示省略号 (`...`)。 |

### **ClientPosition（元素位置）**
`ClientPosition` 类型表示在 LogicFlow 应用中事件相对于 DOM 覆盖层和画布覆盖层的位置。这个类型对于准确确定用户交互在图形界面中的发生位置非常重要，它的类型定义如下：

```typescript
export type ClientPosition = {
    domOverlayPosition: Position; // 相对于 DOM 覆盖层的位置
    canvasOverlayPosition: Position; // 相对于画布覆盖层的位置
};
```

| 属性名                | 类型     | 描述                                                    |
| --------------------- | -------- | ------------------------------------------------------- |
| domOverlayPosition    | Position | 表示事件相对于 DOM 覆盖层的位置，包含 `x` 和 `y` 坐标。 |
| canvasOverlayPosition | Position | 表示事件相对于画布覆盖层的位置，包含 `x` 和 `y` 坐标。  |

`ClientPosition` 类型是LogicFlow部分事件返回给外部的数据的格式，例如`lf.graphModel.getPointByClient`方法返回的数据，节点、边、画布的单双击事件和右键点击事件中返回的`position`字段的数据就是这个格式。

## 节点相关

### **NodeConfig（节点配置）**
`NodeConfig` 定义了节点的配置结构。它包含一些关键属性，用于指定节点的特性、位置和行为。以下是 `NodeConfig` 接口中各个属性的详细说明：

| 属性名     | 类型                        | 描述                                                                                                                                         |
| ---------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| id         | string (可选)               | 节点的唯一标识符。此属性用于在 LogicFlow 框架内引用该节点。                                                                                  |
| type       | string                      | 指定节点的类型。此属性是必需的，它决定了节点的渲染方式及其在流程中的行为。                                                                   |
| x          | number                      | 节点在画布上的 x 坐标。此属性对于准确放置节点至关重要。                                                                                      |
| y          | number                      | 节点在画布上的 y 坐标。与 x 坐标类似，该属性同样用于确定节点的位置。                                                                         |
| text       | TextConfig \| string (可选) | 该属性可以是 `TextConfig` 对象或一个字符串，表示要显示在节点上的文本。如果提供 `TextConfig` 对象，则可以更详细地配置文本，包括其位置和样式。 |
| zIndex     | number (可选)               | 决定节点相对于其他节点的堆叠顺序。`zIndex` 值越大，节点的渲染层级越高。                                                                      |
| properties | PropertiesType (可选)       | 可以为节点关联的一组自定义属性，允许对节点的功能或外观进行额外的配置。                                                                       |
| virtual    | boolean (可选)              | 指示节点是否为虚拟节点。虚拟节点的渲染方式可能与标准节点不同，并可用于流程中的特定需求。                                                     |
| rotate     | number (可选)               | 指定节点的旋转角度（单位：度）。该属性允许调整节点的方向。                                                                                   |
| rotatable  | boolean (可选)              | 指示节点是否可以被用户旋转。如果设为 `true`，用户可以交互式地更改节点的旋转角度。                                                            |
| resizable  | boolean (可选)              | 指示节点是否可以被用户调整大小。如果设为 `true`，用户可以交互式地改变节点的尺寸。                                                            |

### **OffsetData(移动偏移)**
`OffsetData` 定义了节点在拖拽时移动偏移值存储的数据结构，详细属性如下：

| 属性名 | 类型   | 描述                                              |
| ------ | ------ | ------------------------------------------------- |
| dx     | number | 表示沿 x 轴的偏移量，指示从给定点水平移动的距离。 |
| dy     | number | 表示沿 y 轴的偏移量，指示从给定点垂直移动的距离。 |

### **FakeNodeConfig（虚拟节点配置）**
`FakeNodeConfig` 类型用于定义 LogicFlow 框架中虚拟节点的配置。虚拟节点通常是在拖拽创建节点过程中作为临时节点占位，在底层数据存储中，主要将节点的`virtual`属性设置为`true`以与真实节点区分。

| 属性名        | 类型                        | 描述                                                                                                                                                             |
| ------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type          | string                      | 这个属性指定虚拟节点的类型。它是一个必填字段，决定节点在 LogicFlow 中的渲染和交互方式。                                                                          |
| text          | TextConfig \| string (可选) | 这个属性可以是 `TextConfig` 对象或简单的字符串。如果是 `TextConfig` 对象，它允许详细配置节点上显示的文本，包括位置和样式选项。如果是字符串，它直接表示节点文本。 |
| properties    | PropertiesType (可选)       | 这个属性主要用于设置虚拟节点关联的自定义属性。它可以包括各种属性，如尺寸、样式等属性。                                                                           |
| [key: string] | unknown                     | 这个索引签名允许添加任何其他可能未明确定义在类型中的属性。这提供了扩展配置的灵活性。                                                                             |

### **VectorData（向量数据）**
`VectorData` 类型用于表示二维空间中的向量，它包含用于定义 x 轴和 y 轴位置变化的属性，具体属性如下：

| 属性名 | 类型   | 描述                                                                                 |
| ------ | ------ | ------------------------------------------------------------------------------------ |
| deltaX | number | 表示 x 坐标的变化量。该值可以是正数或负数，分别表示向右或向左移动。                  |
| deltaY | number | 表示 y 坐标的变化量。类似于 `deltaX`，该值可以是正数或负数，分别表示向上或向下移动。 |

这个属性主要在`resize`模块中约束`resizeNode`方法的入参
```ts
resizeNode = ({ deltaX, deltaY }: VectorData) => {
  const { index } = this
  const { model, graphModel, x, y } = this.props
  handleResize({
    x,
    y,
    deltaX,
    deltaY,
    index,
    nodeModel: model,
    graphModel,
    cancelCallback: () => {
      this.dragHandler.cancelDrag()
    },
  })
}
```

### **DomAttributes（Dom属性）**
`DomAttributes` 类型在 LogicFlow 中主要用于约束节点`getOuterGAttributes`方法的返回值

| 属性名        | 类型                | 描述                                                                                                      |
| ------------- | ------------------- | --------------------------------------------------------------------------------------------------------- |
| className     | string              | 一个可选属性，允许你为 SVG 元素指定一个 CSS 类名。可以用来应用你在 CSS 文件中定义的自定义样式。           |
| [key: string] | string \| undefined | 这个索引签名允许包含 SVG 元素所需的任何其他属性。这些属性可以作为键值对指定，其中键是属性名，值是属性值。 |

下面是一个在 LogicFlow 组件中使用 `DomAttributes` 类型的示例：

```typescript
getOuterGAttributes(): LogicFlow.DomAttributes {
    return {
      className: '',
      fill: '#fff',
      stroke: 'green',
    }
  }
```

在这个示例中，`getOuterGAttributes` 把节点最外层g标签设置为白底绿边框的样式。

## 边相关

### **EdgeConfig（边配置）**

| 属性名         | 类型                        | 描述                                                                      |
| -------------- | --------------------------- | ------------------------------------------------------------------------- |
| id             | string (可选)               | 边的唯一标识符。此属性用于在 LogicFlow 实例中引用边。                     |
| type           | string (可选)               | 指定边的类型。默认类型是 `polyline`。                                     |
| sourceNodeId   | string                      | 标识边的源节点。此属性是必需的，用于确定边的起点。                        |
| sourceAnchorId | string (可选)               | 指定源节点上边的起始锚点。                                                |
| targetNodeId   | string                      | 标识边的目标节点。此属性是必需的，用于确定边的终点。                      |
| targetAnchorId | string (可选)               | 指定目标节点上边的连接锚点。                                              |
| startPoint     | Point (可选)                | 一个 `Point` 类型的对象，定义边的起始坐标。可以用来手动设置边的起始位置。 |
| endPoint       | Point (可选)                | 一个 `Point` 类型的对象，定义边的结束坐标。可以用来手动设置边的结束位置。 |
| text           | string \| TextConfig (可选) | 指定要在边上显示的文本。                                                  |
| pointsList     | Point[] (可选)              | 一个 `Point` 对象数组，定义边上的额外点，允许创建更复杂的形状。           |
| zIndex         | number (可选)               | 确定边相对于其他元素的堆叠顺序。较高的值会使边渲染在较低值的元素之上。    |
| properties     | PropertiesType (可选)       | 一个 `PropertiesType` 类型的对象，允许为边关联额外的自定义属性。          |

### **EdgeData（边数据）**

`EdgeData` 接口扩展了 `EdgeConfig` 接口，表示 LogicFlow 框架中边的数据结构。它包括定义图中边的特性和行为的必需属性。

| 属性名     | 类型                 | 描述                                                                                               |
| ---------- | -------------------- | -------------------------------------------------------------------------------------------------- |
| id         | string               | 边的唯一标识符。此属性对于区分图中的不同边非常重要。                                               |
| type       | string               | 指定边的类型。默认类型通常设置为 "polyline"，但可以根据具体需求定义其他类型。                      |
| text       | TextConfig \| string | 包含与边相关的文本。可以是定义文本属性（如位置和样式）的 `TextConfig` 对象，也可以是简单的字符串。 |
| startPoint | Point                | 表示边的起点。使用包含 x 和 y 坐标的 `Point` 类型定义。                                            |
| endPoint   | Point                | 表示边的终点，也使用 `Point` 类型定义。                                                            |
| pointsList | Point[]              | 表示折线的拐点路径。                                                                               |

以下是一个定义edgeData的例子：
```typescript
const edge: EdgeData = {
  id: 'edge_1',
  type: 'polyline',
  text: {
    value: 'Connection',
    x: 150,
    y: 100,
  },
  startPoint: { x: 100, y: 100 },
  endPoint: { x: 300, y: 200 },
  pointsList: [
    { x: 150, y: 150 },
    { x: 250, y: 150 },
    { x: 150, y: 175 },
    { x: 250, y: 175 },
  ],
};
```

在这个示例中，定义了一条具有唯一 ID、类型、相关文本和指定起点和终点的边，并通过`pointsList`参数约定了折线的路径是Z型。

## 插件相关

### **Extension（插件）**
`Extension` 接口定义了 LogicFlow 框架中扩展的结构和行为。扩展允许开发者通过添加自定义功能或修改现有功能来增强 LogicFlow 的能力。

| 属性名  | 类型                                            | 描述                                                                                                                                            |
| ------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| render  | (lf: LogicFlow, container: HTMLElement) => void | 一个接收两个参数的函数：<br> - `lf`：`LogicFlow` 类的实例，提供对框架核心功能的访问。<br> - `container`：一个 `HTMLElement`，用于渲染扩展内容。 |
| destroy | () => void (可选)                               | 一个函数，在不再需要扩展时调用，以清理资源或移除事件监听器。该函数不接收任何参数。                                                              |

### **ExtensionRenderFunc（插件渲染函数）**
`ExtensionRenderFunc` 类型是 LogicFlow 框架中用于渲染扩展的函数签名。它定义了扩展如何在 LogicFlow 环境中渲染其内容。

```typescript
export type ExtensionRenderFunc = (
    lf: LogicFlow,
    container: HTMLElement,
) => void;
```

| 参数名    | 类型        | 描述                                                                                             |
| --------- | ----------- | ------------------------------------------------------------------------------------------------ |
| lf        | LogicFlow   | `LogicFlow` 类的实例。此参数提供对 LogicFlow API 的访问，使扩展能够与主 LogicFlow 实例进行交互。 |
| container | HTMLElement | 一个 `HTMLElement`，用于渲染扩展的内容。扩展可以操作该 DOM 元素来显示其 UI。                     |

`ExtensionRenderFunc` 通常用于创建 LogicFlow 的扩展。在定义扩展时，可以实现此函数来指定扩展的渲染方式。
以下是一个扩展如何实现 `ExtensionRenderFunc` 的简单示例：

```typescript
const myExtension: ExtensionDefinition = {
    pluginName: 'MyCustomExtension',
    render: (lf, container) => {
        const element = document.createElement('div');
        element.innerHTML = 'Hello from MyCustomExtension!';
        container.appendChild(element);
    },
};
```

### **ExtensionType（插件类型）**
`ExtensionType` 是一个联合类型，表示 LogicFlow 框架中可用的不同形式的扩展。它提供了灵活性，可以支持基于构造函数的扩展和基于对象的扩展定义

```typescript
export type ExtensionType = ExtensionConstructor | ExtensionDefinition;
```

| 组件名               | 描述                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| ExtensionConstructor | 这是一个类构造函数类型，定义了扩展的实例化方式。通常包括 `pluginName`，并且其构造函数接受扩展的属性。 |
| ExtensionDefinition  | 这是基于对象的扩展定义。包含 `pluginName`，并且可以包含可选方法，如 `install` 和 `render`。           |



### **ExtensionConfig（插件配置）**

`ExtensionConfig` 类型用于定义插件的配置。遵循该结构可以确保扩展正确配置，并能够与 LogicFlow 核心功能无缝交互。

| 属性名     | 类型                                        | 描述                                         |
| ---------- | ------------------------------------------- | -------------------------------------------- |
| pluginFlag | Symbol                                      | 用于标识插件的唯一符号。                     |
| extension  | ExtensionConstructor \| ExtensionDefinition | 用于定义扩展的行为和渲染逻辑。               |
| props      | Record<string, any> (可选)                  | 额外的属性记录，可用于向扩展传递自定义配置。 |

```typescript
const myExtensionConfig: LogicFlow.ExtensionConfig = {
  pluginFlag: Symbol('myExtension'),
  extension: myExtension, // 这可以是 ExtensionConstructor 或 ExtensionDefinition 的实例
  props: {
    // 传递给扩展的额外属性
  }
};
```

### **IExtensionProps（插件参数类型）**
`IExtensionProps` 定义了LogicFlow插件入参的类型。它为扩展提供必要的上下文和功能，以便与 LogicFlow 实例进行交互。

| 属性名    | 类型                             | 描述                                                                      |
| --------- | -------------------------------- | ------------------------------------------------------------------------- |
| lf        | `LogicFlow`                      | 该扩展所关联的 `LogicFlow` 类实例。允许扩展访问和操作 LogicFlow 实例。    |
| LogicFlow | `LogicFlowConstructor`           | `LogicFlow` 构造函数的引用。可用于创建新的 LogicFlow 实例或访问静态方法。 |
| props     | `Record<string, unknown>` (可选) | 传递给扩展的额外属性。允许对扩展的行为进行自定义和配置。                  |
| options   | `Record<string, unknown>`        | 一组可用于配置扩展的选项。可能包括扩展功能的特定设置。                    |

### **ExtensionConstructor（插件构造函数）**
`ExtensionConstructor` 定义的是 LogicFlow 插件的构造函数。
| 属性名                       | 类型      | 描述                                                                                                                                                         |
| ---------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| pluginName                   | string    | 该属性保存插件的名称，是必需的字段，用于唯一标识 LogicFlow 生态系统中的扩展。                                                                                |
| new (props: IExtensionProps) | Extension | 这是一个构造函数签名，接受一个 `IExtensionProps` 类型的对象作为参数，并返回一个 `Extension` 接口的实例。`IExtensionProps` 包含为扩展提供上下文和配置的属性。 |

要使用 ExtensionConstructor，通常会定义一个实现该接口的类。以下是一个示例：
``` typescript
class MyCustomExtension implements ExtensionConstructor {
    pluginName = 'MyCustomExtension';

    constructor(props: IExtensionProps) {
        // 使用提供的 props 初始化扩展
    }
}
```

### **ExtensionDefinition（插件定义）**

`ExtensionDefinition` 类型用于为 LogicFlow 框架定义插件。它允许开发者创建自定义扩展，从而增强 LogicFlow 实例的功能。

| 属性名     | 类型                                                            | 描述                                                                                                       |
| ---------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| pluginName | string                                                          | 插件的唯一标识符。此名称用于在 LogicFlow 实例中注册和引用该插件。                                          |
| install    | `(lf: LogicFlow, LFCtor: LogicFlowConstructor) => void`（可选） | 当插件被安装时调用的函数。它接收当前 LogicFlow 实例和其构造函数作为参数，使插件能够与 LogicFlow API 交互。 |
| render     | `ExtensionRenderFunc`（可选）                                   | 定义插件如何渲染其 UI 组件的函数。它接收 LogicFlow 实例和一个容器元素作为参数，允许插件根据需要操作 DOM。  |

**使用方式**

要使用 `ExtensionDefinition` 类型创建新扩展，通常需要定义一个符合该结构的对象。以下是示例：

```typescript
const myCustomExtension: LogicFlow.ExtensionDefinition = {
  pluginName: 'MyCustomExtension',
  install: (lf, LFCtor) => {
    // 插件的初始化代码
  },
  render: (lf, container) => {
    // 插件 UI 的渲染代码
  }
};
```

### **LabelConfig（Label插件数据类型）**
这个类型定义了Label插件支持的渲染数据的结构

| 属性名           | 类型                       | 描述                                                                                            |
| ---------------- | -------------------------- | ----------------------------------------------------------------------------------------------- |
| id               | string (可选)              | 标签的唯一标识符。这个属性对于以编程方式引用标签非常有用。                                      |
| type             | string (可选)              | 指定标签的类型。可以用来区分不同样式或行为的标签。                                              |
| x                | number                     | 标签在流程图二维空间中的 x 坐标。                                                               |
| y                | number                     | 标签在流程图二维空间中的 y 坐标。                                                               |
| content          | string (可选)              | 标签的富文本内容。可以包含 HTML 或其他标记来设置标签的外观。                                    |
| value            | string                     | 标签的纯文本内容。如果不使用富文本，将显示此文本。                                              |
| rotate           | number (可选)              | 标签的旋转角度（以度为单位）。允许以角度显示文本。                                              |
| style            | Record<string, any> (可选) | 自定义 CSS 属性，用于设置标签的样式。可以包括颜色、字体大小和其他视觉属性。                     |
| editable         | boolean (可选)             | 一个布尔值，指示标签是否可以由用户编辑。如果设置为 true，用户可以修改标签的内容。               |
| draggable        | boolean (可选)             | 一个布尔值，指示标签是否可以在流程图中拖动和重新定位。                                          |
| labelWidth       | number (可选)              | 指定标签的宽度。对于控制标签与其他元素的布局非常有用。                                          |
| textOverflowMode | string (可选)              | 定义文本在超出标签宽度时的行为。可能的值包括：`ellipsis`、`wrap`、`clip`、`nowrap`、`default`。 |
| vertical         | boolean (可选)             | 一个布尔值，指示标签是否应垂直渲染。对于特定布局要求非常有用。                                  |

### **LabelOption（Label插件配置项类型）**
`LabelOption` 类型定义了Label插件的的配置设置。以下是类型中包含的属性的详细信息：

| 属性名     | 类型                | 描述                                                                                                 |
| ---------- | ------------------- | ---------------------------------------------------------------------------------------------------- |
| isVertical | boolean             | 指示与节点关联的所有标签是否应垂直显示。如果设置为 `true`，标签将垂直排列；否则，将水平显示。        |
| isMultiple | boolean             | 指定单个节点是否允许多个标签。如果设置为 `true`，用户可以为一个节点添加多个标签。                    |
| maxCount   | number \| undefined | 定义在 `isMultiple` 设置为 `true` 时可以添加到节点的最大标签数。如果未指定，则标签数量可能没有限制。 |

### **MenuConfig（Menu插件菜单项类型）**
`MenuConfig` 定义了Menu插件中菜单项的配置结构。开发者可以遵循类型要求为每个菜单项指定各种属性，从而增强菜单的自定义性和功能性。

| 属性名    | 类型                             | 描述                                                                                                       |
| --------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| text      | string (可选)                    | 菜单项的显示文本，即用户可见的标签。                                                                       |
| className | string (可选)                    | 自定义 CSS 类名，用于为菜单项添加额外的样式。                                                              |
| icon      | boolean (可选)                   | 是否显示图标。如果设为 `true`，则会在菜单文本旁边渲染一个图标。                                            |
| callback  | `(id: string \| number) => void` | 当菜单项被点击时调用的回调函数。该函数接收菜单项的 `id` 作为参数，开发者可以根据选中的菜单项执行特定操作。 |

### **BPMNElements相关类型**

#### DefinitionConfigType（定义配置）
用于批量为多个节点类型注册事件或任务的定义。

| 属性名     | 类型                                          | 描述                                  |
| ---------- | --------------------------------------------- | ------------------------------------- |
| nodes      | string[]                                      | 节点类型名称列表（如 `startEvent`）。 |
| definition | EventDefinitionType[] \| TaskDefinitionType[] | 对应的事件/任务定义数组。             |

#### DefinitionPropertiesType（定义属性）
事件或任务定义携带的业务属性集合。

| 属性名         | 类型   | 描述                                     |
| -------------- | ------ | ---------------------------------------- |
| definitionType | string | 定义类型标识（需要与bpmn元素类型对应）。 |
| [key: string]  | any    | 其他自定义属性。                         |

#### EventDefinitionType（事件定义）
定义事件节点的渲染与序列化行为。

| 属性名        | 类型                          | 描述                                                       |
| ------------- | ----------------------------- | ---------------------------------------------------------- |
| type          | string                        | 定义类型名称（与 `definitionType` 对应）。                 |
| icon          | string \| Record<string, any> | 事件图标定义（支持单个 `path d` 或由多子元素组成的 `g`）。 |
| toJSON        | (data?: unknown) => unknown   | 将事件定义序列化为 JSON 的方法。                           |
| properties    | DefinitionPropertiesType      | 事件默认属性（如中断/非中断、计时器配置等）。              |
| [key: string] | any                           | 其他扩展字段。                                             |

#### TaskDefinitionType（任务定义）
定义任务节点的属性集合。

| 属性名        | 类型   | 描述           |
| ------------- | ------ | -------------- |
| type          | string | 定义类型名称。 |
| [key: string] | any    | 其他扩展字段。 |

#### 示例（类型定义）
```ts
const customDefinition: DefinitionConfigType[] = [
  {
    // 为startEvent、intermediateCatchEvent、boundaryEvent添加definition
    nodes: ['startEvent', 'intermediateCatchEvent', 'boundaryEvent'],
    definition: { // EventDefinitionType类型
      /**
       * definition的type属性，对应XML数据中的节点名
       * 例如一个时间非中断边界事件的XML数据如下：
       * <bpmn:boundaryEvent id="BoundaryEvent_1" cancelActivity="false" attachedToRef="Task_1">
       *  <bpmn:timerEventDefinition>
       *   <bpmn:timeDuration>
       *    P1D
       *   </bpmn:timeDuration>
       *  </bpmn:timerEventDefinition>
       * </bpmn:boundaryEvent>
       */
      type: 'bpmn:timerEventDefinition',
      // icon可以是svg的path路径m, 也可以是@logicflow/core 导出的h函数生成的svg, 这里是通过h函数生成的svg
      icon: timerIcon,
      /**
       * 对应definition需要的属性，例如这里是timerType和timerValue
       * timerType值可以"timeCycle", "timerDate", "timeDuration", 用于区分 <bpmn:timeCycle/>、<bpmn:timeDate/>、<bpmn:timeDuration/>
       * timerValue是timerType对应的cron表达式
       * 最终会生成 `<bpmn:${timerType} xsi:type="bpmn:tFormalExpression">${timerValue}</bpmn:${timerType}>`
       */
      properties: { // DefinitionPropertiesType 类型
        definitionType: 'bpmn:timerEventDefinition',
        timerValue: '',
        timerType: '',
      }
    }
  }
]
```

