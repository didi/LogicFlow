import LogicFlow from '@logicflow/core'
import Position = LogicFlow.Position

interface MiniMapStaticOption {
  width?: number
  height?: number
  isShowHeader?: boolean
  isShowCloseIcon?: boolean
  leftPosition?: number
  rightPosition?: number
  topPosition?: number
  bottomPosition?: number
  headerTitle?: string
}

type Bounds = Record<'left' | 'top' | 'bottom' | 'right', number>

export class MiniMap {
  static pluginName = 'miniMap'

  private lf: LogicFlow
  private LFCtor: LogicFlow.LogicFlowConstructor
  private container?: HTMLElement
  private miniMapWrap!: HTMLDivElement
  private miniMapContainer?: HTMLDivElement
  private lfMap!: LogicFlow
  private viewport!: HTMLDivElement
  private width = 200
  private height = 150
  private scale = 1
  private translateX = 0
  private translateY = 0
  private bounds: Bounds
  private elementAreaBounds: Bounds
  private viewPortBounds: Bounds
  private leftPosition?: number
  private topPosition?: number
  private rightPosition?: number
  private bottomPosition?: number
  private viewPortTop = 0
  private viewPortLeft = 0
  private startPosition?: Position
  private viewPortWidth = 150
  private viewPortHeight = 75
  private isShow = false
  private isShowHeader = false
  private isShowCloseIcon = false
  private headerTitle = '导航'
  private disabledPlugins = ['miniMap', 'control', 'selectionSelect']

  constructor({ lf, LogicFlow, options }: LogicFlow.ExtensionProps) {
    this.lf = lf
    this.LFCtor = LogicFlow
    if (options && options.MiniMap) {
      this.setOption(options)
    }
    this.viewPortWidth = lf.graphModel.width
    this.viewPortHeight = lf.graphModel.height
    const boundsInit: Bounds = {
      left: 0,
      right: this.viewPortWidth,
      top: 0,
      bottom: this.viewPortHeight,
    }
    this.bounds = boundsInit
    this.elementAreaBounds = boundsInit
    this.viewPortBounds = boundsInit
    this.initMiniMap()
  }

  render(_: LogicFlow, container: HTMLElement) {
    this.container = container
    this.lf.on('history:change', () => {
      if (this.isShow) {
        this.setView()
      }
    })
    this.lf.on('graph:transform', () => {
      if (this.isShow) {
        this.setView(false)
      }
    })
  }

  /**
   * 显示mini map
   */
  show = (leftPosition?: number, topPosition?: number) => {
    if (!this.isShow) {
      this.createMiniMap(leftPosition, topPosition)
      this.setView()
    }
    this.isShow = true
  }
  /**
   * 隐藏mini map
   */
  hide = () => {
    if (this.isShow) {
      this.removeMiniMap()
    }
    this.isShow = false
  }
  /**
   * 重置画布的缩放和平移
   */
  reset = () => {
    this.lf.resetTranslate()
    this.lf.resetZoom()
  }

  private setOption(options: Record<string, unknown>) {
    const {
      width = 150,
      height = 220,
      isShowHeader = false,
      isShowCloseIcon = false,
      leftPosition = 0,
      topPosition = 0,
      rightPosition,
      bottomPosition,
      headerTitle = '导航',
    } = options.MiniMap as MiniMapStaticOption
    this.width = width
    this.height = height
    this.isShowHeader = isShowHeader
    this.isShowCloseIcon = isShowCloseIcon
    this.leftPosition = leftPosition
    this.topPosition = topPosition
    this.rightPosition = rightPosition
    this.bottomPosition = bottomPosition
    this.headerTitle = headerTitle
  }

  private initMiniMap() {
    const miniMapWrap = document.createElement('div')
    miniMapWrap.className = 'lf-mini-map-graph'
    miniMapWrap.style.width = `${this.width}px`
    miniMapWrap.style.height = `${this.height}px`
    this.lfMap = new this.LFCtor({
      container: miniMapWrap,
      grid: false,
      isSilentMode: true,
      stopZoomGraph: true,
      stopScrollGraph: true,
      stopMoveGraph: false,
      history: false,
      snapline: false,
      disabledPlugins: this.disabledPlugins,
    })
    // minimap中禁用adapter。
    // this.lfMap.adapterIn = (a) => a
    // this.lfMap.adapterOut = (a) => a
    this.miniMapWrap = miniMapWrap
    this.createViewPort()
    miniMapWrap.addEventListener('click', this.mapClick)
  }

