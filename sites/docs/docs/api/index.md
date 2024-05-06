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

使用方式
```jsx | pure
// create container
<div id="container"></div>;

// prepare data
const data = {
  // node data
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
  // edge data
  edges: [
    {
      type: 'polyline',
      sourceNodeId: '50',
      targetNodeId: '21',
    },
  ],
};
// render instance
const lf = new LogicFlow({
  container: document.querySelector('#container'),
  width: 700,
  height: 600,
});

lf.render(data);
```

## 实例

流程图上所有的节点实例操作以及事件，行为监听都在 `LogicFlow` 实例上进行。

`LogicFlow`配置项:  [constructor](detail/constructor)

## 方法
| 选项  | 描述           |
|:--------------------------------------------------|------------------------------------------------------------|
| [register](detail#register)         | 注册节点、边。      |
| [batchRegister](detail#batchregister)             | 批量注册。        |
| [render](detail#render)             | 渲染图数据。       |
| [renderRawData](detail#renderrawdata)             | 渲染图原始数据，在使用`adapter`后，还想渲染 logicflow 格式的数据。  |
| [setTheme](api/theme-api)           | 设置主题。        |
| [changeNodeType](detail#changenodetype)           | 修改节点类型。      |
| [getNodeEdges](detail#getnodeedges) | 获取节点连接的所有边的`model`。          |
| [addNode](detail#addnode)           | 在图上添加节点。     |
| [deleteNode](detail#deletenode)     | 删除图上的节点, 如果这个节点上有连接线，则同时删除线。 |
| [cloneNode](detail#clonenode)       | 克隆节点。        |
| [changeNodeId](detail#changenodeid) | 修改节点的`id`， 如果不传新的`id`，会内部自动创建一个。             |
| [getNodeModelById](detail#getnodemodelbyid)       | 获取节点的`model`。|
| [getNodeDataById](detail#getnodedatabyid)         | 获取节点的`model`数据。|
| [getNodeIncomingNode](detail#getnodeincomingnode) | 获取节点所有的上一级节点。|
| [getNodeOutgoingNode](detail#getnodeoutgoingnode) | 获取节点所有的下一级节点。|
| [getNodeIncomingEdge](detail#getnodeincomingedge) | 获取所有以此节点为终点的边。 |
| [getNodeOutgoingEdge](detail#getnodeoutgoingedge) | 获取所有以此节点为起点的边。 |
| [addEdge](detail#addedge)           | 创建连接两个节点的边。  |
| [deleteEdge](detail#deleteedge)     | 基于边`id`删除边。  |
| [deleteEdgeByNodeId](detail#deleteedgebynodeid)   | 删除与指定节点相连的边, 基于边起点和终点。       |
| [getEdgeModelById](detail#getedgemodelbyid)       | 基于边 `id` 获取边的`model`。        |
| [getEdgeModels](detail#getedgemodels)             | 获取满足条件边的`model`。             |
| [changeEdgeId](detail#changeedgeid) | 修改边的 `id`， 如果不传新的 `id`，会内部自动创建一个。            |
| [changeEdgeType](detail#changeedgetype)           | 切换边的类型。      |
| [getEdgeDataById](detail#getedgedatabyid)         | 通过`id`获取边的数据。|
| [setDefaultEdgeType](detail#setdefaultedgetype)   | 设置边的类型, 也就是设置在节点直接由用户手动绘制的连线类型。|
| editText            | 同[graphModel.editText](api/graph-model-api#edittext)。      |
| [updateText](detail#updatetext)     | 更新节点或者边的文案。  |
| [deleteElement](detail#deleteelement)             | 删除元素。        |
| [selectElementById](detail#selectelementbyid)     | 将图形选中。       |
| [getGraphData](detail#getgraphdata) | 获取流程绘图数据。    |
| [getGraphRawData](detail#getgraphrawdata)         | 获取流程绘图原始数据， 与 `getGraphData` 区别是该方法获取的数据不会受到 `adapter` 影响。 |
| [setProperties](detail#setproperties)             | 设置节点或者边的自定义属性。 |
| [deleteProperty](detail#deleteproperty)           | 删除节点属性。      |
| [getProperties](detail#getproperties)             | 获取节点或者边的自定义属性。 |
| [updateAttributes](detail#updateattributes)       | 修改对应元素 `model` 中的属性。         |
| [toFront](detail#tofront)           | 将某个元素放置到顶部。  |
| [setElementZIndex](detail#setelementzindex)       | 设置元素的 `zIndex`。|
| [addElements](detail#addelements)   | 批量添加节点和边。    |
| [getAreaElement](detail#getareaelement)           | 获取指定区域内的所有元素(此区域必须是 DOM 层)。  |
| [getSelectElements](detail#getselectelements)     | 获取选中的所有元素。   |
| [clearSelectElements](detail#clearselectelements) | 取消所有元素的选中状态。 |
| [getModelById](detail#getmodelbyid) | 基于节点或边 `id` 获取其 `model`。     |
| [getDataById](detail#getdatabyid)   | 基于节点或边 `id` 获取其 `data`。      |
| [clearData](detail#cleardata)       | 清空画布。        |
| [updateEditConfig](detail#updateeditconfig)       | 更新流程编辑基本配置。  |
| [getEditConfig](detail#geteditconfig)             | 获取流程编辑基本配置。  |
| [getPointByClient](detail#getpointbyclient)       | 获取事件位置相对于画布左上角的坐标。           |
| [focusOn](detail#focuson)           | 定位到画布视口中心。   |
| [resize](detail#resize)             | 调整画布宽高, 如果`width` 或者`height`不传会自动计算画布宽高。     |
| [zoom](detail#zoom) | 放大缩小画布。      |
| [resetZoom](detail#resetzoom)       | 重置图形的缩放比例为默认，默认是 1。          |
| [setZoomMiniSize](detail#setzoomminisize)         | 设置图形缩小时，能缩放到的最小倍数。参数一般为 0-1 之间，默认 0.2。       |
| [setZoomMaxSize](detail#setzoommaxsize)           | 设置图形放大时，能放大到的最大倍数，默认 16。     |
| [getTransform](detail#gettransform) | 获取当前画布的放大缩小值。|
| [translate](detail#translate)       | 平移图。         |
| [translateCenter](detail#translatecenter)         | 图形画布居中显示。    |
| [resetTranslate](detail#resettranslate)           | 还原图形为初始位置。   |
| [fitView](detail#fitview)           | 将整个流程图缩小到画布能全部显示。            |
| [openEdgeAnimation](detail#openedgeanimation)     | 开启边的动画。      |
| [closeEdgeAnimation](detail#closeedgeanimation)   | 关闭边的动画。      |
| [on](detail#on)     | 图的监听事件，更多事件请查看[事件](api/event-center-api)。    |
| [off](detail#off)   | 删除事件监听。      |
| [once](detail#once) | 事件监听一次。      |
| [emit](detail#emit) | 触发事件。        |
| [undo](detail#undo) | 历史记录操作-返回上一步。|
| [redo](detail#redo) | 历史记录操作-恢复下一步。|

