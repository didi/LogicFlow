---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 自定义插件 (Custom Plugin)
order: 17
toc: content
---

LogicFlow 提供了很多的插件，但是这些插件都是一些具有普适性的插件，不一定都符合业务需求。这时候可以基于自己的业务场景进行自定义插件。

## 插件的基础格式

```tsx | pure
class PluginCls {
  static pluginName = 'pluginName'

  constructor({ lf, LogicFlow }) {
    // do anything
  }

  render(lf, toolOverlay) {
    // do anything
  }

  destroy() {
    // do anything
  }
}
```

- 插件是一个类。
- 这个类有个静态属性`pluginName`用于标识插件的名称。同名的插件在初始化`lf`
  实例的时候会覆盖。同时使用方可以通过`lf.extension.插件名称`获取插件这个类的实例。
- 在初始化`lf`实例的时候，会同时初始化插件实例，此时会传入参数`lf`和`LogicFlow`。
- 在`lf`渲染完成后，会调用插件实例的`render`方法(如有)。第二个参数 toolOverlay 是表示`LogicFlow` Dom
  层的节点。插件开发者可以直接在这个节点插入 html 内容。
- `destroy`是销毁插件是调用的方法。大多数情况下可以不写。

## 实现 context-pad 插件

下面实现一个`context-pad`示例，向大家介绍如何定义符合自己业务的插件。`context-pad`
插件是一个点击节点后，在节点旁边出现可选的快捷操作，可以看做是左键点击出现的菜单。

### 增加插入选项方法

LogicFlow 会将插件的实例以插件名称的形式挂载到`lf.extension`上，这样我们在`class`
中的方法就可以用`lf.extension.插件名称.插件方法`调用了。

```tsx | pure
class ContextPad {
  /**
   * 设置通用的菜单选项
   */
  setContextMenuItems(items) {
    this.commonMenuItems = items;
  }
}

ContextPad.pluginName = "contextPad";

// 调用方法

lf.extension.contextPad.setContextMenuItems([
  {
    icon: "...",
    callback: () => {},
  },
]);
```

### 监听节点被点击

在插件被初始化时，会将`lf`以参数的形式传递给插件，这时可以利用`lf`监听画布上发生的事件。

```tsx | pure
class ContextPad {
  constructor({ lf }) {
    lf.on("node:click", (data) => {
      this.showContextPad(data);
    });
  }

  showContextPad() {
    // ...
  }
}
```

### 在画布指定位置显示 HTML 内容

插件的 render 函数有两个参数，一个是`lf`, 第二个参数是`toolOverlay`, 也就是组件层。LogicFlow
的画布是由多个图层组成，而组件层则是专门用来渲染自定义的组件。

**LogicFlow 的图分层**

<img src="../../../public/overlay.png" alt="图层说明" style="width: 300px">

所以这里我们只需要将菜单插入到`toolOverlay`, 然后将其菜单移动到对应的位置即可。

```tsx | pure
class ContextPad {
  render(lf, toolOverlay) {
    this.toolOverlay = toolOverlay
  }

  createMenu() {
    this.__menuDOM = document.createElement('div')
  }

  // 计算出菜单应该显示的位置（节点的右上角）
  getContextMenuPosition() {
    const data = this._activeData
    const Model = this.lf.graphModel.getElement(data.id)
    let x
    let y
    if (Model.BaseType === 'node') {
      x = data.x + Model.width / 2
      y = data.y - Model.height / 2
    }
    return this.lf.graphModel.transformModel.CanvasPointToHtmlPoint([x, y])
  }

  showMenu() {
    const [x, y] = this.getContextMenuPosition()
    this.__menuDOM.style.display = 'flex'
    // 将菜单显示到对应的位置
    this.__menuDOM.style.top = `${y}px`
    this.__menuDOM.style.left = `${x + 10}px`
    this.toolOverlay.appendChild(this.__menuDOM)
  }
}
```

## 完整示例

<a href="https://codesandbox.io/embed/logicflow-base22-rl301?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> 去 CodeSandbox 查看示例</a>
