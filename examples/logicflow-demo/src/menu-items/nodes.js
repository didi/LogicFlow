// assets
import { IconBoxMultiple } from '@tabler/icons';

// constant
const icons = { IconBoxMultiple };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const nodes = {
  id: 'node',
  title: '节点',
  type: 'group',
  children: [
    {
      id: 'default-node',
      title: '内置节点',
      type: 'item',
      url: '/nodes/native-node',
      icon: icons.IconBoxMultiple,
      breadcrumbs: false
    }
  ]
};

export default nodes;
