# developer tips

## publish

### clone 源码仓库

```shell
git clone git@github.com:didi/LogicFlow.git
```

### 源码打包

```shell
# 安装依赖
npm run bootstrap

# 构建 type
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
