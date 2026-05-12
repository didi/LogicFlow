---
nav: API
group:
  title: Runtime Model
  order: 3
title: nodeModel
toc: content
order: 13
---

Every diagram node has a `nodeModel` that owns serializable data and rendering hooks. Prefer `graphModel` APIs or documented model methods instead of assigning arbitrary fields.

:::error{title=Warning}
Writing fields without understanding history, edges, and text synchronization can break the diagram. Move nodes through `graphModel.moveNode` rather than mutating `x` / `y` directly unless you know the implications.
:::

## Data properties {#data-properties}

`data` mirrors what you pass through [`NodeConfig`](../type/MainTypes.en.md#nodeconfig): identity (`id`, `type`), geometry (`x`, `y`, `width`, `height`, rotation flags), nested `text`, `properties`, `zIndex`, and extension-specific slots returned by `getData()`.

## Shape attributes {#shape-attributes}

Geometry that participates in layout and edge routing—width, height, radius, etc.—must be updated inside `setAttributes()` (or equivalent lifecycle hooks). Changing them elsewhere may leave edges or anchors inconsistent.

## Style attributes {#style-attributes}

Visual styling is resolved through model methods such as `getNodeStyle`, `getTextStyle`, `getAnchorStyle`, `getOutlineStyle`, and related hooks. Override those methods in custom models instead of mutating SVG props directly from `view`.

## initNodeData {#initnodedata}

Called when the model instance is created; override to seed default geometry, text, or `properties` before the first render.

## setAttributes {#setattributes}

Runs whenever the renderer reconciles shape-related fields. Put width, height, radius, and other layout-critical updates here (especially for resizable nodes) so edges and anchors stay aligned.

For additional APIs (anchors, movement rules, serialization, etc.), follow the TypeScript definitions on `BaseNodeModel` / `RectNodeModel` in `@logicflow/core`.
