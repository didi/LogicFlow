import { h, Component } from 'preact';
import { BaseNodeModel, DiamondNodeModel, EllipseNodeModel, GraphModel, LogicFlowUtil, RectNodeModel } from '@logicflow/core';
import Rect from '../BasicShape/Rect';
import { getDiamondReizeEdgePoint, getEllipseReizeEdgePoint, getRectReizeEdgePoint, ModelType } from './Util';

const { StepDrag } = LogicFlowUtil;

type TargetNodeId = string;

interface IProps {
  index: number,
  x: number,
  y: number,
  model: BaseNodeModel,
  graphModel: GraphModel,
  style?: CSSStyleDeclaration,
}

interface IState {
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  dragging: boolean,
}
class Control extends Component<IProps> {
  index: number;
  nodeModel: BaseNodeModel;
  graphModel: GraphModel;
  dragHandler: LogicFlowUtil.StepDrag;
  constructor(props) {
    super();
    this.index = props.index;
    this.nodeModel = props.model;
    this.graphModel = props.graphModel;
    // 为保证对齐线功能正常使用，step默认是网格grid的两倍，
    // 没有网格设置，默认为2，保证坐标是整数
    // let step = 2;
    // if (gridSize > 1) {
    //   step = 2 * gridSize;
    // }
    // if (this.nodeModel.gridSize) {
    //   step = 2 * this.nodeModel.gridSize;
    // }
    this.state = {};
    this.dragHandler = new StepDrag({
      onDragging: this.onDragging,
      onDragEnd: this.onDragEnd,
      step: 1,
    });
  }
  getNodeEdges(nodeId) {
    const { graphModel } = this;
    const { edges } = graphModel;
    const sourceEdges = [];
    const targetEdges = [];
    for (let i = 0; i < edges.length; i++) {
      const edgeModel = edges[i];
      if (edgeModel.sourceNodeId === nodeId) {
        sourceEdges.push(edgeModel);
      } else if (edges[i].targetNodeId === nodeId) {
        targetEdges.push(edgeModel);
      }
    }
    return { sourceEdges, targetEdges };
  }
  // 更新中心点位置，更新文案位置
  updatePosition = ({ deltaX, deltaY }) => {
    const { x, y } = this.nodeModel;
    this.nodeModel.x = x + deltaX / 2;
    this.nodeModel.y = y + deltaY / 2;
    this.nodeModel.moveText(deltaX / 2, deltaY / 2);
  };
  // 计算control拖动后，节点的宽高
  getResize = ({ index, deltaX, deltaY, width, height, pct = 1 }) => {
    const resize = { width, height };
    switch (index) {
      case 0:
        resize.width = width - deltaX * pct;
        resize.height = height - deltaY * pct;
        break;
      case 1:
        resize.width = width + deltaX * pct;
        resize.height = height - deltaY * pct;
        break;
      case 2:
        resize.width = width + deltaX;
        resize.height = height + deltaY * pct;
        break;
      case 3:
        resize.width = width - deltaX * pct;
        resize.height = height + deltaY * pct;
        break;
      default:
        break;
    }
    return resize;
  };
  // 矩形更新
  updateRect = ({ deltaX, deltaY }) => {
    const { id, x, y, width, height, radius } = this.nodeModel as RectNodeModel;
    // 更新中心点位置，更新文案位置
    const { index } = this;
    const size = this.getResize({
      index,
      deltaX,
      deltaY,
      width,
      height,
      pct: 1,
    });
    // 限制放大缩小的最大最小范围
    const {
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
    } = this.nodeModel;
    if (size.width < minWidth
      || size.width > maxWidth
      || size.height < minHeight
      || size.height > maxHeight
    ) {
      // 为了避免放到和缩小位置和鼠标不一致的问题
      this.dragHandler.cancelDrag();
      return;
    }
    this.updatePosition({ deltaX, deltaY });
    // 更新宽高
    this.nodeModel.width = size.width;
    this.nodeModel.height = size.height;
    this.nodeModel.setProperties({
      nodeSize:
      {
        width: size.width,
        height: size.height,
      },
    });
    const edges = this.getNodeEdges(id);
    const beforeNode = {
      x,
      y,
      width,
      height,
      radius,
    };
    const afterNode = {
      x: this.nodeModel.x,
      y: this.nodeModel.y,
      width: this.nodeModel.width,
      height: this.nodeModel.height,
      radius,
    };
    const params = {
      point: '',
      beforeNode,
      afterNode,
    };
    // 更新边
    let afterPoint;
    edges.sourceEdges.forEach(item => {
      params.point = item.startPoint;
      afterPoint = getRectReizeEdgePoint(params);
      item.updateStartPoint(afterPoint);
    });
    edges.targetEdges.forEach(item => {
      params.point = item.endPoint;
      afterPoint = getRectReizeEdgePoint(params);
      item.updateEndPoint(afterPoint);
    });
    this.eventEmit({ beforeNode, afterNode });
  };
  // 椭圆更新
  updateEllipse = ({ deltaX, deltaY }) => {
    const { id, rx, ry, x, y } = this.nodeModel as EllipseNodeModel;
    const { index } = this;
    const width = rx;
    const height = ry;
    const size = this.getResize({
      index,
      deltaX,
      deltaY,
      width,
      height,
      pct: 1 / 2,
    });
    // 限制放大缩小的最大最小范围
    const {
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
    } = this.nodeModel;
    if (size.width < (minWidth / 2)
      || size.width > (maxWidth / 2)
      || size.height < (minHeight / 2)
      || size.height > (maxHeight / 2)
    ) {
      this.dragHandler.cancelDrag();
      return;
    }
    // 更新中心点位置，更新文案位置
    this.updatePosition({ deltaX, deltaY });
    // 更新rx ry,宽高为计算属性自动更新
    // @ts-ignore
    this.nodeModel.rx = this.nodeModel.rx + deltaX / 2;
    // @ts-ignore
    this.nodeModel.ry = this.nodeModel.ry + deltaY / 2;
    this.nodeModel.setProperties({
      nodeSize:
      {
        rx: size.width,
        ry: size.height,
      },
    });
    const edges = this.getNodeEdges(id);
    const beforeNode = { x, y };
    const afterNode = {
      rx: size.width,
      ry: size.height,
      x: this.nodeModel.x,
      y: this.nodeModel.y,
    };
    const params = {
      point: {},
      beforeNode,
      afterNode,
    };
    // 更新边
    let afterPoint;
    edges.sourceEdges.forEach(item => {
      params.point = item.startPoint;
      afterPoint = getEllipseReizeEdgePoint(params);
      item.updateStartPoint(afterPoint);
    });
    edges.targetEdges.forEach(item => {
      params.point = item.endPoint;
      afterPoint = getEllipseReizeEdgePoint(params);
      item.updateEndPoint(afterPoint);
    });
    this.eventEmit({ beforeNode: { ...beforeNode, rx, ry }, afterNode });
  };
  // 菱形更新
  updateDiamond = ({ deltaX, deltaY }) => {
    const { id, rx, ry, x, y } = this.nodeModel as DiamondNodeModel;
    const { index } = this;
    const width = rx;
    const height = ry;
    const size = this.getResize({
      index,
      deltaX,
      deltaY,
      width,
      height,
      pct: 1 / 2,
    });
    // 限制放大缩小的最大最小范围
    const {
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
    } = this.nodeModel;
    if (size.width < (minWidth / 2)
      || size.width > (maxWidth / 2)
      || size.height < (minHeight / 2)
      || size.height > (maxHeight / 2)
    ) {
      this.dragHandler.cancelDrag();
      return;
    }
    // 更新中心点位置，更新文案位置
    this.updatePosition({ deltaX, deltaY });
    // 更新rx ry,宽高为计算属性自动更新
    // @ts-ignore
    this.nodeModel.rx = this.nodeModel.rx + deltaX / 2;
    // @ts-ignore
    this.nodeModel.ry = this.nodeModel.ry + deltaY / 2;
    this.nodeModel.setProperties({
      nodeSize:
      {
        rx: size.width,
        ry: size.height,
      },
    });
    const beforeNode = { x, y, rx, ry };
    const afterNode = {
      rx: size.width,
      ry: size.height,
      x: this.nodeModel.x,
      y: this.nodeModel.y,
    };
    const params = {
      point: {},
      beforeNode,
      afterNode,
    };
    // 更新边
    let afterPoint;
    const edges = this.getNodeEdges(id);
    edges.sourceEdges.forEach(item => {
      params.point = item.startPoint;
      afterPoint = getDiamondReizeEdgePoint(params);
      item.updateStartPoint(afterPoint);
    });
    edges.targetEdges.forEach(item => {
      params.point = item.endPoint;
      afterPoint = getDiamondReizeEdgePoint(params);
      item.updateEndPoint(afterPoint);
    });
    this.eventEmit({ beforeNode, afterNode });
  };
  eventEmit = ({ beforeNode, afterNode }) => {
    const { id, modelType, type } = this.nodeModel;
    const oldNodeSize = { id, modelType, type, ...beforeNode };
    const newNodeSize = { id, modelType, type, ...afterNode };
    this.graphModel.eventCenter.emit('node:resize', { oldNodeSize, newNodeSize });
  };
  onDragging = ({ deltaX, deltaY }) => {
    const { transformModel } = this.graphModel;
    const { modelType } = this.nodeModel;
    [deltaX, deltaY] = transformModel.fixDeltaXY(deltaX, deltaY);
    // html和矩形的计算方式是一样的，共用一个方法
    if (modelType === ModelType.RECT_NODE || modelType === ModelType.HTML_NODE) {
      this.updateRect({ deltaX, deltaY });
      // this.nodeModel.resize(deltaX, deltaY);
    } else if (modelType === ModelType.ELLIPSE_NODE) {
      this.updateEllipse({ deltaX, deltaY });
    } else if (modelType === ModelType.DIAMOND_NODE) {
      this.updateDiamond({ deltaX, deltaY });
    }
  };
  /**
   * 由于将拖拽放大缩小改成丝滑模式，这个时候需要在拖拽结束的时候，将节点的位置更新到grid上.
   */
  onDragEnd = () => {
    const { gridSize = 1 } = this.graphModel;
    const x = gridSize * Math.round(this.nodeModel.x / gridSize);
    const y = gridSize * Math.round(this.nodeModel.y / gridSize);
    this.nodeModel.moveTo(x, y);
  };
  render() {
    const {
      x, y, index, model,
    } = this.props;
    const style = model.getControlPointStyle();
    return (
      <g className={`lf-resize-control-${index}`}>
        <Rect
          className="lf-node-control"
          {...{ x, y }}
          {...style}
          onMouseDown={this.dragHandler.handleMouseDown}
        />
      </g>
    );
  }
}

export default Control;
