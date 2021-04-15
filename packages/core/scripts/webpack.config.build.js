const path = require('path');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const baseWebpackConfig = require('./webpack.config.base.js');

const { analyse } = process.env;
const plugins = [new CaseSensitivePathsPlugin()];
if (analyse) {
  plugins.push(new BundleAnalyzerPlugin());
}

module.exports = [
  {
    ...baseWebpackConfig,
    mode: 'production',
    entry: path.resolve(__dirname, '../src/index.tsx'),
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: 'logic-flow.js',
      libraryTarget: 'umd',
    },
    plugins,
  },
];
