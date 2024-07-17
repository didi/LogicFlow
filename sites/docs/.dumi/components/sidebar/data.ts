export type MenuItem = {
  key: string;
  label: string;
  children?: MenuItem[];
};

/**
 * 中文菜单
 */
export const MenuItemZh: MenuItem[] = [
  {
    key: 'case',
    label: '场景案例',
    children: [
      {
        key: 'bussiness',
        label: '业务场景',
      },
      {
        key: 'demo',
        label: '示例',
      },
    ],
  },
  {
    key: 'node',
    label: '节点',
  },
  {
    key: 'edge',
    label: '边',
  },
  {
    key: 'react',
    label: 'react节点',
  },
  {
    key: 'extension',
    label: '插件',
  },
];

/**
 * 英文菜单
 */
export const MenuItemEn: MenuItem[] = [
  {
    key: 'case',
    label: 'Case Study',
    children: [
      {
        key: 'bussiness',
        label: 'Business Scene',
      },
      {
        key: 'demo',
        label: 'Demo',
      },
    ],
  },
  {
    key: 'node',
    label: 'Node',
  },
  {
    key: 'edge',
    label: 'Edge',
  },
  {
    key: 'react',
    label: 'React Nodes',
  },
  {
    key: 'extension',
    label: 'Extension',
  },
];
