---
nav: Guide
group:
title: Plugin Function
order: 3
title: Progressive Connection
order: 6
toc: content
tag: New Plugin
---

Progressive Connection is a dynamic interaction method in flowchart tools. Through dynamic interaction and intelligent adsorption, it helps users achieve accurate connection between nodes during the dragging process. It simplifies the operation and improves the efficiency and experience of complex process design.

## Demo

<code id="react-portal" src="@/src/tutorial/extension/proximity-connect"></code>

## Functional introduction
This plugin supports progressive connection in two scenarios:
- Drag node connection: When the mouse drags the node to move, find the nearest connectable anchor point connection according to the current node position
- Drag anchor point connection: When the mouse drags the node anchor point, find the nearest connectable anchor point connection according to the current mouse position

The plugin will listen to the following events and take some actions
| Event            | Plugin Behavior                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| node:dragstart   | Store the currently dragged node data in the plugin                                                                                                                                                                                                                                                                                                                                            |
| node:drag        | 1. Traverse all nodes on the canvas, calculate the distance between each anchor point on each node and each anchor point on the currently dragged node, find the shortest distance and a group of connectable anchor points and store them<br/>2. Determine whether the current shortest distance is less than the threshold. If so, create a virtual edge to show the final connection effect |
| node:drop        | Delete the virtual edge and create a real edge                                                                                                                                                                                                                                                                                                                                                 |
| anchor:dragstart | Store the data of the currently dragged node and the trigger anchor point in the plug-in                                                                                                                                                                                                                                                                                                       |
| anchor:drag      | 1. Traverse all nodes on the canvas, find an anchor point that is the shortest distance from the current mouse position and can be connected and store it in the plug-in<br/>2. Determine whether the current shortest distance is less than the threshold. If so, create a virtual edge to show the final connection effect                                                                   |
| anchor:dragend   | Delete the virtual edge and create the real edge                                                                                                                                                                                                                                                                                                                                               |

> Some Tips:
> 1. Before finding the anchor point, it will first determine whether there is a connection with the same anchor point and direction on the current canvas. If so, no connection will be created;
> 2. During the process of finding the anchor point, the anchor point data will be first obtained to determine whether the current set of anchor points can be connected. If not, no virtual edge will be generated;

## Use plug-ins

```tsx | purex | pure
import LogicFlow from "@logicflow/core";
import { ProximityConnect } from "@logicflow/extension";
import "@logicflow/core/es/index.css";
import "@logicflow/extension/lib/style/index.css";

// Two ways of using
// Import the plugin through the use method
LogicFlow.use(ProximityConnect);

// Or enable the plugin through the configuration item (you can configure the plugin properties)
const lf = new LogicFlow({
container: document.querySelector('#app'),
plugins: [ProximityConnect],
pluginsOptions: {
proximityConnect: {
// enable, // Whether the plugin is enabled
// distance, // Progressive connection threshold
// reverseDirection, // Connection direction
}
},
});
```

## Configuration items

Each function in the menu can be represented by a configuration item. The specific fields are as follows:

| Field            | Type    | Default value                                   | Required | Description                                                                                                                                                                                                               |
| ---------------- | ------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| enable           | boolean | `true`                                          |          | Enable the plugin                                                                                                                                                                                                         |
| distance         | number  | 100                                             |          | Gradual connection threshold                                                                                                                                                                                              |
| reverseDirection | boolean | false                                           |          | Whether to create a reverse connection<br/>The default connection direction is that the currently dragged node points to the nearest node<br/>When set to true, the nearest node will point to the currently dragged node |
| virtualEdgeStyle | object  | { strokeDasharray: '10,10', stroke: '#acacac' } |          | Virtual line style                                                                                                                                                                                                        |

## API
### setThresholdDistance(distance)
Used to modify the connection threshold

```ts
setThresholdDistance = (distance: 'number'): void => {}
```
### setReverseDirection(reverse)
Used to modify the direction of creating a connection

```ts
setReverseDirection = (reverse: 'boolean'): void => {}
```
### setEnable(enable)
Used to set the plug-in enable status

```ts
setEnable = (enable: 'boolean'): void => {}
```
### setVirtualEdgeStyle(style)
Set the virtual edge style

```ts
setVirtualEdgeStyle = (style: 'Record<string, unknown>'): void => {}
```