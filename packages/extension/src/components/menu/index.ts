import LogicFlow from '@logicflow/core';

type SetType = 'add' | 'reset';

export type MenuItem = {
  text?: string;
  className?: string;
  icon?: boolean;
  callback: (element: any) => void;
};

export type MenuConfig = {
  nodeMenu?: MenuItem[] | false;
  edgeMenu?: MenuItem[] | false;
  graphMenu?: MenuItem[] | false;
};

const DefalutNodeMenuKey = 'lf:defaultNodeMenu';
const DefalutEdgeMenuKey = 'lf:defaultEdgeMenu';
const DefalutGraphMenuKey = 'lf:defaultGraphMenu';
const DefalutSelectionMenuKey = 'lf:defaultSelectionMenu';

class Menu {
  lf: LogicFlow;
  LogicFlow: any;
  private __container: HTMLElement;
  private __menuDOM: HTMLElement;
  private menuTypeMap: Map<string, MenuItem[]>;
  private __currentData: any;
  static pluginName = 'menu';
  constructor(args) {
    this.__menuDOM = document.createElement('ul');
    this.lf = args.lf;
    this.LogicFlow = args.LogicFlow;
    this.menuTypeMap = new Map();
    this.init();
    this.lf.setMenuConfig = (config) => {
      this.setMenuConfig(config);
    };
    this.lf.addMenuConfig = (config) => {
      this.addMenuConfig(config);
    };
    this.lf.setMenuByType = (config) => {
      this.setMenuByType(config);
    };
  }
  /**
   * 初始化设置默认内置菜单栏
   */
  private init() {
    const defalutNodeMenu = [
      {
        text: this.LogicFlow.t('删除'),
        callback: (node) => {
          this.lf.deleteNode(node.id);
        },
      },
      {
        text: this.LogicFlow.t('编辑文本'),
        callback: (node) => {
          this.lf.graphModel.editText(node.id);
        },
      },
      {
        text: this.LogicFlow.t('复制'),
        callback: (node) => {
          this.lf.cloneNode(node.id);
        },
      },
    ];
    this.menuTypeMap.set(DefalutNodeMenuKey, defalutNodeMenu);

    const defaultEdgeMenu = [
      {
        text: this.LogicFlow.t('删除'),
        callback: (edge) => {
          this.lf.deleteEdge(edge.id);
        },
      },
      {
        text: this.LogicFlow.t('编辑文本'),
        callback: (edge) => {
          this.lf.graphModel.editText(edge.id);
        },
      },
    ];
    this.menuTypeMap.set(DefalutEdgeMenuKey, defaultEdgeMenu);

    this.menuTypeMap.set(DefalutGraphMenuKey, []);

    const DefalutSelectionMenu = [
      {
        text: this.LogicFlow.t('删除'),
        callback: (elements) => {
          this.lf.clearSelectElements();
          elements.edges.forEach(edge => this.lf.deleteEdge(edge.id));
          elements.nodes.forEach(node => this.lf.deleteNode(node.id));
        },
      },
    ];
    this.menuTypeMap.set(DefalutSelectionMenuKey, DefalutSelectionMenu);
  }
  render(lf, container) {
    this.__container = container;
    this.__currentData = null; // 当前展示的菜单所属元素的model数据
    this.__menuDOM.className = 'lf-menu';
    container.appendChild(this.__menuDOM);
    // 将选项的click事件委托至menu容器
    // 在捕获阶段拦截并执行
    this.__menuDOM.addEventListener('click', (event) => {
      event.stopPropagation();
      let target = event.target as HTMLElement;
      // 菜单有多层dom，需要精确获取菜单项所对应的dom
      // 除菜单项dom外，应考虑两种情况
      // 1. 菜单项的子元素 2. 菜单外层容器
      while (Array.from(target.classList).indexOf('lf-menu-item') === -1 && Array.from(target.classList).indexOf('lf-menu') === -1) {
        target = target.parentElement;
      }
      if (Array.from(target.classList).indexOf('lf-menu-item') > -1) {
        // 如果点击区域在菜单项内
        (target as any).onclickCallback(this.__currentData);
        // 点击后隐藏menu
        this.__menuDOM.style.display = 'none';
        this.__currentData = null;
      } else {
        // 如果点击区域不在菜单项内
        console.warn('点击区域不在菜单项内，请检查代码！');
      }
    }, true);
    // 通过事件控制菜单的显示和隐藏
    this.lf.on('node:contextmenu', ({ data, position }) => {
      const { domOverlayPosition: { x, y } } = position;
      const { id } = data;
      const model = this.lf.graphModel.getNodeModelById(id);
      let menuList = [];
      const typeMenus = this.menuTypeMap.get(model.type);
      // 如果单个节点自定义了节点，以单个节点自定义为准
      if (model && model.menu && Array.isArray(model.menu)) {
        menuList = model.menu;
      } else if (typeMenus) { // 如果定义当前节点类型的元素
        menuList = typeMenus;
      } else { // 最后取全局默认
        menuList = this.menuTypeMap.get(DefalutNodeMenuKey);
      }
      this.__currentData = data;
      this.showMenu(x, y, menuList);
    });
    this.lf.on('edge:contextmenu', ({ data, position }) => {
      const { domOverlayPosition: { x, y } } = position;
      const { id } = data;
      const model = this.lf.graphModel.getEdgeModelById(id);
      let menuList = [];
      const typeMenus = this.menuTypeMap.get(model.type);
      // 如果单个节点自定义了边
      if (model && model.menu && Array.isArray(model.menu)) {
        menuList = model.menu;
      } else if (typeMenus) { // 如果定义当前边类型的元素
        menuList = typeMenus;
      } else { // 最后取全局默认
        menuList = this.menuTypeMap.get(DefalutEdgeMenuKey);
      }
      this.__currentData = data;
      this.showMenu(x, y, menuList);
    });
    this.lf.on('blank:contextmenu', ({ position }) => {
      const menuList = this.menuTypeMap.get(DefalutGraphMenuKey);
      const { domOverlayPosition: { x, y } } = position;
      this.showMenu(x, y, menuList);
    });
    this.lf.on('selection:contextmenu', ({ data, position }) => {
      const menuList = this.menuTypeMap.get(DefalutSelectionMenuKey);
      const { domOverlayPosition: { x, y } } = position;
      this.__currentData = data;
      this.showMenu(x, y, menuList);
    });
    this.lf.on('node:mousedown', () => {
      this.__menuDOM.style.display = 'none';
    });
    this.lf.on('edge:click', () => {
      this.__menuDOM.style.display = 'none';
    });
    this.lf.on('blank:click', () => {
      this.__menuDOM.style.display = 'none';
    });
  }
  destroy() {
    this?.__container?.removeChild(this.__menuDOM);
    this.__menuDOM = null;
  }
  private showMenu(x, y, menuList) {
    if (!menuList || !menuList.length) return;
    const { __menuDOM: menu } = this;
    // 菜单容器不变，需要先清空内部的菜单项
    menu.innerHTML = '';
    menu.append(...this.__getMenuDom(menuList));
    // 菜单中没有项，不显示
    if (!menu.children.length) return;
    menu.style.display = 'block';
    menu.style.top = `${y}px`;
    menu.style.left = `${x}px`;
  }
  /**
   * 设置指定类型元素的菜单
   */
  private setMenuByType(config) {
    if (!config.type || !config.menu) {
      return;
    }
    this.menuTypeMap.set(config.type, config.menu);
  }
  /**
   * 获取 Menu DOM
   * @param list 菜单项
   * @return 菜单项 DOM
   */
  private __getMenuDom(list): HTMLElement[] {
    const menuList = [];
    list && list.length > 0 && list.forEach((item) => {
      const element = document.createElement('li');
      if (item.className) {
        element.className = `lf-menu-item ${item.className}`;
      } else {
        element.className = 'lf-menu-item';
      }
      if (item.icon === true) {
        const icon = document.createElement('span');
        icon.className = 'lf-menu-item-icon';
        element.appendChild(icon);
      }
      const text = document.createElement('span');
      text.className = 'lf-menu-item-text';
      if (item.text) {
        text.innerText = item.text;
      }
      element.appendChild(text);
      (element as any).onclickCallback = item.callback;
      menuList.push(element);
    });
    return menuList;
  }
  // 复写菜单
  setMenuConfig(config: MenuConfig) {
    if (!config) {
      return;
    }
    // node
    config.nodeMenu !== undefined
      && this.menuTypeMap.set(DefalutNodeMenuKey, config.nodeMenu ? config.nodeMenu : []);
    // edge
    config.edgeMenu !== undefined
      && this.menuTypeMap.set(DefalutEdgeMenuKey, config.edgeMenu ? config.edgeMenu : []);
    // graph
    config.graphMenu !== undefined
      && this.menuTypeMap.set(DefalutGraphMenuKey, config.graphMenu ? config.graphMenu : []);
  }
  // 在默认菜单后面追加菜单项
  addMenuConfig(config: MenuConfig) {
    if (!config) {
      return;
    }
    // 追加项时，只支持数组类型，对false不做操作
    if (Array.isArray(config.nodeMenu)) {
      const menuList = this.menuTypeMap.get(DefalutNodeMenuKey);
      this.menuTypeMap.set(DefalutNodeMenuKey, menuList.concat(config.nodeMenu));
    }
    if (Array.isArray(config.edgeMenu)) {
      const menuList = this.menuTypeMap.get(DefalutEdgeMenuKey);
      this.menuTypeMap.set(DefalutEdgeMenuKey, menuList.concat(config.edgeMenu));
    }
    if (Array.isArray(config.graphMenu)) {
      const menuList = this.menuTypeMap.get(DefalutGraphMenuKey);
      this.menuTypeMap.set(DefalutGraphMenuKey, menuList.concat(config.graphMenu));
    }
  }
  /**
   * @deprecated
   * 复写添加
   */
  changeMenuItem(type: SetType, config: MenuConfig) {
    if (type === 'add') this.addMenuConfig(config);
    else if (type === 'reset') this.setMenuConfig(config);
    else {
      throw new Error(
        'The first parameter of changeMenuConfig should be \'add\' or \'reset\'',
      );
    }
  }
}

export default Menu;

export {
  Menu,
};
