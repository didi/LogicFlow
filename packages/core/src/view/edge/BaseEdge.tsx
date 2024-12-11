import { createElement as h, Component, createRef } from 'preact/compat'
import { Circle } from '../shape'
import { LineText } from '../text'
import LogicFlow from '../../LogicFlow'
import { GraphModel, BaseEdgeModel, PolylineEdgeModel } from '../../model'
import { ElementState, EventType, ModelType, TextMode } from '../../constant'
import {
  isMultipleSelect,
  getClosestPointOfPolyline,
  degrees,
  getThetaOfVector,
} from '../../util'
import AdjustPoint, { AdjustType } from './AdjustPoint'

import ArrowInfo = LogicFlow.ArrowInfo
import Point = LogicFlow.Point

type IProps = {
  model: BaseEdgeModel
  graphModel: GraphModel
}
export type IEdgeState = {
  hover: boolean
}

export abstract class BaseEdge<P extends IProps> extends Component<
  P,
  IEdgeState
> {
  static isObserved: boolean = false
  static extendsKey?: string
  mouseUpDrag?: boolean

  startTime?: number
  contextMenuTime?: number
  clickTimer?: number
  textRef = createRef()

  constructor() {
    super()
  }

  /**
   * 不支持重写，请使用getEdge
   */
  getShape() {
    return <g>{this.getEdge()}</g>
  }

  /**
   * @deprecated 请使用model.getTextStyle
   */
  getTextStyle() {}

  /**
   * @overridable 可重写，自定义边文本DOM
   */
  getText(): h.JSX.Element | null {
    const { model, graphModel } = this.props
    const { editConfigModel } = graphModel

    // 当 边文本模式非 TEXT 时，不显示文本
    if (editConfigModel.edgeTextMode !== TextMode.TEXT) return null
    // 文本被编辑的时候，显示编辑框，不显示文本。
    if (model.state === ElementState.TEXT_EDIT) return null

    if (model.text) {
      let draggable = false
      if (editConfigModel.edgeTextDraggable && model.text.draggable) {
        draggable = true
      }
      return (
        <LineText
          ref={this.textRef}
          editable={
            editConfigModel.edgeTextEdit && (model.text.editable ?? true)
          }
          model={model}
          graphModel={graphModel}
          draggable={draggable}
        />
      )
    }
    return null
  }

  /**
   * @deprecated
   */
  getArrowInfo(): ArrowInfo {
    const { model } = this.props
    const { startPoint, endPoint, isSelected } = model
    const { hover } = this.state as IEdgeState
    return {
      start: startPoint,
      end: endPoint,
      hover,
      isSelected,
    }
  }

  getLastTwoPoints(): [Point, Point] {
    const { model } = this.props
    const { startPoint, endPoint } = model
    return [startPoint, endPoint]
  }

  /**
   * @deprecated 请使用model.getArrowStyle
   */
  getArrowStyle() {
    console.error(
      'getArrowStyle is deprecated in 1.2.0, please use model.getArrowStyle',
    )
    return null
  }

  /**
   * 定义边的箭头，不支持重写。请使用getStartArrow和getEndArrow
   */
  private getArrow(): h.JSX.Element | null {
    const { model } = this.props
    const { id } = model
    const { refY = 0, refX = 2 } = model.getArrowStyle()
    const [start, end] = this.getLastTwoPoints()
    let theta: string | number = 'auto'
    if (start !== null && end !== null) {
      theta = degrees(
        getThetaOfVector({
          x: end.x - start.x,
          y: end.y - start.y,
          z: 0,
        }),
      )
    }
    return (
      <g>
        <defs>
          <marker
            id={`marker-start-${id}`}
            refX={-refX}
            refY={refY}
            overflow="visible"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            {this.getStartArrow()}
          </marker>
          <marker
            id={`marker-end-${id}`}
            refX={refX}
            refY={refY}
            overflow="visible"
            orient={theta}
            markerUnits="userSpaceOnUse"
            // transform={`rotate(${degrees(theta)})`}
          >
            {this.getEndArrow()}
          </marker>
        </defs>
      </g>
    )
  }

  /**
   * @overridable 可重写，自定义边起点箭头形状。
   * @example
   * getStartArrow() {
   *  const { model } = this.props;
   *  const { stroke, strokeWidth, offset, verticalLength } = model.getArrowStyle();
   *  return (
   *    h('path', {
   *      d: ''
   *    })
   *  )
   * }
   */
  getStartArrow(): h.JSX.Element | null {
    return <path />
  }

  /**
   * @overridable 可重写，自定义边终点箭头形状。
   * @example
   * getEndArrow() {
   *  const { model } = this.props;
   *  const { stroke, strokeWidth, offset, verticalLength } = model.getArrowStyle();
   *  return (
   *    h('path', {
   *      d: ''
   *    })
   *  )
   * }
   */
  getEndArrow(): h.JSX.Element | null {
    const { model } = this.props
    const { stroke, strokeWidth, offset, verticalLength } =
      model.getArrowStyle()
    return (
      <path
        stroke={stroke}
        fill={stroke}
        strokeWidth={strokeWidth}
        transform="rotate(180)"
        d={`M 0 0 L ${offset} -${verticalLength} L ${offset} ${verticalLength} Z`}
      />
    )
  }

  /**
   * @overridable 可重写，自定义调整边连接节点形状。在开启了adjustEdgeStartAndEnd的时候，会显示调整点。
   * @param x 调整点x坐标
   * @param y 调整点y坐标
   * @param model
   * @example
   * getAdjustPointShape(x, y) {
   *  const { model } = this.props;
   *  const style = model.getAdjustPointStyle();
   *  return (
   *    h('circle', {
   *      ...style,
   *     x,
   *     y
   *    })
   *  )
   * }
   */
  getAdjustPointShape(
    x: number,
    y: number,
    model: BaseEdgeModel,
  ): h.JSX.Element | null {
    const style = model.getAdjustPointStyle()
    return (
      <Circle
        className="lf-edge-adjust-point"
        {...style}
        {...{
          x,
          y,
        }}
      />
    )
  }

  /**
   * 不支持重写。请使用getAdjustPointShape
   */
  private getAdjustPoints() {
    const { model, graphModel } = this.props
    const {
      editConfigModel: {
        adjustEdgeStartAndEnd,
        adjustEdgeStart,
        adjustEdgeEnd,
      },
    } = graphModel
    const start = model.getAdjustStart()
    const end = model.getAdjustEnd()

    return (
      <g>
        {adjustEdgeStartAndEnd && adjustEdgeStart && (
          <AdjustPoint
            type={AdjustType.SOURCE}
            {...start}
            getAdjustPointShape={this.getAdjustPointShape}
            edgeModel={model}
            graphModel={graphModel}
          />
        )}
        {adjustEdgeStartAndEnd && adjustEdgeEnd && (
          <AdjustPoint
            type={AdjustType.TARGET}
            {...end}
            getAdjustPointShape={this.getAdjustPointShape}
            edgeModel={model}
            graphModel={graphModel}
          />
        )}
      </g>
    )
  }

  /**
   * @deprecated
   */
  getAnimation() {
    console.error(
      'getAnimation is deprecated in 1.2.0, please use model.getEdgeAnimationStyle',
    )
  }

  /**
   * @overridable 可重写，在完全自定义边的时候，可以重写此方法，来自定义边的选区。
   */
  public getAppendWidth() {
    return <g />
  }

  /**
   * 不建议重写，此方法为扩大边选区，方便用户点击选中边。
   * 如果需要自定义边选区，请使用getAppendWidth。
   */
  getAppend() {
    return <g className="lf-edge-append">{this.getAppendWidth()}</g>
  }

  /**
   * 不支持重写，如果想要基于hover状态设置不同的样式，请在model中使用isHovered属性。
   */
  handleHover = (hovered: boolean, ev: MouseEvent) => {
    const {
      model,
      graphModel: { eventCenter },
    } = this.props
    model.setHovered(hovered)
    const eventName = hovered
      ? EventType.EDGE_MOUSEENTER
      : EventType.EDGE_MOUSELEAVE
    const nodeData = model.getData()
    eventCenter.emit(eventName, {
      data: nodeData,
      e: ev,
    })
  }
  /**
   * 不支持重写，如果想要基于hover状态设置不同的样式，请在model中使用isHovered属性。
   */
  setHoverOn = (ev: MouseEvent) => {
    // ! hover多次触发, onMouseOver + onMouseEnter
    const {
      model: { isHovered },
    } = this.props
    if (isHovered) return
    this.textRef && this.textRef.current && this.textRef.current.setHoverOn()
    this.handleHover(true, ev)
  }
  /**
   * 不支持重写，如果想要基于hover状态设置不同的样式，请在model中使用isHovered属性。
   */
  setHoverOff = (ev: MouseEvent) => {
    const {
      model: { isHovered },
    } = this.props
    if (!isHovered) return
    this.textRef && this.textRef.current && this.textRef.current.setHoverOff()
    this.handleHover(false, ev)
  }
  /**
   * 不支持重写，如果想要基于contextmenu事件做处理，请监听edge:contextmenu事件。
   */
  handleContextMenu = (ev: MouseEvent) => {
    ev.preventDefault()
    // 节点右击也会触发时间，区分右击和点击(mouseup)
    this.contextMenuTime = new Date().getTime()
    if (this.clickTimer) {
      clearTimeout(this.clickTimer)
    }
    const { model, graphModel } = this.props
    const { editConfigModel } = graphModel
    const position = graphModel.getPointByClient({
      x: ev.clientX,
      y: ev.clientY,
    })
    graphModel.setElementStateById(
      model.id,
      ElementState.SHOW_MENU,
      position.domOverlayPosition,
    )
    // 静默模式下点击节点不变更节点层级
    if (!editConfigModel.isSilentMode) {
      this.toFront()
    }
    if (!model.isSelected) {
      graphModel.selectEdgeById(model.id)
    }
    // 边数据
    const edgeData = model?.getData()
    graphModel.eventCenter.emit(EventType.EDGE_CONTEXTMENU, {
      data: edgeData,
      e: ev,
      position,
    })
  }
  /**
   * 不支持重写
   */
  handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation()
    this.startTime = new Date().getTime()
  }
  handleMouseUp = () => {
    const { model } = this.props
    this.mouseUpDrag = model.isDragging
  }
  /**
   * 不支持重写
   */
  handleClick = (e: MouseEvent) => {
    if (!this.startTime) return
    if (this.mouseUpDrag) return // 如果是拖拽，不触发click事件。
    const isRightClick = e.button === 2
    if (isRightClick) return
    // 这里 IE 11不能正确显示
    const isDoubleClick = e.detail === 2
    const { model, graphModel } = this.props
    const edgeData = model?.getData()
    const position = graphModel.getPointByClient({
      x: e.clientX,
      y: e.clientY,
    })
    if (isDoubleClick) {
      const { editConfigModel, textEditElement } = graphModel
      const { id, text, modelType } = model
      // 当前边正在编辑，需要先重置状态才能变更文本框位置
      if (textEditElement && textEditElement.id === id) {
        graphModel.setElementStateById(id, ElementState.DEFAULT)
      }
      // 边文案可编辑状态，才可以进行文案编辑
      if (editConfigModel.edgeTextEdit && text.editable) {
        model.setSelected(false)
        graphModel.setElementStateById(id, ElementState.TEXT_EDIT)
      }
      if (modelType === ModelType.POLYLINE_EDGE) {
        const polylineEdgeModel = model as PolylineEdgeModel
        const {
          canvasOverlayPosition: { x, y },
        } = graphModel.getPointByClient({
          x: e.x,
          y: e.y,
        })
        polylineEdgeModel.dbClickPosition = getClosestPointOfPolyline(
          {
            x,
            y,
          },
          polylineEdgeModel.points,
        )
      }
      graphModel.eventCenter.emit(EventType.EDGE_DBCLICK, {
        data: edgeData,
        e,
        position,
      })
    } else {
      // 单击
      // 边右击也会触发mouseup事件，判断是否有右击，如果有右击则取消点击事件触发
      // 边数据
      graphModel.eventCenter.emit(EventType.ELEMENT_CLICK, {
        data: edgeData,
        e,
        position,
      })
      graphModel.eventCenter.emit(EventType.EDGE_CLICK, {
        data: edgeData,
        e,
        position,
      })
    }
    const { editConfigModel } = graphModel
    graphModel.selectEdgeById(model.id, isMultipleSelect(e, editConfigModel))
    // 静默模式下点击节点不变更节点层级
    if (!editConfigModel.isSilentMode) {
      this.toFront()
    }
  }

  handleFocus = () => {
    const { model, graphModel } = this.props
    graphModel.eventCenter.emit(EventType.EDGE_FOCUS, {
      data: model.getData(),
    })
  }

  handleBlur = () => {
    const { model, graphModel } = this.props
    graphModel.eventCenter.emit(EventType.EDGE_BLUR, {
      data: model.getData(),
    })
  }

  /**
   * @overridable 支持重写, 此方法为获取边的形状，如果需要自定义边的形状，请重写此方法。
   * @example https://docs.logic-flow.cn/docs/#/zh/guide/basic/edge?id=%e5%9f%ba%e4%ba%8e-react-%e7%bb%84%e4%bb%b6%e8%87%aa%e5%ae%9a%e4%b9%89%e8%be%b9
   */
  getEdge(): h.JSX.Element | null {
    return null
  }

  /**
   * @overridable 支持重写, 此方法为边在被选中时将其置顶，如果不需要此功能，可以重写此方法。
   */
  toFront() {
    const { graphModel, model } = this.props
    graphModel.toFront(model.id)
  }

  /**
   * 不建议重写，如果要自定义边的形状，请重写getEdge方法。
   */
  render() {
    const {
      model: { isSelected, isHitable, isShowAdjustPoint },
    } = this.props
    return (
      <g>
        <g
          className={[
            'lf-edge',
            !isHitable && 'pointer-none',
            isSelected && 'lf-edge-selected',
          ]
            .filter(Boolean)
            .join(' ')}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
          onClick={this.handleClick}
          onContextMenu={this.handleContextMenu}
          onMouseOver={this.setHoverOn}
          onMouseEnter={this.setHoverOn}
          onMouseLeave={this.setHoverOff}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
        >
          {this.getShape()}
          {this.getAppend()}
          {this.getText()}
          {this.getArrow()}
        </g>
        {isShowAdjustPoint && isSelected ? this.getAdjustPoints() : ''}
      </g>
    )
  }
}

export default BaseEdge
