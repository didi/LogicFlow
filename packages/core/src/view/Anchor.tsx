import { h, Component } from 'preact';
import { createDrag } from '../util/drag';
import { formateAnchorConnectValidateData, targetNodeInfo, distance } from '../util/node';
import Circle from './basic-shape/Circle';
import Line from './basic-shape/Line';
import { ElementState, EventType, OverlapMode } from '../constant/constant';
import BaseNodeModel, { ConnectRuleResult } from '../model/node/BaseNodeModel';
import GraphModel from '../model/GraphModel';
import EventEmitter from '../event/eventEmitter';

type TargetNodeId = string;

interface IProps {
  x: number;
  y: number;
  id?: string;
  style?: Record<string, any>;
  hoverStyle?: Record<string, any>;
  edgeStyle?: Record<string, any>;
  anchorIndex: number;
  eventCenter: EventEmitter;
  graphModel: GraphModel;
  nodeModel: BaseNodeModel;
  nodeDraging: boolean;
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
  dragHandler: Function;
  sourceRuleResults: Map<TargetNodeId, ConnectRuleResult>; // 不同的target，source的校验规则产生的结果不同
  targetRuleResults: Map<TargetNodeId, ConnectRuleResult>; // 不同的target，target的校验规则不同
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

    this.dragHandler = createDrag({
      onDragStart: this.onDragStart,
      onDraging: this.onDraging,
      onDragEnd: this.onDragEnd,
    });
  }
  onDragStart = () => {
    const {
      x, y, nodeModel, graphModel,
    } = this.props;
    const { overlapMode } = graphModel;
    // nodeModel.setSelected(true);
    graphModel.selectNodeById(nodeModel.id);
    if (overlapMode !== OverlapMode.INCREASE) {
      graphModel.toFront(nodeModel.id);
    }
    this.setState({
      startX: x,
      startY: y,
      endX: x,
      endY: y,
    });
  };
  onDraging = ({ deltaX, deltaY }) => {
    const { endX, endY } = this.state;
    const { graphModel, nodeModel } = this.props;
    const { transformMatrix, nodes } = graphModel;
    const [x, y] = transformMatrix.moveCanvasPointByHtml(
      [endX, endY],
      deltaX,
      deltaY,
    );
    this.setState({
      endX: x,
      endY: y,
      draging: true,
    });
    const info = targetNodeInfo({ x: endX, y: endY }, nodes);
    if (info) {
      const targetNode = info.node;
      this.preTargetNode = targetNode;
      // 查看鼠标是否进入过target，若有检验结果，表示进入过
      if (!this.targetRuleResults.has(targetNode.id)) {
        const sourceRuleResult = nodeModel.isAllowConnectedAsSource(targetNode);
        const targetRuleResult = targetNode.isAllowConnectedAsTarget(nodeModel);
        this.sourceRuleResults.set(
          targetNode.id,
          formateAnchorConnectValidateData(sourceRuleResult),
        );
        this.targetRuleResults.set(
          targetNode.id,
          formateAnchorConnectValidateData(targetRuleResult),
        );
      }
      const { isAllPass: isSourcePass } = this.sourceRuleResults.get(targetNode.id);
      const { isAllPass: isTargetPass } = this.targetRuleResults.get(targetNode.id);
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
  };
  onDragEnd = () => {
    this.checkEnd();
    this.setState({
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      draging: false,
    });
  };

  checkEnd = () => {
    const {
      graphModel, nodeModel, x, y, eventCenter, id,
    } = this.props;
    // nodeModel.setSelected(false);
    /* 创建连线 */
    const { nodes, edgeType } = graphModel;
    const { endX, endY, draging } = this.state;
    const info = targetNodeInfo({ x: endX, y: endY }, nodes);
    // 为了保证鼠标离开的时候，将上一个节点状态重置为正常状态。
    if (this.preTargetNode && this.preTargetNode.state !== ElementState.DEFAULT) {
      this.preTargetNode.setElementState(ElementState.DEFAULT);
    }
    // 没有draging就结束连线
    if (!draging) return;
    if (info && info.node) {
      const targetNode = info.node;
      const {
        isAllPass: isSourcePass,
        msg: sourceMsg,
      } = this.sourceRuleResults.get(targetNode.id) || {};
      const {
        isAllPass: isTargetPass,
        msg: targetMsg,
      } = this.targetRuleResults.get(targetNode.id) || {};
      if (isSourcePass && isTargetPass) {
        targetNode.setElementState(ElementState.ALLOW_CONNECT);
        // 不允许锚点自己连自己
        if (!(x === info.anchor.x && y === info.anchor.y)) {
          graphModel.createEdge({
            type: edgeType,
            sourceNodeId: nodeModel.id,
            sourceAnchorId: id,
            startPoint: { x, y },
            targetNodeId: info.node.id,
            targetAnchorId: info.anchor.id,
            endPoint: { x: info.anchor.x, y: info.anchor.y },
          });
          // 清除掉缓存结果 fix:#320 因为创建连线之后，会影响校验结果变化，所以需要重新校验
          this.targetRuleResults.clear();
        }
      } else {
        const nodeData = targetNode.getData();
        eventCenter.emit(EventType.CONNECTION_NOT_ALLOWED, {
          data: nodeData,
          msg: targetMsg || sourceMsg,
        });
      }
    }
  };
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
      x, y, style, edgeStyle, hoverStyle,
    } = this.props;
    return (
      // className="lf-anchor" 作为下载时，需要将锚点删除的依据，不要修改，svg结构也不要做修改否则会引起下载bug
      <g className="lf-anchor">
        <Circle
          className="lf-node-anchor-hover"
          {...{ x, y }}
          {...hoverStyle}
          onMouseDown={this.dragHandler}
        />
        <Circle
          className="lf-node-anchor"
          {...{ x, y }}
          {...style}
          onMouseDown={this.dragHandler}
        />
        {this.isShowLine() && (
          <Line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            pointer-events="none"
            {...edgeStyle}
          />
        )}
      </g>
    );
  }
}

export default Anchor;
