# logicflow-docs

## 2.0.17

### Patch Changes

- Updated dependencies
  - @logicflow/core@2.0.11
  - @logicflow/extension@2.0.15
  - @logicflow/react-node-registry@1.0.12

## 2.0.16

### Patch Changes

- 增加业务场景示例
- fix(docs): 修复文档中“基础教程”和“实例”部分的 nodeModel 和 edgeModel 跳转地址错误

- Updated dependencies
  - @logicflow/core@2.0.10
  - @logicflow/extension@2.0.14
  - @logicflow/react-node-registry@1.0.11

## 2.0.15

### Patch Changes

- Updated dependencies
  - @logicflow/core@2.0.9
  - @logicflow/extension@2.0.13
  - @logicflow/react-node-registry@1.0.10

## 2.0.14

### Patch Changes

- Updated dependencies
  - @logicflow/react-node-registry@1.0.9

## 2.0.13

### Patch Changes

- feat(docs): 增加动画边demo
- feat: 关闭 useSpeedInsights
- feat: 新增渐进连线功能说明文档
- fix: 修正文档内容拼写错误
- fix: group插件参数改动补充到文档里

- Updated dependencies
  - @logicflow/core@2.0.8
  - @logicflow/extension@2.0.12
  - @logicflow/react-node-registry@1.0.8

## 2.0.12

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
  - @logicflow/extension@2.0.11
  - @logicflow/react-node-registry@1.0.7

## 2.0.11

### Patch Changes

- Updated dependencies
  - @logicflow/core@2.0.6
  - @logicflow/extension@2.0.10
  - @logicflow/react-node-registry@1.0.6

## 2.0.10

### Patch Changes

- Updated dependencies
  - @logicflow/core@2.0.5
  - @logicflow/extension@2.0.9
  - @logicflow/react-node-registry@1.0.5

## 2.0.9

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @logicflow/core@2.0.4
  - @logicflow/extension@2.0.8
  - @logicflow/react-node-registry@1.0.4

## 2.0.8

### Patch Changes

- Updated dependencies
  - @logicflow/extension@2.0.7

## 2.0.7

### Patch Changes

- Updated dependencies
  - @logicflow/extension@2.0.6

## 2.0.6

### Patch Changes

- Updated dependencies
  - @logicflow/extension@2.0.5

## 2.0.5

### Patch Changes

- Updated dependencies
  - @logicflow/extension@2.0.4
  - @logicflow/core@2.0.3
  - @logicflow/react-node-registry@1.0.3

## 2.0.4

### Patch Changes

- Updated dependencies
  - @logicflow/extension@2.0.3

## 2.0.3

### Patch Changes: 优化 docs 项目打包，减少包体积，修复若干 bug

- 升级 rollup 以及相关 plugins 版本，用于解决 build:umd 时 sourceMap 失败的问题
- 增加 visualizer 包用于分析打包产物
- docs 中 global.ts 中依赖加载通过 import 引入，之前通过 require 引入会导致 tree-shaking 失效
- 修复文档中 core 包 css 资源地址错误的问题
- 升级 dumi-theme-logicflow 包为 0.0.19，将 @babel/standalone 按需加载
- 官网移除百度统计埋点

- Updated dependencies
  - @logicflow/core@2.0.2
  - @logicflow/extension@2.0.2
  - @logicflow/react-node-registry@1.0.2

## 2.0.2

### Patch Changes

- Updated dependencies
  - @logicflow/core@2.0.1
  - @logicflow/extension@2.0.1
  - @logicflow/react-node-registry@1.0.1
- 更新dumi-theme-simple版本为0.0.18
- 完善 getTransform 方法的相关文档
- 增加升级到2.0版本说明 & API模块-事件部分增加文本事件
- 更新首页图片资源为 gift 资源

## 2.0.1

### Patch Changes

- Updated dependencies

  - @logicflow/core@2.0.0
  - @logicflow/extension@2.0.0
  - @logicflow/react-node-registry@1.0.0

- sites 中新增 docs 作为文档官网

  - update 「sites/docs」更新官方文档
  - 解决 docs 中类型定义错误的问题
  - 更新示例
  - 解决 docs 中的一些类型定义问题
  - 更新core包中事件系统的文档

  - 解决 docs 启动时「The same observable object cannot appear twice in the same tree」错误

    - 节点定义写法有问题，observer 属性赋值给另一个 observer 属性，导致触发上面错误
    - 更新包版本
    - DEFAULT_GRID_SIZE 将默认的 gridSize 值提成常量值，放在 constant 中，方便修改
    - 快速上手页优化 & API页方法分类 & 修复sites启动运行warning & 修复API页中英切换左侧nav不一致问题

  - 官网优化

    - 补充节点properties属性demo
    - 优化和修正概念解释
    - 添加项目模块命名空间,可以单独往某个模块添加依赖
    - 矩形、椭圆、多边形、菱形、圆可在properties.style设置样式属性
    - 文案统一
    - 增加微信官方号二维码
    - 快速上手页补充插件使用和数据转换
    - 文档中，内部导航统一放到右边
    - api顺序调整
    - 处理官网demo-ts报错提示
    - 增加企业用户展示墙

  - 更新 menu extension 官网文档示例代码

  - 更新官网项目 dumi 主题，使用 @logicflow/dumi-theme-simple 作为主题

    - 根据主题配置优化官网命名，en -> English, zh - 中文
    - 格式化所有 md 文档，修复文档中链接错误问题，解决代码块代码错误问题
    - 文档文件夹分组优化
    - 引入 examples 能力，支持在项目中实时更改并查看效果

  - 调整官网 markdown 资源结构，新模板配置项更新
    - 使用 dumi-theme-simple@0.0.2 版本，更新 Header 布局
    - 格式化文档，并更新文档中资源链接
    - 调整资源配置，使得官网可正常访问
  - 官网 API、文章模块修复链接跳转错误和细节优化
  - 增加 NodeResize/Group 插件废弃的说明，整理 extension 中导出插件分类
  - 增加树状逻辑编排demo&示例增加github跳转入口
  - doc use mako 打包，增加 Label 和 DynamicGroup 插件 demo
  - 新增 react-node-registry & vue-node-registry 包文档
    - 调整插件文档顺序
    - 格式化 highlight 插件文档格式
    - 增加 Label、DynamicGroup 插件文档
    - 更新、新增、待废弃 插件新增 tag 标记
  - 新增 dynamic-group 和 label 插件的文档
  - 完善mini-map官网文档
