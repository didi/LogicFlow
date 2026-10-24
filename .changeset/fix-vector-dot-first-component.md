---
'@logicflow/core': patch
---

Fix `Vector.dot` to include the first coordinate product. This corrects asymmetric scalar products and invalid `Vector.angle` results for non-axis-aligned first vectors, while preserving the existing API.
