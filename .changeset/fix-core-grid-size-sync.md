---
'@logicflow/core': patch
---

fix(core): 修复 `snapGrid: true` 时 `gridSize` 未随 `grid` 简写形式（布尔值、数字）同步的问题；现在 `gridSize` 始终与 `Grid.getGridOptions()` 解析后的 `grid.size` 保持一致。
