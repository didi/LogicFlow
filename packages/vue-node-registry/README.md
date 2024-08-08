# @logicflow/vue-node-registry

LogicFlow Shape for rendering Vue components.

## Installation
```shell
npm install @logicflow/vue-node-registry
```
or
```shell
yarn add @logicflow/vue-node-registry
```
or
```shell
pnpm add @logicflow/vue-node-registry
```

## Usage
用户自定义 Vue 节点 CustomVueComponent

我们需要将该内容注册到某个地方

1. 如果基于默认的 HTML 节点，只是调整节点里面的内容，

```typescript
register({
  type: 'custom-vue-shape',
  view: VueComponent,
  model: VueNodeModel,
}, lf)
```

1. 注册节点
2. `view` 为 Vue 组件（基于 HTMLNode 自定义）
3. `model` 为节点数据模型
