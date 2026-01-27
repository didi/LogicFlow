---
nav: 指南
group:
  title: 插件功能
  order: 3
title: BPMN 插件
order: 11
toc: content
---

<p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder;">
  BPMN（Business Process Model and Notation）是一套由 OMG 制定、广泛应用于企业级流程建模的规范，用于以标准化方式描述业务流程的执行逻辑。
<p>

## 简介
LogicFlow 提供 BPMN 插件，用于在画布上构建符合 BPMN 语义的流程建模体验。通过该插件，用户可以：
- 可视化绘制符合 BPMN 规范的流程图
- 导出为符合 BPMN 2.0 的 XML
- 在 Activiti、Flowable、Camunda 等 BPMN 引擎中直接执行或进一步配置

目前 LogicFlow 提供两版 BPMN 插件，以满足不同复杂度和定制需求的使用场景：
| 版本   | 目标场景         | 对应插件与功能描述                                                                                                                                                                                    |
| ------ | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 基础版 | 简单流程快速落地 | `bpmnElement`：注册基础 BPMN 流程节点，用于绘制简单流程；<br/>`bpmnAdapter`：提供基础的 BPMN 数据导入与导出能力，支持 LogicFlow 流程数据与 BPMN XML 之间的基本映射与转换                              |
| 扩充版 | 复杂流程定制     | `BPMNElements`：增加 6 种节点，进一步扩展 BPMN 元素支持；<br/>`bpmnElementsAdapter`：提供更多可配置参数，支持在导入、导出和数据映射过程中进行更细粒度的自定义适配，以满足不同流程引擎或业务规范的需求 |

:::info{title=温馨提示}
LogicFlow 内置的 BPMN 插件主要用于**基础能力演示与快速上手**，仅覆盖少量常用的 BPMN 元素，不支持复杂的 BPMN 扩展元素及自定义属性配置。

在实际业务项目中，更推荐开发者基于自身业务场景，自行定义项目所需的节点类型与数据结构，并实现对应的数据导入、导出与转换逻辑，而非直接、完整地套用内置提供的 bpmnElement 与 bpmnAdapter 插件。

对于流程复杂度较高、对 BPMN 语义或 XML 结构有定制需求的场景，建议以官方提供的 bpmnElement 与 bpmnAdapter 作为实现参考，在本地重新实现一套更贴合自身产品需求的节点体系与数据格式转换插件。

LogicFlow 的初衷之一，是希望前端能够在代码层面完整、清晰地表达业务逻辑，而不是将关键业务规则封装进不可控的第三方实现中。我们希望通过这种方式，使前端研发更贴近业务本身，同时也为复杂场景下的灵活扩展预留足够空间。
:::

## bpmnElement 插件

bpmnElement 插件提供基础的 BPMN 元素注册功能，用于在 LogicFlow 画布中绘制符合 BPMN 规范的节点。

### 节点说明
bpmnElement 插件在挂载过程中会注册如下 6 种 BPMN 元素：

<div style="height: 40px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 24px;">
    <span style="font-size: 14px;">开始节点（bpmn:startEvent）</span>
  <p>
</div>

**视图样式**

<div style="width: 100%; display: flex; justify-content: center;">
  <img src="https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/article/extension/bpmn/startEvent.png" style="height: 120px; border-radius: 10px; box-shadow: 0 0 20px #dfecf9ff" alt="开始节点" />
</div>

- 继承内置圆形节点 CircleNode 的圆形
- 文本：初始化传入 `text` 时，默认位于节点下方 40 像素
- 通过重写 setAttributes 将半径固定为 18

**其他细节**

