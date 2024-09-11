---
nav: Guide
group:
  title: Introduce
title: Getting Started
order: 1
toc: content
---

## Installation

### Command Installation

You can install using npm, yarn, or pnpm.

:::code-group

```bash [npm]
npm install @logicflow/core --save

# Plugin package (not needed if plugins are not used)
npm install @logicflow/extension --save
```

```bash [yarn]
yarn add @logicflow/core

# Plugin package (not needed if plugins are not used)
yarn add @logicflow/extension
```

```bash [pnpm]
pnpm add @logicflow/core

# Plugin package (not needed if plugins are not used)
pnpm add @logicflow/extension
```

:::

### Using CDN

LogicFlow requires including CSS files for its built-in styles in addition to the JS files.

- For versions 2.0 and later:

```html | pure
<!-- Include core package and corresponding CSS -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/index.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core/lib/style/index.min.css" rel="stylesheet">

<!-- Include extension package and corresponding CSS (not needed if plugins are not used) -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/dist/index.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.min.css" />
```

- For versions before 2.0:

```html | pure
<!-- Include core package and corresponding CSS -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core@1.2.27/dist/logic-flow.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core@1.2.27/dist/style/index.css" rel="stylesheet">

<!-- Include extension package and corresponding CSS (not needed if plugins are not used) -->
<!-- Note: For versions before 2.0, the extension scripts are exported separately -->
<!-- Therefore, the path needs to be specific to the package name, as shown below for the Menu plugin -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension@1.2.27/lib/Menu.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension@1.2.27/lib/style/index.css" />
```

By default, the CDN will include the latest version. To include a different version, refer to the specific package information here: <a href="https://www.jsdelivr.com/package/npm/@logicflow/core" target="_blank">core package</a>, <a href="https://www.jsdelivr.com/package/npm/@logicflow/extension" target="_blank">extension package</a>, and adjust the CDN path accordingly.

## Getting Started

### 1. Using in Native JS

```html | pure
<!-- Include core package And css -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/index.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@logicflow/core/lib/style/index.min.css" rel="stylesheet">

<!-- Create canvas container -->
<div id="container"></div>

<script>
// Include inheritance nodes. After including the core package, window.Core will be automatically attached.
// const { RectNode, RectNodeModel } = Core;

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

// Create canvas instance. You can also use new Core.LogicFlow.
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

### 2. Using in Frameworks

LogicFlow is packaged as a pure JS library using UMD, so it can be used in both Vue and React.

:::warning{title=Tip}
LogicFlow can be initialized without specifying canvas width and height; in this case, it will use the width and height of the container DOM node provided.

To ensure proper rendering of the canvas, make sure the container exists and has dimensions before initializing the LogicFlow instance.
:::

#### Using in React

<code id="use-in-react" src="../../src/tutorial/get-started/use-in-react"></code>

#### Using in Vue Framework

```vue
<template>
  <div class="container" ref="container"></div>
</template>

<script>
  import LogicFlow from "@logicflow/core";
  import "@logicflow/core/lib/style/index.css";
  // import "@logicflow/core/dist/style/index.css"; // For versions before 2.0

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

### 3. Using Plugins

LogicFlow's primary goal is to be an extensible flowchart tool to meet various business needs.

To ensure strong extensibility, all non-core features of LogicFlow are developed as plugins and placed in the `@logicflow/extension` package.

If you need to use plugins, you need to include the `@logicflow/extension` dependency and select the plugins based on your requirements.

For example, the control panel plugin provides zooming and fit-to-canvas capabilities, and also includes `redo` and `undo` functionality.

#### Installing and Using Plugins from CDN

- For versions 2.0 and later:

```html | pure
<!-- Include extension package -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/dist/index.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.min.css" />

<!-- Create canvas container -->
<div id="container"></div>
<script>
  // The Extension CDN exposes an Extension variable containing all plugins; use the plugins from Extension
  const { Control } = Extension;
  
  // Global level installation of the control panel plugin:
  Core.default.use(Control);
  
  // Instance level installation of the control panel plugin:
  const lf = new Core.default({
    ..., // Other configurations
    plugins: [Control],
  });
</script>
```

- For versions before 2.0:

```html | pure
<!-- Include extension package -->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension@1.2.27/lib/Control.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension@1.2.27/lib/style/index.css" />

<!-- Create canvas container -->
<div id="container"></div>
<script>
  // Global level installation of the control panel plugin:
  LogicFlow.use(Control);
  
  // Instance level installation of the control panel plugin:
  const lf = new LogicFlow({
    ..., // Other configurations
    plugins: [Control],
  });
</script>
```

#### Installing and Using Plugins from Commands

```js
import LogicFlow from "@logicflow/core";
import { Control } from "@logicflow/extension";

// Global usage: Every lf instance will have Control
LogicFlow.use(Control);
```

Example:

<code id="use-plugin" src="../../src/tutorial/get-started/use-plugin"></code>

For more information about plugin functionalities, please refer to the [Plugin Introduction](extension/intro.en.md).

### 4. Data Transformation

#### Getting Canvas Data

You can use the [getGraphData](../api/detail/index.en.md#getgraphdata) method to get the data of the LogicFlow canvas, including all nodes and edges data.

```js
const data = lf.getGraphData();
```

#### Custom Data Formats

In some scenarios where the data format requirements are specific, the default LogicFlow data format may not meet the business needs. Thus, we provide data transformation capabilities.

For data in bpmn format, you can use our [built-in data transformation](extension/adapter.en.md#use-the-built-in-data-conversion-tools) plugin to convert LogicFlow-generated data to bpmn-js data.

For more details on data transformation features, please refer to [Data Transformation](extension/adapter.en.md).