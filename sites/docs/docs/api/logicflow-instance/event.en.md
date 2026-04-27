---
nav: API
group:
  title: LogicFlow Instance
  order: 2
title: Events
toc: content
order: 7
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

LogicFlow exposes an event bus so your code can react to diagram interactions. For narrative examples, see the guide [Events](../../tutorial/basic/event.en.md).

## Event APIs

### on

Subscribe to one or many events (comma-separated names).

**Parameters**

| Name | Type | Required | Default | Description |
| :------- | :------------ | :--- | :----- | :----------------------------------- |
| evt | string | Yes | - | Event name(s). |
| callback | EventCallback | Yes | - | Handler. |

**Example**

```ts
lf.on('node:click', (data) => {
  console.log('node clicked', data);
});

lf.on('node:click,edge:click', (data) => {
  console.log('element clicked', data);
});

lf.on('node:drag', ({ data }) => {
  console.log('dragging', data.id, data.x, data.y);
});

lf.on('blank:click', ({ e }) => {
  console.log('blank click', e.x, e.y);
});
```

**Notes**

- Multiple listeners stack for the same event.
- Payload shape depends on the specific event.

### off

Remove a listener; pass the same function reference used with `on`.

**Parameters**

| Name | Type | Required | Default | Description |
| :------- | :------------ | :--- | :----- | :----------------------------------- |
| evt | string | Yes | - | Event name(s). |
| callback | EventCallback | Yes | - | Handler to remove. |

**Example**

```ts
const handleNodeClick = (data) => {
  console.log('node clicked', data);
};

lf.on('node:click', handleNodeClick);
lf.off('node:click', handleNodeClick);
lf.off('node:click,edge:click', handleNodeClick);
```

### once

Like `on`, but the handler fires once and is removed automatically.

**Parameters**

| Name | Type | Required | Default | Description |
| :------- | :------------ | :--- | :----- | :----------------------------------- |
| evt | string | Yes | - | Event name(s). |
| callback | EventCallback | Yes | - | Handler. |

**Example**

```ts
lf.once('node:click', (data) => {
  console.log('first click only', data);
});

lf.once('graph:rendered', (data) => {
  console.log('rendered', data);
});
```

### emit

Manually dispatch an event (mostly for custom channels).

**Parameters**

| Name | Type | Required | Default | Description |
| :-------- | :-------- | :--- | :----- | :------- |
| evt | string | Yes | - | Event name. |
| eventArgs | EventArgs | Yes | - | Payload. |

**Example**

```ts
lf.emit('custom:event', {
  type: 'custom:event',
  data: {
    message: 'Hello World',
  },
});

lf.on('custom:event', (data) => {
  console.log(data);
});

lf.emit('node:click', {
  type: 'node:click',
  data: lf.getNodeDataById('node_1'),
});
```

Avoid emitting built-in events unless you understand side effects.

## Event index

## Node events

| Event | Description | Payload highlights |
| :-------------------------------------------- | :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| element:click | Element click | data, e, position |
| node:click | Node click | data, e, position |
| node:dbclick | Node double click | data, e, position |
| node:mousedown | Mouse down on node | data, e |
| node:mouseup | Mouse up on node | data, e |
| node:mousemove | Mouse move on node | data, e |
| node:mouseenter | Pointer enters node | data, e |
| node:mouseleave | Pointer leaves node | data, e |
| node:delete | Node removed | data |
| node:add | Node added | data |
| node:dnd-add | External drag-and-drop completed | data |
| node:dnd-drag | External drag in progress | data, e |
| node:dragstart | Node drag start | data, e |
| node:drag | Node dragging | data, e |
| node:drop | Node drag end | data, e |
| node:contextmenu | Context menu on node | data, e, position |
| node:resize<Badge>2.0</Badge> | Resize handles | preData, data, model, deltaX, deltaY, index |
| node:properties-change<Badge>2.0</Badge> | `properties` mutation | id, keys, preProperties, properties |

Payload reference:

