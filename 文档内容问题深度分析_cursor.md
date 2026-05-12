# LogicFlow 文档真实内容问题清单

> 基于对 `sites/docs/docs/api` 与 `sites/docs/docs/tutorial` 所有中文文档**全文通读**后整理。
> 分为**错误类**（直接导致读者写出错误代码）和**缺失/模糊类**（影响理解与学习）两大类。
> 2026-04-22

---

## 一、错误类问题（直接影响代码正确性）

### 1.1 链接 404 —— 路径缺少 `model/` 层级

多处教程文档链接到旧路径（`api/xxx.zh.md`），而实际文件已移入 `api/model/` 子目录，点击后直接 404。

| 文件 | 错误链接 | 应改为 |
|------|---------|--------|
| `tutorial/basic/edge.zh.md` 第 36 行 | `../../api/edgeModel.zh.md` | `../../api/model/edgeModel.zh.md` |
| `tutorial/advanced/node.zh.md` 第 121 行 | `../../api/nodeModel.zh.md` | `../../api/model/nodeModel.zh.md` |
| `tutorial/advanced/silent-mode.zh.md` 第 11 行 | `../../api/editConfigModel.zh.md` | `../../api/model/editConfigModel.zh.md` |
| `tutorial/basic/event.zh.md` 第 29 行 | `../../api/graphModel.zh.md#eventcenter` | `../../api/model/graphModel.zh.md#eventcenter` |
| `tutorial/extension/node-resize.zh.md` 第 58-60 行 | `../../api/nodeModel.zh.md#形状属性` 等 | `../../api/model/nodeModel.zh.md#形状属性` 等 |

---

### 1.2 代码示例语法错误

**文件**：`tutorial/extension/menu.zh.md` 第 52–63 行

```js
// ❌ 错误：多余的一层花括号，这是 JS 语法错误
const menuItem = {
  {
    className: "lf-menu-delete",
    ...
  },
}
```

应改为：

```js
// ✅ 正确
const menuItem = {
  className: "lf-menu-delete",
  ...
}
```

---

### 1.3 API 方法名拼写错误（`setleExclusiveMode`）

**文件**：`tutorial/extension/selection.zh.md` 第 113、130 行

文档中方法名写为 `setleExclusiveMode`（多了字母 `l`），且同一文档第 128 行又写为 `lf.setSelectionSelectMode`（完全不同的名称），两者无法对应，开发者无法确认正确的 API 名称。

---

### 1.4 Polygon 示例传入了不存在的 `r` 属性

**文件**：`tutorial/basic/node.zh.md` 第 268–273 行

```js
// ❌ polygon 节点没有 r（半径）属性，此处是从 circle 示例复制过来未删除的残留
h('polygon', {
  ...style,
  r, // 半径保持不变  ← 错误！polygon 无 r 属性
  points: pointStr,
})
```

---

### 1.5 连字符拼写错误：`messgage`

**文件**：`tutorial/advanced/node.zh.md` 第 40 行

> 校验规则是一个对象，我们需要为其提供`messgage`和`validate`属性。

`messgage` → 应为 `message`。这个词同时是开发者需要在代码中填写的字段名，拼错会导致错误提示不触发。

---

### 1.6 CSS 样式引入路径前后不一致

同一版本（2.x）的 CSS 路径在不同文档中出现了**三种**写法，开发者无法确认哪个正确：

| 文件 | 写法 |
|------|------|
| `tutorial/extension/intro.zh.md`（CDN 示例） | `dist/style/index.css`（1.x 路径） |
| `tutorial/get-started.zh.md`（React 示例） | `@logicflow/core/dist/index.css` |
| `tutorial/get-started.zh.md`（Vue 示例） | `@logicflow/core/lib/style/index.css` |
| `tutorial/extension/dnd-panel.zh.md` | `@logicflow/core/lib/style/index.css` |
| `tutorial/extension/intro.zh.md`（npm 示例） | `@logicflow/core/lib/style/index.css` 和注释 `// 2.0版本前的引入方式：dist/style/index.css` |

