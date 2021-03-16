import LogicFlow, { Extension } from '@logicflow/core';

type SetType = 'add' | 'reset';

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
  __container: HTMLElement;
  __items: MenuConfig;
  __menuDOM: HTMLElement;
  __menuItemDOM: Map<string, HTMLElement[]>;
  __getMenuDom: (list: MenuItem[]) => HTMLElement[];
  resetMenuItem: (config: MenuConfig) => void;
  addMenuItem: (config: MenuConfig) => void;
  changeMenuItem: (type: SetType, config: MenuConfig) => void;
}

const Menu: Menu = {
  name: 'menu',
  __items: {},
  __menuDOM: null,
  __menuItemDOM: null, // 三种类型菜单选项的 DOM（node | edge | graph）
  __container: null,
  /**
   * 注册 Menu 插件
   * @param lf LogicFlow 实例
   */
  install(lf: LogicFlow) {
    Menu.__menuDOM = document.createElement('ul');
    Menu.__menuItemDOM = new Map();
    Menu.__items = {
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
    // TODO: 将方法添加到lf上后没有类型提示，推荐直接使用Menu上的方法
    lf.setMenuConfig = Menu.resetMenuItem;
    lf.addMenuConfig = Menu.addMenuItem;
  },

  /**
   * 将 Menu 组件渲染进 LF 的组件层
   * @param lf LogicFlow 实例
   * @param container 组件层 DOM
   */
  render(lf, container) {
    Menu.__container = container;
    let currentData = null; // 当前展示的菜单所属元素的model数据
    const menuConfig: MenuConfig = Menu.__items;
    Menu.__menuDOM.className = 'lf-menu';
    // 三种类型的菜单
    Object.keys(menuConfig).forEach((menuType) => {
      // 菜单没有配置时不进行渲染
      if (menuConfig[menuType].length) {
        const menuItems = Menu.__getMenuDom(menuConfig[menuType]); // 菜单的选项
        Menu.__menuItemDOM.set(menuType, menuItems);
        container.appendChild(Menu.__menuDOM);
      }
    });
    // 将选项的click事件委托至menu容器
    // 在捕获阶段拦截并执行
    Menu.__menuDOM.addEventListener('click', (event) => {
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
        (target as HTMLElement).onclick(currentData);
        // 点击后隐藏menu
        Menu.__menuDOM.style.display = 'none';
        currentData = null;
      } else {
        // 如果点击区域不在菜单项内
        throw new Error('点击区域不在菜单项内，请检查代码！');
      }
    }, true);
    // 通过事件控制菜单的显示和隐藏
    lf.on('node:contextmenu', ({ data, position }) => {
      const { domOverlayPosition: { x, y } } = position;
      const { __menuDOM: menu, __menuItemDOM: menuItem } = Menu;
      // 菜单容器不变，需要先清空内部的菜单项
      menu.innerHTML = '';
      const { id } = data;
      const model = lf.graphModel.getNodeModel(id);
      if (model && model.menu && Array.isArray(model.menu)) {
        // 支持直接从model中读取菜单配置
        const menuList = Menu.__getMenuDom(model.menu);
        menu.append(...menuList);
      } else {
        menu.append(...menuItem.get('nodeMenu'));
      }
      // 菜单中没有项，不显示
      if (!menu.children.length) return;
      menu.style.display = 'block';
      menu.style.top = `${y}px`;
      menu.style.left = `${x}px`;
      currentData = data;
    });
    lf.on('edge:contextmenu', ({ data, position }) => {
      const { __menuDOM: menu, __menuItemDOM: menuItem } = Menu;
      const { domOverlayPosition: { x, y } } = position;
      menu.innerHTML = '';
      const { id } = data;
      const model = lf.graphModel.getEdgeModel(id);
      if (model && model.menu && Array.isArray(model.menu)) {
        const menuList = Menu.__getMenuDom(model.menu);
        menu.append(...menuList);
      } else {
        menu.append(...menuItem.get('edgeMenu'));
      }
      if (!menu.children.length) return;
      menu.style.display = 'block';
      menu.style.top = `${y}px`;
      menu.style.left = `${x}px`;
      currentData = data;
    });
    lf.on('blank:contextmenu', ({ e, position }) => {
      const { __menuDOM: menu, __menuItemDOM: menuItem } = Menu;
      const { domOverlayPosition: { x, y } } = position;
      if (menuItem.has('graphMenu')) {
        menu.innerHTML = '';
        menu.append(...menuItem.get('graphMenu'));
        if (!menu.children.length) return;
        menu.style.display = 'block';
        menu.style.top = `${y}px`;
        menu.style.left = `${x}px`;
        currentData = e;
      }
    });
    lf.on('node:mousedown', () => {
      Menu.__menuDOM.style.display = 'none';
    });
    lf.on('edge:click', () => {
      Menu.__menuDOM.style.display = 'none';
    });
    lf.on('blank:click', () => {
      Menu.__menuDOM.style.display = 'none';
    });
    // todo: 鼠标滚动导致缩放和平移变化，会是菜单显示不准确。需要抛出缩放和平移事件，这里再做处理。
  },

  destroy() {
    Menu.__container.removeChild(Menu.__menuDOM);
    Menu.__menuDOM = null;
    Menu.__menuItemDOM = null;
  },
  
  /**
   * 获取 Menu DOM
   * @param list 菜单项
   * @return 菜单项 DOM
   */
  __getMenuDom(list): HTMLElement[] {
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
  // 复写菜单
  resetMenuItem(config: MenuConfig) {
    if (config) {
      // 自定义全局菜单
      if (config.nodeMenu === false) {
        Menu.__items.nodeMenu = [];
      } else if (config.nodeMenu) {
        Menu.__items.nodeMenu = config.nodeMenu;
      }
      if (config.edgeMenu === false) {
        Menu.__items.edgeMenu = [];
      } else if (config.edgeMenu) {
        Menu.__items.edgeMenu = config.edgeMenu;
      }
      if (config.graphMenu === false) {
        Menu.__items.graphMenu = [];
      } else if (config.graphMenu) {
        Menu.__items.graphMenu = config.graphMenu;
      }
    }
  },
  // 在默认菜单后面追加菜单项
  addMenuItem(config: MenuConfig) {
    if (config) {
      // 追加项时，只支持数组类型，对false不做操作
      if (Array.isArray(config.nodeMenu)) {
        (Menu.__items.nodeMenu as MenuItem[]).push(...config.nodeMenu);
      }
      if (Array.isArray(config.edgeMenu)) {
        (Menu.__items.edgeMenu as MenuItem[]).push(...config.edgeMenu);
      }
      if (Array.isArray(config.graphMenu)) {
        (Menu.__items.edgeMenu as MenuItem[]).push(...config.graphMenu);
      }
    }
  },
  // 支持复写或追加
  changeMenuItem(type: SetType, config: MenuConfig) {
    if (type === 'add') Menu.addMenuItem(config);
    else if (type === 'reset') Menu.resetMenuItem(config);
    else {
      throw new Error(
        'The first parameter of changeMenuConfig should be \'add\' or \'reset\'',
      );
    }
  },
};

export default Menu;

export {
  Menu,
};
