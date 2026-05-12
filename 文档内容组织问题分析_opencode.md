# LogicFlow 文档内容组织问题分析

> 本文档是从《LogicFlow 文档问题清单》中提取的详细分析部分（第十九至二十四章）
> 主要关注：内容组织顺序、组织形式、关联性、学习路径断层等问题的深度分析

---

## 十九、内容组织顺序详细分析

### 1. 文档命名与内容定位严重不符

#### basic/node.zh.md 问题详解

| 维度 | 分析 |
|-----|------|
| **文件标题** | "节点 Node" |
| **用户预期** | 学习节点的基本概念：什么是节点、节点有哪些类型、如何创建节点 |
| **实际内容** | 仅13行(11-24行)介绍7种内置节点类型列表，随后290行全是"自定义节点"技术实现 |
| **具体偏差** | 第29行直接进入"自定义节点"，第40行讲解model/view分离，第76行讲样式属性，第160行讲h函数虚拟DOM |

**问题影响**：
- 新用户期望"节点是什么"，实际被要求理解MVVM架构、preact/mobx、数据视图分离
- 用户认知负担陡增，可能放弃阅读

#### basic/edge.zh.md 问题详解

| 维度 | 分析 |
|-----|------|
| **文件标题** | "边 Edge" |
| **用户预期** | 学习边的基本概念：什么是边、边有哪些类型、如何创建连线 |
| **实际内容** | 仅17行(11-19行)介绍3种内置边类型，随后120行全是"自定义边"技术实现 |
| **具体偏差** | 第21行直接进入"选择自定义边继承的内置边"，第44行讲样式修改 |

#### basic/class.zh.md 标题语义模糊

| 维度 | 分析 |
|-----|------|
| **文件标题** | "实例" |
| **实际内容** | 图数据结构(nodes/edges字段)、图渲染、数据模型概念 |
| **问题** | "实例"一词无法让用户预期这是"核心数据结构"的内容 |

---

### 2. 文档分组逻辑混乱

#### 当前分组结构问题

```
介绍 (order: 0)
├── LogicFlow是什么
└── 快速上手 ← 问题：包含数据转换等复杂内容

基础 (order: 1) ← 分组语义混乱
├── 实例 (order: 0) ← 实际是核心概念，非"基础配置"
├── 节点 Node (order: 1) ← 实际是自定义开发教程，非"基础概念"
├── 边 Edge (order: 2) ← 同上
├── 主题 Theme (order: 3) ← 配置项，合适
├── 网格/背景 (order: 4-5) ← 配置项，合适
└── 事件 Event (order: 6) ← 核心交互概念，应独立分组

进阶 (order: 2)
├── 节点 ← 与basic同名，定位不清
├── 边 ← 同上
├── React/Vue节点 ← 框架集成，非进阶难度
└── 其他...

插件 (order: 3)
└── 20个插件平铺 ← 无二级分类
```

#### 分组问题详解

| 问题类型 | 具体表现 | 影响 |
|---------|---------|------|
| **缺少"入门"分组** | 用户读完"介绍"直接进入"基础"，但"基础"第一文档是核心概念 | 学习跳跃感强 |
| **缺少"核心概念"分组** | 图数据结构、事件系统是框架核心，被混在"基础"中 | 重要概念定位不突出 |
| **"基础"层次混杂** | node/edge讲自定义(进阶)、theme/grid是配置(入门)、class是概念(核心) | 层次混乱，无法按能力递进阅读 |
| **分组名称语义不清** | "基础"包含自定义开发内容，"进阶"也包含节点内容 | 用户不知道何时该学哪个分组 |

---

### 3. 理想阅读路径 vs 当前实际路径

#### 理想学习路径（能力递进）

```
1. 介绍 → LogicFlow是什么（了解框架定位）
2. 快速上手 → 安装、创建实例、最简单示例（建立初步认知）
3. 核心概念 → 图数据结构、节点/边基本概念、model/view架构（理解原理）
4. 基础配置 → 主题、网格、背景等画布配置（学会配置）
5. 基础操作 → 使用内置节点、创建连线（学会操作）
6. 自定义开发 → 自定义节点/边（进阶开发）
7. 插件 → 扩展功能
```

