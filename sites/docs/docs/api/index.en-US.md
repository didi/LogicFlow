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

Usage
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

// create instance
const lf = new LogicFlow({
  container: document.querySelector('#container'),
  width: 700,
  height: 600,
  grid: true,
});

// render instance
lf.render(data);
```

## an actual example

All node instance operations on the flowchart, as well as events, and behavioral listening are performed on the `LogicFlow` instance.

`LogicFlow` configuration items: [constructor](detail/constructor)

## method

### Register Related

| Option  | Description               |
|:----------------------|-------------------------|
| [register](detail#register) | Register custom nodes, edges. |
| [batchRegister](detail#batchregister) | Batch register.        |

### Node Related

| Option  | Description               |
|:-----------------------|-------------------------|
| [addNode](detail#addnode)           | Add nodes to the graph.     |
| [deleteNode](detail#deletenode)     | Deletes a node on the graph, and if there is a line attached to this node, then also deletes the line. |
| [cloneNode](detail#clonenode)       | Clone a node.        |
| [changeNodeId](detail#changenodeid) | Modify the id of the node, if no new id is passed, one will be created internally automatically.             |
| [changeNodeType](detail#changenodetype)           | Modify node type.      |
| [getNodeModelById](detail#getnodemodelbyid)       | Get the `model` of the node |
| [getNodeDataById](detail#getnodedatabyid)         | Get the `model` data of a node. |
| [getNodeIncomingEdge](detail#getnodeincomingedge) | Get all the edges that `end` at this node.|
| [getNodeOutgoingEdge](detail#getnodeoutgoingedge) | Get all the edges that `start` at this node. |
| [getNodeIncomingNode](detail#getnodeincomingnode) | Get all parent nodes of the node. |
| [getNodeOutgoingNode](detail#getnodeoutgoingnode) | Get all the next-level nodes of the node. |

### Edge Related

| Option  | Description               |
|:-----------------------|-------------------------|
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

### Element Related

| Option  | Description               |
|:-----------------------|-------------------------|
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

### Text Related

| Option  | Description               |
|:-----------------------|-------------------------|
| [editText](detail#edittext)            | Show text editing box for nodes and edges, entering edit mode, equivalent to [graphModel.editText](api/graph-model-api#edittext).      |
| [updateText](detail#updatetext)     | Update the node or edge text.  |
| [updateEditConfig](detail#updateeditconfig)       | Update the basic configuration of the flow editor.  |
| [getEditConfig](detail#geteditconfig)             | Get the basic configuration of the flow editor.  |

### Graph Related

| Option  | Description               |
|:-----------------------|-------------------------|
| [setTheme](api/theme-api)           | Set the theme.        |
| [focusOn](detail#focuson)           | Position to the center of the canvas viewport.   |
| [resize](detail#resize)             | Adjusts the width and height of the canvas, if the width or height is not passed, the width and height of the canvas will be calculated automatically.     |
| [toFront](detail#tofront)           | Places an element to the top.  |
| [getPointByClient](detail#getpointbyclient)       | Get the coordinates of the event location relative to the top left corner of the canvas.           |
| [getGraphData](detail#getgraphdata) | Get flow graphing data.    |
| [getGraphRawData](detail#getgraphrawdata)         | Get the raw data of the flow graph. The difference with getGraphData is that the data obtained by this method is not affected by the `adapter`. |
| [clearData](detail#cleardata)       | Clear the canvas.      |
| [renderRawData](detail#renderrawdata)             | Rendering of the raw graph data. The difference with render is that after using `adapter`, you can use this method if you still want to render the data in logicflow format.  |
| [render](detail#render)             | Render graph data.     |

### History Related

| Option  | Description               |
|:-----------------------|-------------------------|
| [undo](detail#undo) | History operation - Back to previous step.|
| [redo](detail#redo) | History operation - Resume next.|

### Resize Related

| Option  | Description               |
|:-----------------------|-------------------------|
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

### Event System Related

| Option  | Description               |
|:-----------------------|-------------------------|
| [on](detail#on)     | Event listener for the graph; see [Events](api/event-center-api) for more events.    |
| [off](detail#off)   | Remove event listener.      |
| [once](detail#once) | Event listener that triggers only once.      |
| [emit](detail#emit) | Trigger an event.        |