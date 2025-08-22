# LogicFlow PolylineEdgeModel 变路径优化技术方案

## 背景
PolylineEdge 是 LogicFlow 中最常用的边模型之一。当前在拖拽节点、拖拽附加线段（appendWidth）与移动起终点时，路径重算集中在 `PolylineEdgeModel`：
- `updatePoints` 基于 `getPolylinePoints` 进行全量重算。
- `dragAppend/dragAppendSimple` 在拖拽中间段时逐步拼接点并通过 `updatePointsAfterDrag` 只更新 `points`。
- `moveStartPoint/moveEndPoint` 在移动端点时直接全量调用 `updatePoints`（文件现有 TODO 提示希望改为增量更新）。

当前实现稳定，但在复杂图上存在性能波动、路径美观与交互一致性问题，且缺少用户自定义路径保护与吸附等辅助体验。

## 现状梳理（与代码映射）
- 路由/重算
  - `updatePoints`：全量路径生成（`getPolylinePoints`）。
  - `updatePointsAfterDrag`：拖拽时仅更新 `this.points`，不改 `pointsList`，结束后在 `dragAppendEnd` 用 `pointFilter(points2PointsList(points))` 固化。
- 拖拽逻辑
  - `dragAppend/dragAppendSimple`：按段（水平/垂直）调整，`removeCrossPoints`、`getDraggingPoints` 补点，最后 `updateCrossPoints` 纠正与节点形状的交点。
- 已暴露改进信号
  - `moveStartPoint` 内 TODO：“尽量保持边的整体轮廓，通过 delta 更新 pointsList，而不是重新计算”。

## 问题与优化目标
- 性能
  - 高频全量重算：端点移动、快速拖拽时卡顿风险。
  - 几何计算在每次 `mousemove` 触发，缺少统一的节流/帧调度。
- 路径质量
  - 冗余折点：缺少后处理压缩（共线点未清理）。
  - 缺少障碍规避：路径可能穿越其他节点。
  - 文本位置每次重算在长路径上抖动。
- 交互一致性
  - 用户手动调整的折点在后续自动重算中易被覆盖。
  - 缺少正交吸附与对齐辅助。

目标：
- 性能稳定（60fps 近实时反馈），在大图上减少重算抖动。
- 路径美观（冗余点压缩、可选障碍规避、边与节点交点更准确/稳定）。
- 交互友好（保留用户意图、吸附与可控的“自动/半自动/锁定”模式）。

## 方案设计

### 一、性能优化
1) 统一帧调度与节流
- 在模型层引入“帧调度器”（requestAnimationFrame + 可配置 fallback 节流），将拖拽过程中的路径更新收敛到 16–32ms 一次。
- 拖拽中：调用轻量几何（不触发全量 `getPolylinePoints`），只在拖拽结束进行一次完整重算与压缩。
- 参数：`perf.throttleMs`（默认 16/24/32 可选），`perf.useRaf`（默认 true）。

2) 端点移动的增量更新
- `moveStartPoint/moveEndPoint`：
  - 若 `pointsList.length >= 2`，仅平移首段/末段相邻点，保持中间折点不动；
  - 在拖拽中不触发 `updatePoints` 全量重算，改为局部更新 `points`；
  - 拖拽结束再对整个 `pointsList` 做一次“交点纠正 + 压缩”。

3) 缓存与最小化重绘
- `getTextPosition` 在拖拽中按最长段中点“延迟更新”（仅在 `dragEnd` 或段索引变化时更新），降低文字抖动。
- 针对 `getCrossPoint*` 结果可基于“形状版本 + 方向 + 端点”做微缓存（同一帧/节流周期内复用）。

### 二、路径质量优化
1) 折点压缩（后处理）
- 在 `dragAppendEnd` 与 `updateAfterAdjustStartAndEnd` 结束时，对 `pointsList` 进行：
  - 共线点移除（向量叉积为 0，容差 `epsilon`）。
  - 短边合并（长度 < `minSegmentLen`）。
- 参数：`simplify.enabled`（默认开），`simplify.collinearEpsilon`，`simplify.minSegmentLen`。

2) 与节点边界的交点稳定性
- `updateCrossPoints`：
  - 针对圆角矩形、椭圆、多边形交点，增加“方向抖动容差”，避免端点细微抖动造成交点跳变。
  - 当无交点（极端几何）返回兜底点：回退到原端点，避免 undefined 传播。

3) 障碍规避（可选高级功能）
- 网格化曼哈顿路由 + A*：
  - 网格 `gridSize`（与主题 `offset` 协调），节点区域标记障碍；
  - 起终点按最近锚点对齐到网格；
  - A* 求路径后再做“曼哈顿化 + 压缩”。