#### 当前实际路径（存在问题）

```
1. LogicFlow是什么 ✓
2. 快速上手 → 包含：安装、实例、插件、数据格式、数据转换 ← 内容过多
3. 基础/实例 → 解释图数据结构 ← 标题不明
4. 基础/节点 → 直接讲自定义节点的model/view ← 知识跳跃！
   ↑ 用户突然需要理解：继承机制、MVVM、preact/mobx、model分离、view分离
5. 基础/边 → 同样直接讲自定义边
```

---

### 4. "必须先读A才能理解B，但A未覆盖"的具体情况

| 概念 | 使用位置 | 解释位置 | 问题 |
|-----|---------|---------|------|
| **model/view架构** | basic/node第40行直接使用 | 无前置解释 | 用户不知道model是什么、view是什么 |
| **内置7种节点** | get-started使用type:'rect'等 | basic/node仅列表，无详细说明 | 用户不知道每种节点特点和适用场景 |
| **锚点(anchor)** | advanced/node大量使用 | 无前置解释 | 用户不知道锚点是什么、作用是什么 |
| **h函数** | basic/node第160行使用 | 仅在view章节简单说明 | 用户不理解虚拟DOM/h函数概念 |
| **连接规则** | advanced/node讲解sourceRules | basic无连接基础介绍 | 用户不知道默认连接行为 |

---

### 5. 文档内部顺序问题

#### get-started.zh.md 缺少最简示例

| 问题 | 描述 |
|-----|------|
| **当前状态** | 直接给出完整图数据格式（包含nodes/edges完整结构） |
| **用户需要** | 先看到"复制粘贴即可运行"的30秒快速体验示例 |
| **具体位置** | 第90-100行第一个实例创建，第126-160行才给完整数据示例 |

#### basic/node.zh.md 概念与示例穿插混乱

| 问题 | 描述 |
|-----|------|
| **当前结构** | 认识节点(列表)→跳到自定义→model/view概念→样式属性(代码)→形状属性(代码)→warning |
| **问题** | 形状属性代码在第76-123行，但"为什么要在setAttributes中设置"的解释在第125-129行warning中 |
| **影响** | 用户先看到代码再看到原因，学习顺序颠倒 |

#### advanced/node.zh.md 锚点概念后置

| 问题 | 描述 |
|-----|------|
| **第94行直接讲** | "对于各种基础类型节点，我们都内置了默认锚点" |
| **缺少前置** | 未解释锚点是什么、锚点的作用、默认锚点位置 |
| **影响** | 用户首次接触锚点概念在进阶部分，缺乏基础铺垫 |

---

## 二十、内容组织形式详细分析

### 1. 同一主题分散在多个文档

#### "节点"主题分布详解

| 文档 | 内容类型 | 行号 | 具体内容 |
|-----|---------|------|---------|
| `tutorial/basic/node.zh.md` | 基础节点介绍 | 11-24 | 仅列表展示7种节点类型 |
| `tutorial/basic/node.zh.md` | 自定义节点基础 | 29-307 | model/view概念、样式属性、形状属性、getShape |
| `tutorial/advanced/node.zh.md` | 进阶节点功能 | 11-320 | 连接规则、移动、锚点、文本、HTML/React/Vue节点 |
| `api/model/nodeModel.zh.md` | API参考 | 1-641 | 数据属性、状态属性、所有方法详细定义 |
| `tutorial/extension/node-resize.zh.md` | 节点缩放 | - | 缩放插件 |

**用户困惑场景**：
- 用户想了解"节点是什么" → 找不到
- 用户想了解"如何创建节点" → 找不到
- 用户想了解"如何自定义节点" → 需要读3个文档才能获得完整信息

#### "自定义节点"主题分散详解

