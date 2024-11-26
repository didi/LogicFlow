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
      name: 'grid',
      path: '/grid',
      routes: [
        {
          path: '/grid/adjust',
          name: '动态调整网格配置',
          component: './grid',
        },
      ],
    },
    {
      name: 'background',
      path: '/background',
      routes: [
        {
          path: '/background/adjust',
          name: '动态调整画布背景',
          component: './background',
        },
      ],
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
      path: '/custom-edges',
      name: 'custom edges',
      routes: [
        {
          path: 'custom-edges',
          redirect: 'custom-edges/polyline',
        },
        {
          path: '/custom-edges/polyline',
          name: '折线',
          component: './edges/custom/polyline',
        },
        {
          path: '/custom-edges/animate-polyline',
          name: '动画折线',
          component: './edges/custom/animate-polyline',
        },
        {
          path: '/custom-edges/curved-polyline',
          name: '圆角折线',
          component: './edges/custom/curved-polyline',
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
          path: '/extension/dynamic-group',
          name: 'DynamicGroup 插件',
          component: './extensions/dynamic-group',
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
          path: '/extension/node-selection',
          name: 'NodeSelection 插件',
          component: './extensions/node-selection',
        },
        {
          path: '/extension/highlight',
          name: 'Highlight 插件',
          component: './extensions/highlight',
        },
        {
          path: '/extension/snapshot',
          name: 'Snapshot 插件',
          component: './extensions/snapshot',
        },
        {
          path: '/extension/insert-node-in-polyline',
          name: 'InsertNodeInPolyline 插件',
          component: './extensions/insert-node-in-polyline',
        },
        {
          path: '/extension/rules',
          name: 'Rules 插件',
          component: './extensions/rules',
        },
        {
          path: '/extension/rect-label-node',
          name: 'RectLabelNode 插件',
          component: './extensions/rect-label-node',
        },
        {
          path: '/extension/proximity-connect',
          name: 'Proximity Connect 插件',
          component: './extensions/proximity-connect',
        },
      ],
    },
    {
      name: 'performance',
      path: '/performance',
      routes: [
        {
          path: '/performance/snapshot-elements',
          name: 'Snapshot 元素数量性能测试',
          component: './performance/snapshot-elements',
        },
      ],
    },
  ],
})
