# DynamicGroup 拖拽感应外框（Sensor Outline）设计说明

**日期：** 2026-06-29  
**状态：** 已实现  
**关联：** [packages/extension/src/dynamic-group/](../../../packages/extension/src/dynamic-group/)、[2026-06-24-dynamic-group-membership-semantics-design.md](./2026-06-24-dynamic-group-membership-semantics-design.md)

## 目标

1. 修正 **sensor outline**（`getAppendAreaShape` / `groupAddable` 控制的橙色虚线框）在拖拽结束后残留的问题。
2. 明确该外框的语义：**仅作为拖拽过程中的 drop target 反馈**，非选中态、非常驻边框。
3. 通过 **`pluginsOptions.dynamicGroup.sensorOutline`** 支持配置高亮描边颜色与线宽，无需子类化 Model。

## 命名约定

| 名称 | 用途 |
| --- | --- |
| **`sensorOutline`** | 插件配置项（对外 API），表示拖拽感应高亮样式 |
| **`groupAddable`** | 内部 observable 状态，控制是否渲染感应外框（legacy，本期不改名） |
| **`getAddableOutlineStyle()`** | Model 方法，返回感应外框样式（legacy 方法名保留，避免 breaking change） |

## 非目标

- 修改 core 的 `outline` / `resizeOutline` 选中框体系
- 重命名 `groupAddable`、`getAddableOutlineStyle()` 等 legacy API
- 修改旧版 `materials/group` 插件（可后续对齐，本期仅 `dynamic-group`）
- 修改 Pool/Lane 的感应外框（Lane 复用 `getAddableOutlineStyle`，可后续单独跟进）
- 新增 strokeDasharray、fill、hover 等更多 theme 字段（除非实现时确有需求）

## 背景与现状

### 渲染

`DynamicGroupNode.getAppendAreaShape()` 在 `model.groupAddable === true` 时绘制 `<rect>`，样式来自 `model.getAddableOutlineStyle()`（默认 `#feb663`、`strokeWidth: 2`、`strokeDasharray: '4 4'`）。

### 状态驱动

| 阶段 | 逻辑位置 | 行为 |
| --- | --- | --- |
| 拖拽中进入可放入分组 | `setActiveGroup` → `setAllowAppendChild(true)` | 显示外框 |
| 拖拽中离开分组 | `setActiveGroup` 先对上一分组 `setAllowAppendChild(false)` | 外框消失 |
| 松手 drop | `onNodeDrop` → `addNodeToGroup` | **部分路径**调用 `setAllowAppendChild(false)` |
| 同组内移动后 drop | `addNodeToGroup` early return（#2412） | **未清除**，外框残留 |

插件**未**在 drag 结束事件上统一清理高亮，UI 状态与 membership 更新耦合，导致 early return 等路径下外框常驻。

## 已确认行为（用户确认）

| 时机 | 外框 |
| --- | --- |
| 拖拽中，节点进入可放入的分组 | 显示 |
| 拖拽中，移出分组 | 立即消失 |
| 松手（drop / mouseup） | 立即消失 |
| 分组选中 / 悬浮 / idle | 不显示 |

## 方案选择

采用 **拖拽结束统一清理**：

- 新增 `clearDragTargetHighlight()`，负责 `activeGroup?.setAllowAppendChild(false)` 并将 `activeGroup = undefined`。
- drag 过程中仍由 `setActiveGroup` 负责实时高亮与移出消失。
- membership 逻辑（`addNodeToGroup`）与 UI 反馈解耦；`addNodeToGroup` 内现有 `setAllowAppendChild(false)` 移除，由 drag-end 统一清理。

## Extension 配置

### 选项形状

在 `DynamicGroup.DynamicGroupOptions` 中新增：

```typescript
sensorOutline?: {
  /** 拖拽感应外框描边颜色，默认 '#feb663' */
  stroke?: string
  /** 拖拽感应外框线宽，默认 2 */
  strokeWidth?: number
}
```

### 使用示例

```typescript
lf.use(DynamicGroup, {
  sensorOutline: {
    stroke: '#2961EF',
    strokeWidth: 3,
  },
})
```

或 `pluginsOptions`：

```typescript
new LogicFlow({
  plugins: [DynamicGroup],
  pluginsOptions: {
    dynamicGroup: {
      sensorOutline: {
        stroke: '#2961EF',
        strokeWidth: 3,
      },
    },
  },
})
```

