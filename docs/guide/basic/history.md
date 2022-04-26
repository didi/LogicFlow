# 历史记录 History


## 开启历史记录功能
在创建画布的时候通过配置 `history` 来开启历史记录功能，此功能默认开启。

```js
const lf = new LogicFlow({
  history: true,
  isPropertiesChangeHistory: true
})

```

`isPropertiesChangeHistory`用于控制`properties`发生变化后，是否需要在历史记录中添加一条快照，默认为`true`。

## 添加一条历史记录。

一般情况下，我们会把引起流程图上发生“可见”变化时，支持上一步恢复到变化之前。而我们的“可见”变化是可以通过自定义节点样式是通过properties的改变来实现的。所以我们大多数情况下
`isPropertiesChangeHistory`为true就可以。但是还是存在一些特殊场景。例如，我们有一个节点，有`isManager`和`managerId`两个属性。其中isManager属性被设置为`true`是节点样式会发生变化。但是`managerId`被设置了任何属性，节点样式都不会有任何变化。这个时候，如果我们要求`managerId`被设置了不会让历史记录多一条记录，则需要将`isPropertiesChangeHistory`设置为`false`。然后自己手动给history添加记录。

LogicFlow在history中监听了`history:insert`事件，如果开发者手动触发这个事件，LogicFlow就会自动将当前画布的图数据添加到历史记录中。
```js


const lf = new LogicFlow({
  history: true,
  isPropertiesChangeHistory: false
})

function PropertyChange (key, value) {
  lf.setProperties(currentNodeId, {
    [key]: value
  })
  // isManager发生变化，则添加一条历史记录，这样点击上一步流程图就会恢复到变化之前的样式。
  if (key === 'isManager') {
    lf.emit('history:insert')
  }
}

```

## 控制历史记录

`LogicFlow`的`core`包中默认不包括控制流程图`上一步`和`下一步`的按钮，只提供了对应的API。开发者可以利用这些API来自定义控制流程图历史记录的按钮, 也可以直接使用[Control插件](../extension/component-control.md)。

```js
lf.undo() // 历史记录操作,返回上一步
lf.redo() // 历史记录操作,恢复下一步
// 监听历史记录发生变化
lf.on('history:change', ({ data: { undoAble, redoAble } }) => {
});
```

