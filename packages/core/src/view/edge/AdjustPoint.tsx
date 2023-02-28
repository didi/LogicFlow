import { h, Component } from 'preact';
import { BaseEdgeModel } from '../../model/edge';
import GraphModel from '../../model/GraphModel';
import { StepDrag } from '../../util/drag';
import { formateAnchorConnectValidateData, targetNodeInfo } from '../../util/node';
import { Point } from '../../type';
import { ElementState, EventType, ModelType } from '../../constant/constant';
import { BaseNodeModel } from '../..';

interface IProps {
  x: number;
  y: number;
  type: AdjustType;
  id?: string;
  getAdjustPointShape: Function;
  graphModel: GraphModel;
  edgeModel: BaseEdgeModel;
}
interface IState {
  dragging: boolean;
  endX: number;
  endY: number;
}

interface OldEdge {
  startPoint: Point;
  endPoint: Point;
  pointsList: Point[];
}

enum AdjustType {
  SOURCE = 'SOURCE',
  TARGET = 'TARGET',
}

export default class AdjustPoint extends Component<IProps, IState> {
  stepDragData: any;
  stepDrag: StepDrag;
  oldEdge: OldEdge;
  preTargetNode: any;
  targetRuleResults: Map<any, any>;
  sourceRuleResults: Map<any, any>;
  constructor(props) {
    super();
    this.state = {
      dragging: false,
      endX: 0,
      endY: 0,
    };
    this.targetRuleResults = new Map();
    this.sourceRuleResults = new Map();
    const { type, edgeModel, graphModel } = props;
    const { eventCenter } = graphModel;
    this.stepDragData = {
      type,
      edgeData: (edgeModel as BaseEdgeModel).getData(),
    };
    this.stepDrag = new StepDrag({
      onDragStart: this.onDragStart,
      onDragging: this.onDragging,
      onDragEnd: this.onDragEnd,
      eventType: 'ADJUST_POINT',
      isStopPropagation: false,
      eventCenter,
      data: this.stepDragData,
    });
  }
  handleMouseDown = (ev: MouseEvent) => {
    if (this.stepDrag) {
      this.stepDrag.handleMouseDown(ev);
    }
  };
  onDragStart = () => {
    const {
      x, y, edgeModel,
    } = this.props;
    const { startPoint, endPoint, pointsList } = edgeModel;
    // 记录下原始路径信息，在调整中，如果放弃调整，进行路径还原
    this.oldEdge = {
      startPoint,
      endPoint,
      pointsList,
    };
    this.setState({
      endX: x,
      endY: y,
      dragging: true,
    });
    // 拖拽AdjustPoint时不修改edgeModel.isHitable，避免偶尔会出现边不能点击问题(https://github.com/didi/LogicFlow/issues/974)
    // edgeModel.isHitable = false;
  };
  onDragging = ({ deltaX, deltaY }) => {
    const { endX, endY } = this.state;
    const { graphModel, type } = this.props;
    const { transformModel, editConfigModel } = graphModel;
    const [x, y] = transformModel.moveCanvasPointByHtml(
      [endX, endY],
      deltaX,
      deltaY,
    );
    this.setState({
      endX: x,
      endY: y,
      dragging: true,
    });
    // 调整过程中实时更新路径
    const { edgeModel } = this.props;
    const info = targetNodeInfo({ x: endX, y: endY }, graphModel);
    // 如果一定的坐标能够找到目标节点，预结算当前节点与目标节点的路径进行展示
    if (info && info.node && this.isAllowAdjust(info)) {
      let params;
      const { startPoint, endPoint, sourceNode, targetNode } = edgeModel;
      if (type === AdjustType.SOURCE) {
        params = {
          startPoint: { x: info.anchor.x, y: info.anchor.y },
          endPoint: { x: endPoint.x, y: endPoint.y },
          sourceNode: info.node,
          targetNode,
        };
      } else if (type === AdjustType.TARGET) {
        params = {
          startPoint: { x: startPoint.x, y: startPoint.y },
          endPoint: { x: info.anchor.x, y: info.anchor.y },
          sourceNode,
          targetNode: info.node,
        };
      }
      edgeModel.updateAfterAdjustStartAndEnd(params);
    } else if (type === AdjustType.SOURCE) {
      // 如果没有找到目标节点，更显起终点为当前坐标
      edgeModel.updateStartPoint({ x, y });
    } else if (type === AdjustType.TARGET) {
      edgeModel.updateEndPoint({ x, y });
    }

    if (edgeModel.text.value && editConfigModel.adjustEdge) {
      edgeModel.setText(Object.assign({}, edgeModel.text, edgeModel.textPosition));
    }
  };
  onDragEnd = ({ event }) => {
    try {
      // 将状态置为非拖拽状态
      this.setState({
        dragging: false,
      });
      const {
        graphModel, edgeModel, type,
      } = this.props;
      // 拖拽AdjustPoint时不修改edgeModel.isHitable，避免偶尔会出现边不能点击问题(https://github.com/didi/LogicFlow/issues/974)
      // edgeModel.isHitable = true;
      const { endX, endY, dragging } = this.state;
      const info = targetNodeInfo({ x: endX, y: endY }, graphModel);
      // 没有dragging就结束边
      if (!dragging) return;
      // 如果找到目标节点，删除老边，创建新边
      let needRecoveryEdge = false;
      let createEdgeInfo;
      if (info && info.node && this.isAllowAdjust(info)) {
        const edgeData = edgeModel.getData();
        createEdgeInfo = {
          ...edgeData,
          sourceAnchorId: '',
          targetAnchorId: '',
          text: edgeData?.text?.value || '',
        };
        // 根据调整点是边的起点或重点，计算创建边需要的参数
        if (type === AdjustType.SOURCE) {
          const edgeInfo = graphModel.edgeGenerator(
            graphModel.getNodeModelById(info.node.id).getData(),
            graphModel.getNodeModelById(edgeModel.targetNodeId).getData(),
            createEdgeInfo,
          );
          createEdgeInfo = {
            ...edgeInfo,
            sourceNodeId: info.node.id,
            sourceAnchorId: info.anchor.id,
            startPoint: { x: info.anchor.x, y: info.anchor.y },
            targetNodeId: edgeModel.targetNodeId,
            endPoint: { ...edgeModel.endPoint },
          };
          // 找到的是原有的源节点上的原锚点时，还原边
          if (edgeModel.sourceNodeId === info.node.id
            && edgeModel.sourceAnchorId === info.anchor.id) {
            needRecoveryEdge = true;
          }
        } else if (type === AdjustType.TARGET) {
          const edgeInfo = graphModel.edgeGenerator(
            graphModel.getNodeModelById(edgeModel.sourceNodeId).getData(),
            graphModel.getNodeModelById(info.node.id).getData(),
            createEdgeInfo,
          );
          createEdgeInfo = {
            ...edgeInfo,
            sourceNodeId: edgeModel.sourceNodeId,
            startPoint: { ...edgeModel.startPoint },
            targetNodeId: info.node.id,
            targetAnchorId: info.anchor.id,
            endPoint: { x: info.anchor.x, y: info.anchor.y },
          };
          // 找到的是原有的目标节点上的原锚点时，还原边
          if (edgeModel.targetNodeId === info.node.id
            && edgeModel.targetAnchorId === info.anchor.id) {
            needRecoveryEdge = true;
          }
        }
      } else {
        needRecoveryEdge = true;
      }
      if (!needRecoveryEdge) {
        // 为了保证id不变必须要先删除老边，再创建新边，创建新边是会判断是否有重复的id
        // 删除老边
        graphModel.deleteEdgeById(edgeModel.id);
        // 创建新边
        const edge = graphModel.addEdge({ ...createEdgeInfo }) as BaseEdgeModel;
        // 向外抛出事件
        graphModel.eventCenter.emit(
          EventType.EDGE_EXCHANGE_NODE,
          { data: { newEdge: edge.getData(), oldEdge: edgeModel.getData() } },
        );
      } else {
        // 如果没有找到目标节点，还原边
        this.recoveryEdge();
      }
      this.preTargetNode?.setElementState(ElementState.DEFAULT);
    } finally {
      const { graphModel } = this.props;
      graphModel.eventCenter.emit(EventType.ADJUST_POINT_DRAGEND, {
        e: event,
        data: this.stepDragData,
      });
    }
  };
  // 还原边
  recoveryEdge = () => {
    const { edgeModel } = this.props;
    const { startPoint, endPoint, pointsList } = this.oldEdge;
    edgeModel.updateStartPoint(startPoint);
    edgeModel.updateEndPoint(endPoint);
    // 折线和曲线还需要更新其pointsList
    if (edgeModel.modelType !== ModelType.LINE_EDGE) {
      edgeModel.pointsList = pointsList;
      edgeModel.initPoints();
    }
  };
  // 调整点的样式默认从主题中读取， 可以复写此方法进行更加个性化的自定义
  // 目前仅支持圆形图标进行标识，可以从圆形的r和颜色上进行调整
  getAdjustPointStyle = () => {
    const { graphModel: { theme }, edgeModel } = this.props;
    const { edgeAdjust } = theme;

    return edgeAdjust;
  };

