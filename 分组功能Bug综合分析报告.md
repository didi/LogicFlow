# LogicFlow 分组功能 Bug 综合分析报告

## 一、Group 与 DynamicGroup 定位与功能描述

### 1.1 DynamicGroup 定位

**官方描述**（来自 `dynamic-group.zh.md`）：
> "LogicFlow 支持动态分组。动态分组是 LogicFlow 内置的自定义节点，是 Group 分组的升级版本（因为我们内置了 Node Resize 功能，且 Group 分组的功能命名不够规范，所以我们推出了升级版的 DynamicGroup 节点）。我们会持续在该插件中做能力增强，欢迎大家一起参与共建。"

**核心功能**：
- 作为 LogicFlow 内置的自定义节点类型
- 支持动态调整分组大小（内置 Node Resize）
- 支持折叠/展开功能
- 支持限制子节点移动范围（isRestrict）
- 支持联动变换（transformWithContainer）
- 维护子节点与分组的映射关系（nodeGroupMap）

**数据格式**：
```typescript
type IGroupNodeProperties = {
  children?: string[]           // 子节点 ID 列表
  collapsible?: boolean         // 是否可折叠
  isCollapsed?: boolean         // 折叠状态
  isRestrict?: boolean          // 是否限制子节点移动
  autoResize?: boolean          // 是否自动调整大小
  width?: number                // 展开宽度
  height?: number               // 展开高度
  collapsedWidth?: number       // 折叠宽度
  collapsedHeight?: number      // 折叠高度
  transformWithContainer?: boolean // 联动变换
  zIndex?: number               // 层级
  autoToFront?: boolean         // 选中自动置顶
  isAllowAppendIn?: Function    // 允许添加校验
}
```

### 1.2 Group 定位

**官方描述**（来自 `group.zh.md`）：
> "`Group` 已进入废弃状态，不再推荐用于新项目。如果你正在新建或维护分组能力，请优先使用 [动态分组（Dynamic Group）](./dynamic-group.zh.md)。"

**状态**：已废弃，仅保留用于历史项目兼容与迁移参考。

---

## 二、Issue 列表汇总

> **更新说明（2026-05-18）**：重新查询 GitHub Open Issue，较原报告新增 **#2400**、**#2412**；并纳入 **2 项官方 Demo 体验问题**（未建 Issue，见 §2.2）。本期修复范围以 [设计说明](docs/superpowers/specs/2026-05-18-dynamic-group-fix-design.md) 为准。

### 2.1 GitHub Open Issue（16 个）

