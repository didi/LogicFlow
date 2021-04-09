# MiniMap

## 启用

```ts
import LogicFlow from '@logicflow/core';
import { MiniMap } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css'

LogicFlow.use(MiniMap);
```

## 显示

引入 mini-map 后默认不展示，需要手动开启显示。

```ts
MiniMap.show(leftPosition?: number, topPosition?: number);
```

`show()` 支持传入样式属性 left 和 top 的值，用来确定 mini-map 在画布中的位置。

只提供 left 和 top 这两个值是因为可以与`lf.getPointByClient` API 配合使用，如果想实现更加灵活的样式，可以直接通过类名设置样式。

- `lf-mini-map` - mini-map 根元素
- `lf-mini-map-header` - mini-map 头部元素
- `lf-mini-map-graph` - mini-map 画布元素
- `lf-mini-map-close` - mini-map 关闭图标元素

> `MiniMap.show()`必须在`lf.render()`后调用。

## 隐藏

```ts
MiniMap.hide();
```

## 禁用插件

MiniMap和正常的画布共享LogicFlow，可以在MiniMap中不显示某些插件，例如不显示工具栏。

```ts
MiniMap.init({
  disabledPlugins: [Control.name, Snapshot.name, SelectionSelect.name]
})
```

<example href="/examples/#/extension/components/mini-map" :height="350" ></example>
