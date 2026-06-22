# DynamicGroup 分组连线限制设计说明

**日期：** 2026-06-16  
**状态：** 待审阅  
**关联：** [2026-05-18-dynamic-group-fix-design.md](./2026-05-18-dynamic-group-fix-design.md)、[dynamic-group.zh.md](../../../sites/docs/docs/tutorial/extension/dynamic-group.zh.md)

## 背景

当前 `dynamic-group` 继承 `RectNodeModel`，展开态存在透明但可交互的锚点，用户可：

- 将外部节点连线到分组节点本身
- 从分组节点拖出连线连到普通节点

这与分组作为**容器**的语义不一致，且与折叠时「虚拟边挂到分组边界」的行为容易混淆。竞品（draw.io / BPMN Group / React Flow 默认 group）普遍不在展开态把分组当作 Sequence Flow 端点。

同时需控制**升级成本**：大量存量项目默认行为为「允许连到分组」，不宜在 minor 版本中 silent 改默认。

## 决策（已确认）

| 项 | 决策 |
| --- | --- |
| 范围 | **仅** `dynamic-group`；不改 `Pool` / `Lane` |
| 默认行为 | **维持允许**手动连到/从分组（与现网一致，升级零成本） |
| 严格模式 | 插件级 opt-in：`disallowEdgeConnectToGroup: true` |
| 节点覆盖 | `properties.allowEdgeConnect` 可覆盖插件级配置 |
| 折叠虚拟边 | 不受影响（仍走 `addEdge`，不经过连接规则校验） |
| 锚点 | 保留 4 个锚点；严格模式下 `edgeAddable: false` |
| 版本 | **Minor 新能力**（非 breaking）；CHANGELOG 写「新增 strict 选项」 |

## 行为定义

### 有效是否允许手动连分组

```text
若 properties.allowEdgeConnect 已显式设置（true/false）
  → 以节点 property 为准

否则
  → allow = !plugin.disallowEdgeConnectToGroup
```

| plugin.disallowEdgeConnectToGroup | properties.allowEdgeConnect | 手动连到/从分组 |
| --- | --- | --- |
| `false`（默认） | 未设置 | ✅ 允许（现状） |
| `false` | `false` | ❌ 禁止 |
| `false` | `true` | ✅ 允许 |
| `true` | 未设置 | ❌ 禁止 |
| `true` | `true` | ✅ 允许 |
| `true` | `false` | ❌ 禁止 |

### 不受影响的场景

- 折叠时 `createVirtualEdge` / `graphModel.addEdge` 创建指向分组的虚拟边
- `lf.render()` / `addEdge` 载入的、端点已是分组的历史边（只读展示；若用户 adjust 端点到分组，则走上述规则）
- 组内节点 ↔ 外部节点、组内 ↔ 组内（本需求不限制）

### 实现机制（组合方案）

在 `DynamicGroupNodeModel` 中：

1. **`getConnectedTargetRules` / `getConnectedSourceRules`**：当 `!isManualEdgeConnectAllowed()` 时 `validate` 返回 `false`
2. **`getDefaultAnchor`**：当不允许时，为各锚点设置 `edgeAddable: false`（禁止从分组拖出；配合规则拦截外部连入）

`isManualEdgeConnectAllowed()` 读取 `graphModel.dynamicGroup.disallowEdgeConnectToGroup` 与 `properties.allowEdgeConnect`，按上表求值。

## API

### 插件选项

```ts
lf.use(
  new DynamicGroup({
    disallowEdgeConnectToGroup: true, // 推荐新业务开启；默认 false
  }),
)
```

扩展 `DynamicGroup.DynamicGroupOptions`：

```ts
export type DynamicGroupOptions = Partial<{
  isCollapsed: boolean
  /** 为 true 时禁止手动将边连到/从分组节点；默认 false，保持向后兼容 */
  disallowEdgeConnectToGroup: boolean
}>
```

### 节点 property

```ts
properties: {
  /** 显式设置时覆盖插件级 disallowEdgeConnectToGroup */
  allowEdgeConnect?: boolean
}
```

## 用户通知（非 breaking）

| 渠道 | 内容 |
| --- | --- |
| `packages/extension/CHANGELOG.md` | **Minor / Feature**：新增 `disallowEdgeConnectToGroup`；默认行为不变 |
| `dynamic-group.zh.md` / `.en.md` | 重写 FAQ：默认允许；推荐新业务开启 strict；节点级 override 示例 |
| `sites/docs/docs/tutorial/update.zh.md` | 可选短段：新业务推荐配置 snippet |
| `examples/dynamic-group-regression` | 增加 strict 场景说明或子示例 |

**不做：** 运行时 console 告警、Major 版本、默认 flip。

## 主要改动文件

- `packages/extension/src/dynamic-group/index.ts` — `disallowEdgeConnectToGroup` 选项与类型
- `packages/extension/src/dynamic-group/model.ts` — 连接规则、`getDefaultAnchor`、`isManualEdgeConnectAllowed`
- `packages/extension/__test__/dynamic-group/connect-rules.test.ts` — 新增
- `sites/docs/docs/tutorial/extension/dynamic-group.zh.md` / `.en.md`
- `packages/extension/CHANGELOG.md`
- `examples/dynamic-group-regression/README.md`（可选）

## 测试用例

文件：`connect-rules.test.ts`

| ID | 场景 | 断言 |
| --- | --- | --- |
| C1 | 默认插件（无 options） | 分组可作为 target/source |
| C2 | `disallowEdgeConnectToGroup: true` | 分组不可作为 target/source |
| C3 | strict + `allowEdgeConnect: true` | 该分组可连 |
| C4 | 非 strict + `allowEdgeConnect: false` | 该分组不可连 |
| C5 | strict 下锚点 | `edgeAddable === false` |
| C6 | 回归 `collapse-edge.test.ts` E1/E7/E8 | 全部仍绿 |

## 非目标

- Pool / Lane 连线策略
- Core 层默认规则
- 3.0 默认 flip 为 strict（可后续 major 再议）

## 验收清单

- [ ] 不传插件 options 时行为与改前一致（C1）
- [ ] `disallowEdgeConnectToGroup: true` 禁止手动连分组（C2–C5）
- [ ] 折叠虚拟边回归通过（C6）
- [ ] 文档与 CHANGELOG 已更新
- [ ] `DynamicGroupOptions` 类型导出可用
