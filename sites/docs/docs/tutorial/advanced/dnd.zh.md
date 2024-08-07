---
nav: 指南
group:
  title: 进阶
  order: 2
title: 拖拽创建节点
order: 4
toc: content
---

#### 在流程图编辑场景中比起通过代码配置创建节点，我们可能更需要通过图形用户界面来操作创建流程图，这时候就可以通过拖拽的方式来实现。 <Badge>info</Badge>

拖拽需要结合图形面板来实现，步骤：创建面板 → 拖拽初始化 → 监听 drop 事件创建节点

示例如下：

```tsx | pure
lf.dnd.startDrag({
  type,
  text: `${type}节点`,
})
```

<a href="https://codesandbox.io/embed/logicflow-base18-odj3g?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> 去 CodeSandbox 查看示例</a>

通过上面的代码可以看出，将节点通过`div`标签+`css`样式的方式绘制到面板中，并为其绑定`onMouseDown`
事件，当拖拽图形时，会触发`lf.dnd.startDrag`函数，表示开始拖拽，并传入选中图形的配置，`startDrag`入参格式：

```tsx | pure
lf.dnd.startDrag = (nodeConfig: NodeConfig): void => {}

type NodeConfig = {
  id?: string; // 不建议直接传id, logicflow id不允许重复
  type: string;
  text?: TextConfig;
  properties?: Record<string, unknown>;
};
```

拖拽结束鼠标松开时，将当前鼠标的位置转换为画布上的坐标，并以此为节点的中心点坐标`x`、`y`
，合并拖拽节点传入的`nodeConfig`，监听到 drop 事件后会调用`lf.addNode`方法创建节点。

:::warning{title=注意}
如果是用图片作为配置面板中添加节点的元素，需要将其设置为不可拖动的。详细请参考[#267](https://github.com/didi/LogicFlow/issues/267)<br>
如果遇到拖拽添加节点报错“不存在 id 为 xx 的节点”，需要在 mousedown 时触发`dnd.startDrag`
。详情参考[#185](https://github.com/didi/LogicFlow/issues/185)
:::

**使用拖拽面板插件**

LogicFlow 在 extension 中内置了**拖拽面板插件**
，如果不想自定义图形面板，可以使用此插件快速实现。详情见[拖拽面板](../extension/dnd-panel.zh.md)。
