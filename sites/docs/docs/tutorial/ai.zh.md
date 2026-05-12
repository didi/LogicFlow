---
nav: 指南
group:
  title: 介绍
title: AI 编程支持
order: 2
toc: content
---

LogicFlow 从 `@logicflow/core@2.2.2` 开始，把教程和 API 文档随 npm 包一起发布。你可以把本页的提示词复制给 AI Agent，让它在你的项目里直接读取本地文档，而不是只凭通用经验实现功能。

## 什么时候复制给 Agent

建议在这些场景复制：

1. 首次安装 `@logicflow/core` 后
2. 升级 `@logicflow/core` 后
3. 准备让 Agent 实现 LogicFlow 相关功能前

如果 Agent 已经拿到旧提示词，但仍然没有按官方插件或布局能力实现功能，也可以重新复制下面的最新提示词。

## Agent 需要知道什么

LogicFlow 主要由三个包组成：

- `@logicflow/core`：核心画布运行时，包含画布、节点、边、模型、事件、渲染、主题和基础交互能力。
- `@logicflow/extension`：官方插件包，用于常见产品功能。
- `@logicflow/layout`：官方布局插件包，用于自动布局。

这些包的使用文档都发布在 `node_modules/@logicflow/core/dist/docs/` 中。其中 `@logicflow/extension` 和 `@logicflow/layout` 的文档主要在 `tutorial/extension/` 目录下。

## 复制给 Agent 的提示词

将下面整段内容复制给你的 AI Agent：

```md
<!-- BEGIN:logicflow-agent-rules -->
# LogicFlow Agent Rules

LogicFlow documentation is available at:

- `node_modules/@logicflow/core/dist/docs/`

Package roles:

- `@logicflow/core`: core graph editor runtime, including canvas, nodes, edges, models, events, rendering, themes, and basic interactions.
- `@logicflow/extension`: official plugins for common product features.
- `@logicflow/layout`: official layout plugins for automatic graph layout.

The docs for `@logicflow/extension` and `@logicflow/layout` are included under:

- `node_modules/@logicflow/core/dist/docs/tutorial/extension/`

Before implementing any LogicFlow feature, check the local docs first to see whether LogicFlow already provides a built-in, extension, or layout capability. If it does, prefer the documented official capability instead of reimplementing it from scratch.

If an official package is needed but not installed, ask the user before installing it.
<!-- END:logicflow-agent-rules -->
```

## 下一步阅读

- 第一次接入 LogicFlow：阅读 [快速上手](get-started.zh.md)
- 需要插件或布局能力：阅读 [插件简介](extension/intro.zh.md)
- 需要精确 API 参数：阅读 [API 导览](../api/logicflow-instance/index.zh.md)
