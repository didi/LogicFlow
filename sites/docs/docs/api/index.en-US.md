---
nav: API
title: LogicFlow
order: 0
---

# LogicFlow

Usage
```jsx | pure
const lf = new LogicFlow(options: Options);
lf.XX();
```

## an actual example

All node instance operations on the flowchart, as well as events, and behavioral listening are performed on the `LogicFlow` instance.

`LogicFlow` configuration items: [constructor](detail/constructor)

## method
| Options | Description         |
| :------------------------ | --------------------------- |
| [register](detail#register) |Register nodes, edges.|
| [batchRegister](detail#batchregister) | Batch registration.|
| [render](detail#render) | Render graph data. |
| [renderRawData](detail#renderrawdata) | Render map raw data that you also want to render in logicflow format after using `adapter`. |
| [setTheme](api/theme-api) | Set the theme |
| [changeNodeType](detail#changenodetype) | Modify the node type. |
| [getNodeEdges](detail#getnodeedges) | Get the `model` of all edges connected to the node.|
| [addNode](detail#addnode) | Add nodes to the graph. |
| [deleteNode](detail#deletenode) | Delete a node from the graph, and if there is a line connecting this node, delete the line as well. |
| [cloneNode](detail#clonenode) | Clone the node. |
| [changeNodeId](detail#changenodeid) | Modify the `id` of a node, if no new `id` is passed, one will be created internally. |
| [getNodeModelById](detail#getnodemodelbyid) | Get the `model` of the node. |
| [getNodeDataById](detail#getnodedatabyid) | Get the `model` data of the node.  |
| [getNodeIncomingNode](detail#getnodeincomingnode) | Get all higher level nodes of the node.  |
| [getNodeOutgoingNode](detail#getnodeoutgoingnode) | Get all next-level nodes of the node. |
| [getNodeIncomingEdge](detail#getnodeincomingedge) | Get all edges that end at this node. |
| [getNodeOutgoingEdge](detail#getnodeoutgoingedge) | Get all edges that start at this node. |
| [addEdge](detail#addedge) | Create edges connecting two nodes. |
| [deleteEdge](detail#deleteedge) | Delete edges based on edge `id`. |
| [deleteEdgeByNodeId](detail#deleteedgebynodeid) | Delete an edge connected to the specified node, based on the edge's start and end points. |
| [getEdgeModelById](detail#getedgemodelbyid) | Get the `model` of an edge based on the edge `id`. |
| [getEdgeModels](detail#getedgemodels) | Get the `model` of the edge that satisfies the condition. |
| [changeEdgeId](detail#changeedgeid) |  Modify the `id` of the edge, if no new `id` is passed, one will be created internally. |
| [changeEdgeType](detail#changeedgetype) | Switch the type of the edge. |
| [getEdgeDataById](detail#getedgedatabyid) | Get the data of the edge by `id` |
| [setDefaultEdgeType](detail#setdefaultedgetype) | Set the type of the edge, i.e. set the type of the linkage that will be drawn manually by the user directly at the node. |
| editText | same with [graphModel.editText](api/graph-model-api#edittext)。 |
| [updateText](detail#updatetext) | Update the text of the node or edge. |
| [deleteElement](detail#deleteelement) | Delete an element. |
| [selectElementById](detail#selectelementbyid) | Select the graphic.  |
| [getGraphData](detail#getgraphdata) | Get process plot data. |
| [getGraphRawData](detail#getgraphrawdata) | Get the raw data of the process graph, the difference with `getGraphData` is that the data obtained by this method will not be affected by the `adapter`. |
| [setProperties](detail#setproperties) | Set the custom properties of the node or edge. |
| [deleteProperty](detail#deleteproperty) | Delete a node attribute.  |
| [getProperties](detail#getproperties) | Get the custom attributes of the node or edge. |
| [updateAttributes](detail#updateattributes) | Modify the attributes of the corresponding element `model`. |
| [toFront](detail#tofront) | Place an element on top.  |
| [setElementZIndex](detail#setelementzindex) | Set the `zIndex` of the element. |
| [addElements](detail#addelements) | Add nodes and edges in bulk. |
| [getAreaElement](detail#getareaelement) | Get all elements in the specified region (this region must be a DOM level).  |
| [getSelectElements](detail#getselectelements) | Get all selected elements.  |
| [clearSelectElements](detail#clearselectelements) | Unselect all elements. |
| [getModelById](detail#getmodelbyid) | Get the `model` of a node or edge based on its `id`. |
| [getDataById](detail#getdatabyid) | Get the `data` of a node or edge based on its `id`. |
| [clearData](detail#cleardata) | Clear the canvas.  |
| [updateEditConfig](detail#updateeditconfig) | Update the basic configuration of the process editor. |
| [getEditConfig](detail#geteditconfig) | Get the process editing basic configuration |
| [getPointByClient](detail#getpointbyclient) | Get the coordinates of the event position relative to the upper-left corner of the canvas |
| [focusOn](detail#focuson) | Position to the center of the canvas viewport |
| [resize](detail#resize) | Adjust the width and height of the canvas, if `width` or `height` is not passed, the width and height of the canvas will be calculated automatically. |
| [zoom](detail#zoom) | Zoom in and out of the canvas |
| [resetZoom](detail#resetzoom) | Reset the zoom ratio of the drawing to the default, which is 1. |
| [setZoomMiniSize](detail#setzoomminisize) | Set the minimum size that the graphic can be scaled to when zoomed out. The parameter is usually between 0 and 1, the default is 0.2. |
| [setZoomMaxSize](detail#setzoommaxsize) | Sets the maximum zoom level that the graphic can be zoomed to when zooming in, default is 16. |
| [getTransform](detail#gettransform) | Get the zoom value of the current canvas |
| [translate](detail#translate) | Panning |
| [translateCenter](detail#translatecenter) | Centers the canvas of the graph. |
| [resetTranslate](detail#resettranslate) | Restore the graph to its original position |
| [fitView](detail#fitview) | Reduces the entire flowchart to the point where the canvas can be displayed in its entirety.  |
| [openEdgeAnimation](detail#openedgeanimation) | Turn on edge animation. |
| [closeEdgeAnimation](detail#closeedgeanimation) | Turn off the animation of the edges. |
| [on](detail#on) | Figure of listening events, for more events see [events](api/event-center-api) |
| [off](detail#off) | Deleting an event listener |
| [once](detail#once) | Listen to an event once |
| [emit](detail#emit) | Trigger event |
| [undo](detail#undo) | History action-return to previous step |
| [redo](detail#redo) | History Action - Resume Next |
<!-- | [](detail#) | 。 | -->
