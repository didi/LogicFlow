import mobx from 'mobx';
import { h } from 'preact';
import LogicFlow from '../LogicFlow';
import BaseEdge from '../view/edge/BaseEdge';
import BaseEdgeModel from '../model/edge/BaseEdgeModel';
import BaseNode from '../view/node/BaseNode';
import BaseNodeModel from '../model/node/BaseNodeModel';
import RectNodeModel from '../model/node/RectNodeModel';
import RectNode from '../view/node/RectNode';
import CircleNode from '../view/node/CircleNode';
import CircleNodeModel from '../model/node/CircleNodeModel';
import DiamondNode from '../view/node/DiamondNode';
import DiamondNodeModel from '../model/node/DiamondNodeModel';
import PolygonNode from '../view/node/PolygonNode';
import PolygonNodeModel from '../model/node/PolygonNodeModel';
import TextNodeModel from '../model/node/TextNodeModel';
import TextNode from '../view/node/TextNode';
import LineEdge from '../view/edge/LineEdge';
import LineEdgeModel from '../model/edge/LineEdgeModel';
import PolylineEdge from '../view/edge/PolylineEdge';
import PolylineEdgeModel from '../model/edge/PolylineEdgeModel';
import EllipseNode from '../view/node/EllipseNode';
import EllipseNodeModel from '../model/node/EllipseNodeModel';
import * as Options from '../options';

export type PointTuple = [number, number];

export type Point = {
  x: number,
  y: number,
  [key: string]: unknown;
};

export type Size = {
  width: number,
  height: number,
};

export type TextConfig = {
  value: string;
} & Point;

// 节点数据属性
export type NodeConfig = {
  id?: string;
  type: string;
  x: number;
  y: number;
  text?: TextConfig | string;
  properties?: Record<string, unknown>;
};
// 节点数据
export type NodeData = {
  id: string;
  type: string;
  x: number;
  y: number;
  rx?: number;
  ry?: number;
  text?: TextConfig;
  properties: Record<string, unknown>;
};
// 修改节点数据的参数
export type NodeAttribute = {
  id: string;
  type?: string;
  x?: number;
  y?: number;
  text?: TextConfig;
  properties?: Record<string, unknown>;
};

export type MenuConfig = {
  text?: string;
  className?: string;
  icon?: boolean;
  callback: (id) => void;
};

export type AdditionData = Record<string, unknown>;
// 边数据
export type EdgeData = {
  id: string,
  type: string,
  sourceNodeId: string,
  startPoint: Point,
  targetNodeId: string,
  endPoint: Point,
  text?: TextConfig,
  properties: Record<string, unknown>;
  pointsList?: Point[], // 折线、曲线会输出pointsList
};
// 边属性
export type EdgeAttribute = {
  id: string,
  type?: string,
  sourceNodeId?: string,
  startPoint?: Point,
  targetNodeId?: string,
  endPoint?: Point,
  text?: TextConfig,
  properties?: Record<string, unknown>;
};

export type EdgeFilter = {
  id?: string,
  sourceNodeId?: string,
  targetNodeId?: string,
};

export type EdgeConfig = {
  id?: string;
  type: string;
  sourceNodeId: string;
  targetNodeId: string;
  startPoint?: {
    x: number;
    y: number;
  },
  endPoint?: {
    x: number;
    y: number;
  },
  text?: {
    x: number;
    y: number;
    value: string;
  },
  pointsList?: Point[];
  properties?: Record<string, unknown>;
};

// 节点样式属性
export type CommonStyle = {
  fill?: string,
  stroke?: string,
  strokeWidth?: number,
  fillOpacity?: number,
  strokeOpacity?: number,
  opacity?: number,
  outlineColor?: string,
  hoverOutlineColor?: string,
  outlineStrokeDashArray?: string,
  hoverOutlineStrokeDashArray?: string,
};
export type RectStyle = CommonStyle & {
  width?: number,
  height?: number,
  radius?: number,
};
export type CircleStyle = CommonStyle & {
  r?: number,
};
export type EllipseStyle = CommonStyle & {
  rx?: number,
  ry?: number,
};
export type DiamondStyle = CommonStyle;
export type PolygonStyle = CommonStyle;
export type AnchorStyle = CommonStyle & {
  stroke?: string,
  strokeWidth?: number,
  r?: number,
};
export type AnchorLineStyle = {
  stroke?: string,
  strokeWidth?: number,
  strokeDasharray?: string,
};
export type AnchorHoverStyle = {
  fill?: string,
  fillOpacity?: number,
  stroke?: string,
  strokeWidth?: number,
  r?: number,
};
export type EdgeStyle = {
  stroke?: string,
  strokeWidth?: number,
  hoverStroke?: string,
  selectedStroke?: string,
  outlineColor?: string,
  outlineStrokeDashArray?: string,
};