**根本问题**：`@logicflow/core/dist/index.css` 与 `@logicflow/core/lib/style/index.css` 不是同一个文件，且 CDN 示例中仍使用 1.x 的 `dist/logic-flow.js` 路径。应统一为 2.x 正确路径并在每处只保留一种写法。

---

### 1.7 `dynamicGroup` 大小写不一致

**文件**：`tutorial/extension/dynamic-group.zh.md`

```js
// 插件注册时是大写
import { DynamicGroup } from '@logicflow/extension'

// 但自定义继承时又是小写
import { dynamicGroup } from "@logicflow/extension";
class CustomGroup extends dynamicGroup.view {}
class CustomGroupModel extends dynamicGroup.model {}
```

同一文件中 `DynamicGroup` 和 `dynamicGroup` 均出现，开发者不清楚哪个是正确导出名，实际 import 可能报错。

---

### 1.8 `api/model/nodeModel.zh.md` 中明显的复制粘贴错误

**第 72 行**：

```
| height | number | ✅ | 高度的高度 |
```

"高度的高度" 应为 "节点的高度"。

---

### 1.9 `background.zh.md` 标题与代码内容不匹配

**文件**：`tutorial/basic/background.zh.md` 第 34–44 行

二级标题写的是"**设置背景颜色**"，但代码示例却是设置 **背景图片**（`backgroundImage`）：

```js
// 标题：设置背景颜色
// 代码：
background: {
  backgroundImage: "url(../asserts/img/grid.svg)",
  backgroundRepeat: "repeat",
},
```

代码与标题语义完全不符，且路径 `../asserts/img/grid.svg` 中 `asserts` 是 `assets` 的拼写错误。

---

### 1.10 `tutorial/extension/intro.zh.md` CDN 示例使用 1.x 路径

```html
<!-- ❌ 以下是 1.x 路径 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/style/index.css" />
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/logic-flow.js"></script>
```

2.x 的正确路径应为：
- JS：`dist/index.min.js`
- CSS：`lib/style/index.min.css`

CDN 引入方式错误，会导致用户引入失败或引入到旧版本。

---

## 二、内容缺失 / 模糊类问题（影响学习与 AI 辅助编程）

### 2.1 `tutorial/basic/edge.zh.md`：`updateStyle()` 方法无文档

第 47 行提到：

> 如果需要实现 hover 的效果，可以监听事件，修改完 properties 中的参数，然后调用 `edge.updateStyle()` 方法更新边的样式。

但 `api/model/edgeModel.zh.md` 中没有 `updateStyle` 方法的文档，开发者无法知道其签名、参数和返回值。

---

### 2.2 `tutorial/advanced/dnd.zh.md`：内容极简，缺少完整示例

整篇教程只有不到 50 行，核心示例直接链到外部 CodeSandbox，且没有完整的「面板 HTML + JS 绑定 + drop 监听」组合代码。如果 CodeSandbox 访问不稳定，此页教程几乎无法独立阅读。

---

### 2.3 `tutorial/advanced/edge.zh.md`：内容极简，与基础边割裂

整篇进阶边教程仅包含：React 自定义边、锚点数据保存、动画三个主题，合计不到 60 行。

缺少：
- 如何在进阶场景下自定义 `getPath()`（边的路径）
- 如何实现折线的自定义调整点行为
- 与基础边文档的承接（基础边已讲了继承，进阶边应明确「在基础之上还能做什么」）

---

### 2.4 `tutorial/extension/group.zh.md`：废弃标记但无迁移指引

文档带有 `tag: 即将废弃`，但正文中没有任何提示说明：
- 为什么废弃
- 应该改用哪个（`DynamicGroup`）
- 如何从 `Group` 迁移到 `DynamicGroup`

用户看到"即将废弃"不知道下一步该怎么做。

---

### 2.5 `tutorial/extension/node-resize.zh.md`：已内置但缺少核心说明

