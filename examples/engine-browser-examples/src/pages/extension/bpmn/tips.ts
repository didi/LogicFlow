import LogicFlow from '@logicflow/core'
import NodeData = LogicFlow.NodeData

const nodeWidth = 100
const nodeHeight = 80

export interface ITipsProps {
  lf: LogicFlow
}

export class Tips {
  static pluginName = 'tips'

  private lf: LogicFlow
  tipsWrap: HTMLDivElement
  container?: HTMLElement
  isDragging: boolean = false
  currentData?: NodeData
  isCurrentLeaveId?: string

  constructor({ lf }: ITipsProps) {
    this.lf = lf
    const tipsWrap = document.createElement('div')
    tipsWrap.className = 'custom-tips'
    this.tipsWrap = tipsWrap
  }

  render(lf: LogicFlow, container: HTMLElement) {
    this.container = container
    this.container.appendChild(this.tipsWrap)

    // TODO: 解决 lf 事件监听 callback 函数的类型定义问题（是否需要统一，比如 {data: NodeData | EdgeData | undefined, ev: MouseEvent | xxxDOMEvent}）
    // eslint-disable-next-line
    this.lf.on('node:mouseenter', ({ data }: any) => {
      const model = this.lf.graphModel.getNodeModelById(data.id)
      // 没有model可以认为是fakernode, 也就是正在外部拖入的节点。
      if (!model) return
      this.showTip(data)
    })
    // eslint-disable-next-line
    this.lf.on('node:mouseleave', ({ data }: any) => {
      const model = this.lf.graphModel.getNodeModelById(data.id)
      // 没有model可以认为是fakernode, 也就是正在外部拖入的节点。
      if (!model) return
      this.isCurrentLeaveId = data.id
      setTimeout(() => {
        if (this.isCurrentLeaveId === data.id) {
          this.hideTips()
        }
      }, 200)
    })
    this.lf.on('node:dragstart', () => {
      this.isDragging = true
      this.hideTips()
    })

    // TODO: 解决 callback 函数的类型问题
    // eslint-disable-next-line
    this.lf.on('node:drop', ({ data }: any) => {
      this.isDragging = false
      this.showTip(data)
    })
    this.tipsWrap.addEventListener('click', () => {
      this.currentData && lf.graphModel.deleteNode(this.currentData.id)
      this.hideTips()
    })
    this.tipsWrap.addEventListener('mouseenter', () => {
      this.isCurrentLeaveId = undefined
    })
    this.tipsWrap.addEventListener('mouseleave', () => {
      this.hideTips()
    })
  }

  showTip(data: NodeData) {
    if (this.isDragging) return
    this.currentData = data
    const [x, y] = this.lf.graphModel.transformModel.CanvasPointToHtmlPoint([
      data.x + nodeWidth / 2 + 4,
      data.y - nodeHeight / 2,
    ])
    this.tipsWrap.style.display = 'block'
    this.tipsWrap.style.top = `${y}px`
    this.tipsWrap.style.left = `${x}px`
  }

  hideTips() {
    this.tipsWrap.style.display = 'none'
  }
}
