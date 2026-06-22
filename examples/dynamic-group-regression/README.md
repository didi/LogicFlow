# DynamicGroup 回归复现示例

用于在修复 **DynamicGroup** 相关 Issue 前后做人工对比验证。每个场景左侧可选，右侧为画布与操作步骤。

## 启动

**首次使用**需先构建依赖包（示例引用 `@logicflow/core` / `extension` / `layout` 的 `es` 产物）：

```sh
# 仓库根目录
pnpm install
pnpm exec turbo run build --filter=@logicflow/core --filter=@logicflow/extension --filter=@logicflow/layout

cd examples/dynamic-group-regression
pnpm start
```

浏览器默认打开 `http://localhost:5190`。

或在根目录一条命令启动 dev：

```sh
pnpm --filter dynamic-group-regression start
```

## 场景与 Issue 对照

| 场景 ID | Issue |
| --- | --- |
| `edge-delete-after-collapse` | #2395 |
| `gateway-dual-branch` | #2395 / E7 双分支 |
| `points-list-collapse` | #2399、#2400 |
| `edge-nan-after-toggle` | #2401 |
| `initial-collapsed-position` | #1616、#2198 |
| `map-after-remove-group` | #2194 |
| `new-group-map-pollution` | #2052 |
| `restrict-no-append-in` | #2412 |
| `zindex-mismatch` | LOCAL-1 |
| `overlap-collapse-misassign` | LOCAL-2 |
| `add-node-with-children` | #1673 |
| `layout-format-escape` | #2205、#2332 |
| `resize-undo-twice` | #1532 |
| `resize-single-axis` | #1555 |

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
- 布局场景依赖 `@logicflow/layout` 的 `ElkLayout` 插件。

## 相关文档

- [分组功能Bug综合分析报告.md](../../分组功能Bug综合分析报告.md)
- [设计说明](../../docs/superpowers/specs/2026-05-18-dynamic-group-fix-design.md)
