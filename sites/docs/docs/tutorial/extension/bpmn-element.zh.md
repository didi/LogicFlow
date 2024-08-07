---
nav: 指南
group:
  title: 插件功能
  order: 3
title: BPMN 元素 (BpmnElement)
order: 11
toc: content
---

> BPMN 是目前较为著名的 workflow 的建模语言标准之一。LogicFlow 实现了 BPMN 扩展，可以直接使用
> LogicFlow 来绘制兼容 BPMN2.0 规范的流程，并且其导出的数据可以在 Activity 流程引擎上运行。

LogicFlow 提供了[自定义节点](../basic/node.zh.md)和[自定义边](../basic/edge.zh.md), 可以实现满足
BPMN2.0 规范的节点和边。然后在使用[数据转换](adapter.zh.md)将生成的数据转换为 Activity 需要的格式。

:::info{title=注意}
在实际项目中，我们推荐开发者完全自定义项目的节点和数据转换，而不是使用我们提供的 bpmnElement 和
bpmnAdapter 插件。我们内置的插件只包括了很基础的演示功能，不支持更多的 bpmn 元素和自定义属性。大家可以参考我们的
bpmnElement 和 bpmnAdapter 插件，自己在本地重新实现一套符合你们自己产品需求的节点和数据格式转换插件。我们开发
LogicFlow 的初衷之一就是希望前端能在代码中体现所有的业务逻辑，这样让前端研发更贴近的业务，而不是把业务逻辑交给第三方库。
:::

## 使用方式

```tsx | pure
<script src="/logic-flow.js"></script>
<script src="/lib/BpmnElement.js"></script>
<script src="/lib/BpmnAdapter.js"></script>
<script>
  LogicFlow.use(BpmnElement);
  LogicFlow.use(BpmnAdapter); </script>
```

<!-- TODO -->
<a href="https://examples.logic-flow.cn/demo/dist/examples/#/extension/bpmn-elements?from=doc" target="_blank"> 去 CodeSandbox 查看示例</a>

## 转换为 XML

`BpmnAdapter` 支持 BPMN json 和 LogicFlow data 之间的相互转换，如果希望 LogicFlow data 与 XML
互相转换，可以使用`BpmnXmlAdapter`。

```tsx | pure
<script src="/logic-flow.js"></script>
<script src="/lib/BpmnElement.js"></script>
<script src="/lib/BpmnXmlAdapter.js"></script>
<script>
  LogicFlow.use(BpmnElement);
  LogicFlow.use(BpmnXmlAdapter); </script>
```

## StartEvent

```tsx | pure
const data = {
  nodes: [
    {
      id: 10,
      type: "bpmn:startEvent",
      x: 200,
      y: 80,
      text: "开始",
    },
  ],
};
```

## EndEvent

```tsx | pure
const data = {
  nodes: [
    {
      id: 10,
      type: "bpmn:endEvent",
      x: 200,
      y: 80,
      text: "结束",
    },
  ],
};
```

## UserTask

```tsx | pure
const data = {
  nodes: [
    {
      id: 10,
      type: "bpmn:userTask",
      x: 200,
      y: 80,
      text: "用户任务",
    },
  ],
};
```

## ServiceTask

```tsx | pure
const data = {
  nodes: [
    {
      id: 10,
      type: "bpmn:serviceTask",
      x: 200,
      y: 80,
      text: "系统任务",
    },
  ],
};
```

## ExclusiveGateway

```tsx | pure
const data = {
  nodes: [
    {
      id: 10,
      type: "bpmn:exclusiveGateway",
      x: 200,
      y: 80,
    },
  ],
};
```

