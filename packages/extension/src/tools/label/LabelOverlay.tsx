import LogicFlow, { Component, GraphModel, h, observer } from '@logicflow/core'
import type { IToolProps } from '@logicflow/core'
import { forEach, merge } from 'lodash-es'
import LabelPlugin from '.'
import Label from './Label'
import LabelModel from './LabelModel'
import { MediumEditor, defaultOptions, ColorPickerButton } from './mediumEditor'

import LabelConfig = LogicFlow.LabelConfig

export type LabelConfigType = string | LabelConfig | LabelConfig[]

export interface ILabelOverlayState {
  tick: number
}
// const { createUuid } = LogicFlowUtil

// DONE: 解决问题，如果 LabelOverlay 设置为 Observer，拖拽 Label 时会导致 LabelOverlay 组件重新渲染，不知道为何
// 目前解决了。流程是 拖动 -> 更新 label 的数据信息到 element model -> 重新渲染 LabelOverlay
// 这种目前存在的问题，会全量重新渲染，是否会影响性能 ❓❓❓
// 另一种解决方案是，在此组件中监听一些事件，当这些事件触发时，再重新渲染 LabelOverlay
// 讨论一下
@observer
export class LabelOverlay extends Component<IToolProps, ILabelOverlayState> {
  static toolName = 'label-edit-tool'

  lf: LogicFlow
  editor?: MediumEditor
  graphModel: GraphModel
  labelMap: Map<string, LabelModel> = new Map()

  constructor(props: IToolProps) {
    super(props)

    const { lf, graphModel } = props
    this.lf = lf
    this.graphModel = graphModel

    this.state = { tick: 0 }
  }

  componentDidMount() {
    const { graphModel } = this.props
    // 1. 直接在此处初始化 RichTextEdit 工具
    this.editor = new MediumEditor(
      '.lf-label-editor',
      merge(defaultOptions, {
        autoLink: true,
        extensions: {
          colorPicker: new ColorPickerButton(),
        },
      }),
    )

    // TODO: 2. 在此处监听一些事件，当 node、edge 数据变化时，主动触发重新渲染，保证同步更新
    // TODO: 3. 整理哪些事件应该触发 Label 的更新
    // 不需要了，将当前组件设置成 @observer 后，graphModel 更新会自动触发更新
    graphModel.eventCenter.on(
      'text:update,node:mousemove,node:resize,node:rotate,node:drag,label:drop,node:drop',
      () => {
        // this.setState({ tick: this.state.tick + 1 })
      },
    )

    graphModel.eventCenter.on(
      'node:properties-change,node:properties-delete',
      () => {
        this.setState({ tick: this.state.tick + 1 })
      },
    )
  }

  componentDidUpdate() {
    // 在组件更新后，将新增的 label 元素添加到富文本编辑器中
    if (this.editor && this.editor.elements.length > 0) {
      this.editor.addElements('.lf-label-editor')
    } else {
      // FIX: 如果初始化的数据中没有 properties._label，需要重新初始化富文本编辑器
      this.editor?.destroy()
      this.editor = new MediumEditor(
        '.lf-label-editor',
        merge(defaultOptions, {
          autoLink: true,
          extensions: {
            colorPicker: new ColorPickerButton(),
          },
        }),
      )
    }
  }

  componentWillUnmount() {
    // 组件销毁时，同时将富文本编辑器注销
    this.editor?.destroy()
  }

  /**
   * 获取当前画布上所有的 label
   * 1. 第一步，先把当前所有的 text 转换为 label 进行展示
   * 2. 数据同步，text 编辑后，同步更新 label，并重新渲染
   */
  getLabels(): h.JSX.Element[] | null {
    // 1. 通过 graphModel 获取当前画布上所有的 label 配置数据
    const {
      lf: { extension },
      graphModel,
    } = this.props

    const elements = [...graphModel.nodes, ...graphModel.edges]
    const curExtension = extension['label'] as LabelPlugin

    if (curExtension) {
      const labels: h.JSX.Element[] = [] // 保存所有的 Label 元素

      // TODO: 筛选出当前画布上，textMode 为 TextMode.LABEL 的元素(在支持元素级别的 textMode 时，需要做这个筛选)
      // REMIND: 本期先只支持全局配置，所以判断全局的 textMode 即可
      forEach(elements, (element) => {
        const elementData = element.getData()
        const labelConfig = elementData.properties?._label ?? []

        forEach(labelConfig, (config) => {
          const { labelMap } = this
          // 查找 labelModel 实例，如果是实例化过的，直接复用；如果是新的，创建实例
          // let label: LabelModel
          // if (config.id && labelMap.has(config.id)) {
          //   label = labelMap.get(config.id)!
          // } else {
          //   label = new LabelModel(config, element, graphModel)
          //   labelMap.set(label.id, label)
          // }
          const label = new LabelModel(config, element, graphModel)
          labelMap.set(label.id, label)
          labels.push(
            <Label
              key={label.id}
              label={label}
              element={element}
              graphModel={graphModel}
            />,
          )
        })
      })

      return labels
    }
    return null
  }

  render() {
    return (
      <foreignObject id="lf-label-overlay" class="lf-label-overlay">
        {this.getLabels()}
      </foreignObject>
    )
  }
}

export default LabelOverlay
