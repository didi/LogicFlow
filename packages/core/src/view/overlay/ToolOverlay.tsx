import { h, Component } from 'preact';
import GraphModel from '../../model/GraphModel';
import LogicFlow from '../../LogicFlow';
import { observer } from '../..';

type IProps = {
  graphModel: GraphModel;
  tool;
};

@observer
export default class ToolOverlay extends Component<IProps> {
  componentDidUpdate(): void {
    const { tool, graphModel } = this.props;
    const ToolOverlayElement = document.querySelector(`#ToolOverlay_${graphModel.flowId}`) as HTMLElement;
    const lf: LogicFlow = tool.getInstance();
    lf.components.forEach(render => render(lf, ToolOverlayElement));
    lf.components = []; // 保证extension组件的render只执行一次
  }
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
    const { graphModel } = this.props;
    return (
      <div className="lf-tool-overlay" id={`ToolOverlay_${graphModel.flowId}`}>
        {
          this.getTools()
        }
      </div>
    );
  }
}
