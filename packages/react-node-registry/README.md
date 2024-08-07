# @logicflow/react-node-registry

LogicFlow Shape for rendering React components.

## Installation
```shell
npm install @logicflow/react-node-registry
```
or
```shell
yarn add @logicflow/react-node-registry
```
or
```shell
pnpm add @logicflow/react-node-registry
```

## Usage
用户自定义 React 节点 CustomReactComp 

我们需要将该内容注册到某个地方

1. 如果基于默认的 HTML 节点，只是调整节点里面的内容，

```typescript
register({
  type: 'custom-react-shape',
  view: ReactComponent,
  model: ReactNodeModel,
}, lf)
```

1. 注册节点
2. `view` 为 React 组件（基于 HTMLNode 自定义）
3. `model` 为节点数据模型
