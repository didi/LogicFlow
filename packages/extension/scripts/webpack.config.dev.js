const path = require('path')
const webpack = require('webpack')
const baseWebpackConfig = require('./webpack.config.base.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin');

// 先不用webpack merge
module.exports = [
  Object.assign({}, baseWebpackConfig, {
    devtool: 'inline-source-map',
    mode: 'development',
    devServer: {
      contentBase: path.join(__dirname, "../../"),
      stats: 'errors-warnings',
      port: 9092,
      host: '0.0.0.0',
      watchOptions: {
        poll: true
      },
      // proxy: getProxy()
    },
    plugins: [
      // new HtmlWebpackPlugin({
      //   filename: 'index.html',
      //   template: path.resolve(__dirname, "../index.html")
      // }),
      new CaseSensitivePathsPlugin(),
      // new ESLintPlugin({
      //   extensions: ['ts', 'tsx']
      // }),
      new webpack.EnvironmentPlugin(['NODE_ENV', 'MOCK_TYPE'])
    ]
  }),
]