- 默认 ID 生成规则为 Event_${随机数}
- 重写 getConnectedTargetRules，不可作为连线终点，仅可作为起点
- 实现细节见: [StartEvent](https://github.com/didi/LogicFlow/blob/master/packages/extension/src/bpmn/events/StartEvent.ts)

<div style="height: 40px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 24px;">
    <span style="font-size: 14px;">结束节点（bpmn:endEvent）</span>
  <p>
</div>

**视图样式**

<div style="width: 100%; display: flex; justify-content: center;">
  <img src="https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/article/extension/bpmn/endEvent.png" style="height: 100px; border-radius: 10px; box-shadow: 0 0 20px #dfecf9" alt="结束节点" />
</div>

- 继承内置圆形节点 CircleNode 的圆形
- 文本：初始化传入 `text` 时，默认位于节点下方 40 像素
- 通过重写 setAttributes 将半径固定为 18

**其他细节**

- 默认 ID 生成规则为 Event_${随机数}
- 重写 getConnectedSourceRules，不可作为连线起点
- 重写 getShape 绘制同心双圈
- 实现细节见: [EndEvent](https://github.com/didi/LogicFlow/blob/master/packages/extension/src/bpmn/events/EndEvent.ts)

<div style="height: 40px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 24px;">
    <span style="font-size: 14px;">用户任务（bpmn:userTask）</span>
  <p>
</div>

**视图样式**

<div style="width: 100%; display: flex; justify-content: center;">
  <img src="https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/article/extension/bpmn/userTask.png" style="height: 100px; border-radius: 10px; box-shadow: 0 0 20px #dfecf9ff" alt="用户任务节点" />
</div>

- 继承内置矩形节点 RectNode 的圆角矩形
- 重写 getShape，叠加用 SVG path 绘制的用户图标
- 图标位置为距左上角内偏移 5 像素
- 图标颜色跟随节点 `stroke` 样式变化

**其他细节**

- 默认 ID 生成规则为 Activity_${随机数}
- 实现细节见: [UserTask](https://github.com/didi/LogicFlow/blob/master/packages/extension/src/bpmn/tasks/UserTask.ts)

<div style="height: 40px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 24px;">
    <span style="font-size: 14px;">系统任务（bpmn:serviceTask）</span>
  <p>
</div>

**视图样式**

<div style="width: 100%; display: flex; justify-content: center;">
  <img src="https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/article/extension/bpmn/serviceTask.png" style="height: 100px; border-radius: 10px; box-shadow: 0 0 20px #dfecf9" alt="系统任务节点" />
</div>

- 继承内置矩形节点 RectNode 的圆角矩形
- 重写 getShape，叠加用 SVG path 绘制的服务图标
- 图标位置为距左上角内偏移 5 像素
- 图标颜色跟随节点 `stroke` 样式变化

**其他细节**

- 默认 ID 生成规则为 Activity_${随机数}
- 实现细节见: [ServiceTask](https://github.com/didi/LogicFlow/blob/master/packages/extension/src/bpmn/tasks/ServiceTask.ts)

<div style="height: 40px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 24px;">
    <span style="font-size: 14px;">互斥网关（bpmn:exclusiveGateway）</span>
  <p>
</div>

**视图样式**

<div style="width: 100%; display: flex; justify-content: center;">
  <img src="https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/article/extension/bpmn/exclusiveGateway.png" style="height: 100px; border-radius: 10px; box-shadow: 0 0 20px #dfecf9" alt="互斥网关节点" />
</div>

- 继承内置菱形节点 PolygonNode 的菱形
- 初始化传入 `text` 时，标签默认位于节点下方 40 像素
- 默认设置为由四个顶点 `[25,0] [50,25] [25,50] [0,25]` 构成
- 重写 `getShape` 绘制内部互斥路径标记

**其他细节**

- 默认 ID 生成规则为 Gateway_${随机数}
- 实现细节见: [ExclusiveGateway](https://github.com/didi/LogicFlow/blob/master/packages/extension/src/bpmn/gateways/ExclusiveGateway.ts)

<div style="height: 40px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 24px;">
    <span style="font-size: 14px;">顺序流（bpmn:sequenceFlow）</span>
  <p>
</div>

**视图样式**

<div style="width: 100%; display: flex; justify-content: center;">
  <img src="https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/article/extension/bpmn/sequenceFlow.png" style="height: 70px; border-radius: 10px; box-shadow: 0 0 20px #dfecf9" alt="顺序流" />
</div>

- 继承内置折线边 PolylineEdge 的折线

**其他细节**

- 默认 ID 生成规则为 Flow_${随机数}
- 插件引入后，设置为默认连线类型，用户可以通过在初始化LogicFlow实例时传 `customBpmnEdge: true` 关闭这一默认行为。
- 实现细节见: [SequenceFlow](https://github.com/didi/LogicFlow/blob/master/packages/extension/src/bpmn/flow/SequenceFlow.ts)

### 使用指南
1. 引入插件

:::code-group

```tsx [npm]
import { BpmnElement } from '@logicflow/extension'
// 全局使用
LogicFlow.use(BpmnElement)
// 单实例使用
const lf = new LogicFlow({
  // ..., // 其他配置项
  plugins: [BpmnElement],
})
```
```html [CDN]
<!-- 引入插件包 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/dist/index.min.js"></script>
<!-- 引入插件样式 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.min.css" />
<div id="container"></div>
<script>
  const { BpmnElement } = Extension
  // 全局使用
  Core.default.use(BpmnElement);
  // 单实例使用
  const lf = new Core.default({
    ..., // Other options
    plugins: [BpmnElement],
  })
</script>
```
:::
2. 渲染 BPMN 元素

```js
// ...插件引入逻辑

lf.render({
  nodes: [
    { id: 'Event_1234567', type: 'bpmn:startEvent', x: 100, y: 100, },
    { id: 'Task_123ac56', type: 'bpmn:userTask', x: 300, y: 100, },
    { id: 'Event_fa4c699', type: 'bpmn:endEvent', x: 500, y: 100, },
  ],
  edges: [
    { id: 'Flow_12ac567', sourceNodeId: 'Event_123ac56', targetNodeId: 'Task_123ac56', type: 'bpmn:sequenceFlow', },
    { id: 'Flow_fa4c689', sourceNodeId: 'Task_123ac56', targetNodeId: 'Event_fa4c699', type: 'bpmn:sequenceFlow', },
  ],
})
```

该插件只需在 LogicFlow 实例中引入，即可使用其内置的 BPMN 元素。
插件在挂载过程中会自动执行 `register` 方法，将相关 BPMN 元素注册到 LogicFlow 中，并默认将 `bpmn:sequenceFlow` 设置为画布的连线类型。

是否使用 `bpmn:sequenceFlow` 作为默认连线类型可通过配置项进行控制。如果不希望使用 BPMN 连线作为默认连线，可在实例化 LogicFlow 时设置 `customBpmnEdge: true` 关闭这一默认行为。




## bpmnAdapter 插件
该插件提供 BPMN 数据格式与 LogicFlow 数据格式之间的转换能力，包括用于不同场景的适配器 `BpmnAdapter`、`BpmnXmlAdapter`，以及用于在 JSON 与 XML 风格 JSON 结构之间相互转换的辅助函数 `toNormalJson` 和 `toXmlJson`。

### BpmnAdapter
在 LogicFlow 图数据与 BPMN 图数据之间进行双向转换；内置 `adapterIn` 和 `adapterOut` 两个方法：

<div style="height: 60px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 20px;">
    <span style="font-size: 14px;">adapterIn(bpmnData)</span>
    <br/>
    <span style="font-size: 12px; color: #a4a4a4;">
      将 BPMN 图数据转换为 LogicFlow 图数据。
    </span>
  <p>
</div>

**参数**<br/>
- bpmnData *(Object)*：需要转换的 BPMN 数据

**返回**<br/>
- data *([GraphConfigData](../../api/type/MainTypes.zh.md#graphconfigdata流程图渲染数据类型))*：转换后的 LogicFlow 图数据

**数据转换示例**
<iframe src="/bpmn2Lf.html" style="border: none; width: 100%; height: 260px; margin: auto;"></iframe>

<div style="height: 60px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 20px;">
    <span style="font-size: 14px;">adapterOut(data, retainedFields?)</span>
    <br/>
    <span style="font-size: 12px; color: #a4a4a4;">
      将 LogicFlow 图数据转换为 BPMN 图数据。
    </span>
  <p>
</div>

**参数**<br/>
- data *([GraphConfigData](../../api/type/MainTypes.zh.md#graphconfigdata流程图渲染数据类型))*：需要转换的 LogicFlow 数据
- retainedFields *(string[])*：非必填，用于指定在数据转换过程中需要保留并转写为 BPMN 属性的字段名列表。仅当对应字段在 `node.properties` 中为 `object` 类型时生效。

**返回**<br/>
- bpmnData *(Object)*：转换后的 BPMN 图数据

**数据转换示例**
<iframe src="/lf2Bpmn.html" style="border: none; width: 100%; height: 260px; margin: auto;"></iframe>

:::info{title=具体差异}
如下图红框所示，如果属性在`retainedFields`中，属性就会带上`-`前缀，作为startEvent的属性存在，否则会作为子节点存在
<img src="https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/article/extension/bpmn/lf2bpmnDiff.png" style="border-radius: 10px;" alt="LogicFlow图数据与BPMN图数据转换差异" />
:::

### BpmnXmlAdapter
继承 BpmnAdapter，重写 `adapterIn` 和 `adapterOut` 两个方法，整体逻辑相同。区别在于：`adapterOut` 将 LogicFlow 图数据转换为 XML 格式的 BPMN 图数据；`adapterIn` 则将 BPMN XML JSON 数据转换为 LogicFlow 图数据。

<div style="height: 60px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 20px;">
    <span style="font-size: 14px;">adapterIn(bpmnData)</span>
    <br/>
    <span style="font-size: 12px; color: #a4a4a4;">
      将 BPMN 图数据转换为 LogicFlow 图数据。
    </span>
  <p>
</div>

**参数**<br/>
- bpmnData *(Object)*：需要转换的 BPMN 数据

**返回**<br/>
- data *([GraphConfigData](../../api/type/MainTypes.zh.md#graphconfigdata流程图渲染数据类型))*：转换后的 LogicFlow 图数据

**数据转换示例**
<iframe src="/bpmnXml2Lf.html" style="border: none; width: 100%; height: 260px; margin: auto;"></iframe>

<div style="height: 60px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 20px;">
    <span style="font-size: 14px;">adapterOut(data)</span>
    <br/>
    <span style="font-size: 12px; color: #a4a4a4;">
      将 LogicFlow 图数据转换为 BPMN 图数据。
    </span>
  <p>
</div>

**参数**<br/>
- data *([GraphConfigData](../../api/type/MainTypes.zh.md#graphconfigdata流程图渲染数据类型))*：需要转换的 LogicFlow 数据
- retainedFields *(string[])*：用于指定在数据转换过程中需要保留并转写为 BPMN 属性的字段名列表。仅当对应字段在 `node.properties` 中为 `object` 类型时生效。

**返回**<br/>
- bpmnData *(Object)*：转换后的 BPMN 图数据

**数据转换示例**
<iframe src="/lf2BpmnXml.html" style="border: none; width: 100%; height: 260px; margin: auto;"></iframe>

:::info{title=具体差异}
如下图红框所示，如果属性在`retainedFields`中，字段就会渲染成节点属性，否则就会渲染成节点数据
<img src="https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/article/extension/bpmn/lf2BpmnXmlDiff.png" style="border-radius: 10px;" alt="LogicFlow图数据与BPMN XML图数据转换差异" />
:::

### 其他导出项

`toNormalJson` 与 `toXmlJson` 是 bpmnAdapter 的核心转换方法，分别用于 `adapterIn` 与 `adapterOut` 的数据转换。
用户可以根据实际需求，在这两个方法的基础上封装定制化的转换逻辑。


<div style="height: 60px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 20px;">
    <span style="font-size: 14px;">toNormalJson(xmlJson)</span>
    <br/>
    <span style="font-size: 12px; color: #a4a4a4;">
      将 XML 风格 JSON（属性键以 `-` 前缀）转换为普通 JSON；移除 `-` 前缀并递归处理对象/数组，保留文本与属性结构。
    </span>
  <p>
</div>

**参数**<br/>
- xmlJson *(Object)*：XML 风格 JSON 数据（属性键以 `-` 开头）

**返回**<br/>
- json *(Object)*：转换后的普通 JSON 数据


<div style="height: 80px; margin-top: 8px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 20px;">
    <span style="font-size: 14px;">toXmlJson(retainedFields?)</span>
    <br/>
    <span style="font-size: 12px; color: #a4a4a4;">
      将普通 JSON 转为 XML 风格 JSON；为属性键加 `-` 前缀；支持保留字段 `retainedFields` 与默认保留字段（如 `properties/startPoint/endPoint/pointsList`）；处理数组与 `#text/#cdata-section/#comment`。
    </span>
  <p>
</div>

**参数**<br/>
- retainedFields *(string[])*：可选，指定在转换过程中需要保留并转写为属性的字段列表（仅当对应字段为 `object` 类型时生效）

**返回**<br/>
- convert *(Function)*：返回一个转换函数，调用方式为 `convert(json)`，其中 `json` 为普通 JSON；返回值为 XML 风格 JSON（属性键以 `-` 开头）


### 使用指南

与上文介绍的 bpmnElement 插件类似，该插件只需在 LogicFlow 实例中引入，即可使用其内置的 BPMN 数据格式转换能力。在未进行额外自定义的情况下，这一转换过程对用户是透明的。
用户只需调用 `getGraphData` 方法获取当前画布对应的 BPMN 数据，调用 `render` 方法即可将 BPMN 数据渲染到画布中。

:::warning{title=注意}
1. 要使用 bpmnAdapter 插件提供的转换能力，需要确保 LogicFlow 实例内部已注册 BPMN 相关节点（无论是直接用 bpmnElement 插件注册的，还是自定义的 BPMN 节点），否则会抛出找不到节点类型的异常。
2. `BpmnAdapter` 和 `BpmnXmlAdapter` 都会对 `lf.adapterIn` 与 `lf.adapterOut` 进行重写。当多个适配逻辑同时存在时，后接入的适配器会覆盖先前的实现并最终生效。因此，如需自定义重写 `lf.adapterIn` 或 `lf.adapterOut`，请务必在 Adapter 引入之后再进行赋值，以避免自定义逻辑被覆盖。
:::

1. 引入插件

:::code-group

```tsx [npm]
// 注：以下示例假设未注册自定义 BPMN 节点；若已注册自定义 BPMN 节点，无需再引入 bpmnElement 插件
import { BpmnElement, BpmnAdapter, BpmnXmlAdapter, toNormalJson, toXmlJson } from '@logicflow/extension'
// 全局使用
LogicFlow.use(BpmnElement)
// 根据实际需求，选择引入 BpmnAdapter 或 BpmnXmlAdapter
// LogicFlow.use(BpmnAdapter)
LogicFlow.use(BpmnXmlAdapter)
// 单实例使用
const lf = new LogicFlow({
  // ..., // 其他配置项
  plugins: [
    BpmnElement,
    // 根据实际需求，选择引入 BpmnAdapter 或 BpmnXmlAdapter
    // BpmnAdapter,
    BpmnXmlAdapter
  ],
})
```

```html [CDN]
<!-- 注：以下示例假设未注册自定义 BPMN 节点；若已注册自定义 BPMN 节点，无需再引入 BpmnElement 插件 -->

<!-- 引入插件包 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/dist/index.min.js"></script>
<!-- 引入插件样式 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.min.css" />
<div id="container"></div>
<script>
  const { BpmnElement, BpmnAdapter, BpmnXmlAdapter, toNormalJson, toXmlJson } = Extension
  // 全局使用
  // 根据实际需求，选择引入 BpmnAdapter 或 BpmnXmlAdapter
  Core.default.use(BpmnElement);
  // Core.default.use(BpmnAdapter);
  Core.default.use(BpmnXmlAdapter);
  // 单实例使用
  const lf = new Core.default({
    ..., // Other options
    plugins: [
      BpmnElement,
      // 根据实际需求，选择引入 BpmnAdapter 或 BpmnXmlAdapter
      // BpmnAdapter,
      BpmnXmlAdapter
    ],
  })
</script>
```
:::

2. 使用插件进行数据转换
```js
// 渲染数据
lf.render({
  "bpmn:definitions": {
    "-id": "Definitions_09b7413",
    "-xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "-xmlns:bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL",
    "-xmlns:bpmndi": "http://www.omg.org/spec/BPMN/20100524/DI",
    "-xmlns:dc": "http://www.omg.org/spec/DD/20100524/DC",
    "-xmlns:di": "http://www.omg.org/spec/DD/20100524/DI",
    "-targetNamespace": "http://logic-flow.org",
    "-exporter": "logicflow",
    "-exporterVersion": "1.2.0",
    "bpmn:process": {
      "-isExecutable": "true",
      "-id": "Process_f5f16a1",
      "bpmn:startEvent": {
        "-id": "Event_5d74c17",
        "-name": "开始",
        "-width": 36,
        "-height": 36
      },
      "bpmn:sequenceFlow": []
    },
    "bpmndi:BPMNDiagram": {
      "-id": "BPMNDiagram_1",
      "bpmndi:BPMNPlane": {
        "-id": "BPMNPlane_1",
        "-bpmnElement": "Process_f5f16a1",
        "bpmndi:BPMNEdge": [],
        "bpmndi:BPMNShape": [
          {
            "-id": "Event_5d74c17_di",
            "-bpmnElement": "Event_5d74c17",
            "dc:Bounds": {
              "-x": 547.98828125,
              "-y": 133.98828125,
              "-width": 40,
              "-height": 40
            },
            "bpmndi:BPMNLabel": {
              "dc:Bounds": {
                "-x": 557.98828125,
                "-y": 186.98828125,
                "-width": 20,
                "-height": 14
              }
            }
          }
        ]
      }
    }
  }
)
// 生成BPMN XML数据并下载到本地
const handleDownloadData = () => {
  const retainedFields = ['width', 'height']
  const data = lfRef.current?.getGraphData(retainedFields)
  download('logicflow.xml', data)
}
// 上传xml文件并渲染到LogicFlow实例中
const handleUploadData = (e) => {
  const file = e.target.files?.[0]
  const reader = new FileReader()
  reader.onload = (event) => {
    const xml = event.target?.result
    // 将 XML 数据渲染到 LogicFlow 实例中
    lf.render(xml)
  }
  reader.onerror = (error) => console.log(error)
  file && reader.readAsText(file)
}
```
3. 自定义Adapter逻辑
``` js

// ...前置插件引入逻辑

// 自定义Adapter逻辑
const customAdapterIn = (xmlJson) => {
  // ... // 前置数据构造逻辑
  const json = toNormalJson(xmlJson)
  // 对 json 进行自定义处理
  return json
}

const customAdapterOut = (json) => {
  // ... // 前置数据构造逻辑
  const xmlJson = toXmlJson(json)
  // 对 xmlJson 进行自定义处理
  return xmlJson
}
lf.adapterIn = customAdapterIn
lf.adapterOut = customAdapterOut

// ...后续数据渲染与导入导出逻辑

```

## 效果预览
<iframe src="/bpmn.html" style="border: none; width: 100%; height: 400px; margin: auto;"></iframe>



## BPMNElements 插件

:::info{title=温馨提示}
在阅读本章节前，建议先阅读 [bpmnElement 插件](#bpmnelement-插件) 章节，以了解 bpmnElement 插件的基本功能与使用方法。
:::

BPMNElements 插件在 bpmnElement 插件的基础上进行了能力扩充：

### 支持事件定义
在 BPMN 中，事件节点用于标识流程中某个时刻或状态的变化；事件定义用于描述事件产生的原因。
在扩充版的 BPMNElements 插件中，所有事件节点均支持事件定义能力，用户可通过 `lf.useDefinition()` 为节点添加事件定义。
<div style="height: 60px; margin-top: 8px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 20px;">
    <span style="font-size: 14px;">lf.useDefinition()</span>
    <br/>
    <span style="font-size: 12px; color: #a4a4a4;">
      提供节点与事件定义的映射关系与设置能力
    </span>
  <p>
</div>

**返回**<br/>
- 返回一个无参函数，调用结果为二元组 `[definition, setDefinition]`。
- 其中：
  - definition：`Map<string, [DefinitionConfigType](../../api/type/MainTypes.zh.md#bpmnelements相关类型)>`，事件定义映射，用于存储节点的定义配置
  - setDefinition：`(config: [DefinitionConfigType](../../api/type/MainTypes.zh.md#bpmnelements相关类型)[]) => void`，用于设置节点的定义配置

:::info{title=默认的事件定义}
BPMNElements 插件初始化时会调用一次 `setDefinition(definitionConfig)` 生成一份默认的事件定义：

```ts
// 为startEvent、intermediateCatchEvent、boundaryEvent这3种节点增加一个事件触发事件的定义
const definitionConfig: DefinitionConfigType[] = [
  {
    nodes: ['startEvent', 'intermediateCatchEvent', 'boundaryEvent'],
    definition: [
      {
        // definition的type属性，对应XML数据中的节点名
        type: 'bpmn:timerEventDefinition',
        // icon可以是svg的path路径m, 也可以是@logicflow/core 导出的h函数生成的svg, 这里是通过h函数生成的svg
        icon: timerIcon,
        /**
         * properties对应definition需要的属性，例如这里是timerType和timerValue
         * timerType值可以"timeCycle", "timerDate", "timeDuration", 用于区分 <bpmn:timeCycle/>、<bpmn:timeDate/>、<bpmn:timeDuration/>
         * timerValue是timerType对应的cron表达式
         * 最终会生成 `<bpmn:${timerType} xsi:type="bpmn:tFormalExpression">${timerValue}</bpmn:${timerType}>`
         */
        properties: {
          definitionType: 'bpmn:timerEventDefinition',
          timerType: 'timeDuration',
          timerValue: 'PT5M',
        },
      },
    ],
  },
]
```
使用时只需引入插件，并在渲染节点的 `properties` 中设置 `definitionType`：
```ts
lf.render({
  nodes: [
    {
      id: 1,
      type: 'bpmn:startEvent',
      text: '5min定时开始',
      properties: {
        definitionType: 'bpmn:timerEventDefinition',
      },
    }
  ]
})
```
即可渲染出带时钟图标的开始节点 <img src="https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/article/extension/bpmn/durationStart.png" style=" border-radius: 10px;" height="50" alt="开始节点" />，对应的 BPMN 节点结构为：
```xml
<bpmn:startEvent id="Event_f035fe6" name="5min定时开始" width="36" height="36">	
  <bpmn:timerEventDefinition id="Definition_4e3d5ce">
    <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">PT5M</bpmn:timeDuration>
  </bpmn:timerEventDefinition>	
</bpmn:startEvent>
```
:::


### 节点类型扩充
相比 bpmnElement，BPMNElements 插件新增了 6 个节点类型：

首先是3个事件节点：
<div style="height: 94px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 24px;">
    <span style="font-size: 14px;">边界事件（bpmn:boundaryEvent）<br/>捕捉事件（bpmn:intermediateCatchEvent）<br/>抛出事件（bpmn:intermediateThrowEvent）</span>
  <p>
</div>

**视图样式**

<div style="margin-bottom: 20px;width: 100%; display: flex; justify-content: center;">
  <img src="https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/article/extension/bpmn/diffDoundary.png" style="width: 50%; border-radius: 10px; box-shadow: 0 0 20px #dfecf9" alt="事件节点样式" />
</div>

- 形态：双同心圆（外圈半径默认 18、内圈默认 15，边框宽度默认 1.5），按 definition 配置渲染 icon（支持单个 `path d` 或多个子元素 `g`）
- 文本：初始化传入 `text` 时，默认位于节点下方 40 像素
- 抛出事件特有差异：当 icon 为单个 `path` 时采用黑色填充（`style: 'fill: black'`），以区别“抛出”语义
- 边界事件特有差异：`initNodeData` 中设置 `autoToFront=false` 与 `zIndex=99999`，节点始终置顶；当 `properties.cancelActivity === false` 时，边框显示虚线（`5,5`），中断型（`true`）为实线
- 锚点：隐藏锚点（`getAnchorStyle` 返回 `visibility: hidden`），避免非必要的锚点交互

**特有属性**

- `definitionType`：定义类型标识，用于从定义仓库中选择具体图标与默认属性
- `definitionId`：当存在 `definitionType` 时生成 `Definition_${随机数}`，用于后续关联
- 边界事件特有属性：`attachedToRef` 为吸附的任务节点 ID（用户/系统任务）；`cancelActivity` 是否中断流程（默认 `true`），影响边框样式（实线/虚线）
- 其他：依据 `properties.definitionType` 合并 definition 内的默认属性

**其他细节**

- ID 生成：缺省时采用 `Event_${随机数}`
- 分组规则：初始化调用 `groupRule.call(this)`，与分组相关交互保持一致

其次是两个网关节点：

<div style="height: 60px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 24px;">
    <span style="font-size: 14px;">并行网关（bpmn:parallelGateway）<br/>包容网关（bpmn:inclusiveGateway）</span>
  <p>
</div>

在 BPMNElements 插件中对网关节点的实现进行了整合：排他网关、并行网关和包容网关均通过同一工厂方法构造，区别在于节点类型与图标不同，故统一说明。

**视图样式**
<div style="margin-bottom: 20px;width: 100%; display: flex; justify-content: center;">
  <img src="https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/article/extension/bpmn/diffGateway.png" style="width: 50%; border-radius: 10px; box-shadow: 0 0 20px #dfecf9" alt="网关节点样式" />
</div>

- 继承菱形节点实现的自定义节点，初始化设置四顶点为：`[25,0] [50,25] [25,50] [0,25]`，通过重写 `getShape` 在菱形中心叠加网关图标
- 图标可为单个 `path d`（默认填充 `rgb(34, 36, 42)`，`strokeWidth: 1`），或用 h 函数生成的复杂 SVG
- 初始化传入 `text` 为字符串时，文本格式化为 `{ value, x, y }` 并下移 40 像素

**其他细节**

- ID 生成：缺省时采用 `Gateway_${随机数}`
- 分组规则：初始化调用 `groupRule.call(this)`，与分组相关交互保持一致

最后是一个流程节点：
<div style="height: 42px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 20px;">
    <span style="font-size: 14px;">子流程节点（bpmn:subProcess）</span>
  <p>
</div>

**视图样式**

<div style="margin-bottom: 20px;width: 100%; display: flex; justify-content: center;">
  <img src="https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/article/extension/bpmn/subProcess.png" style="width: 50%; border-radius: 10px; box-shadow: 0 0 20px #dfecf9" alt="子流程节点样式" />
</div>

- 继承分组节点 `GroupNode` 的自定义矩形；支持折叠/展开交互：左上角绘制折叠按钮（灰底小矩形 + 加号横线/竖线），点击切换 `properties.isFolded`
- 渲染主体为矩形边框（`stroke: black`、`strokeWidth: 2`、`strokeDasharray: '0 0'`）
- 隐藏锚点 hover 边框（`getAnchorStyle`、`getOutlineStyle` 将 hover/outline 设为透明）

**特有属性与行为**

- `foldable`：是否可折叠，默认 `true`；点击左上角折叠按钮触发 `foldGroup`
- `resizable`：是否可缩放，默认 `true`
- `iniProp`：初始化属性，用于自定义初始宽高（`iniProp.width/iniProp.height` 会覆盖默认宽高）
- `isTaskNode`：标识该节点为任务节点，以支持附加边界事件（参见边界事件说明）
- `boundaryEvents`：记录已附着的边界事件 id 列表

**方法**

- `setTouching(flag)`：设置拖拽边界事件靠近态，用于高亮提示
- `addBoundaryEvent(nodeId)`：附着边界事件（写入 `attachedToRef` 并加入列表），同时取消靠近高亮
- `deleteBoundaryEvent(nodeId)`：移除已附着的边界事件记录
- `addChild(id)`：设置子节点 `parent` 属性并加入分组，便于分组管理与折叠语义

**其他细节**

- 默认尺寸：`width=400`、`height=200`（可由 `iniProp` 重置）
- 交互一致性：初始化时启用分组规则（`groupRule.call(this)`），与分组相关交互保持一致

### 使用指南
1. 引入插件

:::code-group

```tsx [npm]
import { BPMNElements } from '@logicflow/extension'
// 全局使用
LogicFlow.use(BPMNElements)
// 单实例使用
const lf = new LogicFlow({
  // ..., // 其他配置项
  plugins: [BPMNElements],
})
```
```html [CDN]
<!-- 引入插件包 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/dist/index.min.js"></script>
<!-- 引入插件样式 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.min.css" />
<div id="container"></div>
<script>
  const { BPMNElements } = Extension
  // 全局使用
  Core.default.use(BPMNElements);
  // 单实例使用
  const lf = new Core.default({
    ..., // Other options
    plugins: [BPMNElements],
  })
</script>
```
:::
2. 渲染 BPMN 元素

```js
// ...插件引入逻辑

lf.render({
    nodes: [
    {
      id: '1',
      type: 'bpmn:userTask',
      x: 531,
      y: 199,
      properties: {
        isBoundaryEventTouchingTask: false,
        width: 100,
        height: 80,
      },
    },
    {
      id: 'Event_1230439',
      type: 'bpmn:startEvent',
      x: 369,
      y: 199,
      properties: {
        definitionType: 'bpmn:timerEventDefinition',
        timerValue: 'PT5M',
        timerType: 'timeDuration',
        definitionId: 'Definition_1ee1ad3',
        width: 36,
        height: 36,
      },
      text: '5min定时开始',
    },
    {
      id: 'Event_551491b',
      type: 'bpmn:boundaryEvent',
      x: 575,
      y: 235,
      properties: {
        attachedToRef: '1',
        cancelActivity: true,
        definitionType: 'bpmn:timerEventDefinition',
        timerValue: 'boundaryEvent',
        timerType: '222',
        definitionId: 'Definition_7f7779a',
        width: 36,
        height: 36,
      },
      text: '边界事件',
    },
    {
      id: 'Gateway_3e3764d',
      type: 'bpmn:parallelGateway',
      x: 707,
      y: 199,
      properties: {
        width: 50,
        height: 50,
      },
      text: '并行网关',
    },
    {
      id: 'Activity_3d69f0c',
      type: 'bpmn:serviceTask',
      x: 880,
      y: 144,
      properties: {
        width: 100,
        height: 80,
      },
      text: '系统任务',
    },
    {
      id: 'Activity_6e5fe39',
      type: 'bpmn:serviceTask',
      x: 879,
      y: 285,
      properties: {
        width: 100,
        height: 80,
      },
      text: '系统任务',
    },
    {
      id: 'Event_be840c3',
      type: 'bpmn:endEvent',
      x: 1041,
      y: 198,
      properties: {
        width: 36,
        height: 36,
      },
      text: '结束',
    },
  ],
  edges: [
    {
      id: 'Flow_059933a',
      type: 'bpmn:sequenceFlow',
      properties: {
        isDefaultFlow: false,
      },
      sourceNodeId: 'Event_1230439',
      targetNodeId: '1',
      sourceAnchorId: 'Event_1230439_1',
      targetAnchorId: '1_3',
    },
  ],
})
```

和 BpmnElement 相同，BPMNElements 只需在 LogicFlow 实例中引入，即可使用其内置的 BPMN 元素。
插件在挂载过程中会自动执行 `register` 方法，将相关 BPMN 元素注册到 LogicFlow 中，并默认将 `bpmn:sequenceFlow` 设置为画布的连线类型。

是否使用 `bpmn:sequenceFlow` 作为默认连线类型可通过配置项进行控制。如果不希望使用 BPMN 连线作为默认连线，可在实例化 LogicFlow 时设置 `customBpmnEdge: true` 关闭这一默认行为。

## bpmnElementsAdapter 插件

:::info{title=温馨提示}
在阅读本章节前，建议先阅读 [bpmnAdapter 插件](#bpmnadapter-插件) 章节，以了解 bpmnAdapter 插件的基本功能与使用方法。
:::

与bpmnAdapter类似，bpmnElementsAdapter也对外提供了两个适配器：`BPMNBaseAdapter`和`BPMNAdapter`、两个数据转换辅助函数`convertNormalToXml`和`convertXmlToNormal`

### BPMNBaseAdapter
**核心能力**

进行 BPMN Json 与 LogicFlow 的双向转换，支持图形信息（坐标/尺寸/文本）同步；通过`extraProps`参数控制字段保留、字段忽略、类型映射与语义转换。

**与 BpmnAdapter 的功能对比**

| 维度       | BpmnAdapter（基础版）                                       | BPMNBaseAdapter（增强版）                                            | 说明                                                   |
| ---------- | ----------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| 输入/输出  | adapterIn(bpmnJson)、adapterOut(graphData, retainedFields?) | adapterIn(bpmnJson, extraProps?)、adapterOut(graphData, extraProps?) | 增加 extraProps 控制更细粒度的转换                     |
| 支持元素   | 支持BpmnElement插件提供的所有节点                           | 支持BPMNElements插件提供的所有节点                                   | 形状映射更全面                                         |
| 事件定义   | 无内置处理                                                  | 内置 timerEventDefinition in/out 钩子                                | 根据 definitionType/timerType/timerValue 自动生成/解析 |
| 条件表达式 | 无内置处理                                                  | 内置 conditionExpression in/out 钩子                                 | 支持 cdata 与普通文本两种表达                          |
| 参数支持   | 只在导出时支持retainedFields保留指定属性                    | 提供extraProps参数，支持属性保留、属性剔除、自定义节点转换规则化     | 更精细化的自定义能力                                   |
| 字段忽略   | 无                                                          | excludeFields（in/out）                                              | 路径 Set，递归过滤对象层级                             |
| 类型映射   | 无                                                          | mapping（in/out）                                                    | 键名/类型名重写，递归应用                              |

**API 差异说明**
- BpmnAdapter
  - adapterIn(bpmnJson)
  - adapterOut(graphData, retainedFields?)
- BPMNBaseAdapter
  - adapterIn(bpmnJson, extraProps?)
  - adapterOut(graphData, extraProps?)
  - setCustomShape(type, { width, height })

### BPMNAdapter
**核心能力**

在 BPMNBaseAdapter 的基础上，提供 XML ↔ LogicFlow 的双向转换能力，同样可以通过`extraProps`参数控制字段保留、字段忽略、类型映射与语义转换。

**与 BpmnXmlAdapter 的功能对比**

| 维度           | BpmnXmlAdapter（基础 XML 版）    | BPMNAdapter（增强 XML 版）           | 说明                 |
| -------------- | -------------------------------- | ------------------------------------ | -------------------- |
| 继承关系       | 继承 BpmnAdapter（基础 JSON 版） | 继承 BPMNBaseAdapter（增强 JSON 版） | 上层包装能力来源不同 |
| 非法字符预处理 | 有（仅 name 属性转义 < > &）     | 无（直接解析）                       | 基础 XML 版更保守    |

**API 差异说明**
- BpmnXmlAdapter
  - adapterXmlIn(bpmnData)
    - 若输入为字符串，先对 name 属性值进行非法字符转义（仅处理 <、>、&，不影响已合法实体）
    - 使用 lfXml2Json 将 XML 转为 BPMN JSON
    - 调用基础 adapterIn(json) 生成 GraphData（不支持 extraProps，导入阶段不参与 retainedFields）
  - adapterXmlOut(data, retainedFields?)
    - 调用基础 adapterOut(data, retainedFields) 生成 BPMN JSON（仅支持保留字段策略）
    - 使用 lfJson2Xml 输出 XML 字符串（包含属性与文本转义）
    - 不支持 transformer/mapping/excludeFields 的语义与结构定制
- BPMNAdapter
  - adapterXmlIn(bpmnData)
    - 直接使用 lfXml2Json 将 XML 转为 BPMN JSON（不做 name 属性转义预处理）
    - 调用增强 adapterIn(json, props) 生成 GraphData
    - 按照插件配置的 extraProps 进行属性保留、剔除、转换
  - adapterXmlOut(data)
    - 调用增强 adapterOut(data, props) 生成 BPMN JSON
    - 使用 lfJson2Xml 输出 XML 字符串
    - 按照插件配置的 extraProps 进行属性保留、剔除、转换

### extraProps

相较于 bpmnAdapter，bpmnElementsAdapter 在数据转换能力上进一步增强，核心体现在支持通过 `extraProps` 进行更精细的转换控制，主要包括：

**属性回填能力增强**

  当配置 `retainedAttrsFields` 时，在 BPMN 数据导出并再次导入渲染的过程中，会根据该配置指定的字段，将对应数据回填到节点 `properties` 中，从而避免导入导出过程中关键信息丢失。

**可配置的属性忽略机制**

  支持自定义在数据导入与导出阶段需要忽略的属性字段，从而减少冗余数据或规避不必要字段参与转换。

**多粒度的数据转换定制能力**
  
  允许在不同层级对节点数据转换规则进行定制，例如：
  - 通过 `mapping` 配置，实现 BPMN 元素类型与 LogicFlow 节点类型之间的自定义映射
  - 通过 `transformer` 配置，对节点数据在 BPMN 与 LogicFlow 之间的结构与格式进行深度定制转换

#### 配置项说明

<div style="height: 40px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 24px;">
    <span style="font-size: 14px;">retainedAttrsFields</span>
  <p>
</div>

- 类型：`string[]`
- 是否必填：否
- 默认值：
```js
  ["properties", "startPoint", "endPoint", "pointsList"]
```
- 说明：指定在导入/导出过程中以“属性”形式保留的字段。命中的字段值即使为对象或数组，也会作为属性（键名带 `-` 前缀）保留，而非转换为子节点。

<div style="height: 40px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 24px;">
    <span style="font-size: 14px;">excludeFields</span>
  <p>
</div>

- 类型：`{ in?: Set<string>; out?: Set<string> }`
- 是否必填：否
- 默认值：
```js
{
  in: [],
  out: [
    'properties.panels',
    'properties.nodeSize',
    'properties.definitionId',
    'properties.timerValue',
    'properties.timerType',
    'properties.definitionType',
    'properties.parent',
    'properties.isBoundaryEventTouchingTask',
  ],
}
```
- 说明：在转换过程中按路径忽略字段
  - `in`：导入方向（BPMN → LogicFlow）忽略的字段路径集合
  - `out`：导出方向（LogicFlow → BPMN）忽略的字段路径集合
  - 路径采用点号分隔形式（如 `properties.definitionId`），递归匹配对象层级

<div style="height: 40px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 24px;">
    <span style="font-size: 14px;">transformer</span>
  <p>
</div>

- 类型：
```js
{
  [type: string]: {
    in?: (key: string, data: any) => any;
    out?: (data: any) => any;
  }
}
```
- 是否必填：否
- 默认内置：`bpmn:startEvent`、`bpmn:intermediateCatchEvent`、`bpmn:intermediateThrowEvent`、`bpmn:boundaryEvent`、`bpmn:sequenceFlow`、`bpmn:timerEventDefinition`、`bpmn:conditionExpression`
- 说明：按元素类型定义子内容的转换钩子
  - `in(key, data)`：导入方向（BPMN → LogicFlow）解析嵌套子元素为平铺属性
  - `out(data)`：导出方向（LogicFlow → BPMN）生成嵌套结构或序列化片段
  - 用于事件定义（如 `timerEventDefinition`）与条件表达式（如 `conditionExpression`）等语义转换

<div style="height: 40px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 24px;">
    <span style="font-size: 14px;">mapping</span>
  <p>
</div>

- 类型：`{ in?: { [key: string]: string }; out?: { [key: string]: string } }`
- 是否必填：否
- 说明：在两端进行键名/类型名的重写映射
  - `in`：导入方向（BPMN → LogicFlow）的类型名映射，`key` 为 BPMN 类型名，`value` 为目标 LF 类型名
  - `out`：导出方向（LogicFlow → BPMN）的键名映射，递归重命名输出 JSON 中的键（含类型名/字段名等）

各个参数的使用顺序：
遍历所有元素，按照retainedAttrsFields和excludeFields进行属性保留、剔除
然后按照transformer进行属性转换，最后按照mapping进行键名重写

#### 使用指南
很简单，只需要在实例化 LogicFlow 时，将 `extraProps` 配置项传入即可。
``` js
const lf = new LogicFlow({
  plugins: [BPMNAdapter],
  pluginsOptions: {
    BPMNAdapter: {
      extraProps: {
        // 指定 properties里的customProps属性被保留
        retainedAttrsFields: ['customProps'],
        // 指定 导入时忽略properties.customId属性；导出时忽略properties.definitionId属性
        excludeFields: {
          in: ['properties.customId'],
          out: [
            'properties.definitionId',
          ],
        },
        // 指定 bpmn:sequenceFlow 类型元素的转换规则
        transformer: {
          'bpmn:sequenceFlow': {
            in: (key, data) => {
              if (key === 'conditionExpression') {
                return data.expression;
              }
              return data;
            },
            out: (data) => ({
              conditionExpression: {
                expression: data,
              },
            }),
          },
        },
        mapping: {
          // 导入时，将 bpmn:startEvent 类型元素映射为 StartEvent 类型
          in: {
            'bpmn:startEvent': 'StartEvent',
          },
          // 导出时，将 StartEvent 类型元素映射为 bpmn:startEvent 类型
          out: {
            'StartEvent': 'bpmn:startEvent',
          },
        },
      },
    },
  },
})
```
**举个实际转换的例子**

假设画布上有一个包含判断条件的顺序流元素（bpmn:sequenceFlow）
```json
{
  "id": "sequenceFlow_1",
  "type": "bpmn:sequenceFlow",
  "sourceRef": "task_1",
  "targetRef": "task_2",
  "properties": {
    "expressionType": "cdata",
    "condition": "foo &gt; bar" // 预先转义 &gt;，确保 XML 合法
  }
}
```
现在我们需要通过extraProps配置实现导出成BPMN XML数据时condition能变成使用 cdata 格式，并用bpmn:conditionExpression元素包裹，导入时又能正确解析回expressionType和condition属性，应该怎么做？

这里涉及复杂的数据转换，所以需要在transformer中实现自定义转换逻辑。
首先我们先把框架搭出来，因为这次转换涉及bpmn:sequenceFlow和bpmn:conditionExpression两个元素，所以在transformer中需要定义bpmn:sequenceFlow和bpmn:conditionExpression的转换规则
```js
extraProps.transformer = {
  'bpmn:sequenceFlow': {},
  'bpmn:conditionExpression': {}
}
```

在导出时，我们需要把expressionType和condition属性转换为bpmn:conditionExpression元素的子内容，而bpmn:conditionExpression则是bpmn:sequenceFlow的子元素，所以在transformer中需要定义bpmn:sequenceFlow的out方法，如下：
```js
extraProps.transformer = {
  'bpmn:sequenceFlow': {
    out(data) { // 这里的data是LogicFlow中bpmn:sequenceFlow元素的数据
      const { properties: { expressionType, condition } } = data;
      // 先判断是否有condition属性
      if (condition) {
        // 再判断是否是cdata格式
        if (expressionType === 'cdata') {
            // 如果是cdata格式，需要用CDATA包裹
            return {
                json:
                `<bpmn:conditionExpression xsi:type="bpmn2:tFormalExpression"><![CDATA[\${${
                    condition
                }}]]></bpmn:conditionExpression>`,
            };
        }
        // 如果不是cdata格式，直接用普通字符串包裹
        return {
            json: `<bpmn:conditionExpression xsi:type="bpmn2:tFormalExpression">${condition}</bpmn:conditionExpression>`,
        };
      }
      // 如果没有condition属性，直接返回空字符串
      return {
          json: '',
      };
    },
  },
  'bpmn:conditionExpression': {}
}
```

在执行这个转换逻辑后，会生成下面这样的BPMN JSON数据

```js
{
  "-id": "sequenceFlow_1",
  "-sourceRef": "Event_5d74c17",
  "-targetRef": "task_2",
  "-json": "<bpmn:conditionExpression xsi:type=\"bpmn2:tFormalExpression\"><![CDATA[${foo &gt; bar}]]></bpmn:conditionExpression>",
  "-expressionType": "cdata",
  "-condition": "foo &gt; bar",
  "-isDefaultFlow": false
}
```

最后再转成XML数据：

```xml
<bpmn:sequenceFlow id="sequenceFlow_1" sourceRef="Event_5d74c17" targetRef="task_2" expressionType="cdata" condition="foo &gt; bar" isDefaultFlow="false">	
  <bpmn:conditionExpression xsi:type="bpmn2:tFormalExpression"><![CDATA[${foo &gt; bar}]]></bpmn:conditionExpression>	
</bpmn:sequenceFlow>
```

导入时，我们需要把`bpmn:conditionExpression`转成`condition`和`expressionType`再回填到`bpmn:sequenceFlow`元素的`properties`中，所以需要在transformer中定义bpmn:conditionExpression的in方法，如下：

```js
extraProps.transformer = {
  // ... bpmn:sequenceFlow的转换规则
  'bpmn:conditionExpression': {
    in(_key: string, data: any) {
        let condition = '';
        let expressionType = '';
        if (data['#cdata-section']) {
            expressionType = 'cdata';
            condition = /^\$\{(.*)\}$/g.exec(data['#cdata-section'])?.[1] || '';
        } else if (data['#text']) {
            expressionType = 'normal';
            condition = data['#text'];
        }
        return {
            '-condition': condition,
            '-expressionType': expressionType,
        };
    },
  },
}
```

首先，Adapter会把XML转成下面这样的BPMN JSON：

```js
{
  "bpmn:sequenceFlow": {
    "-id": "Flow_X",
    "-sourceRef": "Node_A",
    "-targetRef": "Node_B",
    "-expressionType": "cdata",
    "-condition": "foo &gt; bar",
    "-isDefaultFlow": false,
    "bpmn:conditionExpression": {
      "-xsi:type": "bpmn2:tFormalExpression",
      "#cdata-section": "${foo &gt; bar}"
    }
  }
}
```
然后执行bpmn:conditionExpression的transformer in方法，解析回expressionType和condition属性，注入到bpmn:sequenceFlow元素的properties中
```json
{
  "id": "sequenceFlow_1",
  "type": "bpmn:sequenceFlow",
  "sourceRef": "task_1",
  "targetRef": "task_2",
  "properties": {
    "expressionType": "cdata",
    "condition": "foo &gt; bar" // 预先转义 &gt;，确保 XML 合法
  }
}
```

:::warning{title=注意}
transformer in方法只有在导入的节点有属性包含bpmn:时才会调用，因此目前只适用于子节点转属性的场景
:::

### 其他导出项
<div style="height: 60px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 20px;">
    <span style="font-size: 14px;">convertNormalToXml(other?)</span>
    <br/>
    <span style="font-size: 12px; color: #a4a4a4;">
      将普通 JSON（GraphData）转换为 XML 风格 JSON；支持保留字段、忽略字段、类型映射与语义钩子；处理数组与 <code>#text/#cdata-section/#comment</code>。
    </span>
  <p>
</div>

**参数**<br/>
- other *(ExtraProps)*：可选，扩展转换行为的配置对象
  - retainedAttrsFields *(string[])*：与默认保留字段合并（默认 <code>["properties","startPoint","endPoint","pointsList"]</code>）；命中的路径按属性（加 <code>-</code> 前缀）保留
  - excludeFields *({ in?: Set<string>; out?: Set<string> })*：与默认忽略集合合并；导出方向（out）命中的路径被忽略
  - transformer *({ [type: string]: { in?: (key, data) => any; out?: (data) => any } })*：按元素类型定义子内容 in/out 转换钩子；out 钩子返回的键值会合并到当前对象
  - mapping *({ in?: { [key: string]: string }; out?: { [key: string]: string } })*：键名/类型名重写（此方法本身只使用 transformer；mapping 用于 adapterOut 的最终重写）

**返回**<br/>
- convert *(Function)*：返回一个转换函数 <code>convert(object)</code>，其中 <code>object</code> 为包含 <code>nodes/edges</code> 的普通 JSON；返回值为 XML 风格 JSON（属性键以 <code>-</code> 前缀）

**处理规则摘要**<br/>
- 标量与文本：普通键转为属性键（加 <code>-</code> 前缀）；<code>#text/#cdata-section/#comment</code> 按原样保留
- 保留字段：命中 <code>retainedAttrsFields</code> 的路径，值为对象或数组也按属性保留（加 <code>-</code> 前缀）
- 忽略字段：命中 <code>excludeFields.out</code> 的路径直接跳过
- 语义钩子：若当前对象的 <code>type</code> 命中 <code>transformer[type].out</code>，返回的键值（如 <code>json</code>）会合并为同级属性（后续被写入 <code>-json</code> 并序列化为内嵌片段）
- children 处理：将 <code>children</code> 的 id 列表替换为实际子节点对象（nodes/edges 查找）

<div style="height: 60px;">
  <p style="padding: 8px; border-left: 4px solid #598df6; font-weight: bolder; line-height: 20px;">
    <span style="font-size: 14px;">convertXmlToNormal(xmlJson)</span>
    <br/>
    <span style="font-size: 12px; color: #a4a4a4;">
      将 XML 风格 JSON 转换为普通 JSON；移除属性前缀 <code>-</code> 并递归处理对象、数组与文本节点；用于导入阶段的属性拍平与回填。
    </span>
  <p>
</div>

**参数**<br/>
- xmlJson *(Object)*：XML 风格 JSON 数据（属性键以 <code>-</code> 开头；子元素为普通键）

**返回**<br/>
- json *(Object)*：转换后的普通 JSON；属性前缀去除（并应用 <code>handleAttributes</code>），数组与对象递归转换

**配合使用说明**<br/>
- convertNormalToXml 的结果会进入 <code>adapterOut</code> 的流程，随后由 <code>lfJson2Xml</code> 序列化为 XML
- convertXmlToNormal 用于 <code>adapterIn</code> 的流程，将 XML 解析为普通 JSON，再加上 <code>transformer[type].in</code> 的拍平结果，最终写入节点/边的 <code>properties</code>

### 使用指南

1. 引入 BPMNAdapter / BPMNBaseAdapter

:::code-group

```tsx [npm]
// 注：以下示例假设未注册自定义 BPMN 节点 ；若已注册自定义 BPMN 节点，无需再引入 bpmnElement 插件
import { BPMNElements, BPMNBaseAdapter, BPMNAdapter } from '@logicflow/extension'

LogicFlow.use(BPMNElements)
// 根据实际需求，选择引入 BPMNAdapter 或 BPMNBaseAdapter
// 全局使用
LogicFlow.use(BPMNAdapter)
// LogicFlow.use(BPMNBaseAdapter)

// 单实例使用
const lf = new LogicFlow({
  // ..., // 其他配置项
  plugins: [
    BPMNElements,
    // 根据实际需求，选择引入 BpmnAdapter 或 BpmnXmlAdapter
    BPMNAdapter,
    // BPMNBaseAdapter
  ],
})
```

```html [CDN]
<!-- 注：以下示例假设未注册自定义 BPMN 节点；若已注册自定义 BPMN 节点，无需再引入 BpmnElement 插件 -->

<!-- 引入插件包 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/dist/index.min.js"></script>
<!-- 引入插件样式 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.min.css" />
<div id="container"></div>
<script>
  const { BPMNElements, BPMNAdapter, BPMNBaseAdaptern } = Extension
  // 全局使用
  // 根据实际需求，选择引入 BpmnAdapter 或 BpmnXmlAdapter
  Core.default.use(BPMNElements);
  Core.default.use(BPMNAdapter);
  // Core.default.use(BPMNBaseAdaptern);
  // 单实例使用
  const lf = new Core.default({
    ..., // Other options
    plugins: [
      BPMNElements,
      // 根据实际需求，选择引入 BpmnAdapter 或 BpmnXmlAdapter
      // BPMNAdapter,
      BPMNBaseAdaptern
    ],
  })
</script>
```
:::

2. 使用插件进行数据转换
```js
// 渲染数据
lf.render(`
  <bpmn:definitions id="Definitions_48012e2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" targetNamespace="http://logic-flow.org" exporter="logicflow" exporterVersion="1.2.0">	
    <bpmn:process isExecutable="true" id="Process_0482d02">	
      <bpmn:startEvent id="Event_5d74c17" name="开始" width="36" height="36">	
        <businessData name="开始流程" />	
      </bpmn:startEvent>	
    </bpmn:process>	
    <bpmndi:BPMNDiagram id="BPMNDiagram_1">	
      <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_0482d02">	
          <bpmndi:BPMNShape id="Event_5d74c17_di" bpmnElement="Event_5d74c17">	
            <dc:Bounds x="547.98828125" y="133.98828125" width="40" height="40" />	
            <bpmndi:BPMNLabel>	
              <dc:Bounds x="557.98828125" y="186.98828125" width="20" height="14" />	
            </bpmndi:BPMNLabel>	
          </bpmndi:BPMNShape>	
      </bpmndi:BPMNPlane>	
    </bpmndi:BPMNDiagram>	
  </bpmn:definitions>
`)
// 生成BPMN XML数据并下载到本地
const handleDownloadData = () => {
  const retainedFields = ['width', 'height']
  const data = lfRef.current?.getGraphData(retainedFields)
  download('logicflow.xml', data)
}
// 上传xml文件并渲染到LogicFlow实例中
const handleUploadData = (e) => {
  const file = e.target.files?.[0]
  const reader = new FileReader()
  reader.onload = (event) => {
    const xml = event.target?.result
    // 将 XML 数据渲染到 LogicFlow 实例中
    lf.render(xml)
  }
  reader.onerror = (error) => console.log(error)
  file && reader.readAsText(file)
}
```

1. 增加自定义转换规则
:::code-group

```tsx [npm]
// 注：以下示例假设未注册自定义 BPMN 节点 ；若已注册自定义 BPMN 节点，无需再引入 bpmnElement 插件
import { BPMNElements, BPMNBaseAdapter, BPMNAdapter } from '@logicflow/extension'

const extraProps = {
  // ...自定义转换规则
};

LogicFlow.use(BPMNElements)
// 根据实际需求，选择引入 BPMNAdapter 或 BPMNBaseAdapter
// 全局使用
LogicFlow.use(BPMNAdapter, extraProps)
// LogicFlow.use(BPMNBaseAdapter, extraProps)

// 单实例使用
const lf = new LogicFlow({
  // ..., // 其他配置项
  plugins: [
    BPMNElements,
    // 根据实际需求，选择引入 BpmnAdapter 或 BpmnXmlAdapter
    BPMNAdapter,
    // BPMNBaseAdapter
  ],
  pluginsOptions: {
    BPMNAdapter: extraProps,
    // BPMNBaseAdapter: extraProps,
  },
})
```

```html [CDN]
<!-- 注：以下示例假设未注册自定义 BPMN 节点；若已注册自定义 BPMN 节点，无需再引入 BpmnElement 插件 -->

<!-- 引入插件包 -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/dist/index.min.js"></script>
<!-- 引入插件样式 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.min.css" />
<div id="container"></div>
<script>
  const { BPMNElements, BPMNAdapter, BPMNBaseAdapter } = Extension
  const extraProps = {
    // ...自定义转换规则
  };

  // 全局使用
  // 根据实际需求，选择引入 BpmnAdapter 或 BpmnXmlAdapter
  Core.default.use(BPMNElements);
  Core.default.use(BPMNAdapter, extraProps);
  // Core.default.use(BPMNBaseAdapter, extraProps);
  // 单实例使用
  const lf = new Core.default({
    ..., // Other options
    plugins: [
      BPMNElements,
      // 根据实际需求，选择引入 BpmnAdapter 或 BpmnXmlAdapter
      // BPMNAdapter,
      BPMNBaseAdaptern
    ],
    pluginsOptions: {
      BPMNBaseAdapter: extraProps,
      // BPMNAdapter: extraProps,
    },
  })
</script>
```
:::

### 迁移指南
> 从 BpmnAdapter / BpmnXmlAdapter 切换到 BPMNBaseAdapter / BPMNAdapter

1. 依赖替换
   - `BpmnAdapter` → `BPMNBaseAdapter`
   - `BpmnXmlAdapter` → `BPMNAdapter`
2. 额外参数变量名与传入方式替换
   - 变量名变化：`retainedFields` → `retainedAttrsFields`
   - 传入方式变化
     - 原：
      ```js
        // 在需要转换的地方传入
        const data = lfRef.current?.getGraphData(retainedFields)
      ```
     - 新：
      ```js
        // 在插件注册时传入
        // 全局引入
        LogicFlow.use(BPMNBaseAdapter, {
          retainedAttrsFields,
          // 其他配置项，详情见下文 extraProps 的介绍
        })
        // 局部引入
        const lf = new LogicFlow({
          plugins: [BPMNBaseAdapter],
          pluginsOptions: {
            BPMNBaseAdapter: {
              retainedAttrsFields,
              // 其他配置项，详情见下文 extraProps 的介绍
            },
          },
        })
      ```
