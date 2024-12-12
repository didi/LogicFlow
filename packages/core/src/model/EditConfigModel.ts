import { assign, isBoolean, isUndefined, pick } from 'lodash-es'
import { observable, action } from 'mobx'
import { TextMode } from '../constant'

export interface IEditConfigType {
  /**
   * 是否为静默模式
   */
  isSilentMode: boolean
  /**
   * 禁止缩放画布
   */
  stopZoomGraph: boolean
  /**
   * 禁止鼠标滚动移动画布
   */
  stopScrollGraph: boolean
  /**
   * 禁止拖动画布，默认为false
   * - true：完全禁止移动
   * - vertical： 禁止垂直方向拖动
   * - horizontal：禁止水平方向拖动
   * - [number, number, number, number]：[minX, minY, maxX, maxY] 画布可拖动范围
   */
  stopMoveGraph:
    | boolean
    | 'vertical'
    | 'horizontal'
    | [number, number, number, number]
  /**
   * 允许调整边
   */
  adjustEdge: boolean
  /**
   * 允许调整边的中间点
   */
  adjustEdgeMiddle: boolean
  /**
   * 允许调整边起点和终点
   */
  adjustEdgeStartAndEnd: boolean
  /**
   * 允许调整边起点
   */
  adjustEdgeStart: boolean
  /**
   * 允许调整边的终点
   */
  adjustEdgeEnd: boolean
  /**
   * 允许拖动节点
   */
  adjustNodePosition: boolean
  /**
   * 隐藏节点所有锚点
   */
  hideAnchors: boolean
  /**
   * 是否允许节点旋转（旋转点的显隐）
   */
  allowRotate: boolean
  /**
   * 是否允许节点缩放（缩放调整点的显隐）
   */
  allowResize: boolean
  /**
   * 是否自动展开
   */
  autoExpand: boolean
  /**
   * 显示节点悬浮时的外框
   */
  hoverOutline: boolean
  /**
   * 节点被选中时是否显示outline
   */
  nodeSelectedOutline: boolean
  /**
   * 边被选中时是否显示outline
   */
  edgeSelectedOutline: boolean
  /**
   * 允许文本可编辑
   */
  textEdit: boolean
  /**
   * 允许节点文本可以编辑
   */
  nodeTextEdit: boolean
  /**
   * 允许边文本可以编辑
   */
  edgeTextEdit: boolean
  /**
   * 允许文本可拖拽（文本包括Text、Label）
   */
  textDraggable: boolean
  /**
   * 允许节点文本可以拖拽
   */
  nodeTextDraggable: boolean
  /**
   * 允许边文本可以拖拽
   */
  edgeTextDraggable: boolean
  /**
   * 多选按键, 支持meta(cmd)、shift、alt
   * 不支持ctrl，ctrl会触发contextmenu
   */
  multipleSelectKey: string

  /**
   * 2.0.0 新增配置，启用 Label 后生效
   * 是否支持多文本，文本文字是否垂直展示
   * 当前文本类型
   */
  nodeTextMultiple: boolean
  edgeTextMultiple: boolean
  nodeTextVertical: boolean
  edgeTextVertical: boolean
  textMode: TextMode
  // 节点文本类型
  nodeTextMode: TextMode
  // 边文本类型
  edgeTextMode: TextMode
  // 开启网格对齐
  snapGrid: boolean
}

export type IConfigKeys = keyof IEditConfigType

const silentModeConfig = {
  // SilentMode 下允许用户操作画布
  stopZoomGraph: false,
  stopScrollGraph: false,
  stopMoveGraph: false,
  // 节点 & 边相关配置
  adjustEdge: false,
  adjustEdgeStartAndEnd: false,
  adjustNodePosition: false,
  hideAnchors: true,
  allowRotate: false,
  allowResize: false,
  nodeSelectedOutline: true,
  // 文本相关配置
  textEdit: false,
  nodeTextEdit: false,
  edgeTextEdit: false,
  textDraggable: false,
  nodeTextDraggable: false,
  edgeTextDraggable: false,
}

const allKeys = [
  'isSilentMode', // 是否为静默模式
  'stopZoomGraph', // 禁止缩放画布
  'stopScrollGraph', // 禁止鼠标滚动移动画布
  'stopMoveGraph', // 禁止拖动画布
  'snapGrid', // 是否开启网格对齐
  'adjustEdge', // 允许调整边
  'adjustEdgeMiddle', // 允许调整边中点
  'adjustEdgeStartAndEnd', // 允许调整边起点和终点
  'adjustEdgeStart', // 允许调整边起点
  'adjustEdgeEnd', // 允许调整边终点
  'adjustNodePosition', // 允许拖动节点
  'hideAnchors', // 隐藏节点所有锚点
  'allowRotate', // 是否允许节点旋转
  'allowResize', // 是否允许节点缩放
  'autoExpand', // 是否自动展开
  'hoverOutline', // 显示节点悬浮时的外框
  'nodeSelectedOutline', // 节点被选中时是否显示 outline
  'edgeSelectedOutline', // 边被选中时是否显示 outline
  'textEdit', // 是否允许文本可编辑（全局）
  'nodeTextEdit', // 允许节点文本可以编辑
  'edgeTextEdit', // 允许边文本可以编辑
  'textDraggable', // 是否允许文本可拖拽（全局）
  'nodeTextDraggable', // 允许节点文本可以拖拽
  'edgeTextDraggable', // 允许边文本可以拖拽
  'multipleSelectKey', // 多选按键

  // 2.0.0 新增配置
  'textMode', // 文本模式（全局）
  'nodeTextMode', // 节点文本模式
  'edgeTextMode', // 边文本模式
  'nodeTextMultiple', // 是否支持多个节点文本
  'edgeTextMultiple', // 是否支持多个边文本
  'nodeTextVertical', // 节点文本是否纵向显示
  'edgeTextVertical', // 边文本是否纵向显示
] as const

