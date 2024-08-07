---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: BpmnElement
order: 11
toc: content
---

> BPMN is one of the more well-known modeling language standards for workflow. LogicFlow implements
> the BPMN extension, which allows you to use LogicFlow directly to draw processes compatible with
> the
> BPMN 2.0 specification, and its exported data can be run on the Activity process engine.

LogicFlow provides [custom-node](../basic/node.en.md) and [custom-edge](../basic/edge.en.md) to
implement nodes and edges that meet the BPMN2.0 specification. Then use
the [extension-adapter](adapter.en.md) to convert the generated data to the format required by
Activity.

:::info
In real projects, we recommend developers to fully customize the project's nodes and data
transformations instead of using our provided bpmnElement and bpmnAdapter plugins. Our built-in
plugins only include very basic demo functionality and do not support more bpmn elements and custom
properties. You can refer to our bpmnElement and bpmnAdapter plug-ins to re-implement a set of node
and data format conversion plug-ins locally to meet the needs of your own products. One of the
reasons we developed LogicFlow is that we want the front-end to be able to reflect all the business
logic in the code, so that the front-end development can be closer to the business instead of
handing over the business logic to third-party libraries.
:::

## Usage

```tsx | pure
<script src="/logic-flow.js"></script>
<script src="/lib/BpmnElement.js"></script>
<script src="/lib/BpmnAdapter.js"></script>
<script>
  LogicFlow.use(BpmnElement);
  LogicFlow.use(BpmnAdapter); </script>
```

<!-- TODO -->
<a href="https://examples.logic-flow.cn/demo/dist/examples/#/extension/bpmn-elements?from=doc" target="_blank"> Go to CodeSandbox for examples </a>

## Conversion to XML

`BpmnAdapter` supports interconversion between BPMN json and LogicFlow data, if you want to convert
LogicFlow data to XML, you can use `BpmnXmlAdapter`.

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
      text: "end",
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
      text: "UserTask",
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
      text: "System",
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

