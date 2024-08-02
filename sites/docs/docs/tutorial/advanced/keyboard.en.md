---
nav: Guide
group:
  title: Intermediate
  order: 2
title: Keyboard
order: 3
toc: content
---

## Shortcut Configuration

Shortcuts can be enabled by passing the keyboard attribute to options when creating a `LogicFlow`
instance.
You can configure only the enabled attribute, which, when true, enables the default shortcut keys.

```tsx | pure
const lf = new LogicFlow({
  container: document.querySelector('#app'),
  keyboard: {
    enabled: true,
  },
})
```

## 内置快捷键功能

Built-in shortcuts for copying, pasting, redoing/undoing, and deleting are available for different
products.

| Shortcuts           | Functions  |
|:--------------------|:-----------|
| cmd + c or ctrl + c | copy node  |
| cmd + v or ctrl + v | Paste Node |
| cmd + z or ctrl + z | Undo       |
| cmd + y or ctrl + y | Regression |
| backspace           | Delete     |

## Customized shortcuts

shortcuts allow you to define a user-defined set of shortcuts.
It is worth mentioning the rules for keys, which are consistent
with [mousetrap](https://www.npmjs.com/package/mousetrap).

We have customized the delete function as an example by adding a confirmation action before
deletion.

```tsx | pure
const lf = new LogicFlow({
  // ...
  keyboard: {
    enabled: true,
    shortcuts: [
      {
        keys: ["backspace"],
        callback: () => {
          const r = window.confirm("Are you sure you want to delete it？");
          if (r) {
            const elements = lf.getSelectElements(true);
            lf.clearSelectElements();
            elements.edges.forEach((edge) => lf.deleteEdge(edge.id));
            elements.nodes.forEach((node) => lf.deleteNode(node.id));
          }
        },
      },
    ],
  },
});
```

<a href="https://codesandbox.io/embed/logicflow-base10-eerft?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> Go to CodeSandbox for examples </a>
