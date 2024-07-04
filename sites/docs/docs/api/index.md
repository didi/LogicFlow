---
nav: API
title: 实例
toc: content
order: 0
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

# LogicFlow

## 实例

流程图上所有的节点实例操作以及事件，行为监听都在 `LogicFlow` 实例上进行。

`LogicFlow`配置项:  [constructor](./detail/constructor.md)

## 实例方法

### Register 相关

| 选项  | 描述           |
|:--------------------|-------------------------|
| [register](./detail/index.md#register) | 注册自定义节点、边。|
| [batchRegister](./detail/index.md#batchregister) | 批量注册。        |

### Node 相关

| 选项  | 描述           |
|:---------------------|-------------------------|
| [addNode](./detail/index.md#addnode)           | 在图上添加节点。     |
| [deleteNode](./detail/index.md#deletenode)     | 删除图上的节点, 如果这个节点上有连接线，则同时删除线。 |
| [cloneNode](./detail/index.md#clonenode)       | 克隆节点。        |
| [changeNodeId](./detail/index.md#changenodeid) | 修改节点的`id`， 如果不传新的`id`，会内部自动创建一个。             |
| [changeNodeType](./detail/index.md#changenodetype)           | 修改节点类型。      |
| [getNodeModelById](./detail/index.md#getnodemodelbyid)       | 获取节点的`model`。|
| [getNodeDataById](./detail/index.md#getnodedatabyid)         | 获取节点的`model`数据。|
| [getNodeIncomingEdge](./detail/index.md#getnodeincomingedge) | 获取所有以此节点为终点的边。 |
| [getNodeOutgoingEdge](./detail/index.md#getnodeoutgoingedge) | 获取所有以此节点为起点的边。 |
| [getNodeIncomingNode](./detail/index.md#getnodeincomingnode) | 获取节点所有的上一级节点。|
| [getNodeOutgoingNode](./detail/index.md#getnodeoutgoingnode) | 获取节点所有的下一级节点。|

### Edge 相关

| 选项  | 描述           |
|:---------------------|-------------------------|
| [setDefaultEdgeType](./detail/index.md#setdefaultedgetype)   | 设置边的类型, 也就是设置在节点直接由用户手动绘制的连线类型。|
| [addEdge](./detail/index.md#addedge)           | 创建连接两个节点的边。  |
| [getEdgeDataById](./detail/index.md#getedgedatabyid)         | 通过`id`获取边的数据。|
| [getEdgeModelById](./detail/index.md#getedgemodelbyid)       | 基于边 `id` 获取边的`model`。        |
| [getEdgeModels](./detail/index.md#getedgemodels)             | 获取满足条件边的`model`。             |
| [changeEdgeId](./detail/index.md#changeedgeid) | 修改边的 `id`， 如果不传新的 `id`，会内部自动创建一个。            |
| [changeEdgeType](./detail/index.md#changeedgetype)           | 切换边的类型。      |
| [deleteEdge](./detail/index.md#deleteedge)     | 基于边`id`删除边。  |
| [deleteEdgeByNodeId](./detail/index.md#deleteedgebynodeid)   | 删除与指定节点相连的边, 基于边起点和终点。       |
| [getNodeEdges](./detail/index.md#getnodeedges) | 获取节点连接的所有边的`model`。          |

### Element 相关

| 选项  | 描述           |
|:---------------------|-------------------------|
| [addElements](./detail/index.md#addelements)   | 批量添加节点和边。    |
| [selectElementById](./detail/index.md#selectelementbyid)     | 将图形选中。       |
| [getSelectElements](./detail/index.md#getselectelements)     | 获取选中的所有元素。   |
| [clearSelectElements](./detail/index.md#clearselectelements) | 取消所有元素的选中状态。 |
| [getModelById](./detail/index.md#getmodelbyid) | 基于节点或边 `id` 获取其 `model`。     |
| [getDataById](./detail/index.md#getdatabyid)   | 基于节点或边 `id` 获取其 `data`。      |
| [deleteElement](./detail/index.md#deleteelement)             | 删除元素。        |
| [setElementZIndex](./detail/index.md#setelementzindex)       | 设置元素的 `zIndex`。|
| [getAreaElement](./detail/index.md#getareaelement)           | 获取指定区域内的所有元素(此区域必须是 DOM 层)。  |
| [setProperties](./detail/index.md#setproperties)             | 设置节点或者边的自定义属性。 |
| [getProperties](./detail/index.md#getproperties)             | 获取节点或者边的自定义属性。 |
| [deleteProperty](./detail/index.md#deleteproperty)           | 删除节点属性。      |
| [updateAttributes](./detail/index.md#updateattributes)       | 修改对应元素 `model` 中的属性。         |

### Text 相关

| 选项  | 描述           |
|:---------------------|-------------------------|
| [editText](./detail/index.md#edittext)            | 显示节点、连线文本编辑框, 进入编辑状态，同[graphModel.editText](api/graph-model-api#edittext)。      |
| [updateText](./detail/index.md#updatetext)     | 更新节点或者边的文案。  |
| [updateEditConfig](./detail/index.md#updateeditconfig)       | 更新流程编辑基本配置。  |
| [getEditConfig](./detail/index.md#geteditconfig)             | 获取流程编辑基本配置。  |

### Graph 相关

| 选项  | 描述           |
|:---------------------|-------------------------|
| [setTheme](api/theme-api)           | 设置主题。        |
| [focusOn](./detail/index.md#focuson)           | 定位到画布视口中心。   |
| [resize](./detail/index.md#resize)             | 调整画布宽高, 如果`width` 或者`height`不传会自动计算画布宽高。     |
| [toFront](./detail/index.md#tofront)           | 将某个元素放置到顶部。  |
| [getPointByClient](./detail/index.md#getpointbyclient)       | 获取事件位置相对于画布左上角的坐标。           |
| [getGraphData](./detail/index.md#getgraphdata) | 获取流程绘图数据。    |
| [getGraphRawData](./detail/index.md#getgraphrawdata)         | 获取流程绘图原始数据， 与 `getGraphData` 区别是该方法获取的数据不会受到 `adapter` 影响。 |
| [clearData](./detail/index.md#cleardata)       | 清空画布。        |
| [renderRawData](./detail/index.md#renderrawdata)             | 渲染图原始数据，在使用`adapter`后，还想渲染 logicflow 格式的数据。  |
| [render](./detail/index.md#render)             | 渲染图数据。       |

### History 相关

| 选项  | 描述           |
|:---------------------|-------------------------|
| [undo](./detail/index.md#undo) | 历史记录操作-返回上一步。|
| [redo](./detail/index.md#redo) | 历史记录操作-恢复下一步。|

### Resize 相关

| 选项  | 描述           |
|:---------------------|-------------------------|
| [zoom](./detail/index.md#zoom) | 放大缩小画布。      |
| [resetZoom](./detail/index.md#resetzoom)       | 重置图形的缩放比例为默认，默认是 1。          |
| [setZoomMiniSize](./detail/index.md#setzoomminisize)         | 设置图形缩小时，能缩放到的最小倍数。参数一般为 0-1 之间，默认 0.2。       |
| [setZoomMaxSize](./detail/index.md#setzoommaxsize)           | 设置图形放大时，能放大到的最大倍数，默认 16。     |
| [getTransform](./detail/index.md#gettransform) | 获取当前画布的放大缩小值。|
| [translate](./detail/index.md#translate)       | 平移图。         |
| [resetTranslate](./detail/index.md#resettranslate)           | 还原图形为初始位置。   |
| [translateCenter](./detail/index.md#translatecenter)         | 图形画布居中显示。    |
| [fitView](./detail/index.md#fitview)           | 将整个流程图缩小到画布能全部显示。            |
| [openEdgeAnimation](./detail/index.md#openedgeanimation)     | 开启边的动画。      |
| [closeEdgeAnimation](./detail/index.md#closeedgeanimation)   | 关闭边的动画。      |

### 事件系统 相关

| 选项  | 描述           |
|:---------------------|-------------------------|
| [on](./detail/index.md#on)     | 图的监听事件，更多事件请查看[事件](api/event-center-api)。    |
| [off](./detail/index.md#off)   | 删除事件监听。      |
| [once](./detail/index.md#once) | 事件监听一次。      |
| [emit](./detail/index.md#emit) | 触发事件。        |