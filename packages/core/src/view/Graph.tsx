import { Component, ComponentType } from 'preact/compat'
import { map, throttle } from 'lodash-es'
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
import DnD from './behavior/dnd'
import { observer } from '..'
import Tool from '../tool'
import { Options as LFOptions } from '../options'
import {
  GraphModel,
  BaseEdgeModel,
  BaseNodeModel,
  SnaplineModel,
} from '../model'
import { EventType } from '../constant'

type IGraphProps = {
  getView: (type: string) => ComponentType<any> | undefined
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
class Graph extends Component<IGraphProps> {
  handleResize = () => {
    this.props.graphModel.resize()
  }

  componentDidMount() {
    window.addEventListener('resize', throttle(this.handleResize, 200))
  }

  componentDidUpdate() {
    const data = this.props.graphModel.modelToGraphData()
    this.props.graphModel.eventCenter.emit(EventType.GRAPH_UPDATED, { data })
  }

  componentWillUnmount() {
    window.removeEventListener('resize', throttle(this.handleResize, 200))
  }

  getComponent(
    model: BaseEdgeModel | BaseNodeModel,
    graphModel: GraphModel,
    overlay = 'canvas-overlay',
  ) {
    const { getView } = this.props
    // https://juejin.cn/post/7046639346656493582 - 几种方式来声明React Component的类型
    const View = getView(model.type)
    if (View) {
      return (
        <View
          key={model.id}
          model={model}
          graphModel={graphModel}
          overlay={overlay}
        />
      )
    }
    return null
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
    const grid = options.grid && Grid.getGridOptions(options.grid)
    const { fakeNode, editConfigModel } = graphModel
    const { adjustEdge } = editConfigModel
    return (
      <div className="lf-graph" flow-id={graphModel.flowId}>
        {/* 元素层 */}
        <CanvasOverlay graphModel={graphModel} dnd={dnd}>
          <g className="lf-base">
            {map(graphModel.sortElements, (nodeModel) =>
              this.getComponent(nodeModel, graphModel),
            )}
          </g>
          {fakeNode ? this.getComponent(fakeNode, graphModel) : ''}
        </CanvasOverlay>
        {/* 虚线边框 */}
        <ModificationOverlay graphModel={graphModel}>
          <OutlineOverlay graphModel={graphModel} />
          {adjustEdge ? <BezierAdjustOverlay graphModel={graphModel} /> : ''}
          {options.snapline !== false ? (
            <SnaplineOverlay snaplineModel={snaplineModel} />
          ) : (
            ''
          )}
        </ModificationOverlay>
        {/* 工具层：插件 */}
        <ToolOverlay graphModel={graphModel} tool={tool} />
        {options.background && (
          <BackgroundOverlay background={options.background} />
        )}
        {/* 画布网格 */}
        {grid && <Grid {...grid} graphModel={graphModel} />}
      </div>
    )
  }
}

export default Graph
