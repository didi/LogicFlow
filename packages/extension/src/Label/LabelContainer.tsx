import { Component, createElement as h } from 'preact/compat'
import { concat, flattenDeep, isEmpty, isArray } from 'lodash-es'
import MediumEditor from 'medium-editor'
import LogicFlow, {
  BaseEdgeModel,
  BaseNodeModel,
  GraphModel,
  observer,
  ElementType,
} from '@logicflow/core'
import { Label } from './LabelElement'
import RichTextEditor from '../materials/rich-text-editor'

import LabelType = LogicFlow.LabelType
import Extension = LogicFlow.Extension
// import LabelConfig = LogicFlow.LabelConfig

type IProps = {
  graphModel: GraphModel
  extension: Extension
}

type IState = {
  ref: HTMLElement
  haveEditor: boolean
  shouldUpdateEditorElement: boolean
}

type LabelCompontentConfig = {
  labelIndex: number
  editable: boolean
  editor: MediumEditor
  model: BaseEdgeModel | BaseNodeModel // 元素model
  graphModel: GraphModel // 画布model
  labelInfo: LabelType // 当前标签的配置数据
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
    if (!this.props.extension || !this.props.graphModel) return
    const {
      extension,
      graphModel: {
        editConfigModel: { edgeTextEdit, nodeTextEdit },
        nodes = [],
        edges = [],
      },
    } = this.props
    let elements: (BaseEdgeModel | BaseNodeModel)[] = []
    const richTextEditor = (extension as any)?.richTextEditor
    this.edges = edges
    this.nodes = nodes
    elements = concat(elements, edges, nodes)

    const elementLabelType = elements.map((element) => {
      const { BaseType, label } = element
      const editable =
        BaseType === ElementType.NODE ? nodeTextEdit : edgeTextEdit
      if (isArray(label) && !isEmpty(label)) {
        const labelList = label.map((label) => {
          return {
            key: `${element.id}-${label.id}`,
            editable,
            editor: (richTextEditor as RichTextEditor)?.editor,
            model: element,
            graphModel: this.props.graphModel,
            labelInfo: label,
            haveEditor: this.state.haveEditor,
          }
        })
        return labelList
      }
      return []
    })

    if (!elementLabelType) return null
    return flattenDeep(elementLabelType).map((conf, index) =>
      h(Label, { ...conf, labelIndex: index } as LabelCompontentConfig),
    )
  }

  componentDidMount(): void {
    const { extension, graphModel } = this.props
    if (
      (extension as any).richTextEditor &&
      ((extension as any).richTextEditor as RichTextEditor).enable
    ) {
      ;((extension as any).richTextEditor as RichTextEditor).init()
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
