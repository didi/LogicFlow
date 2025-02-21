# @logicflow/vue-node-registry

## 1.0.13

### Patch Changes

- Updated dependencies
  - @logicflow/core@2.0.11

## 1.0.12

### Patch Changes

- fix: 修复issue反馈的bug
- Updated dependencies
  - @logicflow/core@2.0.10

## 1.0.11

### Patch Changes

- Updated dependencies
  - @logicflow/core@2.0.9

## 1.0.10

### Patch Changes

- release react/vue-node-registry

## 1.0.9

### Patch Changes

- Updated dependencies
  - @logicflow/core@2.0.8

## 1.0.8

### Patch Changes

- fix: 修复一些问题
  - fix: 修复一些问题
  - fix: 修复文本拖拽不符合预期的问题 by ChangeSuger
  - feat: 支持动态修改 Grid 的配置 by ChangeSuger
  - fix: 修复 2.x 与 1.x 下相同的网格线宽，Grid 表现不一致的问题 by ChangeSuger
  - fix: node:dnd-drag 增加事件数据 by HeatonZ
  - fix(extension): 【dynamic-group】修复mousemove和isCollapsed相关问题 by wbccb
  - fix: 修复 windows 系统 node20 环境下样式文件打包失败的问题 by ChangeSuger
  - fix: 修复 node:dnd-drag 事件的类型检查问题 by ChangeSuger
  - fix(example): 修复文档中vue3自定义组件不能正常显示bug by zkt2002
  - fix(core): 在没有拖拽的情况下，Control组件突然销毁，不触发cancelDrag(#1926) by wbccb
  - fix(core): 修复笔记本触摸板点击边事件失效 by wuchenguang1998
  - feat(examples): 添加动画边demo by DymoneLewis
  - fix(core): 类型定义 properties:change 改为 node:properties-change by HeatonZ
  - feat: node-registry 自定义properties类型 by HeatonZ
  - fix(core): 修复 polyline 与多边形节点的交点不正确的问题 by Yuan-ZW
- Updated dependencies
  - @logicflow/core@2.0.7

## 1.0.7

### Patch Changes

- fix(vue-node-registry): 修复Teleport+KeepAlive场景下DOM重复渲染的问题 close #1768 #1862

- Updated dependencies
  - @logicflow/core@2.0.6

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
