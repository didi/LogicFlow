# 背景 Background

> 提供可以修改画布背景的方法，包括背景颜色或背景图片，背景层位于画布的最底层。


创建画布时，通过 `background` 选项来设置画布的背景层样式，支持透传任何样式属性到背景层。默认值为 `false` 表示没有背景。

```js
const lf = new LogicFlow({
    background: false | BackgroundConfig
})

type BackgroundConfig = {
  backgroundImage?: string;
  backgroundColor?: string;
  backgroundRepeat?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundOpacity?: number;
  filter?: string; // 滤镜
  [key: any]: any;
};

```
## 配置项
### 设置背景颜色

```js
const lf = new LogicFlow({
  // ...
  background: {
    backgroundImage: "url(../asserts/img/grid.svg)",
    backgroundRepeat: "repeat"
  }
})
 
```
## 示例

<iframe src="https://codesandbox.io/embed/infallible-goldberg-mrwgz?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="infallible-goldberg-mrwgz"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>