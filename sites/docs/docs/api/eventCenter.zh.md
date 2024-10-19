---
nav: API
title: 事件
toc: content
order: 1
---

<style>
table td:first-of-type {
  word-break: normal;
}
</style>

LogicFlow
提供了事件系统用于告知开发者当前流程图发生的事件。事件的详细用法见[事件](../tutorial/basic/event.zh.md)。

## 节点事件

| 事件名              | 说明          | 事件对象                                        |
|:-----------------|:------------|:--------------------------------------------|
| element:click    | 元素单击        | data, e, position                           |
| node:click       | 节点单击        | data, e, position                           |
| node:dbclick     | 节点双击        | data, e, position                           |
| node:mousedown   | 鼠标按下节点      | data, e                                     |
| node:mouseup     | 鼠标抬起节点      | data, e                                     |
| node:mousemove   | 鼠标移动节点      | data, e                                     |
| node:mouseenter  | 鼠标进入节点      | data, e                                     |
| node:mouseleave  | 鼠标离开节点      | data, e                                     |
| node:delete      | 节点的删除       | data                                        |
| node:add         | 节点的添加       | data                                        |
| node:dnd-add     | 外部拖入节点添加时触发 | data                                        |
| node:dnd-drag    | 外部拖入节点拖拽中触发 | data, e                                     |
| node:dragstart   | 节点开始拖拽      | data, e                                     |
| node:drag        | 节点拖拽        | data, e                                     |
| node:drop        | 节点拖拽放开      | data, e                                     |
| node:contextmenu | 右键点击节点      | data, e, position                           |
| node:resize      | 调整节点缩放      | preData, data, model, deltaX, deltaY, index |

事件对象包含如下内容：

