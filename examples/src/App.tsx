import React from 'react';
import Routes from './routes';
import './App.css';
import { Menu } from 'antd';
import { useHistory } from 'react-router-dom';
import { routeGroupNameMaps, routeMaps } from './constants';

type MenusType = { name: string; path: string };

const { SubMenu } = Menu;

const menus: MenusType[] = Routes.props.children.map(
  (it: { props: { path: string } }) => {
    const {
      props: { path },
    } = it;
    return { name: path, path };
  },
);

const genMenus = () => {
  const tree: {
    key: string;
    children: JSX.Element;
  }[] = [];
  // eslint-disable-next-line array-callback-return
  menus.map((menu) => {
    const { path } = menu;
    const { name, group, hidden } = routeMaps[path] ?? {};
    const [firstNode] = group.split('.');
    if (firstNode === 'root') {
      tree.push({
        key: group,
        children: (
          <Menu.Item key={path} title={name}>
            {name}
          </Menu.Item>
        ),
      });

      // eslint-disable-next-line array-callback-return
      return;
    }
    const existIndex = tree.findIndex((it) => it.key === firstNode);
    if (existIndex === -1) {
      const groupName = routeGroupNameMaps[firstNode] ?? '';
      tree.push({
        key: firstNode,
        children: (
          <SubMenu
            key={firstNode}
            title={groupName}
            children={[
              <Menu.Item key={path} title={name}>
                {name}
              </Menu.Item>,
            ]}
          />
        ),
      });
    } else {
      tree[existIndex].children.props.children.push(
        <Menu.Item key={path} title={name}>
          {name}
        </Menu.Item>,
      );
    }
  });
  console.log('tree', tree);
  return tree;
};

function App() {
  const history = useHistory();
  const m = genMenus();

  const renderNav = () => {
    return (
      <Menu
        mode="inline"
        style={{ flexShrink: 0, width: 300 }}
        onClick={(e) => history.push(e.key)}
      >
        {m.map((it) => it.children)}
      </Menu>
    );
  };

  return (
    <div className="App">
      {renderNav()}
      <div className="container">{Routes}</div>
    </div>
  );
}

export default App;
