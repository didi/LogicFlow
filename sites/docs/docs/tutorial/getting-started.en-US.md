---
nav: Guide
group:
  title: Introduce
title: Getting Started
order: 1
toc: content
---

# Getting Started

## Installation

- Command installation: Install by using npm, yarn, or pnpm.

:::code-group

```bash [npm]
npm install @logicflow/core --save
```

```bash [yarn]
yarn add @logicflow/core
```

```bash [pnpm]
pnpm install @logicflow/core
```

:::

- Directly import with `<script>`

  Since LogicFlow itself has some preset styles, in addition to importing js, you also need to `import css`.

```html
<!-- Import the core package. -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core@2.0.0-beta.2/dist/index.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core@2.0.0-beta.2/lib/style/index.min.css" rel="stylesheet">

```
  The current latest version is 2.0.0-beta.2. For other versions, please check: https://www.jsdelivr.com/package/npm/@logicflow/core

## Getting Started

### 1. Direct `<script>` Usage

```html
<!-- Import the core package -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core@2.0.0-beta.2/dist/index.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core@2.0.0-beta.2/lib/style/index.min.css" rel="stylesheet">

<!-- Create canvas container -->
<div id="container"></div>

<script>
// Prepare graph data
const data = {
  // Nodes
  nodes: [
    {
      id: '21',
      type: 'rect',
      x: 100,
      y: 200,
      text: 'rect node',
    },
    {
      id: '50',
      type: 'circle',
      x: 300,
      y: 400,
      text: 'circle node',
    },
  ],
  // Edges
  edges: [
    {
      type: 'polyline',
      sourceNodeId: '50',
      targetNodeId: '21',
    },
  ],
}
// Create instance of LogicFlow
const lf = new Core.default({
  container: document.querySelector('#container'),
  width: 700,
  height: 500,
  grid: true,
})

// Render canvas instance
lf.render(data)
</script>
```

### 2. Usage in React Framework

LogicFlow itself is packaged as pure JS with UMD, making it compatible with both Vue and React frameworks. One key point to note is that when initializing a LogicFlow instance, the container parameter must refer to an existing DOM node to avoid errors.

```jsx
import LogicFlow from "@logicflow/core";
import "@logicflow/core/dist/index.css";
import { useEffect, useRef } from "react";

export default function App() {
  const refContainer = useRef();
  const data = {
    // Nodes
    nodes: [
      {
        id: '21',
        type: 'rect',
        x: 300,
        y: 100,
        text: 'rect node',
      },
      {
        id: '50',
        type: 'circle',
        x: 500,
        y: 100,
        text: 'circle node',
      },
    ],
    // Edges
    edges: [
      {
        type: 'polyline',
        sourceNodeId: '50',
        targetNodeId: '21',
      },
    ],
  }
  useEffect(() => {
    const logicflow = new LogicFlow({
      container: refContainer.current,
      grid: true,
      height: 200
    });
    logicflow.render(data);
  }, []);
  return <div className="App" ref={refContainer}></div>;
}
```
### 3. Usage in Vue Framework

```vue
<template>
  <div class="container" ref="container"></div>
</template>

<script>
import LogicFlow from "@logicflow/core";
import "@logicflow/core/dist/style/index.css";

export default {
  mounted() {
    this.lf = new LogicFlow({
      container: this.$refs.container,
      grid: true,
    });
    this.lf.render();
  },
};
</script>

<style scoped>
.container {
  width: 1000px;
  height: 500px;
}
</style>
```

:::warning{title=warning}
LogicFlow supports initializing without specifying container width and height parameters, in which case it will default to the width and height of the container. Ensure that the container has its dimensions set when initializing LogicFlow.
:::