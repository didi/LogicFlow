import { defineConfig } from 'dumi';
import { repository, version } from './package.json';

export default defineConfig({
  // define: {
  //   'process.env.DUMI_VERSION': version,
  // },
  locales: [
    { id: 'zh', name: '中文' },
    { id: 'en', name: 'English' },
  ],
  favicons: [
    'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/favicon.png',
  ], // 网站 favicon
  themeConfig: {
    title: 'LogicFlow',
    description: '低成本实现，让逻辑管理更简单、更高效',
    siteUrl: '/',
    footer: `Copyright © 2024 | Powered by LogicFlow Team`,
    githubUrl: repository, // GitHub 地址
    defaultLanguage: 'zh',
    es5: false,
    footerTheme: 'light',

    showSearch: true, // 是否显示搜索框
    showGithubCorner: true, // 是否显示头部的 GitHub icon
    showGithubStars: true, // 是否显示 GitHub star 数量
    showLanguageSwitcher: true, // 是否显示官网语言切换
    showWxQrcode: true, // 是否显示头部菜单的微信公众号
    showChartResize: true, // 是否在 demo 页展示图表视图切换
    showAPIDoc: false, // 是否在 demo 页展示API文档

    versions: {
      '2.x': 'https://site.logic-flow.cn',
      '1.x': 'https://docs.logic-flow.cn',
    },

    navs: [
      {
        slug: 'docs/tutorial/about',
        title: {
          zh: '教程',
          en: 'Tutorial',
        },
        order: 0,
      },
      {
        slug: 'docs/api',
        title: {
          zh: 'API',
          en: 'API',
        },
        order: 1,
      },
      {
        slug: 'examples',
        title: {
          zh: '图表示例',
          en: 'Examples',
        },
        order: 2,
      },
      {
        slug: 'docs/article',
        title: {
          zh: '相关文章',
          en: 'Articles',
        },
        order: 3,
      },
      {
        slug: 'docs/release',
        title: {
          zh: '更新日志',
          en: 'CHANGELOG',
        },
        order: 4,
      },
    ],

    docs: [
      {
        slug: 'tutorial/basic',
        title: {
          zh: '基础教程',
          en: 'Basic',
        },
        order: 3,
      },
      {
        slug: 'tutorial/advanced',
        title: {
          zh: '进阶教程',
          en: 'Advanced',
        },
        order: 4,
      },
      {
        slug: 'tutorial/extension',
        title: {
          zh: '插件',
          en: 'Extension',
        },
        order: 5,
      },
      {
        slug: 'api/model',
        title: {
          zh: 'Model定义',
          en: 'Models',
        },
        order: 6,
      },
      {
        slug: 'api/detail',
        title: {
          zh: '构造函数',
          en: 'Constructor',
        },
        order: 1,
      },
    ],

    // 示例页菜单配置
    examples: [
      {
        slug: 'showcase',
        icon: 'case',
        title: {
          zh: '场景案例',
          en: 'Case',
        },
      },
      {
        slug: 'graph',
        icon: 'graph',
        title: {
          zh: '画布',
          en: 'Graph',
        },
      },
      {
        slug: 'node',
        icon: 'node',
        title: {
          zh: '节点',
          en: 'Node',
        },
      },
      {
        slug: 'edge',
        icon: 'edge',
        title: {
          zh: '边',
          en: 'Edge',
        },
      },
      {
        slug: 'react',
        icon: 'react',
        title: {
          zh: 'react',
          en: 'React',
        },
      },
      {
        slug: 'extension',
        icon: 'extension',
        title: {
          zh: '插件',
          en: 'Extension',
        },
      },
    ],
    companies: [
      {
        name: '阿里云',
        img: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*V_xMRIvw2iwAAAAAAAAAAABkARQnAQ',
      },
      {
        name: '支付宝',
        img: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*lYDrRZvcvD4AAAAAAAAAAABkARQnAQ',
      },
      {
        name: '天猫',
        img: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*BQrxRK6oemMAAAAAAAAAAABkARQnAQ',
      },
      {
        name: '淘宝网',
        img: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*1l8-TqUr7UcAAAAAAAAAAABkARQnAQ',
      },
      {
        name: '网上银行',
        img: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*ZAKFQJ5Bz4MAAAAAAAAAAABkARQnAQ',
      },
      {
        name: '京东',
        img: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*yh-HRr3hCpgAAAAAAAAAAABkARQnAQ',
      },
      {
        name: 'yunos',
        img: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*_js7SaNosUwAAAAAAAAAAABkARQnAQ',
      },
      {
        name: '菜鸟',
        img: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*TgV-RZDODJIAAAAAAAAAAABkARQnAQ',
      },
    ],
    detail: {
      engine: {
        zh: 'LogicFlow',
        en: 'LogicFlow',
      },
      title: {
        zh: 'LogicFlow·业务流程图编辑框架',
        en: 'LogicFlow·业务流程图编辑框架',
      },
      description: {
        zh: '低成本实现，让逻辑管理更简单、更高效',
        en: 'Low-cost implementation for simpler, more efficient logic management',
      },
      image:
        'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*5qQsTo0dkOcAAAAAAAAAAAAADmJ7AQ/original',
      imageStyle: {
        transform: 'scale(0.7)',
        marginTop: '70px',
        marginLeft: '100px',
      },
      buttons: [
        {
          text: {
            zh: '开始使用',
            en: 'Getting Started',
          },
          link: `/tutorial/get-started`,
        },
        {
          text: {
            zh: '图表示例',
            en: 'Examples',
          },
          link: `/examples`,
          type: 'primary',
        },
      ],
    },
    playground: {
      extraLib: '',
      container:
        '<div id="container" style="min-width: 400px; min-height: 600px;"></div>',
      devDependencies: {
        typescript: 'latest',
      },
    },
  },
  mfsu: {},
  alias: {
    '@': __dirname,
  },
  links: [],
  scripts: [],
  // theme: {
  //   '@c-primary': '#2d71fa',
  // },
  // headScripts: [
  //   `var config = {
  //     appKey: "omega32096b582a",
  //     autoPerformance: true,
  //     autoWhiteScreenMonitor: {
  //       container: "body",
  //       childrenDepth: 2,
  //       durationSeconds: 3000,
  //     },
  //   };
  //   var Omega = Omega || config;
  //   var startTime = Math.ceil(new Date().getTime() / 1000);
  // `,
  //   `//tracker.didistatic.com/static/tracker/latest2x/omega.min.js`,
  // ],
  // codeSplitting: { jsStrategy: 'granularChunks' },
  // chainWebpack: (config) => {
  //   // 打开 bundle 分析器
  //   config
  //     .plugin('webpack-bundle-analyzer')
  //     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin);
  //   return config;
  // },
});