- 参数：`route.avoidNodes`（默认关）、`route.gridSize`、`route.maxExpand`、`route.timeoutMs`。

### 三、交互与可控性
1) 用户自定义折点保护
- 在 `PolylineEdgeModel` 新增：
  - `userFixedPoints: Set<number>`：存储被用户拖拽/新增的折点索引；
  - `routeMode: 'auto' | 'incremental' | 'locked'`：
    - auto：当前默认行为；
    - incremental：优先仅调整首末两段，保留中间折点；
    - locked：除端点外不改任何折点（需要用户显式“重置路径”）。
- 自动重算时跳过 `userFixedPoints`，提供“重置路径”来清空该集合。

2) 正交吸附与辅助线
- 拖拽折点/端点时，若与相邻点 dx 或 dy < `snap.tolerance`，吸附到水平/垂直位置，显示辅助线。
- 参数：`snap.orthogonal`（默认开）、`snap.tolerance`（默认 5px）。

3) 文本位置稳定策略
- 有文本值时拖拽中固定文本位置，仅在结束时更新到最长段中点；无文本值沿用双击位置逻辑。

### 四、数据结构与 API 变化（向后兼容）
- 新增可选 properties（可从边 properties 或全局 theme 注入）：
```ts
interface PolylineRouteOptions {
  perf?: { useRaf?: boolean; throttleMs?: number }
  simplify?: { enabled?: boolean; collinearEpsilon?: number; minSegmentLen?: number }
  route?: { mode?: 'auto'|'incremental'|'locked'; avoidNodes?: boolean; gridSize?: number; maxExpand?: number; timeoutMs?: number }
  snap?: { orthogonal?: boolean; tolerance?: number }
}
```
- `PolylineEdgeModel` 新增字段（非必填，默认值保证兼容）：
  - `routeMode?: 'auto'|'incremental'|'locked'`
  - `userFixedPoints?: Set<number>`
  - `perfConfig?`, `simplifyConfig?`, `routeConfig?`, `snapConfig?`

### 五、关键实现点（与现有方法对齐）
- `moveStartPoint/moveEndPoint`
  - 读取 `routeMode`：
    - incremental/locked：仅移动首/末相邻点坐标（保持水平/垂直）；
    - auto：保留现状，必要时走轻量 `getPolylinePoints`（受节流）。
  - 拖拽中：调用 `updatePointsAfterDrag`（保持箭头与线段渲染），结束时统一进入“交点纠正 + 压缩 + 固化”。

- `dragAppend/dragAppendSimple`
  - 外层套 raf/节流；
  - 在“拼点”后调用 `updateCrossPoints`，不改 `pointsList`；
  - 结束：`dragAppendEnd` 后追加压缩和用户点保护。

- `removeCrossPoints/updateCrossPoints`
  - 增加安全兜底和容差；
  - 对首尾锚点吸附到最近锚点（已有逻辑）增加距离阈值，避免频繁跳锚。

- `getTextPosition`
  - 拖拽时缓存上次结果，`dragEnd` 再精确更新。

### 六、测试与度量
- 单元测试（packages/core/__tests__）：
  - 端点移动增量：中间折点不变；
  - 压缩：共线三点 -> 中点移除；
  - 障碍规避：启用 A* 时路径不穿越节点包围盒；
  - 正交吸附：dx/dy < tolerance 时吸附；
  - 文本位置：拖拽中不抖动，结束时更新。
- 基准测试
  - 100/500/1000 条边同时拖拽一端点，统计平均帧间隔与最高耗时；
  - 在开启/关闭简化与避障下对比。

### 七、里程碑与拆分
- P0：
  - 帧调度与节流；端点增量更新；文本位置稳定；压缩后处理；
- P1：
  - 正交吸附与辅助线；用户自定义折点保护与“重置路径”；
- P2：
  - 避障路由（A*）与配置；网格化与容错；

### 八、风险与回滚
- 避障计算成本：默认关闭，超时兜底回退为直连曼哈顿路径。
- 交互改变：通过 `routeMode` 与配置项保持向后兼容，默认沿用现状。
- 压缩策略：设置容差，提供关闭开关。

### 九、验收标准
- 复杂画布（>500 边）拖拽端点：FPS 接近 60，95 分位耗时下降 >30%。
- 路径点数减少（压缩后）不少于 10–30%（以典型数据为准）。
- 用户手动调整的折点在非“重置路径”下保持不变。
- 正交吸附默认生效，体验稳定无抖动。
