# 背景 Background

> 提供可以修改画布背景的方法，包括背景颜色或背景图片，背景层位于画布的最底层。


创建画布时，通过 `background` 选项来设置画布的背景颜色或图片，默认值为 `false` 表示没有（透明）背景。

```js
const lf = new LogicFlow({
    background: false | BackgroundConfig
})

type BackgroundConfig = {
  image?: string;
  color?: string;
  repeat?: string;
  position?: string;
  size?: string;
  opacity?: number;
};

```
## 配置项
### 设置背景颜色

```js
const lf = new LogicFlow({
    background: {
        color: '#F0F0F0'
    },
})
 
```

背景颜色，支持所有  [CSS background-color](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color) 属性的取值，如：

- 'green'
- '#f0f0f0'
- 'rgba(255, 255, 128, 0.5)'
- 'hsla(50, 33%, 25%, 0.75)'
- 'radial-gradient(ellipse at center, red, green)'

### 设置背景透明度

`opacity`: 背景透明度，取值范围 [0, 1]，默认值为 1。

### 设置背景图片

`image` ：背景图片的 URL 地址。默认值为 undefined，表示没有背景图片。

### 设置背景图重复方式

`repeat`：支持所有 [CSS background-repeat](https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat) 属性的取值，默认为 'no-repeat'。

### 设置背景图大小

`size`: 背景图片大小，支持所有 [CSS background-size](https://developer.mozilla.org/en-US/docs/Web/CSS/background-size) 属性的取值，默认为 'auto auto'。

### 设置背景图位置

`position`: 背景图片位置，支持所有 [CSS background-position](https://developer.mozilla.org/en-US/docs/Web/CSS/background-position) 属性的取值，默认为 'center'。

## 示例

给定背景图地址，设置背景图如下：

```js
const lf = new LogicFlow({
    background: {
        image: 'https://dpubstatic.udache.com/static/dpubimg/8249498d-31a3-489c-ab25-ef8dffe8ec03.jpg',
        opacity: 0.5,
        size: '50%',
        position: 'top',
    }
})
```

效果如下：

![背景图demo](../../assets/images/background.png)