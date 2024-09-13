import LogicFlow, {
  BaseNodeModel,
  BaseEdgeModel,
  Model,
  GraphModel,
  TransformData,
  TransformType,
  EventType,
} from '..'

import NodeData = LogicFlow.NodeData
import EdgeData = LogicFlow.EdgeData
import GraphData = LogicFlow.GraphData
import AnchorConfig = Model.AnchorConfig
import ClientPosition = LogicFlow.ClientPosition

type ClickEventArgs = {
  /**
   * 点击后节点是否处于选中状态
   */
  isSelected: boolean
  /**
   * 是否为多选状态
   */
  isMultiple: boolean
}

type NodeEventArgsPick<
  T extends
    | 'preData'
    | 'data'
    | 'model'
    | 'e'
    | 'position'
    | 'deltaX'
    | 'deltaY'
    | 'index',
> = Pick<
  {
    /**
     * 上一个状态的节点数据
     */
    preData: NodeData
    /**
     * 节点数据
     */
    data: NodeData
    /**
     * 节点 model
     */
    model: BaseNodeModel
    /**
     * 原生鼠标事件对象
     */
    e: MouseEvent
    /**
     * 鼠标触发点相对于画布左上角的坐标
     */
    position: ClientPosition
    /**
     * 鼠标 X轴移动的距离
     */
    deltaX: number
    /**
     * 鼠标Y轴移动的距离
     */
    deltaY: number
    /**
     * Resize 时调整的是哪个控制点
     */
    index: number
  },
  T
>

type TextEventArgsPick<
  T extends 'data' | 'e' | 'model' | 'element' | 'position',
> = Pick<
  {
    // 节点数据
    data?: any
    // 原生鼠标事件对象
    e?: MouseEvent | FocusEvent
    // 文本所在元素model
    model?: BaseNodeModel | BaseEdgeModel | unknown
    // 文本dom
    element?: HTMLElement | null
    // 文本位置
    position?: {
      x: number
      y: number
    }
  },
  T
>

/**
 * 节点事件
 */
interface NodeEventArgs {
  /**
   * 单击节点
   */
  [EventType.NODE_CLICK]: NodeEventArgsPick<'data' | 'e' | 'position'> &
    ClickEventArgs
  /**
   * 双击节点
   */
  [EventType.NODE_DBCLICK]: NodeEventArgsPick<'data' | 'e' | 'position'>
  /**
   * 鼠标按下节点
   */
  [EventType.NODE_MOUSEDOWN]: NodeEventArgsPick<'data' | 'e'>
  /**
   * 鼠标抬起节点
   */
  [EventType.NODE_MOUSEUP]: NodeEventArgsPick<'data' | 'e'>
  /**
   * 鼠标移动节点
   */
  [EventType.NODE_MOUSEMOVE]: NodeEventArgsPick<
    'data' | 'e' | 'deltaX' | 'deltaY'
  >
  /**
   * 鼠标进入节点
   */
  [EventType.NODE_MOUSEENTER]: NodeEventArgsPick<'data' | 'e'>
  /**
   * 鼠标离开节点
   */
  [EventType.NODE_MOUSELEAVE]: NodeEventArgsPick<'data' | 'e'>
  /**
   * 添加节点
   */
  [EventType.NODE_ADD]: NodeEventArgsPick<'data'>
  /**
   * 删除节点
   */
  [EventType.NODE_DELETE]: NodeEventArgsPick<'data'>
  /**
   * 添加外部拖入节点
   */
  [EventType.NODE_DND_ADD]: NodeEventArgsPick<'data'>
  /**
   * 拖拽外部拖入节点
   */
  [EventType.NODE_DND_DRAG]: NodeEventArgsPick<'data'>
  /**
   * 开始拖拽节点
   */
  [EventType.NODE_DRAGSTART]: NodeEventArgsPick<'data' | 'e'>
  /**
   * 拖拽节点
   */
  [EventType.NODE_DRAG]: NodeEventArgsPick<'data' | 'e' | 'deltaX' | 'deltaY'>
  /**
   * 拖拽节点结束
   */
  [EventType.NODE_DROP]: NodeEventArgsPick<'data' | 'e'>
  /**
   * 右键点击节点
   */
  [EventType.NODE_CONTEXTMENU]: NodeEventArgsPick<'data' | 'e' | 'position'>
  /**
   * 节点旋转
   */
  [EventType.NODE_ROTATE]: NodeEventArgsPick<'data' | 'e' | 'model'>
  /**
   * 节点缩放
   */
  [EventType.NODE_RESIZE]: NodeEventArgsPick<
    'preData' | 'data' | 'model' | 'deltaX' | 'deltaY' | 'index'
  >
}

