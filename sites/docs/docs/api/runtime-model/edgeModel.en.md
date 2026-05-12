---
nav: API
group:
  title: Runtime Model
  order: 3
title: edgeModel
toc: content
order: 14
---

Every edge exposes an `edgeModel` that mirrors the node pattern: data feeds rendering, and state transitions should go through documented APIs.

:::error{title=Warning}
Direct field writes can desynchronize anchors, bend points, and text overlays. Use built-in helpers whenever possible.
:::

## Data properties {#data-properties}

Edge payloads combine [`EdgeConfig`](../type/MainTypes.en.md#edgeconfig) fields (`sourceNodeId`, `targetNodeId`, anchor ids, `pointsList`, text metadata, etc.) with runtime caches maintained while the edge exists on the canvas.

## Shape attributes {#shape-attributes}

Attributes that influence routing—control points, endpoints, or adjustable segments—belong in `setAttributes()` so dependent computations stay coherent.

## Style attributes {#style-attributes}

Theme-facing hooks include `getEdgeStyle`, `getTextStyle`, `getArrowStyle`, `getOutlineStyle`, animation helpers, and adjust-handle styling. Override these methods inside custom edge models to integrate with LogicFlow’s theme pipeline rather than mutating SVG fragments manually.

For additional lifecycle methods (`initEdgeData`, `setAttributes`, history snapshots, etc.), follow the `BaseEdgeModel` typings shipped with `@logicflow/core`.
