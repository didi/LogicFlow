import LogicFlow, { createUuid, GraphModel, TextMode } from '@logicflow/core'
import {
  cloneDeep,
  forEach,
  isArray,
  isEmpty,
  isEqual,
  isObject,
  map,
} from 'lodash-es'
import LabelOverlay, { LabelConfigType } from './LabelOverlay'
import {
  BBoxInfo,
  calcPointAfterResize,
  rotatePointAroundCenter,
} from './utils'

import Position = LogicFlow.Position
import NodeData = LogicFlow.NodeData
import EdgeData = LogicFlow.EdgeData
import Extension = LogicFlow.Extension
import LabelConfig = LogicFlow.LabelConfig
import GraphElement = LogicFlow.GraphElement

// 类型定义，如果 isMultiple 为 true 的话，maxCount 为数值且大于 1
export type ILabelOptions = {
  isMultiple?: boolean
  maxCount?: number
  labelWidth?: number
  textOverflowMode?: 'ellipsis' | 'wrap' | 'clip' | 'nowrap' | 'default'
}

export class Label implements Extension {
  static pluginName = 'label'

  lf: LogicFlow
  options: ILabelOptions

  textOverflowMode: 'ellipsis' | 'wrap' | 'clip' | 'nowrap' | 'default'
  isMultiple: boolean
  labelWidth?: number
  maxCount: number // 默认值给无限大数值

  labelInitPositionMap: Map<string, Position> = new Map()

  constructor({ lf, options }: { lf: LogicFlow; options: ILabelOptions }) {
    this.lf = lf
    // DONE: 根据 options 初始化一些插件配置，比如是否支持多个 label 等，生效在所有 label 中
    this.options = options ?? {}

    this.textOverflowMode = options.textOverflowMode ?? 'default'
    this.isMultiple = options.isMultiple ?? true
    this.labelWidth = options.labelWidth
    this.maxCount = options.maxCount ?? Infinity

    // DONE: 1. 启用插件时，将当前画布的 textMode 更新为 TextMode.LABEL。
    // 如果将其又重新设置为 TextModel.TEXT，则需要 disable 掉 Label 工具，enable TextEditTool
    lf.graphModel.editConfigModel.updateTextMode(TextMode.LABEL)

    // TODO: 2. 做一些插件需要的事件监听
    this.addEventListeners()

    // TODO: 3. 自定义快捷键，比如 delete，选中 label 时，移除 label
    this.rewriteShortcut()

    // 插件中注册 LabelOverlay 工具，用于 label 的编辑
    lf.tool.registerTool(LabelOverlay.toolName, LabelOverlay)
    // LabelOverlay 和 TextEditTool 互斥，所以将它 disable 掉
    lf.tool.disableTool('text-edit-tool')
  }

