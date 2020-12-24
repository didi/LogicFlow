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
  }
];

const usage = ["bpmn", "approve"];

const article = [
  '基于 Logic Flow 开发自定义扩展',
  '插件系统',
  'article01',
];
  'start',
  {
    title: '基础',
    collapsable: false,
    children: [
      'guide/basic/core',
      'guide/basic/graph',
      'guide/basic/node',
      'guide/basic/connection'
    ]
  },
  {
    title: '进阶',
    collapsable: false,
    children: [
      'guide/advance/theme',
      'guide/advance/behavior',
      'guide/advance/customNode',
      'guide/advance/anchor',
      'guide/advance/plugin',
      'guide/advance/adapter',
    ]
  },
  {
    title: 'API',
    collapsable: false,
    children: [
      'api/graphApi',
      'api/nodeApi',
      'api/connectionApi',
    ]
  },
  {
    title: '文章',
    collapsable: false,
    children: [
      'article/基于 Logic Flow 开发自定义扩展',
      'article/插件系统',
      'article/article01',
    ]
  }
]

module.exports = {
  title: 'Logic Flow',
  description: 'Logic Flow desc',
  base: "/logicflow/",
  themeConfig: {
    sidebarDepth: 1,
    logo: '/logo.png',
    displayAllHeaders: false,
    sidebar: [],
    nav: [
      {text: '教程', link: '/guide/start'},
      {text: 'API', link: '/api/logicFlowApi'},
      {text: '示例', link: '/usage/bpmn'},
      {text: '介绍', link: '/article/article01'},
    ],
    sidebar: {
      '/guide/': guide,
      '/api/': api,
      '/usage/': usage,
      '/article/': article,
    }
  }
}