For the complete BPMN Case Tool go to [Example](https://site.logic-flow.cn/examples/#/gallery)。

## New BPMNElement

```tsx | purex | pure
import { BPMNElements } from '@logicflow/extension'

```

### Built-in base nodes

#### events

**startEvent (bpmn:startEvent)**

- Start event
- Interrupting sub-process event (distinguished from the start event by the isInterrupting
  attribute, i.e., whether there is an isInterrupting attribute, `isInterrupting = 'false'`)
- Non-interrupting sub-process events (distinguished from start events by the isInterrupting
  attribute, i.e., with or without the isInterrupting attribute, `isInterrupting = 'true'`)

**Boundary event (bpmn:boundaryEvent)**

- Interrupt boundary event (property `cancelActivity = 'true'`)
- Non-interrupt boundary event (property `cancelActivity = 'false'`)

**Intermediate events

- Catch event (bpmn:intermediateCatchEvent)

- Throw event (bpmn:intermediateThrowEvent)

** end event (bpmn:endEvent)**

#### Tasks

- Service Task (bpmn:serviceTask)
- userTask (bpmn:userTask)

#### gateway

- Parallel Gateway (bpmn:parallelGateway)
- Exclusive Gateway (bpmn:exclusiveGateway)
- inclusiveGateway (bpmn:inclusiveGateway)

#### Subprocesses

- Embedded SubProcess (bpmn:subProcess)

#### flow

- Sequence Flow (bpmn:sequenceFlow) The style of a sequence flow can be changed with
  the `isDefaultFlow` attribute.

### Node extensions

#### events

On top of the base node, we need to extend the event node by defining the definition attribute.

```tsx | pure
import { h } from '@logicflow/core'

// For example, we want to extend the time start event, the time capture event, the time boundary event
const [definition, setDefinition] = lf.useDefinition()
const customDefinition = [
  {
    // startEvent、intermediateCatchEvent、boundaryEvent add definition
    nodes: ['startEvent', 'intermediateCatchEvent', 'boundaryEvent'],
    definition: {
      /**
       * The type attribute of the definition, which corresponds to the node name in the XML data
       * For example the XML data for a time non-disruptive boundary event is as follows:
       * <bpmn:boundaryEvent id="BoundaryEvent_1" cancelActivity="false" attachedToRef="Task_1">
       *  <bpmn:timerEventDefinition>
       *   <bpmn:timeDuration>
       *    P1D
       *   </bpmn:timeDuration>
       *  </bpmn:timerEventDefinition>
       * </bpmn:boundaryEvent>
       */
      type: 'bpmn:timerEventDefinition',
      // The icon can be the path m of the svg, or the svg generated by the h function exported from @logicflow/core, in this case the svg generated by the h function.
      icon: timerIcon,
      /**
       * Properties needed for the corresponding definition, e.g. timerType and timerValue in this case.
       * timerType value can be "timeCycle", "timerDate", "timeDuration", used to differentiate between <bpmn:timeCycle/>, <bpmn:timeDate/> and <bpmn:timeDuration/>.
       * timerValue is the cron expression for timerType.
       * Eventually it will generate `<bpmn:${timerType} xsi:type="bpmn:tFormalExpression">${timerValue}</bpmn:${timerType}>`
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
  <summary>The definition of timerIcon is as follows：</summary>
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

#### Tasks

Task nodes are extended in the following way:

```tsx | purex | pure
import { TaskNodeFactory } from '@logicflow/extension'

// For example, extend a script task

const scriptTaskIcon = 'M6.402,0.5H20.902C20.902,0.5,15.069,3.333,15.069,6.083S19.486,12.083,19.486,15.25S15.319,20.333,15.319,20.333H0.235C0.235,20.333,5.235,17.665999999999997,5.235,15.332999999999998S0.6520000000000001,8.582999999999998,0.6520000000000001,6.082999999999998S6.402,0.5,6.402,0.5ZM3.5,4.5L13.5,4.5M3.8,8.5L13.8,8.5M6.3,12.5L16.3,12.5M6.5,16.5L16.5,16.5';

// The first parameter of the TaskNodeFactory is the node type; the second parameter is the node icon (either the svg path or the svg generated by the h function); and the third (optional) parameter is needed to set properties for the node

const receiveTask = TaskNodeFactory('bpmn:scriptTask', scriptTaskIcon)

lf.register(receiveTask)
```

#### Gateway

Gateway nodes are extended in the following ways:

```tsx | purex | pure

import { GatewayNodeFactory } from '@logicflow/extension'

// For example, extending a complex gateway
const complexIcon = 'm 23,13 0,7.116788321167883 -5.018248175182482,-5.018248175182482 -3.102189781021898,3.102189781021898 5.018248175182482,5.018248175182482 -7.116788321167883,0 0,4.37956204379562 7.116788321167883,0  -5.018248175182482,5.018248175182482 l 3.102189781021898,3.102189781021898 5.018248175182482,-5.018248175182482 0,7.116788321167883 4.37956204379562,0 0,-7.116788321167883 5.018248175182482,5.018248175182482 3.102189781021898,-3.102189781021898 -5.018248175182482,-5.018248175182482 7.116788321167883,0 0,-4.37956204379562 -7.116788321167883,0 5.018248175182482,-5.018248175182482 -3.102189781021898,-3.102189781021898 -5.018248175182482,5.018248175182482 0,-7.116788321167883 -4.37956204379562,0 z'

const complexGateway = GatewayNodeFactory('bpmn:complexGateway', complexIcon)
```

#### Subprocesses

*Extensions not supported*

#### Streams

Streams can be extended in exactly the same way as custom edges are defined,
see [edge](../basic/edge.en.md)

#### Other Nodes

Other types of nodes can be extended by customizing the nodes according to your needs.
