---
nav: API
group:
  title: LogicFlow
  order: 1
title: LogicFlow.use
toc: content
order: 1
---

全局注册插件。

```ts
LogicFlow.use(
  extension: ExtensionConstructor | ExtensionDefinition,
  props?: Record<string, unknown>,
): void
```

参数说明：

| 名称 | 类型 | 必传 | 描述 |
| :--- | :--- | :--- | :--- |
| `extension` | [`ExtensionConstructor`](../type/MainTypes.zh.md#extensionconstructor插件构造函数) \| [`ExtensionDefinition`](../type/MainTypes.zh.md#extensiondefinition插件定义) | 是 | 插件构造器或插件定义对象 |
| `props` | `Record<string, unknown>` | 否 | 注册时传入的插件配置 |

示例：

```ts
import LogicFlow from '@logicflow/core'

class CustomPlugin {
  static pluginName = 'CustomPlugin'

  constructor({ lf, LogicFlow, props }) {
    this.lf = lf
    this.LogicFlow = LogicFlow
    this.props = props
  }

  render(lf, container) {
    const el = document.createElement('div')
    el.textContent = 'Custom plugin'
    container.appendChild(el)
  }

  destroy() {
    // 清理监听、定时器等资源
  }
}

LogicFlow.use(CustomPlugin, {
  featureFlag: true,
})
```

说明：

- `use` 是静态方法，需通过 `LogicFlow.use(...)` 调用。
- 插件应提供唯一的 `pluginName`，避免同名冲突。
- 插件是否在某个实例内生效，还受实例配置（如禁用列表）影响。
