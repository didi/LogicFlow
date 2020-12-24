const path = require('path')
// const VueLoaderPlugin = require('vue-loader/lib/plugin')
const { version } = require('../package.json')
const source = process.env.source;

module.exports = {
  entry: path.resolve(__dirname, "../src/index.tsx"),
  output: {
    path: path.resolve(__dirname, "../"),
    filename: `site.js`,
  },
  resolve: {
    alias: {
      "react": "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".less", ".css"],
    symlinks: false,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: source ? /node_modules\/(?!(logic-flow)).*\// : /node_modules/,
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