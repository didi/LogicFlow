import { h, Component } from 'preact';
import { StepDrag } from '../util/drag';
import { formateAnchorConnectValidateData, targetNodeInfo, distance } from '../util/node';
import Circle from './basic-shape/Circle';
import Line from './basic-shape/Line';
import { ElementState, EventType, OverlapMode } from '../constant/constant';
import BaseNodeModel, { ConnectRuleResult } from '../model/node/BaseNodeModel';
import GraphModel from '../model/GraphModel';
// import EventEmitter from '../event/eventEmitter';
import { AnchorConfig } from '../type';
import { BaseNode } from './node';
import { cancelRaf, createRaf } from '../util/raf';

type TargetNodeId = string;

interface IProps {
  // x: number;
  // y: number;
  // id?: string;
  anchorData: AnchorConfig,
  node: BaseNode,
  style?: Record<string, any>;
  hoverStyle?: Record<string, any>;
  edgeStyle?: Record<string, any>;
  anchorIndex: number;
  graphModel: GraphModel;
  nodeModel: BaseNodeModel;
  setHoverOFF: Function;
}

interface IState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  draging: boolean;
}

class Anchor extends Component<IProps, IState> {
  preTargetNode: BaseNodeModel;
  sourceRuleResults: Map<TargetNodeId, ConnectRuleResult>; // 不同的target，source的校验规则产生的结果不同
  targetRuleResults: Map<TargetNodeId, ConnectRuleResult>; // 不同的target，target的校验规则不同
  dragHandler: StepDrag;
  t: any;
  constructor() {
    super();
    this.sourceRuleResults = new Map();
    this.targetRuleResults = new Map();

    this.state = {
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      draging: false,
    };
    this.dragHandler = new StepDrag({
      onDragStart: this.onDragStart,
      onDraging: this.onDraging,
      onDragEnd: this.onDragEnd,
    });
  }
  getAnchorShape() {
    const {
      anchorData,
      style,
      node,
    } = this.props;
    const anchorShape = node.getAnchorShape(anchorData);
    if (anchorShape) return anchorShape;
    const { x, y } = anchorData;
    const hoverStyle = {
      ...style,
      ...style.hover,
    };
    return (
      <g>
        <Circle
          className="lf-node-anchor-hover"
          {...hoverStyle}
          {...{ x, y }}
        />
        <Circle
          className="lf-node-anchor"
          {...style}
          {...{ x, y }}
        />
      </g>
    );
  }
  onDragStart = ({ event }) => {
    const {
      anchorData, nodeModel, graphModel,
    } = this.props;
    const { overlapMode } = graphModel;
    // nodeModel.setSelected(true);
    graphModel.selectNodeById(nodeModel.id);
    if (overlapMode !== OverlapMode.INCREASE && nodeModel.autoToFront) {
      graphModel.toFront(nodeModel.id);
    }
    graphModel.eventCenter.emit(EventType.ANCHOR_DRAGSTART, {
      data: anchorData,
      e: event,
      nodeModel,
    });
    this.setState({
      startX: anchorData.x,
      startY: anchorData.y,
      endX: anchorData.x,
      endY: anchorData.y,
    });
  };
  onDraging = ({ event }) => {
    const {
      graphModel, nodeModel, anchorData,
    } = this.props;
    const {
      transformModel,
      eventCenter,
      width,
      height,
      editConfigModel: {
        autoExpand,
        stopMoveGraph,
      },
    } = graphModel;
    const { clientX, clientY } = event;
    const {
      domOverlayPosition: { x, y },
      canvasOverlayPosition: { x: x1, y: y1 },
    } = graphModel.getPointByClient({
      x: clientX,
      y: clientY,
    });
    if (this.t) {
      cancelRaf(this.t);
    }
    let nearBoundary = [];
    const size = 10;
    if (x < 10) {
      nearBoundary = [size, 0];
    } else if (x + 10 > width) {
      nearBoundary = [-size, 0];
    } else if (y < 10) {
      nearBoundary = [0, size];
    } else if (y + 10 > height) {
      nearBoundary = [0, -size];
    }
    this.setState({
      endX: x1,
      endY: y1,
      draging: true,
    });
    this.moveAnchorEnd(x1, y1);
    if (nearBoundary.length > 0 && !stopMoveGraph && autoExpand) {
      this.t = createRaf(() => {
        const [translateX, translateY] = nearBoundary;
        transformModel.translate(translateX, translateY);
        const { endX, endY } = this.state;
        this.setState({
          endX: endX - translateX,
          endY: endY - translateY,
        });
        this.moveAnchorEnd(endX - translateX, endY - translateY);
      });
    }
    eventCenter.emit(EventType.ANCHOR_DRAG, {
      data: anchorData,
      e: event,
      nodeModel,
    });
  };
  onDragEnd = (event) => {
    if (this.t) {
      cancelRaf(this.t);
    }
    this.checkEnd(event);
    this.setState({
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      draging: false,
    });
    // 清除掉缓存结果 fix:#320 因为创建边之后，会影响校验结果变化，所以需要重新校验
    this.sourceRuleResults.clear();
    this.targetRuleResults.clear();
  };

