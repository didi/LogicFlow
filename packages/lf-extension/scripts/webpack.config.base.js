const path = require('path')
// const VueLoaderPlugin = require('vue-loader/lib/plugin')
const { version } = require('../package.json')

const packagesEntry = {
  BpmnAdapter: path.resolve(__dirname, "../src/adapter/bpmn/index.ts"),
  Snapshot: path.resolve(__dirname, "../src/extension/snapshot/index.ts"),
  RectLabelNode: path.resolve(__dirname, "../src/extension/rect-label-node/index.ts"),
  BpmnElement: path.resolve(__dirname, "../src/extension/bpmn/index.ts"),
  ResizeNode: path.resolve(__dirname, "../src/extension/resize-node/index.ts"),
}

module.exports = {
  entry: packagesEntry,
  output: {
    path: path.resolve(__dirname, "../lib"),
    filename: `[name].js`,
    libraryTarget: 'umd',
    // libraryExport: 'default', // 兼容 ES6(ES2015) 的模块系统、CommonJS 和 AMD 模块规范
  },
  resolve: {
    alias: {
      "react": "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".less", ".css"]
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-typescript',
                {
                  isTSX: true,
                  allExtensions: true,
                  jsxPragma: "h"
                }
              ],
              [
                '@babel/preset-env',
                {
                  "useBuiltIns": "usage",
                  "corejs": '3.3'
                }
              ]
            ],
          }
        },
        // {
        //   loader: 'eslint-loader'
        // }
      ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            }
          },
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 100000000
        }
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader'
          },
        ]
      }
    ]
  }
}