---
nav: API
group:
  title: LogicFlow Instance
  order: 2
title: Overview
toc: content
order: 0
---

## Instance

All runtime operations, events, and listeners on the diagram go through the `LogicFlow` instance.

## Instance properties

| Property   | Type                  | Description                                      | Read-only |
| :--------- | :-------------------- | :----------------------------------------------- | :-------- |
| container  | HTMLElement           | DOM container the instance is mounted to         | Yes       |
| options    | LFOptions.Definition  | Instance configuration                           | Yes       |
| graphModel | [GraphModel](../runtime-model/graphModel.en.md) | Model for the entire canvas | Yes       |
| width      | number                | Canvas width in pixels                           | Yes       |
| height     | number                | Canvas height in pixels                          | Yes       |

## Instance methods

- [Rendering and data](./render-and-data.en.md): render, read/write, adapters
- [Nodes](./node.en.md): create, delete, query
- [Edges](./edge.en.md): edge types, CRUD, query
- [Elements](./element.en.md): selection, attributes, batch operations
- [Text](./text.en.md): text editing and updates
- [History](./history.en.md): undo and redo
- [Events](./event.en.md): event APIs and lists
- [Canvas](./canvas.en.md): zoom, pan, viewport
- [Theme](./theme.en.md): runtime theming
- [Register](./register.en.md): node/edge registration
- [Edit config](./edit-config.en.md): read/update edit configuration

## Constructor relationship

Options passed at construction time are documented under [LogicFlow constructor](../logicflow-constructor/index.en.md).