  isAllowAdjust(info) {
    const {
      edgeModel: { id, sourceNode, targetNode, sourceAnchorId, targetAnchorId },
      type,
    } = this.props;
    // const newTargetNode = info.node;
    let newSourceNode: BaseNodeModel = null;
    let newTargetNode: BaseNodeModel = null;
    let newSourceAnchor = null;
    let newTargetAnchor = null;

    // 如果调整的是连线起点
    if (type === AdjustType.SOURCE) {
      newSourceNode = info.node;
      newTargetNode = targetNode;
      newSourceAnchor = info.anchor;
      newTargetAnchor = targetNode.getAnchorInfo(targetAnchorId);
    } else {
      newSourceNode = sourceNode;
      newTargetNode = info.node;
      newTargetAnchor = info.anchor;
      newSourceAnchor = sourceNode.getAnchorInfo(sourceAnchorId);
    }
    // 如果前一个接触的节点和此时接触的节点不相等，则将前一个节点状态重新设置为默认状态。
    if (this.preTargetNode && this.preTargetNode !== info.node) {
      this.preTargetNode.setElementState(ElementState.DEFAULT);
    }
    this.preTargetNode = info.node;
    // #500 不允许锚点自己连自己, 在锚点一开始连接的时候, 不触发自己连接自己的校验。
    if (newTargetAnchor.id === newSourceAnchor.id) {
      return false;
    }
    const targetInfoId = `${newSourceNode.id}_${newTargetNode.id}_${newSourceAnchor.id}_${newTargetAnchor.id}`;
    // 查看鼠标是否进入过target，若有检验结果，表示进入过, 就不重复计算了。
    if (!this.targetRuleResults.has(targetInfoId)) {
      const sourceRuleResult = newSourceNode.isAllowConnectedAsSource(
        newTargetNode,
        newSourceAnchor,
        newTargetAnchor,
        id,
      );
      const targetRuleResult = newTargetNode.isAllowConnectedAsTarget(
        newSourceNode,
        newSourceAnchor,
        newTargetAnchor,
        id,
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
    // 实时提示出即将连接的节点是否允许连接
    const state = (isSourcePass && isTargetPass)
      ? ElementState.ALLOW_CONNECT
      : ElementState.NOT_ALLOW_CONNECT;
    if (type === AdjustType.SOURCE) {
      newSourceNode.setElementState(state);
    } else {
      newTargetNode.setElementState(state);
    }
    return isSourcePass && isTargetPass;
  }
  render() {
    const { x, y, getAdjustPointShape } = this.props;
    const { dragging } = this.state;
    return (
      <g pointerEvents={dragging ? 'none' : ''} onMouseDown={this.handleMouseDown}>
        { getAdjustPointShape(x, y, dragging)}
      </g>
    );
  }

}
