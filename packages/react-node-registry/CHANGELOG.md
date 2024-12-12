# @logicflow/react-node-registry

## 1.0.10

### Patch Changes

- Updated dependencies
  - @logicflow/core@2.0.9

## 1.0.9

### Patch Changes

- release react/vue-node-registry

## 1.0.8

### Patch Changes

- Updated dependencies
  - @logicflow/core@2.0.8

## 1.0.7

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

## 1.0.6

### Patch Changes

- Release New Version
- Updated dependencies
  - @logicflow/core@2.0.6

## 1.0.5

### Patch Changes

- Updated dependencies
  - @logicflow/core@2.0.5

## 1.0.4

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @logicflow/core@2.0.4

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

- feat: 开发 react-node-registry 包用于用户自定义 react 节点
  - 通过监听 properties 变化的事件，触发节点的更新
  - 通过 Portal 的方式，可以获取到宿主系统的数据（比如状态），保持组件渲染和系统同步
  - react-node-registry 包增加 LICENSE 文件
