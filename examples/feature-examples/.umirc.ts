import { defineConfig } from 'umi'

export default defineConfig({
  routes: [
    {
      path: '/',
      component: './graph',
      name: 'graph',
    },
    {
      path: '/native-nodes',
      component: './nodes/native',
      name: 'native nodes',
    },
    {
      path: '/custom-nodes',
      name: 'custom nodes',
      routes: [
        { path: 'custom-nodes', redirect: 'custom-nodes/rect' },
        {
          path: '/custom-nodes/rect',
          name: '矩形节点',
          component: './nodes/custom/Rect',
        },
        {
          path: '/custom-nodes/ellipse',
          name: '椭圆节点',
          component: './nodes/custom/Ellipse',
        },
        {
          path: '/custom-nodes/icon',
          name: '图标节点',
          component: './nodes/custom/Icon',
        },
        {
          path: '/custom-nodes/image',
          name: '图像节点',
          component: './nodes/custom/Image',
        },
        {
          path: '/custom-nodes/html',
          name: 'HTML节点',
          component: './nodes/custom/Html',
        },
        {
          path: '/custom-nodes/theme',
          name: '自定义主题',
          component: './nodes/custom/Theme',
        },
      ],
    },
  ],
  npmClient: 'pnpm',
})
