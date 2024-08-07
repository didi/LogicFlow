---
nav: guide
group:
  title: Plug-in functionality
  order: 3
title: Highlight
order: 12
toc: content
---

When the number of elements on a canvas gradually increases, it becomes more difficult to quickly identify which node is currently in focus. How many lines are connected to it and which nodes are connected to it will gradually increase. In order to facilitate the user to quickly see clearly the currently focused node. We provide a highlighting function for the associated information of the focal node.

## Enable

```tsx | purex | pure

import LogicFlow from '@logicflow/core'
import { Highlight } from '@logicflow/extension'
import '@logicflow/extension/es/index.css'

LogicFlow.use(Highlight)

```

## Configuration items

| Field  | Type    | Function                                                     | Required | Description                                                                                                                                                                                                                                                                         |
|--------|---------|--------------------------------------------------------------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| mode   | string  | Highlight type, used to control the highlight display effect |          | This configuration item supports three values: <br/>1. 'single': Highlight the current node/edge<br/>2. 'path': Highlight all edges and nodes on the path of the current node/edge<br/>3. 'neighbour': Highlight all edges and nodes directly associated with the current node/edge |
| enable | boolean | Whether to enable highlighting                               |          | This configuration item is used to control whether to display the highlighting effect                                                                                                                                                                                               |

## Default state
By default, the highlight plug-in is enabled, using the mode of highlighting all edges and nodes on the path of the current node/edge. It will take effect when the mouse moves into the node.

## API
The Highlight plug-in provides an API for modifying the state:

### setMode
Set the highlighting mode, usage:
```tsx | purex | pure
lf.extension.highlight.setMode('single');

```
### setEnable
Set the enable state, usage:
```tsx | purex | pure
// Set to disable highlighting
lf.extension.highlight.setEnable(false);

```