完整的 BPMN 案例工具请到[示例](https://site.logic-flow.cn/examples/#/gallery)中体验。

## 新的BPMNElement

```tsx | purex | pure
import { BPMNElements } from '@logicflow/extension'

```

### 内置基础节点

#### 事件

**开始事件 (bpmn:startEvent)**

- 开始事件
- 中断子流程事件 (
  与开始事件通过isInterrupting属性区分，即是否有isInterrupting属性, `isInterrupting = 'false'`)
- 非中断子流程事件 (
  与开始事件通过isInterrupting属性区分，即是否有isInterrupting属性, `isInterrupting = 'true'`)

**边界事件 (bpmn:boundaryEvent)**

- 中断边界事件 (属性`cancelActivity = 'true'`)
- 非中断边界事件 (属性`cancelActivity = 'false'`)

**中间事件**

- 捕捉事件 (bpmn:intermediateCatchEvent)

- 抛出事件 (bpmn:intermediateThrowEvent)

**结束事件 (bpmn:endEvent)**

#### 任务

- 服务任务 (bpmn:serviceTask)
- 用户任务 (bpmn:userTask)

#### 网关

- 并行网关 (bpmn:parallelGateway)
- 排他网关 (bpmn:exclusiveGateway)
- 包容网关 (bpmn:inclusiveGateway)

#### 子流程

- 嵌入子流程 (bpmn:subProcess)

#### 流（flow）

- 顺序流 (bpmn:sequenceFlow) 可以通过`isDefaultFlow`（是否为缺省流）属性改变顺序流的样式

### 节点扩展

#### 事件

在基础节点的基础上，我们需要通过定义definition属性来扩展事件节点。

```tsx | pure
import { h } from '@logicflow/core'

// 例如，我们想要扩展出时间开始事件，时间捕获事件，时间边界事件
const [definition, setDefinition] = lf.useDefinition()
const customDefinition = [
  {
    // 为startEvent、intermediateCatchEvent、boundaryEvent添加definition
    nodes: ['startEvent', 'intermediateCatchEvent', 'boundaryEvent'],
    definition: {
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
      properties: {
        timerType: '',
        timerValue: ''
      }
    }
  }
]

setDefinition(customDefinition)
```

<details>
  <summary>timerIcon的定义如下：</summary>
  <pre><code style="background-color: #282c34; color: #7ec798">
import { h } from '@logicflow/core'
const timerIcon = [
  h('circle', {
    cx: 18,
    cy: 18,
    r: 11,
    style:
      'stroke-linecap: round;stroke-linejoin: round;stroke: rgb(34, 36, 42);stroke-width: 2px;fill: white',
  }),
  h('path', {
    d: 'M 18,18 l 2.25,-7.5 m -2.25,7.5 l 5.25,1.5',
    style:
      'fill: none; stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 2px;',
  }),
  h('path', {
    d: 'M 18,18 m 0,7.5 l -0,2.25',
    transform: 'rotate(0,18,18)',
    style:
      'fill: none; stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 1px;',
  }),
  h('path', {
    d: 'M 18,18 m 0,7.5 l -0,2.25',
    transform: 'rotate(30,18,18)',
    style:
      'fill: none; stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 1px;',
  }),
  h('path', {
    d: 'M 18,18 m 0,7.5 l -0,2.25',
    transform: 'rotate(60,18,18)',
    style:
      'fill: none; stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 1px;',
  }),
  h('path', {
    d: 'M 18,18 m 0,7.5 l -0,2.25',
    transform: 'rotate(90,18,18)',
    style:
      'fill: none; stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 1px;',
  }),
  h('path', {
    d: 'M 18,18 m 0,7.5 l -0,2.25',
    transform: 'rotate(120,18,18)',
    style:
      'fill: none; stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 1px;',
  }),
  h('path', {
    d: 'M 18,18 m 0,7.5 l -0,2.25',
    transform: 'rotate(150,18,18)',
    style:
      'fill: none; stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 1px;',
  }),
  h('path', {
    d: 'M 18,18 m 0,7.5 l -0,2.25',
    transform: 'rotate(180,18,18)',
    style:
      'fill: none; stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 1px;',
  }),
  h('path', {
    d: 'M 18,18 m 0,7.5 l -0,2.25',
    transform: 'rotate(210,18,18)',
    style:
      'fill: none; stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 1px;',
  }),
  h('path', {
    d: 'M 18,18 m 0,7.5 l -0,2.25',
    transform: 'rotate(240,18,18)',
    style:
      'fill: none; stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 1px;',
  }),
  h('path', {
    d: 'M 18,18 m 0,7.5 l -0,2.25',
    transform: 'rotate(270,18,18)',
    style:
      'fill: none; stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 1px;',
  }),
  h('path', {
    d: 'M 18,18 m 0,7.5 l -0,2.25',
    transform: 'rotate(300,18,18)',
    style:
      'fill: none; stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 1px;',
  }),
  h('path', {
    d: 'M 18,18 m 0,7.5 l -0,2.25',
    transform: 'rotate(330,18,18)',
    style:
      'fill: none; stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 1px;',
  }),
];</code></pre>
</details>

#### 任务

任务节点的扩展方式如下：

```tsx | purex | pure
import { TaskNodeFactory } from '@logicflow/extension'

// 例如，扩展一个脚本任务

const scriptTaskIcon = 'M6.402,0.5H20.902C20.902,0.5,15.069,3.333,15.069,6.083S19.486,12.083,19.486,15.25S15.319,20.333,15.319,20.333H0.235C0.235,20.333,5.235,17.665999999999997,5.235,15.332999999999998S0.6520000000000001,8.582999999999998,0.6520000000000001,6.082999999999998S6.402,0.5,6.402,0.5ZM3.5,4.5L13.5,4.5M3.8,8.5L13.8,8.5M6.3,12.5L16.3,12.5M6.5,16.5L16.5,16.5';

// TaskNodeFactory的第一个参数是节点类型；第二个参数是节点图标（可以说svg path也可以是h函数生成的svg）；第三个参数（可选的）需要给节点设置属性
const receiveTask = TaskNodeFactory('bpmn:scriptTask', scriptTaskIcon)

lf.register(receiveTask)
```

#### 网关

网关节点的扩展方式如下：

```tsx | purex | pure

import { GatewayNodeFactory } from '@logicflow/extension'

// 例如，扩展一个复杂网关
const complexIcon = 'm 23,13 0,7.116788321167883 -5.018248175182482,-5.018248175182482 -3.102189781021898,3.102189781021898 5.018248175182482,5.018248175182482 -7.116788321167883,0 0,4.37956204379562 7.116788321167883,0  -5.018248175182482,5.018248175182482 l 3.102189781021898,3.102189781021898 5.018248175182482,-5.018248175182482 0,7.116788321167883 4.37956204379562,0 0,-7.116788321167883 5.018248175182482,5.018248175182482 3.102189781021898,-3.102189781021898 -5.018248175182482,-5.018248175182482 7.116788321167883,0 0,-4.37956204379562 -7.116788321167883,0 5.018248175182482,-5.018248175182482 -3.102189781021898,-3.102189781021898 -5.018248175182482,5.018248175182482 0,-7.116788321167883 -4.37956204379562,0 z'

const complexGateway = GatewayNodeFactory('bpmn:complexGateway', complexIcon)
```

#### 子流程

*不支持扩展*

#### 流

流的扩展和自定义边的定义方法完全相同，参考 [边 edge](../basic/edge.zh.md)

#### 其他节点

其他类型的节点大家可以根据自己的需要通过自定义节点的方式进行扩展
