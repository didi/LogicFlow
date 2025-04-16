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

## Instance

All node instance operations, event handling, and behavior monitoring on the flowchart are performed on the `LogicFlow` instance.

`LogicFlow` configuration options: [constructor](./detail/constructor.en.md)

### Instance Properties

| Property   | Type                 | Description                                   | Read-only |
| :--------- | :------------------- | :-------------------------------------------- | :-------- |
| container  | HTMLElement          | Container where LogicFlow instance is mounted | Yes       |
| options    | LFOptions.Definition | LogicFlow instance configuration              | Yes       |
| graphModel | GraphModel           | Model controlling the entire LogicFlow canvas | Yes       |
| width      | number               | Canvas width                                  | Yes       |
| height     | number               | Canvas height                                 | Yes       |

## Instance Methods

### Graph Related

| Option                                                    | Description                                                                                                                |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [setTheme](theme.en.md)                                   | Set theme.                                                                                                                 |
| [focusOn](./detail/index.en.md#focuson)                   | Focus to canvas viewport center.                                                                                           |
| [resize](./detail/index.en.md#resize)                     | Adjust canvas width and height. If `width` or `height` is not provided, it will automatically calculate canvas dimensions. |
| [toFront](./detail/index.en.md#tofront)                   | Bring an element to the front.                                                                                             |
| [getPointByClient](./detail/index.en.md#getpointbyclient) | Get coordinates relative to canvas top-left corner from event position.                                                    |
| [getGraphData](./detail/index.en.md#getgraphdata)         | Get flow diagram data.                                                                                                     |
| [getGraphRawData](./detail/index.en.md#getgraphrawdata)   | Get raw flow diagram data. Different from `getGraphData` in that this method gets data unaffected by `adapter`.            |
| [clearData](./detail/index.en.md#cleardata)               | Clear canvas.                                                                                                              |
| [renderRawData](./detail/index.en.md#renderrawdata)       | Render raw graph data. Used to render LogicFlow format data after using `adapter`.                                         |
| [render](./detail/index.en.md#render)                     | Render graph data.                                                                                                         |
| [destroy](./detail/index.en.md#destroy)                   | Destroy current LogicFlow instance and clean up resources.                                                                 |

### Node Related

| Option                                                          | Description                                                                            |
| :-------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| [addNode](./detail/index.en.md#addnode)                         | Add a node to the graph.                                                               |
| [deleteNode](./detail/index.en.md#deletenode)                   | Delete a node from the graph. Also deletes any connected edges.                        |
| [cloneNode](./detail/index.en.md#clonenode)                     | Clone a node.                                                                          |
| [changeNodeId](./detail/index.en.md#changenodeid)               | Change a node's `id`. If no new `id` is provided, one will be automatically generated. |
| [changeNodeType](./detail/index.en.md#changenodetype)           | Change node type.                                                                      |
| [getNodeModelById](./detail/index.en.md#getnodemodelbyid)       | Get a node's `model`.                                                                  |
| [getNodeDataById](./detail/index.en.md#getnodedatabyid)         | Get a node's `model` data.                                                             |
| [getNodeIncomingEdge](./detail/index.en.md#getnodeincomingedge) | Get all edges that end at this node.                                                   |
| [getNodeOutgoingEdge](./detail/index.en.md#getnodeoutgoingedge) | Get all edges that start from this node.                                               |
| [getNodeIncomingNode](./detail/index.en.md#getnodeincomingnode) | Get all upstream nodes of a node.                                                      |
| [getNodeOutgoingNode](./detail/index.en.md#getnodeoutgoingnode) | Get all downstream nodes of a node.                                                    |

### Edge Related

| Option                                                        | Description                                                                        |
| :------------------------------------------------------------ | :--------------------------------------------------------------------------------- |
| [setDefaultEdgeType](./detail/index.en.md#setdefaultedgetype) | Set default edge type, used for edges manually connected by users.                 |
| [addEdge](./detail/index.en.md#addedge)                       | Create an edge connecting two nodes.                                               |
| [getEdgeDataById](./detail/index.en.md#getedgedatabyid)       | Get edge data by `id`.                                                             |
| [getEdgeModelById](./detail/index.en.md#getedgemodelbyid)     | Get edge `model` by edge `id`.                                                     |
| [getEdgeModels](./detail/index.en.md#getedgemodels)           | Get edge `models` that meet conditions.                                            |
| [changeEdgeId](./detail/index.en.md#changeedgeid)             | Change edge `id`. If no new `id` is provided, one will be automatically generated. |
| [changeEdgeType](./detail/index.en.md#changeedgetype)         | Change edge type.                                                                  |
| [deleteEdge](./detail/index.en.md#deleteedge)                 | Delete edge by `id`.                                                               |
| [deleteEdgeByNodeId](./detail/index.en.md#deleteedgebynodeid) | Delete edges connected to specified node based on source and target nodes.         |
| [getNodeEdges](./detail/index.en.md#getnodeedges)             | Get `models` of all edges connected to a node.                                     |

### Register Related

| Option                                              | Description                      |
| :-------------------------------------------------- | :------------------------------- |
| [register](./detail/index.en.md#register)           | Register custom nodes and edges. |
| [batchRegister](./detail/index.en.md#batchregister) | Batch registration.              |

### Element Related

| Option                                                          | Description                                                     |
| :-------------------------------------------------------------- | :-------------------------------------------------------------- |
| [addElements](./detail/index.en.md#addelements)                 | Batch add nodes and edges.                                      |
| [selectElementById](./detail/index.en.md#selectelementbyid)     | Select a shape.                                                 |
| [getSelectElements](./detail/index.en.md#getselectelements)     | Get all selected elements.                                      |
| [clearSelectElements](./detail/index.en.md#clearselectelements) | Clear selection state of all elements.                          |
| [getModelById](./detail/index.en.md#getmodelbyid)               | Get `model` by node or edge `id`.                               |
| [getDataById](./detail/index.en.md#getdatabyid)                 | Get `data` by node or edge `id`.                                |
| [deleteElement](./detail/index.en.md#deleteelement)             | Delete element.                                                 |
| [setElementZIndex](./detail/index.en.md#setelementzindex)       | Set element `zIndex`.                                           |
| [getAreaElement](./detail/index.en.md#getareaelement)           | Get all elements in specified area (area must be in DOM layer). |
| [setProperties](./detail/index.en.md#setproperties)             | Set custom properties for node or edge.                         |
| [getProperties](./detail/index.en.md#getproperties)             | Get custom properties of node or edge.                          |
| [deleteProperty](./detail/index.en.md#deleteproperty)           | Delete node property.                                           |

### Text Related

| Option                                                    | Description                                                                                                |
| :-------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| [editText](./detail/index.en.md#edittext)                 | Show text editor for node/edge text, enter edit state, same as [graphModel.editText](graphModel#edittext). |
| [updateText](./detail/index.en.md#updatetext)             | Update node or edge text.                                                                                  |
| [updateEditConfig](./detail/index.en.md#updateeditconfig) | Update basic flow editing configuration.                                                                   |
| [getEditConfig](./detail/index.en.md#geteditconfig)       | Get basic flow editing configuration.                                                                      |

### History Related

| Option                            | Description                          |
| :-------------------------------- | :----------------------------------- |
| [undo](./detail/index.en.md#undo) | History operation - go back a step.  |
| [redo](./detail/index.en.md#redo) | History operation - go forward step. |

### Transform Related

| Option                                                        | Description                                                                    |
| :------------------------------------------------------------ | :----------------------------------------------------------------------------- |
| [zoom](./detail/index.en.md#zoom)                             | Zoom canvas in/out.                                                            |
| [resetZoom](./detail/index.en.md#resetzoom)                   | Reset graph zoom ratio to default (1).                                         |
| [setZoomMiniSize](./detail/index.en.md#setzoomminisize)       | Set minimum zoom ratio when shrinking graph. Usually between 0-1, default 0.2. |
| [setZoomMaxSize](./detail/index.en.md#setzoommaxsize)         | Set maximum zoom ratio when enlarging graph, default 16.                       |
| [getTransform](./detail/index.en.md#gettransform)             | Get current canvas zoom value and offset value.                                |
| [translate](./detail/index.en.md#translate)                   | Pan the graph.                                                                 |
| [resetTranslate](./detail/index.en.md#resettranslate)         | Reset graph to initial position.                                               |
| [translateCenter](./detail/index.en.md#translatecenter)       | Center graph in canvas.                                                        |
| [fitView](./detail/index.en.md#fitview)                       | Shrink entire flowchart to fit canvas display.                                 |
| [openEdgeAnimation](./detail/index.en.md#openedgeanimation)   | Enable edge animation.                                                         |
| [closeEdgeAnimation](./detail/index.en.md#closeedgeanimation) | Disable edge animation.                                                        |

### Data Adapters

| Option                                        | Description                                                                                               |
| :-------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| [adapterIn](./detail/index.en.md#adapterin)   | Custom input data conversion method, used when incoming system format differs from LogicFlow data format. |
| [adapterOut](./detail/index.en.md#adapterout) | Custom output data conversion method, can convert data to required format.                                |

### Event System

| Option                            | Description                                                              |
| :-------------------------------- | :----------------------------------------------------------------------- |
| [on](./detail/index.en.md#on)     | Graph event listener, see [Events](./eventCenter.en.md) for more events. |
| [off](./detail/index.en.md#off)   | Remove event listener.                                                   |
| [once](./detail/index.en.md#once) | Listen to event once.                                                    |
| [emit](./detail/index.en.md#emit) | Trigger event.                                                           |
