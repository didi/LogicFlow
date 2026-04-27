---
nav: API
group:
  title: LogicFlow 实例
  order: 2
title: 编辑历史
toc: content
order: 6
---

本页汇总 LogicFlow 实例中与编辑历史相关的方法。

### undo

历史记录操作，返回上一步。

**示例**

```ts
lf.undo();
```

### redo

历史记录操作，恢复下一步。

**示例**

```ts
lf.redo();
```

**注意事项**

- 调用前请先判断当前是否可重做。
- 操作会触发对应的历史记录事件。

构造期开关见 [构造方法](../logicflow-constructor/index.zh.md)。
