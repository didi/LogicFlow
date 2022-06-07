const path = require('path');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const baseWebpackConfig = require('./webpack.config.base.js');
const TerserJSPlugin = require('terser-webpack-plugin');
const { analyse } = process.env;
const plugins = [new CaseSensitivePathsPlugin()];
if (analyse) {
  plugins.push(new BundleAnalyzerPlugin());
}
const entryPath = path.resolve(__dirname, '../src/index.tsx');
module.exports = [
  {
    ...baseWebpackConfig,
    mode: 'production',
    entry: {
      'logic-flow': entryPath,
      'logic-flow.min': entryPath,
    },
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: '[name].js',
      libraryTarget: 'umd',
    },
    plugins,
    optimization: {
      minimize: true,
      minimizer: [
        new TerserJSPlugin({
          include: /\.min\.js$/,
          extractComments: false,
          terserOptions: {
            compress: {
              drop_console: true,
              pure_funcs: ['console.log'],
            },
          },
        }),
      ],
    },
  },
];
