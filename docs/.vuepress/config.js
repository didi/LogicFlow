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
      'extension/extension-components',
      'extension/bpmn-element',
      'extension/snapshot',
      'extension/adapter',
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
];

module.exports = {
  title: 'Logic Flow',
  description: 'Logic Flow desc',
  themeConfig: {
    sidebarDepth: 1,
    logo: '/logo.png',
    displayAllHeaders: false,
    sidebar: [],
    nav: [
      {text: '教程', link: '/guide/start'},
      {text: 'API', link: '/api/logicFlowApi'},
      {text: '示例', link: '/usage/bpmn'},
      {text: '文章', link: '/article/article01'},
      { text: 'Github', link: 'https://github.com/didi/LogicFlow' },
    ],
    sidebar: {
      '/guide/': guide,
      '/api/': api,
      '/usage/': usage,
      '/article/': article,
    }
  }
}