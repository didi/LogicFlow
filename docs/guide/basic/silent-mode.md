# 设置图编辑方式

LogicFlow提供了非常多的控制图如何编辑的配置，详情见[editConfigModel](/api/editConfigModelApi.html)。

## 初始化

LogicFlow支持在初始化的时候传入很多配置参数，图编辑的配置也可以在初始化的时候传入。

```js
const lf = new LogicFlow({
  stopZoomGraph: true, // 禁止缩放
  stopScrollGraph: true, // 禁止鼠标滚动移动画布
})
```

## 更新图编辑方式

```js
lf.updateEditConfig({
  stopZoomGraph: false,
  stopScrollGraph: false,
});
```







## 静默模式

画布的静默模式可以简单理解为”只读“模式，这种模式下，画布中的节点和边不可移动，不可进行文案修改，没有锚点。

::: tip 提示
静默模式只是LogicFlow内置的流程图编辑控制的一种快捷方式。
:::


```ts
// 开启静默模式
const lf = new LogicFlow({
  isSilentMode: true,
})
```

<iframe src="https://codesandbox.io/embed/pedantic-microservice-db76o?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="pedantic-microservice-db76o"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>
