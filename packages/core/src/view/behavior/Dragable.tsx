import { observer, inject } from 'mobx-react';
import { h, Component } from 'preact';
import { StepDrag } from '../../util/drag';
import BaseNodeModel from '../../model/node/BaseNodeModel';
import EventEmitter from '../../event/eventEmitter';
import GraphModel from '../../model/GraphModel';

type IProps = {
  graphModel?: GraphModel,
  model: BaseNodeModel,
  eventCenter?: EventEmitter,
  type: string,
};
type Istate = {
  isDraging: boolean,
};

@inject('graphModel')
@observer
class Dragable extends Component<IProps, Istate> {
  // 当移动距离过小时，先把移动距离缓存起来，直到足够大时，再发生移动。
  sumDeltaX = 0;
  sumDeltaY = 0;
  stepDrag: StepDrag;
  dragHandler: (ev: MouseEvent) => void;
  constructor(props: IProps) {
    super();
    const {
      graphModel: { gridSize }, eventCenter, type, model,
    } = props;
    this.stepDrag = new StepDrag({
      onDragStart: this.onDragStart,
      onDraging: this.onDraging,
      onDragEnd: this.onDragEnd,
      step: gridSize,
      eventType: type,
      eventCenter,
      model,
    });
    this.state = {
      isDraging: false,
    };
  }
  onDragStart = () => {};

  onDraging = ({ deltaX, deltaY }) => {
    const { model, graphModel } = this.props;
    this.setState({
      isDraging: true,
    });
    const { transformMatrix } = graphModel;

    const [curDeltaX, curDeltaY] = transformMatrix.fixDeltaXY(deltaX, deltaY);
    if (model.modelType.indexOf('node') > -1) {
      graphModel.moveNode(model.id, curDeltaX, curDeltaY);
    }
  };
  onDragEnd = () => {
    this.setState({
      isDraging: false,
    });
  };
  render() {
    const { children, graphModel, model: { isHitable } } = this.props;
    const { isDraging } = this.state;
    const { editConfig, gridSize, transformMatrix: { SCALE_X } } = graphModel;
    if (!editConfig.adjustNodePosition || !isHitable) {
      this.dragHandler = () => {};
    } else {
      this.stepDrag.setStep(gridSize * SCALE_X);
      this.dragHandler = this.stepDrag.handleMouseDown;
    }
    return (
      <g
        className={isDraging ? 'lf-dragging' : 'lf-drag-able'}
        onMouseDown={this.dragHandler}
      >
        {children}
      </g>
    );
  }
}

export default Dragable;