  checkEnd = (event) => {
    const {
      graphModel, nodeModel, anchorData: { x, y, id },
    } = this.props;
    // nodeModel.setSelected(false);
    /* 创建边 */
    const { edgeType } = graphModel;
    const { endX, endY, draging } = this.state;
    const info = targetNodeInfo({ x: endX, y: endY }, graphModel);
    // 为了保证鼠标离开的时候，将上一个节点状态重置为正常状态。
    if (this.preTargetNode && this.preTargetNode.state !== ElementState.DEFAULT) {
      this.preTargetNode.setElementState(ElementState.DEFAULT);
    }
    // 没有draging就结束边
    if (!draging) return;
    if (info && info.node) {
      const targetNode = info.node;
      const anchorId = info.anchor.id;
      const targetInfoId = `${nodeModel.id}_${targetNode.id}_${anchorId}_${id}`;
      const {
        isAllPass: isSourcePass,
        msg: sourceMsg,
      } = this.sourceRuleResults.get(targetInfoId) || {};
      const {
        isAllPass: isTargetPass,
        msg: targetMsg,
      } = this.targetRuleResults.get(targetInfoId) || {};
      if (isSourcePass && isTargetPass) {
        targetNode.setElementState(ElementState.DEFAULT);
        const edgeModel = graphModel.addEdge({
          type: edgeType,
          sourceNodeId: nodeModel.id,
          sourceAnchorId: id,
          startPoint: { x, y },
          targetNodeId: info.node.id,
          targetAnchorId: info.anchor.id,
          endPoint: { x: info.anchor.x, y: info.anchor.y },
        });
        const { anchorData } = this.props;
        graphModel.eventCenter.emit(EventType.ANCHOR_DROP, {
          data: anchorData,
          e: event,
          nodeModel,
          edgeModel,
        });
      } else {
        const nodeData = targetNode.getData();
        graphModel.eventCenter.emit(EventType.CONNECTION_NOT_ALLOWED, {
          data: nodeData,
          msg: targetMsg || sourceMsg,
        });
      }
    }
  };
  moveAnchorEnd(endX: number, endY: number) {
    const { graphModel, nodeModel, anchorData } = this.props;
    const info = targetNodeInfo({ x: endX, y: endY }, graphModel);
    if (info) {
      const targetNode = info.node;
      const anchorId = info.anchor.id;
      if (this.preTargetNode && this.preTargetNode !== info.node) {
        this.preTargetNode.setElementState(ElementState.DEFAULT);
      }
      // #500 不允许锚点自己连自己, 在锚点一开始连接的时候, 不触发自己连接自己的校验。
      if (anchorData.id === anchorId) {
        return;
      }
      this.preTargetNode = targetNode;
      // 支持节点的每个锚点单独设置是否可连接，因此规则key去nodeId + anchorId作为唯一值
      const targetInfoId = `${nodeModel.id}_${targetNode.id}_${anchorId}_${anchorData.id}`;

      // 查看鼠标是否进入过target，若有检验结果，表示进入过, 就不重复计算了。
      if (!this.targetRuleResults.has(targetInfoId)) {
        const targetAnchor = info.anchor;
        const sourceRuleResult = nodeModel.isAllowConnectedAsSource(
          targetNode,
          anchorData,
          targetAnchor,
        );
        const targetRuleResult = targetNode.isAllowConnectedAsTarget(
          nodeModel,
          anchorData,
          targetAnchor,
        );
        this.sourceRuleResults.set(
          targetInfoId,
          formateAnchorConnectValidateData(sourceRuleResult),
        );
        this.targetRuleResults.set(
          targetInfoId,
          formateAnchorConnectValidateData(targetRuleResult),
        );
      }
      const { isAllPass: isSourcePass } = this.sourceRuleResults.get(targetInfoId);
      const { isAllPass: isTargetPass } = this.targetRuleResults.get(targetInfoId);
      // 实时提示出即将链接的锚点
      if (isSourcePass && isTargetPass) {
        targetNode.setElementState(ElementState.ALLOW_CONNECT);
      } else {
        targetNode.setElementState(ElementState.NOT_ALLOW_CONNECT);
      }
    } else if (this.preTargetNode && this.preTargetNode.state !== ElementState.DEFAULT) {
      // 为了保证鼠标离开的时候，将上一个节点状态重置为正常状态。
      this.preTargetNode.setElementState(ElementState.DEFAULT);
    }
  }
  isShowLine() {
    const {
      startX,
      startY,
      endX,
      endY,
    } = this.state;
    const v = distance(startX, startY, endX, endY);
    return v > 10;
  }
  render() {
    const {
      startX,
      startY,
      endX,
      endY,
    } = this.state;
    const {
      anchorData: { edgeAddable }, edgeStyle,
    } = this.props;
    return (
      // className="lf-anchor" 作为下载时，需要将锚点删除的依据，不要修改类名
      <g className="lf-anchor">
        <g
          onMouseDown={(ev) => {
            if (edgeAddable !== false) {
              this.dragHandler.handleMouseDown(ev);
            }
          }}
        >
          { this.getAnchorShape() }
        </g>
        {this.isShowLine() && (
          <Line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            {...edgeStyle}
            pointer-events="none"
          />
        )}
      </g>
    );
  }
}

export default Anchor;