| 文档 | 行号 | 内容完整度 |
|-----|------|-----------|
| `tutorial/basic/node.zh.md` | 29-307 | 基础自定义机制、model/view分离、样式属性 |
| `tutorial/advanced/node.zh.md` | 141-214 | HTML节点、React节点、Vue节点（简化版代码） |
| `tutorial/advanced/react.zh.md` | 1-107 | React节点完整教程（`@logicflow/react-node-registry`包） |
| `tutorial/advanced/vue.zh.md` | 1-240 | Vue节点完整教程（`@logicflow/vue-node-registry`包） |

**严重问题**：React/Vue节点在 `advanced/node.zh.md` 和独立文档 `react.zh.md/vue.zh.md` 中**双重覆盖**。

#### "数据格式"主题分散详解

| 文档 | 行号 | 内容 |
|-----|------|------|
| `get-started.zh.md` | 420-443 | JSON结构示意，字段注释（简略版） |
| `class.zh.md` | 47-70 | **相同JSON结构重复**，字段注释（简略版） |
| `adapter.zh.md` | 11-70 | 最详细版：类型概念、properties说明、使用示例 |

**完全相同的JSON结构代码块出现3次**。

---

### 2. 内容重复的具体对比

#### React/Vue节点双重覆盖

**`advanced/node.zh.md` (149-214行) vs `react.zh.md` vs `vue.zh.md` 内容对比**：

| 内容点 | node.zh.md | react.zh.md | vue.zh.md |
|-------|-----------|-------------|-----------|
| HTML节点基础概念 | ✓(141-147) | 提及 | 提及 |
| React渲染示例 | ✓(149-154，简化) | ✓(23-63，完整) | 无 |
| Vue渲染示例 | ✓(158-214，折叠) | 无 | ✓(20-99，完整) |
| 更新节点机制 | ✓(267-302) | ✓(66-93) | ✓(150-153) |
| 外部通信 | ✓(215-265) | 无 | 无 |
| Portal模式 | 无 | ✓(95-107) | 无 |

**重复代码示例**：`advanced/node.zh.md` 160-214行（Vue节点折叠代码）与 `vue.zh.md` 160-214行内容几乎完全相同。

#### 数据格式三处重复

**重复的JSON结构**（在get-started、class、adapter三处几乎完全相同）：
```json
{
  nodes: [
    { id: "node1", type: "rect", x: 100, y: 100, text: "节点1", properties: {} }
  ],
  edges: [
    { id: "edge1", type: "polyline", sourceNodeId: "node1", targetNodeId: "node2" }
  ]
}
```

---

### 3. 应合并 vs 应分离的内容

#### 应保持分离的（合理）

| 分离 | 原因 |
|-----|------|
| basic/node vs advanced/node | 基础自定义 vs 进阶功能，符合渐进学习 |
| api/nodeModel vs tutorial文档 | API参考 vs 教程用途不同 |
| basic/edge vs advanced/edge | 边基础 vs 边进阶 |

#### 应合并的（不合理）

| 当前状态 | 建议合并方式 |
|---------|-------------|
| advanced/node中React/Vue简化版 + react.zh.md + vue.zh.md | 删除node.zh.md中简化版，保留独立文档链接 |
| get-started数据格式 + class数据格式 + adapter数据格式 | 合并到独立"data-format.zh.md"，其他改为链接引用 |
| adapter.zh.md + bpmn-element.zh.md中BpmnAdapter | 合并到bpmn-element，adapter改为链接 |

---

### 4. 插件目录缺少二级分类

#### 当前状态：20个插件平铺

| 功能类别 | 插件列表 | 当前问题 |
|---------|---------|---------|
| **UI增强类** | Menu、Control、MiniMap、DndPanel | 无分类标识 |
| **数据转换类** | Adapter、BpmnAdapter（隐含在bpmn-element中） | 无分类标识 |
| **节点增强类** | Group、DynamicGroup、NodeResize、Pool | 无分类标识 |
| **边增强类** | CurvedEdge、InsertNodeInPolyline | 无分类标识 |
| **交互增强类** | Selection、Highlight、ProximityConnect | 无分类标识 |
| **导出类** | Snapshot | 无分类标识 |
| **布局类** | Layout | 无分类标识 |
| **文本增强类** | Label | 无分类标识 |

