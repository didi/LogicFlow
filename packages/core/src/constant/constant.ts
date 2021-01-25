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
  DIAMOND = 'diamond-node',
  CIRCLE_NODE = 'circle-node',
  POLYGON_NODE = 'polygon-node',
  RECT_NODE = 'rect-node',
  TEXT_NODE = 'text-node',
  ELLIPSE_NODE = 'ellipse-node',
  EDGE = 'edge',
  LINE_EDGE = 'line-edge',
  POLYLINE_EDGE = 'polyline-edge',
  BEZIER_EDGE = 'bezier-edge',
  GRAPH = 'graph',
}
// 区分节点还是连线
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
  NODE_MOUSEDOWN = 'node:mousedown',
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
  BLANK_MOUSEDOWN = 'blank:mousedown',
  BLANK_MOUSEMOVE = 'blank:mousemove',
  BLANK_MOUSEUP = 'blank:mouseup',
  BLANK_CLICK = 'blank:click',
  BLANK_CONTEXTMENU = 'blank:contextmenu',
  CONNECTION_NOT_ALLOWED = 'connection:not-allowed',
  HISTORY_CHANGE = 'history:change',
}

export enum InnerEventType {
  HISTORY_CHANGE = 'inner:history:change'
}

export enum SegmentDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export const ElementMaxzIndex = 999;
