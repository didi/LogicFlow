---
nav: API
group:
  title: LogicFlow 实例
  order: 2
title: 总览
toc: content
order: 0
---

## 实例

流程图上所有的节点实例操作以及事件，行为监听都在 `LogicFlow` 实例上进行。

## 实例属性

| 属性       | 类型                 | 描述                           | 只读 |
| :--------- | :------------------- | :----------------------------- | :--- |
| container  | HTMLElement          | logicflow实例挂载的容器        | 是   |
| options    | LFOptions.Definition | logicflow实例的配置            | 是   |
| graphModel | [GraphModel](../runtime-model/graphModel.zh.md) | 控制整个 LogicFlow 画布的 model | 是   |
| width      | number               | 画布宽度                       | 是   |
| height     | number               | 画布高度                       | 是   |

## 实例方法

- [渲染与数据](./render-and-data.zh.md)：渲染、读写与数据适配
- [节点相关](./node.zh.md)：节点创建、删除与查询
- [边相关](./edge.zh.md)：边类型、增删改与查询
- [元素相关](./element.zh.md)：元素选择、属性与批量操作
- [文本编辑](./text.zh.md)：文本编辑与更新
- [编辑历史](./history.zh.md)：撤销与重做
- [事件](./event.zh.md)：事件方法与事件清单
- [画布相关](./canvas.zh.md)：缩放、平移与视口控制
- [主题](./theme.zh.md)：运行时主题能力
- [注册](./register.zh.md)：节点/边注册与批量注册
- [编辑控制](./edit-config.zh.md)：读取和更新编辑控制配置项

## 与构造方法的关系

构造期配置见 [LogicFlow 构造方法](../logicflow-constructor/index.zh.md)。
