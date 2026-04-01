# Agent 协作说明

本文档用于规范在 `didi/LogicFlow` 仓库中由 Agent 协作完成任务时的基础流程，减少上下文偏差与无效改动。

## 1. 分支约定

- 进行任务前，先从当前稳定分支切出工作分支。
- 分支名应语义化，避免使用 `tmp`、`update` 等无含义命名。
- 与 Codespace 相关任务建议使用 `codespace/*` 前缀。

示例：

```bash
git checkout -b codespace/agent-md
```

## 2. 工作范围

- 优先做最小必要改动，避免修改无关文件。
- 在动手前先阅读相关文档与上下文（如 `README.md`、`CONTRIBUTING.md`）。
- 若仅需方案/分析，直接给出结论，不进行代码改动。

## 3. 开发与验证

常用命令：

```bash
pnpm install
pnpm run lint:ts
pnpm run build
pnpm run test
```

说明：

- 提交前应至少完成与本次改动直接相关的验证。
- 若环境依赖或 Node 版本导致已有脚本失败，应在结果中明确说明失败原因与影响范围。

## 4. 提交规范

- 提交信息遵循 Conventional Commits。
- 常见类型：`feat`、`fix`、`docs`、`refactor`、`test`、`chore`。
- 文档类改动优先使用 `docs:` 前缀。

示例：

```bash
git commit -m "docs: add Agent collaboration guide"
```

## 5. Pull Request 要求

PR 描述建议包含：

1. 需求点或关联 issue；
2. 改动内容与原因；
3. 验证方式与结果；
4. 潜在影响与注意事项（如有）。

---

如需更完整的贡献与发布流程，请参考仓库根目录 `CONTRIBUTING.md`。
