const path = require('path')
const webpack = require('webpack')
const baseWebpackConfig = require('./webpack.config.base.js')
const config = require('../package.json')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const analyse = process.env.analyse
const plugins = [
  new CaseSensitivePathsPlugin()
]
if (analyse) { plugins.push(new BundleAnalyzerPlugin()) }

module.exports = [
  Object.assign({}, baseWebpackConfig, {
    mode: 'production',
    entry: path.resolve(__dirname, "../src/index.tsx"),
    output: {
      path: path.resolve(__dirname, "../dist"),
      filename: `logic-flow.js`,
      libraryTarget: 'umd',
    },
    plugins,
  }),
]