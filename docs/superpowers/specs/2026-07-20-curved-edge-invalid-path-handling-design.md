# 圆角折线非法路径处理设计

## 背景

`PolylineEdgeModel.pointsList` 是折线用于绘制的完整路径。正常情况下，首点和末点分别对应边的起点和终点，中间点表示折线路径上的拐点。`model.points` 则是 `pointsList` 序列化后的 SVG 坐标字符串。

`@logicflow/extension` 的 `getCurvedEdgePath(points, radius)` 当前默认完整路径至少包含两个点。单点输入会先读取 `points[0]` 生成 `M` 命令，并将索引推进到 `1`；随后代码继续读取不存在的 `points[1]` 生成最后一个 `L` 命令，最终抛出 `TypeError`。一条异常边因此可能阻断整张流程图的渲染。

这个问题不应通过猜测缺失点或自动重建路径来掩盖。数据模型应保留调用方提供的数据并报告异常；渲染层应忠实处理能够表达的几何，在无法安全渲染时跳过该边，避免影响其他节点和边。

## 目标

- 明确未传、空数组、单点、有效多点和非有限坐标的运行时语义。
- 对异常非空路径输出一次包含 edge id 和原因的告警。
- 不使用 `startPoint`、`endPoint` 或自动寻路替换异常非空路径。
- 保证内置折线和圆角折线不会因为单点、`NaN` 或 `Infinity` 抛出渲染异常。
- 一条不可渲染的边不得影响图中其他节点和有效边。
- 保持有效两点及多点路径的现有输出不变。

## 非目标

- 不定位或修复业务适配器、持久化数据或其他外部生产者。
- 不过滤异常点后拼接一条新的路径。
- 不为单点路径额外绘制圆、占位符或诊断图形。
- 不新增公共配置项或改变 `pointsList` 的数据结构。
- 不改变直线边、贝塞尔边或其他不使用 `PolylineEdgeModel.pointsList` 的边类型。

## 路径语义

| 输入 | Model 行为 | View 行为 | 告警 |
| --- | --- | --- | --- |
| 未传 `pointsList` | 自动寻路 | 正常绘制 | 无 |
| `pointsList: []` | 自动寻路 | 正常绘制 | 无 |
| 1 个有限点 | 保留单点，不重新寻路 | 无可见线段，不抛异常 | 一次 |
| 2 个有限点 | 按现有规则正交化并保留 | 直线 | 无 |
| 3 个及以上有限点 | 按现有规则正交化并保留 | 折线或圆角折线 | 无 |
| 正交化后收缩为 1 个有限点 | 保留收缩结果，不重新寻路 | 无可见线段，不抛异常 | 一次 |
| 任一点包含非有限或缺失坐标 | 保留 Model 实际收到的数据，不进行正交化 | 跳过整个 View | 一次 |

`pointsList` 未传或为空数组仍表示没有固定路径，沿用当前自动寻路行为。非空路径则被视为调用方明确提供的数据，即使它无法形成线段，也不会被 Core 擅自替换。

## 设计原则

### 告警

Model 在接收数据的边界报告异常，View 不输出告警。这样同一条边不会因为响应式重渲染反复打印相同信息。

### 忠实处理

Model 可以继续执行已有的正交化，但不会根据 `startPoint` 和 `endPoint` 为异常非空路径生成替代路线。渲染层也不会补点、删除点或猜测连接方式。

### 故障隔离

View 对不能安全转换成 SVG 几何的输入返回 `null`，或生成不包含线段的合法路径。异常仅影响当前边的线条，不中断整张图的渲染。

## 数据流与职责

```text
EdgeConfig.pointsList
        │
        ▼
PolylineEdgeModel 输入分类与告警
        │
        ├─ 未传或 [] ──────────────► updatePoints() 自动寻路
        │
        ├─ 包含非有限坐标 ─────────► 保留原始 pointsList，不正交化
        │
        └─ 全部有限 ───────────────► orthogonalizePath()
                                          │
                                          └─ 收缩为单点时告警并保留
        │
        ▼
model.points / model.pointsList
        │
        ├─ PolylineEdge ───────────► 有限点按原数据交给 SVG；非有限点跳过整个组件
        │
        └─ CurvedEdge ─────────────► 安全解析并调用 getCurvedEdgePath()
                                             │
                                             ├─ 0 点：''
                                             ├─ 1 点：M x y
                                             ├─ 2 点：M ... L ...
                                             ├─ 3+ 点：圆角路径
                                             └─ 非有限点：''
```

