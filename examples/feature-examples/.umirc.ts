import { defineConfig } from 'umi'

export default defineConfig({
  npmClient: 'pnpm',
  mfsu: false, // 关闭 mfsu，以解决开发时 monorepo package 更新不及时的问题
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
        {
          path: 'custom-nodes',
          redirect: 'custom-nodes/rect',
        },
        {
          path: '/custom-nodes/rect',
          name: '矩形节点',
          component: './nodes/custom/rect',
        },
        {
          path: '/custom-nodes/ellipse',
          name: '椭圆节点',
          component: './nodes/custom/ellipse',
        },
        {
          path: '/custom-nodes/icon',
          name: '图标节点',
          component: './nodes/custom/icon',
        },
        {
          path: '/custom-nodes/image',
          name: '图像节点',
          component: './nodes/custom/image',
        },
        {
          path: '/custom-nodes/html',
          name: 'HTML节点',
          component: './nodes/custom/html',
        },
        {
          path: '/custom-nodes/theme',
          name: '自定义主题',
          component: './nodes/custom/theme',
        },
      ],
    },
    {
      path: '/react',
      name: 'react node registry',
      routes: [
        {
          path: 'react',
          redirect: 'react/custom',
        },
        {
          path: '/react/custom',
          name: '自定义 React 节点',
          component: './react',
        },
        {
          path: '/react/portal',
          name: 'React Portal节点',
          component: './react/Portal',
        },
      ],
    },
    {
      name: 'official extensions',
      path: '/extension',
      routes: [
        {
          path: 'extension',
          redirect: 'extension/control',
        },
        {
          path: '/extension/control',
          name: 'Control 插件',
          component: './extensions/control',
        },
        {
          path: '/extension/menu',
          name: 'Menu 插件',
          component: './extensions/menu',
        },
        {
          path: '/extension/dnd-panel',
          name: 'DndPanel 插件',
          component: './extensions/dnd-panel',
        },
        {
          path: '/extension/bpmn',
          name: 'BPMN 插件',
          component: './extensions/bpmn',
        },
        {
          path: '/extension/group',
          name: 'Group 插件',
          component: './extensions/group',
        },
        {
          path: '/extension/selection-select',
          name: 'SelectionSelect 插件',
          component: './extensions/selection-select',
        },
        {
          path: '/extension/mini-map',
          name: 'MiniMap 插件',
          component: './extensions/mini-map',
        },
        {
          path: '/extension/label',
          name: 'Label 插件',
          component: './extensions/label',
        },
      ],
    },
  ],
})