type EdgeEventArgsPick<T extends 'data' | 'e' | 'position'> = Pick<
  {
    /**
     * 边数据
     */
    data: EdgeData
    /**
     * 原生鼠标事件对象
     */
    e: MouseEvent
    /**
     * 鼠标触发点相对于画布左上角的坐标
     */
    position: ClientPosition
  },
  T
>

/**
 * 边事件
 */
interface EdgeEventArgs {
  /**
   * 单击边
   */
  [EventType.EDGE_CLICK]: EdgeEventArgsPick<'data' | 'e' | 'position'>
  /**
   * 双击边
   */
  [EventType.EDGE_DBCLICK]: EdgeEventArgsPick<'data' | 'e' | 'position'>
  /**
   * 鼠标进入边
   */
  [EventType.EDGE_MOUSEENTER]: EdgeEventArgsPick<'data' | 'e'>
  /**
   * 鼠标离开边
   */
  [EventType.EDGE_MOUSELEAVE]: EdgeEventArgsPick<'data' | 'e'>
  /**
   * 添加边
   */
  [EventType.EDGE_ADD]: EdgeEventArgsPick<'data'>
  /**
   * 删除边
   */
  [EventType.EDGE_DELETE]: EdgeEventArgsPick<'data'>
  /**
   * 右键点击边
   */
  [EventType.EDGE_CONTEXTMENU]: EdgeEventArgsPick<'data' | 'e' | 'position'>
  /**
   * 拖拽调整边
   */
  [EventType.EDGE_ADJUST]: EdgeEventArgsPick<'data'>
  /**
   * 调整边的起点/终点
   */
  [EventType.EDGE_EXCHANGE_NODE]: {
    data: {
      /**
       * 新的边的数据
       */
      newEdge: EdgeData
      /**
       * 旧的边的数据
       */
      oldEdge: EdgeData
    }
  }
}

/**
 * 文本事件
 */
interface TextEventArgs {
  // 鼠标按下文本
  [EventType.TEXT_MOUSEDOWN]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 开始拖拽文本
  [EventType.TEXT_DRAGSTART]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本拖拽
  [EventType.TEXT_DRAG]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本拖拽结束
  [EventType.TEXT_DROP]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本单击
  [EventType.TEXT_CLICK]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本双击
  [EventType.TEXT_DBCLICK]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本失焦
  [EventType.TEXT_BLUR]: TextEventArgsPick<'data' | 'e' | 'model' | 'element'>
  // 鼠标移动文本
  [EventType.TEXT_MOUSEMOVE]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 鼠标抬起
  [EventType.TEXT_MOUSEUP]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本获焦
  [EventType.TEXT_FOCUS]: TextEventArgsPick<'data' | 'e' | 'model' | 'element'>
  // 文本新增
  [EventType.TEXT_ADD]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本更新
  [EventType.TEXT_UPDATE]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本清空
  [EventType.TEXT_CLEAR]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本删除
  [EventType.TEXT_DELETE]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 不允许增加文本
  [EventType.TEXT_NOT_ALLOWED_ADD]: TextEventArgsPick<'data' | 'e' | 'model'>
}

/**
 * label插件文本事件
 */
