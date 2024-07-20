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

# LogicFlow

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
| [addNode](./detail/index#addnode)                         | 在图上添加节点。                         |
| [deleteNode](./detail/index#deletenode)                   | 删除图上的节点, 如果这个节点上有连接线，则同时删除线。     |
| [cloneNode](./detail/index#clonenode)                     | 克隆节点。                            |
| [changeNodeId](./detail/index#changenodeid)               | 修改节点的`id`， 如果不传新的`id`，会内部自动创建一个。 |
| [changeNodeType](./detail/index#changenodetype)           | 修改节点类型。                          |
| [getNodeModelById](./detail/index#getnodemodelbyid)       | 获取节点的`model`。                    |
| [getNodeDataById](./detail/index#getnodedatabyid)         | 获取节点的`model`数据。                  |
| [getNodeIncomingEdge](./detail/index#getnodeincomingedge) | 获取所有以此节点为终点的边。                   |
| [getNodeOutgoingEdge](./detail/index#getnodeoutgoingedge) | 获取所有以此节点为起点的边。                   |
| [getNodeIncomingNode](./detail/index#getnodeincomingnode) | 获取节点所有的上一级节点。                    |
| [getNodeOutgoingNode](./detail/index#getnodeoutgoingnode) | 获取节点所有的下一级节点。                    |

### Edge 相关

| 选项                                                      | 描述                                |
|:--------------------------------------------------------|-----------------------------------|
| [setDefaultEdgeType](./detail/index#setdefaultedgetype) | 设置边的默认类型, 也就是设置当节点直接由用户手动连接的边类型。  |
| [addEdge](./detail/index#addedge)                       | 创建连接两个节点的边。                       |
| [getEdgeDataById](./detail/index#getedgedatabyid)       | 通过`id`获取边的数据。                     |
| [getEdgeModelById](./detail/index#getedgemodelbyid)     | 基于边 `id` 获取边的`model`。             |
| [getEdgeModels](./detail/index#getedgemodels)           | 获取满足条件边的`model`。                  |
| [changeEdgeId](./detail/index#changeedgeid)             | 修改边的 `id`， 如果不传新的 `id`，会内部自动创建一个。 |
| [changeEdgeType](./detail/index#changeedgetype)         | 切换边的类型。                           |
| [deleteEdge](./detail/index#deleteedge)                 | 基于边`id`删除边。                       |
| [deleteEdgeByNodeId](./detail/index#deleteedgebynodeid) | 删除与指定节点相连的边, 基于边起点和终点。            |
| [getNodeEdges](./detail/index#getnodeedges)             | 获取节点连接的所有边的`model`。               |

### Register 相关

| 选项                                            | 描述         |
|:----------------------------------------------|------------|
| [register](./detail/index#register)           | 注册自定义节点、边。 |
| [batchRegister](./detail/index#batchregister) | 批量注册。      |

### Element 相关

| 选项                                                        | 描述                          |
|:----------------------------------------------------------|-----------------------------|
| [addElements](./detail/index#addelements)                 | 批量添加节点和边。                   |
| [selectElementById](./detail/index#selectelementbyid)     | 将图形选中。                      |
| [getSelectElements](./detail/index#getselectelements)     | 获取选中的所有元素。                  |
| [clearSelectElements](./detail/index#clearselectelements) | 取消所有元素的选中状态。                |
| [getModelById](./detail/index#getmodelbyid)               | 基于节点或边 `id` 获取其 `model`。    |
| [getDataById](./detail/index#getdatabyid)                 | 基于节点或边 `id` 获取其 `data`。     |
| [deleteElement](./detail/index#deleteelement)             | 删除元素。                       |
| [setElementZIndex](./detail/index#setelementzindex)       | 设置元素的 `zIndex`。             |
| [getAreaElement](./detail/index#getareaelement)           | 获取指定区域内的所有元素(此区域必须是 DOM 层)。 |
| [setProperties](./detail/index#setproperties)             | 设置节点或者边的自定义属性。              |
| [getProperties](./detail/index#getproperties)             | 获取节点或者边的自定义属性。              |
| [deleteProperty](./detail/index#deleteproperty)           | 删除节点属性。                     |

### Text 相关

| 选项                                                  | 描述                                                                |
|:----------------------------------------------------|-------------------------------------------------------------------|
| [editText](./detail/index#edittext)                 | 显示节点、连线文本编辑框, 进入编辑状态，同[graphModel.editText](graphModel#edittext)。 |
| [updateText](./detail/index#updatetext)             | 更新节点或者边的文案。                                                       |
| [updateEditConfig](./detail/index#updateeditconfig) | 更新流程编辑基本配置。                                                       |
| [getEditConfig](./detail/index#geteditconfig)       | 获取流程编辑基本配置。                                                       |

### History 相关

| 选项                          | 描述            |
|:----------------------------|---------------|
| [undo](./detail/index#undo) | 历史记录操作-返回上一步。 |
| [redo](./detail/index#redo) | 历史记录操作-恢复下一步。 |

### Transform 相关

| 选项                                                      | 描述                                     |
|:--------------------------------------------------------|----------------------------------------|
| [zoom](./detail/index#zoom)                             | 放大缩小画布。                                |
| [resetZoom](./detail/index#resetzoom)                   | 重置图形的缩放比例为默认，默认是 1。                    |
| [setZoomMiniSize](./detail/index#setzoomminisize)       | 设置图形缩小时，能缩放到的最小倍数。参数一般为 0-1 之间，默认 0.2。 |
| [setZoomMaxSize](./detail/index#setzoommaxsize)         | 设置图形放大时，能放大到的最大倍数，默认 16。               |
| [getTransform](./detail/index#gettransform)             | 获取当前画布的放大缩小值。                          |
| [translate](./detail/index#translate)                   | 平移图。                                   |
| [resetTranslate](./detail/index#resettranslate)         | 还原图形为初始位置。                             |
| [translateCenter](./detail/index#translatecenter)       | 图形画布居中显示。                              |
| [fitView](./detail/index#fitview)                       | 将整个流程图缩小到画布能全部显示。                      |
| [openEdgeAnimation](./detail/index#openedgeanimation)   | 开启边的动画。                                |
| [closeEdgeAnimation](./detail/index#closeedgeanimation) | 关闭边的动画。                                |

### 事件系统 相关

| 选项                          | 描述                               |
|:----------------------------|----------------------------------|
| [on](./detail/index#on)     | 图的监听事件，更多事件请查看[事件](eventCenter)。 |
| [off](./detail/index#off)   | 删除事件监听。                          |
| [once](./detail/index#once) | 事件监听一次。                          |
| [emit](./detail/index#emit) | 触发事件。                            |
