---
nav: 指南
group:
  title: 进阶
  order: 2
title: React 自定义节点
order: 6
toc: content
tag: 新特性
---

:::info{title=我们带来了新特性，本节内容主要介绍}
- 如何使用 React 组件来注册节点内容
- properties 更新后如何同步更新节点内容
:::

## 渲染 React 组件为节点内容
我们虽然提供了通过继承 HTMLNode 自定义节点的能力，但从用户反馈来看，这种方式并不够直观且有可能因为销毁时机不对而出现性能问题。

因此我们提供了一个独立的包 `@logicflow/react-node-registry`，以一种更直观的方式来自定义节点，即通过 React 组件来注册节点。
它既可以直接使用系统中已引入的丰富的组件库，也可以使用 React 快捷的开发方式来自定义节点内容。

```tsx | pure
import { register, ReactNodeProps } from '@logicflow/react-node-registry'

// 自定义 React 组件
const NodeComponent: FC<ReactNodeProps> = ({ node }) => {
  const data = node.getData()
  if (!data.properties) data.properties = {}

  return (
    <div className="react-algo-node">
      <img src={require('@/assets/didi.png')} alt="滴滴出行" />
      <span>{data.properties.name as string}</span>
    </div>
  )
}

// 初始化 LogicFlow 实例
const lf = new LogicFlow({
  // ...options
})

// 注册自定义节点
register({
  type: 'custom-react-node',
  component: NodeComponent,
}, lf)

// 渲染自定义节点
const node = lf.addNode({
  id: 'react-node-1',
  type: 'custom-react-node',
  x: 80,
  y: 80,
  properties: {
    name: '今日出行',
    width: 120,
    height: 28,
  },
})
console.log('node --->>>', node)
```
<code id="react-basic" src="@/src/tutorial/advanced/react/index.tsx"></code>

## 更新节点
跟 `HTMLNode` 一样，当用户通过 `setProperties` 或 `setProperty` 等更新节点 properties 时，我们会自动更新节点内容。

```tsx | pure
const node1 = lf.addNode({
  id: 'react-node-1',
  type: 'custom-react-node',
  x: 80,
  y: 80,
  properties: {
    name: '今日出行',
    width: 120,
    height: 28,
  },
})

const update = () => {
  node1.setProperty('name', `今日出行 ${(this.count += 1)}`)
  this.timer = setTimeout(update, 1000)
}

update()

// 记得在 componentWillUnmount 中清除定时器
if (this.timer) {
  clearTimeout(this.timer)
}
```

## Portal 方式
上面的 React 组件渲染方式有一个缺点，因为内部是通过以下方式将组件渲染到节点的 DOM 中。
  
```tsx | pure
import { createRoot, Root } from 'react-dom/client'

const root = createRoot(container)
root.render(elem)
```

可以发现，React 组件已经不处于正常的渲染文档树中。所以它内部无法获取外部 Context 内容。如果有这种应用场景，可以使用 `Portal` 模式来渲染 React 组件。
<code id="react-portal" src="@/src/tutorial/advanced/react/Portal.tsx"></code>

