# 拖拽创建节点 Dnd

> 在流程图编辑场景中比起通过代码配置注册节点以外，我们可能更需要通过图形用户界面来操作创建流程图，这时候就可以通过拖拽的方式来实现。

拖拽需要结合图形面板来实现，步骤：创建面板 → 拖拽初始化 → 监听drop事件创建节点

示例如下：

```js
lf.dnd.startDrag({
  type,
  text: `${type}节点`
});
```

<iframe src="https://codesandbox.io/embed/logicflow-base18-odj3g?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="logicflow-base18"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

通过上面的代码可以看出，将节点通过`div`标签+`css`样式的方式绘制到面板中，并为其绑定`onMouseDown`事件，当拖拽图形时，会触发`lf.dnd.startDrag`函数，表示开始拖拽，并传入选中图形的配置，`startDrag`入参格式：

```js
lf.dnd.startDrag(nodeConfig: NodeConfig):void

type NodeConfig = {
  id?: string; // 不建议直接传id, logicflow id不允许重复
  type: string;
  text?: TextConfig;
  properties?: Record<string, unknown>;
};
```

拖拽结束鼠标松开时，将当前鼠标的位置转换为画布上的坐标，并以此为节点的中心点坐标`x`、`y`，合并拖拽节点传入的`nodeConfig`，监听到drop事件后会调用`lf.addNode`方法创建节点。

::: warning 注意

如果是用图片作为配置面板中添加节点的元素，需要将其设置为不可拖动的。详细请参考[#267](https://github.com/didi/LogicFlow/issues/267)

:::

**使用拖拽面板插件**

LogicFlow在extension中内置了**拖拽面板插件**，如果不想自定义图形面板，可以使用此插件快速实现。详情见[拖拽面板](../extension/component-dnd-panel.md)。