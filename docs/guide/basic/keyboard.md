# 键盘快捷键 Keyboard

## 快捷键配置
通过创建 `LogicFlow` 实例时传入 options 的 keyboard 属性可以开启快捷键，
可以只配置 enabled 属性，为 true 时，代表开启默认的快捷键。
```ts
const lf = new LogicFlow({
  container: document.querySelector('#app'),
  keyboard: {
    enabled: true
  },
});
```

<example :height="300" ></example>

通过 keyboard 的声明可以看出，除了 enabled 是必传项，其他都是可选的配置。

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
shortcuts 则可以定义用户自定义的一组快捷键
值得一提的是 keys 的规则，与[mousetrap](https://www.npmjs.com/package/mousetrap)一致。

## 内置快捷键

参考不同的产品，内置了复制，粘贴，redo/undo 的快捷键。

| 快捷键   | 功能   |
| :----- | :----- |
| cmd + c 或 ctrl + c | 复制节点 |
| cmd + v 或 ctrl + v | 粘贴节点 |
| cmd + z 或 ctrl + z | 撤销操作 |
| cmd + c 或 ctrl + c | 回退操作 |

## 如何阻止删除或者拷贝行为
通过创建 `LogicFlow` 实例时传入 options 的 guards 属性可以配置守卫, 目前支持两种 beforeClone 和 beforeDelete，回调函数的参数data是LogicFlow倒出的 NodeData｜EdgeData 类型， 从data可以拿到节点或者边的信息，继续进行业务逻辑判断。
```ts
const lf = new LogicFlow({
  container: document.querySelector('#app'),
  guards: {
    beforeClone(data) {
      console.log('beforeClone', data)
      return false
    },
    beforeDelete(data) {
      console.log('beforeDelete', data)
      return false
    }
  }
});
```

当 beforeClone 返回 true 时，则认为保持克隆的行为， 返回 false 时，则阻止克隆。
当 beforeDelete 返回 true 时，则保持删除的行为，返回 false 时，则阻止删除。
