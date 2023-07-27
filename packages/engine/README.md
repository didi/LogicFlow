# engine

一个可以在JavaScript环境执行的流程引擎

## 使用方式

```js
import LogicFlowEngine from '@logicflow/engine';

const flowModel = new LogicFlowEngine({
  graphData: {
    nodes: [],
    edges: [],
  },
  global: {
    // 全局数据
  }
});

flowModel.execute();

```
