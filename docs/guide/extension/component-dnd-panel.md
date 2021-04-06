# 拖拽面板

## 启用

```ts
import LogicFlow from '@logicflow/core';
import { DndPanel } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css'

LogicFlow.use(DndPanel);
```

注册`DndPanel`组件后，Logic Flow 会在画布左上方创建一个拖拽面板，如下所示

<example href="/examples/#/extension/components/dnd-panel"></example>

## 使用部分节点

`DndPanel`组件在 Logic Flow 内置节点的基础上新增了三种类型，分别是`star`（五角星）、`triangle`（三角形）和`hexagon`（六边形），如果只想使用其中的某几个图形，可以通过`setShapeList`方法来实现。

```ts
// 注册插件
LogicFlow.use(DndPanel);

// 示例化 LogicFlow
const lf = new LogicFlow();

// 只保留 rect 和 circle
lf.setShapeList([
  {
    type: 'rect',
    text: '矩形'
  },
  {
    type: 'circle',
    text: '圆形'
  }
]);

lf.render();
```

在上面的代码中，我们通过`setShapeList`方法为 Dnd 组件重新配置了节点列表，目前 Dnd 面板支持的节点如下。

| 名称 | 类型 |
| :- | :- |
| rect | 矩形 |
| circle | 圆形 |
| polygon | 菱形 |
| star | 五角星 |
| triangle | 三角形 |
| hexagon | 六边形 |