### 默认值

与当前硬编码保持一致：

| 字段 | 默认值 |
| --- | --- |
| `stroke` | `'#feb663'` |
| `strokeWidth` | `2` |
| `strokeDasharray` | `'4 4'`（固定，不暴露配置） |
| `fill` | `'transparent'`（固定） |

### 样式解析优先级

1. `pluginsOptions.dynamicGroup.sensorOutline` 中的字段
2. `DynamicGroupNodeModel.getAddableOutlineStyle()` 内置默认
3. 用户子类重写 `getAddableOutlineStyle()`（仍支持 per-type 定制，优先级高于插件配置）

实现建议：`DynamicGroupNodeModel.getAddableOutlineStyle()` 读取 `this.graphModel.dynamicGroup` 上合并后的 `sensorOutline` 配置，与默认值 merge 后返回。

### 类型

- 扩展 `DynamicGroup.DynamicGroupOptions`（含 `sensorOutline`）
- 在 `DynamicGroup` 插件实例上保存 `sensorOutline` 配置
- 扩展 `graphModel.dynamicGroup` 插件 API 类型（增加 `sensorOutline` 字段）

## 实现要点

### 1. `clearDragTargetHighlight()`

```typescript
clearDragTargetHighlight() {
  if (this.activeGroup) {
    this.activeGroup.setAllowAppendChild(false)
    this.activeGroup = undefined
  }
}
```

### 2. 事件绑定（`init` / `destroy` 对称）

| 事件 | 处理 |
| --- | --- |
| `node:drop` | 先 `clearDragTargetHighlight()`，再 `addNodeToGroup` |
| `node:mouseup` | `clearDragTargetHighlight()`（兜底：未触发 drop 或取消拖拽） |
| `selection:drop` | 先 `clearDragTargetHighlight()`，再处理多选 drop |
| `node:dnd-add` | 在 `addNodeToGroup` 之后或之前 `clearDragTargetHighlight()` |

**注意：** `node:drop` 与 `node:mouseup` 均在 core `StepDrag` 的 `Promise.resolve().then` 中触发；清理应 idempotent，多次调用无副作用。

**不**在 `node:drag` 末尾清理（会破坏拖拽过程中的实时高亮）。

### 3. `setActiveGroup`

保持现有逻辑不变。

### 4. `addNodeToGroup`

同组 early return（#2412）**不再承担** UI 清理责任；移除其中重复的 `setAllowAppendChild(false)`（由 drag-end 统一清理）。

### 5. 测试

在 `packages/extension/__test__/dynamic-group/` 增加或扩展用例：

| 场景 | 预期 `groupAddable` |
| --- | --- |
| 模拟 drag 进入分组 | `true` |
| 模拟 drag 离开分组 | `false` |
| `node:drop` 后（含同组内移动） | `false` |
| `node:mouseup` 无 drop | `false` |
| 配置 `sensorOutline.stroke` / `strokeWidth` | `getAddableOutlineStyle()` 返回对应值 |

`dynamic-group-regression` 示例可选：在 README 或某场景 steps 中说明拖拽高亮行为，非必须。

### 6. 文档与 CHANGELOG

- 更新 `sites/docs` dynamic-group 教程（`.zh.md` / `.en.md`）：说明 sensor outline 行为与 `sensorOutline` 配置
- `packages/extension/CHANGELOG.md`：**Fixed** 拖拽结束后感应外框残留；**Added** `sensorOutline` 配置项

## 风险与兼容性

| 项 | 说明 |
| --- | --- |
| 行为变更 | 修复 bug，不改变「仅拖拽时显示」的 intended 语义；对依赖「drop 后外框仍亮」的误用无兼容承诺 |
| `node:mouseup` 兜底 | 与 `node:drop` 可能同次拖拽连续触发；idempotent 清理无问题 |
| 自定义 Model | 重写 `getAddableOutlineStyle()` 的用户不受影响；插件配置为全局默认 |
| Legacy 方法名 | `getAddableOutlineStyle()` 保留，文档中注明与 `sensorOutline` 配置的关系 |

## 验收标准

1. 拖拽节点进入分组时显示感应外框，移出或松手后外框消失。
2. 同组内移动后松手，外框不残留。
3. `pluginsOptions.dynamicGroup.sensorOutline` 可配置 `stroke` 与 `strokeWidth`。
4. 未配置时使用现有默认色与线宽。
5. 单元测试覆盖上述场景。
