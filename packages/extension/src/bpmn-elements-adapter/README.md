## what's the difference?

和旧的bpmn-adapter相比，新的bpmn-adapter在调用adapterIn和adapterOut时，可以额外传入一个对象作为入参

``` ts
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

## 使用

``` ts
// step 1 引入adapter插件
import { BpmnXmlAdapterV2 } from '@logicflow/extension';
// step 2 注册插件
LogicFlow.use(BpmnXmlAdapterV2);
...
// step 3-1 调用默认导出
const xmlResult = lf.adapterOut(lf.getGraphRawData())
```

很多时候，我们可能需要一些额外的参数帮助我们正确的进行导入导出，这时我们需要用到上面提到的adapterOut额外的入参ExtraPropsType

``` ts
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

``` ts
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

在配置完需要的extraProps之后，我们就可以调用adapterOut方法导出数据。

``` ts

const xmlResult = lf.adapterOut(lf.getGraphRawData(), extraProps)
```

目前，我们内置了一下transformer **（仅做参考）**：

> 注意：这里内置的transformer仅做参考使用，这些transformer在编写的过程中是用来配合bpmn节点插件的，里面诸如`timerType`, `timerValue`, `definitionId`，都是通过bpmn节点插件的definitionConfig配置的。在实际使用该数据转换插件时，你完全可以不使用bpmn节点插件，通过你自己的方式为节点添加属性，自定义transformer来实现符合你需要的数据转换。

```ts

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

```ts

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