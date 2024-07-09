---
nav: 指南
group:
  title: 基础
  order: 1
title: 实例
order: 0
toc: content
---

# LogicFlow实例

## 创建实例

每一个流程设计界面，就是一个LogicFlow的实例。为了统一术语，我们后面统一在代码层面将`LogicFlow`的实例写作`lf`。

```html
<style>
  #container {
    width: 1000px;
    height: 500px
  }
</style>

<div id="container"></div>
```

```js
const lf = new LogicFlow({
  container: document.querySelector('#container')
});
```

当创建一个实例的时候，我们需要传递初始化LogicFlow实例的配置项。LogicFlow支持非常丰富的初始化配置项，但是只有LogicFlow画布初始化时挂载的DOM节点`container`参数是必填的。完整的配置项参见 [LogicFlow API](/api)。

## 图数据

在LogicFlow里面，我们把流程图看做是由节点和边组成的图。所以我们采用如下数据结构来表示LogicFlow的图数据。

<code id="graphData" src="../../src/tutorial/basic/instance/graphData"></code>

`nodes`: 包含所有的节点。每个节点的数据属性参见 <a href="../api/nodeModelApi.md#数据属性">nodeModel</a> 。

`edges`: 包含所有的边，通过起始 `sourceNodeId` 和 `targetNodeId` 将两个节点相连。每个节点的数据属性参见  <a href="../api/edgeModelApi.md#数据属性">EdgeModel</a>。

<!-- - 为什么节点文本还要有坐标，直接用节点的坐标不行吗？

  `text`可以是节点文本，也可以是连线文本，如果是节点文本，默认自动采用节点坐标作为节点文本坐标，如果是连线文本，我们会基于不同的连线类型计算一个合适的坐标作为节点坐标。
  
  在有些应用场景下，我们的文本位置是可以改变的和拖动的，基于此，我们LogicFlow的文本数据提供坐标属性。


- 连线`startPoint`、`endPoint`数据和`pointsList`为什么是重复的？

  目前，在LogicFlow内部内置了`line`, `polyline`, `bezier`三种基础连线，这三种连线都有`startPoint`、`endPoint`数据。但是其中`line`连线是不会带上`pointsList`。对于`polyline`, `pointsList`表示折线所有的点。对于`bezier`，`pointsList`表示`['起点', '第一个控制点'，'第二个控制点', '终点']`。


- `properties`是用来做什么的？

  `properties`是LogicFlow保留给具体业务场景使用的数据。
  例如：在审批流场景，我们定义某个节点，这个节点通过了，节点为绿色，不通过节点为红色。那么节点的数据描述可以为:
  ```jsx | pure
  {
    type: 'apply',
    properties: {
      isPass: true
    }
  }
  ```

- `type`是什么？

  `type`表示节点或者连线的类型，这里的类型不仅可以是`rect`,`polyline`这种LogicFlow内置的基础类型，也可以是用户基于基础类型自定义的类型。 -->

## 图渲染

数据直接放入`render`方法中执行就可以渲染出图了。

```js
lf.render(graphData)
```
