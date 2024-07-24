import LogicFlow, { Component, h, observer } from '@logicflow/core'
import type { IToolProps } from '@logicflow/core'
import { forEach, isArray, isObject, map, merge } from 'lodash-es'
import NextLabelPlugin, { INextLabelOptions } from '.'
import Label from './Label'
import LabelModel from './LabelModel'
import {
  MediumEditor,
  defaultOptions,
  ColorPickerButton,
} from './richTextEditor'

import LabelConfig = LogicFlow.LabelConfig
import GraphElement = LogicFlow.GraphElement
// import LabelOption = LogicFlow.LabelOption

let idx = 1

export type LabelConfigType = string | LabelConfig | LabelConfig[]

export interface INextLabelOverlayState {
  tick: number
}
// const { createUuid } = LogicFlowUtil

// TODO: 解决问题，如果 NextLabelOverlay 设置为 Observer，拖拽 Label 时会导致 NextLabelOverlay 组件重新渲染，不知道为何
// 目前解决了。流程是 拖动 -> 更新 label 的数据信息到 element model -> 重新渲染 LabelOverlay
// 这种目前存在的问题，会全量重新渲染，是否会影响性能 ❓❓❓
// 另一种解决方案是，在此组件中监听一些事件，当这些事件触发时，再重新渲染 LabelOverlay
// 讨论一下
@observer
export class NextLabelOverlay extends Component<
  IToolProps,
  INextLabelOverlayState
> {
  static toolName = 'nextLabel'
  editor?: MediumEditor
  labelMap: Map<string, LabelModel> = new Map()

  constructor(props: IToolProps) {
    super(props)

    const { lf, graphModel } = props
    console.log('lf instance', lf)
    console.log('graphModel', graphModel) // 通过 graphModel 获取全部 label 数据

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
  }

  componentDidUpdate() {
    // 在组件更新后，将新增的 label 元素添加到富文本编辑器中
    if (this.editor) {
      this.editor.addElements('.lf-label-editor')
    }
  }

  componentWillUnmount() {
    // 组件销毁时，同时将富文本编辑器注销
    this.editor?.destroy()
  }

  /**
   * 格式化元素的 Label 配置，后续初始化 Label 用统一的数据格式
   * 主要是将 _label 类型 string | LabelConfig | LabelConfig[] 统一转换为 LabelConfig[]
   * @param element 当前元素 model
   * @param isMultiple 是否支持多个 Label
   * @param maxCount 当 isMultiple 为 true 时，设置的最大 Label 数量
   * @return LabelConfig[]
   */
  formatConfig(
    element: GraphElement,
    isMultiple: boolean,
    maxCount: number,
  ): LabelConfig[] {
    const {
      editConfigModel: {
        nodeTextEdit,
        edgeTextEdit,
        nodeTextDraggable,
        edgeTextDraggable,
      },
    } = this.props.graphModel
    const {
      text,
      properties: { _label, _labelOption = {} },
    } = element

    // 当前元素的 Label 相关配置
    const curLabelConfig = _label as LabelConfigType
    const {
      isMultiple: curIsMultiple,
      maxCount: curMaxCount,
    }: INextLabelOptions = _labelOption as INextLabelOptions

    let formatConfig: LabelConfig[] = [] // 保存格式化后的 LabelConfig
    // 对 3 种可能得数据类型进行处理
    if (isArray(curLabelConfig)) {
      // 1. 数组的话就是 LabelConfig[] 类型
      // 判断是否开启 isMultiple, 如果开启了，判断是否超过最大数量。超出就截取
      const size = curMaxCount ?? maxCount // 优先级，当设置 multiple 时，元素的 maxCount 优先级高于插件的 maxCount
      if (isMultiple && curIsMultiple) {
        if (curLabelConfig.length > size) {
          formatConfig = curLabelConfig.slice(0, size - 1)
        } else {
          formatConfig = curLabelConfig
        }
      } else {
        formatConfig = [curLabelConfig[0]]
      }
    } else if (isObject(curLabelConfig)) {
      // 2. 对象的话就是 LabelConfig 类型
      formatConfig = [curLabelConfig]
    } else if (typeof curLabelConfig === 'string' || !curLabelConfig) {
      // 3. 字符串或者为空的话就是 string 类型，基于 text 的数据合成 LabelConfig 信息（主要复用 text 的 x,y 信息）
      const config: LabelConfig = {
        ...text,
        content: curLabelConfig || text.value,
        // draggable: element.BaseType === 'edge' ? edgeTextDraggable : nodeTextDraggable,
      }
      formatConfig = [config]
    }

    // TODO: 再根据一些全局配置，比如是否支持垂直显示等，对 LabelConfig 进行二次处理
    // 优先级：全局配置 > 元素配置。比如全局设置 isMultiple 为 true 时，才可以使用 局部的 isMultiple 设置才生效
    // 当全局 isMultiple 为 false 时，局部的 isMultiple 不生效
    return map(formatConfig, (config) => {
      if (!config.id) {
        // config.id = createUuid()
        config.id = `${idx++}`
      }

      const { editable, draggable, vertical } = config
      if (element.BaseType === 'node') {
        return {
          ...config,
          vertical: vertical ?? false,
          editable: nodeTextEdit && editable,
          draggable: nodeTextDraggable && draggable,
        }
      } else if (element.BaseType === 'edge') {
        return {
          ...config,
          vertical: vertical ?? false,
          editable: edgeTextEdit && editable,
          draggable: edgeTextDraggable && draggable,
        }
      }
      return config
    })
    // 它会触发重新渲染，所以这里不能 setProperty
    // element.setProperty('_label', elementLabelConfig)
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
    const curExtension = extension['NextLabel'] as NextLabelPlugin

    if (curExtension) {
      // 当前插件的配置，一个元素是否允许配置多个 Label
      // const { isMultiple } = curExtension as NextLabelPlugin
      const labels: h.JSX.Element[] = [] // 保存所有的 Label 元素

      // TODO: 1. 筛选出当前画布上，textMode 为 TextMode.LABEL 的元素(在支持元素级别的 textMode 时，需要做这个筛选)
      // REMIND: 本期先只支持全局配置，所以判断全局的 textMode 即可
      forEach(elements, (element) => {
        console.log('element-data --->>>', element.getData())
        const elementData = element.getData()
        const labelConfig = elementData.properties?._label ?? []
        // DONE: 2. 在此处做数据的转换
        // 输入：NodeConfig.properties._label: string | LabelConfig | LabelConfig[]
        // 输出：NodeData.properties._label: LabelData | LabelData[]
        // 是否需要根据 isMultiple 控制是否返回数组或对象 or 直接全部返回数组 ❓❓❓ -> 目前直接全部返回数组

        // const formatLabelConfig = this.formatConfig(element, isMultiple, curExtension.maxCount)
        // FIX: BUG Here: 格式化后的 labelConfig 没有同步到 element 上，导致每次重新渲染时，都会重新格式化，且重新生成 id
        // 但如果在此处通过 setProperty 更新元素的 _label 时，又会导致死循环
        // element.setProperty('_label', formatLabelConfig)

        forEach(labelConfig, (config) => {
          const { labelMap } = this
          // DONE: 查找，如果是实例化过的，直接复用；如果是新的，创建实例
          let label: LabelModel
          if (config.id && labelMap.has(config.id)) {
            label = labelMap.get(config.id)!
          } else {
            label = new LabelModel(config, element, graphModel)
          }
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

export default NextLabelOverlay
