# 事件 Event

当我们使用鼠标或其它方式与画布交互时，会触发的对应的事件。通过监听这些事件，可以获取其在触发时所产生的数据，根据这些数据来实现需要的功能。

所有的事件都可以通过`lf.on()`进行监听。

```js
lf.on('element:type', (eventObject) => {});
```

## 节点事件

| 事件名             | 说明                   | 事件对象          |
| :----------------- | :--------------------- | :---------------- |
| 'element:click'    | 元素单击               | data, e, position |
| 'node:click'       | 节点单击               | data, e, position |
| 'node:dbclick'     | 节点双击               | data, e, position |
| 'node:mousedown'   | 鼠标按下节点           | data, e           |
| 'node:mouseup'     | 鼠标抬起节点           | data, e           |
| 'node:mousemove'   | 鼠标移动节点           | data, e           |
| 'node:mouseenter'  | 鼠标进入节点           | data, e           |
| 'node:mouseleave'  | 鼠标离开节点           | data, e           |
| 'node:delete'      | 节点的删除             | data              |
| 'node:add'         | 节点的添加             | data              |
| 'node:dnd-add'     | 外部拖入节点添加时触发 | data              |
| 'node:dnd-drag'    | 外部拖入节点拖拽中触发 | data              |
| 'node:dragstart'   | 节点开始拖拽           | data, e           |
| 'node:drag'        | 节点拖拽               | data, e           |
| 'node:drop'        | 节点拖拽放开           | data, e           |
| 'node:contextmenu' | 右键点击节点           | data, e, position |

事件对象包含如下内容。

| 属性     | 类型       | 值                                                                                                  |
| :------- | :--------- | :-------------------------------------------------------------------------------------------------- |
| data     | Object     | 节点的[数据属性](/api/nodeApi.md#数据属性)                                                          |
| e        | MouseEvent | 原生的鼠标事件对象                                                                                  |
| position | Object     | 鼠标触发点在画布中的坐标（参照[getPointByClient](/api/logicFlowApi.html#getpointbyclient)的返回值） |

## 边事件

| 事件名                   | 说明              | 事件对象          |
| :----------------------- | :---------------- | :---------------- |
| 'element:click'          | 元素单击          | data, e, position |
| 'edge:click'             | 边单击            | data, e, position |
| 'edge:dbclick'           | 边双击            | data, e           |
| 'edge:mouseenter'        | 鼠标进入边        | data, e           |
| 'edge:mouseleave'        | 鼠标离开边        | data, e           |
| 'edge:add'               | 边增加            | data              |
| 'edge:delete'            | 边删除            | data              |
| 'edge:contextmenu'       | 边右键            | data, e, position |
| 'edge:adjust'            | 调整边的起点/终点 | data              |
| 'connection:not-allowed' | 不允许建立连接    | data, msg         |

事件对象包含如下内容。

| 属性     | 类型       | 值                                                                                                  |
| :------- | :--------- | :-------------------------------------------------------------------------------------------------- |
| data     | Object     | 连线的[数据属性](/api/edgeApi.md#数据属性)                                                          |
| e        | MouseEvent | 原生的鼠标事件对象                                                                                  |
| position | Object     | 鼠标触发点在画布中的坐标（参照[getPointByClient](/api/logicFlowApi.html#getpointbyclient)的返回值） |
| msg      | String     | 连线校验信息                                                                                        |

## 画布事件

| 事件名              | 说明         | 事件对象    |
| :------------------ | :----------- | :---------- |
| 'blank:mousedown'   | 画布鼠标按下 | e           |
| 'blank:mousemove'   | 画布鼠标移动 | e           |
| 'blank:mouseup'     | 画布鼠标抬起 | e           |
| 'blank:click'       | 画布单击     | e           |
| 'blank:contextmenu' | 画布右键     | e, position |
| 'blank:dragstart'   | 画布开始拖拽 | e           |
| 'blank:drag'        | 画布拖拽     | e           |
| 'blank:drop'        | 画布拖拽放开 | e           |
| 'text:update'       | 文案更新     | data        |

事件对象包含如下内容。

| 属性     | 类型       | 值                                                                                                  |
| :------- | :--------- | :-------------------------------------------------------------------------------------------------- |
| e        | MouseEvent | 原生的鼠标事件对象                                                                                  |
| position | Object     | 鼠标触发点在画布中的坐标（参照[getPointByClient](/api/logicFlowApi.html#getpointbyclient)的返回值） |

## History 事件

History 用来记录画布上的每一次改动，当画布上的元素发生变化时会触发`history:change`事件。

| 事件名           | 说明     | 事件对象 |
| :--------------- | :------- | :------- |
| 'history:change' | 画布变化 | data     |

事件对象中的 data 属性包含以下内容。

| 属性     | 类型    | 说明                |
| :------- | :------ | :------------------ |
| undos    | Array   | 可撤销的 graph 快照 |
| redos    | Array   | 可重做的 graph 快照 |
| undoAble | Boolean | 是否可以撤销        |
| redoAble | Boolean | 是否可以重做        |

## 示例

<example :height="280" ></example>
