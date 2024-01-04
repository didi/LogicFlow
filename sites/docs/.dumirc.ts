import { defineConfig } from 'dumi';
import { repository, version } from './package.json';

export default defineConfig({
  define: {
    'process.env.DUMI_VERSION': version,
  },
  themeConfig: {
    name: 'LogicFlow',
    logo: '/logo.png',
    footer: `Copyright © 2023 | Powered by LogicFlow Team`,
    rtl: true, // 导航栏会展示 RTL 按钮
    nprogress: true, // 切换页面时是否在页面顶部展示进度条
    nav: {
      'zh-CN': [
        { title: '文档', link: '/tutorial' },
        { title: 'API', link: '/api' },
        {
          title: '示例',
          link: 'https://site.logic-flow.cn/examples/#/gallery',
        },
        { title: '文章', link: '/article/article01' },
      ],
      'en-US': [
        { title: 'Tutorial', link: '/en-US/tutorial' },
        { title: 'API', link: '/en-US/api' },
        {
          title: 'Examples',
          link: 'https://site.logic-flow.cn/examples/#/gallery',
        },
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
});
