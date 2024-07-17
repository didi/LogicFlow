import React from 'react';

import { Menu } from 'antd';
import type { MenuProps } from 'antd';

import data from './data';

const Sidebar: React.FC = () => {
  // 跳转页面锚点
  const onClick: MenuProps['onClick'] = (e) => {
    const { key } = e;
    const anchorElement = document.getElementById(key);
    if (anchorElement) {
      const headerHeight =
        document.querySelector('.dumi-default-header')?.clientHeight || 0;
      const offsetTop =
        anchorElement.getBoundingClientRect().top +
        window.scrollY -
        headerHeight;

      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };
  return (
    <Menu
      onClick={onClick}
      style={{ width: 256, backgroundColor: 'transparent' }}
      defaultSelectedKeys={['bussiness']}
      defaultOpenKeys={['case']}
      mode="inline"
      items={data}
    />
  );
};

export default Sidebar;
