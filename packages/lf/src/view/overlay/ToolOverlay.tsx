import { h, Component } from 'preact';
import { observer } from 'mobx-react';
// import { IBaseModel } from '../../model/BaseModel';
import GraphModel from '../../model/GraphModel';

type IProps = {
  graphModel: GraphModel;
  tool;
};

@observer
export default class ToolOverlay extends Component<IProps> {
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
      <div className="lf-tool-overlay">
        {
          this.getTools()
        }
      </div>
    );
  }
}
