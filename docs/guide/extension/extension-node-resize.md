# 节点缩放

## 支持缩放的节点类型
目前节点缩放支持的节点类型如下：
- 矩形
- 椭圆
- 菱形

## 使用
```js
import LogicFlow from '@logicflow/core';
import { NodeResize } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css'
LogicFlow.use(NodeResize);
```
<example href="/examples/#/extension/node-resize" :height="650" ></example>

[示例代码](https://github.com/didi/LogicFlow/tree/master/examples/src/pages/extension/NodeResize)

## 个性化配置
### step
缩放控制点拖动step，step默认取值为2，当设置了网格grid之后，默认取值为 2 * grid。也可以手动设置。
```js
import { NodeResize } from '@logicflow/extension';
NodeResize.step = 4;
LogicFlow.use(NodeResize);
```
### 缩放样式
支持节点缩放边框以及控制点样式调整，支持的样式以及默认值如下:
```js 
// 边框和contol拖动点样式的设置
  style: {
    outline: {
      stroke: '#000000',
      strokeWidth: 1,
      strokeDasharray: '3,3',
    },
    controlPoint: {
      width: 7,
      height: 7,
      fill: '#FFFFFF',
      stroke: '#000000',
    },
  },
```
使用如下：
```js
 NodeResize.style.outline = {
  ...NodeResize.style.outline,
  stroke: '#1E90FF',
  strokeDasharray: '',
}
LogicFlow.use(NodeResize);
```
### 主题
增加节点调整后，为了使整体样式个更加舒适，在插件内部设置了节点的主题样式，宿主可以对其进行覆盖设置。
```js
// 默认配置，主要将outlineColor设置为透明，不再展示core包中默认的节点外框
    lf.setTheme({
      rect: {
        strokeWidth: 2,
        outlineColor: 'transparent',
      },
      ellipse: {
        strokeWidth: 2,
        outlineColor: 'transparent',
      },
      diamond: {
        strokeWidth: 2,
        outlineColor: 'transparent',
      },
    });
```
如果想要在此基础上增加其他主题配置，需要将2者配置merge后设置。例如：在此基础上想要设置矩形边框为蓝色，设置如下：
```js
    lf.setTheme({
      rect: {
        strokeWidth: 2,
        outlineColor: 'transparent',
        stroke: 'blue',
      },
      ellipse: {
        strokeWidth: 2,
        outlineColor: 'transparent',
      },
      diamond: {
        strokeWidth: 2,
        outlineColor: 'transparent',
      },
    });
```
## 事件
节点缩放后抛出事件`node:resize`，抛出数据包括节点缩放前后的节点位置、节点大小信息， 数据为{oldNodeSize, newNodeSize}, 详细字段如下。
| 名称  | 类型   | 描述           |
| :---- | :----- | :------------- |
| id    | String | 节点 id|
| type | String | 节点类型 |
| modelType | String | 节点图形类型，已内部定义 |
| x | Number | 节点中心x轴坐标 |
| y | Number | 节点中心y轴坐标 |
| rx | Number | x轴半径(椭圆、菱形) |
| ry | Number | y轴半径(椭圆、菱形) |
| width | Number | 节点宽度(矩形) |
| height | Number | 节点高度(矩形) |

```js
lf.on('node:resize', ({oldNodeSize, newNodeSize}) => {
  console.log(oldNodeSize, newNodeSize)
})
```
## 自定义节点使用
通过继承的方式，实现自定义节点的缩放。
- RectResize: 矩形
- EllipseResize: 椭圆
- DiamondResize: 菱形  

**getResizeShape**方法功能等同于普通自定义节点的**getShape**方法，进行个性化图形绘制，使用方式如下：

```js
import { RectResize,  EllipseResize, DiamondResize,} from '@logicflow/extension';
// 自定义节点的 Model 与 普通自定义节点一致
class UserModel extends RectResize.model {}

// 自定义节点的 view ，方法功能等同于普通自定义节点的getShape方法
class UserView extends RectResize.view {
  getResizeShape() {
    // 通过 getAttributes 获取 model 中的属性
    const { x, y, width, height, fill, stroke, strokeWidth, radius } = this.getAttributes();
    const attrs = {
      // rect 标签的 x，y 对应的是图形的左上角
      // 所以我们要将矩形的中心移动到 x，y
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
      stroke,
      fill,
      strokeWidth,
      rx: radius,
      ry: radius,
    }
    // getShape 的返回值是一个通过 h 方法创建的 svg 元素
    return h("g", {}, [
      h("rect", { ...attrs }),
      h(
        'svg',
        {
          x: x - width / 2 + 5,
          y: y - height / 2 + 5,
          width: 25,
          height: 25,
          viewBox: "0 0 1274 1024",
        },
        h(
          'path',
          {
            fill: stroke,
            d:
              "M655.807326 287.35973m-223.989415 0a218.879 218.879 0 1 0 447.978829 0 218.879 218.879 0 1 0-447.978829 0ZM1039.955839 895.482975c-0.490184-212.177424-172.287821-384.030443-384.148513-384.030443-211.862739 0-383.660376 171.85302-384.15056 384.030443L1039.955839 895.482975z",
          }
        )
      )
    ]
    );
  }
}

```
更过细节见 [节点缩放的实现方案](/article/NodeResize.html)