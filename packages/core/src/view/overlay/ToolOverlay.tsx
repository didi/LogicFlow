import { h, Component } from 'preact';
import { observer } from '../../util/stateUtil';
import GraphModel from '../../model/GraphModel';
import LogicFlow from '../../LogicFlow';

type IProps = {
  graphModel: GraphModel;
  tool;
};

@observer
export default class ToolOverlay extends Component<IProps> {
  setToolOverlayRef = (element) => {
    const { tool } = this.props;
    const lf: LogicFlow = tool.getInstance();
    lf.components.forEach(render => render(lf, element));
    lf.components = []; // 保证extension组件的render只执行一次
  };
  /**
   * 外部传入的一般是HTMLElement
   */
  getTools() {
    const { tool, graphModel } = this.props;
    const tools = tool.getTools();
    const components = tools.map(item => h(item, {
      graphModel,
      logicFlow: tool.instance,
    }));
    tool.components = components;
    return components;
  }
  render() {
    return (
      <div className="lf-tool-overlay" ref={this.setToolOverlayRef}>
        {
          this.getTools()
        }
      </div>
    );
  }
}
