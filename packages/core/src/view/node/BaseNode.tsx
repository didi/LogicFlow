import { createElement as h, Component } from 'preact/compat'
import { reaction, IReactionDisposer } from 'mobx'
import { map } from 'lodash-es'
import Anchor from '../Anchor'
import { BaseText } from '../text'
import LogicFlow from '../../LogicFlow'
import { GraphModel, BaseNodeModel, Model } from '../../model'
import { ElementState, EventType, TextMode } from '../../constant'
import {
  StepDrag,
  snapToGrid,
  isIe,
  isMultipleSelect,
  cancelRaf,
  createRaf,
  IDragParams,
  // RotateMatrix,
} from '../../util'
import RotateControlPoint from '../Rotate'
import ResizeControlGroup from '../Control'

type IProps = {
  model: BaseNodeModel
  graphModel: GraphModel
}

type IState = {
  isDragging?: boolean
}

export abstract class BaseNode<P extends IProps = IProps> extends Component<
  P,
  IState
> {
  static isObserved: boolean = false
  static extendsKey?: string

  t: any
  moveOffset?: LogicFlow.OffsetData

  stepDrag: StepDrag
  mouseUpDrag?: boolean
  startTime?: number
  modelDisposer: IReactionDisposer

  constructor(props: IProps) {
    super()
    const {
      graphModel: { gridSize, eventCenter },
      model,
    } = props
    // 不在构造函数中判断，因为editConfig可能会被动态改变
    this.stepDrag = new StepDrag({
      onDragStart: this.onDragStart,
      onDragging: this.onDragging,
      onDragEnd: this.onDragEnd,
      step: gridSize,
      eventType: 'NODE',
      isStopPropagation: false,
      eventCenter,
      model,
    })
    // https://github.com/didi/LogicFlow/issues/1370
    // 当使用撤销功能：LogicFlow.undo()时，会重新初始化所有model数据，即LogicFlow.undo()时会新构建一个model对象
    // 但是this.stepDrag并不会重新创建
    // 导致this.stepDrag持有的model并没有重新赋值，因为之前的做法是构造函数中传入一个model对象
    // 使用mobx的reaction监听能力，如果this.props.model发生变化，则进行this.stepDrag.setModel()操作
    this.modelDisposer = reaction(
      () => this.props,
      (newProps) => {
        if (newProps && newProps.model) {
          this.stepDrag.setModel(newProps.model)
        }
      },
    )
  }

  componentWillUnmount() {
    if (this.modelDisposer) {
      this.modelDisposer()
    }

    // 以下是 mobx-preact 中 componentWillUnmount 的回调逻辑，但是不知道出于什么考虑，mobx-preact 没有混入这一段逻辑
    // @ts-ignore
    if (this.render.$mobx) {
      // @ts-ignore
      this.render.$mobx.dispose()
    }
  }

  componentDidMount() {}

  componentDidUpdate() {}

  abstract getShape(): h.JSX.Element | null

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAnchorShape(_anchorData?: Model.AnchorConfig): h.JSX.Element | null {
    return null
  }

  getAnchors() {
    const { model, graphModel } = this.props
    const { isSelected, isHitable, isDragging, isShowAnchor } = model
    if (isHitable && (isSelected || isShowAnchor) && !isDragging) {
      return map(model.anchors, (anchor, index) => {
        const edgeStyle = model.getAnchorLineStyle(anchor)
        const style = model.getAnchorStyle(anchor)
        return (
          <Anchor
            anchorData={anchor}
            node={this}
            style={style}
            edgeStyle={edgeStyle}
            anchorIndex={index}
            nodeModel={model}
            graphModel={graphModel}
            setHoverOff={this.setHoverOff}
          />
        )
      })
    }
    return []
  }

  getRotateControl() {
    const { model, graphModel } = this.props
    const {
      editConfigModel: { isSilentMode, allowRotate },
    } = graphModel
    const { isSelected, isHitable, rotatable, isHovered } = model

    // 合并全局 allResize 和节点自身的 resizable 配置，以节点配置高于全局配置
    const canRotate = allowRotate && rotatable // 全局开关 > 节点配置

    const style = model.getRotateControlStyle()
    if (!isSilentMode && isHitable && (isSelected || isHovered) && canRotate) {
      return (
        <RotateControlPoint
          graphModel={graphModel}
          nodeModel={model}
          eventCenter={graphModel.eventCenter}
          style={style}
        />
      )
    }
  }

  getResizeControl(): h.JSX.Element | null {
    const { model, graphModel } = this.props
    const {
      editConfigModel: { isSilentMode, allowResize },
    } = graphModel
    const { isSelected, isHitable, resizable, isHovered } = model

    // 合并全局 allResize 和节点自身的 resizable 配置，以节点配置高于全局配置
    const canResize = allowResize && resizable // 全局开关 > 节点配置
    const style = model.getResizeControlStyle()
    if (!isSilentMode && isHitable && (isSelected || isHovered) && canResize) {
      return (
        <ResizeControlGroup
          style={style}
          model={model}
          graphModel={graphModel}
        />
      )
    }
    return null
  }

  getText(): h.JSX.Element | null {
    const { model, graphModel } = this.props
    const { editConfigModel } = graphModel

    // 当 节点文本模式非 TEXT 时，不显示文本
    if (editConfigModel.nodeTextMode !== TextMode.TEXT) return null
    // 文本被编辑的时候，显示编辑框，不显示文本。
    if (model.state === ElementState.TEXT_EDIT) return null

    if (model.text) {
      let draggable = false
      if (editConfigModel.nodeTextDraggable && model.text.draggable) {
        draggable = true
      }
      return (
        <BaseText
          editable={
            editConfigModel.nodeTextEdit && (model.text.editable ?? true)
          }
          model={model}
          graphModel={graphModel}
          draggable={draggable}
        />
      )
    }
    return null
  }

  getStateClassName() {
    const {
      model: { state, isDragging, isSelected },
    } = this.props
    let className = 'lf-node'
    switch (state) {
      case ElementState.ALLOW_CONNECT:
        className += ' lf-node-allow'
        break
      case ElementState.NOT_ALLOW_CONNECT:
        className += ' lf-node-not-allow'
        break
      default:
        className += ' lf-node-default'
        break
    }
    if (isDragging) {
      className += ' lf-dragging'
    }
    if (isSelected) {
      className += ' lf-node-selected'
    }
    return className
  }

  onDragStart = ({ event }: Partial<IDragParams>) => {
    const { model, graphModel } = this.props
    if (event) {
      const {
        canvasOverlayPosition: { x, y },
      } = graphModel.getPointByClient({
        x: event.clientX,
        y: event.clientY,
      })
      this.moveOffset = {
        dx: model.x - x,
        dy: model.y - y,
      }
    }
  }

  onDragging = ({ event }: IDragParams) => {
    const { model, graphModel } = this.props
    const {
      editConfigModel: { stopMoveGraph, autoExpand, snapGrid },
      transformModel,
      selectNodes,
      width,
      height,
      gridSize,
    } = graphModel
    model.isDragging = true
    const { clientX, clientY } = event!
    let {
      canvasOverlayPosition: { x, y },
    } = graphModel.getPointByClient({
      x: clientX,
      y: clientY,
    })
    const [x1, y1] = transformModel.CanvasPointToHtmlPoint([x, y])
    // 1. 考虑画布被缩放
    // 2. 考虑鼠标位置不再节点中心
    x = x + (this.moveOffset?.dx ?? 0)
    y = y + (this.moveOffset?.dy ?? 0)
    // 校准坐标
    x = snapToGrid(x, gridSize, snapGrid)
    y = snapToGrid(y, gridSize, snapGrid)
    if (!width || !height) {
      graphModel.moveNode2Coordinate(model.id, x, y)
      return
    }
    const isOutCanvas = x1 < 0 || y1 < 0 || x1 > width || y1 > height
    if (autoExpand && !stopMoveGraph && isOutCanvas) {
      // 鼠标超出画布后的拖动，不处理，而是让上一次setInterval持续滚动画布
      return
    }
    // 取节点左上角和右下角，计算节点移动是否超出范围
    const [leftTopX, leftTopY] = transformModel.CanvasPointToHtmlPoint([
      x - model.width / 2,
      y - model.height / 2,
    ])
    const [rightBottomX, rightBottomY] = transformModel.CanvasPointToHtmlPoint([
      x + model.width / 2,
      y + model.height / 2,
    ])
    const size: number = Math.max(gridSize, 20)
    let nearBoundary: LogicFlow.PointTuple | [] = []
    if (leftTopX < 0) {
      nearBoundary = [size, 0]
    } else if (rightBottomX > graphModel.width) {
      nearBoundary = [-size, 0]
    } else if (leftTopY < 0) {
      nearBoundary = [0, size]
    } else if (rightBottomY > graphModel.height) {
      nearBoundary = [0, -size]
    }
    if (this.t) {
      cancelRaf(this.t)
    }

    let moveNodes = selectNodes.map((node) => node.id)
    // 未被选中的节点也可以拖动
    if (moveNodes.indexOf(model.id) === -1) {
      moveNodes = [model.id]
    }
    if (nearBoundary.length > 0 && !stopMoveGraph && autoExpand) {
      this.t = createRaf(() => {
        const [translateX, translateY] = nearBoundary
        transformModel.translate(translateX ?? 0, translateY ?? 0)
        const deltaX = -(translateX ?? 0) / transformModel.SCALE_X
        const deltaY = -(translateY ?? 0) / transformModel.SCALE_X
        graphModel.moveNodes(moveNodes, deltaX, deltaY)
      })
    } else {
      graphModel.moveNodes(moveNodes, x - model.x, y - model.y)
    }
  }

  onDragEnd = () => {
    if (this.t) {
      cancelRaf(this.t)
    }
    const { model } = this.props
    model.isDragging = false
  }
  onMouseOut = (ev: MouseEvent) => {
    if (isIe()) {
      this.setHoverOff(ev)
    }
  }

  handleMouseUp = () => {
    const { model } = this.props
    this.mouseUpDrag = model.isDragging
  }

  handleClick = (e: MouseEvent) => {
    // 节点拖拽进画布之后，不触发click事件相关emit
    // 点拖拽进画布没有触发mousedown事件，没有startTime，用这个值做区分
    const isDragging = this.mouseUpDrag === false
    if (!this.startTime) return
    const { model, graphModel } = this.props
    if (!isDragging) return // 如果是拖拽, 不触发click事件。
    // 节点数据，多为事件对象数据抛出
    const nodeData = model.getData()
    const position = graphModel.getPointByClient({
      x: e.clientX,
      y: e.clientY,
    })

    // TODO: 这里加入了 isSelected 与 isMultiple，主要是为 group 插件做的加强，有种被插件夺舍的感觉
    const eventOptions = {
      data: nodeData,
      e,
      position,
      isSelected: false,
      isMultiple: false,
    }

    const isRightClick = e.button === 2
    // 这里 IE 11不能正确显示
    const isDoubleClick = e.detail === 2

    // 判断是否有右击，如果有右击则取消点击事件触发
    if (isRightClick) return

    const { editConfigModel } = graphModel
    // 在multipleSelect tool禁用的情况下，允许取消选中节点
    const isMultiple = isMultipleSelect(e, editConfigModel)
    eventOptions.isMultiple = isMultiple
    if (model.isSelected && !isDoubleClick && isMultiple) {
      eventOptions.isSelected = false
      model.setSelected(false)
    } else {
      graphModel.selectNodeById(model.id, isMultiple)
      eventOptions.isSelected = true
      // 静默模式下点击节点不变更节点层级
      if (!editConfigModel.isSilentMode) {
        this.toFront()
      }
    }

    // 不是双击的，默认都是单击
    if (isDoubleClick) {
      if (editConfigModel.nodeTextEdit) {
        if (model.text.editable && editConfigModel.textMode === TextMode.TEXT) {
          model.setSelected(false)
          graphModel.setElementStateById(model.id, ElementState.TEXT_EDIT)
        }
      }
      graphModel.eventCenter.emit(EventType.NODE_DBCLICK, eventOptions)
    } else {
      graphModel.eventCenter.emit(EventType.ELEMENT_CLICK, eventOptions)
      graphModel.eventCenter.emit(EventType.NODE_CLICK, eventOptions)
    }
  }

  handleContextMenu = (ev: MouseEvent) => {
    ev.preventDefault()
    const { model, graphModel } = this.props
    const { editConfigModel } = graphModel
    // 节点数据，多为事件对象数据抛出
    const nodeData = model.getData()

    const position = graphModel.getPointByClient({
      x: ev.clientX,
      y: ev.clientY,
    })
    graphModel.setElementStateById(
      model.id,
      ElementState.SHOW_MENU,
      position.domOverlayPosition,
    )
    if (!model.isSelected) {
      graphModel.selectNodeById(model.id)
    }
    graphModel.eventCenter.emit(EventType.NODE_CONTEXTMENU, {
      data: nodeData,
      e: ev,
      position,
    })
    // 静默模式下点击节点不变更节点层级
    if (!editConfigModel.isSilentMode) {
      this.toFront()
    }
  }

  handleMouseDown = (ev: MouseEvent) => {
    const { model, graphModel } = this.props
    this.startTime = new Date().getTime()
    const { editConfigModel } = graphModel
    if (editConfigModel.adjustNodePosition && model.draggable) {
      this.stepDrag && this.stepDrag.handleMouseDown(ev)
    }
  }

  handleFocus = () => {
    const { model, graphModel } = this.props
    graphModel.eventCenter.emit(EventType.NODE_FOCUS, {
      data: model.getData(),
    })
  }

  handleBlur = () => {
    const { model, graphModel } = this.props
    graphModel.eventCenter.emit(EventType.NODE_BLUR, {
      data: model.getData(),
    })
  }

  // 因为自定义节点的时候，可能会基于hover状态自定义不同的样式。
  setHoverOn = (ev: MouseEvent) => {
    const { model, graphModel } = this.props
    if (model.isHovered) return
    const nodeData = model.getData()
    model.setHovered(true)
    graphModel.eventCenter.emit(EventType.NODE_MOUSEENTER, {
      data: nodeData,
      e: ev,
    })
  }

  setHoverOff = (ev: MouseEvent) => {
    const { model, graphModel } = this.props
    const nodeData = model.getData()
    // 文本focus时，关联的元素也需要高亮，所以元素失焦时还要判断下是否有文本处于focus状态
    if (!model.isHovered) return
    model.setHovered(false)
    graphModel.eventCenter.emit(EventType.NODE_MOUSELEAVE, {
      data: nodeData,
      e: ev,
    })
  }

  /**
   *  @overridable 支持重写, 节点置顶，可以被某些不需要置顶的节点重写，如group节点。
   */
  toFront() {
    const { model, graphModel } = this.props
    if (model.autoToFront) {
      graphModel.toFront(model.id)
    }
  }

  render() {
    const { model, graphModel } = this.props
    const {
      editConfigModel: {
        hideAnchors,
        adjustNodePosition,
        allowRotate,
        allowResize,
      },
      gridSize,
      transformModel: { SCALE_X },
    } = graphModel
    const { isHitable, draggable, transform } = model
    const { className = '', ...restAttributes } = model.getOuterGAttributes()
    const nodeShapeInner = (
      <g className="lf-node-content">
        <g transform={transform}>
          {this.getShape()}
          {this.getText()}
          {allowRotate && this.getRotateControl()}
          {allowResize && this.getResizeControl()}
        </g>
        {!hideAnchors && this.getAnchors()}
      </g>
    )
    let nodeShape: h.JSX.Element
    if (!isHitable) {
      nodeShape = (
        <g
          className={`${this.getStateClassName()} ${className}`}
          {...restAttributes}
        >
          {nodeShapeInner}
        </g>
      )
    } else {
      if (adjustNodePosition && draggable) {
        this.stepDrag.setStep(gridSize * SCALE_X)
      }
      nodeShape = (
        <g
          className={`${this.getStateClassName()} ${className}`}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
          onClick={this.handleClick}
          onMouseEnter={this.setHoverOn}
          onMouseOver={this.setHoverOn}
          onMouseLeave={this.setHoverOff}
          onMouseOut={this.onMouseOut}
          onContextMenu={this.handleContextMenu}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          {...restAttributes}
        >
          {nodeShapeInner}
        </g>
      )
    }
    return nodeShape
  }
}

export default BaseNode
