# LogicFlow 使用示例

该目录下的示例为[【文档】](http://logic-flow.org/)的辅助示例，示例使用 React 框架进行开发，但 LogicFlow 不依赖于任何宿主环境。

## 项目启动

### 安装依赖

LogicFlow 使用 monorepo 的形式对项目进行管理，所以我们应该先到根目录下执行以下命令：

```shell
npm run bootstrap

npm run build:types

npm run build
```

### 启动调试

```shell
# 回到 examples 目录下
cd examples

yarn dev
```

### 打包构建

```shell
yarn build
```
