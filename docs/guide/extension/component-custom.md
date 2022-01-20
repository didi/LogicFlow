# 自定义插件

LogicFlow提供了很多的插件，但是这些插件都是一些具有普适性的插件，不一定都符合业务需求。LogicFlow支持开发者基于自己的业务场景开发
## 插件的基础格式

```js
class PluginCls {
  static pluginName = 'pluginName',
  constructor({ lf, LogicFlow }) {
    // do anything
  }
  render(lf, domOverlay) {
    // do anything
  }
  destroy() {
    // do anythine
  }
}
```

- 插件是一个类。
- 这个类有个静态属性`pluginName`用于标识插件的名称。同名的插件在初始化`lf`实例的时候会覆盖。同时使用方可以通过`lf.extension.插件名称`获取插件这个类的实例。
- 在初始化`lf`实例的时候，会同时初始化插件实例，此时会传入参数`lf`和`LogicFlow`。
- 在`lf`渲染完成后，会调用插件实例的`render`方法(如有)。第二个参数domOverlay是表示`LogicFlow` Dom层的节点。插件开发者可以直接在这个节点插入html内容。
- `destroy`是销毁插件是调用的方法。大多数情况下可以不写。

## 实现context-pad插件

下面实现一个`context-pad`示例，向大家介绍如何定义符合自己业务的插件。`context-pad`插件是一个点击节点后，在节点旁边出现可选的快捷操作，可以看做是左键点击出现的菜单。

### 增加插入选项方法

监听节点、连线被点击，基于当前被点击的元素





  