**用户影响**：
- 想找"小地图插件" → 需在20个平铺列表逐个扫描
- BpmnElement(60KB)和CurvedEdge(1KB)同级，重要性未区分

---

## 二十一、内容关联性详细分析

### 1. 文档引用关系图谱

#### Tutorial → API 引用详情

| 文档 | 引用路径 | 状态 | 问题 |
|-----|---------|------|------|
| `basic/edge.zh.md:36` | `../../api/edgeModel.zh.md` | ❌错误 | 缺少model/目录层级 |
| `basic/event.zh.md:29` | `../../api/graphModel.zh.md#eventcenter` | ❌错误 | 缺少model/目录层级 |
| `basic/class.zh.md:42` | `../../api/detail/constructor` | ❌缺后缀 | 无.zh.md后缀 |
| `basic/class.zh.md:72` | `../../api/type/nodeConfig` | ❌路径错误 | 应指向type/index |
| `get-started.zh.md:444` | `../api/type/graphCinfigData.zh.md` | ❌拼写错误 | Cinfig→Config |
| `advanced/node.zh.md:121` | `../../api/nodeModel.zh.md` | ❌错误 | 缺少model/目录层级 |
| `advanced/silent-mode.zh.md:11` | `../../api/editConfigModel.zh.md` | ❌错误 | 缺少model/目录层级 |

#### API → Tutorial 引用缺失

| 文档 | 缺失的tutorial引用 |
|-----|------------------|
| `api/model/edgeModel.zh.md` | 未引用对应的tutorial/edge文档 |
| `api/model/graphModel.zh.md` | 未引用任何tutorial文档 |
| `api/theme.zh.md` | 未引用对应的tutorial/theme文档 |

---

### 2. 缺少导航章节详细分析

#### 缺少"下一步"引导的文档

| 文档 | 当前结尾 | 建议添加 |
|-----|---------|---------|
| `get-started.zh.md` | 无引导 | → 基础-实例（学习图数据结构） |
| `basic/class.zh.md` | 无引导 | → 基础-节点（学习自定义） |
| `basic/edge.zh.md` | 无引导 | → 进阶-边 |
| `basic/theme.zh.md` | 无引导 | → 基础-节点/边（应用主题） |
| `basic/grid.zh.md` | 无引导 | → 基础-背景 |
| `basic/background.zh.md` | 无引导 | → 基础-网格 |
| `basic/event.zh.md` | 无引导 | → API-eventCenter（完整事件列表） |

#### 缺少"前置知识"的文档

| 文档 | 建议前置知识 |
|-----|-------------|
| `basic/node.zh.md` | 实例(class.zh.md)、数据格式概念 |
| `basic/edge.zh.md` | 实例 + 节点(node.zh.md) |
| `advanced/node.zh.md` | 基础-节点、锚点概念、连接概念 |
| `advanced/edge.zh.md` | 基础-边、锚点概念 |
| `advanced/react.zh.md` | 基础-节点 + React基础 |
| `advanced/vue.zh.md` | 基础-节点 + Vue基础 |

---

### 3. API ↔ Tutorial 双向关联矩阵

```
Tutorial文档          nodeModel  edgeModel  graphModel  theme  eventCenter
--------------------|-----------|-----------|------------|-------|------------|
basic/node.zh.md    |    ✓→     |     -     |     ✓→     |  ✓→   |     -      |
basic/edge.zh.md    |     -     |   ✓→(错)  |     -      |  ✓→   |     -      |
basic/class.zh.md   |   ✓→(缺)  |   ✓→(缺)  |     -      |   -   |     -      |
basic/event.zh.md   |     -     |     -     |   ✓→(错)   |   -   |     ✓→     |
--------------------|-----------|-----------|------------|-------|------------|
API文档              Tutorial引用情况
--------------------|---------------------------
nodeModel.zh.md     |    ✓← (仅一处链接)
edgeModel.zh.md     |    缺失 ← (应有但无)
graphModel.zh.md    |    缺失 ← (应有但无)
theme.zh.md         |    缺失 ← (应有但无)
eventCenter.zh.md   |    ✓←

符号说明：
✓→/✓← = 正确引用
✓→(错) = 路径错误（缺少model/目录）
✓→(缺) = 缺后缀（无.zh.md）
缺失 = 应有但无
```