interface TextEventArgs {
  // 鼠标按下文本
  [EventType.LABEL_MOUSEDOWN]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 开始拖拽文本
  [EventType.LABEL_DRAGSTART]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本拖拽
  [EventType.LABEL_DRAG]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本拖拽结束
  [EventType.LABEL_DROP]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本单击
  [EventType.LABEL_CLICK]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本双击
  [EventType.LABEL_DBCLICK]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本失焦
  [EventType.LABEL_BLUR]: TextEventArgsPick<'data' | 'e' | 'model' | 'element'>
  // 鼠标移动文本
  [EventType.LABEL_MOUSEMOVE]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 鼠标抬起
  [EventType.LABEL_MOUSEUP]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本获焦
  [EventType.LABEL_FOCUS]: TextEventArgsPick<'data' | 'e' | 'model' | 'element'>
  // 文本新增
  [EventType.LABEL_ADD]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本更新
  [EventType.LABEL_UPDATE]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本清空
  [EventType.LABEL_CLEAR]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本删除
  [EventType.LABEL_DELETE]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本新增
  [EventType.LABEL_SHOULD_ADD]: TextEventArgsPick<
    'data' | 'e' | 'model' | 'position'
  >
  // 文本批量新增
  [EventType.LABEL_BATCH_ADD]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本更新
  [EventType.LABEL_SHOULD_UPDATE]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本删除
  [EventType.LABEL_SHOULD_DELETE]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 文本批量删除
  [EventType.LABEL_BATCH_DELETE]: TextEventArgsPick<'data' | 'e' | 'model'>
  // 不允许增加文本
  [EventType.LABEL_NOT_ALLOWED_ADD]: TextEventArgsPick<'data' | 'e' | 'model'>
}

/**
 * 连线事件
 */
interface ConnectionEventArgs {
  [EventType.CONNECTION_NOT_ALLOWED]: {
    /**
     * 目标节点数据
     */
    data: NodeData
    /**
     * 校验信息
     */
    msg?: string
  }
}

/**
 * 公共事件
 */
interface CommonEventArgs {
  [EventType.ELEMENT_CLICK]: {
    /**
     * 点击元素的数据（节点/边）
     */
    data: NodeData | EdgeData
    /**
     * 原生鼠标事件对象
     */
    e: MouseEvent
    /**
     * 鼠标触发点相对于画布左上角的坐标
     */
    position: ClientPosition
  }
  /**
   * 元素的 properties 发生改变
   */
  [EventType.PROPERTIES_CHANGE]: {
    data: {
      /**
       * 元素的 id
       */
      id: string
      /**
       * 元素的类型
       */
      type: string
      /**
       * 改变的 properties 的 key
       */
      keys: string[]
      /**
       * 改变前的 properties
       */
      preProperties: Record<string, any>
      /**
       * 改变后的 properties
       */
      properties: Record<string, any>
    }
  }
  /**
   * 进行画布平移或缩放等变化操作时触发
   */
  [EventType.GRAPH_TRANSFORM]: {
    /**
     * 变换操作类型
     */
    type: TransformType
    /**
     * 变换操作后的数据
     */
    transform: TransformData
  }
  /**
   * 画布渲染数据后触发，即 `lf.render()` 方法被调用后触发。
   */
  [EventType.GRAPH_RENDERED]: {
    /**
     * 渲染后的画布数据
     */
    data: GraphData
    /**
     * 渲染后的画布 model
     */
    graphModel: GraphModel
  }
  /**
   * 画布重新更新后触发. 即 lf.render(graphData)方法被调用后或者改变画布（graphModel）上的属性后触发。
   * 如果是主动修改某个特定属性导致画布更新，想要在画布更新后做一些操作，建议注册事件后在回调函数中及时注销该事件，或者使用once事件代替on事件。
   * 因为其他属性也可能导致画布更新，触发该事件。
   */
  [EventType.GRAPH_UPDATED]: {
    /**
     * 更新后的画布数据
     */
    data: GraphData
  }
}

type AnchorEventArgsPick<T extends 'data' | 'e' | 'nodeModel' | 'edgeModel'> =
  Pick<
    {
      /**
       * 锚点数据
       */
      data: AnchorConfig
      /**
       * 原生鼠标事件对象
       */
      e: MouseEvent
      /**
       * 锚点所属节点的数据
       */
      nodeModel: BaseNodeModel
      /**
       * 通过拖动锚点连线添加的边的数据
       */
      edgeModel: BaseEdgeModel
    },
    T
  >

/**
 * 锚点事件
 */
