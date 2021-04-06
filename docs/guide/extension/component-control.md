# 控制面板

## 启用

```ts
import LogicFlow from '@logicflow/core';
import { Control } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css'

LogicFlow.use(Control);
```

注册`Control`组件后，Logic Flow 会在画布右上方创建一个控制面板，如下所示

<example href="/examples/#/extension/components/control" :height="190" ></example>

控制面板提供了常见的能力，放大缩小或者自适应画布的能力，同时也内置了 redo 和 undo 的功能，当然如果你不喜欢这样的 UI或功能，也可以基于`LogicFlow`提供的 [API](/api/logicFlowApi.html) 自己定义。
