---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: InsertNodeInPolyline
order: 9
toc: content
---

## Function

Drag a node to the center of an edge, it will automatically become the point in the center of the
edge.
Example: There is a line E from node A to node B, drag a node N to the line E, release the mouse
when the center of node N is exactly on the path of the line E, then node N becomes the middle node
between A and B, the original edge E is deleted, and two new lines are generated, respectively A to
N and N to B. The examples are as follows.

<!-- TODO -->
<a href="https://examples.logic-flow.cn/demo/dist/examples/#/extension/InserNodeInPolyline?from=doc" target="_blank"> Go to CodeSandbox for examples </a>

## Support

Currently only the fold line is supported

## Use

```tsx | pure
import LogicFlow from '@logicflow/core'
import '@logicflow/core/lib/style/index.css'
import { InsertNodeInPolyline } from '@logicflow/extension'
import '@logicflow/extension/lib/style/index.css'

LogicFlow.use(InsertNodeInPolyline)
```

## Personalized Configuration

There are 2 types of node drag and drop:

- The first one is dragging and dropping nodes from the control panel to the canvas, calling Dnd's
  Api to add nodes, which is supported by this plugin by default. Disable this function as follows:
  ```tsx | pure
  InsertNodeInPolyline.dndAdd = false;
  ```
- The second is the free node in the canvas, i.e. the node that has no edges with other nodes, drag
  and drop to adjust the position to the edges, which is supported by this plugin by default.
  Disable this function as follows:
  ```tsx | pure
  InsertNodeInPolyline.dropAdd = false;
  ```
