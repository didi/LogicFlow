import { defineConfig } from '@umijs/max';

export default defineConfig({
  mfsu: false,
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'LogicFlow React Demo',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      name: '节点',
      path: '/node',
      routes: [
        { path: 'node', redirect: 'node/native' },
        {
          path: '/node/native',
          name: '内置节点',
          component: './Node/Native',
        },
        {
          path: '/node/custom',
          name: '自定义节点',
          routes: [
            { path: 'node/custom', redirect: 'node/custom/rect' },
            {
              path: '/node/custom/rect',
              name: '矩形节点',
              component: './Node/Custom/Rect',
            },
            {
              path: '/node/custom/ellipse',
              name: '椭圆节点',
              component: './Node/Custom/Ellipse',
            },
            {
              path: '/node/custom/icon',
              name: '图标节点',
              component: './Node/Custom/Icon',
            },
            {
              path: '/node/custom/image',
              name: '图像节点',
              component: './Node/Custom/Image',
            },
            {
              path: '/node/custom/html',
              name: 'HTML节点',
              component: './Node/Custom/Html',
            },
            {
              path: '/node/custom/theme',
              name: '自定义主题',
              component: './Node/Custom/Theme',
            },
          ],
        },
      ],
    },
    {
      name: '插件系统',
      path: '/extension',
      routes: [
        { path: 'extension', redirect: 'extension/control' },
        {
          path: '/extension/control',
          name: 'Control 插件',
          component: './Extension/Control',
        },
        {
          path: '/extension/menu',
          name: 'Menu 插件',
          component: './Extension/Menu',
        },
        {
          path: '/extension/dnd-panel',
          name: 'DndPanel 插件',
          component: './Extension/DndPanel',
        },
      ],
    },
  ],
  npmClient: 'pnpm',
});