---

### 4. 链接路径错误清单汇总

| 文件 | 行号 | 错误链接 | 正确链接 |
|-----|------|----------|----------|
| `tutorial/basic/edge.zh.md` | 36 | `../../api/edgeModel.zh.md` | `../../api/model/edgeModel.zh.md` |
| `tutorial/basic/event.zh.md` | 29 | `../../api/graphModel.zh.md#eventcenter` | `../../api/model/graphModel.zh.md#eventcenter` |
| `tutorial/basic/class.zh.md` | 42 | `../../api/detail/constructor` | `../../api/detail/constructor.zh.md` |
| `tutorial/basic/class.zh.md` | 72 | `../../api/type/nodeConfig` | `../../api/type/index.zh.md` |
| `tutorial/basic/class.zh.md` | 77 | `../../api/model/nodeModel` | `../../api/model/nodeModel.zh.md` |
| `tutorial/get-started.zh.md` | 444 | `../api/type/graphCinfigData.zh.md` | `../api/type/index.zh.md` |
| `tutorial/advanced/node.zh.md` | 121 | `../../api/nodeModel.zh.md` | `../../api/model/nodeModel.zh.md` |
| `tutorial/advanced/silent-mode.zh.md` | 11 | `../../api/editConfigModel.zh.md` | `../../api/model/editConfigModel.zh.md` |

---

## 二十二、学习路径与断层详细分析

### 1. 知识断层详解

#### 断层1：get-started → basic/node

| get-started 展示的内容 | basic/node 假设用户知道的内容 | 断层 |
|-----------------------|------------------------------|------|
| 直接用 `type: 'rect'` | 未解释7种内置节点各是什么 | **内置节点介绍缺失** |
| 数据格式代码块展示 | 未解释节点/边数据结构含义 | **数据格式独立文档缺失** |
| `properties: { width: 160 }` | 直接讲基于properties自定义样式 | **properties概念未铺垫** |

**断层影响**：用户从"知道节点有type"直接跳到"需要理解MVVM架构"，中间缺少：
- 内置节点详细介绍（每种节点特点、适用场景）
- model/view架构前置解释
- LogicFlow渲染原理简介

#### 断层2：basic/node → advanced/node

| advanced/node 直接讲的内容 | basic/node 是否覆盖 | 断层 |
|--------------------------|---------------------|------|
| **连接规则**(sourceRules/targetRules) | ❌完全未提 | **连接基础文档缺失** |
| **锚点**(自定义锚点位置和属性) | ❌未介绍锚点是什么 | **锚点基础文档缺失** |
| **移动规则**(moveRules) | ✅独立概念 | 无断层 |

#### 断层3：锚点概念覆盖严重缺失

```
锚点概念出现位置：
├── advanced/node.zh.md: "对于各种基础类型节点，我们都内置了默认锚点..."
│   → 直接讲如何自定义锚点，未解释锚点是什么
├── advanced/edge.zh.md: "需要重写保存方法将锚点信息保存"
│   → 假设用户已理解锚点
└── basic目录：完全未提及锚点

❌ 没有文档解释：
   - 锚点是什么（节点之间的连接点）
   - 锚点的作用（如何影响连线行为）
   - 每个节点默认有几个锚点
   - 如何查看默认锚点位置
```

---

### 2. 缺失的关键文档（按优先级）

| 缺失文档 | 重要性 | 建议位置 | 具体内容建议 |
|---------|--------|----------|-------------|
| **核心概念** | ⭐⭐⭐⭐⭐ | 介绍组 | 什么是节点、边、锚点、画布；基本渲染流程；model/view架构 |
| **第一个流程图** | ⭐⭐⭐⭐⭐ | 介绍组 | 完整实践教程：创建画布→添加节点→连线→导出数据 |
| **数据格式详解** | ⭐⭐⭐⭐⭐ | 基础组开头 | nodes/edges各字段含义；properties用法；完整数据示例 |
| **使用内置节点** | ⭐⭐⭐⭐ | 基础组 | 7种内置节点详细介绍；各节点形状属性；直接使用示例 |
| **锚点基础** | ⭐⭐⭐⭐ | 基础组 | 锚点概念；默认锚点位置；如何使用锚点连线 |
| **连接基础** | ⭐⭐⭐⭐ | 基础组 | 如何创建连接；默认连接行为；连接事件 |

