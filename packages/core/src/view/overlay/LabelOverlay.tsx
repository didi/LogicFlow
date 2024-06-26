import { Component, createElement as h } from 'preact/compat'
import { concat, flattenDeep, isEmpty, isArray } from 'lodash-es'
import LogicFlow from '../../LogicFlow'
import { Label } from '../Label'
import { BaseEdgeModel, BaseNodeModel, GraphModel } from '../../model'
import { ElementType, observer } from '../..'

import LabelType = LogicFlow.LabelType
// import LabelConfig = LogicFlow.LabelConfig

type IProps = {
  graphModel: GraphModel
}

type IState = {
  ref: HTMLElement
  labelStates: LabelType[]
}

type LabelCompontentConfig = {
  labelIndex: number
  editable: boolean
  model: BaseEdgeModel | BaseNodeModel // 元素model
  graphModel: GraphModel // 画布model
  labelState: LabelType // 当前标签的配置数据
}
@observer
export class LabelOverlay extends Component<IProps, IState> {
  // 容器相关
  // editor: MediumEditor | null = null
  setLabels() {
    // 遍历画布的元素（即节点和边），取有文本配置的元素的model
    // 创建一个labelState并根据上文定义的类型，从model中取数据进行初始化，放到state.labelStates里
    // 创建一个Label组件，入参从labelState中取，暂存在fragment中，最后塞到foreignObject上
    // const labelDomContainer = new DocumentFragment()
    const {
      graphModel: {
        editConfigModel: { edgeTextEdit, nodeTextEdit },
        nodes,
        edges,
      },
    } = this.props
    let elements: (BaseEdgeModel | BaseNodeModel)[] = []
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
            model: element,
            graphModel: this.props.graphModel,
            labelState: label,
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
            graphModel: this.props.graphModel,
            labelState: text,
          },
        ]
      }
      return []
    })
    return flattenDeep(elementLabelType).map((conf, index) =>
      h(Label, { ...conf, labelIndex: index } as LabelCompontentConfig),
    )
  }

  render() {
    return (
      <foreignObject class="lf-label-overlay">{this.setLabels()}</foreignObject>
    )
  }
}

export default LabelOverlay
