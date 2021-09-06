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
      'extension/extension-node-resize',
      'extension/extension-insert-node-in-polyline.md',
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
    title: 'Model',
    collapsable: false,
    children: [
      'graphModelApi',
      'baseNodeModelApi',
      'baseEdgeModelApi',
      'transformModelApi',
      'editConfigModelApi',
    ]
  },
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
  'NodeResize'
];

const verisonInfo = [
  '0.3.0',
  '0.4.0',
  '0.6.0'
];

module.exports = {
  title: 'LogicFlow',
  description: 'LogicFlow desc',
  head: [['link', { rel: 'icon', href: '/new-logo.svg' }]],
  plugins: ['@vuepress-reco/vuepress-plugin-back-to-top'],
  themeConfig: {
    sidebarDepth: 1,
    logo: '/horizontal-logo.png',
    displayAllHeaders: false,
    smoothScroll: true,
    search: true,
    lastUpdated: '最后更新时间',
    repo: 'https://github.com/didi/LogicFlow',
    docsDir: 'docs',
    editLinks: true,
    editLinkText: '在 Github 上改善此页',
    nav: [
      { text: '教程', link: '/guide/start' },
      { text: 'API', link: '/api/logicFlowApi' },
      { text: '示例', link: '/usage/bpmn' },
      { text: '常见问题', link: '/FAQ' },
      // { text: '版本公告', link: '/version-info/0.3.0' },
      { text: '文章', link: '/article/article01' },
    ],
    // thirdLinks: [
    //   {
    //     text: 'playground',
    //     link: 'http://localhost:8001/'
    //   }
    // ],
    sidebar: {
      '/guide/': guide,
      // '/version-info/': verisonInfo,
      '/api/': api,
      '/usage/': usage,
      '/article/': article,
    },
  },
};