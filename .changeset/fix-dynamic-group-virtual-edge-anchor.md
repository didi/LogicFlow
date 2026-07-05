---
'@logicflow/extension': patch
---

fix(dynamic-group): 折叠创建虚拟边时清除原边锚点 id，避免 `console.warn` 并改用分组节点锚点重算。
