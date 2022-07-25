# layout

layout 扩展包

## 使用方式

```js
import LogicFlow from '@logicflow/core';
import { dagre } from '@logicflow/layout';

const lf = new LogicFlow({
  container: '#app',
  plugin: [dagre]
})

lf.extension.dagre.layout()
```
