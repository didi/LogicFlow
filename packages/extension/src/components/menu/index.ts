import LogicFlow from '@logicflow/core'

import GraphData = LogicFlow.GraphData
import NodeData = LogicFlow.NodeData
import EdgeData = LogicFlow.EdgeData
import Position = LogicFlow.Position

type SetType = 'add' | 'reset'

export type MenuItem = {
  text?: string
  className?: string
  icon?: boolean
  callback: (element: any) => void
}

export type MenuConfig = {
  nodeMenu?: MenuItem[] | false
  edgeMenu?: MenuItem[] | false
  graphMenu?: MenuItem[] | false
}

const DefaultNodeMenuKey = 'lf:defaultNodeMenu'
const DefaultEdgeMenuKey = 'lf:defaultEdgeMenu'
const DefaultGraphMenuKey = 'lf:defaultGraphMenu'
const DefaultSelectionMenuKey = 'lf:defaultSelectionMenu'

class Menu {
  lf: LogicFlow
  private __container?: HTMLElement
  private __menuDOM?: HTMLElement
  private menuTypeMap?: Map<string, MenuItem[]>
  private __currentData: EdgeData | NodeData | GraphData | Position | null =
    null
  static pluginName = 'menu'

  constructor({ lf }) {
    this.lf = lf
    const {
      options: { isSilentMode },
    } = lf
    if (!isSilentMode) {
      this.__menuDOM = document.createElement('ul')

      this.menuTypeMap = new Map()
      this.init()
      this.lf.setMenuConfig = (config) => {
        this.setMenuConfig(config)
      }
      this.lf.addMenuConfig = (config) => {
        this.addMenuConfig(config)
      }
      this.lf.setMenuByType = (config) => {
        this.setMenuByType(config)
      }
    }
  }

  /**
   * 初始化设置默认内置菜单栏
   */
  private init() {
    const defaultNodeMenu = [
      {
        text: '删除',
        callback: (node) => {
          this.lf.deleteNode(node.id)
        },
      },
      {
        text: '编辑文本',
        callback: (node) => {
          this.lf.graphModel.editText(node.id)
        },
      },
      {
        text: '复制',
        callback: (node) => {
          this.lf.cloneNode(node.id)
        },
      },
    ]
    this.menuTypeMap?.set(DefaultNodeMenuKey, defaultNodeMenu)

    const defaultEdgeMenu = [
      {
        text: '删除',
        callback: (edge) => {
          this.lf.deleteEdge(edge.id)
        },
      },
      {
        text: '编辑文本',
        callback: (edge) => {
          this.lf.graphModel.editText(edge.id)
        },
      },
    ]
    this.menuTypeMap?.set(DefaultEdgeMenuKey, defaultEdgeMenu)

    this.menuTypeMap?.set(DefaultGraphMenuKey, [])

    const DefaultSelectionMenu = [
      {
        text: '删除',
        callback: (elements) => {
          this.lf.clearSelectElements()
          elements.edges.forEach((edge) => this.lf.deleteEdge(edge.id))
          elements.nodes.forEach((node) => this.lf.deleteNode(node.id))
        },
      },
    ]
    this.menuTypeMap?.set(DefaultSelectionMenuKey, DefaultSelectionMenu)
  }

