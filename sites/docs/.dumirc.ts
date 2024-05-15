import { defineConfig } from 'dumi';
import { repository, version } from './package.json';

export default defineConfig({
  mfsu: false,
  define: {
    'process.env.DUMI_VERSION': version,
  },
  themeConfig: {
    name: 'LogicFlow',
    logo: '/logo.png',
    footer: `Copyright © 2024 | Powered by LogicFlow Team`,
    rtl: true, // 导航栏会展示 RTL 按钮
    nprogress: true, // 切换页面时是否在页面顶部展示进度条
    // prefersColor: false,
    nav: {
      'zh-CN': [
        { title: '文档', link: '/tutorial' },
        { title: 'API', link: '/api' },
        { title: '示例', link: '/examples' },
        { title: '文章', link: '/article/article01' },
      ],
      'en-US': [
        { title: 'Tutorial', link: '/en-US/tutorial' },
        { title: 'API', link: '/en-US/api' },
        { title: 'Examples', link: '/en-US/examples' },
        { title: 'Article', link: '/en-US/article/article01' },
      ],
    },
    socialLinks: {
      github: repository,
    },
  },
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'EN' },
  ],
  theme: {
    '@c-primary': '#2d71fa',
  },
  headScripts: [
    `var config = {
    appKey: "omega32096b582a",
    autoPerformance: true,
    autoWhiteScreenMonitor: {
      container: "body",
      childrenDepth: 2,
      durationSeconds: 3000,
    },
  };
  var Omega = Omega || config;
  var startTime = Math.ceil(new Date().getTime() / 1000);
  `,
    `//tracker.didistatic.com/static/tracker/latest2x/omega.min.js`,
  ],
  codeSplitting: { jsStrategy: 'granularChunks' },
  // chainWebpack: (config) => {
  //   // 打开 bundle 分析器
  //   config
  //     .plugin('webpack-bundle-analyzer')
  //     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin);
  //   return config;
  // },
});
