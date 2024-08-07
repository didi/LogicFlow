# Contribution Guideline

## Pull Requests

LogicFlow对外持开放态度，不论是只修改文档的标点符号还是对LogicFlow的整体功能有大的重构我们都欢迎。对于您的每一个PR我们都会认真查看、回复、合并。

### Start

我们选用 fork 仓库，然后提交 PR 的形式进行开发。具体方式可以参考: [我是如何在 GitHub 上提交 PR 的](https://juejin.cn/post/6844904103294795789).

### 安装项目依赖

> 需要提前安装 yarn

```shell
npm run bootstrap
```

### 运行文档

```shell
npm run docs:dev
```

### 构建 types 并打包

LF 使用 monorepo 的形式进行管理，各个 package 之间存在依赖关系，所以需要先构建一次类型和源码才能进行开发。

```shell
npm run build:types

npm run build
```

### 启动本地开发

开发 core 包

```shell
cd packages/core
npm run dev

# 或跳过以上“构建部分”直接运行
npm run dev:core
```

开发 extension

```shell
cd packages/extension
npm run dev

# 或跳过以上“构建部分”直接运行
npm run dev:extension
```

## Issues

如果您使用LogicFlow过程中遇到问题或者有任何想法，欢迎点击LogicFlow [issues](https://github.com/didi/LogicFlow/issues)给我们提issue和我们交流。

一般来说通过文字和截图的描述我们可能无法定位到问题，为了帮助我们快速定位问题并修复，请按照以下指南编写并上传最简复现demo：

1. 在任意在线编码平台，编写示例如[codesanbox](https://codesandbox.io/s/logicflow-step3-mhge5)。将其保存到自己空间，然后贴上链接。
2. 在自己github中创建一个最简单的示例，然后贴上github链接。
3. 删除项目中的node_modules部分，打包项目，并拖拽到issue输入框中上传（或提供远程可下载地址）