/**
 * 页面编辑配置
 */
export class EditConfigModel {
  stagedConfig?: Partial<IEditConfigType> // 暂存「设置为静默模式之前」的配置，在取消静默模式后恢复

  /*********************************************************
   * 画布相关配置
   ********************************************************/
  @observable isSilentMode = false
  @observable stopZoomGraph = false
  @observable stopMoveGraph = false
  @observable stopScrollGraph = false
  @observable snapGrid = false
  /*********************************************************
   * 文本相关配置（全局）
   ********************************************************/
  @observable textMode = TextMode.TEXT // 全局的 textMode 设置
  @observable textEdit = true
  @observable textDraggable = false
  // 节点
  @observable nodeTextEdit = true
  @observable nodeTextDraggable = false
  @observable nodeTextMultiple = false // 是否支持多个节点文本
  @observable nodeTextVertical = false // 节点文本朝向是否是纵向
  @observable nodeTextMode = TextMode.TEXT // 节点文本模式
  // 边
  @observable edgeTextMode = TextMode.TEXT // 边文本模式
  @observable edgeTextEdit = true
  @observable edgeTextDraggable = false
  @observable edgeTextMultiple = false // 是否支持多个边文本
  @observable edgeTextVertical = false // 边文本朝向是否是纵向
  /*********************************************************
   * 节点相关配置
   ********************************************************/
  @observable hideAnchors = false
  @observable allowRotate = false
  @observable allowResize = false
  @observable hoverOutline = true
  @observable nodeSelectedOutline = true
  @observable adjustNodePosition = true
  @observable autoExpand = false
  /*********************************************************
   * 边相关配置
   ********************************************************/
  @observable adjustEdge = true
  @observable adjustEdgeMiddle = false
  @observable adjustEdgeStartAndEnd = false
  @observable adjustEdgeStart = false
  @observable adjustEdgeEnd = false
  @observable edgeSelectedOutline = true
  /*********************************************************
   * 其他
   ********************************************************/
  multipleSelectKey = ''

  constructor(config: Partial<IEditConfigType>) {
    assign(this, this.computeConfig(config))
  }

  @action
  updateEditConfig(config: Partial<IEditConfigType>) {
    const newConfig = this.computeConfig(config)
    assign(this, newConfig)
  }

  // TODO: 确认一下这个函数的逻辑，是否会有误合并的问题
  computeConfig(config: Partial<IEditConfigType>) {
    const {
      isSilentMode,
      textDraggable,
      textMode,
      textEdit,
      adjustEdgeStartAndEnd,
    } = config
    const conf: Partial<IEditConfigType> = {}

    // false 表示从静默模式恢复
    if (isSilentMode === false) {
      assign(conf, this.stagedConfig)
    }

    // 如果不传，默认 undefined 表示非静默模式
    if (isSilentMode === true && isSilentMode !== this.isSilentMode) {
      // https://github.com/didi/LogicFlow/issues/1180
      // 如果重复调用 isSilentMode=true 多次，会导致 this.stagedConfig 状态保存错误：保存为修改之后的 Config
      // 因此需要阻止重复赋值为 true，使用 config.isSilentMode !== this.isSilentMode
      const silentConfig = pick(silentModeConfig, allKeys)
      // 暂存修改之前的所有配置项
      this.stagedConfig = pick(this, allKeys)

      assign(conf, silentConfig)
    }

    // 如果不传，默认undefined表示允许文本编辑
    if (!isUndefined(textEdit)) {
      assign(conf, {
        nodeTextEdit: textEdit,
        edgeTextEdit: textEdit,
      })
    }

    if (!isUndefined(textDraggable)) {
      assign(conf, {
        nodeTextDraggable: textDraggable,
        edgeTextDraggable: textDraggable,
      })
    }

    if (textMode) {
      assign(conf, {
        nodeTextMode: textMode,
        edgeTextMode: textMode,
      })
    }

    if (isBoolean(adjustEdgeStartAndEnd)) {
      assign(conf, {
        adjustEdgeStart: adjustEdgeStartAndEnd,
        adjustEdgeEnd: adjustEdgeStartAndEnd,
      })
    }

    const userConfig = pick(config, allKeys)
    return assign(conf, userConfig)
  }

  @action
  updateTextMode(textMode: TextMode) {
    // 如果更新全局 textMode，同时更新节点和边的 textMode
    this.textMode = textMode
    this.edgeTextMode = textMode
    this.nodeTextMode = textMode
  }

  getConfig(): IEditConfigType {
    return pick(this, allKeys)
  }
}

export default EditConfigModel
