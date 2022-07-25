const path = require('path');

const packagesEntry = {
  dagre: path.resolve(__dirname, '../src/dagre.ts'),
};

module.exports = {
  entry: packagesEntry,
  output: {
    path: path.resolve(__dirname, '../lib'),
    filename: '[name].js',
    libraryTarget: 'umd',
    // libraryExport: 'default', // 兼容 ES6(ES2015) 的模块系统、CommonJS 和 AMD 模块规范
  },
  resolve: {
    extensions: ['.ts', '.js'],
    symlinks: false,
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-typescript',
                  {
                    isTSX: true,
                    allExtensions: true,
                    jsxPragma: 'h',
                  },
                ],
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'usage',
                    corejs: '3.3',
                  },
                ],
              ],
            },
          },
        ],
      },
    ],
  },
  externals: {
    '@logicflow/core': 'window',
  },
};
