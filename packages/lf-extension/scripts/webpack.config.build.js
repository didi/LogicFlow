const path = require('path')
const webpack = require('webpack')
const baseWebpackConfig = require('./webpack.config.base.js')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')

module.exports = [
  Object.assign({}, baseWebpackConfig, {
    mode: 'production',
    output: {
      path: path.resolve(__dirname, "../lib"),
      filename: `[name].js`,
      libraryTarget: 'umd',
    },
    plugins: [
      new CaseSensitivePathsPlugin(),
      new webpack.EnvironmentPlugin(['NODE_ENV', 'MOCK_TYPE'])
    ]
  })
]