import { h, Component } from 'preact';
import { observer } from 'mobx-react';
import LogicFlow from '../LogicFlow';
import GraphModel from '../model/GraphModel';
import { InnerEventType } from '../constant/constant';

type IProps = {
  graphModel: GraphModel;
  logicFlow: LogicFlow;
};

interface IState {
  undoAble: boolean,
  redoAble: boolean,
}

@observer
export default class Control extends Component<IProps, IState> {
  constructor(props) {
    super();
    const { logicFlow: { history } } = props;
    this.state = {
      undoAble: history.undos.length > 1,
      redoAble: history.redos.length > 0,
    };
    history.on(InnerEventType.HISTORY_CHANGE, () => {
      this.setState({
        undoAble: history.undos.length > 1,
        redoAble: history.redos.length > 0,
      });
    });
  }
  zoomOut = () => {
    const { logicFlow } = this.props;
    logicFlow.zoom(false);
  };
  zoomIn = () => {
    const { logicFlow } = this.props;
    logicFlow.zoom(true);
  };
  resetZoom = () => {
    const { logicFlow } = this.props;
    logicFlow.resetZoom();
  };
  undo = () => {
    const { logicFlow } = this.props;
    logicFlow.undo();
  };
  redo = () => {
    const { logicFlow } = this.props;
    logicFlow.redo();
  };
  render() {
    const { undoAble, redoAble } = this.state;
    return (
      <div className="lf-control">
        <div className="lf-control-item" onClick={this.zoomOut}>
          <i className="lf-control-zoomOut" />
          <span className="lf-control-text" title="缩小流程图">缩小</span>
        </div>
        <div className="lf-control-item" onClick={this.zoomIn}>
          <i className="lf-control-zoomIn" />
          <span className="lf-control-text" title="放大流程图">放大</span>
        </div>
        <div className="lf-control-item" onClick={this.resetZoom}>
          <i className="lf-control-fit" />
          <span className="lf-control-text" title="恢复流程原有尺寸">适应</span>
        </div>
        <div onClick={this.undo} className={undoAble ? 'lf-control-item' : 'lf-control-item disabled'}>
          <i className="lf-control-undo" />
          <span className="lf-control-text" title="回到上一步">上一步</span>
        </div>
        <div onClick={this.redo} className={redoAble ? 'lf-control-item' : 'lf-control-item disabled'}>
          <i className="lf-control-redo" />
          <span className="lf-control-text" title="移到下一步">下一步</span>
        </div>
      </div>
    );
  }
}
