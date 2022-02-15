# MiniMap

### 启用

```ts
import LogicFlow from '@logicflow/core';
import { MiniMap } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css'

LogicFlow.use(MiniMap);
```

### 显示

引入 mini-map 后默认不展示，需要手动开启显示。

```ts
// 1.1.0 以上
lf.extension.miniMap.show(leftPosition?: number, topPosition?: number)

// 1.1.0 以下
MiniMap.show(leftPosition?: number, topPosition?: number);
```

`show()` 支持传入样式属性 left 和 top 的值，用来确定 mini-map 在画布中的位置。

只提供 left 和 top 这两个值是因为可以与`lf.getPointByClient` API 配合使用，如果想实现更加灵活的样式，可以直接通过类名设置样式。

- `lf-mini-map` - mini-map 根元素
- `lf-mini-map-header` - mini-map 头部元素
- `lf-mini-map-graph` - mini-map 画布元素
- `lf-mini-map-close` - mini-map 关闭图标元素

> `MiniMap.show()`必须在`lf.render()`后调用。

### 隐藏

```ts
// 1.1.0 以上
lf.extension.miniMap.hide()

// 1.1.0 以下
MiniMap.hide();

```

### 示例

<iframe src="https://codesandbox.io/embed/intelligent-matsumoto-t1dc5?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="intelligent-matsumoto-t1dc5"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>