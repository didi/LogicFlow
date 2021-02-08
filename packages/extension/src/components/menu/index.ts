import LogicFlow, { Extension } from '@logicflow/core';

export type MenuItem = {
  text?: string;
  className?: string,
  icon?: boolean,
  callback: (element: any) => void;
};

export type MenuConfig = {
  nodeMenu?: MenuItem[] | false;
  edgeMenu?: MenuItem[] | false;
  graphMenu?: MenuItem[] | false;
};

interface Menu extends Extension {
  _defaultConfig: MenuConfig;
  _menuDOM: HTMLElement;
  _menuItemDOM: Map<string, HTMLElement[]>;
  _config: MenuConfig;
  getMenuConfig: () => MenuConfig;
  getMenuDom: (list: MenuItem[]) => HTMLElement[];
}

const Menu: Menu = {
  _defaultConfig: {},
  _menuDOM: document.createElement('ul'),
  _menuItemDOM: new Map(), // 三种类型菜单选项的 DOM（node | edge | graph）
  _config: {},
  install(lf: LogicFlow) {
    Menu._defaultConfig = {
      nodeMenu: [
        {
          text: '删除',
          callback(node) {
            lf.deleteNode(node.id);
          },
        },
        {
          text: '编辑文本',
          callback(node) {
            lf.graphModel.setTextEditable(node.id);
          },
        },
        {
          text: '复制',
          callback(node) {
            lf.cloneNode(node.id);
          },
        },
      ],
      edgeMenu: [
        {
          text: '删除',
          callback(edge) {
            lf.deleteEdge(edge.id);
          },
        },
        {
          text: '编辑文本',
          callback(edge) {
            lf.graphModel.setTextEditable(edge.id);
          },
        },
      ],
      graphMenu: [],
    };
    // 用户添加选项时，需要在 callback 中使用 lf 实例
    // 所以这里把添加的功能注册到 lf 实例上
    // 重置菜单
    lf.setMenuConfig = (config: MenuConfig) => {
      if (config) {
        // 自定义全局菜单
        if (config.nodeMenu === false) {
          Menu._defaultConfig.nodeMenu = [];
        } else if (config.nodeMenu) {
          Menu._defaultConfig.nodeMenu = config.nodeMenu;
        }
        if (config.edgeMenu === false) {
          Menu._defaultConfig.edgeMenu = [];
        } else if (config.edgeMenu) {
          Menu._defaultConfig.edgeMenu = config.edgeMenu;
        }
        if (config.graphMenu === false) {
          Menu._defaultConfig.graphMenu = [];
        } else if (config.graphMenu) {
          Menu._defaultConfig.graphMenu = config.graphMenu;
        }
      }
    };
    // 追加全局菜单
    lf.addMenuConfig = (config: MenuConfig) => {
      Menu._config = config;
    };
  },
  render(lf, container) {
    let currentData = null; // 当前展示的菜单所属元素的model数据
    const menuConfig: MenuConfig = Menu.getMenuConfig();
    Menu._menuDOM.className = 'lf-menu';
    // 三种类型的菜单
    Object.keys(menuConfig).forEach((menuType) => {
      // 菜单没有配置时不进行渲染
      if (menuConfig[menuType].length) {
        const menuItems = Menu.getMenuDom(menuConfig[menuType]); // 菜单的选项
        Menu._menuItemDOM.set(menuType, menuItems);
        container.appendChild(Menu._menuDOM);
      }
    });
    // 将选项的click事件委托至menu容器
    // 在捕获阶段拦截并执行
    Menu._menuDOM.addEventListener('click', (event) => {
      event.stopPropagation();
      let target = event.target as HTMLElement;
      // 菜单项内有多层dom,查找菜单项element
      while (Array.from(target.classList).indexOf('lf-menu-item') === -1 && Array.from(target.classList).indexOf('lf-menu') === -1) {
        target = target.parentElement;
      }
      if (Array.from(target.classList).indexOf('lf-menu-item') > -1) {
        // 如果点击区域在菜单项内
        (target as HTMLElement).onclick(currentData);
        // 点击后隐藏menu
        Menu._menuDOM.style.display = 'none';
        currentData = null;
      } else {
        // 如果点击区域不在菜单项内
        throw new Error('点击区域不在菜单项内，请检查代码！');
      }
    }, true);
    // 通过事件控制菜单的显示和隐藏
    lf.on('node:contextmenu', ({ data, position }) => {
      const { domOverlayPosition: { x, y } } = position;
      const { _menuDOM: menu, _menuItemDOM: menuItem } = Menu;
      menu.innerHTML = '';
      const { id } = data;
      const model = lf.graphModel.getNodeModel(id);
      if (model && model.menu && model.menu.length > 0) {
        const menuList = Menu.getMenuDom(model.menu);
        menu.append(...menuList);
      } else {
        menu.append(...menuItem.get('nodeMenu'));
      }
      menu.style.display = 'block';
      menu.style.top = `${y}px`;
      menu.style.left = `${x}px`;
      currentData = data;
    });
    lf.on('edge:contextmenu', ({ data, position }) => {
      const { _menuDOM: menu, _menuItemDOM: menuItem } = Menu;
      const { domOverlayPosition: { x, y } } = position;
      menu.innerHTML = '';
      const { id } = data;
      const model = lf.graphModel.getEdgeModel(id);
      if (model && model.menu && model.menu.length > 0) {
        const menuList = Menu.getMenuDom(model.menu);
        menu.append(...menuList);
      } else {
        menu.append(...menuItem.get('edgeMenu'));
      }
      menu.style.display = 'block';
      menu.style.top = `${y}px`;
      menu.style.left = `${x}px`;
      currentData = data;
    });
    lf.on('blank:contextmenu', ({ e, position }) => {
      const { _menuDOM: menu, _menuItemDOM: menuItem } = Menu;
      const { domOverlayPosition: { x, y } } = position;
      if (menuItem.has('graphMenu')) {
        menu.innerHTML = '';
        menu.append(...menuItem.get('graphMenu'));
        menu.style.display = 'block';
        menu.style.top = `${y}px`;
        menu.style.left = `${x}px`;
        currentData = e;
      }
    });
    lf.on('node:mousedown', () => {
      Menu._menuDOM.style.display = 'none';
    });
    lf.on('edge:click', () => {
      Menu._menuDOM.style.display = 'none';
    });
    lf.on('blank:click', () => {
      Menu._menuDOM.style.display = 'none';
    });
    // todo: 鼠标滚动导致缩放和平移变化，会是菜单显示不准确。需要抛出缩放和平移事件，这里再做处理。
  },
  // 获取menu的配置，包括 _defaultConfig 和 config（用户配置）
  getMenuConfig() {
    if (Object.prototype.toString.apply(Menu._config) !== '[object Object]') {
      throw new TypeError('config 必须是一个对象');
    }
    const { nodeMenu, edgeMenu, graphMenu } = Menu._config;
    const menu: MenuConfig = Menu._defaultConfig;
    if (nodeMenu === false) { // 禁用
      menu.nodeMenu = [];
    } else if (Array.isArray(nodeMenu)) { // 自定义
      (menu.nodeMenu as MenuItem[]).push(...nodeMenu);
    }
    if (edgeMenu === false) {
      menu.edgeMenu = [];
    } else if (Array.isArray(edgeMenu)) {
      (menu.edgeMenu as MenuItem[]).push(...edgeMenu);
    }
    if (graphMenu === false) {
      menu.graphMenu = [];
    } else if (Array.isArray(graphMenu)) {
      menu.graphMenu = graphMenu;
    }
    return menu;
  },
  getMenuDom(list): HTMLElement[] {
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
      element.onclick = item.callback;
      menuList.push(element);
    });
    return menuList;
  },
};

export default Menu;

export {
  Menu,
};
