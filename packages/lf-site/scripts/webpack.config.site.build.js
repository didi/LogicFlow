const path = require('path')
const webpack = require('webpack')
const baseWebpackConfig = require('./webpack.config.base.js')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = [
  Object.assign({}, baseWebpackConfig, {
    mode: 'production',
    output: {
      path: path.resolve(__dirname, "../site-build"),
      filename: `index.js`,
    },
    plugins: [
      new CaseSensitivePathsPlugin(),
      new HtmlWebpackPlugin({
        filename: 'site.html',
        template: path.resolve(__dirname, "../site.html"),
        inject: true,
      }),
    ]
  })
]
