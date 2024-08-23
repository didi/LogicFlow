---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 数据转换 (Adapter)
order: 10
toc: content
---

## LogicFlow 的数据格式

在 LogicFlow 中，一个流程图是由**节点**和**边**组成的。

- 对于一个节点，我们需要知道这个节点的 **id**、[类型](adapter.zh.md#类型)、**位置**、**文本**、[properties](adapter.zh#properties)
- 对于一个边，我们则需要知道这个边的 **id**、[类型](adapter.zh.md#类型)、起始节点 id（**sourceNodeId**
  ）、目标节点 id（**targetNodeId**）、**文本**、[properties](adapter.zh.md#properties) 以及边的起点位置（*
  *startPoint**），边的终点位置（**endPoint**）。

  - 折线的额外数据`pointsList`，因为折线是可以被用户手动调整的，所以增加此字段用于记录这个折线的具体路径。

### 类型

在 LogicFlow 中，一个节点宽、高、颜色等表示外观的信息都不会保存到数据中，而是统一使用这个节点的类型来表示。例如我们通过
LogicFlow 的自定义机制定义一个节点为“开始节点(startNode)”，那么当前的这个项目中，就应该是知道这个 type
为 startNode 的节点外观是什么样的。

### properties

properties 是 LogicFlow
预留给开发者的一个空对象，开发者可以基于这个属性来绑定任何数据。上面的类型中提到，一个节点具体外观是通过类型来确定。但是当在项目中，需要基于某些业务条件，将这个节点外观进行一些调整时，我们可以将这些业务条件放到
properties 中，然后在自定义节点的时候，通过`this.props.model`方法拿到 properties，然后基于 properties
中的内容重新设置这个节点的样式。

### 使用方法

```tsx | pure
lf.render({
  nodes: [
    {
      id: "1",
      type: "rect",
      x: 100,
      y: 100,
    },
    {
      id: "2",
      type: "circle",
      x: 300,
      y: 200,
    },
  ],
  edges: [
    {
      id: "edge1",
      type: "polyline",
      sourceNodeId: "1",
      targetNodeId: "2",
      startPoint: { x: 150, y: 100 },
      endPoint: { x: 250, y: 200 },
      pointList: [
        { x: 150, y: 100 },
        { x: 200, y: 100 },
        { x: 200, y: 200 },
        { x: 250, y: 200 },
      ],
    },
  ],
});
```

## 什么是数据转换工具

在某些情况下，LogicFlow 生成的数据格式可能不满足业务需要的格式。比如后端需要的数据格式是 bpmn-js
生成的格式，那么可以使用数据转换工具，将 LogicFlow 生成的数据转换为 bpmn-js 生成的数据。

## 如何自定义数据转换工具

自定义数据转换工具本质上是将用户传入的数据，通过一个`lf.adapterIn`方法，将其转换为 LogicFlow
可以识别的格式。然后在生成数据的时候，又通过`lf.adapterOut`方法将 LogicFlow
的数据转换为用户传入的数据。所以自定义数据转换工具我们只需要重新覆盖这两个方法即可。

```tsx | pure
const lf = new LogicFlow({
  container: document.querySelector("#app"),
});
lf.adapterIn = function(userData) {
  // 这里把userData转换为LogicFlow支持的格式
  return logicFlowData;
};
lf.adapterOut = function(logicFlowData) {
  // 这里把LogicFlow生成的数据转换为用户需要的格式。
  return userData;
};
// 如果需要额外的参数，你也可以这样定义
lf.adapterOut = function(logicFlowData, params, ...rest) {
  console.log(params, ...rest);
  return userData;
};
```

## 使用内置的数据转换工具

LogicFlow 内置通用的 bpmn-js 兼容的转换工具。可以支持将 LogicFlow 上绘制的图在 bpmn-js 上显示，也支持
bpmn-js 上绘制的图在 LogicFlow
上显示。[LogicFlow2Bpmn](https://github.com/didi/LogicFlow/tree/master/packages/extension/src/bpmn-adapter)

### bpmnAdapter

```tsx | purex | pure
import LogicFlow from "@logicflow/core";
import { BpmnAdapter } from "@logicflow/extension";

// 注册插件
LogicFlow.use(BpmnAdapter);

// 实例化 LogicFlow
const lf = new LogicFlow();
lf.render();

// 通过 getGraphData 来获取转换后的数据
// 1.2.5版本以后新增了getGraphData的入参，来保证某些adapterOut的正常执行，例如这里的bpmn-adapter的adapterOut有一个可选的入参数"retainedFields"
// 这意味着出现在这个数组里的字段当它的值是数组或是对象时不会被视为一个节点而是一个属性。我们定义了一些默认的属性字段，如"properties", "startPoint","endPoint", "pointsList"，显然这些字段并不足以满足数据处理的要求
// 所以为了保证导出数据中某些节点属性被正常处理，请按需传入属性保留字段的数组。e.g. lf.getGraphData(['attribute-a', 'attribute-b'])
lf.getGraphData();
```

### 转换结果示例

<!-- TODO -->
<a href="https://examples.logic-flow.cn/demo/dist/examples/#/extension/adapter?from=doc" target="_blank"> 去 CodeSandbox 查看示例</a>

## 新的BPMNAdapter

### what's the difference?

新的bpmn-adapter在之前的`BpmnAdapter`的基础上进行了一定程度的升级，在调用adapterIn和adapterOut时，可以额外传入一个对象作为入参

```tsx | pure
type ExtraPropsType = {
  /**
   * retainedAttrsFields retainedAttrsFields会和默认的defaultRetainedProperties:
   * ["properties", "startPoint", "endPoint", "pointsList"]合并
   * 这意味着出现在这个数组里的字段当它的值是数组或是对象时不会被视为一个节点而是一个属性
   */
  retainedAttrsFields?: string[];

  /**
   * excludeFields会和默认的defaultExcludeFields合并，
   * 出现在这个数组中的字段在导出时会被忽略
   */
  excludeFields?: {
    in?: Set<string>;
    out?: Set<string>;
  };

  /**
   * transformer是一个数组，数组中的每一项都是一个对象，对象中包含in和out两个属性
   * in函数接收两个参数key 和 data，key为当前处理对象的key也就是节点名称，data为当前对象，当导入时会调用这个函数，对被导入数据进行处理，得到我们期望的数据
   * out函数接收一个参数data，data为当前处理节点数据，当导出时会调用这个函数，对需要导出的数据进行处理，得到我们期望的数据
   */
  transformer?: {
    [key: string]: {
      in?: (key: string, data: any) => any;
      out?: (data: any) => any;
    }
  };

  mapping?: {
    in?: {
      [key: string]: string;
    };
    out?: {
      [key: string]: string;
    };
  };
};
```

### 使用

```tsx | pure
// step 1 引入adapter插件
import { BPMNAdapter } from '@logicflow/extension';
// step 2 注册插件
LogicFlow.use(BPMNAdapter)

// ...
// step 3-1 调用默认导出
const xmlResult = lf.adapterOut(lf.getGraphRawData())
```

很多时候，我们可能需要一些额外的参数帮助我们正确的进行导入导出，这时我们需要用到上面提到的adapterOut额外的入参ExtraPropsType

```tsx | pure
// step 3-2 使用adapterOut的第二个参数ExtraPropsType导出

// 假如我们节点属性中有一个panels属性，它是一个数组，但是我们不希望它被视为一个节点，而是一个属性，那么我们可以这样做
const extraProps = {
  retainedAttrsFields: ['panels']
}
// 假如我们节点属性中有一个runboost属性，但是我们希望导出时不包含这个属性，那么我们可以这样做
extraProps.excludeFields = {
  out: new Set(['runboost'])
}
```

假如我们要将包含判断条件的顺序流（sequenceFlow）以正确的XML格式导出，并且导入时正确处理得到我们想要的数据，那么我们可以这样做：

``` xml
<!-- 顺序流的XML数据格式： -->

<bpmn:sequenceFlow id="SequenceFlow_0j5q1qk" sourceRef="StartEvent_1" targetRef="Activity_0j5q1qk"/>

<!-- 包含判断条件时 -->

<bpmn:sequenceFlow id="SequenceFlow_0j5q1qk" sourceRef="StartEvent_1" targetRef="Activity_0j5q1qk">
    <bpmn:conditionExpression xsi:type="bpmn2:tFormalExpression">
        <![CDATA[${runboost === '1'}]]>
    </bpmn:conditionExpression>
</bpmn:sequenceFlow>
<!-- 或者 -->
<bpmn:sequenceFlow id="SequenceFlow_0j5q1qk" sourceRef="StartEvent_1" targetRef="Activity_0j5q1qk">
    <bpmn:conditionExpression xsi:type="bpmn2:tFormalExpression">
        runboost === '1'
    </bpmn:conditionExpression>
</bpmn:sequenceFlow>
```

```tsx | pure
/**
 * 以包含判断条件的顺序流为例，
 * 在进行导入时，我们需要把<bpmn:sequenceFlow>的子内容<bpmn:conditionExpression>内的属性提取出来，
 * 最终放入父元素bpmn:sequenceFlow的properties属性中
 * 所以导入的时候我们实际需要处理的<bpmn:conditionExpression>中的内容，
 * 它被处理后，数据会被合入bpmn:sequenceFlow的properties属性中
 */
extraProps.transformer = {
  'bpmn:sequenceFlow': {
    out(data: any) {
      const { properties: { expressionType, condition } } = data;
      if (condition) {
        if (expressionType === 'cdata') {
          return {
            json:
              `<bpmn:conditionExpression xsi:type="bpmn2:tFormalExpression"><![CDATA[\${${
                condition
              }}]]></bpmn:conditionExpression>`,
          };
        }
        return {
          json: `<bpmn:conditionExpression xsi:type="bpmn2:tFormalExpression">${condition}</bpmn:conditionExpression>`,
        };
      }
      return {
        json: '',
      };
    },
  },
  // 返回的数据会被合并进父元素bpmn:sequenceFlow的properties属性中
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

***数据导入导出的原则是：导出时处理父元素；导入时处理子元素。***

- 导出时，需要从父元素的属性中拿到子元素需要到数据并拼接出子元素。
- 导入时，需要从子元素中提取我们需要的数据放入父元素的属性中。

在配置完需要的extraProps之后，我们需要在注册插件时传入

```tsx | pure
Logicflow.use(BPMNAdapter, extraProps)
```

目前，我们内置了一下transformer **（仅做参考）**：

>
注意：这里内置的transformer仅做参考使用，这些transformer在编写的过程中是用来配合bpmn节点插件的，里面诸如`timerType`, `timerValue`, `definitionId`
，都是通过bpmn节点插件的definitionConfig配置的。在实际使用该数据转换插件时，你完全可以不使用bpmn节点插件，通过你自己的方式为节点添加属性，自定义transformer来实现符合你需要的数据转换。

```tsx | purex | pure

let defaultTransformer: TransformerType = {
  'bpmn:startEvent': {
    out(data: any) {
      const { properties } = data;
      return defaultTransformer[properties.definitionType]?.out(data) || {};
    },
  },
  'bpmn:intermediateCatchEvent': {
    out(data: any) {
      const { properties } = data;
      return defaultTransformer[properties.definitionType]?.out(data) || {};
    },
  },
  'bpmn:intermediateThrowEvent': {
    out(data: any) {
      const { properties } = data;
      return defaultTransformer[properties.definitionType]?.out(data) || {};
    },
  },
  'bpmn:boundaryEvent': {
    out(data: any) {
      const { properties } = data;
      return defaultTransformer[properties.definitionType]?.out(data) || {};
    },
  },
  'bpmn:sequenceFlow': {
    out(data: any) {
      const {
        properties: { expressionType, condition },
      } = data;
      if (condition) {
        if (expressionType === 'cdata') {
          return {
            json:
              `<bpmn:conditionExpression xsi:type="bpmn2:tFormalExpression"><![CDATA[\${${
                condition
              }}]]></bpmn:conditionExpression>`,
          };
        }
        return {
          json: `<bpmn:conditionExpression xsi:type="bpmn2:tFormalExpression">${condition}</bpmn:conditionExpression>`,
        };
      }
      return {
        json: '',
      };

    },
  },
  'bpmn:timerEventDefinition': {
    out(data: any) {
      // 这里的timerType, timerValue, definitionId 
      // 都是通过通过的Bpmn节点插件扩展节点时，通过definitionConfig配置的属性，实际使用时需要根据自己的设置的属性对out函数进行修改
      const {
        properties: { timerType, timerValue, definitionId },
      } = data;

      const typeFunc = () => `<bpmn:${timerType} xsi:type="bpmn:tFormalExpression">${timerValue}</bpmn:${timerType}>`;

      return {
        json:
          `<bpmn:timerEventDefinition id="${definitionId}"${
            timerType && timerValue
              ? `>${typeFunc()}</bpmn:timerEventDefinition>`
              : '/>'}`,
      };
    },
    in(key: string, data: any) {
      const definitionType = key;
      const definitionId = data['-id'];
      let timerType = '';
      let timerValue = '';
      for (const key of Object.keys(data)) {
        if (key.includes('bpmn:')) {
          [, timerType] = key.split(':');
          timerValue = data[key]?.['#text'];
        }
      }
      return {
        '-definitionId': definitionId,
        '-definitionType': definitionType,
        '-timerType': timerType,
        '-timerValue': timerValue,
      };
    },
  },
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
};

```

传入的transformer和默认的transformer会通过

```tsx | purex | pure

const mergeInNOutObject = (target: any, source: any): TransformerType => {
  const sourceKeys = Object.keys(source);
  sourceKeys.forEach((key) => {
    if (target[key]) {
      const { in: fnIn, out: fnOut } = source[key];
      if (fnIn) {
        target[key].in = fnIn;
      }
      if (fnOut) {
        target[key].out = fnOut;
      }
    } else {
      target[key] = source[key];
    }
  });
  return target;
};
```
