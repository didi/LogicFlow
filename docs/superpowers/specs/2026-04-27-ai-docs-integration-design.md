---
name: ai-docs-integration
description: LogicFlow npm 包集成 AI 文档，让用户本地 AI 工具能理解如何使用 LogicFlow
type: project
---

# LogicFlow AI 文档集成设计

## 背景

Next.js 16.2 开始为 AI 开发而设计，在 npm 包中附带完整文档，让用户安装后本地 AI 工具（如 Claude Code、Cursor）能自动理解框架用法。

LogicFlow 希望实现类似能力：用户安装 `@logicflow/core` 后，AI 工具能：
1. 通过文档了解基础功能如何使用
2. 进一步可读取源代码了解未明文提供的 API

## Next.js 的实现参考

```
用户项目结构：
nextjs-app/
├── AGENTS.md                    # create-next-app 创建的入口文件
│                                # 内容指向 node_modules/next/dist/docs/
├── node_modules/
│   └── next/
│       └── dist/
│           └── docs/            # 421 个 markdown 文档（随 npm 包发布）
│               ├── 01-app/
│               ├── 02-pages/
│               └── index.md
```

工作流程：
1. `create-next-app` 创建项目时，把 AGENTS.md template 复制到用户项目根目录
2. AI 工具读取用户项目根目录的 AGENTS.md
3. AGENTS.md 指向 `node_modules/next/dist/docs/`
4. AI 工具从 node_modules 读取详细文档

## LogicFlow 的场景差异

LogicFlow 用户通常不是用脚手架创建项目，而是直接在现有项目中安装：
```bash
npm install @logicflow/core @logicflow/extension
```

因此采用 **postinstall 输出 prompt** 的方式引导用户。

## 设计方案

### 文档来源与目标位置

| 来源 | 目标位置 |
|------|---------|
| `sites/docs/docs/tutorial/` | `packages/core/dist/docs/tutorial/` |
| `sites/docs/docs/api/` | `packages/core/dist/docs/api/` |

**不复制的内容：**
- `article/` — 面向读者的技术文章
- `release/` — 版本发布说明

### npm 包结构（发布后）

```
node_modules/@logicflow/core/
├── dist/
│   ├── index.min.js           # UMD 构建
│   ├── docs/                  # AI 文档（新增）
│   │   ├── tutorial/
│   │   │   ├── basic/         # 基础：节点、边、事件、主题等
│   │   │   ├── advanced/      # 进阶：键盘、拖拽、React/Vue 集成等
│   │   │   └── extension/     # 插件：MiniMap、Group、Menu 等
│   │   └── api/
│   │       ├── detail/
│   │       ├── model/
│   │       └── theme/
│   ├── ...
├── es/                        # ESM 构建
├── lib/                       # CJS 构建
```

### postinstall prompt 输出

用户安装 `@logicflow/core` 时，postinstall 脚本输出：

```
<!-- BEGIN:logicflow-agent-rules -->
# LogicFlow Reference

LogicFlow 文档位于 `node_modules/@logicflow/core/dist/docs/`。
使用前请阅读入门文档和 API 参考。
<!-- END:logicflow-agent-rules -->

📋 请将以上内容粘贴给你的 AI Agent，AI 会记住文档位置。
```

### 发布流程

```bash
pnpm build          # 构建代码（lib、es、dist）
pnpm build:docs     # 复制文档到 packages/core/dist/docs/
pnpm changeset version
pnpm publish:only   # 发布到 npm（包含 dist/docs/）
```

## 实现清单

### 1. 复制脚本 `scripts/copy-ai-docs.js`

功能：
- 复制 `sites/docs/docs/tutorial/` → `packages/core/dist/docs/tutorial/`
- 复制 `sites/docs/docs/api/` → `packages/core/dist/docs/api/`
- 保留中英文两个版本（`.zh.md` + `.en.md`）
- 保留原格式（frontmatter、dumi 特殊语法）

### 2. 根 `package.json` 新增命令

```json
{
  "scripts": {
    "build:docs": "node scripts/copy-ai-docs.js"
  }
}
```

### 3. `packages/core/package.json` 修改

```json
{
  "files": [
    "dist",
    "es",
    "lib"
  ],
  "scripts": {
    "postinstall": "node scripts/postinstall-ai-prompt.js"
  }
}
```

### 4. postinstall 脚本 `packages/core/scripts/postinstall-ai-prompt.js`

输出 prompt 内容到终端。

### 5. 文档结构调整建议

可考虑在 `packages/core/dist/docs/` 根目录添加 `index.md` 作为文档入口索引：

```markdown
# LogicFlow 文档

## 入门教程
- tutorial/get-started.zh.md - 快速上手（中文）
- tutorial/get-started.en.md - Quick Start（英文）

## 核心 API
- api/ - API 参考

## 扩展插件
- tutorial/extension/ - 插件使用指南（MiniMap、Group、DndPanel 等）
```

## 多包策略

| 包 | 文档位置 | postinstall |
|---|---------|-------------|
| `@logicflow/core` | `dist/docs/`（包含教程 + API + extension） | ✅ 有 |
| `@logicflow/extension` | 无独立文档（文档已在 core 中） | ❌ 无 |
| `@logicflow/layout` | 无独立文档（文档已在 core 中） | ❌ 无 |

理由：
- extension 和 layout 的文档统一放在 core 包中，便于 AI 一次性获取完整知识
- 用户安装 core 后，即使没装 extension，AI 也能告知"如需 MiniMap 请安装 @logicflow/extension"

## 后续优化方向

1. **文档精简版**：可考虑生成去除 frontmatter 和特殊语法的"AI 专用版"，提升 AI 解析效率
2. **增量更新**：文档变更时只更新变化部分，避免全量复制
3. **版本同步检查**：构建时检查文档版本与包版本是否匹配