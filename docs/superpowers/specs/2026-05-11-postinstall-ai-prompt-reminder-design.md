---
name: postinstall-ai-prompt-reminder
description: postinstall 输出拆分提醒区与可复制 prompt，提醒区用终端背景色与加粗强调（无 boxen、无新增依赖）
type: project
---

# Postinstall AI Prompt：提醒区样式与输出结构

## 背景

`packages/core/scripts/postinstall-ai-prompt.js` 在安装 `@logicflow/core` 后打印一段中英文说明 + `<!-- BEGIN:logicflow-agent-rules -->` … `<!-- END:logicflow-agent-rules -->` 之间的 Agent 规则，以及「错过提示可到仓库 README 再查看」等提醒。

当前实现把**提醒文案**与**可复制正文**混在同一段字符串里，用户复制时容易带上提醒句；此前讨论过用 `boxen` 或 Unicode 画框，已否决：**不在 core 包增加仅服务于 postinstall 的运行时依赖**。

## 目标

1. **提醒**与 **prompt 正文**拆成两段输出，中间用**分割线**隔开。
2. **顺序**：上部为提醒，下部为可复制 prompt（与 markers 内规则一致）。
3. **提醒区醒目**：不使用 boxen 或 Unicode 框线包裹；改用 **加粗 + 背景色**（在终端能力允许时）。
4. **能力判断**：在不适宜输出的环境下降级为纯文本（无 ANSI），避免 CI/管道日志污染。
5. **提醒区信息**：提供 **GitHub 仓库 README 的直达链接**（与仓库一致，指向 `didi/LogicFlow`）。**不在 postinstall 中写死官网域名链接**，避免官方站点域名或路径变更导致失效；线上文档入口以 README / npm 包说明为准。

## 非目标

- 不引入 `boxen`、`chalk`、`supports-color` 等新依赖。
- 不改变 `package.json` 中 `postinstall` 入口路径（仍为 `node scripts/postinstall-ai-prompt.js`）。
- 不要求「检测真彩色」；仅使用广泛支持的 **SGR 16 色背景/前景**（或等价 ECMA-48 序列）即可。

## 输出结构（自上而下）

### 1. 提醒区（仅提醒，不出现在 markers 内）

建议包含（文案可在实现时微调，语义对齐即可）：

- 中英一句：**请将下方（BEGIN 与 END 之间）规则复制给 AI Agent**，并说明实现 LogicFlow 相关功能前先查阅本地官方文档。
- **若错过 postinstall 输出**：可到 **GitHub 仓库 README**（或 npm 上该包的 README）再次查看说明并复制规则。
- **链接（仅此一类）**：GitHub README：`https://github.com/didi/LogicFlow#readme`（或等价稳定直达路径，与仓库实际默认分支一致）。

### 2. 分割线

单独一行、整行重复同一字符（如 `─` 或 `=`）。

**长度**：不做额外「终端探测」，仅按 Node 惯例使用 `process.stdout.columns`：若为正整数则作为该行重复次数；若为 `undefined`、非数或无效则用固定默认长度（如 **80**，实现时可与团队偏好对齐）。若希望超宽终端下不要过长，可再套一层常见写法 **`Math.min(columns, N)`**（如 `N = 96` 或 `120`），这是 CLI 里习惯用的上限，不属于能力探测。

### 3. 可复制区（prompt 正文）

- **仅**输出 `<!-- BEGIN:logicflow-agent-rules -->` 至 `<!-- END:logicflow-agent-rules -->` 之间的内容（含两行 marker），与当前规则段落一致，便于用户从 BEGIN 拖到 END 一次复制。
- 不再把「错过提示 / README 引导」放在 END 之后（这些已上移到提醒区），避免复制区夹杂非规则文本。

## 提醒区样式（ANSI，无依赖）

### 启用样式条件（建议同时满足）

- `process.stdout.isTTY === true`
- `process.env.NO_COLOR` 未设置（遵守 [no-color.org](https://no-color.org/) 约定）
- `process.env.TERM !== 'dumb'`

可选收紧（实现时可二选一写入代码注释）：

- 若 `process.env.CI === 'true'` 且未设置 `FORCE_COLOR`，则禁用 ANSI，减少各类 CI 原始日志中的转义序列。

### 「支持背景色」的判定

不在仓库内实现精细的「仅前景终端」探测。约定：**满足上述启用条件时，视为可使用标准 SGR 背景码**（如 `ESC [ 43 m` 黄色背景等）；不满足则整段提醒不带任何转义序列。

若未来需更严检测，可在无依赖前提下增加启发式（例如 `COLORTERM`），但本 spec 不强制。

### 视觉效果建议

- **加粗**：`\x1b[1m`
- **背景色**：选用高对比组合，例如黄底黑字（`\x1b[43m\x1b[30m`）或蓝底亮白字；每一行提醒文本前缀后缀统一包一层样式，行尾 `\x1b[0m` 复位。
- 多行提醒时，每行单独包裹或块级包裹均可，以实现简单、复制提醒区时仍可选中多行为准（不要求「铺满终端宽度」的背景条，除非实现成本极低）。

## 实现位置

- 仅修改 **`packages/core/scripts/postinstall-ai-prompt.js`**：拆分字符串、`shouldUseAnsi()`（或同名）辅助函数、分割线生成、`console.log` 分次输出（或一次拼接含换行，但逻辑上分三块）。

## 验收

1. 本地 TTY：`node packages/core/scripts/postinstall-ai-prompt.js` 可见上部提醒加粗/背景（若未设 `NO_COLOR`），分割线下部为纯文本 markers + 规则。
2. `NO_COLOR=1` 或 `TERM=dumb` 或非 TTY：无 ANSI，仍为清晰三段结构。
3. BEGIN–END 内容与当前语义一致；提醒中含 GitHub README 链接，**不含**写死的官网教程 URL。
4. `packages/core/package.json` 无新增依赖。

## 后续

实现阶段按仓库流程编写变更说明并通过最小验证（本地执行脚本 + 按需回归安装路径）。
