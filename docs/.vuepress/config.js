const guide = [
  'start',
  {
    title: '核心功能',
    collapsable: false,
    children: [
      // 'basic/core',
      'basic/logic-flow',
      'basic/node',
      'basic/edge',
      'basic/theme',
      'basic/event',
      'basic/grid',
      'basic/background',
      'basic/dnd',
      'basic/keyboard',
      // 'basic/redoundo',
      'basic/snapline',
      'basic/silent-mode',
    ]
  },
  {
    title: '插件功能',
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
  'graphModelApi',
  'nodeModelApi',
  'edgeModelApi',
  'eventCenterApi',
  'transformModelApi',
  'editConfigModelApi',
  'themeApi',
];

// const usage = ["bpmn", "approve"];

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
      {
        text: '示例',
        link: '#',
        items: [
          {
            text: 'bpmn示例',
            link: '/usage/bpmn'
          },
          {
            text: '审批流程',
            link: '/usage/approve'            
          },
          {
            text: '作图工具',
            link: '/mvp/index.html' ,
            target: '_blank'           
          }
        ]
      },
      { text: '迁移指南', link: '/migrate' },
      // { text: '版本公告', link: '/version-info/0.3.0' },
      {
        text: 'v1.x',
        link: '#',
        items: [
          {
            text: 'v0.7',
            link: 'https://07.logic-flow.cn/'
          }
        ]
      },
      { text: '文章', link: '/article/article01' },
    ],
    sidebar: {
      '/guide/': guide,
      '/api/': api,
      '/article/': article,
    },
  },
};