| 属性       | 类型         | 值                                                                             |
|:---------|:-----------|:------------------------------------------------------------------------------|
| data     | Object     | 节点的[数据属性](./model/nodeModel.zh.md#数据属性)                                       |
| e        | MouseEvent | 原生的鼠标事件对象                                                                     |
| position | Object     | 鼠标触发点在画布中的坐标（参照[getPointByClient](./detail/index.zh.md#getpointbyclient)的返回值） |

## 边事件

| 事件名                    | 说明        | 事件对象              |
|:-----------------------|:----------|:------------------|
| element:click          | 元素单击      | data, e, position |
| edge:click             | 边单击       | data, e, position |
| edge:dbclick           | 边双击       | data, e           |
| edge:mouseenter        | 鼠标进入边     | data, e           |
| edge:mouseleave        | 鼠标离开边     | data, e           |
| edge:add               | 边增加       | data              |
| edge:delete            | 边删除       | data              |
| edge:contextmenu       | 边右键       | data, e, position |
| edge:adjust            | 边拖拽调整     | data              |
| edge:exchange-node     | 调整边的起点/终点 | data              |
| connection:not-allowed | 不允许建立连接   | data, msg         |

事件对象包含如下内容：

| 属性       | 类型         | 值                                                                             |
|:---------|:-----------|:------------------------------------------------------------------------------|
| data     | Object     | 边的[数据属性](./model/edgeModel.zh.md#数据属性)                                        |
| e        | MouseEvent | 原生的鼠标事件对象                                                                     |
| position | Object     | 鼠标触发点在画布中的坐标（参照[getPointByClient](./detail/index.zh.md#getpointbyclient)的返回值） |
| msg      | string     | 边校验信息                                                                         |

## 锚点事件

| 事件名              | 说明                                                         | 事件对象                          |
|:-----------------|:-----------------------------------------------------------|:------------------------------|
| anchor:dragstart | 锚点连线开始拖动                                                   | data, e, nodeModel            |
| anchor:drop      | 锚点连线拖动连线成功,只有在创建连线成功的时候才触发。用于区分手动创建的连线和自动创建的连线(`edge:add`) | data, e, nodeModel, edgeModel |
| anchor:drag      | 锚点连线拖动觖发                                                   | data, e, nodeModel            |
| anchor:dragend   | 锚点连线结束，不管是否创建连线都会触发。                                       | data, e, nodeModel            |

事件对象包含如下内容：

| 属性        | 类型         | 值         |
|:----------|:-----------|:----------|
| data      | Object     | 锚点数据      |
| e         | MouseEvent | 原生的鼠标事件对象 |
| nodeModel | Object     | 锚点所属的节点   |

<!-- adjustPoint -->

## 画布事件

| 事件名               | 说明                                                                                                                                                                      | 事件对象        |
|:------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------|
| blank:mousedown   | 画布鼠标按下                                                                                                                                                                  | e           |
| blank:mousemove   | 画布鼠标移动                                                                                                                                                                  | e           |
| blank:mouseup     | 画布鼠标抬起                                                                                                                                                                  | e           |
| blank:click       | 画布单击                                                                                                                                                                    | e           |
| blank:contextmenu | 画布右键                                                                                                                                                                    | e, position |
| blank:dragstart   | 画布开始拖拽                                                                                                                                                                  | e           |
| blank:drag        | 画布拖拽                                                                                                                                                                    | e           |
| blank:drop        | 画布拖拽放开                                                                                                                                                                  | e           |
| text:update       | 文案更新                                                                                                                                                                    | data        |
| graph:transform   | 画布平移或者缩放触发                                                                                                                                                              | data        |
| graph:rendered    | 画布渲染数据后触发. 即 lf.render(graphData)方法被调用后触发。 `v1.1.0新增`                                                                                                                   | graphData   |
| graph:updated     | 画布重新更新后触发. 即 lf.render(graphData)方法被调用后或者改变画布（graphModel）上的属性后触发。如果是主动修改某个属性导致画布更新，想要在画布更新后做一些操作，建议注册事件后在回调函数中及时注销该事件，或者使用once事件代替on事件，因为其他属性也可能导致画布更新，触发该事件。`v2.0.0新增` | -           |

事件对象包含如下内容：

| 属性       | 类型         | 值                                                                             |
|:---------|:-----------|:------------------------------------------------------------------------------|
| e        | MouseEvent | 原生的鼠标事件对象                                                                     |
| position | Object     | 鼠标触发点在画布中的坐标（参照[getPointByClient](./detail/index.zh.md#getpointbyclient)的返回值） |

## History 事件

History 用来记录画布上的每一次改动，当画布上的元素发生变化时会触发`history:change`事件。

| 事件名            | 说明   | 事件对象 |
|:---------------|:-----|:-----|
| history:change | 画布变化 | data |

事件对象中的 data 属性包含以下内容。

| 属性       | 类型      | 说明            |
|:---------|:--------|:--------------|
| undos    | Array   | 可撤销的 graph 快照 |
| redos    | Array   | 可重做的 graph 快照 |
| undoAble | boolean | 是否可以撤销        |
| redoAble | boolean | 是否可以重做        |

## 选区事件

当同时选中多个节点形成选区时，选区触发的事件

| 事件名                   | 说明      | 事件对象        |
|:----------------------|:--------|:------------|
| selection:selected    | 选区框选后触发 | 所有选中的元素     |
| selection:mousedown   | 选区鼠标按下  | e           |
| selection:dragstart   | 选区开始拖拽  | e           |
| selection:drag        | 选区拖拽    | e           |
| selection:drop        | 选区拖拽放开  | e           |
| selection:mousemove   | 选区鼠标移动  | e, position |
| selection:mouseup     | 选区鼠标松开  | e           |
| selection:contextmenu | 选区右键    | e           |

事件对象包含如下内容：

| 属性       | 类型         | 值                                                                             |
|:---------|:-----------|:------------------------------------------------------------------------------|
| e        | MouseEvent | 原生的鼠标事件对象                                                                     |
| position | Object     | 鼠标触发点在画布中的坐标（参照[getPointByClient](./detail/index.zh.md#getpointbyclient)的返回值） |

## 文本事件

当Text文本位置、内容出现变更时，文本触发的事件

| 事件名            | 说明         | 事件对象                    |
|:---------------|:-----------|:------------------------|
| text:mousedown | 鼠标按下文本     | e, data                 |
| text:dragstart | 开始拖拽文本     | e, data                 |
| text:drag      | 拖拽文本       | e, data                 |
| text:drop      | 放开文本       | e, data                 |
| text:click     | 单击文本       | e                       |
| text:dbclick   | 双击文本       | e                       |
| text:blur      | 文本失焦       | e                       |
| text:mousemove | 鼠标在文本区内部移动 | e, data, deltaX, deltaY |
| text:mouseup   | 鼠标在文本区内放开  | e, data                 |
| text:update    | 更新文本       | data                    |

当Label文本位置、内容出现变更时，文本触发的事件

| 事件名             | 说明         | 事件对象                    |
|:----------------|:-----------|:------------------------|
| label:mousedown | 鼠标按下文本     | e, data                 |
| label:dragstart | 开始拖拽文本     | e, data                 |
| label:drag      | 拖拽文本       | e, data                 |
| label:drop      | 放开文本       | e, data                 |
| label:mousemove | 鼠标在文本区内部移动 | e, data, deltaX, deltaY |
| label:mouseup   | 鼠标在文本区内放开  | e, data                 |

事件对象包含如下内容：

| 属性   | 类型         | 值                   |
|:-----|:-----------|:--------------------|
| e    | MouseEvent | 原生的鼠标事件对象           |
| data | Object     | NodeModel/EdgeModel |

## on

图的监听事件

参数：

| 名称       | 类型     | 必传 | 默认值 | 描述   |
|:---------|:-------|:---|:----|:-----|
| evt      | string | ✅  | -   | 事件名称 |
| callback | string | ✅  | -   | 回调函数 |

示例：

```tsx | pure
const { eventCenter } = lf.graphModel;

eventCenter.on("node:click", (args) => {
  console.log("node:click", args.position);
});
eventCenter.on("element:click", (args) => {
  console.log("element:click", args.e.target);
});
```

## off

删除事件监听

参数：

| 名称       | 类型       | 必传 | 默认值 | 描述   |
|:---------|:---------|:---|:----|:-----|
| evt      | string   | -  | -   | 事件名称 |
| callback | Function | -  | -   | 回调函数 |

- evt 为空时，清除全部监听事件
- evt 存在，callback 为空，清除对应事件注册的所有方法
- evt 存在，callback 存在，进行对象比较，清除匹配的方法

示例：

```tsx | pure
const { eventCenter } = lf.graphModel;
eventCenter.off("node:click", () => {
  console.log("node:click off");
});
eventCenter.off("element:click", () => {
  console.log("element:click off");
});
```

## once

事件监听一次

参数：

| 名称       | 类型     | 必传 | 默认值 | 描述   |
|:---------|:-------|:---|:----|:-----|
| evt      | string | ✅  | -   | 事件名称 |
| callback | string | ✅  | -   | 回调函数 |

示例：

```tsx | pure
const { eventCenter } = lf.graphModel;

eventCenter.once("node:click", () => {
  console.log("node:click");
});
```

## emit

触发事件

参数：

| 名称   | 类型     | 必传 | 默认值 | 描述     |
|:-----|:-------|:---|:----|:-------|
| evt  | string | ✅  | -   | 事件名称   |
| args | Array  | ✅  | -   | 触发事件参数 |

示例：

```tsx | pure
const { eventCenter } = lf.graphModel;
eventCenter.emit("custom:button-click", data);
```
