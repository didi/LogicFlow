# 边上插入节点 InsertNodeInPolyline
## 功能
拖动节点到边中间，自动成为边中间的点。
举例：存在一条节点A到节点B的折线E，拖拽一个节点N到折线E上，当节点N的中心点恰好在折线E的路径上时松开鼠标，这时节点N就成为A与B的中间节点，原来的边E被删除，生成两条新的折线，分别是A到N，N到B。示例如下。
<example href="/examples/#/extension/InserNodeInPolyline" :height="450" ></example>

## 支持
目前仅支持折线

## 使用
```js
import LogicFlow from '@logicflow/core';
import "@logicflow/core/dist/style/index.css";
import { InsertNodeInPolyline } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css'
LogicFlow.use(InsertNodeInPolyline);
```
## 个性化配置
节点拖拽分为2种情况：
- 第一种是从控制面板拖拽到画布中，调用Dnd的Api进行节点添加，本插件默认支持。关闭此功能设置如下：
    ```js
    InsertNodeInPolyline.dndAdd = false;
    ```
- 第二种是画布中的游离节点，即与其他节点没有边的节点，拖拽调整位置到边上，本插件默认支持。关闭此功能设置如下：
    ```js
    InsertNodeInPolyline.dropAdd = false;
    ```