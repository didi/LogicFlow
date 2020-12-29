import { h, Component } from 'preact';
import GraphModel from '../../model/GraphModel';
import { StepDrag } from '../../util/drag';
import Text from '../basic-shape/Text';
import { IBaseModel } from '../../model/BaseModel';
import { ElementState } from '../../constant/constant';
import { EdgeTextStyle } from '../../type';

type IProps = {
  model: IBaseModel;
  graphModel: GraphModel;
  style: EdgeTextStyle;
  draggable: boolean;
  editable: boolean;
};

export default class BaseText extends Component<IProps> {
  dragHandler: (ev: MouseEvent) => void;
  sumDeltaX = 0;
  sumDeltaY = 0;
  stepDrag: StepDrag;
  constructor(config) {
    super();
    const { model } = config;
    this.stepDrag = new StepDrag({
      onDraging: this.onDraging,
      step: 1,
      model,
    });
  }
  getShape() {
    const { model: { text }, style } = this.props;
    const { value, x, y } = text;
    const attr = {
      x,
      y,
      className: 'lf-element-text',
      value,
    };
    return (
      <Text {...attr} {...style} />
    );
  }
  onDraging = ({ deltaX, deltaY }) => {
    const {
      model,
      graphModel: {
        transformMatrix,
      },
    } = this.props;
    const [curDeltaX, curDeltaY] = transformMatrix.fixDeltaXY(deltaX, deltaY);
    model.moveText(curDeltaX, curDeltaY);
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
        editConfig: { nodeTextDraggable },
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
