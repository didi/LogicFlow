---
nav: API
title: Instance
toc: content
order: 0
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

# LogicFlow

## instance

All node instance operations on the flowchart, as well as events, and behavioral listening are performed on the `LogicFlow` instance.

`LogicFlow` configuration items: [constructor](./detail/constructor.en-US.md)

## method

### Register Related

| Option  | Description               |
|:----------------------|-------------------------|
| [register](./detail/index.en-US.md#register) | Register custom nodes, edges. |
| [batchRegister](./detail/index.en-US.md#batchregister) | Batch register.        |

### Node Related

| Option  | Description               |
|:-----------------------|-------------------------|
| [addNode](./detail/index.en-US.md#addnode)           | Add nodes to the graph.     |
| [deleteNode](./detail/index.en-US.md#deletenode)     | Deletes a node on the graph, and if there is a line attached to this node, then also deletes the line. |
| [cloneNode](./detail/index.en-US.md#clonenode)       | Clone a node.        |
| [changeNodeId](./detail/index.en-US.md#changenodeid) | Modify the id of the node, if no new id is passed, one will be created internally automatically.             |
| [changeNodeType](./detail/index.en-US.md#changenodetype)           | Modify node type.      |
| [getNodeModelById](./detail/index.en-US.md#getnodemodelbyid)       | Get the `model` of the node |
| [getNodeDataById](./detail/index.en-US.md#getnodedatabyid)         | Get the `model` data of a node. |
| [getNodeIncomingEdge](./detail/index.en-US.md#getnodeincomingedge) | Get all the edges that `end` at this node.|
| [getNodeOutgoingEdge](./detail/index.en-US.md#getnodeoutgoingedge) | Get all the edges that `start` at this node. |
| [getNodeIncomingNode](./detail/index.en-US.md#getnodeincomingnode) | Get all parent nodes of the node. |
| [getNodeOutgoingNode](./detail/index.en-US.md#getnodeoutgoingnode) | Get all the next-level nodes of the node. |

### Edge Related

| Option  | Description               |
|:-----------------------|-------------------------|
<<<<<<< HEAD
| [setDefaultEdgeType](detail#setdefaultedgetype)   | Set the type of edge, i.e. set the type of linkage drawn directly by the user at the node.|
| [addEdge](detail#addedge)           | Create an edge connecting two nodes.  |
| [getEdgeDataById](detail#getedgedatabyid)         | Get edge data by `id`. |
| [getEdgeModelById](detail#getedgemodelbyid)       | Get the model of the edge based on the its `id`.        |
| [getEdgeModels](detail#getedgemodels)             | Get the model of the edge that satisfies the condition. |
| [changeEdgeId](detail#changeedgeid) | Modify the edge id. If a new id is not passed, one will be created internally automatically.            |
| [changeEdgeType](detail#changeedgetype)           | Switch type of the edge.      |
| [deleteEdge](detail#deleteedge)     | Delete an edge based on its id.  |
| [deleteEdgeByNodeId](detail#deleteedgebynodeid)   | Deletes an edge of the specified type, based on the start and end points of the edge, and can pass only one of them.       |
| [getNodeEdges](detail#getnodeedges) | Get the model of all edges connected by the node.          |
=======
| [setDefaultEdgeType](./detail/index.en-US.md#setdefaultedgetype)   | Set the type of edge, i.e. set the type of linkage drawn directly by the user at the node.|
| [addEdge](./detail/index.en-US.md#addedge)           | Create an edge connecting two nodes.  |
| [getEdgeDataById](./detail/index.en-US.md#getedgedatabyid)         | Get edge data by `id`. |
| [getEdgeModelById](./detail/index.en-US.md#getedgemodelbyid)       | Get the model of the edge based on the its `id`.        |
| [getEdgeModels](./detail/index.en-US.md#getedgemodels)             | Get the model of the edge that satisfies the condition. |
| [changeEdgeId](./detail/index.en-US.md#changeedgeid) | Modify the edge id. If a new id is not passed, one will be created internally automatically.            |
| [changeEdgeType](./detail/index.en-US.md#changeedgetype)           | Switch type of the edge.      |
| [deleteEdge](./detail/index.en-US.md#deleteedge)     | Delete an edge based on its id.  |
| [deleteEdgeByNodeId](./detail/index.en-US.md#deleteedgebynodeid)   | Deletes an edge of the specified type, based on the start and end points of the edge, and can pass only one of them.       |
| [getNodeEdges](./detail/index.en-US.md#getnodeedges) | Get the model of all edges connected by the node.          |
>>>>>>> df47bfe0 (docs: 官网基础模块 - 实例&节点页优化)

### Element Related

| Option  | Description               |
|:-----------------------|-------------------------|
<<<<<<< HEAD
| [addElements](detail#addelements)   | Batch add nodes and edges.    |
| [selectElementById](detail#selectelementbyid)     | Select the graph.       |
| [getSelectElements](detail#getselectelements)     | Get all elements selected.   |
| [clearSelectElements](detail#clearselectelements) | Uncheck all elements. |
| [getModelById](detail#getmodelbyid) | Get the `model` of a node or edge based on its `id`.   |
| [getDataById](detail#getdatabyid)   | Get the `data` of a node or edge based on its `id`.      |
| [deleteElement](detail#deleteelement)             | Delete the element by id.      |
| [setElementZIndex](detail#setelementzindex)       | Set the `zIndex` of the element.|
| [getAreaElement](detail#getareaelement)           | Gets all the elements in the specified region, which must be a DOM layer.  |
| [setProperties](detail#setproperties)             | Set the custom properties of nodes or edges. |
| [getProperties](detail#getproperties)             | Get the custom properties of a node or an edge. |
| [deleteProperty](detail#deleteproperty) | Delete node attributes.  |
| [updateAttributes](detail#updateattributes)       | Modifies an attribute in the corresponding element model, which is called graphModel inside the method.         |
=======
| [addElements](./detail/index.en-US.md#addelements)   | Batch add nodes and edges.    |
| [selectElementById](./detail/index.en-US.md#selectelementbyid)     | Select the graph.       |
| [getSelectElements](./detail/index.en-US.md#getselectelements)     | Get all elements selected.   |
| [clearSelectElements](./detail/index.en-US.md#clearselectelements) | Uncheck all elements. |
| [getModelById](./detail/index.en-US.md#getmodelbyid) | Get the `model` of a node or edge based on its `id`.   |
| [getDataById](./detail/index.en-US.md#getdatabyid)   | Get the `data` of a node or edge based on its `id`.      |
| [deleteElement](./detail/index.en-US.md#deleteelement)             | Delete the element by id.      |
| [setElementZIndex](./detail/index.en-US.md#setelementzindex)       | Set the `zIndex` of the element.|
| [getAreaElement](./detail/index.en-US.md#getareaelement)           | Gets all the elements in the specified region, which must be a DOM layer.  |
| [setProperties](./detail/index.en-US.md#setproperties)             | Set the custom properties of nodes or edges. |
| [getProperties](./detail/index.en-US.md#getproperties)             | Get the custom properties of a node or an edge. |
| [deleteProperty](./detail/index.en-US.md#deleteproperty) | Delete node attributes.  |
>>>>>>> df47bfe0 (docs: 官网基础模块 - 实例&节点页优化)

### Text Related

| Option  | Description               |
|:-----------------------|-------------------------|
<<<<<<< HEAD
| [editText](detail#edittext)            | Show text editing box for nodes and edges, entering edit mode, equivalent to [graphModel.editText](api/graph-model-api#edittext).      |
| [updateText](detail#updatetext)     | Update the node or edge text.  |
| [updateEditConfig](detail#updateeditconfig)       | Update the basic configuration of the flow editor.  |
| [getEditConfig](detail#geteditconfig)             | Get the basic configuration of the flow editor.  |
=======
| [editText](./detail/index.en-US.md#edittext)            | Show text editing box for nodes and edges, entering edit mode, equivalent to [graphModel.editText](api/graph-model-api#edittext).      |
| [updateText](./detail/index.en-US.md#updatetext)     | Update the node or edge text.  |
| [updateEditConfig](./detail/index.en-US.md#updateeditconfig)       | Update the basic configuration of the flow editor.  |
| [getEditConfig](./detail/index.en-US.md#geteditconfig)             | Get the basic configuration of the flow editor.  |
>>>>>>> df47bfe0 (docs: 官网基础模块 - 实例&节点页优化)

### Graph Related

| Option  | Description               |
|:-----------------------|-------------------------|
| [setTheme](api/theme-api)           | Set the theme.        |
<<<<<<< HEAD
| [focusOn](detail#focuson)           | Position to the center of the canvas viewport.   |
| [resize](detail#resize)             | Adjusts the width and height of the canvas, if the width or height is not passed, the width and height of the canvas will be calculated automatically.     |
| [toFront](detail#tofront)           | Places an element to the top.  |
| [getPointByClient](detail#getpointbyclient)       | Get the coordinates of the event location relative to the top left corner of the canvas.           |
| [getGraphData](detail#getgraphdata) | Get flow graphing data.    |
| [getGraphRawData](detail#getgraphrawdata)         | Get the raw data of the flow graph. The difference with getGraphData is that the data obtained by this method is not affected by the `adapter`. |
| [clearData](detail#cleardata)       | Clear the canvas.      |
| [renderRawData](detail#renderrawdata)             | Rendering of the raw graph data. The difference with render is that after using `adapter`, you can use this method if you still want to render the data in logicflow format.  |
| [render](detail#render)             | Render graph data.     |
=======
| [focusOn](./detail/index.en-US.md#focuson)           | Position to the center of the canvas viewport.   |
| [resize](./detail/index.en-US.md#resize)             | Adjusts the width and height of the canvas, if the width or height is not passed, the width and height of the canvas will be calculated automatically.     |
| [toFront](./detail/index.en-US.md#tofront)           | Places an element to the top.  |
| [getPointByClient](./detail/index.en-US.md#getpointbyclient)       | Get the coordinates of the event location relative to the top left corner of the canvas.           |
| [getGraphData](./detail/index.en-US.md#getgraphdata) | Get flow graphing data.    |
| [getGraphRawData](./detail/index.en-US.md#getgraphrawdata)         | Get the raw data of the flow graph. The difference with getGraphData is that the data obtained by this method is not affected by the `adapter`. |
| [clearData](./detail/index.en-US.md#cleardata)       | Clear the canvas.      |
| [renderRawData](./detail/index.en-US.md#renderrawdata)             | Rendering of the raw graph data. The difference with render is that after using `adapter`, you can use this method if you still want to render the data in logicflow format.  |
| [render](./detail/index.en-US.md#render)             | Render graph data.     |
>>>>>>> df47bfe0 (docs: 官网基础模块 - 实例&节点页优化)

### History Related

| Option  | Description               |
|:-----------------------|-------------------------|
<<<<<<< HEAD
| [undo](detail#undo) | History operation - Back to previous step.|
| [redo](detail#redo) | History operation - Resume next.|
=======
| [undo](./detail/index.en-US.md#undo) | History operation - Back to previous step.|
| [redo](./detail/index.en-US.md#redo) | History operation - Resume next.|
>>>>>>> df47bfe0 (docs: 官网基础模块 - 实例&节点页优化)

### Resize Related

| Option  | Description               |
|:-----------------------|-------------------------|
<<<<<<< HEAD
| [zoom](detail#zoom) | Zoom in or out on the canvas.      |
| [resetZoom](detail#resetzoom)       | Reset the zoom ratio of the drawing to the default, which is 1.          |
| [setZoomMiniSize](detail#setzoomminisize)         | Sets the minimum number of times the graph can be scaled when it is reduced. The parameter takes values from 0 to 1. Default 0.       |
| [setZoomMaxSize](detail#setzoommaxsize)           | Set the maximum zoom scale when zooming in; default is 16.     |
| [getTransform](detail#gettransform) | Get the zoom in/out value of the current canvas.|
| [translate](detail#translate)       | Panning graph.         |
| [resetTranslate](detail#resettranslate)           | Restore the graph to its original position.  |
| [translateCenter](detail#translatecenter)         | Graphics canvas centering.    |
| [fitView](detail#fitview)           | Reduce the entire flowchart to a size where the entire canvas can be displayed.            |
| [openEdgeAnimation](detail#openedgeanimation)     | Enable edge animations.   |
| [closeEdgeAnimation](detail#closeedgeanimation)   | Disable edge animations.  |
=======
| [zoom](./detail/index.en-US.md#zoom) | Zoom in or out on the canvas.      |
| [resetZoom](./detail/index.en-US.md#resetzoom)       | Reset the zoom ratio of the drawing to the default, which is 1.          |
| [setZoomMiniSize](./detail/index.en-US.md#setzoomminisize)         | Sets the minimum number of times the graph can be scaled when it is reduced. The parameter takes values from 0 to 1. Default 0.       |
| [setZoomMaxSize](./detail/index.en-US.md#setzoommaxsize)           | Set the maximum zoom scale when zooming in; default is 16.     |
| [getTransform](./detail/index.en-US.md#gettransform) | Get the zoom in/out value of the current canvas.|
| [translate](./detail/index.en-US.md#translate)       | Panning graph.         |
| [resetTranslate](./detail/index.en-US.md#resettranslate)           | Restore the graph to its original position.  |
| [translateCenter](./detail/index.en-US.md#translatecenter)         | Graphics canvas centering.    |
| [fitView](./detail/index.en-US.md#fitview)           | Reduce the entire flowchart to a size where the entire canvas can be displayed.            |
| [openEdgeAnimation](./detail/index.en-US.md#openedgeanimation)     | Enable edge animations.   |
| [closeEdgeAnimation](./detail/index.en-US.md#closeedgeanimation)   | Disable edge animations.  |
>>>>>>> df47bfe0 (docs: 官网基础模块 - 实例&节点页优化)

### Event System Related

| Option  | Description               |
|:-----------------------|-------------------------|
<<<<<<< HEAD
| [on](detail#on)     | Event listener for the graph; see [Events](api/event-center-api) for more events.    |
| [off](detail#off)   | Remove event listener.      |
| [once](detail#once) | Event listener that triggers only once.      |
| [emit](detail#emit) | Trigger an event.        |
=======
| [on](./detail/index.en-US.md#on)     | Event listener for the graph; see [Events](api/event-center-api) for more events.    |
| [off](./detail/index.en-US.md#off)   | Remove event listener.      |
| [once](./detail/index.en-US.md#once) | Event listener that triggers only once.      |
| [emit](./detail/index.en-US.md#emit) | Trigger an event.        |
>>>>>>> df47bfe0 (docs: 官网基础模块 - 实例&节点页优化)
