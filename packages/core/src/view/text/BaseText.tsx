import { h, Component } from 'preact';
import GraphModel from '../../model/GraphModel';
import { StepDrag } from '../../util/drag';
import Text from '../basic-shape/Text';
import { IBaseModel } from '../../model/BaseModel';
import { ElementState, EventType } from '../../constant/constant';

type IProps = {
  model: IBaseModel;
  graphModel: GraphModel;
  draggable: boolean;
  editable: boolean;
};
type IState = {
  isHovered: boolean;
};

export default class BaseText extends Component<IProps, IState> {
  dragHandler: (ev: MouseEvent) => void;
  sumDeltaX = 0;
  sumDeltaY = 0;
  stepDrag: StepDrag;
  constructor(config) {
    super();
    const { model, draggable } = config;
    this.stepDrag = new StepDrag({
      onDragging: this.onDragging,
      onDragEnd: this.onDragEnd,
      step: 1,
      model,
      isStopPropagation: draggable,
    });
  }
  getShape() {
    const { model, graphModel } = this.props;
    const { text } = model;
    const { editConfigModel } = graphModel;
    const { value, x, y, editable, draggable } = text;
    const attr = {
      x,
      y,
      className: '',
      value,
    };
    if (editable) {
      attr.className = 'lf-element-text';
    } else if (draggable || editConfigModel.nodeTextDraggable) {
      attr.className = 'lf-text-draggable';
    } else {
      attr.className = 'lf-text-disabled';
    }
    const style = model.getTextStyle();
    return (
      <Text {...attr} {...style} model={model} />
    );
  }
  onDragging = ({ deltaX, deltaY }) => {
    const {
      model,
      graphModel: {
        transformModel,
      },
    } = this.props;
    const [curDeltaX, curDeltaY] = transformModel.fixDeltaXY(deltaX, deltaY);
    model.moveText(curDeltaX, curDeltaY);
  };
  onDragEnd = (e) => {
    const {
      model,
      graphModel: {
        eventCenter,
      },
    } = this.props;
    eventCenter?.emit(EventType.TEXT_DROP, { e, data: model });
  };
  dblClickHandler = () => {
    // 静默模式下，双击不更改状态，不可编辑
    const { editable } = this.props;
    if (editable) {
      const { model } = this.props;
      model.setElementState(ElementState.TEXT_EDIT);
    }
  };
  mouseDownHandle = (ev: MouseEvent) => {
    const {
      draggable,
      graphModel: {
        editConfigModel: { nodeTextDraggable },
      },
    } = this.props;
    if (draggable || nodeTextDraggable) {
      this.stepDrag.handleMouseDown(ev);
    }
  };
  render() {
    const { model: { text } } = this.props;
    if (text) {
      return (
        <g onMouseDown={this.mouseDownHandle} onDblClick={this.dblClickHandler}>
          {
            this.getShape()
          }
        </g>
      );
    }
  }
}
