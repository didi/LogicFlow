import { h, Component } from 'preact';
import { createDrag } from '../util/drag';
import { formateAnchorConnectValidateData, targetNodeInfo, distance } from '../util/node';
import Circle from './basic-shape/Circle';
import Line from './basic-shape/Line';
import { ElementState, EventType, OverlapMode } from '../constant/constant';
import BaseNodeModel, { ConnectRuleResult } from '../model/node/BaseNodeModel';
import GraphModel from '../model/GraphModel';
import EventEmitter from '../event/eventEmitter';
import { AnchorConfig } from '../type';

type TargetNodeId = string;

interface IProps {
  x: number;
  y: number;
  id?: string;
  anchorData: AnchorConfig,
  style?: Record<string, any>;
  hoverStyle?: Record<string, any>;
  edgeStyle?: Record<string, any>;
  anchorIndex: number;
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
    if (overlapMode !== OverlapMode.INCREASE && nodeModel.autoToFront) {
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
    const { transformModel, nodes } = graphModel;
    const [x, y] = transformModel.moveCanvasPointByHtml(
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
      const anchorId = info.anchor.id;
      // 支持节点的每个锚点单独设置是否可连接，因此规则key去nodeId + anchorId作为唯一值
      const targetInfoId = `${targetNode.id}_${anchorId}`;
      // 查看鼠标是否进入过target，若有检验结果，表示进入过
      if (!this.targetRuleResults.has(targetInfoId)) {
        const { anchorData } = this.props;
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
          targetNode.id,
          formateAnchorConnectValidateData(sourceRuleResult),
        );
        this.targetRuleResults.set(
          targetInfoId,
          formateAnchorConnectValidateData(targetRuleResult),
        );
      }
      const { isAllPass: isSourcePass } = this.sourceRuleResults.get(targetNode.id);
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
    // 清除掉缓存结果 fix:#320 因为创建边之后，会影响校验结果变化，所以需要重新校验
    this.sourceRuleResults.clear();
    this.targetRuleResults.clear();
  };

  checkEnd = () => {
    const {
      graphModel, nodeModel, x, y, id,
    } = this.props;
    // nodeModel.setSelected(false);
    /* 创建边 */
    const { nodes, edgeType } = graphModel;
    const { endX, endY, draging } = this.state;
    const info = targetNodeInfo({ x: endX, y: endY }, nodes);
    // 为了保证鼠标离开的时候，将上一个节点状态重置为正常状态。
    if (this.preTargetNode && this.preTargetNode.state !== ElementState.DEFAULT) {
      this.preTargetNode.setElementState(ElementState.DEFAULT);
    }
    // 没有draging就结束边
    if (!draging) return;
    if (info && info.node) {
      const targetNode = info.node;
      const {
        isAllPass: isSourcePass,
        msg: sourceMsg,
      } = this.sourceRuleResults.get(targetNode.id) || {};
      const anchorId = info.anchor.id;
      const targetInfoId = `${targetNode.id}_${anchorId}`;
      const {
        isAllPass: isTargetPass,
        msg: targetMsg,
      } = this.targetRuleResults.get(targetInfoId) || {};
      if (isSourcePass && isTargetPass) {
        targetNode.setElementState(ElementState.ALLOW_CONNECT);
        // 不允许锚点自己连自己
        if (!(x === info.anchor.x && y === info.anchor.y)) {
          graphModel.addEdge({
            type: edgeType,
            sourceNodeId: nodeModel.id,
            sourceAnchorId: id,
            startPoint: { x, y },
            targetNodeId: info.node.id,
            targetAnchorId: info.anchor.id,
            endPoint: { x: info.anchor.x, y: info.anchor.y },
          });
        }
      } else {
        const nodeData = targetNode.getData();
        graphModel.eventCenter.emit(EventType.CONNECTION_NOT_ALLOWED, {
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
      x, y, style, edgeStyle,
    } = this.props;
    const hoverStyle = {
      ...style,
      ...style.hover,
    };
    return (
      // className="lf-anchor" 作为下载时，需要将锚点删除的依据，不要修改，svg结构也不要做修改否则会引起下载bug
      <g className="lf-anchor">
        <Circle
          className="lf-node-anchor-hover"
          {...hoverStyle}
          {...{ x, y }}
          onMouseDown={this.dragHandler}
        />
        <Circle
          className="lf-node-anchor"
          {...style}
          {...{ x, y }}
          onMouseDown={this.dragHandler}
        />
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
