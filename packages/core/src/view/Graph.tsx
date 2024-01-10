import { Component } from 'preact';
import { map } from 'lodash-es';
import GraphModel from '../model/GraphModel';
import CanvasOverlay from './overlay/CanvasOverlay';
import ToolOverlay from './overlay/ToolOverlay';
import BackgroundOverlay from './overlay/BackgroundOverlay';
import Grid from './overlay/Grid';
import Tool from '../tool';
import * as Options from '../options';
import DnD from './behavior/DnD';
import BaseEdgeModel from '../model/edge/BaseEdgeModel';
import BaseNodeModel from '../model/node/BaseNodeModel';
import SnaplineOverlay from './overlay/SnaplineOverlay';
import SnaplineModel from '../model/SnaplineModel';
import OutlineOverlay from './overlay/OutlineOverlay';
import BezierAdjustOverlay from './overlay/BezierAdjustOverlay';
import { observer } from '..';
import ModificationOverlay from './overlay/ModificationOverlay';

type IProps = {
  getView: (type: string) => typeof Component;
  tool: Tool;
  options: Options.Definition;
  dnd: DnD;
  snaplineModel: SnaplineModel;
  graphModel: GraphModel;
};
type InjectedProps = IProps & {
  graphModel: GraphModel;
};

type ContainerStyle = {
  width?: string;
  height?: string;
};

// todo: fixme type
// @ts-ignore
@observer
class Graph extends Component<IProps> {
  // get InjectedProps() {
  //   return this.props as InjectedProps;
  // }
  getComponent(model: BaseEdgeModel | BaseNodeModel, graphModel: GraphModel, overlay = 'canvas-overlay') {
    const { getView } = this.props;
    const View = getView(model.type);
    return (
      <View
        key={model.id}
        model={model}
        graphModel={graphModel}
        overlay={overlay}
      />
    );
  }
  render() {
    const {
      graphModel, tool, options, dnd, snaplineModel,
    } = this.props;
    const style: ContainerStyle = {};
    // 如果初始化的时候，不传宽高，则默认为父容器宽高。
    if (options.width) {
      style.width = `${graphModel.width}px`;
    }
    if (options.height) {
      style.height = `${graphModel.height}px`;
    }
    const grid = options.grid as Object;
    const { fakerNode, editConfigModel } = graphModel;
    const { adjustEdge } = editConfigModel;

    return (
      <div
        className="lf-graph"
        flow-id={graphModel.flowId}
        style={style}
      >
        <CanvasOverlay
          graphModel={graphModel}
          dnd={dnd}
        >
          <g className="lf-base">
            {
              map(graphModel.sortElements, (nodeModel) => (
                this.getComponent(nodeModel, graphModel)
              ))
            }
          </g>
          {
            fakerNode ? this.getComponent(fakerNode, graphModel) : ''
          }
        </CanvasOverlay>
        <ModificationOverlay graphModel={graphModel}>
          <OutlineOverlay graphModel={graphModel} />
          {adjustEdge ? <BezierAdjustOverlay graphModel={graphModel} /> : ''}
          {options.snapline !== false ? <SnaplineOverlay snaplineModel={snaplineModel} /> : ''}
        </ModificationOverlay>
        <ToolOverlay graphModel={graphModel} tool={tool} />
        {options.background && <BackgroundOverlay background={options.background} />}
        {options.grid && <Grid {...grid} graphModel={graphModel} />}
      </div>
    );
  }
}

export default Graph;
