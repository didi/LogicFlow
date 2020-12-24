# 事件 Event

通过鼠标或者各种可交互的组件与应用产生交互时触发的事件，如节点的点击事件 `node:click`。
另外所有的事件都通过 lf 来监听，比如：
```js
lf.on('node:click', ({ data, e }) => {})
```

## 节点事件

| 事件名   | 说明   | 事件对象 |
| :----- | :----- | :-----  |   
| 'element:click' | 元素单击 | data, e |
| 'node:click' | 节点单击 |  data, e |
| 'node:dblclick' | 节点双击 | data, e |
| 'node:mousedown' | 鼠标按下节点 | data, e |
| 'node:mouseup' | 鼠标抬起节点 | data, e |
| 'node:mousemove' | 鼠标移动节点 | data, e |
| 'node:delete' | 节点的删除 | data |
| 'node:add' | 节点的添加 | data |
| 'node:contextmenu' | 右键点击节点 | data, e |

## 边事件

| 事件名   | 说明   | 事件对象 |
| :----- | :----- | :-----  |   
| 'element:click' | 元素单击 | data, e |
| 'edge:click' | 边单击 | data, e |
| 'edge:dbclick' | 边双击 | data, e |
| 'edge:add' | 边增加 | data |
| 'edge:delete'| 边删除 |data |
| 'edge:contextmenu'| 边右键 | data, e |
| 'connection:not-allowed' | 不允许建立连接 | data, msg |


## 画布的事件
目前支持以下画布事件，可通过 `lf.on('blank:click', ({ e }) => {})` 捕获。

| 事件名   | 说明   |事件对象 |
| :----- | :----- |:-----  |  
| 'blank:mousedown' | 画布鼠标按下 | e |
| 'blank:mousemove' | 画布鼠标移动 | e |
| 'blank:mouseup' | 画布鼠标抬起 | e |
| 'blank:click' | 画布单击 | e |
| 'blank:contextmenu'| 画布右键 | e |


## 事件对象
| 属性   | 说明   |
| :----- | :----- |
| data   | 触发事件的实例数据, 节点事件和边事件存在实例数据，画布事件暂无数据抛出 |
| e  | 监听到的事件对象; 类原生事件存在此属性，例如：xxx:click; 其他事件不存在此属性，例如：xxx:add; |
| msg  | 连线校验信息 |


```js
lf.on('node:click', (
  {
  data,
  e,
  msg,
}
) => { })

```

## 示例

<example :height="280" ></example>