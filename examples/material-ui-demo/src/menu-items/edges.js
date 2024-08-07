// assets
import { IconLayersLinked } from '@tabler/icons';

// constant
const icons = { IconLayersLinked };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const edges = {
  id: 'edge',
  title: '边',
  type: 'group',
  children: [
    {
      id: 'default-edge',
      title: '内置边',
      type: 'item',
      url: '/edges/native-edge',
      icon: icons.IconLayersLinked,
      breadcrumbs: false
    }
  ]
};

export default edges;
