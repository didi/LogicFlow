import { Component, createElement as h } from 'preact/compat'
import { concat, flattenDeep, isEmpty, isArray } from 'lodash-es'
import LogicFlow from '../../LogicFlow'
import { Label } from '../Label'
import { BaseEdgeModel, BaseNodeModel, GraphModel } from '../../model'
import { ElementType, observer } from '../..'

import LabelType = LogicFlow.LabelType
// import Extension = LogicFlow.Extension
// import LabelConfig = LogicFlow.LabelConfig

type IProps = {
  graphModel: GraphModel
  richTextEditor: any
}

type IState = {
  ref: HTMLElement
  haveEditor: boolean
  shouldUpdateEditorElement: boolean
}

type LabelCompontentConfig = {
  labelIndex: number
  editable: boolean
  editor: any
  model: BaseEdgeModel | BaseNodeModel // 元素model
  graphModel: GraphModel // 画布model
  labelInfo: LabelType // 当前标签的配置数据
  haveEditor: boolean // 当前是否挂载了富文本插件，用于新增文本时判断是否需要初始化文本的监听
}
@observer
export class LabelOverlay extends Component<IProps, IState> {
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
      richTextEditor,
      graphModel: {
        editConfigModel: { edgeTextEdit, nodeTextEdit },
        nodes,
        edges,
      },
    } = this.props
    let elements: (BaseEdgeModel | BaseNodeModel)[] = []
    this.edges = edges
    this.nodes = nodes
    elements = concat(elements, edges, nodes)
    const elementLabelType = elements.map((element) => {
      const { BaseType, text } = element
      const editable =
        BaseType === ElementType.NODE ? nodeTextEdit : edgeTextEdit
      if (isArray(text) && !isEmpty(text)) {
        const labelList = (text as LabelType[]).map((label) => {
          return {
            key: `${element.id}-${label.id}`,
            editable,
            editor: richTextEditor?.editor,
            model: element,
            graphModel: this.props.graphModel,
            labelInfo: label,
            haveEditor: this.state.haveEditor,
          }
        })
        return labelList
      }
      if (typeof text === 'object') {
        return [
          {
            key: `${element.id}-${(text as LabelType).id}`,
            editable,
            model: element,
            editor: richTextEditor?.editor,
            graphModel: this.props.graphModel,
            labelInfo: text,
            haveEditor: this.state.haveEditor,
          },
        ]
      }
      return []
    })
    return flattenDeep(elementLabelType).map((conf, index) =>
      h(Label, { ...conf, labelIndex: index } as LabelCompontentConfig),
    )
  }

  componentDidMount(): void {
    const { richTextEditor, graphModel } = this.props
    if (richTextEditor && richTextEditor.enable) {
      richTextEditor.init()
      this.setState({ haveEditor: true })
    }
    const toolDom = document.getElementById('medium-editor-toolbar-1')
    if (isEmpty(graphModel.textEditElement) && toolDom) {
      toolDom.style.display = 'none'
    }
  }

  componentDidUpdate(): void {
    const { richTextEditor } = this.props
    if (richTextEditor && richTextEditor.enable) {
      richTextEditor.addElements('.lf-label-editor')
    }
  }

  render() {
    return (
      <foreignObject class="lf-label-overlay">
        <div id="lf-label-overlay">{this.setLabels()}</div>
      </foreignObject>
    )
  }
}

export default LabelOverlay
