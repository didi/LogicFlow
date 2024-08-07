---
nav: 指南
group:
  title: 进阶
  order: 2
title: 键盘快捷键
order: 3
toc: content
---

## 快捷键配置

通过创建 `LogicFlow` 实例时传入 options 的 keyboard 属性可以开启快捷键，
可以只配置 enabled 属性，为 true 时，代表开启默认的快捷键。

```tsx | pure
const lf = new LogicFlow({
  container: document.querySelector('#app'),
  keyboard: {
    enabled: true,
  },
})
```

## 内置快捷键功能

参考不同的产品，内置了复制，粘贴，redo/undo，删除 的快捷键。

| 快捷键                | 功能   |
|:-------------------|:-----|
| cmd + c 或 ctrl + c | 复制节点 |
| cmd + v 或 ctrl + v | 粘贴节点 |
| cmd + z 或 ctrl + z | 撤销操作 |
| cmd + y 或 ctrl + y | 回退操作 |
| backspace          | 删除操作 |

## 自定义快捷键

shortcuts 则可以定义用户自定义的一组快捷键
值得一提的是 keys 的规则，与[mousetrap](https://www.npmjs.com/package/mousetrap)一致。

我们已自定义删除功能为例，在删除之前添加一个确认操作。

```tsx | pure
const lf = new LogicFlow({
  // ...
  keyboard: {
    enabled: true,
    shortcuts: [
      {
        keys: ["backspace"],
        callback: () => {
          const r = window.confirm("确定要删除吗？");
          if (r) {
            const elements = lf.getSelectElements(true);
            lf.clearSelectElements();
            elements.edges.forEach((edge) => lf.deleteEdge(edge.id));
            elements.nodes.forEach((node) => lf.deleteNode(node.id));
          }
        },
      },
    ],
  },
});
```

<a href="https://codesandbox.io/embed/logicflow-base10-eerft?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> 去 CodeSandbox 查看示例</a>
