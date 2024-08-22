---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 边上插入节点 (InsertNodeInPolyline)
order: 9
toc: content
---

## 功能

拖动节点到边中间，自动成为边中间的点。
举例：存在一条节点 A 到节点 B 的折线 E，拖拽一个节点 N 到折线 E 上，当节点 N 的中心点恰好在折线 E
的路径上时松开鼠标，这时节点 N 就成为 A 与 B 的中间节点，原来的边 E 被删除，生成两条新的折线，分别是 A 到
N，N 到 B。示例如下。

<!-- TODO -->
<a href="https://examples.logic-flow.cn/demo/dist/examples/#/extension/InserNodeInPolyline?from=doc" target="_blank"> 去 CodeSandbox 查看示例</a>

## 支持

目前仅支持折线

## 使用

```tsx | pure
import LogicFlow from '@logicflow/core'
import '@logicflow/core/lib/style/index.css'
import { InsertNodeInPolyline } from '@logicflow/extension'
import '@logicflow/extension/lib/style/index.css'

LogicFlow.use(InsertNodeInPolyline)
```

## 个性化配置

节点拖拽分为 2 种情况：

- 第一种是从控制面板拖拽到画布中，调用 Dnd 的 Api 进行节点添加，本插件默认支持。关闭此功能设置如下：
  ```tsx | pure
  InsertNodeInPolyline.dndAdd = false;
  ```
- 第二种是画布中的游离节点，即与其他节点没有边的节点，拖拽调整位置到边上，本插件默认支持。关闭此功能设置如下：
  ```tsx | pure
  InsertNodeInPolyline.dropAdd = false;
  ```