| 序号 | Issue 编号 | 标题 | 类型 | 状态 | 本期 |
|:---|:---|:---|:---|:---|:---|
| 1 | [#2395](https://github.com/didi/LogicFlow/issues/2395) | 动态分组插件 bug（分组折叠后删除线，展开后线又出现） | Bug | Open | ✅ |
| 2 | [#2399](https://github.com/didi/LogicFlow/issues/2399) | DynamicGroup 展开/收起后，用户手动调整的连线路径丢失 | Bug | Open | ✅ |
| 3 | [#2400](https://github.com/didi/LogicFlow/issues/2400) | DynamicGroup **收起时**手动调整的边路径丢失（重算最短路径） | Bug | Open | ✅（与 #2399 同批） |
| 4 | [#2401](https://github.com/didi/LogicFlow/issues/2401) | DynamicGroup 展开/折叠后，被拖拽过的边坐标计算出现 NaN，导致连线消失 | Bug | Open | ✅ |
| 5 | [#1809](https://github.com/didi/LogicFlow/issues/1809) | 分组扩展组件折叠时后连线的问题 | Bug | Open | ✅ |
| 6 | [#1616](https://github.com/didi/LogicFlow/issues/1616) | 分组节点默认折叠后，初始渲染分组节点位置混乱 | Bug | Open | ✅ |
| 7 | [#2198](https://github.com/didi/LogicFlow/issues/2198) | dynamic-group在render后节点位置发生偏移 | Bug | Open | ✅ |
| 8 | [#2205](https://github.com/didi/LogicFlow/issues/2205) | 分组组件进行格式化后，分组里面的组件全部跑出来了 | Bug | Open | ✅ |
| 9 | [#2332](https://github.com/didi/LogicFlow/issues/2332) | layout没有专门对分组做适配 | Bug | Open | ✅ |
| 10 | [#2194](https://github.com/didi/LogicFlow/issues/2194) | 移除动态分组中子节点并删除动态分组节点后，选中子节点报错 | Bug | Open | ✅ |
| 11 | [#2180](https://github.com/didi/LogicFlow/issues/2180) | Dynamic-group嵌套问题，adapterOut方法生成的xml嵌套错误 | Bug | Open | ❌ defer |
| 12 | [#1673](https://github.com/didi/LogicFlow/issues/1673) | addNode方法添加分组节点报错（嵌套分组支持） | Bug | Open | ✅ |
| 13 | [#2052](https://github.com/didi/LogicFlow/issues/2052) | 新创建的dynamic-group中的孩子节点会被之前创建的dynamic-group节点影响 | Bug | Open | ✅ |
| 14 | [#2412](https://github.com/didi/LogicFlow/issues/2412) | DynamicGroup 分组内节点异常出组（isRestrict + isAllowAppendIn=false） | Bug | Open | ✅ **新增** |
| 15 | [#1532](https://github.com/didi/LogicFlow/issues/1532) | 分组group变换形状以后，撤销需要撤销2次才能回到前一步的状态 | Bug | Open · 暂不修复 | ✅ |
| 16 | [#1555](https://github.com/didi/LogicFlow/issues/1555) | Feature: 可变形分组希望有单独改变宽度或高度的控制按钮 | Feature | Open · 暂不修复 | ✅ |

**#2400 与 #2399 关系**：#2400 强调「**收起**」时丢路径；#2399 强调「展开/收起」往返丢路径。根因均在 `collapseEdge` / 虚拟边对 `pointsList` 的处理，**本期与 #2399 一并修复**。

**#2412 摘要（新增）**：

- **场景**：`isRestrict: true` 且 `isAllowAppendIn` 恒为 `false`（禁止新节点入组、组内节点不应出组）。
- **现象**：组内节点拖动松手后脱离 `children` / `nodeGroupMap`，第二次拖动可拖出组外。
- **根因（初判）**：`addNodeToGroup`（`node:drop` 等）**先** `removeChild` 移出原组，再 `getGroupByBounds` + `isAllowAppendIn`；因返回 `false` 无法加回，成员关系丢失。
- **参考修复**：同组内拖放结束时若 bounds 仍在原组且 `isAllowAppendIn` 拒绝的是「外来节点」而非「已有子节点」，应 **跳过重分配**（社区 PR 思路见 [tinysimple/LogicFlowGroupFixPage](https://github.com/tinysimple/LogicFlowGroupFixPage)）。
- **复现**：[LogicFlowGroupBugShow](https://tinysimple.github.io/LogicFlowGroupBugShow/)

### 2.2 本期纳入、未建 GitHub Issue（官方 Demo 体验）

| 编号 | 问题描述 | 类型 | 初判关联 |
|:---|:---|:---|:---|
| **LOCAL-1** | 动态分组**内部节点**与**分组框**的**图层（zIndex）不一致**，子节点可能绘制在分组之上或之下，与预期「组在底、子在组内可视层级」不符 | Bug | `sendNodeToFront` / 分组默认 `zIndex=-10000`、子节点未随组统一校准 |
| **LOCAL-2** | **两个 dynamic-group 叠放**时，折叠/展开 **分组 1**，其内部节点可能 **归属错误地变成分组 2** 的子节点 | Bug | `getGroupByBounds` 按 zIndex 取最上层组；折叠改变组 1 尺寸/位置后，子节点 bounds 落入组 2，`addNodeToGroup` 重分配（关联 #2052、叠放场景） |

**LOCAL-2 复现要点**：两分组部分重叠 → 组 1 含节点 A → 折叠/展开组 1 → 检查 A 的 `children` 归属与 `nodeGroupMap`。

---

## 三、Issue 根因分析与修复方案

### Issue [#2395](https://github.com/didi/LogicFlow/issues/2395): 动态分组插件 bug

**问题描述**：分组折叠后删除连线，展开后连线又出现了。

**复现步骤**：
1. 手动添加一个圆形节点
2. 连一条线到 dynamic-group 分组节点（分组为非展开状态）
3. 选中线删除
4. 展开分组，线又出来了

**根因定位**：`packages/extension/src/dynamic-group/model.ts` `collapseEdge()` 方法

```typescript
// 当前代码问题
if (collapse && edge.visible) {
  edge.visible = false  // 只隐藏，未真正删除
}
if (!collapse && !edge.visible) {
  edge.visible = true  // 恢复所有隐藏的边，未判断是否已被用户删除
}
```

**问题分析**：
1. 折叠时边只是设置 `visible = false`，没有真正删除
2. 用户删除边后，`collapsedEdgeIds` 中仍记录着该边 ID
3. 展开时无条件恢复所有之前隐藏的边，包括已被删除的边

**修复方案**：

**方案 A：展开前验证边存在性**
```typescript
if (!collapse) {
  this.collapsedEdgeIds.forEach(edgeId => {
    const edge = this.graphModel.getEdgeModelById(edgeId)
    if (edge) {  // 边仍然存在才恢复
      edge.visible = true
    }
  })
  this.collapsedEdgeIds.clear()
}
```

**方案 B：监听边删除事件清理记录**
```typescript
// 在 DynamicGroup 插件中监听边删除
lf.on('edge:delete', ({ data }) => {
  graphModel.nodes.forEach(node => {
    if (node.isGroup && node.collapsedEdgeIds?.has(data.id)) {
      node.collapsedEdgeIds.delete(data.id)
    }
  })
})
```

**方案 C：使用 EdgeConfig 备份而非 ID**
```typescript
// 折叠时保存完整的 EdgeConfig
collapse() {
  this.collapsedEdgeConfigs = edges.map(e => e.getData())
}
// 展开时根据配置判断
expand() {
  this.collapsedEdgeConfigs.forEach(config => {
    if (!this.graphModel.getEdgeModelById(config.id)) {
      // 边已被删除，不恢复
    } else {
      this.graphModel.getEdgeModelById(config.id).visible = true
    }
  })
}
```

**补充验证（Codex）**：
- ✅ 源码已证实关键链路：`toggleCollapse()` 最终调用 `collapseEdge()`，且当前实现在收起时执行 `edge.visible = false`、展开时执行 `edge.visible = true`（`packages/extension/src/dynamic-group/model.ts`）。
- ✅ 风险点判断正确：展开分支没有显式“边是否仍存在于图数据中”的额外判定，属于已知薄弱点。
- 🔎 建议补充一个回归维度：`deleteEdge` 与 `history undo/redo` 组合场景，避免“删除后恢复/撤销后重复恢复”。
- **结论**：原分析方向正确，可作为该问题主修复思路。

---

### Issue [#2399](https://github.com/didi/LogicFlow/issues/2399): DynamicGroup 展开/收起后，用户手动调整的连线路径丢失

**问题描述**：用户手动拖拽调整折线路径后，对分组收起再展开，连线的 `pointsList` 被重置为自动计算的路径，自定义形状丢失。

**根因定位**：`packages/extension/src/dynamic-group/model.ts` 边路径处理逻辑

```typescript
// 问题：展开时重新计算边路径，覆盖用户手动调整的路径
createVirtualEdge(edgeConfig: EdgeConfig) {
  edgeConfig.pointsList = undefined  // 强制清除路径数据
  const virtualEdge = this.graphModel.addEdge(edgeConfig)
  virtualEdge.virtual = true
}
```

**问题分析**：
1. 折叠时创建虚拟边，清除了原始边的 `pointsList`
2. 展开时恢复原始边，但 `pointsList` 已被重置
3. LogicFlow 自动计算新路径，覆盖用户手动调整的形状

**修复方案**：

**方案 A：折叠前保存原始 pointsList**
```typescript
collapse() {
  edges.forEach(edge => {
    // 保存用户手动调整的路径
    this.originalPointsList.set(edge.id, edge.pointsList)
    edge.visible = false
  })
}
expand() {
  edges.forEach(edge => {
    edge.visible = true
    // 恢复原始路径
    if (this.originalPointsList.has(edge.id)) {
      edge.pointsList = this.originalPointsList.get(edge.id)
    }
  })
}
```

**方案 B：不修改原始边的 pointsList**
```typescript
// 折叠时只在虚拟边上计算新路径，不修改原始边
createVirtualEdge(edgeConfig: EdgeConfig) {
  const virtualConfig = { ...edgeConfig }
  virtualConfig.pointsList = undefined  // 只清除虚拟边的路径
  virtualConfig.id = `virtual_${edgeConfig.id}`  // 使用不同 ID
  const virtualEdge = this.graphModel.addEdge(virtualConfig)
  virtualEdge.virtual = true
}
```

**方案 C：使用 EdgeConfig 完整备份**
```typescript
// 折叠前完整备份边配置
collapse() {
  this.edgeBackup = edges.map(e => ({
    id: e.id,
    pointsList: e.pointsList,  // 保留用户调整的路径
    startPoint: e.startPoint,
    endPoint: e.endPoint,
    type: e.type,
    text: e.text
  }))
}
```

**补充验证（Codex）**：
- ✅ 源码已证实核心现象：`createVirtualEdge(edgeConfig)` 内部明确执行 `edgeConfig.pointsList = undefined`，会触发路径信息丢失风险（`packages/extension/src/dynamic-group/model.ts`）。
- ✅ “用户手调路径被覆盖”的问题判断成立，且与折叠/展开虚拟边策略直接相关。
- 🔎 建议补一个判断条件：若真实边 `pointsList` 存在且非自动路径，应优先保真，不参与重算。
- **结论**：原结论准确，优先级应保持高位。

---

### Issue [#2401](https://github.com/didi/LogicFlow/issues/2401): DynamicGroup 展开/折叠后，被拖拽过的边坐标计算出现 NaN，导致连线消失

**问题描述**：分组展开/折叠后，被拖拽过的边坐标出现 NaN，连线消失。

**根因定位**：边坐标计算逻辑，可能在处理用户拖拽后的自定义坐标时出现计算错误。

**问题分析**：
1. 用户拖拽边后，边的某些坐标点可能不在标准位置
2. 折叠/展开时坐标转换计算未处理自定义点
3. 可能出现 `undefined - undefined` 导致 NaN

**修复方案**：

**方案 A：增加 NaN 校验**
```typescript
const calculateNewPoint = (point, offset) => {
  const x = point.x !== undefined ? point.x + offset.x : 0
  const y = point.y !== undefined ? point.y + offset.y : 0
  // NaN 校验
  if (isNaN(x) || isNaN(y)) {
    return getDefaultPoint()
  }
  return { x, y }
}
```

**方案 B：保留原始坐标不变**
```typescript
// 展开时，如果边有自定义路径，不重新计算
expand() {
  edges.forEach(edge => {
    if (edge.pointsList && edge.pointsList.length > 2) {
      // 用户自定义路径，只调整起点终点，不重算中间点
      this.adjustEdgeEndpoints(edge)
    } else {
      // 自动路径，重新计算
      this.recalculateEdgePath(edge)
    }
  })
}
```

**方案 C：边界情况处理**
```typescript
// 在坐标计算前检查数据有效性
if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
  console.warn('Invalid point detected, using fallback')
  return fallbackPoint
}
```

**补充验证（Codex）**：
- ⚠️ 该条当前更多是“高概率推断”，源码中未直接看到导致 NaN 的单一语句，但与边重建、端点清空、路径重算链路高度一致。
- ✅ 与 `#2399` 共享同一风险面：虚拟边创建时清空路径，再次计算时若输入点不完整，容易出现异常坐标。
- 🔎 建议补充最小复现矩阵：`拖拽折线 -> 折叠 -> 展开 -> 再拖拽`，并在坐标计算入口做 `Number.isFinite` 断言日志。
- **结论**：问题归因方向合理，但需用测试进一步锁定 NaN 的精确触发点。

---

### Issue [#1809](https://github.com/didi/LogicFlow/issues/1809): 分组扩展组件折叠时后连线的问题

**问题描述**：分组和动态分组在折叠时被连线后展开，连线终点不随锚点移动。

**根因定位**：分组折叠时锚点位置变化，但连线终点未同步更新。

**问题分析**：
1. 折叠时分组锚点位置从展开状态的中心变为折叠状态的中心
2. 连接分组的边终点仍指向原锚点位置
3. 展开时锚点位置恢复，但边终点未更新

**修复方案**：

**方案 A：折叠时更新边的端点**
```typescript
collapse() {
  // 更新连接分组的边的端点
  edges.forEach(edge => {
    if (edge.targetNodeId === this.id || edge.sourceNodeId === this.id) {
      // 重新计算端点位置
      this.updateEdgeEndpoint(edge)
    }
  })
}
```

**方案 B：使用动态锚点**
```typescript
// 锚点位置随分组状态动态计算
getAnchorPosition(anchorId) {
  if (this.isCollapsed) {
    return this.getCollapsedAnchorPosition(anchorId)
  }
  return this.getExpandedAnchorPosition(anchorId)
}
```

**方案 C：展开时重新定位边**
```typescript
expand() {
  // 遍历所有连接分组的边，重新定位
  this.getConnectedEdges().forEach(edge => {
    edge.recalculatePosition()
  })
}
```

**补充验证（Codex）**：
- ✅ “锚点随节点几何变化”这一点已被核心模型证实：节点 `anchors` 会基于当前 `x/y/width/height/rotate` 动态计算（`packages/core/src/model/node/BaseNodeModel.ts`）。
- ✅ 报告中的关键判断成立：分组折叠会改 `x/y/width/height`，若边端点未同步，视觉上就是“终点不跟随锚点”。
- ℹ️ 额外事实：DynamicGroup 只是把锚点样式设为透明，不是移除锚点；问题本质不是“无锚点”，而是“端点重建同步不足”。
- **结论**：原分析正确，建议作为低优先级但保留技术债记录。

---

### Issue [#1616](https://github.com/didi/LogicFlow/issues/1616): 分组节点默认折叠后，初始渲染分组节点位置混乱

**问题描述**：`getGraphData` 方法获取的分组节点 `properties` 缺失 `isFolded` 属性，初始渲染时节点没有折叠，位置混乱。

**根因定位**：`packages/extension/src/dynamic-group/node.ts` `graphRendered()` 钩子

```typescript
graphRendered = () => {
  if (model.isCollapsed) {
    model.toggleCollapse(true)  // 渲染后触发折叠
  }
}
```

**问题分析**：
1. 数据中 `isFolded/isCollapsed: true` 表示期望初始状态为折叠
2. 但 `graphRendered` 在渲染后才触发 `toggleCollapse(true)`
3. 渲染时节点和边已按展开状态创建，导致位置混乱
4. `getGraphData` 未正确保存折叠状态属性

**修复方案**：

**方案 A：在 initNodeData 中预设折叠状态**
```typescript
initNodeData(data) {
  super.initNodeData(data)
  if (data.properties?.isCollapsed) {
    // 初始化时直接设置为折叠尺寸
    this.width = data.properties.collapsedWidth || DEFAULT_COLLAPSE_WIDTH
    this.height = data.properties.collapsedHeight || DEFAULT_COLLAPSE_HEIGHT
    // 预设展开尺寸
    this.expandWidth = data.properties.width || DEFAULT_EXPAND_WIDTH
    this.expandHeight = data.properties.height || DEFAULT_EXPAND_HEIGHT
    // 子节点初始隐藏
    this.children.forEach(childId => {
      const child = this.graphModel.getNodeModelById(childId)
      if (child) child.visible = false
    })
  }
}
```

**方案 B：getData 时保存折叠状态**
```typescript
getData() {
  const data = super.getData()
  data.properties.isCollapsed = this.isCollapsed
  data.properties.isFolded = this.isCollapsed  // 兼容旧属性名
  return data
}
```

**方案 C：渲染前预处理数据**
```typescript
// 在 render() 前预处理分组数据
lf.render = (data) => {
  data.nodes.forEach(node => {
    if (node.type === 'dynamic-group' && node.properties?.isCollapsed) {
      node.width = node.properties.collapsedWidth
      node.height = node.properties.collapsedHeight
      node.properties.children?.forEach(childId => {
        const child = data.nodes.find(n => n.id === childId)
        if (child) child.visible = false
      })
    }
  })
  super.render(data)
}
```

**补充验证（Codex）**：
- ✅ 源码已证实初始化链路：`graph:rendered` 后若 `isCollapsed`，会主动 `toggleCollapse(true)`（`packages/extension/src/dynamic-group/node.ts`）。
- ✅ 这会导致“先按展开态初始化、再折叠态修正”的时序问题，与报告描述一致。
- 🔎 建议补一条兼容性说明：`isFolded`（旧字段）与 `isCollapsed`（新字段）双写/双读策略需统一，避免历史数据回放异常。
- **结论**：原判断准确，修复应优先放在初始化阶段而非渲染后补偿。

---

### Issue [#2198](https://github.com/didi/LogicFlow/issues/2198): dynamic-group在render后节点位置发生偏移

**问题描述**：render 前坐标为 (530, 145)，render 后变为 (360, 50)，发生偏移。

**问题分析**：
1. 坐标偏移量：x 减少 170 = (210 - 40)，y 减少 95 = (125 - 30)
2. 偏移量正好是 `(展开width/2 - 折叠width/2)` 和 `(展开height/2 - 折叠height/2)`
3. 说明渲染时按展开状态计算位置，然后又按折叠状态调整
4. 位置计算逻辑不一致

**根因定位**：`packages/extension/src/dynamic-group/model.ts` 坐标计算逻辑

**修复方案**：

**方案 A：统一坐标计算基准**
```typescript
// 节点坐标始终基于展开状态计算
initNodeData(data) {
  this.x = data.x  // 保存原始坐标
  this.y = data.y
  
  if (this.isCollapsed) {
    // 折叠时不调整坐标，只调整显示尺寸
    this.displayWidth = this.collapsedWidth
    this.displayHeight = this.collapsedHeight
  }
}
```

**方案 B：修复 graphRendered 钩子**
```typescript
graphRendered = () => {
  if (model.isCollapsed) {
    // 不调用 toggleCollapse，直接设置显示状态
    model.setCollapsedDisplay(true)
  }
}
```

**方案 C：坐标偏移补偿**
```typescript
collapse() {
  // 计算偏移并补偿
  const offsetX = (this.expandWidth - this.collapsedWidth) / 2
  const offsetY = (this.expandHeight - this.collapsedHeight) / 2
  this.x += offsetX
  this.y += offsetY
}
```

**补充验证（Codex）**：
- ✅ 用户 issue 留言与源码高度吻合：`collapse()` 会按 `(展开尺寸/2 - 折叠尺寸/2)` 直接调整 `x/y`，偏移量计算与现象一致（`packages/extension/src/dynamic-group/model.ts`）。
- ✅ `#2198` 评论中也已确认“初始 isCollapsed 导致 collapse 触发并改写坐标”，与报告一致。
- 🔎 建议补一个序列化一致性检查：`render -> getData -> re-render` 前后坐标应保持可逆。
- **结论**：原分析正确，且有外部用户留言佐证。

---

### Issue [#2205](https://github.com/didi/LogicFlow/issues/2205): 分组组件进行格式化后，分组里面的组件全部跑出来了

**问题描述**：使用布局格式化（如 dagre）后，分组内的子节点位置错误，跑出分组范围。

**根因定位**：`packages/layout/src/dagre/index.ts` 第 116-122 行

```typescript
nodes.forEach((node: BaseNodeModel) => {
  g.setNode(node.id, { width: node.width || 150, height: node.height || 50 })
  // 未处理 node.children 或 node.isGroup
})
```

**问题分析**：
1. Dagre 布局将分组和子节点都作为独立节点加入图
2. 分组内子节点应该相对于分组定位，而非全局定位
3. 分组本身应该作为一个整体参与布局

**修复方案**：

**方案 A：预处理分组节点**
```typescript
const processGroups = (nodes: BaseNodeModel[]) => {
  const groupNodes = nodes.filter(n => n.isGroup)
  const normalNodes = nodes.filter(n => !n.isGroup && !getGroupByNodeId(n.id))
  
  // 计算分组的实际尺寸（包含所有子节点）
  groupNodes.forEach(group => {
    const bounds = calculateGroupBounds(group)
    group.width = bounds.width
    group.height = bounds.height
  })
  
  return [...groupNodes, ...normalNodes]
}

// 布局时只处理分组，子节点相对定位
nodes.forEach(node => {
  if (node.isGroup) {
    g.setNode(node.id, { width: node.width, height: node.height })
  }
})
```

**方案 B：布局后调整子节点位置**
```typescript
// Dagre 布局完成后
const layoutResult = dagre.layout(g)

// 调整分组内子节点位置
nodes.forEach(node => {
  if (node.isGroup) {
    const groupPos = layoutResult[node.id]
    node.children.forEach(childId => {
      const child = getNodeModelById(childId)
      child.x = groupPos.x + (child.relativeX || 0)
      child.y = groupPos.y + (child.relativeY || 0)
    })
  }
})
```

**方案 C：嵌套布局策略**
```typescript
// 先布局分组和普通节点
const outerNodes = nodes.filter(n => !n.isGroup || !getGroupByNodeId(n.id))
dagre.layout(outerNodes)

// 再对每个分组内部单独布局
groups.forEach(group => {
  const innerNodes = getChildrenNodes(group)
  dagre.layout(innerNodes, { rankdir: 'TB' })
})
```

**补充验证（Codex）**：
- ✅ 报告归因方向正确：layout 对 group/child 的分层语义没有内建完整适配时，子节点“跑出分组”是典型结果。
- ⚠️ 但具体行号实现细节可能随版本变化，建议以“布局阶段是否区分 group 与 normal node”做抽象断言，不依赖单行代码。
- 🔎 建议补充：和 `#2332` 统一成一个“分组布局能力缺口”父问题，减少重复修复。
- **结论**：原结论合理，建议与 `#2332` 合并方案与测试。

---

### Issue [#2332](https://github.com/didi/LogicFlow/issues/2332): layout没有专门对分组做适配

**问题描述**：布局插件未对分组节点做专门适配，导致布局结果混乱。

**根因定位**：`packages/layout/src/dagre/index.ts` 未处理分组逻辑

**问题分析**：与 #2205 问题本质相同，需要统一修复布局对分组的支持。

**修复方案**：参见 Issue #2205 的修复方案。

**补充验证（Codex）**：
- ✅ 与 `#2205` 判定为同题是合理的，均指向 layout 对分组语义缺失。
- 🔎 建议在 issue 追踪中明确“是否包含嵌套分组布局”范围，避免一期/二期目标混淆。
- **结论**：原结论正确，适合并案处理。

---

### Issue [#2194](https://github.com/didi/LogicFlow/issues/2194): 移除动态分组中子节点并删除动态分组节点后，选中子节点报错

**问题描述**：移除动态分组中的子节点后删除动态分组节点，再选中原来的子节点会报错。

**根因定位**：`packages/extension/src/dynamic-group/model.ts` `removeChild()` 方法

```typescript
removeChild(id: string) {
  this.children.delete(id)
  this.graphModel.eventCenter.emit('group:remove-node', { data: groupData })
  // 缺失：this.graphModel.dynamicGroup.nodeGroupMap.delete(id)
}
```

**问题分析**：
1. `removeChild()` 只更新了 `this.children`（Set）
2. 未同步清理 `dynamicGroup.nodeGroupMap`（Map）
3. 导致后续 `getGroupByNodeId()` 返回错误的分组信息
4. 分组删除后，`nodeGroupMap` 中仍指向已删除的分组

**修复方案**：

**方案 A：在 removeChild 中清理 nodeGroupMap**
```typescript
removeChild(id: string) {
  this.children.delete(id)
  // 同步清理 nodeGroupMap
  if (this.graphModel.dynamicGroup) {
    this.graphModel.dynamicGroup.nodeGroupMap.delete(id)
  }
  this.graphModel.eventCenter.emit('group:remove-node', { data: groupData })
}
```

**方案 B：统一在插件层处理**
```typescript
// 在 DynamicGroup 插件的 removeNodeFromGroup 中统一处理
removeNodeFromGroup(nodeId: string, groupId: string) {
  const groupModel = this.graphModel.getNodeModelById(groupId)
  if (groupModel?.isGroup) {
    groupModel.children.delete(nodeId)
    this.nodeGroupMap.delete(nodeId)
  }
}
```

**方案 C：监听 group:remove-node 事件清理**
```typescript
lf.on('group:remove-node', ({ data, childId }) => {
  this.nodeGroupMap.delete(childId)
})
```

**补充验证（Codex）**：
- ✅ 源码已证实 `removeChild()` 当前只删 `children` 并发事件，未直接清理 `nodeGroupMap`（`packages/extension/src/dynamic-group/model.ts`）。
- ✅ 因此“映射残留导致后续选中/查询异常”的链路判断成立。
- 🔎 建议补一个兜底：删除 group 节点时批量清理其所有 child 的映射，避免只靠单点 removeChild。
- **结论**：原分析准确，修复价值高且实现成本低。

---

### Issue [#2180](https://github.com/didi/LogicFlow/issues/2180): Dynamic-group嵌套问题，adapterOut方法生成的xml嵌套错误

**问题描述**：嵌套3层以上的动态分组节点，生成的 xml 文件格式有误。

**根因定位**：`packages/extension/src/bpmn-elements-adapter/index.ts` `convertLf2ProcessData()` 方法

```typescript
// 当前实现只处理一层 subProcess
convertLf2ProcessData(nodes) {
  nodes.forEach(node => {
    if (node.type === 'subProcess') {
      // 只处理直接子节点，未递归处理嵌套的 subProcess
    }
  })
}
```

**问题分析**：
1. BPMN 标准 subProcess 可以嵌套
2. 当前适配器假设 subProcess 只包含普通任务节点
3. 嵌套 subProcess 被当作普通节点处理，丢失分组语义

**修复方案**：

**方案 A：递归处理 subProcess**
```typescript
convertLf2ProcessData(nodes, parentGroup?: string) {
  const result = []
  
  nodes.forEach(node => {
    if (node.type === 'subProcess') {
      const subProcessData = {
        id: node.id,
        name: node.text,
        children: []
      }
      
      // 递归处理子节点（包括嵌套的 subProcess）
      const childNodes = getChildrenNodes(node.id)
      subProcessData.children = convertLf2ProcessData(childNodes, node.id)
      
      result.push(subProcessData)
    }
  })
  
  return result
}
```

**方案 B：预处理为树形结构**
```typescript
// 先构建分组树
const groupTree = buildGroupTree(nodes)

// 按树形结构导出
const exportBpmn = (groupNode) => {
  if (groupNode.type === 'subProcess') {
    return {
      id: groupNode.id,
      children: groupNode.children.map(c => 
        c.isGroup ? exportBpmn(c) : convertNode(c)
      )
    }
  }
}
```

**方案 C：使用 BPMN 官方库处理**
- 引入 `bpmn-js` 或 `bpmn-moddle` 处理嵌套结构
- 参考 BPMN 2.0 规范处理 multi-level subProcess

**补充验证（Codex）**：
- ✅ 该分析与“嵌套语义传递到 adapterOut”的方向一致，问题不只在导出函数，也取决于上游是否稳定支持多层 group。
- ⚠️ 当前报告把它当“导出 bug”描述是成立的，但若产品决定支持嵌套，应同步补齐“数据模型 + 运行态 + 导出”三段链路。
- 🔎 结合你最新决策（要支持嵌套）：建议把该问题升级为“能力缺失补全”，不再仅按局部 bug 修。
- **结论**：原结论在现状下成立，但在“决定支持嵌套”后，范围应扩大为系统性改造项。

---

### Issue [#1673](https://github.com/didi/LogicFlow/issues/1673): addNode方法添加分组节点报错

**问题描述**：调用 addNode 方法添加分组节点（包含子节点）时，控制台报错 `Cannot read properties of undefined (reading 'isGroup')`。

**根因定位**：`packages/core/src/model/GraphModel.ts` `addNode()` 方法

```typescript
addNode(nodeConfig) {
  // 未处理节点包含 children 的情况
  const nodeModel = this.getModelAfterSnapToGrid(nodeConfig)
  // nodeModel.children 中的子节点可能尚未创建
}
```

**问题分析**：
1. 分组节点包含 `children` 属性
2. `addNode` 时子节点可能尚未添加到 graphModel
3. 尝试访问未创建子节点的 `isGroup` 属性报错

**修复方案**：

**方案 A：先添加子节点**
```typescript
addNode(nodeConfig) {
  if (nodeConfig.children?.length > 0) {
    // 先添加子节点
    nodeConfig.children.forEach(childId => {
      const childConfig = this.getNodeConfigById(childId)
      if (childConfig && !this.getNodeModelById(childId)) {
        this.addNode(childConfig)
      }
    })
  }
  // 再添加分组节点
  return super.addNode(nodeConfig)
}
```

**方案 B：延迟处理 children**
```typescript
addNode(nodeConfig) {
  const children = nodeConfig.children
  nodeConfig.children = []  // 先不处理 children
  
  const nodeModel = super.addNode(nodeConfig)
  
  // 添加成功后再处理 children
  if (children?.length > 0) {
    children.forEach(childId => {
      nodeModel.addChild(childId)
    })
  }
  
  return nodeModel
}
```

**方案 C：添加 isGroup 检查**
```typescript
// 在访问 isGroup 前检查节点是否存在
if (childNode && childNode.isGroup) {
  // 处理嵌套分组
}
```

**补充验证（Codex）**：
- ✅ 作为嵌套相关问题，报告将其与 `#2180` 关联是合理的。
- ⚠️ 单纯 `isGroup` 判空只能止血，不能完整解决“父子创建顺序+映射一致性”问题。
- 🔎 若确定支持嵌套，建议引入“两阶段构图”（先建节点索引，再建父子关系）作为稳态方案。
- **结论**：原分析方向正确，但修复深度建议提升。

---

### Issue [#2052](https://github.com/didi/LogicFlow/issues/2052): 新创建的dynamic-group中的孩子节点会被之前创建的dynamic-group节点影响

**问题描述**：新创建的 dynamic-group 的 children 属性为空，但子节点被之前创建的分组影响。

**根因定位**：`nodeGroupMap` 全局状态管理问题

**问题分析**：
1. `nodeGroupMap` 是全局 Map，存储所有节点到分组的映射
2. 新分组创建时未正确初始化 children
3. 旧分组的映射可能污染新分组的状态

**修复方案**：

**方案 A：清理旧映射**
```typescript
addNode(nodeConfig) {
  if (nodeConfig.type === 'dynamic-group') {
    // 清理旧分组对该节点的映射
    nodeConfig.children?.forEach(childId => {
      this.nodeGroupMap.delete(childId)
    })
  }
  
  const nodeModel = super.addNode(nodeConfig)
  
  // 重建正确的映射
  nodeModel.children?.forEach(childId => {
    this.nodeGroupMap.set(childId, nodeModel.id)
  })
}
```

**方案 B：使用分组专用 Map**
```typescript
// 每个分组维护自己的 children Set
class DynamicGroupNodeModel {
  private _children: Set<string>  // 分组私有
  
  addChild(id: string) {
    this._children.add(id)
    // 只更新全局映射，不依赖它
  }
}
```

**方案 C：初始化时同步 children**
```typescript
initNodeData(data) {
  this.children = new Set(data.children || [])
  // 立即同步到 nodeGroupMap
  this.children.forEach(childId => {
    this.graphModel.dynamicGroup.nodeGroupMap.set(childId, this.id)
  })
}
```

**补充验证（Codex）**：
- ✅ 报告指出 `nodeGroupMap` 全局状态污染风险，这与当前实现模式一致，判断可信。
- ✅ 与 `#2194` 同属“映射一致性”问题，合并修复策略正确。
- 🔎 建议增加 invariants：任意时刻每个 child 只能映射到一个 group，且 group 删除后映射必须为 `undefined`。
- **结论**：原结论基本正确，建议补自动化断言测试。

---

### Issue [#1532](https://github.com/didi/LogicFlow/issues/1532): 分组group变换形状以后，撤销需要撤销2次才能回到前一步的状态

**问题描述**：分组变换形状后，撤销操作需要执行两次才能恢复。

**根因定位**：分组 Resize 操作可能产生了两个历史记录。

**问题分析**：
1. Resize 可能触发多个操作（尺寸变化 + 子节点位置调整）
2. 每个操作都产生独立的历史记录
3. 撤销时需要逐个撤销

**修复方案**：

**方案 A：合并历史记录**
```typescript
resize(newWidth, newHeight) {
  // 使用批量操作，只产生一个历史记录
  this.graphModel.history.batch(() => {
    this.width = newWidth
    this.height = newHeight
    this.adjustChildrenPosition()
  })
}
```

**方案 B：单次记录多属性**
```typescript
resize(newWidth, newHeight) {
  // 同时记录所有变化
  this.graphModel.history.record({
    type: 'group:resize',
    data: {
      id: this.id,
      oldWidth: this.width,
      oldHeight: this.height,
      newWidth,
      newHeight,
      oldChildrenPositions: this.getChildrenPositions(),
    }
  })
}
```

**方案 C：分组 Resize 使用专用方法**
```typescript
// 提供专门的分组 Resize 方法
lf.resizeGroup(groupId, newWidth, newHeight)
```

**补充验证（Codex）**：
- ⚠️ 该问题目前偏“机制推断”：报告认为一次交互产生了两条历史记录，方向合理，但需日志/测试确认触发链。
- 🔎 建议先加 history 埋点（操作类型、次数、来源事件），再决定是 batch 合并还是专用 API。
- **结论（2026-06-23）**：默认快速 resize 通常一次 undo 即可；慢速拖动因 history debounce 可能多条。**关闭 · 暂不修复**（`resolution: wontfix`），见 [issue 评论](https://github.com/didi/LogicFlow/issues/1532#issuecomment-4779507145)。

---

### Issue [#1555](https://github.com/didi/LogicFlow/issues/1555): Feature: 可变形分组希望有单独改变宽度或高度的控制按钮

**问题描述**：Feature Request - 希望分组四个边的中间有单独改变宽度或高度的控制按钮。

**修复方案**：

**方案 A：添加边缘控制点**
```typescript
// 在分组节点 View 中添加边缘控制点
getResizeControls() {
  return [
    { position: 'top', type: 'height-only' },
    { position: 'bottom', type: 'height-only' },
    { position: 'left', type: 'width-only' },
    { position: 'right', type: 'width-only' },
    { position: 'corners', type: 'both' }
  ]
}
```

**方案 B：扩展 Node Resize 插件**
- 在 Node Resize 插件中添加边缘控制点选项
- 配置 `edgeResize: true` 启用边缘单独调整

**补充验证（Codex）**：
- ✅ 这是典型能力增强而非缺陷修复，低优先级判断合理。
- 🔎 若后续支持嵌套分组，建议把该需求放在“分组交互能力二期”，避免与核心稳定性修复抢资源。
- **结论（2026-06-23）**：全图可缩放节点（含 dynamic-group）统一为四角 resize，分组无特殊边中点控件。**关闭 · 暂不修复**（`resolution: wontfix`），见 [issue 评论](https://github.com/didi/LogicFlow/issues/1555)。

---

## 四、Issue 关系分析

### 4.1 正向关联（可一起修复）

| 关联组 | Issue | 关联原因 |
|:---|:---|:---|
| 边状态管理组 | #2395, #2399, **#2400**, #2401, #1809 | 都涉及折叠/展开时边的状态处理，核心逻辑在同一方法 `collapseEdge()` |
| 分组关系维护组 | #2194, #2052, **#2412**, **LOCAL-2** | `nodeGroupMap` / `children` / `addNodeToGroup` 拖放结束重分配 |
| 分组图层组 | **LOCAL-1** | 分组与子节点 zIndex 不同步 |
| 布局适配组 | #2205, #2332 | 同一问题，布局插件未处理分组 |
| 嵌套支持组 | #2180, #1673 | 都涉及多层级分组的结构设计 |
| 初始渲染组 | #1616, #2198 | 都涉及分组初始状态渲染问题 |

### 4.2 负向关联（修复方案冲突）

| 冲突组 | Issue | 冲突说明 |
|:---|:---|:---|
| 边恢复策略 | #2395 vs #2399 | #2395 需判断边是否删除再恢复，#2399 需保留自定义路径；方案需统一处理 |

### 4.3 依赖关系

| 依赖 | 说明 |
|:---|:---|
| 边状态管理 → 边路径保留 | 先修复边的存在性判断（#2395），再修复路径保留（#2399） |
| 嵌套支持 → BPMN适配 | 多层级嵌套支持（#1673）是 BPMN 多层级（#2180）的前提 |
| 布局适配独立 | #2205/#2332 布局问题独立，不依赖其他修复 |

---

## 五、修复建议总结

### 5.1 修复顺序建议

1. **第一批（边状态核心问题）**：#2395, #2399, **#2400**, #2401, #1809
2. **第二批（分组关系维护）**：#2194, #2052, **#2412**, **LOCAL-2**
3. **第三批（初始渲染 + 图层）**：#1616, #2198, **LOCAL-1**
4. **第四批（布局适配）**：#2205, #2332
5. **第五批（其他）**：#1673, #1532, #1555
6. **本期不做**：#2180（BPMN adapter 嵌套导出）

### 5.2 关键设计决策点

以下决策点需要在修复前确定：

1. **边状态管理策略**：
   - 选择"边隐藏 + 存在性验证"方案，还是"边备份 + 恢复"方案
   - 影响范围：#2395, #2399, #2401, #1809

2. **分组关系持久化策略**：
   - `nodeGroupMap` 与 `children` 同步时机
   - 影响范围：#2194, #2052

3. **嵌套支持决策**：
   - 是否支持多层级嵌套？若支持，需重构 nodeGroupMap 结构
   - 影响范围：#1673, #2180

4. **布局集成策略**：
   - 分组在布局中作为整体还是拆分为子节点？
   - 影响范围：#2205, #2332

### 5.3 统一修复原则

1. **状态一致性**：确保 `isCollapsed`、`children`、`nodeGroupMap`、边状态在任何操作后保持一致
2. **数据完整性**：`getData()` 应正确保存所有分组状态属性
3. **初始化处理**：`isCollapsed: true` 的初始折叠应在数据层面处理，而非渲染后触发
4. **历史记录合并**：分组相关操作应合并为单次历史记录

---

## 六、废弃 Group 插件迁移提示

由于 Group 插件已废弃，建议：

1. 所有 Bug 修复集中在 DynamicGroup 插件
2. Group 插件的 Bug 可通过迁移文档引导用户转向 DynamicGroup
3. 如需修复 Group，应保持与 DynamicGroup 逻辑一致，便于用户迁移

---

**报告生成时间**：2026-04-27  
**最近更新**：2026-05-18（GitHub 复核 + LOCAL-1/2 + #2400/#2412）  
**分析工具**：GitHub API + 源码深度分析  
**涉及仓库**：LogicFlow (didi/LogicFlow)