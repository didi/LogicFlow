# @logicflow/vue-node-registry

LogicFlow Shape for rendering Vue components.

## Installation

此包将 Vue 组件桥接到 LogicFlow 节点系统，`@logicflow/core` 和 `vue` 需要由使用方显式提供。Vue 2 场景下，如果项目未通过 `vue-demi` 自动满足要求，还需要安装 `@vue/composition-api`。

```shell
npm install @logicflow/core @logicflow/vue-node-registry vue
```
or
```shell
yarn add @logicflow/core @logicflow/vue-node-registry vue
```
or
```shell
pnpm add @logicflow/core @logicflow/vue-node-registry vue
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
