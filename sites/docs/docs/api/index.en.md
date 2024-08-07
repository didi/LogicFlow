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

## instance

All node instance operations on the flowchart, as well as events, and behavioral listening are
performed on the `LogicFlow` instance.

`LogicFlow` configuration items: [constructor](./detail/constructor.en.md)

## method

### Graph Related

| Option                                                    | Description                                           |
|:----------------------------------------------------------|-------------------------------------------------------|
| [setTheme](theme.en.md)                                   | Set the theme.                                        |
| [focusOn](./detail/index.en.md#focuson)                   | Position to the center of the canvas viewport.        |
| [resize](./detail/index.en.md#resize)                     | Adjusts the width and height of the canvas, if the width or height is not passed, the width and height of the canvas will be calculated automatically.                       |
| [toFront](./detail/index.en.md#tofront)                   | Places an element to the top.                         |
| [getPointByClient](./detail/index.en.md#getpointbyclient) | Get the coordinates of the event location relative to the top left corner of the canvas.                          |
| [getGraphData](./detail/index.en.md#getgraphdata)         | Get flow graphing data.                               |
| [getGraphRawData](./detail/index.en.md#getgraphrawdata)   | Get the raw data of the flow graph. The difference with getGraphData is that the data obtained by this method is not affected by the `adapter`.                             |
| [clearData](./detail/index.en.md#cleardata)               | Clear the canvas.                                     |
| [renderRawData](./detail/index.en.md#renderrawdata)       | Rendering of the raw graph data. The difference with render is that after using `adapter`, you can use this method if you still want to render the data in logicflow format. |
| [render](./detail/index.en.md#render)                     | Render graph data.                                    |

### Node Related

| Option                                                    | Description                                                                                            |
|:----------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| [addNode](./detail/index.en.md#addnode)                         | Add nodes to the graph.                                                                                |
| [deleteNode](./detail/index.en.md#deletenode)                   | Deletes a node on the graph, and if there is a line attached to this node, then also deletes the line. |
| [cloneNode](./detail/index.en.md#clonenode)                     | Clone a node.                                                                                          |
| [changeNodeId](./detail/index.en.md#changenodeid)               | Modify the id of the node, if no new id is passed, one will be created internally automatically.       |
| [changeNodeType](./detail/index.en.md#changenodetype)           | Modify node type.                                                                                      |
| [getNodeModelById](./detail/index.en.md#getnodemodelbyid)       | Get the `model` of the node                                                                            |
| [getNodeDataById](./detail/index.en.md#getnodedatabyid)         | Get the `model` data of a node.                                                                        |
| [getNodeIncomingEdge](./detail/index.en.md#getnodeincomingedge) | Get all the edges that `end` at this node.                                                             |
| [getNodeOutgoingEdge](./detail/index.en.md#getnodeoutgoingedge) | Get all the edges that `start` at this node.                                                           |
| [getNodeIncomingNode](./detail/index.en.md#getnodeincomingnode) | Get all parent nodes of the node.                                                                      |
| [getNodeOutgoingNode](./detail/index.en.md#getnodeoutgoingnode) | Get all the next-level nodes of the node.                                                              |

### Edge Related

| Option                                                  | Description                                                                                                          |
|:--------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| [setDefaultEdgeType](./detail/index.en.md#setdefaultedgetype) | Set the type of edge, i.e. set the type of linkage drawn directly by the user at the node.                           |
| [addEdge](./detail/index.en.md#addedge)                       | Create an edge connecting two nodes.                                                                                 |
| [getEdgeDataById](./detail/index.en.md#getedgedatabyid)       | Get edge data by `id`.                                                                                               |
| [getEdgeModelById](./detail/index.en.md#getedgemodelbyid)     | Get the model of the edge based on the its `id`.                                                                     |
| [getEdgeModels](./detail/index.en.md#getedgemodels)           | Get the model of the edge that satisfies the condition.                                                              |
| [changeEdgeId](./detail/index.en.md#changeedgeid)             | Modify the edge id. If a new id is not passed, one will be created internally automatically.                         |
| [changeEdgeType](./detail/index.en.md#changeedgetype)         | Switch type of the edge.                                                                                             |
| [deleteEdge](./detail/index.en.md#deleteedge)                 | Delete an edge based on its id.                                                                                      |
| [deleteEdgeByNodeId](./detail/index.en.md#deleteedgebynodeid) | Deletes an edge of the specified type, based on the start and end points of the edge, and can pass only one of them. |
| [getNodeEdges](./detail/index.en.md#getnodeedges)             | Get the model of all edges connected by the node.                                                                    |

### Register Related

| Option                                        | Description                   |
|:----------------------------------------------|-------------------------------|
| [register](./detail/index.en.md#register)           | Register custom nodes, edges. |
| [batchRegister](./detail/index.en.md#batchregister) | Batch register.               |

### Element Related

| Option                                                    | Description                                                               |
|:----------------------------------------------------------|---------------------------------------------------------------------------|
| [addElements](./detail/index.en.md#addelements)                 | Batch add nodes and edges.                                                |
| [selectElementById](./detail/index.en.md#selectelementbyid)     | Select the graph.                                                         |
| [getSelectElements](./detail/index.en.md#getselectelements)     | Get all elements selected.                                                |
| [clearSelectElements](./detail/index.en.md#clearselectelements) | Uncheck all elements.                                                     |
| [getModelById](./detail/index.en.md#getmodelbyid)               | Get the `model` of a node or edge based on its `id`.                      |
| [getDataById](./detail/index.en.md#getdatabyid)                 | Get the `data` of a node or edge based on its `id`.                       |
| [deleteElement](./detail/index.en.md#deleteelement)             | Delete the element by id.                                                 |
| [setElementZIndex](./detail/index.en.md#setelementzindex)       | Set the `zIndex` of the element.                                          |
| [getAreaElement](./detail/index.en.md#getareaelement)           | Gets all the elements in the specified region, which must be a DOM layer. |
| [setProperties](./detail/index.en.md#setproperties)             | Set the custom properties of nodes or edges.                              |
| [getProperties](./detail/index.en.md#getproperties)             | Get the custom properties of a node or an edge.                           |
| [deleteProperty](./detail/index.en.md#deleteproperty)           | Delete node attributes.                                                   |

### Text Related

| Option                                              | Description                                                                                                              |
|:----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| [editText](./detail/index.en.md#edittext)                 | Show text editing box for nodes and edges, entering edit mode, equivalent to [graphModel.editText](graphModel#editText). |
| [updateText](./detail/index.en.md#updatetext)             | Update the node or edge text.                                                                                            |
| [updateEditConfig](./detail/index.en.md#updateeditconfig) | Update the basic configuration of the flow editor.                                                                       |
| [getEditConfig](./detail/index.en.md#geteditconfig)       | Get the basic configuration of the flow editor.                                                                          |

### History Related

| Option                      | Description                                |
|:----------------------------|--------------------------------------------|
| [undo](./detail/index.en.md#undo) | History operation - Back to previous step. |
| [redo](./detail/index.en.md#redo) | History operation - Resume next.           |

### Transform Related

| Option                                                  | Description                                                                                                                     |
|:--------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| [zoom](./detail/index.en.md#zoom)                             | Zoom in or out on the canvas.                                                                                                   |
| [resetZoom](./detail/index.en.md#resetzoom)                   | Reset the zoom ratio of the drawing to the default, which is 1.                                                                 |
| [setZoomMiniSize](./detail/index.en.md#setzoomminisize)       | Sets the minimum number of times the graph can be scaled when it is reduced. The parameter takes values from 0 to 1. Default 0. |
| [setZoomMaxSize](./detail/index.en.md#setzoommaxsize)         | Set the maximum zoom scale when zooming in; default is 16.                                                                      |
| [getTransform](./detail/index.en.md#gettransform)             | Get the zoom in/out value of the current canvas.                                                                                |
| [translate](./detail/index.en.md#translate)                   | Panning graph.                                                                                                                  |
| [resetTranslate](./detail/index.en.md#resettranslate)         | Restore the graph to its original position.                                                                                     |
| [translateCenter](./detail/index.en.md#translatecenter)       | Graphics canvas centering.                                                                                                      |
| [fitView](./detail/index.en.md#fitview)                       | Reduce the entire flowchart to a size where the entire canvas can be displayed.                                                 |
| [openEdgeAnimation](./detail/index.en.md#openedgeanimation)   | Enable edge animations.                                                                                                         |
| [closeEdgeAnimation](./detail/index.en.md#closeedgeanimation) | Disable edge animations.                                                                                                        |

### Event System Related

| Option                      | Description                                                              |
|:----------------------------|--------------------------------------------------------------------------|
| [on](./detail/index.en.md#on)     | Event listener for the graph; see [Events](./eventCenter.en.md) for more events. |
| [off](./detail/index.en.md#off)   | Remove event listener.                                                   |
| [once](./detail/index.en.md#once) | Event listener that triggers only once.                                  |
| [emit](./detail/index.en.md#emit) | Trigger an event.                                                        |