  render(lf: LogicFlow, container: HTMLElement) {
    if (lf.options.isSilentMode) return
    this.__container = container
    this.__currentData = null // 当前展示的菜单所属元素的model数据
    if (this.__menuDOM) {
      this.__menuDOM.className = 'lf-menu'
      container.appendChild(this.__menuDOM)
      // 将选项的click事件委托至menu容器
      // 在捕获阶段拦截并执行
      this.__menuDOM.addEventListener(
        'click',
        (event) => {
          event.stopPropagation()
          let target = event.target as HTMLElement
          // 菜单有多层dom，需要精确获取菜单项所对应的dom
          // 除菜单项dom外，应考虑两种情况
          // 1. 菜单项的子元素 2. 菜单外层容器
          while (
            Array.from(target.classList).indexOf('lf-menu-item') === -1 &&
            Array.from(target.classList).indexOf('lf-menu') === -1
          ) {
            target = target?.parentElement as HTMLElement
          }
          if (Array.from(target.classList).indexOf('lf-menu-item') > -1) {
            // 如果点击区域在菜单项内
            ;(target as any).onclickCallback(this.__currentData)
            // 点击后隐藏menu
            if (this.__menuDOM) {
              this.__menuDOM.style.display = 'none'
            }
            this.__currentData = null
          } else {
            // 如果点击区域不在菜单项内
            console.warn('点击区域不在菜单项内，请检查代码！')
          }
        },
        true,
      )
    }
    // 通过事件控制菜单的显示和隐藏
    this.lf.on('node:contextmenu', ({ data, position, e }) => {
      const {
        domOverlayPosition: { x, y },
      } = position
      const { id } = data
      const model = this.lf.graphModel.getNodeModelById(id)

      if (!model) return
      let menuList: any = []
      const typeMenus = this.menuTypeMap?.get(model.type)
      // 1.如果单个节点自定义了菜单，以单个节点自定义为准
      if (model && model.menu && Array.isArray(model.menu)) {
        menuList = model.menu
      } else if (typeMenus) {
        // 2.如果当前节点类型定义了菜单，再取该配置
        menuList = typeMenus
      } else {
        // 3.最后取全局默认
        menuList = this.menuTypeMap?.get(DefaultNodeMenuKey)
      }
      this.__currentData = data
      this.showMenu(x, y, menuList, {
        width: model.width,
        height: model.height,
        clientX: e.clientX,
        clientY: e.clientY,
      })
    })
    this.lf.on('edge:contextmenu', ({ data, position, e }) => {
      const {
        domOverlayPosition: { x, y },
      } = position
      const { id } = data
      const model = this.lf.graphModel.getEdgeModelById(id)
      if (!model) return
      let menuList: any = []
      const typeMenus = this.menuTypeMap?.get(model.type)
      // 菜单优先级： model.menu > typeMenus > defaultEdgeMenu，注释同上节点
      if (model && model.menu && Array.isArray(model.menu)) {
        menuList = model.menu
      } else if (typeMenus) {
        menuList = typeMenus
      } else {
        menuList = this.menuTypeMap?.get(DefaultEdgeMenuKey) ?? []
      }
      this.__currentData = data
      this.showMenu(x, y, menuList, {
        width: model.width,
        height: model.height,
        clientX: e.clientX,
        clientY: e.clientY,
      })
    })
    this.lf.on('blank:contextmenu', ({ position }) => {
      const menuList = this.menuTypeMap?.get(DefaultGraphMenuKey) ?? []
      const {
        domOverlayPosition: { x, y },
      } = position
      this.__currentData = { ...position.canvasOverlayPosition }
      this.showMenu(x, y, menuList)
    })
    this.lf.on('selection:contextmenu', ({ data, position }) => {
      const menuList = this.menuTypeMap?.get(DefaultSelectionMenuKey)
      const {
        domOverlayPosition: { x, y },
      } = position
      this.__currentData = data
      this.showMenu(x, y, menuList)
    })

    this.lf.on('node:mousedown', () => {
      this.__menuDOM!.style.display = 'none'
    })
    this.lf.on('edge:click', () => {
      this.__menuDOM!.style.display = 'none'
    })
    this.lf.on('blank:click', () => {
      this.__menuDOM!.style.display = 'none'
    })
  }

  destroy() {
    if (this.__menuDOM) {
      this?.__container?.removeChild(this.__menuDOM)
      this.__menuDOM = undefined
    }
  }

  private showMenu(x, y, menuList, options?) {
    if (!menuList || !menuList.length) return
    const { __menuDOM: menu } = this
    if (menu) {
      // 菜单容器不变，需要先清空内部的菜单项
      menu.innerHTML = ''
      menu.append(...this.__getMenuDom(menuList))
      // 菜单中没有项，不显示
      if (!menu.children.length) return
      menu.style.display = 'block'
      if (!options) {
        menu.style.top = `${y}px`
        menu.style.left = `${x}px`
        return
      }

      // https://github.com/didi/LogicFlow/issues/1019
      // 根据边界判断菜单的left 和 top
      const { width, height, clientX, clientY } = options
      const { graphModel } = this.lf

      const menuWidth = menu.offsetWidth
      let menuIsRightShow = true
      // ======先进行可视屏幕范围的判断=======
      // 浏览器窗口可视区域兼容性写法
      // eslint-disable-next-line max-len
      const windowMaxX =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth
      let rightDistance = windowMaxX - clientX
      // ======先进行可视屏幕范围的判断=======
      // ========再进行画布范围的判断========
      const graphRect = graphModel.rootEl.getBoundingClientRect()
      const graphMaxX = graphRect.left + graphRect.width
      if (graphMaxX < windowMaxX) {
        // 画布右边小于可视屏幕范围的最右边，取画布右边作为极限值，计算出当前触摸点距离右边极限值的距离
        rightDistance = graphMaxX - clientX
      }
      // ========再进行画布范围的判断========
      // 根据当前触摸点距离右边的距离 跟 menuWidth进行比较
      if (rightDistance < menuWidth) {
        // 空间不足够，显示在左边
        menuIsRightShow = false
      }
      if (menuIsRightShow) {
        menu.style.left = `${x}px`
      } else {
        menu.style.left = `${x - width}px`
      }

      const menuHeight = menu.offsetHeight
      let menuIsBottomShow = true
      // ======先进行可视屏幕范围的判断=======
      // 浏览器窗口可视区域兼容性写法
      // eslint-disable-next-line max-len
      const windowMaxY =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight
      let bottomDistance = windowMaxY - clientY
      // ======先进行可视屏幕范围的判断=======
      // ========再进行画布范围的判断========
      const graphMaxY = graphRect.top + graphRect.height
      if (graphMaxY < windowMaxY) {
        // 画布底部小于可视屏幕范围的最底边，取画布底部作为极限值，计算出当前触摸点距离底部极限值的距离
        bottomDistance = graphMaxY - clientY
      }
      // ========再进行画布范围的判断========
      if (bottomDistance < menuHeight) {
        // 如果下边距离太小，无法显示menu，则向上显示
        menuIsBottomShow = false
      }
      if (menuIsBottomShow) {
        menu.style.top = `${y}px`
      } else {
        menu.style.top = `${y - height}px`
      }
    }
  }

