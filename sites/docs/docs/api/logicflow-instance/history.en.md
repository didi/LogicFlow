---
nav: API
group:
  title: LogicFlow Instance
  order: 2
title: Edit history
toc: content
order: 6
---

This page documents instance APIs related to edit history.

### undo

Go one step back in history.

**Example**

```ts
lf.undo();
```

### redo

Go one step forward in history.

**Example**

```ts
lf.redo();
```

**Notes**

- Check whether redo is allowed before calling.
- Operations emit the corresponding history events.

Constructor toggle: [Constructor options](../logicflow-constructor/index.en.md).
