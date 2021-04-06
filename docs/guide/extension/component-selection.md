# 框选

## 启用

```ts
import LogicFlow from '@logicflow/core';
import { SelectionSelect } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css'

LogicFlow.use(SelectionSelect);
```

## 开启

引入组件后默认开启。

```ts
SelectionSelect.open();
```

> 使用多选组件时，需要在初始化 LogicFLow 时将编辑属性`stopMoveGraph`设置为`true`，或者使用[updateEditConfig](/api/logicFlowApi.html#updateeditconfig) API 来动态开启或关闭`stopMoveGraph`。

## 关闭

```ts
SelectionSelect.close();
```

<example href="/examples/#/extension/components/selection" :height="300" ></example>
