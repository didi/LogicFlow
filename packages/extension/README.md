# extension

LogicFlow 扩展包

## 安装

此包建立在 `@logicflow/core` 之上，使用方需要显式安装与其兼容的 core。

```shell
npm install @logicflow/core @logicflow/extension
```
or
```shell
yarn add @logicflow/core @logicflow/extension
```
or
```shell
pnpm add @logicflow/core @logicflow/extension
```

## 使用方式

```js
import LogicFlow from '@logicflow/core';
import { BpmnAdapter } from '@logicflow/extension';

LogicFlow.use(BpmnAdapter);
```
