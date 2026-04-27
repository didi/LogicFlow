---
nav: API
group:
  title: LogicFlow 实例
  order: 2
title: 事件
toc: content
order: 7
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

LogicFlow 提供了事件系统用于告知开发者当前流程图发生的事件。事件的详细用法见[事件](../../tutorial/basic/event.zh.md)。

## 事件方法

### on

监听事件。支持监听单个事件或多个事件。

**参数**

| 名称     | 类型          | 必传 | 默认值 | 描述                                 |
| :------- | :------------ | :--- | :----- | :----------------------------------- |
| evt      | string        | ✅   | -      | 事件名称，支持用逗号分隔监听多个事件 |
| callback | EventCallback | ✅   | -      | 事件回调函数                         |

**示例**

```ts
// 监听单个事件
lf.on('node:click', (data) => {
  console.log('节点被点击:', data);
});

// 监听多个事件
lf.on('node:click,edge:click', (data) => {
  console.log('元素被点击:', data);
});

// 监听节点移动事件
lf.on('node:drag', ({ data }) => {
  console.log('节点拖拽中:', data.id, data.x, data.y);
});

// 监听画布点击事件
lf.on('blank:click', ({ e }) => {
  console.log('画布被点击:', e.x, e.y);
});
```

**注意事项**

- 事件名称支持用逗号分隔同时监听多个事件
- 回调函数的参数格式取决于具体的事件类型
- 重复监听同一事件会叠加，都会被执行

### off

取消事件监听。

**参数**

| 名称     | 类型          | 必传 | 默认值 | 描述                                 |
| :------- | :------------ | :--- | :----- | :----------------------------------- |
| evt      | string        | ✅   | -      | 事件名称，支持用逗号分隔取消多个事件 |
| callback | EventCallback | ✅   | -      | 要取消的事件回调函数                 |

**示例**

```ts
// 定义回调函数
const handleNodeClick = (data) => {
  console.log('节点被点击:', data);
};

// 监听事件
lf.on('node:click', handleNodeClick);

// 取消监听
lf.off('node:click', handleNodeClick);

// 取消多个事件监听
lf.off('node:click,edge:click', handleNodeClick);
```

**注意事项**

- 必须传入监听时使用的同一个回调函数引用
- 如果回调函数引用不匹配，取消操作无效
- 支持同时取消多个事件的监听

### once

监听事件，但只触发一次。触发后自动取消监听。

**参数**

| 名称     | 类型          | 必传 | 默认值 | 描述                                 |
| :------- | :------------ | :--- | :----- | :----------------------------------- |
| evt      | string        | ✅   | -      | 事件名称，支持用逗号分隔监听多个事件 |
| callback | EventCallback | ✅   | -      | 事件回调函数                         |

**示例**

```ts
// 只监听一次节点点击事件
lf.once('node:click', (data) => {
  console.log('首次点击节点:', data);
  // 这个回调只会执行一次
});

// 监听画布首次渲染完成
lf.once('graph:rendered', (data) => {
  console.log('画布渲染完成:', data);
  // 可以在这里执行一些初始化操作
});
```

**注意事项**

- 回调函数执行一次后会自动取消监听
- 适用于只需要响应一次的场景，如初始化操作
- 支持同时监听多个事件，但每个事件都只触发一次

### emit

手动触发事件。

**参数**

| 名称      | 类型      | 必传 | 默认值 | 描述     |
| :-------- | :-------- | :--- | :----- | :------- |
| evt       | string    | ✅   | -      | 事件名称 |
| eventArgs | EventArgs | ✅   | -      | 事件参数 |

**示例**

```ts
// 触发自定义事件
lf.emit('custom:event', {
  type: 'custom:event',
  data: {
    message: 'Hello World',
  },
});

// 监听自定义事件
lf.on('custom:event', (data) => {
  console.log('收到自定义事件:', data);
});

// 触发节点相关事件（谨慎使用）
lf.emit('node:click', {
  type: 'node:click',
  data: lf.getNodeDataById('node_1'),
});
```

**注意事项**

- 主要用于触发自定义事件
- 谨慎触发内置事件，可能会影响 LogicFlow 的正常运行
- 事件参数格式需要符合对应事件的规范
- 触发的事件会被所有对应的监听器接收

## 事件名清单

## 节点事件

