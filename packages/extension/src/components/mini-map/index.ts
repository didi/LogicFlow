import LogicFlow from '@logicflow/core'

import Position = LogicFlow.Position
import MiniMapOption = MiniMap.MiniMapOption
import MiniMapPosition = MiniMap.MiniMapPosition

export namespace MiniMap {
  export type MiniMapOption = Partial<{
    /**
     * 小地图中画布的宽度
     */
    width: number
    /**
     * 小地图中画布的高度
     */
    height: number
    /**
     * 在小地图的画布中是否渲染边
     */
    showEdge: boolean
    /**
     * 是否显示小地图的标题栏
     */
    isShowHeader: boolean
    /**
     * 是否显示关闭按钮
     */
    isShowCloseIcon: boolean
    /**
     * 小地图标题栏的文本内容
     */
    headerTitle: string
    /**
     * 小地图与画布左边界的左边距，优先级高于`rightPosition`
     */
    leftPosition: number
    /**
     * 小地图与画布右边界的右边距，优先级低于`leftPosition`
     */
    rightPosition: number
    /**
     * 小地图与画布上边界的上边距，优先级高于`bottomPosition`
     */
    topPosition: number
    /**
     * 小地图与画布下边界的下边距，优先级低于`topPosition`
     */
    bottomPosition: number
  }>

  export type AbsolutePosition = Partial<
    Record<'left' | 'right' | 'top' | 'bottom', number>
  >

  export type MiniMapPosition =
    | 'left-top' // 表示迷你地图位于容器的左上角
    | 'right-top' // 表示迷你地图位于容器的右上角
    | 'left-bottom' // 表示迷你地图位于容器的右上角
    | 'right-bottom' // 表示迷你地图位于容器的右下角。
    | AbsolutePosition // 自定义小地图在画布上的位置
}

type Bounds = Record<'left' | 'top' | 'bottom' | 'right', number>

export class MiniMap {
  static pluginName = 'miniMap'

  /**
   * 主画布的LogicFlow实例
   */
  private lf: LogicFlow
  /**
   * LogicFlow构造函数
   */
  private LFCtor: LogicFlow.LogicFlowConstructor
  /**
   * 小地图中画布的LogicFlow实例
   */
  private lfMap!: LogicFlow

  /**
   * lf的工具层容器，用于挂载小地图
   */
  private container?: HTMLElement
  /**
   * 小地图的容器
   */
  private miniMapContainer?: HTMLDivElement
  /**
   * 小地图的画布容器
   */
  private miniMapWrap!: HTMLDivElement
  /**
   * 小地图的预览视窗
   */
  private viewport!: HTMLDivElement

  /**
   * 小地图中画布容器的宽度
   */
  private width = 200
  /**
   * 小地图中画布容器的高度
   */
  private height = 150
  /**
   * 小地图中画布的缩放比例
   */
  private scale = 1
  /**
   * 小地图中画布的水平位移
   */
  private translateX = 0
  /**
   * 小地图中画布的垂直位移
   */
  private translateY = 0
  /**
   * 在小地图的画布中是否渲染边
   */
  private showEdge = false

  /**
   * 小地图中画布的区域范围
   */
  private bounds: Bounds
  /**
   * 所有元素占领的区域范围
   */
  private elementAreaBounds: Bounds
  /**
   * 主画布视口的区域范围
   */
  private viewPortBounds: Bounds

  // 小地图相对画布的绝对定位
  private leftPosition?: number
  private topPosition?: number
  private rightPosition?: number
  private bottomPosition?: number

  /**
   * 预览视窗左上角在主画布的y坐标
   */
  private viewPortTop = 0
  /**
   * 预览视窗左上角在主画布的x坐标
   */
  private viewPortLeft = 0
  // 预览视窗的宽高
  private viewPortWidth = 150
  private viewPortHeight = 75

  /**
   * 拖拽预览视窗时，记录起始点的位置
   */
  private startPosition!: Position