文档带有 `tag: 已内置`，但正文仍然全部是「如何通过继承 `RectResize` 等来实现可缩放节点」，未说明：
- 2.x 中"已内置"的含义是什么（是直接支持 `allowResize: true` 初始化选项吗？）
- 内置方式与继承方式如何选择

---

### 2.6 `tutorial/advanced/node.zh.md`：`validate` 函数签名描述不完整

第 43 行写道：
> `validate` 方法有两个参数，分别为边的起始节点（source）和目标节点（target）

但实际在代码示例中函数签名是：
```js
validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {}
```

有 4 个参数。文字描述只提了 2 个，`sourceAnchor` 和 `targetAnchor` 未说明，开发者不知道这两个参数的类型和用途。

---

### 2.7 `tutorial/extension/adapter.zh.md`：两套 adapter API 混用，逻辑混乱

文档第一部分介绍的是直接修改 `lf.adapterIn`/`lf.adapterOut` 方法（旧方式），第二部分介绍 `BPMNAdapter` 和 `BPMNAdapter`（新的插件方式），但：
- 没有说明两套方式的关系和区别
- 两种方式的使用时机没有说明
- `lf.getGraphData()` 与 `lf.adapterOut(lf.getGraphRawData())` 混用场景未解释清楚
- 文档中暴露了 `<!-- TODO -->` 注释（第 131 行），表示这部分内容原本计划补充但一直未完成

---

### 2.8 事件系统的两种使用路径没有统一

- 教程 `event.zh.md` 只介绍了 `lf.on('event-name', callback)`
- API `eventCenter.zh.md` 列出了所有事件
- 但 `graphModel.eventCenter.on(EventType.XXX, callback)` 这种基于枚举常量的用法只在 Vue 节点教程中出现，从未被统一介绍

开发者不清楚字符串事件名（如 `'node:click'`）和 `EventType` 枚举（如 `EventType.NODE_CLICK`）的关系，也不知道什么时候用哪种方式。

---

### 2.9 `tutorial/advanced/node.zh.md` 中 HTML 节点与 React/Vue 节点重复，与独立教程割裂

进阶节点教程中包含：HTML 节点、React 节点、Vue 节点的代码；但同时：
- `tutorial/advanced/react.zh.md` 有独立的 React 节点教程（且用的是全新的 `@logicflow/react-node-registry` 包，与进阶节点中用 `reactDOM.render` 的旧方式不同）
- `tutorial/advanced/vue.zh.md` 有独立的 Vue 节点教程

结果：进阶节点中的 React/Vue 代码是**旧方式**（`reactDom.render` 直接挂载），独立教程中是**新方式**（专用 registry 包）。两者并存但没有说明新旧关系，会导致开发者使用过时 API。

---

### 2.10 `tutorial/basic/theme.zh.md`：`setTheme` 第二个参数在教程中出现但 API 未对应

教程中出现了 `lf.setTheme({}, 'dark')` 的双参数用法，但：
- `api/index.zh.md` 中 `setTheme` 对应的链接指向 `theme.zh.md`
- `api/theme.zh.md` 本身没有说明 `setTheme` 接受第二个 `themeMode` 参数
- `api/detail/index.zh.md` 中 `setTheme` 条目有完整参数说明

教程用了、API 列了、但 API 详情页没有，三处说法分散且不完整。

---

### 2.11 `tutorial/basic/class.zh.md`（实例）：链接到类型文档的路径失效

第 72 行：
```
完整的字段配置项见类型说明[NodeConfig](../../api/type/nodeConfig)
```

`../../api/type/nodeConfig` 这个页面不存在，`api/type/` 目录下只有 `index`、`MainTypes`、`Theme` 三个文件，没有 `nodeConfig` 页面。同理第 75 行的 `[EdgeConfig](../../api/type/edgeConfig)` 也是 404。

---

### 2.12 `api/model/graphModel.zh.md`：多处方法只有名称没有参数说明