| 事件名                                        | 说明                   | 事件对象                                                                                                                          |
| :-------------------------------------------- | :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| element:click                                 | 元素单击               | data, e, position                                                                                                                 |
| node:click                                    | 节点单击               | data, e, position                                                                                                                 |
| node:dbclick                                  | 节点双击               | data, e, position                                                                                                                 |
| node:mousedown                                | 鼠标按下节点           | data, e                                                                                                                           |
| node:mouseup                                  | 鼠标抬起节点           | data, e                                                                                                                           |
| node:mousemove                                | 鼠标移动节点           | data, e                                                                                                                           |
| node:mouseenter                               | 鼠标进入节点           | data, e                                                                                                                           |
| node:mouseleave                               | 鼠标离开节点           | data, e                                                                                                                           |
| node:delete                                   | 节点的删除             | data                                                                                                                              |
| node:add                                      | 节点的添加             | data                                                                                                                              |
| node:dnd-add                                  | 外部拖入节点添加时触发 | data                                                                                                                              |
| node:dnd-drag                                 | 外部拖入节点拖拽中触发 | data, e                                                                                                                           |
| node:dragstart                                | 节点开始拖拽           | data, e                                                                                                                           |
| node:drag                                     | 节点拖拽               | data, e                                                                                                                           |
| node:drop                                     | 节点拖拽放开           | data, e                                                                                                                           |
| node:contextmenu                              | 右键点击节点           | data, e, position                                                                                                                 |
| node:resize<Badge>2.0 新增</Badge>            | 调整节点缩放           | preData, data, model, deltaX, deltaY, index                                                                                       |
| node:properties-change<Badge>2.0 新增</Badge> | 节点自定义属性变化     | id: 当前节点的id<br/>keys: 当前变更字段的key的集合<br/>preProperties: 改动前的properties<br/>properties: 改动后的properties |

事件对象包含如下内容：

