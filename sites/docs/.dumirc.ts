import { defineConfig } from 'dumi';
import { repository, version } from './package.json';

export default defineConfig({
  mfsu: {},
  // define: {
  //   'process.env.DUMI_VERSION': version,
  // },
  locales: [
    { id: 'zh', name: '中文' },
    { id: 'en', name: 'English' },
  ],
  themeConfig: {
    title: 'LogicFlow',
    description: 'JavaScript diagramming library',
    siteUrl: '/',

    // name: 'LogicFlow',
    // logo: '/logo.png',
    footer: `Copyright © 2024 | Powered by LogicFlow Team`,
    githubUrl: repository, // GitHub 地址
    isAntVSite: false,
    showAntVProductsCard: false,
    defaultLanguage: 'zh',
    es5: false,
    footerTheme: 'light',
    // rtl: true, // 导航栏会展示 RTL 按钮
    // nprogress: true, // 切换页面时是否在页面顶部展示进度条
    // prefersColor: false,
    navs: [
      {
        slug: 'examples',
        title: {
          zh: '图表示例',
          en: 'Examples',
        },
        order: 2,
      },
    ],
    detail: {
      engine: {
        zh: 'X6',
        en: 'X6',
      },
      title: {
        zh: 'X6·图编辑引擎',
        en: 'X6·图编辑引擎',
      },
      description: {
        zh: 'X6 是基于 HTML 和 SVG 的图编辑引擎，提供低成本的定制能力和开箱即用的内置扩展，方便我们快速搭建 DAG 图、ER 图、流程图、血缘图等应用。',
        en: 'X6 是基于 HTML 和 SVG 的图编辑引擎，提供低成本的定制能力和开箱即用的内置扩展，方便我们快速搭建 DAG 图、ER 图、流程图、血缘图等应用。',
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
          link: `/tutorial/getting-started`,
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
    examples: [
      {
        slug: 'showcase',
        icon: 'case',
        title: {
          zh: '场景案例',
          en: 'Case',
        },
      },
    ],
    playground: {
      extraLib: '',
      container:
        '<div id="container" style="min-width: 400px; min-height: 600px;"></div>',
      devDependencies: {
        typescript: 'latest',
      },
    },
    // nav: {
    //   'zh-CN': [
    //     { title: '文档', link: '/tutorial' },
    //     { title: 'API', link: '/api' },
    //     { title: '示例', link: '/examples' },
    //     { title: '文章', link: '/article/article01' },
    //   ],
    //   'en': [
    //     { title: 'Tutorial', link: '/en/tutorial' },
    //     { title: 'API', link: '/en/api' },
    //     { title: 'Examples', link: '/en/examples' },
    //     { title: 'Article', link: '/en/article/article01' },
    //   ],
    // },
    // socialLinks: {
    //   github: repository,
    // },
  },
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