  /**
   * 是否显示小地图
   */
  private isShow = false
  /**
   * 是否显示小地图的标题栏
   */
  private isShowHeader = false
  /**
   * 是否显示关闭按钮
   */
  private isShowCloseIcon = false
  /**
   * 小地图标题栏的文本内容
   */
  private headerTitle = '导航'
  /**
   * 小地图的logicFlow实例需要禁用的插件
   */
  private disabledPlugins = ['miniMap', 'control', 'selectionSelect']

  constructor({ lf, LogicFlow, options }: LogicFlow.IExtensionProps) {
    this.lf = lf
    this.LFCtor = LogicFlow
    if (options) {
      this.setOption(options as MiniMapOption)
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
    lf.on('graph:resize', this.onGraphResize)
  }

  onGraphResize = () => {
    this.updateViewPortBounds()
    if (this.isShow) {
      this.updateViewPort()
    }
  }

  render = (_: LogicFlow, container: HTMLElement) => {
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
   * 显示小地图
   * @param left 相对画布的左边距
   * @param top 相对画布的上边距
   */
  public show = (left?: number, top?: number) => {
    if (!this.isShow) {
      this.createMiniMap(left, top)
      this.setView()
    }
    this.isShow = true
  }
  /**
   * 隐藏小地图
   */
  public hide = () => {
    if (this.isShow) {
      this.removeMiniMap()
      this.lf.emit('miniMap:close', {})
    }
    this.isShow = false
  }
  /**
   * 更新小地图在画布中的位置
   * @param {MiniMapPosition} position
   */
  public updatePosition = (position: MiniMapPosition) => {
    if (typeof position === 'object') {
      if (position.left !== undefined || position.right !== undefined) {
        this.leftPosition = position.left
        this.rightPosition = position.right
      }
      if (position.top !== undefined || position.bottom !== undefined) {
        this.topPosition = position.top
        this.bottomPosition = position.bottom
      }
    } else {
      switch (position) {
        case 'left-top':
          this.leftPosition = 0
          this.rightPosition = undefined
          this.topPosition = 0
          this.bottomPosition = undefined
          break
        case 'right-top':
          this.leftPosition = undefined
          this.rightPosition = 0
          this.topPosition = 0
          this.bottomPosition = undefined
          break
        case 'left-bottom':
          this.leftPosition = 0
          this.rightPosition = undefined
          this.topPosition = undefined
          this.bottomPosition = 0
          break
        case 'right-bottom':
          this.leftPosition = undefined
          this.rightPosition = 0
          this.topPosition = undefined
          this.bottomPosition = 0
          break
      }
    }
    this.updateMiniMapPosition()
  }
  /**
   * 重置主画布的缩放和平移
   */
  public reset = () => {
    this.lf.resetTranslate()
    this.lf.resetZoom()
  }
  /**
   * 设置小地图的画布中是否显示边
   * @param {boolean} showEdge
   */
  public setShowEdge = (showEdge: boolean) => {
    if (this.showEdge !== showEdge) {
      this.showEdge = showEdge
      this.setView()
    }
  }

  /**
   * 初始化小地图的配置
   * @param options
   */
  private setOption(options: MiniMapOption) {
    const {
      width = 150,
      height = 220,
      showEdge = false,
      isShowHeader = false,
      isShowCloseIcon = false,
      leftPosition,
      topPosition,
      rightPosition = 0,
      bottomPosition = 0,
      headerTitle = '导航',
    } = options
    this.width = width
    this.height = height
    this.showEdge = showEdge
    this.isShowHeader = isShowHeader
    this.isShowCloseIcon = isShowCloseIcon
    this.leftPosition = leftPosition
    this.rightPosition = leftPosition !== undefined ? undefined : rightPosition
    this.topPosition = topPosition
    this.bottomPosition = topPosition !== undefined ? undefined : bottomPosition
    this.headerTitle = headerTitle
  }

  /**
   * 初始化小地图的 LogicFlow 实例
   */
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
      // 禁用画布移动会导致 transformModel.translate 无效，所以这里不禁用
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
    this.miniMapContainer = miniMapContainer
    miniMapContainer.appendChild(this.miniMapWrap)

    miniMapContainer.style.position = 'absolute'
    if (left !== undefined || top !== undefined) {
      this.leftPosition = left || 0
      this.topPosition = top || 0
      this.rightPosition = undefined
      this.bottomPosition = undefined
    }
    this.updateMiniMapPosition()

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
  }

  private updateMiniMapPosition() {
    if (this.miniMapContainer) {
      const { style } = this.miniMapContainer

      if (this.rightPosition !== undefined) {
        style.right = `${this.rightPosition}px`
        style.left = ''
      } else {
        style.left = `${this.leftPosition}px`
        style.right = ''
      }

      if (this.bottomPosition !== undefined) {
        style.bottom = `${this.bottomPosition}px`
        style.top = ''
      } else {
        style.top = `${this.topPosition}px`
        style.bottom = ''
      }
    }
  }

  private removeMiniMap() {
    if (this.miniMapContainer) {
      this.container?.removeChild(this.miniMapContainer)
    }
  }

  /**
   * 更新小地图的区域范围
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
  private resetData(data: LogicFlow.GraphData): LogicFlow.GraphData {
    const { nodes, edges } = data
    nodes.forEach((node) => {
      // 删除节点文本
      node.text = undefined
    })
    if (this.showEdge) {
      edges.forEach((edge) => {
        // 删除边上的文本
        edge.text = undefined
      })
    }
    return {
      nodes,
      // 是否渲染边
      edges: this.showEdge ? edges : [],
    }
  }

  /**
   * MiniMap视图重绘
   * @param reRender 是否重新渲染画布元素
   */
  // TODO: 确定 render 函数是否为增量渲染，如果是则不需要 reRender 参数做限制
  private setView(reRender: boolean = true) {
    if (reRender) {
      // 1. 获取到图中所有的节点中的位置
      const graphData = this.lf.getGraphRawData()
      const data = this.resetData(graphData)
      // 由于随时都会有新节点注册进来，需要同步将注册的
      const { viewMap } = this.lf
      const { modelMap } = this.lf.graphModel
      const { viewMap: minimapViewMap } = this.lfMap

      for (const key of viewMap.keys()) {
        if (!minimapViewMap.has(key)) {
          this.lfMap.register({
            type: key,
            view: viewMap.get(key)!,
            model: modelMap.get(key)!,
          })
        }
      }

      // 2. 将数据渲染到小地图的画布上
      this.lfMap.render(data)

      // 3. 更新所有节点与当前视口构成的区域范围
      this.updateBounds(data)
    } else {
      this.updateBounds()
    }

    // 4. 计算小地图画布相对小地图容器的缩放比例，并移动小地图的视图保证元素全部可见且整体居中。
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

    // 5. 将小地图的画布缩放对应的比例。
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
   * 更新预览视窗的位置
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

  /**
   * 创建预览视窗元素
   */
  private createViewPort() {
    const div = document.createElement('div')
    div.className = 'lf-minimap-viewport'

    // 拖拽预览视窗，主画布视口跟随移动
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
   * 拖拽预览视窗过程中，更新主画布视口
   */
  private drag = (e: MouseEvent) => {
    const { x, y } = e
    const translateX = (x - this.startPosition.x) / this.scale
    const translateY = (y - this.startPosition.y) / this.scale
    const centerX =
      this.viewPortLeft + translateX + this.viewPortWidth / this.scale / 2
    const centerY =
      this.viewPortTop + translateY + this.viewPortHeight / this.scale / 2

    // 每移动一次预览视窗都需要更新拖拽的起始点
    this.startPosition = { x, y }
    this.lf.focusOn({
      coordinate: {
        x: centerX,
        y: centerY,
      },
    })
  }

  /**
   * 拖拽预览视窗结束，移除拖拽事件
   */
  private drop = () => {
    document.removeEventListener('mousemove', this.drag)
    document.removeEventListener('mouseup', this.drop)
  }

  /**
   * 点击小地图中非预览视窗的区域时，移动主画布视口聚焦于点击位置
   */
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
  destroy() {
    this.lf.off('graph:resize', this.onGraphResize)
  }
}

export default MiniMap
