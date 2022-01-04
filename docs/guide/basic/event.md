# 事件 Event

当我们使用鼠标或其它方式与画布交互时，会触发的对应的事件。通过监听这些事件，可以获取其在触发时所产生的数据，根据这些数据来实现需要的功能。详细可监听事件见[事件 API](/api/eventCenterApi.html)

## 监听事件

`lf`实例上提供`on`方法支持监听事件。

```js
lf.on('node:dnd-add', (data) => {})
```

LogicFlow支持用逗号分割事件名。

```js
lf.on('node:click,edge:click', (data) => {})
```


## 自定义事件

除了造lf上支持监听事件外，还可以使用[eventCenter](/api/eventCenterApi.htm)对象上监听和触发事件。`eventCenter`是一个`graphModel`上的一个属性。所以在自定义节点的时候，我们可以使用`eventCenter`触发自定义事件。

```js
class ButtonNode extends HtmlNode {
  setHtml(rootEl) {
    const { properties } = this.props.model;

    const el = document.createElement("div");
    el.className = "uml-wrapper";
    const html = `
      <div>
        <div class="uml-head">Head</div>
        <div class="uml-body">
          <div><button onclick="setData()">+</button> ${properties.name}</div>
          <div>${properties.body}</div>
        </div>
        <div class="uml-footer">
          <div>setHead(Head $head)</div>
          <div>setBody(Body $body)</div>
        </div>
      </div>
    `;
    el.innerHTML = html;
    rootEl.innerHTML = "";
    rootEl.appendChild(el);
    window.setData = () => {
      const { graphModel, model } = this.props;
      graphModel.eventCenter.emit("custom:button-click", model);
    };
  }
}
```



## 示例

<iframe src="https://codesandbox.io/embed/logicflow-step7-dpmgb?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="logicflow-step7"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>