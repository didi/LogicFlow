import {
  h, Component,
} from 'preact';
import { observer } from 'mobx-react';
import LogicFlow from '../LogicFlow';
// import BaseNodeModel from '../model/node/BaseNodeModel';
import GraphModel from '../model/GraphModel';
import { ElementType } from '../constant/constant';
import { getNodeOutline, getEdgeOutline } from '../algorithm/outline';
import { StepDrag } from '../util/drag';

type IProps = {
  graphModel: GraphModel;
  logicFlow: LogicFlow;
};

@observer
export default class MultipleSelect extends Component<IProps> {
  stepDrag;
  constructor(props) {
    super();
    const {
      graphModel: { gridSize }, eventCenter,
    } = props;
    this.stepDrag = new StepDrag({
      onDragStart: this.onDragStart,
      onDraging: this.onDraging,
      onDragEnd: this.onDragEnd,
      step: gridSize,
      eventType: 'multiple:select',
      eventCenter,
    });
  }
  handleMouseDown = (ev: MouseEvent) => {
    this.stepDrag.handleMouseDown(ev);
  };
  onDragStart = () => {};
  onDraging = ({ deltaX, deltaY }) => {
    const { graphModel } = this.props;
    graphModel.moveElements(graphModel.getSelectElements(true), deltaX, deltaY);
  };
  onDragEnd = () => {};
  render() {
    const { graphModel: { selectElements, selectElementSize, transformMatrix } } = this.props;
    const isShowSelection = selectElementSize > 1;
    if (!isShowSelection) return;
    let x = Number.MAX_SAFE_INTEGER;
    let y = Number.MAX_SAFE_INTEGER;
    let x1 = Number.MIN_SAFE_INTEGER;
    let y1 = Number.MIN_SAFE_INTEGER;
    selectElements.forEach(element => {
      let outline = {
        x: 0,
        y: 0,
        x1: 0,
        y1: 0,
      };
      if (element.BaseType === ElementType.NODE) outline = getNodeOutline(element);
      if (element.BaseType === ElementType.EDGE) outline = getEdgeOutline(element);
      x = Math.min(x, outline.x);
      y = Math.min(y, outline.y);
      x1 = Math.max(x1, outline.x1);
      y1 = Math.max(y1, outline.y1);
    });
    [x, y] = transformMatrix.CanvasPointToHtmlPoint([x, y]);
    [x1, y1] = transformMatrix.CanvasPointToHtmlPoint([x1, y1]);
    const style = {
      left: `${x - 10}px`,
      top: `${y - 10}px`,
      width: `${x1 - x + 20}px`,
      height: `${y1 - y + 20}px`,
    };
    return (
      <div
        className="lf-multiple-select"
        style={style}
        onMouseDown={this.handleMouseDown}
      />
    );
  }
}