## Core 模型处理

### 输入分类顺序

`PolylineEdgeModel` 在初始化和 `updatePath()` 中使用同一套顺序：

1. 未传 `pointsList` 或长度为 `0` 时，不告警并调用 `updatePoints()`。
2. 非空路径先检查每个点的 `x`、`y` 是否为有限数字。
3. 存在非有限或缺失坐标时，保留 Model 实际收到的 `pointsList`，不调用 `orthogonalizePath()`，输出一次告警。
4. 全部坐标有限时，调用现有 `orthogonalizePath()`。
5. 正交化结果只有一个点时，保留该结果，输出一次告警。
6. 将最终保留的数据同步到 `pointsList` 和 `points`，不调用 `updatePoints()`。

非有限输入必须在正交化之前被识别。否则正交化可能围绕 `NaN` 或 `Infinity` 继续创建拐点，既改变原始数据，也让错误扩散到更多坐标。

### 告警内容

单点告警说明完整路径不能形成线段，但数据会被保留：

```text
[LogicFlow] Edge "<edge-id>" received a pointsList that resolves to one point. The path is kept, but no visible segment can be rendered.
```

非有限坐标告警说明该边会被跳过：

```text
[LogicFlow] Edge "<edge-id>" received a pointsList with non-finite coordinates. The path is kept, but the edge will be skipped during rendering.
```

初始化时每条异常边输出一次。`updatePath()` 每次接收新的异常路径时输出一次。`initPoints()`、MobX 重算和 View 重渲染不重复输出告警。

### 数据保留

`getData()` 继续返回模型中保存的 `pointsList`。单点或异常坐标不会再被正交化或自动寻路替换，调用方仍可检查、修复并重新提交该路径。

需要区分 LogicFlow 的公开加载入口和 Model 输入边界：`LogicFlow.render()` 会先通过 JSON 序列化标准化图数据，因此调用方传入的 `NaN` 或 `Infinity` 会在创建 Model 前变成 `null`；Model 会保留它实际收到的 `null`。直接调用 `updatePath()` 时没有这一步，`NaN` 或 `Infinity` 会原样保留。两种入口都会被识别为异常坐标、输出告警并跳过线条渲染。

## View 与路径函数处理

### 内置 PolylineEdge

单个有限点可以安全传给 SVG `<polyline>`。它不会形成可见线段，但也不会抛出 JavaScript 异常。

当 `model.pointsList` 或实际渲染使用的 `model.points` 中存在非有限坐标时，`PolylineEdge.render()` 返回 `null`，不再生成主路径、透明点击热区、箭头或文本，也不依赖不同浏览器对非法 SVG 属性的容错行为。`getEdge()` 自身保留相同校验，以保证被扩展或测试代码直接调用时同样安全。

### CurvedEdge

`CurvedEdge.getEdge()` 将空 `model.points` 解析为空点集，而不是 `[0]`。解析得到的任意点包含非有限坐标、缺少坐标或带有多余坐标时直接返回 `null`。

对有限点调用 `getCurvedEdgePath()`：

- `0` 点返回空字符串。
- `1` 点返回 `M x y`。`M` 只移动 SVG 当前点，不产生可见线段。
- `2` 点返回直线路径。
- `3` 点及以上沿用现有圆角计算。

当生成结果为空字符串时，`CurvedEdge.getEdge()` 返回 `null`。

### getCurvedEdgePath

`getCurvedEdgePath()` 是导出的纯函数，可能被 View 以外的代码直接调用。因此函数自身也校验点结构和坐标有限性：

- 空数组和非法点集返回空字符串；每个 tuple 必须恰好包含 `x`、`y` 两个有限坐标。
- 单点返回合法的 `M` 命令。
- 不打印告警，不访问不存在的数组项。

纯函数只负责将已有点转换成 SVG path，不获取模型、节点或端点，也不执行自动寻路。

## 错误处理边界

- Model 负责识别异常、告警和保留数据。
- View 负责阻止异常几何进入 SVG 渲染。
- 路径函数负责对所有数组长度安全返回。
- 无任何一层尝试推断调用方原本想要的路径。
- 非法边的模型和数据仍然存在，只跳过其线条渲染。

## TDD 顺序

### 1. Core 失败测试

