---
'@logicflow/extension': patch
---

fix(pool): 修复多选拖拽时 PoolElements 高亮状态不稳定的问题；将 `activeGroup` 升级为 Set，使其与 DynamicGroup 行为对齐，支持多个 Lane 同时高亮；`activeGroups` 改为私有字段。
