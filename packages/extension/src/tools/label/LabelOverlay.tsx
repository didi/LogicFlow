import { Component, createElement as h } from 'preact/compat'
import { isEmpty } from 'lodash-es'
import MediumEditor from 'medium-editor'
import {
  BaseEdgeModel,
  BaseNodeModel,
  GraphModel,
  observer,
} from '@logicflow/core'
import { Label } from './LabelElement'
import LabelModel from './LabelModel'

type IProps = {
  graphModel: GraphModel
  richTextEditor: any
  useRichText: boolean
  options: any
  labels: LabelModel[]
}

type IState = {
  ref: HTMLElement
  haveEditor: boolean
  shouldUpdateEditorElement: boolean
}

type LabelCompontentConfig = {
  editable: boolean
  editor: MediumEditor
  model: BaseEdgeModel | BaseNodeModel // 元素model
  graphModel: GraphModel // 画布model
  labelModel: LabelModel // 当前标签的配置数据
  haveEditor: boolean // 当前是否挂载了富文本插件，用于新增文本时判断是否需要初始化文本的监听
}
@observer
class LabelContainer extends Component<IProps, IState> {
  edges: BaseEdgeModel[] = []
  nodes: BaseNodeModel[] = []
  // 容器相关
  // editor: MediumEditor | null = null
  setLabels() {
    // 遍历画布的元素（即节点和边），取有文本配置的元素的model
    // 创建一个labelInfo并根据上文定义的类型，从model中取数据进行初始化
    // 创建一个Label组件，入参从labelInfo中取，暂存在fragment中，最后塞到foreignObject上
    // const labelDomContainer = new DocumentFragment()
    const {
      graphModel,
      labels,
      richTextEditor,
      options: { customLabel },
    } = this.props

    const labelConfigs = labels.map((label) => {
      const { id, editable, relateId } = label
      const element = graphModel.getElement(relateId)
      return {
        key: id,
        editable: Boolean(editable),
        editor: richTextEditor,
        model: element,
        graphModel: this.props.graphModel,
        labelModel: label,
        haveEditor: this.state.haveEditor,
      }
    })

    if (!labelConfigs) return null
    return labelConfigs.map((conf) =>
      isEmpty(customLabel)
        ? h(Label, conf as LabelCompontentConfig)
        : h(customLabel, conf as LabelCompontentConfig),
    )
  }

  componentDidMount(): void {
    const { useRichText, graphModel } = this.props
    if (useRichText) {
      graphModel.eventCenter.emit('rich-text:init', {})
      this.setState({ haveEditor: true })
    }
    const toolDom = document.getElementById('medium-editor-toolbar-1')
    if (isEmpty(graphModel.textEditElement) && toolDom) {
      toolDom.style.display = 'none'
    }
  }

  render() {
    return (
      <foreignObject id="lf-label-overlay" class="lf-label-overlay">
        {this.setLabels()}
      </foreignObject>
    )
  }
}

export default LabelContainer
