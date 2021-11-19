const path = require('path');

const packagesEntry = {
  BpmnAdapter: path.resolve(__dirname, '../src/bpmn-adapter/index.ts'),
  TurboAdapter: path.resolve(__dirname, '../src/turbo-adapter/index.ts'),
  Snapshot: path.resolve(__dirname, '../src/tools/snapshot/index.ts'),
  RectLabelNode: path.resolve(__dirname, '../src/rect-label-node/index.ts'),
  BpmnElement: path.resolve(__dirname, '../src/bpmn/index.ts'),
  ContextMenu: path.resolve(__dirname, '../src/components/context-menu/index.ts'),
  Control: path.resolve(__dirname, '../src/components/control/index.ts'),
  Menu: path.resolve(__dirname, '../src/components/menu/index.ts'),
  DndPanel: path.resolve(__dirname, '../src/components/dnd-panel/index.ts'),
  MiniMap: path.resolve(__dirname, '../src/components/mini-map/index.ts'),
  CurvedEdge: path.resolve(__dirname, '../src/materials/curved-edge/index.ts'),
  Group: path.resolve(__dirname, '../src/materials/group/index.ts'),
  InsertNodeInPolyline: path.resolve(__dirname, '../src/insert-node-in-polyline/index.ts'),
  SelectionSelect: path.resolve(__dirname, '../src/components/selection-select/index.ts'),
  NodeResize: path.resolve(__dirname, '../src/NodeResize/index.ts'),
  InsertNodeInPolyline: path.resolve(__dirname, '../src/insert-node-in-polyline/index.ts'),
  FlowPath: path.resolve(__dirname, '../src/tools/flow-path/index.ts'),
  AutoLayout: path.resolve(__dirname, '../src/tools/auto-layout/index.ts'),
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
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.less', '.css'],
    symlinks: false,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
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
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 100000000,
        },
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
          },
        ],
      },
    ],
  },
  externals: {
    '@logicflow/core': 'window'
  }
};
