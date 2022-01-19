# 自定义插件

LogicFlow提供了很多的插件，但是这些插件都是一些具有普适性的插件，不一定都符合业务需求。下面将以一个具体示例，向大家介绍如何定义符合自己业务的插件。

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

- LogicFlow对插件的要求是一个类。
- 这个类有个静态属性`pluginName`用于标识插件的名称。同名的插件在初始化`lf`实例的时候会覆盖。
- 在初始化`lf`实例的时候，会同时初始化插件，此时会传入参数`lf`和`LogicFlow`。可以在`constructor`中对lf进行扩展
- 在`lf`渲染完成后，会调用插件实例的`render`方法(如有)。可以在这个方法中
  
