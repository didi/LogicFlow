---
nav: Guide
group:
  title: Intermediate
  order: 2
title: React Node Registry
order:  6
toc: content
tag: New
---

:::info{title=New-Features-Introduction}
- How to use React components to register node content
- How to synchronize node content updates when properties change
:::

## Rendering React Components as Node Content
Although we provide the capability to customize nodes by extending `HTMLNode`, user feedback indicates that this approach is not very intuitive and may cause performance issues due to improper destruction timing.

Therefore, we offer a separate package `@logicflow/react-node-registry` to customize nodes in a more intuitive way by registering nodes through React components. This allows you to use the rich component libraries already included in the system or to quickly develop custom node content using React's convenient development features.

```tsx | pure
import { register, ReactNodeProps } from '@logicflow/react-node-registry'

// Custom React component
const NodeComponent: FC<ReactNodeProps> = ({ node }) => {
  const data = node.getData()
  if (!data.properties) data.properties = {}

  return (
    <div className="react-algo-node">
      <img src={require('@/assets/didi.png')} alt="DiDi" />
      <span>{data.properties.name as string}</span>
    </div>
  )
}

// Initialize LogicFlow instance
const lf = new LogicFlow({
  // ...options
})

// Register custom node
register({
  type: 'custom-react-node',
  component: NodeComponent,
}, lf)

// Render custom node
const node = lf.addNode({
  id: 'react-node-1',
  type: 'custom-react-node',
  x: 80,
  y: 80,
  properties: {
    name: 'Today's Trip',
    width: 120,
    height: 28,
  },
})
console.log('node --->>>', node)
```
<code id="react-basic" src="@/src/tutorial/advanced/react/index.tsx"></code>

## Updating Nodes
Similar to `HTMLNode`, when users update node properties using `setProperties` or `setProperty`, the node content is automatically updated.

```tsx | pure
const node1 = lf.addNode({
  id: 'react-node-1',
  type: 'custom-react-node',
  x: 80,
  y: 80,
  properties: {
    name: 'Today's Trip',
    width: 120,
    height: 28,
  },
})

const update = () => {
  node1.setProperty('name', `Today's Trip ${(this.count += 1)}`)
  this.timer = setTimeout(update, 1000)
}

update()

// Remember to clear the timer in componentWillUnmount
if (this.timer) {
  clearTimeout(this.timer)
}
```

## Portal Mode
One drawback of the React component rendering method mentioned above is that the component is rendered into the node's DOM using the following method:

```tsx | pure
import { createRoot, Root } from 'react-dom/client'

const root = createRoot(container)
root.render(elem)
```

As a result, the React component is no longer part of the normal rendering document tree. This means it cannot access external Context content. If you have such use cases, you can use the `Portal` mode to render React components.

<code id="react-portal" src="@/src/tutorial/advanced/react/Portal.tsx"></code>
