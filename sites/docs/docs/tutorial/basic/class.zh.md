---
nav: 指南
group:
  title: 基础
  order: 1
title: 实例
order: 0
toc: content
---

## 创建实例

每一个流程设计界面，就是一个LogicFlow的实例。为了统一术语，我们后面统一在代码层面将`LogicFlow`
的实例写作`lf`。

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

当创建一个实例的时候，我们需要传递初始化LogicFlow实例的配置项。LogicFlow支持非常丰富的初始化配置项，但是只有LogicFlow画布初始化时挂载的DOM节点`container`
参数是必填的。完整的配置项参见 [LogicFlow API](../../api)。

## 图数据

在LogicFlow里面，我们把流程图看做是由节点和边组成的图。所以我们采用如下数据结构来表示LogicFlow的图数据。

<code id="graphData" src="../../../src/tutorial/basic/instance/graphData"></code>

**`nodes`**: 包含所有的节点。每个节点的数据属性详见 <a href="../../api/model/node-model#数据属性">
nodeModel</a> 。

**`edges`**: 包含所有的边，通过起始 `sourceNodeId` 和 `targetNodeId`
将两个节点相连。每个边的数据属性详见  <a href="../../api/model/edge-model#数据属性">edgeModel</a>。

**`type`**: 表示节点或者边的类型，这里的类型不仅可以是`rect`,`polyline`
这种LogicFlow内置的基础类型，也可以是用户基于基础类型自定义的类型。

**`text`**: `text`
可以是节点文本，也可以是连线文本，如果是节点文本，默认自动采用节点坐标作为节点文本坐标，如果是连线文本，我们会基于不同的连线类型计算一个合适的坐标作为节点坐标。在有些应用场景下，我们的文本位置是可以改变的和拖动的，基于此，我们LogicFlow的文本数据提供坐标属性。

**`properties`**:
每个节点和边都有properties属性，包含节点样式、形状属性和业务自定义属性（保留给具体业务场景使用的数据），比如节点自身的形状属性`width`,`height`
,样式属性`style`和业务自定义属性`isPass`等。

## 图渲染

数据直接放入`render`方法中执行就可以渲染出图了。

```js
lf.render(graphData)
```