graphModel 文档中有大量方法如 `addNodeMoveRules`、`moveNodes`、`getEdgeModelById` 等在属性表中提到，但跳转到对应方法后，部分方法缺少参数类型、返回值、使用示例。AI 在回答开发者问题时无法给出完整的调用代码。

---

### 2.13 `tutorial/extension/snapshot.zh.md`：`getSnapshot` 参数不完整

教程示例：
```js
lf.getSnapshot('流程图');
```

但配置选项表（`toImageOptions`）中没有说明第一个参数（文件名）是什么类型，也没有完整的函数签名格式，例如：
```ts
lf.getSnapshot(fileName?: string, toImageOptions?: ToImageOptions): Promise<void>
```

---

### 2.14 `api/model/editConfigModel.zh.md` 与 `tutorial/advanced/silent-mode.zh.md` 内容重叠但不一致

- 教程列出的静默模式等价配置包含 `nodeSelectedOutline: true`
- API 文档中 `editConfigModel` 的属性默认值表中 `nodeSelectedOutline` 默认值为 `true`

静默模式中 `nodeSelectedOutline` 设为 `true` 其实是保持了默认值，没有实际意义，但没有说明。更重要的是：教程中的属性列表和 `editConfigModel` API 文档的属性列表有差异（如 `allowRotation`、`metaKeyMultipleSelected`、`autoExpand` 在教程中没有提及）。

---

## 三、对 AI 辅助编程影响最大的问题汇总

如果 AI 仅凭现有文档回答开发者问题，以下问题最容易产生错误答案：

| 问题 | 后果 |
|------|------|
| CSS 引入路径有三种写法 | AI 给出错误的 import 路径，项目样式丢失 |
| 5 处文档链接 404 | AI 无法查阅关联 API，回答不完整 |
| `dynamicGroup` vs `DynamicGroup` 大小写不一致 | AI 给出无法运行的 import 代码 |
| React 节点新旧两套方式并存 | AI 可能给出已废弃的 `reactDom.render` 方式 |
| `NodeConfig`/`EdgeConfig` 类型页面不存在 | AI 无法告知字段完整格式 |
| `validate` 参数只描述了 2 个实际有 4 个 | AI 生成的连接规则函数签名不完整 |
| `updateStyle()` 方法无文档 | AI 无法告知正确的边样式更新方式 |
| `setTheme` 第二参数未在 API 详情中说明 | AI 不知道主题模式参数用法 |
| `<!-- TODO -->` 暴露在 adapter 文档中 | AI 可能将其作为正文内容理解 |
| `messgage` 拼写错误 | AI 生成连接规则时可能用 `messgage` 而非 `message` |

---

## 四、修复优先级建议

### P0（立即修复，影响代码运行）
1. 修复 5 处 404 链接（`api/xxx.zh.md` → `api/model/xxx.zh.md`）
2. 统一 CSS import 路径，删除所有 1.x 路径
3. 修复 `menu.zh.md` 代码语法错误（双层花括号）
4. 修复 `polygon` 示例中的 `r` 属性错误
5. 修复 `dynamicGroup` 大小写不一致
6. 修复 `background.zh.md` 标题与代码不符

### P1（影响学习理解）
7. 补充 `validate` 函数全部 4 个参数的说明
8. 在 `group.zh.md` 废弃标记旁说明应改用 `DynamicGroup` 并附迁移说明
9. 统一 React 节点文档，标明进阶节点中的用法是旧方式
10. 补充 `updateStyle()` 方法到 `edgeModel` API
11. 删除 adapter 文档中的 `<!-- TODO -->` 或补全内容
12. 修复 `nodeModel.zh.md` 的"高度的高度"错误
13. 修复 `NodeConfig`/`EdgeConfig` 死链

### P2（提升完整性）
14. 补充 `EventType` 枚举与字符串事件名的关系说明
15. 补充 `dnd.zh.md` 的完整代码示例（不依赖外部链接）
16. 说明 `node-resize` 的"已内置"具体含义
17. 补全 `getSnapshot` 函数完整签名
