const path = require('path')
const webpack = require('webpack')
const baseWebpackConfig = require('./webpack.config.base.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin');


const result = Object.assign({}, baseWebpackConfig, {
    devtool: 'inline-source-map',
    entry: path.resolve(__dirname, "../src/index.tsx"),
    output: {
      path: path.resolve(__dirname, "../"),
      filename: `site.js`,
    },
    mode: 'development',
    devServer: {
      contentBase: path.join(__dirname, "../"),
      stats: 'errors-warnings',
      port: 9091,
      host: '0.0.0.0',
      watchOptions: {
        poll: true
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, "../src/site.html"),
        inject: true,
      }),
      new CaseSensitivePathsPlugin(),
      new ESLintPlugin({
        extensions: ['ts', 'tsx']
      }),
      new webpack.EnvironmentPlugin(['NODE_ENV', 'MOCK_TYPE'])
    ]
  })

module.exports = result;