---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 控制面板 (Control)
order: 3
toc: contents
---

### 启用

```tsx | purex | pure
import LogicFlow from "@logicflow/core";
import { Control } from "@logicflow/extension";
import "@logicflow/extension/lib/style/index.css";

LogicFlow.use(Control);
```

注册`Control`组件后，Logic Flow 会在画布右上方创建一个控制面板，如下所示

控制面板提供了常见的能力，放大缩小或者自适应画布的能力，同时也内置了 redo 和 undo 的功能，当然如果你不喜欢这样的
UI 或功能，也可以基于`LogicFlow`提供的 [API](../../api) 自己定义。


<details>
  <summary>控制面板内置以下控制项</summary>
  <pre><code style="background-color: #282c34; color: #7ec798">
private controlItems: ControlItem[] = [
    {
      key: 'zoom-out',
      iconClass: 'lf-control-zoomOut',
      title: '缩小流程图',
      text: '缩小',
      onClick: () => {
        this.lf.zoom(false);
      },
    },
    {
      key: 'zoom-in',
      iconClass: 'lf-control-zoomIn',
      title: '放大流程图',
      text: '放大',
      onClick: () => {
        this.lf.zoom(true);
      },
    },
    {
      key: 'reset',
      iconClass: 'lf-control-fit',
      title: '恢复流程原有尺寸',
      text: '适应',
      onClick: () => {
        this.lf.resetZoom();
      },
    },
    {
      key: 'undo',
      iconClass: 'lf-control-undo',
      title: '回到上一步',
      text: '上一步',
      onClick: () => {
        this.lf.undo();
      },
    },
    {
      key: 'redo',
      iconClass: 'lf-control-redo',
      title: '移到下一步',
      text: '下一步',
      onClick: () => {
        this.lf.redo();
      },
    },
  ];</code></pre>
</details>

### 示例

<a href="https://codesandbox.io/embed/intelligent-matsumoto-t1dc5?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> 去 CodeSandbox 查看示例</a>

### 添加选项

```tsx | pure
lf.extension.control.addItem({
  key: 'mini-map',
  iconClass: 'custom-minimap',
  title: '',
  text: '导航',
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

### 删除选项

例如, 移除上面添加的导航控制项

```tsx | pure
/**
 * @params key 需要删除的选项的key
 */
lf.extension.control.removeItem('mini-map')
```

