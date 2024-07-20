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

## instance

All node instance operations on the flowchart, as well as events, and behavioral listening are
performed on the `LogicFlow` instance.

`LogicFlow` configuration items: [constructor](./detail/constructor.zh.md)

## method

### Graph Related

| Option                                                    | Description                                                                                                                                                                  |
|:----------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [setTheme](theme.en.md)                                   | Set the theme.                                                                                                                                                               |
| [focusOn](./detail/index.en.md#focuson)                   | Position to the center of the canvas viewport.                                                                                                                               |
| [resize](./detail/index.en.md#resize)                     | Adjusts the width and height of the canvas, if the width or height is not passed, the width and height of the canvas will be calculated automatically.                       |
| [toFront](./detail/index.en.md#tofront)                   | Places an element to the top.                                                                                                                                                |
| [getPointByClient](./detail/index.en.md#getpointbyclient) | Get the coordinates of the event location relative to the top left corner of the canvas.                                                                                     |
| [getGraphData](./detail/index.en.md#getgraphdata)         | Get flow graphing data.                                                                                                                                                      |
| [getGraphRawData](./detail/index.en.md#getgraphrawdata)   | Get the raw data of the flow graph. The difference with getGraphData is that the data obtained by this method is not affected by the `adapter`.                              |
| [clearData](./detail/index.en.md#cleardata)               | Clear the canvas.                                                                                                                                                            |
| [renderRawData](./detail/index.en.md#renderrawdata)       | Rendering of the raw graph data. The difference with render is that after using `adapter`, you can use this method if you still want to render the data in logicflow format. |
| [render](./detail/index.en.md#render)                     | Render graph data.                                                                                                                                                           |

### Node Related

| Option                                                    | Description                                                                                            |
|:----------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| [addNode](./detail/index#addnode)                         | Add nodes to the graph.                                                                                |
| [deleteNode](./detail/index#deletenode)                   | Deletes a node on the graph, and if there is a line attached to this node, then also deletes the line. |
| [cloneNode](./detail/index#clonenode)                     | Clone a node.                                                                                          |
| [changeNodeId](./detail/index#changenodeid)               | Modify the id of the node, if no new id is passed, one will be created internally automatically.       |
| [changeNodeType](./detail/index#changenodetype)           | Modify node type.                                                                                      |
| [getNodeModelById](./detail/index#getnodemodelbyid)       | Get the `model` of the node                                                                            |
| [getNodeDataById](./detail/index#getnodedatabyid)         | Get the `model` data of a node.                                                                        |
| [getNodeIncomingEdge](./detail/index#getnodeincomingedge) | Get all the edges that `end` at this node.                                                             |
| [getNodeOutgoingEdge](./detail/index#getnodeoutgoingedge) | Get all the edges that `start` at this node.                                                           |
| [getNodeIncomingNode](./detail/index#getnodeincomingnode) | Get all parent nodes of the node.                                                                      |
| [getNodeOutgoingNode](./detail/index#getnodeoutgoingnode) | Get all the next-level nodes of the node.                                                              |

### Edge Related

| Option                                                  | Description                                                                                                          |
|:--------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| [setDefaultEdgeType](./detail/index#setdefaultedgetype) | Set the type of edge, i.e. set the type of linkage drawn directly by the user at the node.                           |
| [addEdge](./detail/index#addedge)                       | Create an edge connecting two nodes.                                                                                 |
| [getEdgeDataById](./detail/index#getedgedatabyid)       | Get edge data by `id`.                                                                                               |
| [getEdgeModelById](./detail/index#getedgemodelbyid)     | Get the model of the edge based on the its `id`.                                                                     |
| [getEdgeModels](./detail/index#getedgemodels)           | Get the model of the edge that satisfies the condition.                                                              |
| [changeEdgeId](./detail/index#changeedgeid)             | Modify the edge id. If a new id is not passed, one will be created internally automatically.                         |
| [changeEdgeType](./detail/index#changeedgetype)         | Switch type of the edge.                                                                                             |
| [deleteEdge](./detail/index#deleteedge)                 | Delete an edge based on its id.                                                                                      |
| [deleteEdgeByNodeId](./detail/index#deleteedgebynodeid) | Deletes an edge of the specified type, based on the start and end points of the edge, and can pass only one of them. |
| [getNodeEdges](./detail/index#getnodeedges)             | Get the model of all edges connected by the node.                                                                    |

### Register Related

| Option                                        | Description                   |
|:----------------------------------------------|-------------------------------|
| [register](./detail/index#register)           | Register custom nodes, edges. |
| [batchRegister](./detail/index#batchregister) | Batch register.               |

### Element Related

| Option                                                    | Description                                                               |
|:----------------------------------------------------------|---------------------------------------------------------------------------|
| [addElements](./detail/index#addelements)                 | Batch add nodes and edges.                                                |
| [selectElementById](./detail/index#selectelementbyid)     | Select the graph.                                                         |
| [getSelectElements](./detail/index#getselectelements)     | Get all elements selected.                                                |
| [clearSelectElements](./detail/index#clearselectelements) | Uncheck all elements.                                                     |
| [getModelById](./detail/index#getmodelbyid)               | Get the `model` of a node or edge based on its `id`.                      |
| [getDataById](./detail/index#getdatabyid)                 | Get the `data` of a node or edge based on its `id`.                       |
| [deleteElement](./detail/index#deleteelement)             | Delete the element by id.                                                 |
| [setElementZIndex](./detail/index#setelementzindex)       | Set the `zIndex` of the element.                                          |
| [getAreaElement](./detail/index#getareaelement)           | Gets all the elements in the specified region, which must be a DOM layer. |
| [setProperties](./detail/index#setproperties)             | Set the custom properties of nodes or edges.                              |
| [getProperties](./detail/index#getproperties)             | Get the custom properties of a node or an edge.                           |
| [deleteProperty](./detail/index#deleteproperty)           | Delete node attributes.                                                   |

### Text Related

| Option                                              | Description                                                                                                              |
|:----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| [editText](./detail/index#edittext)                 | Show text editing box for nodes and edges, entering edit mode, equivalent to [graphModel.editText](graphModel#editText). |
| [updateText](./detail/index#updatetext)             | Update the node or edge text.                                                                                            |
| [updateEditConfig](./detail/index#updateeditconfig) | Update the basic configuration of the flow editor.                                                                       |
| [getEditConfig](./detail/index#geteditconfig)       | Get the basic configuration of the flow editor.                                                                          |

### History Related

| Option                      | Description                                |
|:----------------------------|--------------------------------------------|
| [undo](./detail/index#undo) | History operation - Back to previous step. |
| [redo](./detail/index#redo) | History operation - Resume next.           |

### Transform Related

| Option                                                  | Description                                                                                                                     |
|:--------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| [zoom](./detail/index#zoom)                             | Zoom in or out on the canvas.                                                                                                   |
| [resetZoom](./detail/index#resetzoom)                   | Reset the zoom ratio of the drawing to the default, which is 1.                                                                 |
| [setZoomMiniSize](./detail/index#setzoomminisize)       | Sets the minimum number of times the graph can be scaled when it is reduced. The parameter takes values from 0 to 1. Default 0. |
| [setZoomMaxSize](./detail/index#setzoommaxsize)         | Set the maximum zoom scale when zooming in; default is 16.                                                                      |
| [getTransform](./detail/index#gettransform)             | Get the zoom in/out value of the current canvas.                                                                                |
| [translate](./detail/index#translate)                   | Panning graph.                                                                                                                  |
| [resetTranslate](./detail/index#resettranslate)         | Restore the graph to its original position.                                                                                     |
| [translateCenter](./detail/index#translatecenter)       | Graphics canvas centering.                                                                                                      |
| [fitView](./detail/index#fitview)                       | Reduce the entire flowchart to a size where the entire canvas can be displayed.                                                 |
| [openEdgeAnimation](./detail/index#openedgeanimation)   | Enable edge animations.                                                                                                         |
| [closeEdgeAnimation](./detail/index#closeedgeanimation) | Disable edge animations.                                                                                                        |

### Event System Related

| Option                      | Description                                                              |
|:----------------------------|--------------------------------------------------------------------------|
| [on](./detail/index#on)     | Event listener for the graph; see [Events](eventCenter) for more events. |
| [off](./detail/index#off)   | Remove event listener.                                                   |
| [once](./detail/index#once) | Event listener that triggers only once.                                  |
| [emit](./detail/index#emit) | Trigger an event.                                                        |
