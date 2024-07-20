---
nav: API
title: editConfigModel
toc: content
order: 4
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>


EditConfigModel is to control the page editing status.
See [set diagram edit mode](../../tutorial/advanced/silent-mode.en.md) for detailed usage

## Property Description

| Name                    | Type    | Default | Description                                                                                                                                    |
|-------------------------|---------|---------|------------------------------------------------------------------------------------------------------------------------------------------------|
| isSilentMode            | boolean | false   | Whether to be in silent mode                                                                                                                   |
| stopZoomGraph           | boolean | false   | Disable scaling of the canvas                                                                                                                  |
| stopScrollGraph         | boolean | false   | Disable mouse scrolling to move the canvas                                                                                                     |
| stopMoveGraph           | boolean | false   | Disable dragging the canvas                                                                                                                    |
| adjustEdge              | boolean | true    | Allow adjustment of sides                                                                                                                      |
| adjustEdgeMiddle        | boolean | false   | Only effective for the fold line, only the middle segment of the edge is allowed to be adjusted, not the segment connected to the starting end |
| adjustEdgeStartAndEnd   | boolean | false   | Allow adjustment of edge start/end point                                                                                                       |
| adjustNodePosition      | boolean | true    | Allow dragging of the node                                                                                                                     |
| hideAnchors             | boolean | false   | Hide all anchors of the node                                                                                                                   |
| allowRotation           | boolean | false   | Allow Rotation                                                                                                                                 |
| hoverOutline            | boolean | true    | Show the outer frame of the node when it is hovered                                                                                            |
| nodeTextEdit            | boolean | true    | Allow node text to be editable                                                                                                                 |
| edgeTextEdit            | boolean | true    | Allow edge text to be editable                                                                                                                 |
| nodeSelectedOutline     | boolean | true    | Outer box in node selection                                                                                                                    |
| edgeSelectedOutline     | boolean | true    | Side selection box                                                                                                                             |
| nodeTextDraggable       | boolean | false   | Allow node text to be draggable                                                                                                                |
| edgeTextDraggable       | boolean | false   | Allow edge text to be draggable                                                                                                                |
| metaKeyMultipleSelected | boolean | false   | Allow multiple selection of elements by meta key                                                                                               |
| autoExpand              | boolean | true    | Whether the node/edge automatically expands the canvas when it goes beyond the canvas                                                          |

## updateEditConfig <Badge>action</Badge>

Modify flow edit status

Parameters:
|Name|Type|Default|Description|
|-|-|-|-|
|config|object|-| page edit status configuration |

```tsx | pure
const { editConfigModel } = lf.graphModel;
editConfigModel.updateEditConfig({
  stopZoomGraph: true,
});
```

## getConfig <Badge>method</Badge>

Get the current page edit status

```tsx | pure
const { editConfigModel } = lf.graphModel;
editConfigModel.getConfig();
```