export type LineStyle = EdgeStyle;
export type PolylineStyle = EdgeStyle & {
  offset?: number,
};
export type BezierStyle = EdgeStyle & {
  offset?: number,
  adjustLineColor?: string,
  adjustAnchorStroke?: string,
  adjustAnchorFill?: string,
  adjustAnchorFillOpacity?: number,
};
export type TextStyle = {
  color?: string,
  fontSize?: number,
  fontWeight?: string,
  fontFamily?: string,
};
export type NodeTextStyle = TextStyle;
export type EdgeTextStyle = TextStyle & {
  background?: {
    fill?: string,
    stroke?: string,
    radius?: number,
  }
};
export type ArrowStyle = {
  offset?: number, // 箭头长度
  verticalLength?: number, // 箭头垂直于连线的距离
};

export type Style = {
  rect?: RectStyle,
  circle?: CircleStyle,
  ellipse?: EllipseStyle,
  diamond?: DiamondStyle,
  polygon?: PolygonStyle,
  anchor?: AnchorStyle,
  text?: TextStyle,
  nodeText?: NodeTextStyle,
  edgeText?: EdgeTextStyle,
  line?: LineStyle,
  polyline?: PolylineStyle,
  bezier?: BezierStyle,
  arrow?: ArrowStyle,
  anchorLine?: AnchorLineStyle,
  anchorHover?: AnchorHoverStyle,
};

export type GraphTransform = {
  transform: string;
  transformOrigin: string;
};

export type EventArgs = Record<string, number | object | string>;

export type FocusOnArgs = {
  type?: string;
  id?: string;
  coordinate?: {
    x: number,
    y: number,
  };
};

export type ComponentRender = (lf: LogicFlow, container: HTMLElement) => void;
export interface Extension {
  name: string; // 插件名称，之后用于插件覆盖和细粒度控制加载那些插件
  install?: (lf: LogicFlow, LogicFlow: LogicFlowContractor) => void;
  render?: ComponentRender;
  destroy?: () => void;
  [props: string]: any;
}

export type Direction = 'vertical' | 'horizontal';

export type AppendInfo = {
  start: Point,
  end: Point,
  startIndex?: number,
  endIndex?: number,
  direction?: string,
};

export type ArrowInfo = {
  start: Point,
  end: Point,
  hover: Boolean,
  isSelected: Boolean,
};

export type IEdgeState = {
  hover: boolean;
};

export interface ModelContractor {
  new(data, graphModel): unknown; // todo: 这里应该怎么写？
}

export interface LogicFlowContractor {
  new(option: Options.Definition): LogicFlow;
}

export type RegisterBack = {
  view: Function;
  model: Function;
};

export interface RegisterParam {
  mobx: typeof mobx;
  h: typeof h;
  BaseEdge: typeof BaseEdge;
  BaseEdgeModel: typeof BaseEdgeModel;
  BaseNode: typeof BaseNode;
  BaseNodeModel: typeof BaseNodeModel;
  RectNode: typeof RectNode;
  RectNodeModel: typeof RectNodeModel;
  CircleNode: typeof CircleNode;
  CircleNodeModel: typeof CircleNodeModel;
  DiamondNode: typeof DiamondNode;
  DiamondNodeModel: typeof DiamondNodeModel;
  PolygonNode: typeof PolygonNode;
  PolygonNodeModel: typeof PolygonNodeModel;
  TextNode: typeof TextNode;
  TextNodeModel: typeof TextNodeModel;
  LineEdge: typeof LineEdge;
  LineEdgeModel: typeof LineEdgeModel;
  PolylineEdge: typeof PolylineEdge;
  PolylineEdgeModel: typeof PolylineEdgeModel;
  EllipseNode: typeof EllipseNode;
  EllipseNodeModel: typeof EllipseNodeModel;
  [key: string]: unknown;
}

export type RegisterElementFn = (params: RegisterParam) => RegisterBack;
