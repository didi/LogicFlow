import { Component } from 'preact/compat'
import Dnd from '../behavior/dnd'
import { observer } from '../..'
import GraphModel from '../../model/GraphModel'
import { EventType } from '../../constant'
import { StepDrag, IDragParams } from '../../util'

type IProps = {
  graphModel: GraphModel
  dnd: Dnd
}
type IState = {
  isDragging: boolean
}

@observer
export class CanvasOverlay extends Component<IProps, IState> {
  stepDrag: StepDrag
  stepScrollX = 0
  stepScrollY = 0

  constructor(props: IProps) {
    super()
    const {
      graphModel: { gridSize, eventCenter },
    } = props
    this.stepDrag = new StepDrag({
      onDragging: this.onDragging,
      onDragEnd: this.onDragEnd,
      step: gridSize,
      eventType: 'BLANK',
      isStopPropagation: false,
      eventCenter,
      model: undefined,
    })
    // 当 ctrl、cmd 键被按住的时候，可以放大缩小。
    this.state = {
      isDragging: false,
    }
  }

  // get InjectedProps() {
  //   return this.props as InjectedProps;
  // }
  onDragging = ({ deltaX, deltaY }: IDragParams) => {
    this.setState({
      isDragging: true,
    })
    const {
      graphModel: { transformModel, editConfigModel },
    } = this.props
    if (editConfigModel.stopMoveGraph === true) {
      return
    }
    transformModel.translate(deltaX, deltaY)
  }
  onDragEnd = () => {
    this.setState({
      isDragging: false,
    })
  }
  zoomHandler = (ev: WheelEvent) => {
    const {
      graphModel: { editConfigModel, transformModel, gridSize },
      graphModel,
    } = this.props
    const { deltaX: eX, deltaY: eY } = ev
    const { stopScrollGraph, stopZoomGraph } = editConfigModel
    // 如果没有禁止滚动移动画布, 并且当前触发的时候ctrl键、cmd键没有按住, 那么移动画布
    if (!stopScrollGraph && !ev.ctrlKey && !ev.metaKey) {
      ev.preventDefault()
      this.stepScrollX += eX
      this.stepScrollY += eY
      if (Math.abs(this.stepScrollX) >= gridSize) {
        const remainderX = this.stepScrollX % gridSize
        const moveDistance = this.stepScrollX - remainderX
        transformModel.translate(-moveDistance * transformModel.SCALE_X, 0)
        this.stepScrollX = remainderX
      }
      if (Math.abs(this.stepScrollY) >= gridSize) {
        const remainderY = this.stepScrollY % gridSize
        const moveDistanceY = this.stepScrollY - remainderY
        transformModel.translate(0, -moveDistanceY * transformModel.SCALE_Y)
        this.stepScrollY = remainderY
      }
      return
    }
    // 如果没有禁止缩放画布，那么进行缩放. 在禁止缩放画布后，按住 ctrl、cmd 键也不能缩放了。
    if (!stopZoomGraph) {
      ev.preventDefault()
      const position = graphModel.getPointByClient({
        x: ev.clientX,
        y: ev.clientY,
      })
      const { x, y } = position.canvasOverlayPosition
      transformModel.zoom(ev.deltaY < 0, [x, y])
    }
  }
  clickHandler = (ev: MouseEvent) => {
    // 点击空白处取消节点选中状态, 不包括冒泡过来的事件。
    const target = ev.target as HTMLElement
    if (target.getAttribute('name') === 'canvas-overlay') {
      const { graphModel } = this.props
      const { selectElements } = graphModel
      if (selectElements.size > 0) {
        graphModel.clearSelectElements()
      }
      graphModel.eventCenter.emit(EventType.BLANK_CLICK, { e: ev })
    }
  }
  handleContextMenu = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement
    if (target.getAttribute('name') === 'canvas-overlay') {
      ev.preventDefault()
      const { graphModel } = this.props
      const position = graphModel.getPointByClient({
        x: ev.clientX,
        y: ev.clientY,
      })
      // graphModel.setElementState(ElementState.SHOW_MENU, position.domOverlayPosition);
      graphModel.eventCenter.emit(EventType.BLANK_CONTEXTMENU, {
        e: ev,
        position,
      })
    }
  }
  // 鼠标、触摸板 按下
  mouseDownHandler = (ev: MouseEvent) => {
    const {
      graphModel: {
        eventCenter,
        editConfigModel,
        transformModel: { SCALE_X },
        gridSize,
      },
    } = this.props
    const { adjustEdge, adjustNodePosition, stopMoveGraph } = editConfigModel
    const target = ev.target as HTMLElement
    const isFrozenElement = !adjustEdge && !adjustNodePosition
    if (target.getAttribute('name') === 'canvas-overlay' || isFrozenElement) {
      if (stopMoveGraph !== true) {
        this.stepDrag.setStep(gridSize * SCALE_X)
        this.stepDrag.handleMouseDown(ev)
      } else {
        eventCenter.emit(EventType.BLANK_MOUSEDOWN, { e: ev })
      }
      // 为了处理画布移动的时候，编辑和菜单仍然存在的问题。
      this.clickHandler(ev)
    }
  }

  render() {
    const {
      graphModel: { transformModel },
    } = this.props
    const { transform } = transformModel.getTransformStyle()
    const { children, dnd } = this.props
    const { isDragging } = this.state

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        name="canvas-overlay"
        onWheel={this.zoomHandler}
        onMouseDown={this.mouseDownHandler}
        onContextMenu={this.handleContextMenu}
        className={
          isDragging
            ? 'lf-canvas-overlay lf-dragging'
            : 'lf-canvas-overlay lf-drag-able'
        }
        {...dnd.eventMap()}
      >
        <g transform={transform}>{children}</g>
      </svg>
    )
  }
}

export default CanvasOverlay