| 属性     | 类型       | 值                                                                                                             |
| :------- | :--------- | :------------------------------------------------------------------------------------------------------------- |
| data     | Object     | 节点的[数据属性](../runtime-model/nodeModel.zh.md#数据属性)                                                                 |
| e        | MouseEvent | 原生的鼠标事件对象                                                                                             |
| position | Object     | 鼠标触发点在画布中的坐标（参照[getPointByClient](./canvas.zh.md#getpointbyclient)的返回值） |

## 边事件

| 事件名                 | 说明              | 事件对象          |
| :--------------------- | :---------------- | :---------------- |
| element:click          | 元素单击          | data, e, position |
| edge:click             | 边单击            | data, e, position |
| edge:dbclick           | 边双击            | data, e           |
| edge:mouseenter        | 鼠标进入边        | data, e           |
| edge:mouseleave        | 鼠标离开边        | data, e           |
| edge:add               | 边增加            | data              |
| edge:delete            | 边删除            | data              |
| edge:contextmenu       | 边右键            | data, e, position |
| edge:adjust            | 边拖拽调整        | data              |
| edge:exchange-node     | 调整边的起点/终点 | data              |
| connection:not-allowed | 不允许建立连接    | data, msg         |

事件对象包含如下内容：

| 属性     | 类型       | 值                                                                                                             |
| :------- | :--------- | :------------------------------------------------------------------------------------------------------------- |
| data     | Object     | 边的[数据属性](../runtime-model/edgeModel.zh.md#数据属性)                                                                   |
| e        | MouseEvent | 原生的鼠标事件对象                                                                                             |
| position | Object     | 鼠标触发点在画布中的坐标（参照[getPointByClient](./canvas.zh.md#getpointbyclient)的返回值） |
| msg      | string     | 边校验信息                                                                                                     |

## 锚点事件

| 事件名           | 说明                                                                                                    | 事件对象                      |
| :--------------- | :------------------------------------------------------------------------------------------------------ | :---------------------------- |
| anchor:dragstart | 锚点连线开始拖动                                                                                        | data, e, nodeModel            |
| anchor:drop      | 锚点连线拖动连线成功,只有在创建连线成功的时候才触发。用于区分手动创建的连线和自动创建的连线(`edge:add`) | data, e, nodeModel, edgeModel |
| anchor:drag      | 锚点连线拖动触发                                                                                        | data, e, nodeModel            |
| anchor:dragend   | 锚点连线结束，不管是否创建连线都会触发。                                                                | data, e, nodeModel            |

事件对象包含如下内容：

| 属性      | 类型       | 值                 |
| :-------- | :--------- | :----------------- |
| data      | Object     | 锚点数据           |
| e         | MouseEvent | 原生的鼠标事件对象 |
| nodeModel | Object     | 锚点所属的节点     |

## 画布事件

| 事件名            | 说明                                                                                                                                                                                                                                                                                            | 事件对象    |
| :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------- |
| blank:mousedown   | 画布鼠标按下                                                                                                                                                                                                                                                                                    | e           |
| blank:mousemove   | 画布鼠标移动                                                                                                                                                                                                                                                                                    | e           |
| blank:mouseup     | 画布鼠标抬起                                                                                                                                                                                                                                                                                    | e           |
| blank:click       | 画布单击                                                                                                                                                                                                                                                                                        | e           |
| blank:contextmenu | 画布右键                                                                                                                                                                                                                                                                                        | e, position |
| blank:dragstart   | 画布开始拖拽                                                                                                                                                                                                                                                                                    | e           |
| blank:drag        | 画布拖拽                                                                                                                                                                                                                                                                                        | e           |
| blank:drop        | 画布拖拽放开                                                                                                                                                                                                                                                                                    | e           |
| text:update       | 文案更新                                                                                                                                                                                                                                                                                        | data        |
| graph:transform   | 画布平移或者缩放触发                                                                                                                                                                                                                                                                            | data        |
| graph:rendered    | 画布渲染数据后触发. 即 lf.render(graphData)方法被调用后触发。 `v1.1.0新增`                                                                                                                                                                                                                    | graphData   |
| graph:updated     | 画布重新更新后触发. 即 lf.render(graphData)方法被调用后或者改变画布（graphModel）上的属性后触发。如果是主动修改某个属性导致画布更新，想要在画布更新后做一些操作，建议注册事件后在回调函数中及时注销该事件，或者使用once事件代替on事件，因为其他属性也可能导致画布更新，触发该事件。`v2.0.0新增` | -           |

事件对象包含如下内容：

| 属性     | 类型       | 值                                                                                                             |
| :------- | :--------- | :------------------------------------------------------------------------------------------------------------- |
| e        | MouseEvent | 原生的鼠标事件对象                                                                                             |
| position | Object     | 鼠标触发点在画布中的坐标（参照[getPointByClient](./canvas.zh.md#getpointbyclient)的返回值） |

## History 事件

History 用来记录画布上的每一次改动，当画布上的元素发生变化时会触发 `history:change` 事件。

| 事件名         | 说明     | 事件对象 |
| :------------- | :------- | :------- |
| history:change | 画布变化 | data     |

事件对象中的 data 属性包含以下内容。

| 属性     | 类型    | 说明                |
| :------- | :------ | :------------------ |
| undos    | Array   | 可撤销的 graph 快照 |
| redos    | Array   | 可重做的 graph 快照 |
| undoAble | boolean | 是否可以撤销        |
| redoAble | boolean | 是否可以重做        |

## 选区事件

当同时选中多个节点形成选区时，选区触发的事件

| 事件名                | 说明           | 事件对象       |
| :-------------------- | :------------- | :------------- |
| selection:selected    | 选区框选后触发 | 所有选中的元素 |
| selection:mousedown   | 选区鼠标按下   | e              |
| selection:dragstart   | 选区开始拖拽   | e              |
| selection:drag        | 选区拖拽       | e              |
| selection:drop        | 选区拖拽放开   | e              |
| selection:mousemove   | 选区鼠标移动   | e, position    |
| selection:mouseup     | 选区鼠标松开   | e              |
| selection:contextmenu | 选区右键       | e              |

事件对象包含如下内容：

| 属性     | 类型       | 值                                                                                                             |
| :------- | :--------- | :------------------------------------------------------------------------------------------------------------- |
| e        | MouseEvent | 原生的鼠标事件对象                                                                                             |
| position | Object     | 鼠标触发点在画布中的坐标（参照[getPointByClient](./canvas.zh.md#getpointbyclient)的返回值） |

## 文本事件

当 Text 文本位置、内容出现变更时，文本触发的事件

| 事件名         | 说明                 | 事件对象                |
| :------------- | :------------------- | :---------------------- |
| text:mousedown | 鼠标按下文本         | e, data                 |
| text:dragstart | 开始拖拽文本         | e, data                 |
| text:drag      | 拖拽文本             | e, data                 |
| text:drop      | 放开文本             | e, data                 |
| text:click     | 单击文本             | e                       |
| text:dbclick   | 双击文本             | e                       |
| text:blur      | 文本失焦             | e                       |
| text:mousemove | 鼠标在文本区内部移动 | e, data, deltaX, deltaY |
| text:mouseup   | 鼠标在文本区内放开   | e, data                 |
| text:update    | 更新文本             | data                    |

事件对象包含如下内容：

| 属性 | 类型       | 值                  |
| :--- | :--------- | :------------------ |
| e    | MouseEvent | 原生的鼠标事件对象  |
| data | Object     | NodeModel/EdgeModel |

## 插件事件

下面是不同插件中触发的事件

### DndPanel

| 事件名                | 说明             | 事件对象 |
| :-------------------- | :--------------- | :------- |
| dnd:panel-dbclick     | 拖拽面板双击     | e, data  |
| dnd:panel-click       | 拖拽面板左键单击 | e, data  |
| dnd:panel-contextmenu | 拖拽面板右键单击 | e, data  |

事件对象包含如下内容：

| 属性 | 类型       | 值                  |
| :--- | :--------- | :------------------ |
| e    | MouseEvent | 原生的鼠标事件对象  |
| data | Object     | NodeModel/EdgeModel |

### MiniMap

| 事件名        | 说明             | 事件对象 |
| :------------ | :--------------- | :------- |
| miniMap:close | 小地图隐藏时触发 | -        |

### SelectionSelect

| 事件名                  | 说明                                   | 事件对象                                                             |
| :---------------------- | :------------------------------------- | :------------------------------------------------------------------- |
| selection:selected-area | 选框范围                               | topLeft: 左上角坐标, bottomRight: 右下角坐标                         |
| selection:drop          | 鼠标放开后如果存在框选选中的元素时触发 | e                                                                    |
| selection:selected      | 框选完成时触发                         | elements: 框选元素集合, topLeft: 左上角坐标, bottomRight: 右下角坐标 |

### DynamicGroup/Group

| 事件名                                        | 说明                             | 事件对象                                      |
| :-------------------------------------------- | :------------------------------- | :-------------------------------------------- |
| group:add-node                                | 节点加入到分组中触发             | data: 分组数据, childId: 新加入节点的id       |
| group:remove-node                             | 节点从分组中移除触发             | data: 分组数据, childId: 移除节点的id         |
| group:not-allowed                             | 命中节点不允许加入到分组中时触发 | group: 分组数据, node: 被禁止加入的节点的信息 |
| dynamicGroup:collapse<Badge>2.1.0新增</Badge> | 分组节点折叠事件                 | collapse: 折叠状态，nodeModel: 节点实体       |

### Highlight

| 事件名               | 说明                             | 事件对象             |
| :------------------- | :------------------------------- | :------------------- |
| highlight:single     | 单元素高亮模式下，元素触发高亮   | data                 |
| highlight:neighbours | 相邻元素高亮模式下，元素触发高亮 | data, relateElements |
| highlight:path       | 路径元素高亮模式下，元素触发高亮 | data, relateElements |

事件对象包含如下内容：

| 属性           | 类型   | 值                            |
| :------------- | :----- | :---------------------------- |
| data           | Object | NodeModel/EdgeModel           |
| relateElements | Array  | NodeModel/EdgeModel组成的数组 |

### Label

| 事件名          | 说明                 | 事件对象                |
| :-------------- | :------------------- | :---------------------- |
| label:mousedown | 鼠标按下文本         | e, data                 |
| label:dragstart | 开始拖拽文本         | e, data                 |
| label:drag      | 拖拽文本             | e, data                 |
| label:drop      | 放开文本             | e, data                 |
| label:mousemove | 鼠标在文本区内部移动 | e, data, deltaX, deltaY |
| label:mouseup   | 鼠标在文本区内放开   | e, data                 |

事件对象包含如下内容：

| 属性 | 类型       | 值                  |
| :--- | :--------- | :------------------ |
| e    | MouseEvent | 原生的鼠标事件对象  |
| data | Object     | NodeModel/EdgeModel |
