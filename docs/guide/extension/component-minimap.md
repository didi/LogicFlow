# 小地图 MiniMap

## 配置

| 名称 | 类型 | 默认值 | 描述 |
| :- | :- | :- | :- |
| width | number | 150 | 小地图宽度 |
| height | number | 200 | 小地图高度 |
| leftPosition | number | 0 | absolute定位信息，小地图距离原图左边的距离 |
| topPosition | number | 0 |  absolute定位信息，小地图距离原图上面边的距离 |
| rightPosition | number | undefined | absolute定位信息， 小地图距离原图右边的距离 |
| bottomPosition | number | undefined |  absolute定位信息，小地图距离原图下方的距离 |
| isShowHeader | boolean | true | 是否展示小地图导航栏header |
| isShowCloseIcon | boolean | true | 是否展示小地图关闭 |
| headerTitle | string | 导航 | 小地图标题 |


```ts
interface MiniMapStaticOption {
  width?: number,
  height?: number,
  isShowHeader?: boolean,
  isShowCloseIcon?: boolean,
  leftPosition?: number,
  rightPosition?: number,
  topPosition?: number,
  bottomPosition?: number,
  headerTitle?: string,
}
```
### 启用

```ts
import LogicFlow from '@logicflow/core';
import { MiniMap } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css';
// 注意：需要在创建lf实例之前使用 MiniMap.setOption方法需要在1.1.32发布后使用
MiniMap.setOption({
    width: 200,
    height: 170,
    headerTitle: '缩略图',
    topPosition: 20, // 在原图的右上角
    rightPosition: 20, // 在原图的右上角
})

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

### 使用说明
1、如果小地图移动视口已经偏离，可以点击小地图任意位置进行复位。
2、在使用小地图的同时，如果对原流程图进行大比例的缩小放大会影响小地图的使用体验，使用API`lf.extension.miniMap.reset()`进行原流程图缩放重置和和小地图复位。

### 示例

<iframe src="https://codesandbox.io/embed/intelligent-matsumoto-t1dc5?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="intelligent-matsumoto-t1dc5"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>
