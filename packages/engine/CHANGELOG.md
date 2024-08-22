# @logicflow/engine

## 0.1.1

### Patch Changes

- 更新依赖

## 0.1.0

### Minor Changes

- Release 0.1.0 New Version 🎉🎉🎉🎉

- refactor: 重构 engine 模块代码，使用 sandbox.js 解决 iframe 频繁 append 导致的性能问题
- @logicflow/engine 默认使用 browser 执行代码，node 端也使用 @nyariv/sandboxjs 执行代码片段，保持两端一致
