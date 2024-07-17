import type { MenuProps } from 'antd';

export type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
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

export default items;
