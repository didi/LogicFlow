---
nav: Guide
group:
  title: Intermediate
  order: 2
title: Snapline
order: 2
toc: content
---

Snap-lines assist in positional adjustment by comparing the position of a moving node with the
position of other nodes in the canvas as the node moves. The position comparison is done in two
ways.

- The center of the node
- The border of the node

## Alignment Line Usage

Alignment lines are turned on by default in normal editing mode, and can also be turned off by
configuration.
In [silent mode](silent-mode.en.md#silent-mode), it is not possible to move the node, so the
alignment line function is turned off and cannot be turned on by configuration.

```tsx | pure
const lf = new LogicFlow({
  snapline: false,
});
```

## Alignment Line Style Settings

The style of the alignment line includes color and width, which can be modified by setting the
theme.

```tsx | pure
// default configuration
// {
//   stroke: '#1E90FF',
//   strokeWidth: 1,
// }

// Modify the alignment line style
lf.setTheme({
  snapline: {
    stroke: '#1E90FF',
    strokeWidth: 1,
  },
})
```

<example :height="400" ></example>

For more modifications to the styles see [Theme](../basic/theme.en.md)
