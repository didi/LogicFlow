# developer tips

## Start

我们选用 fork 仓库，然后提交 PR 的形式进行开发。

### clone 自己 fork 后的仓库

```shell
git clone <your forked repository>
```

### 安装项目依赖

> 需要提前安装 yarn

```shell
npm run bootstrap
```

### 构建 types 并打包

LF 使用 monorepo 的形式进行管理，各个 package 之间存在依赖关系，所以需要先构建一次类型和源码才能进行开发。

```shell
npm run build:types

npm run build
```

### 启动本地开发

开发core包

```shell
cd packages/core

npm run dev
```

开发extension

```shell
cd packages/extension

npm run dev
```

windows 和 mac 平台的换行不一致，windows 下是 CRLF，mac 下是 LF，因此 windows 系统下需要修改 eslint 规则：

```js
{
  rules: {
    'linebreak-style': ['error', 'unix'],
    // ...
  }
}

// 改为
{
  rules: {
    'linebreak-style': ['error', node.env.NODE_ENV === 'production' ? 'unix' : 'windows'],
    // ...
  }
}
```

## Publish

### clone 源码仓库

```shell
git clone git@github.com:didi/LogicFlow.git
```

### 源码打包

```shell
# 安装依赖
npm run bootstrap

# 构建 types
npm run build:types

# 打包
npm run build
```

### 更改 npm 官方源

```shell
npm config set registry https://registry.npmjs.org/
```

### 本地登陆 npm

```shell
npm login

# 查看是否已经登陆
npm whoami
```

### 为项目添加 tags

```shell
lerna verion patch
```

lerna version 的详细使用方式见[这里](https://github.com/lerna/lerna/tree/main/commands/version#readme)

### 发布版本

```shell
npm run lerna:publish
```
