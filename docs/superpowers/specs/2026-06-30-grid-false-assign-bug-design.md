# Grid `false` / 简写失效 Bug 修复设计

## 背景

`@logicflow/core@2.2.1` 起，`GraphModel` 构造函数将 `grid` 选项通过 `assign({}, initialGrid, grid)` 合并后再传给 `getGridOptions`。当 `grid` 为布尔或数字简写时，`assign` 无法拷贝任何属性，导致用户传入的 `grid: false` / `grid: true` / `grid: 20` 被忽略，始终使用 `gridModeMap` 中的 `defaultGrid`（`visible: true`）。

文档约定（[grid 教程](../../../sites/docs/docs/tutorial/basic/grid.en.md)、[LogicFlow.Options](../../../sites/docs/docs/api/logicflow-constructor/index.en.md)）：

- 默认 `grid: false`，画布不显示网格线
- `grid: true` 开启默认网格
- `grid: number` 设置网格间距
- `grid: { ... }` 细粒度配置

`2.1.9` ~ `2.1.11` 使用 `Grid.getGridOptions(grid ?? false)`，行为正确。本修复恢复该语义。

## 决策记录

| 问题 | 决策 |
|------|------|
| `grid: true` 的样式来源 | **A：通用 `defaultGrid`**（与 2.1.x 一致）。仅对象形式 `grid: { ... }` 或与 `themeMode` 相关的 `setTheme({ grid })` 才合并 `gridModeMap[themeMode]` |
| 修复范围 | 最小 bugfix，仅修构造函数初始化路径 |
| `setTheme(_, themeMode)` 切换主题时覆盖 `grid: false` | **本次不修**，作为已知限制记录；若后续需要再单独立项 |

## 目标行为

| 输入 | 期望结果 |
|------|----------|
| 未传 / `grid: false` | `visible: false`，不显示网格线；`gridSize` 保持默认 1 |
| `grid: true` | `getGridOptions(true)` → `defaultGrid` + `visible: true`（**不**使用 `gridModeMap` 主题网格） |
| `grid: 20` | `getGridOptions(20)` → `defaultGrid` + `size: 20` + `visible: true` |
| `grid: { visible: false }` | 合并 `initialGrid` 后 `visible: false`（对象形式可走主题默认样式，但隐藏网格线） |
| `grid: { size: 20, type: 'dot' }` | 合并 `initialGrid`（主题网格）与用户对象，再经 `getGridOptions` 规范化 |

## 实现方案

### 修改点

**文件：** `packages/core/src/model/GraphModel.ts`（构造函数，约第 186 行）

**当前：**

```ts
this.grid = Grid.getGridOptions(assign({}, initialGrid, grid))
```

**修改为：**

```ts
this.grid = Grid.getGridOptions(
  typeof grid === 'object' && grid !== null
    ? assign({}, initialGrid, grid)
    : (grid ?? false),
)
```

逻辑说明：

- **对象**：保留 2.2 主题网格合并能力（`initialGrid` + 用户配置）
- **布尔 / 数字 / `undefined`**：直接交给 `getGridOptions`，由其内部类型分支处理（与 2.1.x 一致）
- `undefined` 经 `?? false` 后为 `false`，与 `Options.defaults.grid` 一致

不修改 `Grid.getGridOptions` 本身，不新增 helper 函数（单行分支足够清晰）。

### 不在本次范围

- `setTheme(style, themeMode)` 切换 `themeMode` 时 `gridModeMap` 合并可能覆盖用户显式 `grid: false`（1543–1546 行）
- `background: false` 与 `assign({}, initialBackground, background)` 的类似模式（已有 `if (background)` 守卫，行为不同）
- 文档更新（恢复既有约定，非行为变更）
- `examples/dynamic-group-regression` 中 `grid: false` 可保留，修复后无需改为对象写法

## 测试

在 `packages/core/__tests__/model/graphmodel.test.ts`（或新建 `grid-options.test.ts`）增加用例：

1. `grid: false` → `lf.graphModel.grid.visible === false`
2. `grid: true` → `visible === true`，且 `type === 'mesh'`（`defaultGrid` 默认值，而非 `retro` 等主题）
3. `grid: 20` → `size === 20` 且 `visible === true`
4. （可选）`grid: { visible: false, type: 'dot' }` → `visible === false`，`type === 'dot'`

每个用例使用独立 `LogicFlow` 实例与独立 DOM 容器，避免与现有 `grid: true` 的全局 fixture 冲突。

## 验证

```sh
cd packages/core && pnpm test -- graphmodel
# 或
pnpm test -- grid
```

## 发布说明

`packages/core/CHANGELOG.md` 增加 **Fixed** 条目：

- 修复 `grid: false` / `grid: true` / `grid: number` 简写在 2.2.1+ 失效、始终显示默认网格的问题

## 风险

- **低**：仅收窄构造函数分支，对象形式路径不变
- 依赖「`grid: true` 始终显示主题网格」的 2.2.1 用户（若有）将恢复为通用 `defaultGrid`；与文档及 2.1.x 一致，可接受