---

### 3. 现有文档可独立阅读性分析

| 文档 | 可独立阅读 | 必须前置的文档 |
|-----|------------|---------------|
| `about.zh.md` | ✅是 | 无 |
| `get-started.zh.md` | ⚠️部分 | 需要JS框架基础 |
| `basic/node.zh.md` | ❌否 | get-started、数据格式概念、model/view概念 |
| `basic/edge.zh.md` | ❌否 | basic/node、锚点概念 |
| `basic/theme.zh.md` | ✅是 | get-started |
| `basic/event.zh.md` | ✅是 | get-started |
| `advanced/node.zh.md` | ❌否 | basic/node、锚点概念、连接概念 |
| `advanced/edge.zh.md` | ❌否 | basic/edge、锚点概念 |

---

### 4. 文档依赖关系图

```
理想学习路径（带依赖关系）：

about.zh.md ──→ [核心概念] ──→ [第一个流程图]
     │              │                │
     ↓              ↓                ↓
[数据格式详解] ←────────────────────┘
     │
     ↓
[使用内置节点]
     │
     ↓
get-started.zh.md (精简版)
     │
     ↓
[锚点基础] ──→ [连接基础]
     │              │
     ↓              ↓
basic/node.zh.md ←───────┘
     │
     ↓
basic/edge.zh.md
     │
     ↓
basic/theme/event/grid/background
     │
     ↓
advanced/node.zh.md
     │
     ↓
advanced/edge.zh.md
     │
     ↓
extension/*.zh.md

图例：
[xxx] = 缺失文档（需要新建）
──→ = 必须按顺序学习
←───┘ = 前置依赖
```

---

### 5. 入门到进阶的桥梁分析

| 当前步骤 | 理想步骤 | 差异 |
|---------|---------|------|
| 1.about(介绍特性) | 1.about(介绍特性) | 相同 |
| 2.get-started(安装+实例+插件+数据格式+数据转换) | 2.[核心概念] | get-started内容过多，缺少概念铺垫 |
| - | 3.[第一个流程图] | 缺失实践教程 |
| - | 4.[数据格式详解] | 缺失独立文档 |
| - | 5.[使用内置节点] | 缺失基础操作教程 |
| 3.basic/node(直接自定义) | 6.get-started(精简版) | get-started应精简 |
| - | 7.[锚点基础] | 缺失锚点概念 |
| - | 8.[连接基础] | 缺失连接概念 |
| 4.basic/edge | 9.basic/node(自定义) | node应先有基础教程 |
| 5.advanced/node | 10.basic/edge | 同上 |

**结论**：当前5步，缺少6个中间文档，理想应为12步渐进学习。

---

## 二十三、建议的目录重组方案

