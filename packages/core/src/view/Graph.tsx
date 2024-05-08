import { Component } from 'preact'
import { map } from 'lodash-es'
import {
  CanvasOverlay,
  ToolOverlay,
  BackgroundOverlay,
  Grid,
  SnaplineOverlay,
  OutlineOverlay,
  BezierAdjustOverlay,
  ModificationOverlay,
} from './overlay'
import DnD from './behavior/DnD'
import { observer } from '..'
import { Options as LFOptions } from '../options'
import Tool from '../tool/tool'
import {
  GraphModel,
  BaseEdgeModel,
  BaseNodeModel,
  SnaplineModel,
} from '../model'

type IProps = {
  getView: (type: string) => Component | null
  tool: Tool
  options: LFOptions.Definition
  dnd: DnD
  snaplineModel?: SnaplineModel
  graphModel: GraphModel
}

type ContainerStyle = {
  width?: string
  height?: string
}

@observer
class Graph extends Component<IProps> {
  getComponent(
    model: BaseEdgeModel | BaseNodeModel,
    graphModel: GraphModel,
    overlay = 'canvas-overlay',
  ) {
    const { getView } = this.props
    const View: any = getView(model.type)
    return (
      <View
        key={model.id}
        model={model}
        graphModel={graphModel}
        overlay={overlay}
      />
    )
  }

  render() {
    const { graphModel, tool, options, dnd, snaplineModel } = this.props
    const style: ContainerStyle = {}
    // 如果初始化的时候，不传宽高，则默认为父容器宽高。
    if (options.width) {
      style.width = `${graphModel.width}px`
    }
    if (options.height) {
      style.height = `${graphModel.height}px`
    }
    const grid = options.grid as any // TODO: fix type
    const { fakerNode, editConfigModel } = graphModel
    const { adjustEdge } = editConfigModel

    return (
      <div className="lf-graph" flow-id={graphModel.flowId} style={style}>
        <CanvasOverlay graphModel={graphModel} dnd={dnd}>
          <g className="lf-base">
            {map(graphModel.sortElements, (nodeModel) =>
              this.getComponent(nodeModel, graphModel),
            )}
          </g>
          {fakerNode ? this.getComponent(fakerNode, graphModel) : ''}
        </CanvasOverlay>
        <ModificationOverlay graphModel={graphModel}>
          <OutlineOverlay graphModel={graphModel} />
          {adjustEdge ? <BezierAdjustOverlay graphModel={graphModel} /> : ''}
          {options.snapline !== false ? (
            <SnaplineOverlay snaplineModel={snaplineModel} />
          ) : (
            ''
          )}
        </ModificationOverlay>
        <ToolOverlay graphModel={graphModel} tool={tool} />
        {options.background && (
          <BackgroundOverlay background={options.background} />
        )}
        {options.grid && <Grid {...grid} graphModel={graphModel} />}
      </div>
    )
  }
}

export default Graph
