// 默认样式
// 各个图形shape的默认属性配置
const commonStyle = {
  fill: '#FFFFFF',
  stroke: '#000000',
  strokeWidth: 2,
  fillOpacity: 1,
  strokeOpacity: 1,
  opacity: 1,
  outlineColor: '#000000',
  outlineStrokeDashArray: '3,3',
  hoverOutlineColor: '#afafaf',
};
const rect = {
  ...commonStyle,
  width: 100,
  height: 80,
  radius: 0,
};
const circle = {
  ...commonStyle,
  r: 50,
};
const ellipse = {
  ...commonStyle,
  rx: 50,
  ry: 50,
};
const diamond = {
  ...commonStyle,
  rx: 50,
  ry: 50,
};
const polygon = {
  ...commonStyle,
};
const anchor = {
  ...commonStyle,
  stroke: '#000000',
  strokeWidth: 1,
  r: 4,
};
const anchorHover = {
  fill: '#1E90FF',
  fillOpacity: 0.5,
  stroke: '#4169E1',
  strokeWidth: 1,
  r: 10,
};
const edge = {
  stroke: '#000000',
  strokeWidth: 2,
  hoverStroke: '#000000',
  selectedStroke: '#000000',
  outlineColor: '#000000',
  outlineStrokeDashArray: '3,3',
};
const line = {
  ...edge,
};
const polyline = {
  ...edge,
  offset: 30,
};
const bezier = {
  ...edge,
  offset: 100,
  adjustLineColor: '#4169E1',
  adjustAnchorStroke: '#4169E1',
  adjustAnchorFill: '#1E90FF',
  adjustAnchorFillOpacity: 0.5,
};
const anchorLine = {
  stroke: '#000000',
  strokeWidth: 2,
  strokeDasharray: '3,2',
};
const text = {
  color: '#000000',
  fontSize: 12,
  fontWeight: 'normal',
  fontFamily: '',
};
const nodeText = { ...text };
const edgeText = {
  color: '#000000',
  fontSize: 12,
  fontWeight: 'normal',
  fontFamily: '',
  background: {
    fill: 'transparent',
    stroke: 'transparent',
    radius: 0,
  },
};
const snapline = {
  stroke: '#1E90FF',
  strokeWidth: 1,
};

const arrow = {
  offset: 10, // 箭头长度
  verticalLength: 5, // 箭头垂直于连线的距离
};

export const defaultTheme = {
  rect,
  circle,
  diamond,
  ellipse,
  polygon,
  anchor,
  text,
  nodeText,
  edgeText,
  line,
  polyline,
  bezier,
  arrow,
  anchorLine,
  anchorHover,
  snapline,
};
