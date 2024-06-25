import {
  LogicFlow,
  BaseNodeModel,
  BaseEdgeModel,
  Model,
  TransformData,
  TransformType,
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

type NodeEventArgsPick<T extends 'data' | 'e' | 'position'> = Pick<
  {
    /**
     * 节点数据
     */
    data: NodeData
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
 * 节点事件
 */
interface NodeEventArgs {
  /**
   * 单击节点
   */
  'node:click': NodeEventArgsPick<'data' | 'e' | 'position'> & ClickEventArgs
  /**
   * 双击节点
   */
  'node:dbclick': NodeEventArgsPick<'data' | 'e' | 'position'>
  /**
   * 鼠标按下节点
   */
  'node:mousedown': NodeEventArgsPick<'data' | 'e'>
  /**
   * 鼠标抬起节点
   */
  'node:mouseup': NodeEventArgsPick<'data' | 'e'>
  /**
   * 鼠标移动节点
   */
  'node:mousemove': NodeEventArgsPick<'data' | 'e'>
  /**
   * 鼠标进入节点
   */
  'node:mouseenter': NodeEventArgsPick<'data' | 'e'>
  /**
   * 鼠标离开节点
   */
  'node:mouseleave': NodeEventArgsPick<'data' | 'e'>
  /**
   * 添加节点
   */
  'node:add': NodeEventArgsPick<'data'>
  /**
   * 删除节点
   */
  'node:delete': NodeEventArgsPick<'data'>
  /**
   * 添加外部拖入节点
   */
  'node:dnd-add': NodeEventArgsPick<'data'>
  /**
   * 拖拽外部拖入节点
   */
  'node:dnd-drag': NodeEventArgsPick<'data'>
  /**
   * 开始拖拽节点
   */
  'node:dragstart': NodeEventArgsPick<'data' | 'e'>
  /**
   * 拖拽节点
   */
  'node:drag': NodeEventArgsPick<'data' | 'e'>
  /**
   * 拖拽节点结束
   */
  'node:drop': NodeEventArgsPick<'data' | 'e'>
  /**
   * 右键点击节点
   */
  'node:contextmenu': NodeEventArgsPick<'data' | 'e' | 'position'>
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
  'edge:click': EdgeEventArgsPick<'data' | 'e' | 'position'>
  /**
   * 双击边
   */
  'edge:dbclick': EdgeEventArgsPick<'data' | 'e' | 'position'>
  /**
   * 鼠标进入边
   */
  'edge:mouseenter': EdgeEventArgsPick<'data' | 'e'>
  /**
   * 鼠标离开边
   */
  'edge:mouseleave': EdgeEventArgsPick<'data' | 'e'>
  /**
   * 添加边
   */
  'edge:add': EdgeEventArgsPick<'data'>
  /**
   * 删除边
   */
  'edge:delete': EdgeEventArgsPick<'data'>
  /**
   * 右键点击边
   */
  'edge:contextmenu': EdgeEventArgsPick<'data' | 'e' | 'position'>
  /**
   * 拖拽调整边
   */
  'edge:adjust': EdgeEventArgsPick<'data'>
  /**
   * 调整边的起点/终点
   */
  'edge:exchange-node': {
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
 * 连线事件
 */
interface ConnectionEventArgs {
  'connection:not-allowed': {
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
  'element:click': {
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
  'properties:change': {
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
   * 节点/边的文本更新
   */
  // TODO: 更新文本事件抛出的对象是否需要更详细？
  'text:update': {
    data: {
      /**
       * 更新的文本
       */
      text: string
      /**
       * 节点/边的 id
       */
      id: string
      /**
       * 节点/边的类型
       */
      type: string
    }
  }
  /**
   * 进行画布平移或缩放等变化操作时触发
   */
  'graph:transform': {
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
  'graph:rendered': {
    /**
     * 渲染后的画布数据
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
  'anchor:dragstart': AnchorEventArgsPick<'data' | 'e' | 'nodeModel'>
  /**
   * 拖拽锚点
   */
  'anchor:drag': AnchorEventArgsPick<'data' | 'e' | 'nodeModel'>
  /**
   * 拖拽锚点结束，并成功添加边。
   * 只有在创建连线成功时才触发。用于区分手动创建的连线和自动创建的连线 `edge:add`
   */
  'anchor:drop': AnchorEventArgsPick<'data' | 'e' | 'nodeModel' | 'edgeModel'>
  /**
   * 拖拽锚点结束，不管是否成功添加边都会触发
   */
  'anchor:dragend': AnchorEventArgsPick<
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
  'blank:mousedown': BlankEventArgsPick<'e'>
  /**
   * 鼠标抬起画布
   */
  'blank:mouseup': BlankEventArgsPick<'e'>
  /**
   * 鼠标移动画布
   */
  'blank:mousemove': BlankEventArgsPick<'e'>
  /**
   * 单击画布
   */
  'blank:click': BlankEventArgsPick<'e'>
  /**
   * 右键点击画布
   */
  'blank:contextmenu': BlankEventArgsPick<'e' | 'position'>
  /**
   * 开始拖拽画布
   */
  'blank:dragstart': BlankEventArgsPick<'e'>
  /**
   * 拖拽画布
   */
  'blank:drag': BlankEventArgsPick<'e'>
  /**
   * 拖拽画布结束
   */
  'blank:drop': BlankEventArgsPick<'e'>
}

interface HistoryEventArgs {
  /**
   * 历史记录变化
   */
  'history:change': {
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
  'selection:mousedown': SelectionEventArgsPick<'e'>
  /**
   * 开始拖拽选区
   */
  'selection:dragstart': SelectionEventArgsPick<'e'>
  /**
   * 拖拽选区
   */
  'selection:drag': SelectionEventArgsPick<'e'>
  /**
   * 拖拽选区结束
   */
  'selection:drop': SelectionEventArgsPick<'e'>
  /**
   * 鼠标移动选区
   */
  'selection:mousemove': SelectionEventArgsPick<'e' | 'position'>
  /**
   * 鼠标抬起选区
   */
  'selection:mouseup': SelectionEventArgsPick<'e'>
  /**
   * 右键点击选区
   */
  'selection:contextmenu': SelectionEventArgsPick<'data' | 'e' | 'position'>
}

export interface EventArgs
  extends NodeEventArgs,
    EdgeEventArgs,
    ConnectionEventArgs,
    CommonEventArgs,
    AnchorEventArgs,
    BlankEventArgs,
    HistoryEventArgs,
    SelectionEventArgs {}
