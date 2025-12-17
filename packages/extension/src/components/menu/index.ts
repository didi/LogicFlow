import LogicFlow, { EditConfigModel } from '@logicflow/core'

import GraphData = LogicFlow.GraphData
import NodeData = LogicFlow.NodeData
import EdgeData = LogicFlow.EdgeData
import Position = LogicFlow.Position

type SetType = 'add' | 'reset'

export type MenuItem = {
  text?: string
  className?: string
  icon?: boolean | string
  disabled?: boolean
  callback: (element: any) => void
}

export type MenuConfig = {
  nodeMenu?: MenuItem[] | false
  edgeMenu?: MenuItem[] | false
  graphMenu?: MenuItem[] | false
  selectionMenu?: MenuItem[] | false
}

export type MenuType = 'nodeMenu' | 'edgeMenu' | 'graphMenu' | 'selectionMenu'

const DefaultNodeMenuKey = 'lf:defaultNodeMenu'
const DefaultEdgeMenuKey = 'lf:defaultEdgeMenu'
const DefaultGraphMenuKey = 'lf:defaultGraphMenu'
const DefaultSelectionMenuKey = 'lf:defaultSelectionMenu'

const menuKeyMap: Record<MenuType, string> = {
  nodeMenu: DefaultNodeMenuKey,
  edgeMenu: DefaultEdgeMenuKey,
  graphMenu: DefaultGraphMenuKey,
  selectionMenu: DefaultSelectionMenuKey,
}

const defaultMenuConfig: MenuConfig = {
  nodeMenu: [],
  edgeMenu: [],
  graphMenu: [],
  selectionMenu: [],
}

class Menu {
  lf: LogicFlow
  private __container?: HTMLElement
  private __menuDOM?: HTMLElement
  private menuTypeMap?: Map<string, MenuItem[]>
  private __currentData: EdgeData | NodeData | GraphData | Position | null =
    null
  private __isSilentMode: boolean = false
  private __editConfigChangeHandler?: ({
    data,
  }: {
    data: EditConfigModel
  }) => void
  static pluginName = 'menu'

  constructor({ lf }) {
    this.lf = lf
    this.__menuDOM = document.createElement('ul')
    this.__isSilentMode = lf.graphModel.editConfigModel.isSilentMode

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
    this.lf.changeMenuItemDisableStatus = (menuKey, text, disabled) => {
      this.changeMenuItemDisableStatus(menuKey, text, disabled)
    }
    this.lf.getMenuConfig = (menuKey) => {
      return this.getMenuConfig(menuKey)
    }
    this.lf.resetMenuConfigByType = (menuType) => {
      this.resetMenuConfigByType(menuType)
    }
  }

  /**
   * 初始化设置默认内置菜单栏
   */
  private init() {
    defaultMenuConfig.nodeMenu = [
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
    this.menuTypeMap?.set(DefaultNodeMenuKey, defaultMenuConfig.nodeMenu)

    defaultMenuConfig.edgeMenu = [
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
    this.menuTypeMap?.set(DefaultEdgeMenuKey, defaultMenuConfig.edgeMenu)

    defaultMenuConfig.graphMenu = []

    defaultMenuConfig.selectionMenu = [
      {
        text: '删除',
        callback: (elements) => {
          this.lf.clearSelectElements()
          elements.edges.forEach((edge) => this.lf.deleteEdge(edge.id))
          elements.nodes.forEach((node) => this.lf.deleteNode(node.id))
        },
      },
    ]
    this.menuTypeMap?.set(
      DefaultSelectionMenuKey,
      defaultMenuConfig.selectionMenu,
    )
  }

  private showMenu(x, y, menuList, options?) {
    // 在静默模式下不显示菜单
    if (this.__isSilentMode) return

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
   * 通用的菜单配置处理方法
   */
  private processMenuConfig(config: MenuConfig, operation: 'set' | 'add') {
    if (!config) return

    const menuTypes: MenuType[] = [
      'nodeMenu',
      'edgeMenu',
      'graphMenu',
      'selectionMenu',
    ]

    menuTypes.forEach((menuType) => {
      const menuConfig = config[menuType]
      const menuKey = menuKeyMap[menuType]

      if (menuConfig === undefined) return

      if (operation === 'set') {
        // 设置菜单配置
        this.menuTypeMap?.set(menuKey, menuConfig ? menuConfig : [])
      } else if (operation === 'add' && Array.isArray(menuConfig)) {
        // 追加菜单配置（只支持数组类型）
        const existingMenuList = this.menuTypeMap?.get(menuKey) ?? []
        this.menuTypeMap?.set(menuKey, existingMenuList.concat(menuConfig))
      }
    })
  }

  /**
   * 创建图片元素
   */
  private createImageElement(src: string, alt: string): HTMLImageElement {
    const img = document.createElement('img')
    img.src = src
    img.alt = alt
    img.style.width = '16px'
    img.style.height = '16px'
    img.style.objectFit = 'contain'
    return img
  }

  /**
   * 检查是否为图片文件路径
   */
  private isImageFile(iconString: string): boolean {
    const imageExtensions = [
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.svg',
      '.webp',
      '.ico',
      '.bmp',
    ]
    return imageExtensions.some((ext) => iconString.toLowerCase().includes(ext))
  }

  /**
   * 处理图标逻辑
   */
  private processIcon(
    iconContainer: HTMLElement,
    icon: boolean | string,
    text?: string,
  ) {
    if (typeof icon !== 'string') {
      // 如果icon是true，保持原有逻辑（创建空的图标容器）
      return
    }

    const iconString = icon as string

    // 1. base64格式的图片数据
    if (iconString.startsWith('data:image/')) {
      const img = this.createImageElement(iconString, text || 'icon')
      iconContainer.appendChild(img)
      return
    }

    // 2. 图片文件路径
    if (this.isImageFile(iconString)) {
      const img = this.createImageElement(iconString, text || 'icon')
      iconContainer.appendChild(img)
      return
    }

    // 3. HTML内容（包含< >标签）
    if (iconString.includes('<') && iconString.includes('>')) {
      iconContainer.innerHTML = iconString
      return
    }

    // 4. CSS类名（以空格分隔的多个类名或以.开头）
    if (iconString.includes(' ') || iconString.startsWith('.')) {
      const iconClasses = iconString.replace(/^\./, '').split(' ')
      iconContainer.classList.add(...iconClasses)
      return
    }

    // 5. 单个CSS类名
    iconContainer.classList.add(iconString)
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
          element.className = `lf-menu-item ${item.disabled ? 'lf-menu-item__disabled' : ''} ${item.className}`
        } else {
          element.className = `lf-menu-item ${item.disabled ? 'lf-menu-item__disabled' : ''}`
        }
        if (item.icon) {
          const icon = document.createElement('span')
          icon.className = 'lf-menu-item-icon'
          this.processIcon(icon, item.icon, item.text)
          element.appendChild(icon)
        }
        const text = document.createElement('span')
        text.className = 'lf-menu-item-text'
        if (item.text) {
          text.innerText = item.text
        }
        element.appendChild(text)
        if (item.disabled) {
          element.setAttribute('disabled', 'true')
        }
        ;(element as any).onclickCallback = item.callback
        menuList.push(element)
      })
    return menuList
  }

