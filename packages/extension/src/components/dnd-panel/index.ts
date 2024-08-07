import LogicFlow from '@logicflow/core'

export type ShapeItem = {
  type?: string
  text?: string
  icon?: string
  label?: string
  className?: string
  disabled?: boolean
  properties?: Record<string, unknown>
  callback?: (lf: LogicFlow, container?: HTMLElement) => void
  [key: string]: unknown
}

export class DndPanel {
  lf: LogicFlow
  static pluginName = 'dndPanel'

  shapeList?: ShapeItem[]
  panelEl?: HTMLDivElement
  domContainer?: HTMLElement

  constructor({ lf }) {
    this.lf = lf
    this.lf.setPatternItems = (shapeList) => {
      this.setPatternItems(shapeList)
    }
  }

  render(_lf: LogicFlow, domContainer) {
    this.destroy()
    if (!this.shapeList || this.shapeList.length === 0) {
      // 首次render后失败后，后续调用setPatternItems支持渲染
      this.domContainer = domContainer
      return
    }
    this.panelEl = document.createElement('div')
    this.panelEl.className = 'lf-dndpanel'
    this.shapeList.forEach((shapeItem) => {
      this.panelEl?.appendChild(this.createDndItem(shapeItem))
    })
    domContainer.appendChild(this.panelEl)
    this.domContainer = domContainer
  }

  destroy() {
    if (
      this.domContainer &&
      this.panelEl &&
      this.domContainer.contains(this.panelEl)
    ) {
      this.domContainer.removeChild(this.panelEl)
    }
  }

  setPatternItems(shapeList) {
    this.shapeList = shapeList
    // 支持渲染后重新设置拖拽面板
    if (this.domContainer) {
      this.render(this.lf, this.domContainer)
    }
  }

  private createDndItem(shapeItem: ShapeItem): HTMLElement {
    const el = document.createElement('div')
    el.className = shapeItem.className
      ? `lf-dnd-item ${shapeItem.className}`
      : 'lf-dnd-item'
    const shape = document.createElement('div')
    shape.className = 'lf-dnd-shape'
    // if (typeof shapeItem.icon === 'string') {
    if (shapeItem.icon) {
      shape.style.backgroundImage = `url(${shapeItem.icon})`
      // shape.style.backgroundSize = 'contain'
      // } else {
      //   shape.appendChild(shapeItem.icon);
    }
    el.appendChild(shape)
    if (shapeItem.label) {
      const text = document.createElement('div')
      text.innerText = shapeItem.label
      text.className = 'lf-dnd-text'
      el.appendChild(text)
    }
    if (shapeItem.disabled) {
      el.classList.add('disabled')
      // 保留callback的执行，可用于界面提示当前shapeItem的禁用状态
      el.onmousedown = () => {
        if (shapeItem.callback) {
          shapeItem.callback(this.lf, this.domContainer)
        }
      }
      return el
    }
    el.onmousedown = () => {
      if (shapeItem.type) {
        this.lf.dnd.startDrag({
          type: shapeItem.type,
          properties: shapeItem.properties,
          text: shapeItem.text,
        })
      }
      if (shapeItem.callback) {
        shapeItem.callback(this.lf, this.domContainer)
      }
    }
    el.ondblclick = (e) => {
      this.lf.graphModel.eventCenter.emit('dnd:panel-dbclick', {
        e,
        data: shapeItem,
      })
    }
    el.onclick = (e) => {
      this.lf.graphModel.eventCenter.emit('dnd:panel-click', {
        e,
        data: shapeItem,
      })
    }
    el.oncontextmenu = (e) => {
      this.lf.graphModel.eventCenter.emit('dnd:panel-contextmenu', {
        e,
        data: shapeItem,
      })
    }
    return el
  }
}

export default DndPanel
