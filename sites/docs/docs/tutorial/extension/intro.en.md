---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: Plug-in Introduction
order: 0
toc: content
---

> LogicFlow's original goal was to support an extensible process mapping tool that could be used to meet a variety of business needs. In order to make LogicFlow extensible enough, LogicFlow develops all non-core functionality using plug-ins, and then puts these plug-ins into the `@logicflow/extension` package.

## Usage Guidelines

The `@logicflow/extension` package provides a number of out-of-the-box components that quickly support common features in the product, such as the control panel, right-click menus, and more.

```tsx | purex | pure
import LogicFlow from '@logicflow/core'
import { Control, Menu, DndPanel } from '@logicflow/extension'
import '@logicflow/extension/lib/style/index.css'

LogicFlow.use(Control)
LogicFlow.use(Menu)
LogicFlow.use(DndPanel)
```


### Installation of global plug-ins

npm:
```tsx | pure
import { BpmnElement } from '@logicflow/extension'

LogicFlow.use(BpmnElement)
```

cdn:
```tsx | pure
<!--LogicFlow core-css-->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/style/index.css" />
<!--LogicFlow extension-css-->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.css" />
<!--LogicFlow core-js-->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/logic-flow.js"></script>
<!--LogicFlow's plug-ins support individual introductions, here's an example of a menu plug-in-->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/Menu.js"></script>
<script>
  LogicFlow.use(Menu);
</script>
```

### Installing plugins on instances

`v1.0.7` Added

When a single-page application has multiple pages that use LogicFlow, different pages may use different plugins.LogicFlow is initialized by passing the plugin as a parameter to the constructor, at which point the plugin overrides the global plugin.

```tsx | pure
import LogicFlow from "@logicflow/core";
import { DndPanel, SelectionSelect } from "@logicflow/extension";
import "@logicflow/core/lib/style/index.css";
// import "@logicflow/core/dist/style/index.css"; // Introduced before version 2.0
import "@logicflow/extension/lib/style/index.css";

const lf = new LogicFlow({
  container: document.querySelector("#app"),
  grid: true,
  plugins: [DndPanel, SelectionSelect]
});
```
