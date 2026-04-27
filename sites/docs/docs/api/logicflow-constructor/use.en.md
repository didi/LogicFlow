---
nav: API
group:
  title: LogicFlow
  order: 1
title: LogicFlow.use
toc: content
order: 1
---

Register a plugin globally.

```ts
LogicFlow.use(
  extension: ExtensionConstructor | ExtensionDefinition,
  props?: Record<string, unknown>,
): void
```

Parameters:

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `extension` | [`ExtensionConstructor`](../type/MainTypes.en.md#extensionconstructor) \| [`ExtensionDefinition`](../type/MainTypes.en.md#extensiondefinition) | Yes | Plugin constructor or definition object. |
| `props` | `Record<string, unknown>` | No | Options passed to the plugin at registration time. |

Example:

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
    // Clean up listeners, timers, etc.
  }
}

LogicFlow.use(CustomPlugin, {
  featureFlag: true,
})
```

Notes:

- `use` is static: call `LogicFlow.use(...)`.
- Plugins should expose a unique `pluginName` to avoid collisions.
- Whether a plugin runs for a given instance also depends on instance options (for example disabled lists).