interface AnchorEventArgs {
  /**
   * 开始拖拽锚点
   */
  [EventType.ANCHOR_DRAGSTART]: AnchorEventArgsPick<'data' | 'e' | 'nodeModel'>
  /**
   * 拖拽锚点
   */
  [EventType.ANCHOR_DRAG]: AnchorEventArgsPick<'data' | 'e' | 'nodeModel'>
  /**
   * 拖拽锚点结束，并成功添加边。
   * 只有在创建连线成功时才触发。用于区分手动创建的连线和自动创建的连线 `edge:add`
   */
  [EventType.ANCHOR_DROP]: AnchorEventArgsPick<
    'data' | 'e' | 'nodeModel' | 'edgeModel'
  >
  /**
   * 拖拽锚点结束，不管是否成功添加边都会触发
   */
  [EventType.ANCHOR_DRAGEND]: AnchorEventArgsPick<
    'data' | 'e' | 'nodeModel' | 'edgeModel'
  >
}

type BlankEventArgsPick<T extends 'e' | 'position'> = Pick<
  {
    /**
     * 原生鼠标事件对象
     */
    e: MouseEvent
    /**
     * 鼠标触发点相对于画布左上角的坐标
     */
    position: ClientPosition
  },
  T
>

/**
 * 画布事件
 */
interface BlankEventArgs {
  /**
   * 鼠标按下画布
   */
  [EventType.BLANK_MOUSEDOWN]: BlankEventArgsPick<'e'>
  /**
   * 鼠标抬起画布
   */
  [EventType.BLANK_MOUSEUP]: BlankEventArgsPick<'e'>
  /**
   * 鼠标移动画布
   */
  [EventType.BLANK_MOUSEMOVE]: BlankEventArgsPick<'e'>
  /**
   * 单击画布
   */
  [EventType.BLANK_CLICK]: BlankEventArgsPick<'e'>
  /**
   * 右键点击画布
   */
  [EventType.BLANK_CONTEXTMENU]: BlankEventArgsPick<'e' | 'position'>
  /**
   * 开始拖拽画布
   */
  [EventType.BLANK_DRAGSTART]: BlankEventArgsPick<'e'>
  /**
   * 拖拽画布
   */
  [EventType.BLANK_DRAG]: BlankEventArgsPick<'e'>
  /**
   * 拖拽画布结束
   */
  [EventType.BLANK_DROP]: BlankEventArgsPick<'e'>
}

interface HistoryEventArgs {
  /**
   * 历史记录变化
   */
  [EventType.HISTORY_CHANGE]: {
    /**
     * 历史数据
     */
    data: {
      /**
       * 可撤销的 graph 快照
       */
      undos: GraphData[]
      /**
       * 可重做的 graph 快照
       */
      redos: GraphData[]
      /**
       * 是否可以撤销
       */
      undoAble: boolean
      /**
       * 是否可以重做
       */
      redoAble: boolean
    }
  }
}

type SelectionEventArgsPick<T extends 'data' | 'e' | 'position'> = Pick<
  {
    /**
     * 选中元素的数据（节点/边）
     */
    data: GraphData
    /**
     * 原生鼠标事件对象
     */
    e: MouseEvent
    /**
     * 鼠标触发点相对于画布左上角的坐标
     */
    position: ClientPosition
  },
  T
>

/**
 * 选区事件
 */
interface SelectionEventArgs {
  /**
   * 鼠标按下选区
   */
  [EventType.SELECTION_MOUSEDOWN]: SelectionEventArgsPick<'e'>
  /**
   * 开始拖拽选区
   */
  [EventType.SELECTION_DRAGSTART]: SelectionEventArgsPick<'e'>
  /**
   * 拖拽选区
   */
  [EventType.SELECTION_DRAG]: SelectionEventArgsPick<'e'>
  /**
   * 拖拽选区结束
   */
  [EventType.SELECTION_DROP]: SelectionEventArgsPick<'e'>
  /**
   * 鼠标移动选区
   */
  [EventType.SELECTION_MOUSEMOVE]: SelectionEventArgsPick<'e' | 'position'>
  /**
   * 鼠标抬起选区
   */
  [EventType.SELECTION_MOUSEUP]: SelectionEventArgsPick<'e'>
  /**
   * 右键点击选区
   */
  [EventType.SELECTION_CONTEXTMENU]: SelectionEventArgsPick<
    'data' | 'e' | 'position'
  >
}

// 此处主要是对事件参数进行聚合
export type EventArgs = NodeEventArgs &
  EdgeEventArgs &
  ConnectionEventArgs &
  CommonEventArgs &
  AnchorEventArgs &
  BlankEventArgs &
  HistoryEventArgs &
  SelectionEventArgs &
  TextEventArgs