| Field | Type | Meaning |
| :------- | :--------- | :------------------------------------------------------------------------------------------------------------- |
| data | Object | Node data fields ([data properties](../runtime-model/nodeModel.en.md#data-properties)). |
| e | MouseEvent | Native mouse event. |
| position | Object | Canvas coordinates (same shape as [`getPointByClient`](./canvas.en.md#getpointbyclient)). |

## Edge events

| Event | Description | Payload highlights |
| :--------------------- | :---------------- | :---------------- |
| element:click | Element click | data, e, position |
| edge:click | Edge click | data, e, position |
| edge:dbclick | Edge double click | data, e |
| edge:mouseenter | Pointer enters edge | data, e |
| edge:mouseleave | Pointer leaves edge | data, e |
| edge:add | Edge created | data |
| edge:delete | Edge removed | data |
| edge:contextmenu | Context menu on edge | data, e, position |
| edge:adjust | Polyline/endpoint adjusted | data |
| edge:exchange-node | Edge endpoints swapped | data |
| connection:not-allowed | Validation rejected a link | data, msg |

| Field | Type | Meaning |
| :------- | :--------- | :------------------------------------------------------------------------------------------------------------- |
| data | Object | Edge data ([data properties](../runtime-model/edgeModel.en.md#data-properties)). |
| e | MouseEvent | Native mouse event. |
| position | Object | Canvas coordinates ([`getPointByClient`](./canvas.en.md#getpointbyclient)). |
| msg | string | Validation message when connection fails. |

## Anchor events

| Event | Description | Payload |
| :--------------- | :------------------------------------------------------------------------------------------------------ | :---------------------------- |
| anchor:dragstart | Manual edge creation started | data, e, nodeModel |
| anchor:drop | Edge successfully created from anchor drag | data, e, nodeModel, edgeModel |
| anchor:drag | Anchor drag move | data, e, nodeModel |
| anchor:dragend | Anchor gesture finished (success or cancel) | data, e, nodeModel |

| Field | Type | Meaning |
| :-------- | :--------- | :----------------- |
| data | Object | Anchor payload. |
| e | MouseEvent | Native mouse event. |
| nodeModel | Object | Owner node model. |

## Canvas events

| Event | Description | Payload |
| :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------- |
| blank:mousedown | Canvas mouse down | e |
| blank:mousemove | Canvas mouse move | e |
| blank:mouseup | Canvas mouse up | e |
| blank:click | Canvas click | e |
| blank:contextmenu | Canvas context menu | e, position |
| blank:dragstart | Canvas drag start | e |
| blank:drag | Canvas dragging | e |
| blank:drop | Canvas drag end | e |
| text:update | Label text updated | data |
| graph:transform | Pan/zoom changed | data |
| graph:rendered | After `lf.render` completes (`v1.1.0`) | graphData |
| graph:updated | Any graph refresh (`v2.0.0`) | - |

| Field | Type | Meaning |
| :------- | :--------- | :------------------------------------------------------------------------------------------------------------- |
| e | MouseEvent | Native mouse event. |
| position | Object | Canvas coordinates ([`getPointByClient`](./canvas.en.md#getpointbyclient)). |

## History events

The history plugin emits when undo/redo stacks change.

| Event | Description | Payload |
| :------------- | :------- | :------- |
| history:change | Stack snapshot updated | data |

| Field | Type | Meaning |
| :------- | :------ | :------------------ |
| undos | Array | Undo snapshots. |
| redos | Array | Redo snapshots. |
| undoAble | boolean | Undo available. |
| redoAble | boolean | Redo available. |

## Selection events

Emitted when marquee / multi-select plugins manipulate regions.

| Event | Description | Payload |
| :-------------------- | :------------- | :------------- |
| selection:selected | Box selection finished | Selected elements |
| selection:mousedown | Selection mouse down | e |
| selection:dragstart | Selection drag start | e |
| selection:drag | Selection dragging | e |
| selection:drop | Selection drag end | e |
| selection:mousemove | Selection pointer move | e, position |
| selection:mouseup | Selection mouse up | e |
| selection:contextmenu | Selection context menu | e |

## Text events

Inline text editing gestures.

| Event | Description | Payload |
| :------------- | :------------------- | :---------------------- |
| text:mousedown | Mouse down on text | e, data |
| text:dragstart | Start dragging label | e, data |
| text:drag | Dragging label | e, data |
| text:drop | Drop label | e, data |
| text:click | Click text | e |
| text:dbclick | Double click text | e |
| text:blur | Editor blurred | e |
| text:mousemove | Move inside editor | e, data, deltaX, deltaY |
| text:mouseup | Mouse up inside editor | e, data |
| text:update | Content updated | data |

## Plugin-specific events

### DndPanel

| Event | Description | Payload |
| :-------------------- | :--------------- | :------- |
| dnd:panel-dbclick | Palette double click | e, data |
| dnd:panel-click | Palette click | e, data |
| dnd:panel-contextmenu | Palette context menu | e, data |

### MiniMap

| Event | Description | Payload |
| :------------ | :--------------- | :------- |
| miniMap:close | Mini map hidden | - |

### SelectionSelect

| Event | Description | Payload |
| :---------------------- | :------------------------------------- | :------------------------------------------------------------------- |
| selection:selected-area | Marquee bounds | topLeft, bottomRight |
| selection:drop | Mouse up with hits | e |
| selection:selected | Selection committed | elements, topLeft, bottomRight |

### DynamicGroup / Group

| Event | Description | Payload |
| :-------------------------------------------- | :-------------------------------- | :-------------------------------------------- |
| group:add-node | Child added | data, childId |
| group:remove-node | Child removed | data, childId |
| group:not-allowed | Join rejected | group, node |
| dynamicGroup:collapse<Badge>2.1.0</Badge> | Collapse toggled | collapse, nodeModel |

### Highlight

| Event | Description | Payload |
| :------------------- | :-------------------------------- | :------------------- |
| highlight:single | Single-element highlight | data |
| highlight:neighbours | Neighbour highlight | data, relateElements |
| highlight:path | Path highlight | data, relateElements |

### Label

| Event | Description | Payload |
| :-------------- | :------------------- | :---------------------- |
| label:mousedown | Mouse down | e, data |
| label:dragstart | Drag start | e, data |
| label:drag | Dragging | e, data |
| label:drop | Drop | e, data |
| label:mousemove | Move inside label | e, data, deltaX, deltaY |
| label:mouseup | Mouse up | e, data |
