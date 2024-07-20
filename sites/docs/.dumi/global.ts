if (window) {
  (window as any).react = require('react');
  (window as any).reactDom = require('react-dom');
  (window as any).antd = require('antd');
  (window as any).insertCSS = require('insert-css');
  (window as any).LogicFlow = require('@logicflow/core').default;
  (window as any).Extension = require('@logicflow/extension').default;
  // ;(window as any).x6ReactShape = require('@logicflow/react-node-registry')
}