  /**
   * 更新菜单项DOM元素的禁用状态
   * @param text 菜单项文本
   * @param disabled 是否禁用
   */
  private updateMenuItemDOMStatus(text: string, disabled: boolean) {
    if (!this.__menuDOM || this.__menuDOM.style.display === 'none') {
      return
    }

    // 查找对应的菜单项DOM元素
    const menuItems = Array.from(
      this.__menuDOM.querySelectorAll('.lf-menu-item'),
    )

    const targetMenuItem = menuItems.find((menuItemElement) => {
      const textElement = menuItemElement.querySelector('.lf-menu-item-text')
      return textElement?.textContent === text
    })

    if (targetMenuItem) {
      const element = targetMenuItem as HTMLElement

      if (disabled) {
        element.classList.add('lf-menu-item__disabled')
        element.setAttribute('disabled', 'true')
      } else {
        element.classList.remove('lf-menu-item__disabled')
        element.removeAttribute('disabled')
      }
    }
  }

  /**
   * 设置静默模式监听器
   * 当 isSilentMode 变化时，动态更新菜单的显隐状态
   */
  private setupSilentModeListener() {
    // 创建并保存事件处理器引用
    this.__editConfigChangeHandler = ({ data }) => {
      const newIsSilentMode = data.isSilentMode
      if (newIsSilentMode !== this.__isSilentMode) {
        this.__isSilentMode = newIsSilentMode
        this.updateMenuVisibility(!newIsSilentMode)
      }
    }
    // 监听编辑配置变化
    this.lf.on('editConfig:changed', this.__editConfigChangeHandler)
  }

  /**
   * 更新菜单显隐状态
   */
  private updateMenuVisibility(visible: boolean) {
    if (!this.__menuDOM) return

    if (visible) {
      if (this.__currentData) {
        this.__menuDOM.style.display = 'block'
      }
    } else {
      this.__menuDOM.style.display = 'none'
      this.__currentData = null // 清除当前数据
    }
  }

