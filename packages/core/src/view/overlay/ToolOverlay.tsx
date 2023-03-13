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
  // 在react严格模式下，useEffect会执行两次，但是在LogicFlow内部，则只会触发一次componentDidMount和componentDidUpdate。
  // 其中第一次componentDidMount对应的graphModel为被丢弃的graphModel, 所以不应该生效。
  // 在非react环境下，只会触发一次componentDidMount，不会触发componentDidUpdate。
  // 所以这里采用componentDidUpdate和componentDidMount都去触发插件的render方法。
  componentDidMount(): void {
    this.triggerToolRender();
  }
  componentDidUpdate(): void {
    this.triggerToolRender();
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
  triggerToolRender() {
    const { tool, graphModel } = this.props;
    const ToolOverlayElement = document.querySelector(`#ToolOverlay_${graphModel.flowId}`) as HTMLElement;
    const lf: LogicFlow = tool.getInstance();
    lf.components.forEach(render => render(lf, ToolOverlayElement));
    lf.components = []; // 保证extension组件的render只执行一次
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