  private createMiniMap(left?: number, top?: number) {
    const miniMapContainer = document.createElement('div')
    miniMapContainer.appendChild(this.miniMapWrap)
    if (typeof left !== 'undefined' || typeof top !== 'undefined') {
      miniMapContainer.style.left = `${left || 0}px`
      miniMapContainer.style.top = `${top || 0}px`
    } else {
      if (typeof this.rightPosition !== 'undefined') {
        miniMapContainer.style.right = `${this.rightPosition}px`
      } else if (typeof this.leftPosition !== 'undefined') {
        miniMapContainer.style.left = `${this.leftPosition}px`
      }
      if (typeof this.bottomPosition !== 'undefined') {
        miniMapContainer.style.bottom = `${this.bottomPosition}px`
      } else if (typeof this.topPosition !== 'undefined') {
        miniMapContainer.style.top = `${this.topPosition}px`
      }
    }
    miniMapContainer.style.position = 'absolute'
    miniMapContainer.className = 'lf-mini-map'
    if (!this.isShowCloseIcon) {
      miniMapContainer.classList.add('lf-mini-map-no-close-icon')
    }
    if (!this.isShowHeader) {
      miniMapContainer.classList.add('lf-mini-map-no-header')
    }
    this.container?.appendChild(miniMapContainer)
    this.miniMapWrap.appendChild(this.viewport)

    const header = document.createElement('div')
    header.className = 'lf-mini-map-header'
    header.innerText = this.headerTitle
    miniMapContainer.appendChild(header)

    const close = document.createElement('span')
    close.className = 'lf-mini-map-close'
    close.addEventListener('click', this.hide)
    miniMapContainer.appendChild(close)
    this.miniMapContainer = miniMapContainer
  }

  private removeMiniMap() {
    if (this.miniMapContainer) {
      this.container?.removeChild(this.miniMapContainer)
    }
  }

  /**
   * 获取小地图的边界范围
   * @param data
   */
  private updateBounds(data?: LogicFlow.GraphData) {
    if (data) {
      this.updateElementAreaBounds(data)
    }
    this.updateViewPortBounds()
    this.bounds = {
      left: Math.min(this.elementAreaBounds.left, this.viewPortBounds.left),
      right: Math.max(this.elementAreaBounds.right, this.viewPortBounds.right),
      top: Math.min(this.elementAreaBounds.top, this.viewPortBounds.top),
      bottom: Math.max(
        this.elementAreaBounds.bottom,
        this.viewPortBounds.bottom,
      ),
    }
  }

