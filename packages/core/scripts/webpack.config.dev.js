const path = require('path')
const webpack = require('webpack')
const baseWebpackConfig = require('./webpack.config.base.js')
const packagesConfig = require('../../extension/scripts/webpack.config.base.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin');
const getProxy = require('./config')
// const packagesEntry = require('./packages.config');

// 先不用webpack merge
module.exports = [
  Object.assign({}, baseWebpackConfig, {
    devtool: 'inline-source-map',
    mode: 'development',
    devServer: {
      contentBase: path.join(__dirname, "../"),
      stats: 'errors-warnings',
      port: 9090,
      host: 'localhost',
      watchOptions: {
        poll: true
      },
      proxy: getProxy()
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, "../index.html")
      }),
      new CaseSensitivePathsPlugin(),
      new ESLintPlugin({
        context: path.resolve(__dirname, "../src"),
        extensions: ['ts', 'tsx']
      }),
      new webpack.EnvironmentPlugin(['NODE_ENV', 'MOCK_TYPE'])
    ]
  }),
  Object.assign({}, packagesConfig, {
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
      path: path.resolve(__dirname, "../lib"),
      filename: `[name].js`,
      libraryTarget: 'umd',
      libraryExport: 'default', // 兼容 ES6(ES2015) 的模块系统、CommonJS 和 AMD 模块规范
    },
    plugins: [
      new CaseSensitivePathsPlugin(),
      new webpack.EnvironmentPlugin(['NODE_ENV', 'MOCK_TYPE'])
    ]
  })
  // Object.assign({}, baseWebpackConfig, {
  //   devtool: 'inline-source-map',
  //   mode: 'development',
  //   entry: packagesEntry,
  //   output: {
  //     path: path.resolve(__dirname, "../lib"),
  //     filename: `[name].js`,
  //     libraryTarget: 'umd',
  //     libraryExport: 'default', // 兼容 ES6(ES2015) 的模块系统、CommonJS 和 AMD 模块规范
  //   },
  //   plugins: [
  //     new CaseSensitivePathsPlugin(),
  //     new webpack.EnvironmentPlugin(['NODE_ENV', 'MOCK_TYPE'])
  //   ]
  // })
]
