# 键盘快捷键 Keyboard

## 快捷键配置
通过创建 `LogicFlow` 实例时传入 options 的 keyboard 属性可以开启快捷键。
```ts
const lf = new LogicFlow({
  container: document.querySelector('#app'),
  keyboard: {
    enabled: true,
    shortcuts: [{
      keys: ['cmd + a'],
      callback: () => {
        alert('cmd + a')
        return false;
      }
    }]
  },
});
```

<example :height="300" ></example>

通过 keyboard 的声明可以看出，当 enabled 为 true 时，开启键盘，反之则关闭。

```ts
export interface KeyboardDef {
  enabled: boolean,
  shortcuts?: Array<{
    keys: string | string[],
    callback: Handler,
    action?: Action,
  }> | {
    keys: string | string[],
    callback: Handler,
    action?: Action,
  }
}
```   
shortcuts 则可以定义用户自定义的一组快捷键，值得一提的是 keys 的规则与[mousetrap](https://www.npmjs.com/package/mousetrap)一致。

## 内置快捷键

参考不同的产品，内置了复制，粘贴，redo/undo 的快捷键。

| 快捷键   | 功能   |
| :----- | :----- |
| cmd + c 或 ctrl + c | 复制节点 |
| cmd + v 或 ctrl + v | 粘贴节点 |
| cmd + z 或 ctrl + z | 撤销操作 |
| cmd + c 或 ctrl + c | 回退操作 |

## 自定义快捷键

当通过 options 传入 shortcuts 规则定义了快捷键，`LogicFlow` 内部会自动注册这些方法，并在触发后执行 callback。当 callback 返回 false 时阻止默认浏览器行为。