  /**
   * 计算所有图形一起，占领的区域范围。
   * @param data
   */
  private updateElementAreaBounds(data: LogicFlow.GraphData) {
    const elementAreaBounds: Bounds = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    }
    const { nodes } = data
    if (nodes && nodes.length > 0) {
      // TODO: 后续能获取节点高宽信息后，需要更新这里的计算方式
      nodes.forEach((node) => {
        const { x, y } = node
        const width = (node.width as number) ?? 200
        const height = (node.height as number) ?? 200

        const nodeLeft = x - width / 2
        const nodeRight = x + width / 2
        const nodeTop = y - height / 2
        const nodeBottom = y + height / 2

        elementAreaBounds.left = Math.min(nodeLeft, elementAreaBounds.left)
        elementAreaBounds.right = Math.max(nodeRight, elementAreaBounds.right)
        elementAreaBounds.top = Math.min(nodeTop, elementAreaBounds.top)
        elementAreaBounds.bottom = Math.max(
          nodeBottom,
          elementAreaBounds.bottom,
        )
      })
    }
    this.elementAreaBounds = elementAreaBounds
  }

  /**
   * 获取视口范围
   */
  private updateViewPortBounds() {
    const { TRANSLATE_X, TRANSLATE_Y, SCALE_X, SCALE_Y } =
      this.lf.getTransform()
    const { width, height } = this.lf.graphModel

    this.viewPortBounds = {
      left: -TRANSLATE_X / SCALE_X,
      right: (-TRANSLATE_X + width) / SCALE_X,
      top: -TRANSLATE_Y / SCALE_Y,
      bottom: (-TRANSLATE_Y + height) / SCALE_Y,
    }
  }

  /**
   * 删除部分内容以简化渲染，包括边与节点文本
   */
  private resetData(data: LogicFlow.GraphData) {
    const { nodes } = data
    nodes.forEach((node) => {
      // 删除节点文本
      node.text = undefined
    })
    return {
      nodes,
      // 不渲染边
      edges: [],
    }
  }

  /**
   * MiniMap视图重绘
   * @param reRender 是否重新渲染画布元素
   */
  private setView(reRender: boolean = true) {
    if (reRender) {
      // 1. 获取到图中所有的节点中的位置
      const graphData = this.lf.getGraphRawData()
      const data = this.resetData(graphData)
      // 由于随时都会有新节点注册进来，需要同步将注册的
      const { viewMap }: { viewMap: Map<string, any> } = this.lf
      const { modelMap }: { modelMap: Map<string, any> } = this.lf.graphModel
      const { viewMap: minimapViewMap }: { viewMap: Map<string, any> } =
        this.lfMap

      for (const key of viewMap.keys()) {
        if (!minimapViewMap.has(key)) {
          this.lfMap.setView(key, viewMap.get(key))
          this.lfMap.graphModel.modelMap.set(key, modelMap.get(key))
        }
      }

      // 2. 将数据渲染到minimap画布上
      this.lfMap.render(data)

      // 3. 计算出所有节点与当前视口构成的边界。
      this.updateBounds(data)
    } else {
      this.updateBounds()
    }

    // 4. 计算minimap画布相对minimap面板的缩放比例，并移动minimap的视图保证元素全部可见且整体居中。
    const { left, top, right, bottom } = this.bounds
    const realWidth = right - left
    const realHeight = bottom - top
    const realWidthScale = this.width / realWidth
    const realHeightScale = this.height / realHeight
    const scale = Math.min(realWidthScale, realHeightScale)
    this.scale = scale

    const translateX = left - (this.width / scale - realWidth) / 2
    const translateY = top - (this.height / scale - realHeight) / 2
    this.lfMap.graphModel.transformModel.translate(
      -translateX + this.translateX,
      -translateY + this.translateY,
    )
    this.translateX = translateX
    this.translateY = translateY

    // 5. 取比例最小的值，将渲染的画布缩小对应比例。
    if (this.miniMapWrap.firstChild) {
      const innerStyle = (this.miniMapWrap.firstChild as HTMLElement).style
      innerStyle.pointerEvents = 'none'
      innerStyle.transform = `matrix(${scale}, 0, 0, ${scale}, 0, 0)`
      innerStyle.transformOrigin = 'left top'
      innerStyle.height = `${this.height / scale}px`
      innerStyle.width = `${this.width / scale}px`
      this.updateViewPort()
    }
  }

  /**
   * 更新预览视窗位置
   */
  private updateViewPort() {
    const viewStyle = this.viewport.style
    const { TRANSLATE_X, TRANSLATE_Y, SCALE_X, SCALE_Y } =
      this.lf.getTransform()
    const { width, height } = this.lf.graphModel

    this.viewPortLeft = -TRANSLATE_X / SCALE_X
    this.viewPortTop = -TRANSLATE_Y / SCALE_Y
    this.viewPortWidth = (width / SCALE_X) * this.scale
    this.viewPortHeight = (height / SCALE_Y) * this.scale

    viewStyle.width = `${this.viewPortWidth}px`
    viewStyle.height = `${this.viewPortHeight}px`
    viewStyle.left = `${(this.viewPortLeft - this.translateX) * this.scale}px`
    viewStyle.top = `${(this.viewPortTop - this.translateY) * this.scale}px`
  }

  // 创建预览视窗元素
  private createViewPort() {
    const div = document.createElement('div')
    div.className = 'lf-minimap-viewport'
    div.addEventListener('mousedown', this.startDrag)
    // 禁止预览视窗的点击事件冒泡
    div.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation()
    })
    this.viewport = div
  }

  private startDrag = (e: MouseEvent) => {
    document.addEventListener('mousemove', this.drag)
    document.addEventListener('mouseup', this.drop)
    const { x, y } = e
    this.startPosition = { x, y }
  }
  /**
   * 移动预览视窗
   * @param top 画布视口左上角的坐标 y
   * @param left 画布视口左上角的坐标 x
   */
  private moveViewport = (top: number, left: number) => {
    const viewStyle = this.viewport.style
    this.viewPortTop = top
    this.viewPortLeft = left
    viewStyle.top = `${(this.viewPortTop - this.translateY) * this.scale}px`
    viewStyle.left = `${(this.viewPortLeft - this.translateX) * this.scale}px`
  }
  private drag = (e: MouseEvent) => {
    const { x, y } = e
    const translateX = (x - (this.startPosition?.x ?? 0)) / this.scale
    const translateY = (y - (this.startPosition?.y ?? 0)) / this.scale
    const left = this.viewPortLeft + translateX
    const top = this.viewPortTop + translateY
    this.moveViewport(top, left)
    this.startPosition = { x, y }
    const centerX = this.viewPortLeft + this.viewPortWidth / this.scale / 2
    const centerY = this.viewPortTop + this.viewPortHeight / this.scale / 2
    this.lf.focusOn({
      coordinate: {
        x: centerX,
        y: centerY,
      },
    })
  }
  private drop = () => {
    document.removeEventListener('mousemove', this.drag)
    document.removeEventListener('mouseup', this.drop)
  }
  private mapClick = (e: MouseEvent) => {
    const { offsetX, offsetY } = e
    const centerX = this.translateX + offsetX / this.scale
    const centerY = this.translateY + offsetY / this.scale
    this.lf.focusOn({
      coordinate: {
        x: centerX,
        y: centerY,
      },
    })
  }
}

export default MiniMap
