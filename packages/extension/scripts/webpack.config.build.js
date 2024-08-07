const path = require('path');
const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const baseWebpackConfig = require('./webpack.config.base.js');

module.exports = [
  {
    ...baseWebpackConfig,
    mode: 'production',
    output: {
      path: path.resolve(__dirname, '../lib'),
      filename: '[name].js',
      libraryTarget: 'umd',
    },
    plugins: [
      new CaseSensitivePathsPlugin()
    ],
  },
];