  /**
   * 设置指定类型元素的菜单
   */
  setMenuByType({ type, menu }: { type: string; menu: MenuItem[] }) {
    if (!type || !menu) {
      return
    }
    this.menuTypeMap?.set(type, menu)
  }

  /**
   * 获取 Menu DOM
   * @param list 菜单项
   * @return 菜单项 DOM
   */
  private __getMenuDom(list): HTMLElement[] {
    const menuList: any = []
    list &&
      list.length > 0 &&
      list.forEach((item) => {
        const element = document.createElement('li')
        if (item.className) {
          element.className = `lf-menu-item ${item.className}`
        } else {
          element.className = 'lf-menu-item'
        }
        if (item.icon === true) {
          const icon = document.createElement('span')
          icon.className = 'lf-menu-item-icon'
          element.appendChild(icon)
        }
        const text = document.createElement('span')
        text.className = 'lf-menu-item-text'
        if (item.text) {
          text.innerText = item.text
        }
        element.appendChild(text)
        ;(element as any).onclickCallback = item.callback
        menuList.push(element)
      })
    return menuList
  }

  // 复写菜单
  setMenuConfig(config: MenuConfig) {
    if (!config) {
      return
    }
    // node
    config.nodeMenu !== undefined &&
      this.menuTypeMap?.set(
        DefaultNodeMenuKey,
        config.nodeMenu ? config.nodeMenu : [],
      )
    // edge
    config.edgeMenu !== undefined &&
      this.menuTypeMap?.set(
        DefaultEdgeMenuKey,
        config.edgeMenu ? config.edgeMenu : [],
      )
    // graph
    config.graphMenu !== undefined &&
      this.menuTypeMap?.set(
        DefaultGraphMenuKey,
        config.graphMenu ? config.graphMenu : [],
      )
  }

  // 在默认菜单后面追加菜单项
  addMenuConfig(config: MenuConfig) {
    if (!config) {
      return
    }
    // 追加项时，只支持数组类型，对false不做操作
    if (Array.isArray(config.nodeMenu)) {
      const menuList = this.menuTypeMap?.get(DefaultNodeMenuKey) ?? []
      this.menuTypeMap?.set(
        DefaultNodeMenuKey,
        menuList.concat(config.nodeMenu),
      )
    }
    if (Array.isArray(config.edgeMenu)) {
      const menuList = this.menuTypeMap?.get(DefaultEdgeMenuKey) ?? []
      this.menuTypeMap?.set(
        DefaultEdgeMenuKey,
        menuList.concat(config.edgeMenu),
      )
    }
    if (Array.isArray(config.graphMenu)) {
      const menuList = this.menuTypeMap?.get(DefaultGraphMenuKey) ?? []
      this.menuTypeMap?.set(
        DefaultGraphMenuKey,
        menuList.concat(config.graphMenu),
      )
    }
  }

  /**
   * @deprecated
   * 复写添加
   */
  changeMenuItem(type: SetType, config: MenuConfig) {
    if (type === 'add') {
      this.addMenuConfig(config)
    } else if (type === 'reset') {
      this.setMenuConfig(config)
    } else {
      throw new Error(
        "The first parameter of changeMenuConfig should be 'add' or 'reset'",
      )
    }
  }
}

export default Menu

export { Menu }
