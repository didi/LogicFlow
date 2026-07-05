---
'@logicflow/extension': minor
---

fix(dynamic-group): 缩小 resize 时外框不得小于直接子节点占地面积，改为**所有分组默认行为**（不再依赖 `isRestrict: true`）。`isRestrict` 仅限制子节点拖出分组。