```
docs/
├── concepts/              # 概念文档（解释是什么）
│   ├── overview.zh.md     # LogicFlow核心概念总览
│   ├── node.zh.md         # 节点类型介绍：rect/circle/polygon等7种
│   ├── edge.zh.md         # 边类型介绍：line/polyline/bezier
│   ├── anchor.zh.md       # 锚点概念：什么是锚点、默认锚点
│   ├── architecture.zh.md # MVVM架构、model/view概念
│   └── plugin-system.zh.md # 插件机制介绍
│
├── tutorials/             # 教程文档（教怎么做）
│   ├── get-started.zh.md  # 精简版：安装+创建实例+最简示例
│   ├── first-flow.zh.md   # 新增：第一个流程图实践教程
│   ├── data-format.zh.md  # 新增：数据格式详解
│   ├── basic/
│   │   ├── create-node.zh.md    # 新增：如何创建节点
│   │   ├── create-edge.zh.md    # 新增：如何创建连线
│   │   ├── custom-node.zh.md    # 从原node.zh.md拆分
│   │   └── custom-edge.zh.md    # 从原edge.zh.md拆分
│   ├── advanced/
│   │   ├── node-connect.zh.md   # 连接规则
│   │   ├── node-anchor.zh.md    # 锚点自定义
│   │   ├── node-html.zh.md      # HTML节点
│   │   ├── edge-animation.zh.md # 边动画
│   │   └── silent-mode.zh.md    # 静默模式
│   └── framework/         # 新增目录
│       ├── react-node.zh.md     # React节点
│       └── vue-node.zh.md       # Vue节点
│
├── guides/                # 指南文档（最佳实践）
│   ├── upgrade.zh.md      # 版本升级指南（从update.zh.md移动）
│   ├── plugin-selection.zh.md # 插件选择建议
│   └── styling.zh.md      # 样式配置最佳实践
│
├── api/                   # 参考文档（保持现状，增加链接）
│   ├── model/
│   │   ├── nodeModel.zh.md    # 增加→tutorials链接
│   │   ├── edgeModel.zh.md    # 增加→tutorials链接
│   │   └── graphModel.zh.md   # 增加→tutorials链接
│   └── detail/
│       ├── graph.zh.md    # 从index.zh.md拆分
│       ├── node.zh.md     # 从index.zh.md拆分
│       └── edge.zh.md     # 从index.zh.md拆分
│
└── extension/             # 插件文档（按功能分类）
    ├── intro.zh.md        # 增强版：包含插件分类导航表
    ├── ui/                # UI增强类
    │   ├── menu.zh.md
    │   ├── control.zh.md
    │   ├── minimap.zh.md
    │   └── dnd-panel.zh.md
    ├── node/              # 节点增强类
    │   ├── group.zh.md
    │   ├── dynamic-group.zh.md
    │   ├── node-resize.zh.md
    │   └── pool.zh.md
    ├── interaction/       # 交互增强类
    │   ├── selection.zh.md
    │   ├── highlight.zh.md
    │   └ proximity-connect.zh.md
    ├── data/              # 数据转换类
    │   ├── adapter.zh.md
    │   └── bpmn-element.zh.md
    └── export/            # 导出类
        └ snapshot.zh.md
```

---

## 二十四、核心问题最终总结

### 四大核心问题

| 问题类型 | 具体表现 | 影响用户数 |
|---------|---------|-----------|
| **命名定位失准** | node/edge标题是"基础"但内容是"自定义开发"，用户预期与实际严重不符 | 所有新用户 |
| **分组逻辑混乱** | 缺少"核心概念"分组，"基础"混杂概念/配置/自定义三层内容 | 所有学习者 |
| **学习路径断层** | 从入门直接跳到自定义，缺少核心概念、锚点、连接等6个中间文档 | 初学者和进阶者 |
| **关联性缺失** | 11处链接路径错误，API与Tutorial双向关联缺失，缺少导航章节 | 所有查阅者 |

### 需新建的6个关键文档

1. **核心概念总览** - 解释节点、边、锚点、画布是什么
2. **第一个流程图** - 完整实践教程
3. **数据格式详解** - nodes/edges完整字段说明
4. **使用内置节点** - 7种节点详细介绍
5. **锚点基础** - 锚点概念和默认行为
6. **连接基础** - 如何创建连接

### 需修正的11处链接路径

全部需要添加 `model/` 目录层级或 `.zh.md` 后缀。

### 需重组的文档

| 文档 | 操作 |
|-----|------|
| `tutorial/basic/node.zh.md` | 重命名为"自定义节点"，移至tutorials/basic |
| `tutorial/basic/edge.zh.md` | 重命名为"自定义边"，移至tutorials/basic |
| `tutorial/basic/event.zh.md` | 移至concepts或独立为guide |
| `tutorial/advanced/react.zh.md/vue.zh.md` | 移至tutorials/framework |
| `tutorial/update.zh.md` | 移至guides |
| `tutorial/extension/*.zh.md` | 添加二级分类目录 |