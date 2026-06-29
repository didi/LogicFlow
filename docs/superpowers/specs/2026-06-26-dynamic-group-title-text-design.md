# DynamicGroup 标题文本布局（textStyle）设计说明

**日期：** 2026-06-26  
**状态：** 已实现  
**关联：** [dynamic-group.zh.md](../../../sites/docs/docs/tutorial/extension/dynamic-group.zh.md)、[2026-05-18-dynamic-group-fix-design.md](./2026-05-18-dynamic-group-fix-design.md)、[2026-06-26-dynamic-group-resize-bounds-design.md](./2026-06-26-dynamic-group-resize-bounds-design.md)（本文 `textStyle.wrapPadding` 仅用于标题文字布局，与 resize 最小边界无关）

> 曾规划 `textPlacement` API，未落地且不再采用；标题布局统一使用 `properties.textStyle`。

## 目标

1. 展开态分组标题与折叠按钮（operator）在**同一顶栏**内布局：按钮固定 inset，标题通过 `properties.textStyle` 控制对齐与内边距。
2. **统一三种 `overflowMode`**（`default` / `autoWrap` / `ellipsis`）的标题区几何语义，消除 html 模式 foreignObject 相对节点偏上的问题。
3. **`center` 对齐时标题相对整个 DG 外框几何居中**；`left` / `right` 由用户通过 `wrapPadding` 控制与边缘距离。
4. 实现范围限定在 **`packages/extension` dynamic-group**；html 模式在 DG 内自绘 foreignObject，**不修改 core**。

## 非目标

- 恢复或引入 `textPlacement` API
- 修改旧 `Group` 插件（`materials/group`）
- 修改 core `Text.tsx` 的通用 foreignObject 锚点语义
- 折叠态可配置标题对齐（折叠态沿用现有居中规则）
- 独立 header 几何（如 swimlane `startSize`）

## 背景与问题

- 折叠按钮：`operatorLeft = left + INSET`，`operatorTop = top + INSET`（`INSET = 10`，按钮 14×12）。
- 旧实现：`autoWrap` / `ellipsis` 走 core `renderHtmlText`，以 `(text.x, text.y)` 为 foreignObject **几何中心**，且 autoWrap 默认高度为整节点高度，与顶栏语义冲突。

### 设计方向

**「全宽标题带 + 方向性 padding」**：

- 标题布局盒与 **DG 同宽**，从 **DG 左缘** 起算；
- 纵向默认与 **operator 顶边** 对齐（`y = top + INSET`）；
- `textAlign: center` 在整节点宽度内居中；
- 避开 operator 由用户在 `left` 对齐时设置 `wrapPadding.left`（`right` 同理）。

## 常量与 operator

与 `node.getOperateIcon()` 保持一致：

| 常量 | 值 | 含义 |
| --- | --- | --- |
| `DG_OPERATE_INSET` | `10` | operator 距 DG 左边、顶边的默认偏移 |
| `DG_OPERATE_BTN_WIDTH` | `14` | 折叠按钮宽度 |
| `DG_OPERATE_BTN_HEIGHT` | `12` | 折叠按钮高度 |
| `DG_TITLE_LEFT_CLEARANCE` | `34` | 左对齐避 operator 的推荐 `wrapPadding.left`（非默认） |

```
operatorLeft = left + DG_OPERATE_INSET
operatorTop  = top  + DG_OPERATE_INSET
```

其中 `left = x - width/2`，`top = y - height/2`（节点外框左上角，画布坐标）。

## 标题布局盒（Title Band）

展开态、存在 `text` 时：

```text
bandLeft   = left
bandTop    = top + DG_OPERATE_INSET
bandWidth  = width
```

**`collapsible` 与 `bandTop`：** 仅当 `collapsible: true` 时渲染 operator，且 `operatorTop = bandTop`。无论是否可折叠，标题 `y` 恒用 `bandTop = top + DG_OPERATE_INSET`（再叠加 `wrapPadding.top` 得 `contentTop`）。

`wrapPadding` 格式：`top,right,bottom,left`（渲染为 CSS padding）。

```text
contentLeft    = bandLeft + pad.left
contentRight   = bandLeft + bandWidth - pad.right
contentTop     = bandTop + pad.top
contentCenterX = contentLeft + (contentRight - contentLeft) / 2
```

### 与 operator 的关系

- operator 与标题 **Z 序**：文本先绘，operator 叠在上（`node.getText()`，#1099）。
- 标题带 **全宽**；`center` 不受按钮占位影响。
- `left` 且 `pad.left = 0` 会与 operator 重叠——需用户加大 `pad.left`。

## 文本锚点（overflowMode: default）

SVG `<text>`，`dominantBaseline: hanging`：

| textAlign | text.x | text.y |
| --- | --- | --- |
| `left` | `contentLeft` | `contentTop` |
| `center` | `contentCenterX` | `contentTop` |
| `right` | `contentRight` | `contentTop` |

**padding 全 0、center：** `text.x = x`，`text.y = top + INSET`。

## HTML 模式（autoWrap / ellipsis）

- foreignObject **左上角** `(bandLeft, bandTop)`，**宽度 = bandWidth**。
- `wrapPadding` 在容器内部；不缩小 `textWidth`。
- autoWrap 高度：`height - DG_OPERATE_INSET`；`align-items: flex-start`。
- ellipsis：单行，`fontSize + 2`（含 pad 计入盒子高度）。

```text
foX      = bandLeft
foY      = bandTop
foWidth  = bandWidth
```

## 折叠态

不应用 title band；`text` 相对折叠后矩形居中 `(x, y)`。

## API（用户配置）

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `textAlign` | `'left' \| 'center' \| 'right'` | `'center'` | 全宽标题带内对齐 |
| `wrapPadding` | `string` | `'0,0,0,0'` | 方向性内边距 |
| `overflowMode` | `'default' \| 'autoWrap' \| 'ellipsis'` | `'default'` | 与普通节点一致 |

```ts
textStyle: {
  textAlign: 'left',
  wrapPadding: '0,0,0,34',
}
```

## 实现文件

| 文件 | 职责 |
| --- | --- |
| `dynamic-group/utils.ts` | `getTitleBand`、`resolveTitleTextPosition`、`getTitleForeignObjectRect` |
| `dynamic-group/model.ts` | `setTextPosition`、`getTextStyle`、`getTitleHtmlRect` |
| `dynamic-group/titleText.tsx` | `DynamicGroupText`：html 自绘 + default 走 `BaseText` |
| `dynamic-group/node.ts` | `getText()`、`operator` 叠层 |

**测试：** `packages/extension/__test__/dynamic-group/title-header.test.ts`  
**示例：** `examples/dynamic-group-regression` → `title-header`

## 测试要点

1. `wrapPadding = 0,0,0,0` + `center`：标题水平居中，`text.y` 与 operator 顶边对齐。
2. `left` + `pad.left = 34`：文本在 operator 右侧沟槽后。
3. autoWrap / ellipsis：foreignObject 从 `bandTop` 起，高度符合 spec。
4. `collapsible: false`：`text.y` 与 `true` 相同。
5. resize 宽度变化：center 仍整框居中。

## 已确认决策

| 项 | 决策 |
| --- | --- |
| 标题区宽度 | 与 DG `width` 相同，从 DG 左缘起 |
| 默认纵坐标 | 恒为 `top + DG_OPERATE_INSET`；与 `collapsible` 无关 |
| center 对齐 | 相对整 DG 居中 |
| left / right | 由 `wrapPadding.left` / `wrapPadding.right` 控制 |
| html 定位 | DG 自绘顶边锚点；autoWrap 高度 `height - INSET` |
