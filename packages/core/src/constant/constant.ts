export enum ElementState {
  DEFAULT = 1,
  TEXT_EDIT = 2,
  SHOW_MENU = 3,
  ALLOW_CONNECT = 4,
  NOT_ALLOW_CONNECT = 5,
}

export enum ClipBoardInfo {
  KEY = 'logic-flow',
  NODE_NAME = 'lf-node',
  EDGE_NAME = 'lf-edge',
}

export enum ModelType {
  NODE = 'node',
  CIRCLE_NODE = 'circle-node',
  POLYGON_NODE = 'polygon-node',
  RECT_NODE = 'rect-node',
  TEXT_NODE = 'text-node',
  ELLIPSE_NODE = 'ellipse-node',
  DIAMOND_NODE = 'diamond-node',
  HTML_NODE ='html-node',
  EDGE = 'edge',
  LINE_EDGE = 'line-edge',
  POLYLINE_EDGE = 'polyline-edge',
  BEZIER_EDGE = 'bezier-edge',
  GRAPH = 'graph',
}
// 区分节点还是边
export enum ElementType {
  NODE = 'node',
  EDGE = 'edge',
  GRAPH = 'graph',
}

export enum EventType {
  ELEMENT_CLICK = 'element:click', // 是 node:click & edge:click 的并集
  NODE_CLICK = 'node:click',
  NODE_DBCLICK = 'node:dbclick',
  NODE_DELETE = 'node:delete',
  NODE_ADD = 'node:add',
  NODE_DND_ADD = 'node:dnd-add',
  NODE_DND_DRAG = 'node:dnd-drag',
  NODE_MOUSEDOWN = 'node:mousedown',
  NODE_DRAGSTART = 'node:dragstart',
  NODE_DRAG = 'node:drag',
  NODE_DROP = 'node:drop',
  NODE_MOUSEUP = 'node:mouseup',
  NODE_MOUSEMOVE = 'node:mousemove',
  NODE_MOUSEENTER = 'node:mouseenter',
  NODE_MOUSELEAVE = 'node:mouseleave',
  NODE_CONTEXTMENU = 'node:contextmenu',
  EDGE_DELETE = 'edge:delete',
  EDGE_ADD = 'edge:add',
  EDGE_CLICK = 'edge:click',
  EDGE_DBCLICK = 'edge:dbclick',
  EDGE_MOUSEENTER = 'edge:mouseenter',
  EDGE_MOUSELEAVE = 'edge:mouseleave',
  EDGE_CONTEXTMENU = 'edge:contextmenu',
  EDGE_ADJUST = 'edge:adjust',
  EDGE_EXCHANGE_NODE = 'edge:exchange-node',
  ANCHOR_DRAGSTART = 'anchor:dragstart',
  ANCHOR_DRAG = 'anchor:drag',
  ANCHOR_DROP = 'anchor:drop',
  ANCHOR_DRAGEND = 'anchor:dragend',
  BLANK_MOUSEDOWN = 'blank:mousedown',
  BLANK_DRAGSTART = 'blank:dragstart',
  BLANK_DRAG = 'blank:drag',
  BLANK_DROP = 'blank:drop',
  BLANK_MOUSEMOVE = 'blank:mousemove',
  BLANK_MOUSEUP = 'blank:mouseup',
  BLANK_CLICK = 'blank:click',
  BLANK_CONTEXTMENU = 'blank:contextmenu',
  SELECTION_MOUSEDOWN='selection:mousedown',
  SELECTION_DRAGSTART='selection:dragstart',
  SELECTION_DRAG='selection:drag',
  SELECTION_DROP='selection:drop',
  SELECTION_MOUSEMOVE = 'selection:mousemove',
  SELECTION_MOUSEUP = 'selection:mouseup',
  SELECTION_CONTEXTMENU = 'selection:contextmenu',
  CONNECTION_NOT_ALLOWED = 'connection:not-allowed',
  HISTORY_CHANGE = 'history:change',
  TEXT_UPDATE = 'text:update',
  GRAPH_TRANSFORM = 'graph:transform',
  GRAPH_RENDERED = 'graph:rendered'
}

export enum SegmentDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export const ElementMaxzIndex = 9999;

export enum OverlapMode {
  DEFAULT = 0,
  INCREASE = 1,
}
