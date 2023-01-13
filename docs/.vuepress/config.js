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
      {
        title: '内置插件',
        collapsable: false,
        children: [
          'extension/component-menu',
          'extension/component-dnd-panel',
          'extension/component-control',
          'extension/component-minimap',
          'extension/component-selection',
          'extension/extension-node-resize',
          'extension/component-group',
          'extension/curved-edge',
          'extension/extension-insert-node-in-polyline.md',
          // 'extension/extension-components',
          'extension/adapter',
          'extension/bpmn-element',
          'extension/snapshot',
        ]
      },
      'extension/component-custom'
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
  'NodeResize',
  'LogicFlow发布1.0'
];

const release = [
  '1.2',
  '1.1',
  '1.0',
]

const verisonInfo = [
  '0.3.0',
  '0.4.0',
  '0.6.0'
];

module.exports = {
  title: 'LogicFlow',
  description: 'LogicFlow 是一款流程图编辑框架，提供了一系列流程图交互、编辑所必需的功能和灵活的节点自定义、插件等拓展机制。LogicFlow支持前端研发自定义开发各种逻辑编排场景，如流程图、ER图、BPMN流程等。',
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
      {
        text: 'API',
        link: '#',
        items: [
          // link: '/api/logicFlowApi'
          {
            text: "LogicFlow实例",
            link: "/api/logicFlowApi"
          },
          {
            text: "graphModel",
            link: "/api/graphModelApi"
          },
          {
            text: "nodeModel",
            link: "/api/nodeModelApi"
          },
          {
            text: "edgeModel",
            link: "/api/edgeModelApi"
          },
          {
            text: "主题",
            link: "/api/themeApi"
          },
          {
            text: "事件",
            link: "/api/eventCenterApi"
          },
          {
            text: "transformModel",
            link: "/api/transformModelApi"
          },
          {
            text: "editConfigModel",
            link: "/api/editConfigModelApi"
          }
        ]
      },
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
      {
        text: '版本发布',
        link: '#',
        items: [
          {
            text: 'v1.2.x',
            link: '/release/1.2'
          },
          {
            text: 'v1.1.x',
            link: '/release/1.1'
          },
          {
            text: 'v1.0.x',
            link: '/release/1.0'
          },
          {
            text: 'v0.7.x',
            link: 'https://07.logic-flow.cn/'
          }
        ]
      },
      { text: '文章', link: '/article/article01' },
      { text: 'gitee镜像', link: 'https://gitee.com/logic-flow/LogicFlow' },
    ],
    sidebar: {
      '/guide/': guide,
      '/api/': api,
      '/release/': release,
      '/article/': article,
    },
  },
};
