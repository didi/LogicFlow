---
nav: API
title: LogicFlow
toc: content
order: 0
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

## 实例

流程图上所有的节点实例操作以及事件，行为监听都在 `LogicFlow` 实例上进行。

`LogicFlow`配置项:  [constructor](./detail/constructor.zh.md)

## 实例方法

### Graph 相关

| 选项                                                        | 描述                                                         |
|:----------------------------------------------------------|------------------------------------------------------------|
| [setTheme](theme.zh.md)                                   | 设置主题。                                                      |
| [focusOn](./detail/index.zh.md#focuson)                   | 定位到画布视口中心。                                                 |
| [resize](./detail/index.zh.md#resize)                     | 调整画布宽高, 如果`width` 或者`height`不传会自动计算画布宽高。                   |
| [toFront](./detail/index.zh.md#tofront)                   | 将某个元素放置到顶部。                                                |
| [getPointByClient](./detail/index.zh.md#getpointbyclient) | 获取事件位置相对于画布左上角的坐标。                                         |
| [getGraphData](./detail/index.zh.md#getgraphdata)         | 获取流程绘图数据。                                                  |
| [getGraphRawData](./detail/index.zh.md#getgraphrawdata)   | 获取流程绘图原始数据， 与 `getGraphData` 区别是该方法获取的数据不会受到 `adapter` 影响。 |
| [clearData](./detail/index.zh.md#cleardata)               | 清空画布。                                                      |
| [renderRawData](./detail/index.zh.md#renderrawdata)       | 渲染图原始数据，在使用`adapter`后，还想渲染 logicflow 格式的数据。                |
| [render](./detail/index.zh.md#render)                     | 渲染图数据。                                                     |

### Node 相关

| 选项                                                        | 描述                               |
|:----------------------------------------------------------|----------------------------------|
| [addNode](./detail/index.zh.md#addnode)                         | 在图上添加节点。                         |
| [deleteNode](./detail/index.zh.md#deletenode)                   | 删除图上的节点, 如果这个节点上有连接线，则同时删除线。     |
| [cloneNode](./detail/index.zh.md#clonenode)                     | 克隆节点。                            |
| [changeNodeId](./detail/index.zh.md#changenodeid)               | 修改节点的`id`， 如果不传新的`id`，会内部自动创建一个。 |
| [changeNodeType](./detail/index.zh.md#changenodetype)           | 修改节点类型。                          |
| [getNodeModelById](./detail/index.zh.md#getnodemodelbyid)       | 获取节点的`model`。                    |
| [getNodeDataById](./detail/index.zh.md#getnodedatabyid)         | 获取节点的`model`数据。                  |
| [getNodeIncomingEdge](./detail/index.zh.md#getnodeincomingedge) | 获取所有以此节点为终点的边。                   |
| [getNodeOutgoingEdge](./detail/index.zh.md#getnodeoutgoingedge) | 获取所有以此节点为起点的边。                   |
| [getNodeIncomingNode](./detail/index.zh.md#getnodeincomingnode) | 获取节点所有的上一级节点。                    |
| [getNodeOutgoingNode](./detail/index.zh.md#getnodeoutgoingnode) | 获取节点所有的下一级节点。                    |

### Edge 相关

| 选项                                                      | 描述                                |
|:--------------------------------------------------------|-----------------------------------|
| [setDefaultEdgeType](./detail/index.zh.md#setdefaultedgetype) | 设置边的默认类型, 也就是设置当节点直接由用户手动连接的边类型。  |
| [addEdge](./detail/index.zh.md#addedge)                       | 创建连接两个节点的边。                       |
| [getEdgeDataById](./detail/index.zh.md#getedgedatabyid)       | 通过`id`获取边的数据。                     |
| [getEdgeModelById](./detail/index.zh.md#getedgemodelbyid)     | 基于边 `id` 获取边的`model`。             |
| [getEdgeModels](./detail/index.zh.md#getedgemodels)           | 获取满足条件边的`model`。                  |
| [changeEdgeId](./detail/index.zh.md#changeedgeid)             | 修改边的 `id`， 如果不传新的 `id`，会内部自动创建一个。 |
| [changeEdgeType](./detail/index.zh.md#changeedgetype)         | 切换边的类型。                           |
| [deleteEdge](./detail/index.zh.md#deleteedge)                 | 基于边`id`删除边。                       |
| [deleteEdgeByNodeId](./detail/index.zh.md#deleteedgebynodeid) | 删除与指定节点相连的边, 基于边起点和终点。            |
| [getNodeEdges](./detail/index.zh.md#getnodeedges)             | 获取节点连接的所有边的`model`。               |

### Register 相关

| 选项                                            | 描述         |
|:----------------------------------------------|------------|
| [register](./detail/index.zh.md#register)           | 注册自定义节点、边。 |
| [batchRegister](./detail/index.zh.md#batchregister) | 批量注册。      |

### Element 相关

| 选项                                                        | 描述                          |
|:----------------------------------------------------------|-----------------------------|
| [addElements](./detail/index.zh.md#addelements)                 | 批量添加节点和边。                   |
| [selectElementById](./detail/index.zh.md#selectelementbyid)     | 将图形选中。                      |
| [getSelectElements](./detail/index.zh.md#getselectelements)     | 获取选中的所有元素。                  |
| [clearSelectElements](./detail/index.zh.md#clearselectelements) | 取消所有元素的选中状态。                |
| [getModelById](./detail/index.zh.md#getmodelbyid)               | 基于节点或边 `id` 获取其 `model`。    |
| [getDataById](./detail/index.zh.md#getdatabyid)                 | 基于节点或边 `id` 获取其 `data`。     |
| [deleteElement](./detail/index.zh.md#deleteelement)             | 删除元素。                       |
| [setElementZIndex](./detail/index.zh.md#setelementzindex)       | 设置元素的 `zIndex`。             |
| [getAreaElement](./detail/index.zh.md#getareaelement)           | 获取指定区域内的所有元素(此区域必须是 DOM 层)。 |
| [setProperties](./detail/index.zh.md#setproperties)             | 设置节点或者边的自定义属性。              |
| [getProperties](./detail/index.zh.md#getproperties)             | 获取节点或者边的自定义属性。              |
| [deleteProperty](./detail/index.zh.md#deleteproperty)           | 删除节点属性。                     |

### Text 相关

| 选项                                                  | 描述                                                                |
|:----------------------------------------------------|-------------------------------------------------------------------|
| [editText](./detail/index.zh.md#edittext)                 | 显示节点、连线文本编辑框, 进入编辑状态，同[graphModel.editText](graphModel#edittext)。 |
| [updateText](./detail/index.zh.md#updatetext)             | 更新节点或者边的文案。                                                       |
| [updateEditConfig](./detail/index.zh.md#updateeditconfig) | 更新流程编辑基本配置。                                                       |
| [getEditConfig](./detail/index.zh.md#geteditconfig)       | 获取流程编辑基本配置。                                                       |

### History 相关

| 选项                          | 描述            |
|:----------------------------|---------------|
| [undo](./detail/index.zh.md#undo) | 历史记录操作-返回上一步。 |
| [redo](./detail/index.zh.md#redo) | 历史记录操作-恢复下一步。 |

### Transform 相关

| 选项                                                      | 描述                                     |
|:--------------------------------------------------------|----------------------------------------|
| [zoom](./detail/index.zh.md#zoom)                             | 放大缩小画布。                                |
| [resetZoom](./detail/index.zh.md#resetzoom)                   | 重置图形的缩放比例为默认，默认是 1。                    |
| [setZoomMiniSize](./detail/index.zh.md#setzoomminisize)       | 设置图形缩小时，能缩放到的最小倍数。参数一般为 0-1 之间，默认 0.2。 |
| [setZoomMaxSize](./detail/index.zh.md#setzoommaxsize)         | 设置图形放大时，能放大到的最大倍数，默认 16。               |
| [getTransform](./detail/index.zh.md#gettransform)             | 获取当前画布的缩放值与偏移值。                          |
| [translate](./detail/index.zh.md#translate)                   | 平移图。                                   |
| [resetTranslate](./detail/index.zh.md#resettranslate)         | 还原图形为初始位置。                             |
| [translateCenter](./detail/index.zh.md#translatecenter)       | 图形画布居中显示。                              |
| [fitView](./detail/index.zh.md#fitview)                       | 将整个流程图缩小到画布能全部显示。                      |
| [openEdgeAnimation](./detail/index.zh.md#openedgeanimation)   | 开启边的动画。                                |
| [closeEdgeAnimation](./detail/index.zh.md#closeedgeanimation) | 关闭边的动画。                                |

### 事件系统 相关

| 选项                          | 描述                               |
|:----------------------------|----------------------------------|
| [on](./detail/index.zh.md#on)     | 图的监听事件，更多事件请查看[事件](./eventCenter.zh.md)。 |
| [off](./detail/index.zh.md#off)   | 删除事件监听。                          |
| [once](./detail/index.zh.md#once) | 事件监听一次。                          |
| [emit](./detail/index.zh.md#emit) | 触发事件。                            |