  /**
   * 检查菜单是否正在显示并重新渲染
   */
  private refreshCurrentMenu() {
    if (
      !this.__menuDOM ||
      this.__menuDOM.style.display === 'none' ||
      !this.__currentData
    ) {
      return
    }

    // 保存当前菜单的位置
    const { left, top } = this.__menuDOM.style

    // 根据当前数据类型获取对应的菜单配置
    let menuList: any[] = []

    // 判断当前数据类型并获取相应菜单
    if (this.__currentData && typeof this.__currentData === 'object') {
      if (
        'sourceNodeId' in this.__currentData &&
        'targetNodeId' in this.__currentData
      ) {
        // 边菜单
        const model = this.lf.graphModel.getEdgeModelById(
          (this.__currentData as any).id,
        )
        if (model) {
          const typeMenus = this.menuTypeMap?.get(model.type)
          if (model.menu && Array.isArray(model.menu)) {
            menuList = model.menu
          } else if (typeMenus) {
            menuList = typeMenus
          } else {
            menuList = this.menuTypeMap?.get(DefaultEdgeMenuKey) ?? []
          }
        }
      } else if ('id' in this.__currentData && 'type' in this.__currentData) {
        // 节点菜单
        const model = this.lf.graphModel.getNodeModelById(
          (this.__currentData as any).id,
        )
        if (model) {
          const typeMenus = this.menuTypeMap?.get(model.type)
          if (model.menu && Array.isArray(model.menu)) {
            menuList = model.menu
          } else if (typeMenus) {
            menuList = typeMenus
          } else {
            menuList = this.menuTypeMap?.get(DefaultNodeMenuKey) ?? []
          }
        }
      } else if (
        'nodes' in this.__currentData &&
        'edges' in this.__currentData
      ) {
        // 选区菜单
        menuList = this.menuTypeMap?.get(DefaultSelectionMenuKey) ?? []
      } else {
        // 画布菜单
        menuList = this.menuTypeMap?.get(DefaultGraphMenuKey) ?? []
      }
    }

    // 重新渲染菜单
    if (menuList && menuList.length > 0) {
      this.__menuDOM.innerHTML = ''
      this.__menuDOM.append(...this.__getMenuDom(menuList))

      // 恢复菜单位置（如果有的话）
      if (left) this.__menuDOM.style.left = left
      if (top) this.__menuDOM.style.top = top
    } else {
      // 如果没有菜单项，隐藏菜单
      this.__menuDOM.style.display = 'none'
      this.__currentData = null
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
    this.refreshCurrentMenu() // 实时更新DOM
  }

  getMenuConfig(menuKey: MenuType) {
    return this.menuTypeMap?.get(menuKeyMap[menuKey]) ?? []
  }

  resetMenuConfigByType(menuKey: MenuType) {
    this.setMenuConfig({
      [menuKey]: defaultMenuConfig[menuKey],
    })
    // setMenuConfig 已经包含了 refreshCurrentMenu 调用
  }

  resetAllMenuConfig() {
    this.setMenuConfig(defaultMenuConfig)
    // setMenuConfig 已经包含了 refreshCurrentMenu 调用
  }

  // 复写菜单
  setMenuConfig(config: MenuConfig) {
    this.processMenuConfig(config, 'set')
    this.refreshCurrentMenu() // 实时更新DOM
  }

  // 在默认菜单后面追加菜单项
  addMenuConfig(config: MenuConfig) {
    this.processMenuConfig(config, 'add')
    this.refreshCurrentMenu() // 实时更新DOM
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
    // addMenuConfig 和 setMenuConfig 已经包含了 refreshCurrentMenu 调用
  }

  changeMenuItemDisableStatus(
    menuKey: MenuType,
    text: string,
    disabled: boolean,
  ) {
    if (!menuKey || !text) {
      console.warn('params is vaild')
      return
    }
    const menuList = this.menuTypeMap?.get(menuKeyMap[menuKey]) ?? []
    if (!menuList.length) {
      console.warn(`menuMap: ${menuKey} is not exist`)
      return
    }
    const menuItem = menuList.find((item) => item.text === text)
    if (!menuItem) {
      console.warn(`menuItem: ${text} is not exist`)
      return
    }
    menuItem.disabled = disabled

    // 如果菜单当前正在显示，则同时更新DOM元素的样式
    this.updateMenuItemDOMStatus(text, disabled)
  }

  render(lf: LogicFlow, container: HTMLElement) {
    if (lf.graphModel.editConfigModel.isSilentMode) return
    this.__container = container
    this.__currentData = null // 当前展示的菜单所属元素的model数据
    // 监听 isSilentMode 变化
    this.setupSilentModeListener()

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
          if (
            Array.from(target.classList).indexOf('lf-menu-item__disabled') > -1
          )
            return
          if (Array.from(target.classList).indexOf('lf-menu-item') > -1) {
            // 如果菜单项被禁用，则不执行回调
            ;(target as any).onclickCallback(this.__currentData, target)
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

      if (!model || this.__isSilentMode) return
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
      if (!model || this.__isSilentMode) return
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
      if (this.__isSilentMode) return
      const menuList = this.menuTypeMap?.get(DefaultGraphMenuKey) ?? []
      const {
        domOverlayPosition: { x, y },
      } = position
      this.__currentData = { ...position.canvasOverlayPosition }
      this.showMenu(x, y, menuList)
    })
    this.lf.on('selection:contextmenu', ({ data, position }) => {
      if (this.__isSilentMode) return
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
    // 清理事件监听器
    if (this.__editConfigChangeHandler) {
      this.lf.off('editConfig:changed', this.__editConfigChangeHandler)
    }

    if (this.__menuDOM) {
      this?.__container?.removeChild(this.__menuDOM)
      this.__menuDOM = undefined
    }
  }
}

export default Menu

export { Menu }
