# @logicflow/vue-node-registry

## 1.0.6

### Patch Changes

- Updated dependencies
  - @logicflow/core@2.0.5

## 1.0.5

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @logicflow/core@2.0.4

## 1.0.4

### Patch Changes

- fix: bugs from issues

  - fix: 移除 vue-node-registry view 中无用 console，close #1856

## 1.0.3

### Patch Changes: Release 1.0.3 Version

- Updated dependencies
  - @logicflow/core@2.0.3

## 1.0.2

### Patch Changes

- Release New Version，移除多余 console

- Updated dependencies
  - @logicflow/core@2.0.2

## 1.0.1

### Patch Changes

- Updated dependencies
  - @logicflow/core@2.0.1

## 1.0.0

### Patch Changes

- Release 2.0 New Version 🎉🎉🎉🎉
- Updated dependencies

  - @logicflow/core@2.0.0

- feat: 开发 vue-node-registry 包用于用户自定义 vue 节点

  - 通过监听 properties 变化的事件，触发节点的更新
  - 利用 Teleport 将组件内部的一部分模板传送到组件的 DOM 结构外层的位置去
  - 修复 vue-node-registry 包在 vue2 项目中渲染失效的问题
    - 更新 extension 包的 package.json
    - 修复 vue-node-registry 渲染顺序，先 appendChild，再 new Vue
    - 修复渲染自定义节点 new Vue2 实例时未传 el 的问题
