import { Component, h, LogicFlow } from '@logicflow/core'
import type { IToolProps } from '@logicflow/core'
import { map, merge } from 'lodash-es'
import Label from './Label'
import LabelModel from './LabelModel'
import {
  defaultOptions,
  ColorPickerButton,
  MediumEditor,
} from './richTextEditor'

import LabelConfig = LogicFlow.LabelConfig

export class NextLabelOverlay extends Component<IToolProps> {
  static toolName = 'nextLabel'
  editor?: MediumEditor

  constructor(props: IToolProps) {
    super(props)

    const { lf, graphModel } = props
    console.log('lf instance', lf)
    console.log('graphModel', graphModel) // 通过 graphModel 获取全部 label 数据
  }

  componentDidMount() {
    console.log('111 --->>> LabelOverlay did mount')
    // TODO: 1. 直接在此处初始化 RichTextEdit 工具
    const overlayDom = document.getElementById('lf-label-overlay')
    this.editor = new MediumEditor(
      '.lf-label-editor',
      merge(defaultOptions, {
        elementsContainer: overlayDom,
        toolbar: {
          relativeContainer: overlayDom,
        },
        extensions: {
          colorPicker: new ColorPickerButton(),
        },
      }),
    )
  }

  componentWillUnmount() {
    console.log('222 --->>> LabelOverlay will unmount')

    // 在该声明周期中将富文本编辑器销毁
    this.editor?.destroy()
  }

  /**
   * 获取当前画布上所有的 label
   * 1. 第一步，先把当前所有的 text 转换为 label 进行展示
   */
  getLabels(): h.JSX.Element[] | null {
    // 1. 通过 graphModel 获取当前画布上所有的 label 配置数据
    const { graphModel } = this.props
    const nodeLabels: h.JSX.Element[] = map(graphModel.nodes, (node) => {
      const {
        text,
        properties: { labelConfig },
      } = node

      console.log('labelConfig --->>>', labelConfig)

      const config: LabelConfig = {
        ...text,
        content: text.value,
      }

      const label = new LabelModel(config, node, graphModel)

      return <Label label={label} element={node} graphModel={graphModel} />
    })

    const edgeLabels: h.JSX.Element[] = map(graphModel.edges, (edge) => {
      const {
        text,
        properties: { labelConfig },
      } = edge

      console.log('labelConfig --->>>', labelConfig)

      const config: LabelConfig = {
        ...text,
        content: text.value,
      }

      const label = new LabelModel(config, edge, graphModel)

      return <Label label={label} element={edge} graphModel={graphModel} />
    })

    return [...nodeLabels, ...edgeLabels]
  }

  render() {
    return (
      <foreignObject id="lf-label-overlay" class="lf-label-overlay">
        {this.getLabels()}
      </foreignObject>
    )
  }
}

export default NextLabelOverlay
