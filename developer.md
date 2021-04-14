# developer tips

## Start

我们选用 fork 仓库，然后提交 PR 的形式进行开发。

### clone 自己 fork 后的仓库

```shell
git clone <your forked repository>
```

### 安装项目依赖

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

## for windows

在 widnows 下启动，总体流程是一致的，但是目前命令只适合 mac ，需要做些改动

1. packages/core/package.json

```shell
"types": "tsc -d --declarationDir ./types --outDir temp; rimraf temp",

// 改为下面命令

"types": "tsc -d --declarationDir ./types --outDir temp && npm run remove:temp",
"remove:temp": "node ./scripts/remove-temp.js"
```

2. 在 packages/core/scripts 下新增 remove-temp.js

```javascript
const rimraf = require("rimraf");
const path = require('path');
const tempPath = path.resolve(__dirname, "../temp");
rimraf(tempPath, function(error) {
  console.log(error);
});
```

3. packages/extension/package.json

```shell
"dev": "NODE_ENV=development MOCK_TYPE=mock webpack-dev-server --client-log-level warning --config scripts/webpack.config.dev.js",
"types": "tsc -d --declarationDir ./types --outDir temp; rm -rf -R temp",
"build:umd": "NODE_ENV=production webpack --config scripts/webpack.config.build.js",

// 改为下面
"dev": "cross-env NODE_ENV=development MOCK_TYPE=mock webpack-dev-server --client-log-level warning --config scripts/webpack.config.dev.js",
"types": "tsc -d --declarationDir ./types --outDir temp && npm run remove-temp",
"build:umd": "cross-env NODE_ENV=production webpack --config scripts/webpack.config.build.js",
"remove-temp": "node ./scripts/remove-temp.js"
```

4. 在 packages/extension/scripts 下新增 remove-temp.js

```javascript
const rimraf = require("rimraf");
const path = require('path');
const tempPath = path.resolve(__dirname, "../temp");
rimraf(tempPath, function(error) {
  console.log(error);
});
```

5. examples/package.json

```shell
"build": "PUBLIC_URL='./' node scripts/build.js",

// 改为

"build": "cross-env PUBLIC_URL='./' node scripts/build.js",
```

6. .eslintrc.js

因为 windows 和 mac 平台的换行不一致， windows 下是 CRLF ，mac 下是 LF

```shell
'linebreak-style': ['error', 'unix'],

// 改为

'linebreak-style': ['off', 'unix'],
```