先修改 `packages/core/__tests__/model/polyline-edge.test.ts`，在不改实现的情况下确认以下断言失败：

- 单点初始化后 `pointsList` 仍为单点，而不是自动生成两点以上路径。
- 单点初始化输出一次包含 edge id 的告警。
- `updatePath()` 接收单点后保留单点并告警一次。
- 两个重复点经过正交化收缩为单点后，保留结果并告警一次。
- `NaN` 和 `Infinity` 输入保持原始数组、不正交化，并分别告警。
- 未传和空数组仍自动寻路且不告警。

### 2. View 与路径函数失败测试

修改现有 curved-edge 测试并增加 PolylineEdge 定向测试：

- `getCurvedEdgePath([])` 返回 `''`。
- 单点返回 `M x y`，不抛异常。
- 两点和多点输出保持不变。
- `NaN`、`Infinity` 或缺少坐标的点集返回 `''`。
- `CurvedEdge.getEdge()` 遇到空路径或非有限坐标返回 `null`。
- `PolylineEdge.getEdge()` 遇到非有限坐标返回 `null`。

### 3. 集成回归

在 feature example 中同时放置：

- 一条单点圆角边；
- 一条包含非有限坐标的异常边；
- 一条正常圆角边；
- 起点和终点坐标均不同的节点。

修复前单点边会阻断渲染。修复后异常边输出告警但不显示线条，正常节点和正常边仍可见、可拖动。

### 4. 最小实现

在失败测试确认原因正确后，依次修改：

1. `PolylineEdgeModel` 的初始化和 `updatePath()` 输入处理。
2. `PolylineEdge.getEdge()` 的非有限点保护。
3. `CurvedEdge.getEdge()` 的解析和跳过逻辑。
4. `getCurvedEdgePath()` 的零点、单点和非法点分支。

每完成一层只运行最近的测试，全部通过后再执行构建和示例验证。

## 文档与发布记录

- 更新中英文 `EdgeConfig` / `EdgeData` 文档，说明 `pointsList` 是包含端点的完整折线路径。
- 明确未传或空数组触发自动寻路。
- 明确异常非空路径会被保留并告警，不会自动修复。
- 明确单点没有可见线段，非有限路径会跳过渲染。
- 更新 `.changeset/fix-degenerate-curved-edge-points.md`，为实际修改的 Core 和 Extension 包记录 patch 变更。
- 不直接修改已发布版本的包内 `CHANGELOG.md`。

由于这是默认错误处理行为的变化，公开文档必须醒目标注新旧行为：旧版本的 CurvedEdge 可能因单点路径抛异常；新版本保留异常数据、输出告警并隔离当前边。

## 验证

最小自动验证：

```sh
pnpm test -- packages/core/__tests__/model/polyline-edge.test.ts
pnpm test -- packages/extension/__test__/materials/curved-edge/curved-edge.test.ts
pnpm --filter @logicflow/core build
pnpm --filter @logicflow/extension build
pnpm exec changeset status
```

示例验证：

```sh
pnpm --dir examples/feature-examples dev
```

人工确认：

- 页面加载过程中没有未捕获异常。
- 单点和非有限路径分别产生预期告警。
- 异常边没有可见线段。
- 正常边和节点继续显示。
- 拖动正常边关联节点后路径继续正确更新。

## 兼容性与风险

### 兼容性

- 未传、空数组、两点和多点有限路径保持现有行为。
- 单点路径仍保留在模型中，但 CurvedEdge 从抛异常改为无可见线段。
- 新增的告警只针对异常非空路径。
- 不改变 `getCurvedEdgePath(points, radius)` 的参数和字符串返回类型。
- 不新增持久化字段。

### 风险

- 使用单点路径作为业务信号的调用方会看到新的告警，但数据不会被修改。
- 返回 `null` 跳过当前边的整个 View；边模型仍参与数据查询和后续更新。
- 多个重复点可能在正交化后收缩为单点，必须在正交化之后再次判断长度。
- 必须先拦截非有限输入再正交化，避免错误坐标扩散。

## 完成标准

- 所有输入类别都具有明确且经过测试的 Model 和 View 行为。
- 单点、空点集和非有限点不会导致未捕获异常。
- 异常非空路径不会被自动寻路替换。
- 异常边不影响其他图元素渲染。
- warning、公开文档、changeset 和实现语义一致。
- 有效路径的现有路径字符串测试保持不变。
