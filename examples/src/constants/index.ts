type RouteMapsType = {
  [k: string]: { name: string; group: string; hidden: boolean };
};
export const routeMaps: RouteMapsType = {
  '/basic/node': { name: '节点 Node', group: 'basic', hidden: false },
  '/basic/edge': { name: '边 Edge', group: 'basic', hidden: false },
  '/basic/dnd': { name: '拖拽 Dnd', group: 'basic', hidden: false },
  '/basic/keyboard': { name: '键盘快捷键 Keyboard', group: 'basic', hidden: false },
  '/basic/grid': { name: '网格 Grid', group: 'basic', hidden: false },
  '/basic/redoundo': { name: '撤销/重做 Undo/Redo', group: 'basic', hidden: false },
  '/basic/snapline': { name: '对齐线 Snapline', group: 'basic', hidden: false },
  '/basic/silent-mode': { name: '静默模式', group: 'basic', hidden: false },
  '/advance/theme': { name: '主题样式', group: 'advance', hidden: false },
  '/advance/event': { name: '事件 Event', group: 'advance', hidden: false },
  '/advance/custom-node/style': { name: '设置自定义节点的 width 和 height', group: 'advance.custom-node', hidden: false },
  '/advance/custom-node/anchor': { name: '只保留水平方向上的锚点', group: 'advance.custom-node', hidden: false },
  '/advance/custom-node/triangle': { name: '设置多边形的顶点来实现三角形', group: 'advance.custom-node', hidden: false },
  '/advance/custom-node/rule': { name: '正方形的下一个节点只能是圆形节点', group: 'advance.custom-node', hidden: false },
  '/advance/custom-node/shape': { name: '设置自定义节点的 SVG 元素', group: 'advance.custom-node', hidden: false },
  '/advance/custom-edge/process': { name: '流程图', group: 'advance.custom-edge', hidden: false },
  '/advance/custom-node/html': { name: '自定义HTML节点', group: 'advance.custom-node', hidden: false },
  '/extension/snapshot': { name: '导出图片', group: 'extension', hidden: false },
  '/extension/components/control': { name: '控制栏', group: 'extension.components', hidden: false },
  '/extension/components/menu': { name: '右键节点展示菜单', group: 'extension.components', hidden: false },
  '/extension/components/dnd-panel': { name: '数据面板', group: 'extension.components', hidden: false },
  '/extension/components/selection': { name: '开启多选功能', group: 'extension.components', hidden: false },
  '/extension/components/mini-map': { name: '缩略图', group: 'extension.components', hidden: false },
  '/extension/components/custom-menu': { name: '分别右键节点和画布来展示菜单', group: 'extension.components', hidden: false },
  '/extension/components/custom-dnd': { name: '自定义拖拽元素', group: 'extension.components', hidden: false },
  '/extension/bpmn-elements': { name: 'bpmn元素', group: 'extension', hidden: false },
  '/extension/adapter': { name: '导出 bpmnAdapter 转换后的数据格式', group: 'extension', hidden: false },
  '/extension/node-resize': { name: '节点缩放', group: 'extension', hidden: false },
  '/extension/InserNodeInPolyline': { name: '拖拽节点到线中间进行节点插入', group: 'extension', hidden: false },
  '/usage/bpmn': { name: 'Bpmn示例', group: 'usage', hidden: false },
  '/usage/approve': { name: '审批流', group: 'usage', hidden: false },
  '/usage/approve/preview': { name: '预览', group: 'usage', hidden: false },
  '/': { name: '入门', group: 'root', hidden: false },
};

type RouteGroupNameMapsType = {[k: string]: string}
export const routeGroupNameMaps: RouteGroupNameMapsType = {
	'basic': '基础',
	'advance': '进阶',
	'custom-node': '自定义节点',
	'custom-edge': '自定义连线',
	'extension': '拓展',
	'components': '组件',
	'usage': '使用',
}