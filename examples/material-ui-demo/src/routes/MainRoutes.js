import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// layout routing
const UtilsTypography = Loadable(lazy(() => import('views/layout/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/layout/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/layout/Shadow')));
const UtilsMaterialIcons = Loadable(lazy(() => import('views/layout/MaterialIcons')));
const UtilsTablerIcons = Loadable(lazy(() => import('views/layout/TablerIcons')));

// edges page routing
const NativeEdge = Loadable(lazy(() => import('views/edges')));

// nodes page routing
const NativeNode = Loadable(lazy(() => import('views/nodes')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'nodes',
      children: [
        {
          path: 'NativeNodes',
          element: <NativeNode />
        }
      ]
    },
    {
      path: 'edges',
      children: [
        {
          path: 'native-edge',
          element: <NativeEdge />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-typography',
          element: <UtilsTypography />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-color',
          element: <UtilsColor />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-shadow',
          element: <UtilsShadow />
        }
      ]
    },
    {
      path: 'icons',
      children: [
        {
          path: 'tabler-icons',
          element: <UtilsTablerIcons />
        }
      ]
    },
    {
      path: 'icons',
      children: [
        {
          path: 'material-icons',
          element: <UtilsMaterialIcons />
        }
      ]
    }
  ]
};

export default MainRoutes;
