const guide = [
  'start',
  {
    title: '基础教程',
    collapsable: false,
    children: [
      // 'basic/core',
      'basic/logic-flow',
      'basic/node',
      'basic/edge',
      'basic/grid',
      'basic/background',
      'basic/dnd',
      'basic/keyboard',
      'basic/redoundo',
      'basic/snapline',
      'basic/silent-mode',
    ]
  },
  {
    title: '进阶指引',
    collapsable: false,
    children: [
      'advance/theme',
      'advance/event',
      'advance/customNode',
      'advance/customEdge',
    ]
  },
  {
    title: '拓展',
    collapsable: false,
    children: [
      'extension/extension-intro',
      'extension/snapshot',
      'extension/adapter',
      'extension/bpmn-element',
      {
        title: '组件',
        collapsable: true,
        children: [
          'extension/extension-components',
          'extension/component-control',
          'extension/component-menu',
          'extension/component-dnd-panel',
          'extension/component-selection',
          'extension/component-minimap',
          'extension/component-custom'
        ]
      },
    ]
  }
];

const api = [
  'logicFlowApi',
  {
    title: '元素',
    collapsable: false,
    children: [
      'nodeApi',
      'edgeApi',
    ]
  },
  {
    title: '自定义元素',
    collapsable: false,
    children: [
      'customNodeApi',
      'customEdgeApi',
    ]
  },
];

const usage = ["bpmn", "approve"];

const article = [
  'article01',
  'article02',
  'article03',
];

const verisonInfo = [
  '0.3.0'
];

module.exports = {
  description: 'LogicFlow desc',
  themeConfig: {
    sidebarDepth: 1,
    logo: '/horizontal-logo.png',
    displayAllHeaders: false,
    sidebar: [],
    nav: [
      { text: '教程', link: '/guide/start' },
      { text: 'API', link: '/api/logicFlowApi' },
      { text: '示例', link: '/usage/bpmn' },
      { text: '常见问题', link: '/FAQ' },
      { text: '版本公告', link: '/version-info/0.3.0' },
      { text: '文章', link: '/article/article01' },
      { text: 'Github', link: 'https://github.com/didi/LogicFlow' },
    ],
    sidebar: {
      '/guide/': guide,
      '/version-info/': verisonInfo,
      '/api/': api,
      '/usage/': usage,
      '/article/': article,
    },
  },
};