  /**
   * 格式化元素的 Label 配置，后续初始化 Label 用统一的数据格式
   * 主要是将 _label 类型 string | LabelConfig | LabelConfig[] 统一转换为 LabelConfig[]
   * @param graphModel 当前图的 model
   * @param element 当前元素 model
   * @return LabelConfig[]
   */
  private formatConfig(
    graphModel: GraphModel,
    element: GraphElement,
  ): LabelConfig[] {
    const {
      editConfigModel: {
        nodeTextEdit,
        edgeTextEdit,
        nodeTextDraggable,
        edgeTextDraggable,
      },
    } = graphModel
    const { textOverflowMode, isMultiple, maxCount, labelWidth } = this
    const {
      text,
      zIndex,
      properties: { _label, _labelOption = {} },
    } = element

    // 当前元素的 Label 相关配置
    const curLabelConfig = _label as LabelConfigType
    const { isMultiple: curIsMultiple, maxCount: curMaxCount }: ILabelOptions =
      _labelOption as ILabelOptions

    // REMIND: 对 3 种可能得数据类型进行处理
    let formatConfig: LabelConfig[] = [] // 保存格式化后的 LabelConfig
    if (isArray(curLabelConfig)) {
      // 1. 数组的话就是 LabelConfig[] 类型
      // 判断是否开启 isMultiple, 如果开启了，判断是否超过最大数量。超出就截取
      const size = curMaxCount ?? maxCount // 优先级，当设置 multiple 时，元素的 maxCount 优先级高于插件的 maxCount
      if (isMultiple && curIsMultiple) {
        if (curLabelConfig.length > size) {
          formatConfig = curLabelConfig.slice(0, size)
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
        content: curLabelConfig || text?.value,
        draggable:
          element.BaseType === 'edge' ? edgeTextDraggable : nodeTextDraggable,
      }
      formatConfig = config.value ? [config] : []
    }

    // TODO: 针对 Edge，在 edge 更新时 重新计算 Label 的位置
    if (element.BaseType === 'edge') {
      // 判断当前 label，是否在 edge 的路径上，如果不在，就重新计算位置
      formatConfig = map(formatConfig, (config) => {
        return config
      })
    }

    // DONE: 再根据一些全局配置，比如是否支持垂直显示等，对 LabelConfig 进行二次处理
    // 优先级：全局配置 > 元素配置。比如全局设置 isMultiple 为 true 时，才可以使用 局部的 isMultiple 设置才生效
    // 当全局 isMultiple 为 false 时，局部的 isMultiple 不生效
    return map(formatConfig, (config) => {
      if (!config.id) {
        config.id = createUuid()
      }

      const {
        value,
        content,
        vertical,
        editable,
        draggable,
        textOverflowMode: labelTextOverflowMode,
      } = config

      const textEdit = element.BaseType === 'node' ? nodeTextEdit : edgeTextEdit
      const textDraggable =
        element.BaseType === 'node' ? nodeTextDraggable : edgeTextDraggable

      return {
        ...config,
        zIndex,
        labelWidth,
        content: content ?? value,
        vertical: vertical ?? false,
        editable: textEdit && editable,
        draggable: textDraggable && draggable,
        textOverflowMode: labelTextOverflowMode ?? textOverflowMode,
      }
    })
  }

  /**
   * 根据初始化的数据，格式化 Label 的数据格式后，统一更新到元素的 properties._label 中，保证后续的渲染以这个数据格式进行
   * @param graphModel
   */
  private setupLabels(graphModel: GraphModel) {
    // const elements = [...graphModel.nodes, ...graphModel.edges]
    const elements = graphModel.sortElements

    // TODO: 1. 筛选出当前画布上，textMode 为 TextMode.LABEL 的元素(在支持元素级别的 textMode 时，需要做这个筛选)
    // REMIND: 本期先只支持全局配置，所以判断全局的 textMode 即可
    forEach(elements, (element) => {
      // DONE: 2. 在此处做数据的转换
      // 输入：NodeConfig.properties._label: string | LabelConfig | LabelConfig[]
      // 输出：NodeData.properties._label: LabelData | LabelData[]
      // 是否需要根据 isMultiple 控制是否返回数组或对象 or 直接全部返回数组 ❓❓❓ -> 目前直接全部返回数组

      this.rewriteInnerMethods(element)

      const formatLabelConfig = this.formatConfig(graphModel, element)
      // FIX: BUG Here: 格式化后的 labelConfig 没有同步到 element 上，导致每次重新渲染时，都会重新格式化，且重新生成 id
      // 但如果在此处通过 setProperty 更新元素的 _label 时，又会导致死循环
      element.setProperty('_label', formatLabelConfig)
    })
  }

  /**
   * 给元素添加一个 label
   * @param element
   * @param position
   */
  private addLabel(element: GraphElement, position: Position) {
    const { isMultiple, maxCount } = this
    const {
      properties: { _label, _labelOption },
    } = element
    const curLabelConfig = (_label as LabelConfig[]) ?? []
    const curLabelOption = (_labelOption as ILabelOptions) ?? {}

    const len = curLabelConfig.length
    const newLabel = {
      id: createUuid(),
      x: position.x,
      y: position.y,
      content: `Label${len + 1}`,
      value: `Label${len + 1}`,
      style: {},
      draggable: true,
      editable: true,
      vertical: false,
    }
    // 全局的isMultiple为false，或全局isMultiple为true但局部isMultiple指明是false，或当前label长度已经达到上线时，不允许添加多个 label
    if (
      !isMultiple ||
      (isMultiple && curLabelOption.isMultiple === false) ||
      len >= (curLabelOption?.maxCount ?? maxCount)
    ) {
      return
    }

    curLabelConfig.push(newLabel)
    element.setProperty('_label', curLabelConfig)
  }

  /**
   * 移除元素的某个 label
   * @private
   */
  // private removeLabel() {}

  private addEventListeners() {
    const { graphModel } = this.lf
    const { eventCenter, editConfigModel } = graphModel

    eventCenter.on('graph:rendered', ({ graphModel }) => {
      this.setupLabels(graphModel)
    })

    // 监听元素双击事件，给元素增加 Label
    eventCenter.on(
      'node:dbclick,edge:dbclick',
      ({ e, data }: { e: MouseEvent; data: NodeData | EdgeData }) => {
        // DONE: 增加 label 的数据信息到 element model
        const target: GraphElement | undefined = graphModel.getElement(data.id)
        // DONE: 将 clientX 和 clientY 转换为画布坐标
        const {
          canvasOverlayPosition: { x: x1, y: y1 },
        } = graphModel.getPointByClient({
          x: e.clientX,
          y: e.clientY,
        })

        const point: Position = {
          x: x1,
          y: y1,
        }
        if (target && editConfigModel.textMode === TextMode.LABEL) {
          this.addLabel(target, point)
        }
      },
    )

    // 监听 node:resize 事件，在 resize 时，重新计算 label 的位置信息
    eventCenter.on('node:resize', ({ preData, data, model }) => {
      const {
        width: preWidth,
        height: preHeight,
        _label = [],
      } = preData.properties ?? {}
      const { width: curWidth, height: curHeight } = data.properties ?? {}

      if (preWidth && preHeight && curWidth && curHeight) {
        const origin: BBoxInfo = {
          x: preData.x,
          y: preData.y,
          width: preWidth,
          height: preHeight,
        }
        const scaled: BBoxInfo = {
          x: data.x,
          y: data.y,
          width: curWidth,
          height: curHeight,
        }
        const newLabelConfig = map(_label as LabelConfig[], (label) => {
          const { x, y } = label
          const newPoint = calcPointAfterResize(origin, scaled, { x, y })
          return {
            ...label,
            ...newPoint,
          }
        })

        model.setProperty('_label', newLabelConfig)
      }
    })

    // 监听 node:rotate 事件，在 rotate 时，重新计算 Label 的位置信息
    eventCenter.on('node:rotate', ({ model }) => {
      const {
        x,
        y,
        rotate,
        properties: { _label = [] },
      } = model
      const center: Position = { x, y }

      const newLabelConfig = map(_label as LabelConfig[], (label) => {
        if (!label.id) return label

        let point: Position = { x: label.x, y: label.y }
        if (this.labelInitPositionMap.has(label.id)) {
          point = this.labelInitPositionMap.get(label.id)!
        } else {
          this.labelInitPositionMap.set(label.id, point)
        }

        // 弧度转角度
        let theta = rotate * (180 / Math.PI)
        if (theta < 0) theta += 360
        const radian = theta * (Math.PI / 180)

        const newPoint = rotatePointAroundCenter(point, center, radian)
        return {
          ...label,
          ...newPoint,
          rotate: theta,
        }
      })

      model.setProperty('_label', newLabelConfig)
    })
    // 监听元素新增事件，元素label格式化
    eventCenter.on('node:dnd-add,node:add,edge:add', ({ data }) => {
      const element = graphModel.getElement(data.id)
      if (element) {
        this.rewriteInnerMethods(element)
        const formatedLabel = this.formatConfig(graphModel, data)
        element.setProperty('_label', formatedLabel)
      }
    })
  }

  /**
   * 重写元素的一些方法，以支持 Label 的拖拽、编辑等
   * @param element
   */
  private rewriteInnerMethods(element: GraphElement) {
    // 重写 edgeModel/nodeModel moveText 方法，在 move text 时，以相同的逻辑移动 label
    element.moveText = (deltaX: number, deltaY: number) => {
      if (!element.text) return
      const {
        text: { x, y, value, draggable, editable },
      } = element

      element.text = {
        value,
        editable,
        draggable,
        x: x + deltaX,
        y: y + deltaY,
      }
      const properties = cloneDeep(element.getProperties())
      // 重新计算新的 label 位置信息
      if (isArray(properties._label)) {
        const nextLabel = map(properties._label as LabelConfig[], (label) => {
          return {
            ...label,
            x: label.x + deltaX,
            y: label.y + deltaY,
          }
        })
        element?.setProperty('_label', nextLabel)
      }
    }

    // TODO: others methods ???
  }

  private rewriteShortcut() {
    const { keyboard, graphModel } = this.lf
    const {
      options: { keyboard: keyboardOptions },
    } = keyboard
    keyboard.off(['backspace'])
    keyboard.on(['backspace'], () => {
      if (!keyboardOptions?.enabled) return true
      if (graphModel.textEditElement) return true
      const elements = graphModel.getSelectElements(true)
      this.lf.clearSelectElements()
      const {
        graphModel: { editConfigModel },
      } = this.lf
      elements.edges.forEach((edge) => {
        const { properties } = edge
        if (
          properties &&
          !isEmpty(properties._label) &&
          editConfigModel.textMode === TextMode.LABEL
        ) {
          const newLabelList = properties._label.filter(
            (label) => !label.isSelected,
          )
          // 如果两个labelList长度不一致，说明有选中的元素，此时backspace做的动作是删除label
          if (!isEqual(newLabelList.length, properties._label.length)) {
            const edgeModel = graphModel.getEdgeModelById(edge.id)
            edgeModel?.setProperty('_label', newLabelList)
            return
          }
        }
        edge.id && this.lf.deleteEdge(edge.id)
      })
      elements.nodes.forEach((node) => {
        const { properties } = node
        if (
          properties &&
          !isEmpty(properties._label) &&
          editConfigModel.textMode === TextMode.LABEL
        ) {
          const newLabelList = properties._label.filter(
            (label) => !label.isSelected,
          )
          if (!isEqual(newLabelList.length, properties._label.length)) {
            const nodeModel = graphModel.getNodeModelById(node.id)
            nodeModel?.setProperty('_label', newLabelList)
            return
          }
        }
        node.id && this.lf.deleteNode(node.id)
      })
      return false
    })
  }

  /**
   * 更新当前渲染使用的 Text or Label 模式
   */
  updateTextMode(textMode: TextMode) {
    const {
      graphModel: { editConfigModel },
    } = this.lf
    if (textMode === editConfigModel.textMode) return

    editConfigModel.updateTextMode(textMode)
    if (textMode === TextMode.LABEL) {
      this.lf.tool.enableTool(LabelOverlay.toolName)
      this.lf.tool.disableTool('text-edit-tool')
    } else if (textMode === TextMode.TEXT) {
      this.lf.tool.enableTool('text-edit-tool')
      this.lf.tool.disableTool(LabelOverlay.toolName)
    }
  }

  render() {}

  destroy() {}
}

export default Label
