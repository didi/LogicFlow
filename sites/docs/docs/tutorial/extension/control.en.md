---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: Control
order: 3
toc: content
---

### start using

```tsx | purex | pure
import LogicFlow from "@logicflow/core";
import { Control } from "@logicflow/extension";
import "@logicflow/extension/lib/style/index.css";

LogicFlow.use(Control);
```

After registering the `Control` component, Logic Flow creates a control panel at the top right of
the canvas, as shown here

The control panel provides the common ability to zoom in and out or adapt to the canvas, and also
has built-in redo and undo functionality, of course if you don't like the UI or the functionality,
you can define your own based on the [API](../../api) provided by `LogicFlow`.


<details>
  <summary>The following controls are built into the control panel</summary>
  <pre><code style="background-color: #282c34; color: #7ec798">
private controlItems: ControlItem[] = [
    {
      key: 'zoom-out',
      iconClass: 'lf-control-zoomOut',
      title: 'Reduced Flowchart',
      text: 'zoom-out',
      onClick: () => {
        this.lf.zoom(false);
      },
    },
    {
      key: 'zoom-in',
      iconClass: 'lf-control-zoomIn',
      title: 'Enlarge Flowchart',
      text: 'zoom in',
      onClick: () => {
        this.lf.zoom(true);
      },
    },
    {
      key: 'reset',
      iconClass: 'lf-control-fit',
      title: 'Restore the original size of the process',
      text: 'adaptive',
      onClick: () => {
        this.lf.resetZoom();
      },
    },
    {
      key: 'undo',
      iconClass: 'lf-control-undo',
      title: 'Go back to the previous step',
      text: 'back',
      onClick: () => {
        this.lf.undo();
      },
    },
    {
      key: 'redo',
      iconClass: 'lf-control-redo',
      title: 'Move to next step',
      text: 'next',
      onClick: () => {
        this.lf.redo();
      },
    },
  ];</code></pre>
</details>

### example

<a href="https://codesandbox.io/embed/intelligent-matsumoto-t1dc5?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> Go to CodeSandbox for examples</a>

### Add Options

```tsx | pure
lf.extension.control.addItem({
  key: 'mini-map',
  iconClass: 'custom-minimap',
  title: '',
  text: 'nav',
  onMouseEnter: (lf, ev) => {
    const position = lf.getPointByClient(ev.x, ev.y)
    lf.extension.miniMap.show(
      position.domOverlayPosition.x - 120,
      position.domOverlayPosition.y + 35,
    )
  },
  onClick: (lf, ev) => {
    const position = lf.getPointByClient(ev.x, ev.y)
    lf.extension.miniMap.show(
      position.domOverlayPosition.x - 120,
      position.domOverlayPosition.y + 35,
    )
  },
})
```

### Removing Options

For example, to remove the navigation controls added above

```tsx | pure
lf.extension.control.removeItem('mini-map')
```

