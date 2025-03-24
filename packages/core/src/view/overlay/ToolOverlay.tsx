import { createElement as h, Component } from 'preact/compat'
import { CanvasOverlay, OutlineOverlay } from '.'
import { observer } from '../..'
import LogicFlow from '../../LogicFlow'
import { GraphModel } from '../../model'
import { Tool } from '../../tool'

type IProps = {
  graphModel: GraphModel
  tool: Tool
  getCanvasOverlay: () => CanvasOverlay | null
}

@observer
export class ToolOverlay extends Component<IProps> {
  // 在react严格模式下，useEffect会执行两次，但是在LogicFlow内部，则只会触发一次componentDidMount和componentDidUpdate。
  // 其中第一次componentDidMount对应的graphModel为被丢弃的graphModel, 所以不应该生效。
  // 在非react环境下，只会触发一次componentDidMount，不会触发componentDidUpdate。
  // 所以这里采用componentDidUpdate和componentDidMount都去触发插件的render方法。
  componentDidMount(): void {
    this.triggerToolRender()
  }

  componentDidUpdate(): void {
    this.triggerToolRender()
  }

  /**
   * 外部传入的一般是HTMLElement
   */
  getTools() {
    const { tool, graphModel } = this.props
    const { textEditElement } = graphModel
    const tools = tool.getTools()
    const components = tools.map((t) =>
      h(t, {
        textEditElement,
        graphModel,
        lf: tool.instance,
      }),
    )
    tool.components = components
    return components
  }

  triggerToolRender() {
    const { tool, graphModel } = this.props
    const ToolOverlayElement = document.querySelector(
      `#ToolOverlay_${graphModel.flowId}`,
    ) as HTMLElement
    const lf: LogicFlow = tool.getInstance()
    lf.components.forEach((render) => render(lf, ToolOverlayElement))
    lf.components = [] // 保证extension组件的render只执行一次
  }

  zoomHandler = (e: WheelEvent) => {
    // TODO 是否应该使用 dispatchEvent 来触发事件
    this.props.getCanvasOverlay()?.zoomHandler(e)
  }

  render() {
    const { graphModel } = this.props
    return (
      <div
        className="lf-tool-overlay"
        id={`ToolOverlay_${graphModel.flowId}`}
        /*
         * 默认情况下该容器设置了 pointer-events: none，不会触发这些事件
         * 只会在容器取消 pointer-events: none 后触发，用于缩放、滚动画布等操作
         * 目前只在 selection-select 插件中使用。为了能在元素内部进行框选，在开启选区后会关闭事件透传。需要手动触发事件
         */
        onWheel={this.zoomHandler}
      >
        {this.getTools()}
      </div>
    )
  }
}

export default OutlineOverlay
