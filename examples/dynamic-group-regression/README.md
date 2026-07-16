# DynamicGroup 回归复现示例

用于在修复 **DynamicGroup** 相关 Issue 前后做人工对比验证。每个场景左侧可选，右侧为画布与操作步骤。

## 启动

**首次使用**需先构建依赖包（示例引用 `@logicflow/core` / `extension` / `layout` 的 `es` 产物）：

```sh
# 仓库根目录
pnpm install   # prepare 会自动 build:all
# 或仅开发所需的最小构建
pnpm run build

cd examples/dynamic-group-regression
pnpm dev
```

完整本地开发：

```sh
# 终端 1：packages 热更新
pnpm run dev

# 终端 2
cd examples/dynamic-group-regression && pnpm dev
```

## 场景与 Issue 对照

| 场景 ID | Issue |
| --- | --- |
| `cascade-delete-children` | cascadeDeleteChildren 级联删除 |
| `edge-delete-after-collapse` | #2395 |
| `gateway-dual-branch` | #2395 / E7 双分支 |
| `points-list-collapse` | #2399、#2400 |
| `edge-nan-after-toggle` | #2401 |
| `initial-collapsed-position` | #1616、#2198 |
| `map-after-remove-group` | #2194 |
| `new-group-map-pollution` | #2052（已修复） |
| `restrict-no-append-in` | #2412 |
| `zindex-mismatch` | LOCAL-1 |
| `overlap-collapse-misassign` | LOCAL-2、#2052（已修复） |
| `add-node-with-children` | #1673 |
| `layout-format-escape` | #2205、#2332（已修复） |
| `title-header` | LOCAL 组名 / titleHeader |
| `resize-bounds` | LOCAL-resize-bounds（DG 缩小 resize 最小边界） |
| `resize-undo-twice` | #1532（关闭 · 暂不修复） |
| `resize-single-axis` | #1555（关闭 · 暂不修复） |
| `selection-copy-paste` | LOCAL-copy-paste（选区复制分组+连线后节点/连线分离） |

## 图数据约定

**所有预置节点与场景内 `addNode` 创建的节点：`text` 必须与 `id` 一致。**

- 字符串：`text: 'node_a'` 对应 `id: 'node_a'`
- 对象：`text: { value: 'node_a', x, y, ... }` 中 `value` 等于 `id`
- 辅助方法：`makeNode`、`makeGroup`、`nodeText`（见 `src/scenarios/customNodes.ts`）

便于在画布、控制台与 `getGraphRawData()` 中快速对应节点。

## 使用说明

1. 左侧点击场景，画布自动加载预置图数据。
2. 左侧 **DndPanel** 可拖「动态分组 / 矩形 / 圆形」（`new-group-map-pollution` 等场景需要）。
3. 按步骤操作；可用场景内快捷按钮（折叠/展开/删边等）。
4. **修复前**：应能复现 `已知问题` 描述的现象。
5. **修复后**：同一操作应满足 [设计说明](../../docs/superpowers/specs/2026-05-18-dynamic-group-fix-design.md) 中的预期。

回归示例默认开启 `pluginsOptions.dynamicGroup.disallowEdgeConnectToGroup: true`（推荐新业务配置），所有场景共用该设置。

## 注意

- 部分场景需**手动**拖折线控制点（#2401、#2399）后再点折叠。
- `#2412` 使用自定义节点类型 `locked-dynamic-group`。
- `selection-copy-paste` 使用 `SelectionSelect` 插件框选（点「开启框选」后在空白处拖拽），复制/粘贴按钮与键盘 `Cmd/Ctrl+C`、`Cmd/Ctrl+V` 走同一套 core 逻辑；复现要点：框选「分组+组内节点+连线」粘贴后，`addElements` 会让新分组另生成一套幽灵子节点，粘贴出的连线连的是另一批子节点，拖动新分组即分离（点「诊断」可看到重合矩形与归属信息）。
- 布局场景（`layout-format-escape`）支持通过控制面板组合测试：**Dagre (#2205) / ELK (#2332)**、全图/组内布局、`resizeGroup`、分组 `resizable` 与尺寸等。

## 相关文档

- [分组功能Bug综合分析报告.md](../../分组功能Bug综合分析报告.md)
- [设计说明](../../docs/superpowers/specs/2026-05-18-dynamic-group-fix-design.md)
