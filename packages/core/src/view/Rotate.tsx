/* eslint-disable max-len */
import { Component, h } from 'preact';
import { map, reduce } from 'lodash';
import Circle from './basic-shape/Circle';
import { GraphModel, BaseNodeModel } from '../model';
import { StepDrag, TranslateMatrix, Vector } from '../util';
import EventEmitter from '../event/eventEmitter';
import { CommonTheme } from '../constant/DefaultTheme';
import { EventType } from '../constant/constant';

interface IProps {
  graphModel: GraphModel;
  nodeModel: BaseNodeModel;
  eventCenter: EventEmitter;
  style: CommonTheme;
}

class RotateControlPoint extends Component<IProps> {
  private style = {};
  private defaultAngle!: number;
  normal!: Vector;
  stepperDrag: any;

  constructor(props: IProps) {
    super(props);
    this.style = props.style;
    this.stepperDrag = new StepDrag({
      onDragging: this.onDragging,
    });
  }

  onDragging = ({ event }: any) => {
    const { graphModel, nodeModel, eventCenter } = this.props;
    const { selectNodes } = graphModel;
    const { x, y } = nodeModel;
    const { clientX, clientY } = event;
    const {
      canvasOverlayPosition: { x: cx, y: cy },
    } = graphModel.getPointByClient({
      x: clientX,
      y: clientY,
    });
    const v = new Vector(cx - x, cy - y);
    const angle = this.normal?.angle(v) - this.defaultAngle;
    const matrix = new TranslateMatrix(-x, -y).rotate(angle).translate(x, y).toString();
    nodeModel.gMatrix = matrix;
    nodeModel.rotate = angle;

    let nodeIds = map(selectNodes, (node) => node.id);
    if (nodeIds.indexOf(nodeModel.id) === -1) {
      nodeIds = [nodeModel.id];
    }
    const nodeIdMap = reduce(
      nodeIds,
      (acc, nodeId) => {
        const node = graphModel.getNodeModelById(nodeId);
        acc[nodeId] = node?.getMoveDistance(0, 0, false);
        return acc;
      },
      {},
    );
    nodeIds.forEach((nodeId) => {
      const edges = graphModel.getNodeEdges(nodeId);
      edges.forEach(edge => {
        if (nodeIdMap[(edge.sourceNodeId as string)]) {
          const model = graphModel.getNodeModelById(edge.sourceNodeId);
          const anchor = (model as BaseNodeModel).anchors.find((item) => item.id === (edge.sourceAnchorId));
          edge.updateStartPoint(anchor);
        }
        if (nodeIdMap[(edge.targetNodeId as string)]) {
          const model = graphModel.getNodeModelById(edge.targetNodeId);
          const anchor = (model as BaseNodeModel).anchors.find((item) => item.id === (edge.targetAnchorId));
          edge.updateEndPoint(anchor);
        }
      });
    });

    eventCenter.emit(EventType.NODE_ROTATE, {
      e: event,
      nodeModel,
    });
  };
  render() {
    const { nodeModel } = this.props;
    const { x, y, width, height } = nodeModel;
    const cx = x + width / 2 + 20;
    const cy = y - height / 2 - 20;
    this.normal = new Vector(1, 0);
    this.defaultAngle = this.normal.angle(new Vector(cx - x, cy - y));
    nodeModel.defaultAngle = this.defaultAngle;
    return (
      <g className="lf-rotate-control">
        <g
          onMouseDown={(ev) => {
            this.stepperDrag.handleMouseDown(ev);
          }}
        >
          <Circle
            {...this.style}
            cx={cx}
            cy={cy}
          />
        </g>
      </g>
    );
  }
}

export default RotateControlPoint;
