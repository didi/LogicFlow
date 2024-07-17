import React, { useEffect, useState } from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { MenuItemZh, MenuItemEn } from './data';
import type { MenuItem } from './data';
import { throttle } from '../../util';

const Sidebar: React.FC<{ language: string }> = ({ language }) => {
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);

  let data: MenuItem[] = MenuItemZh;
  if (language === 'en') {
    data = MenuItemEn;
  }
  useEffect(() => {
    const handleScroll = () => {
      const headerHeight =
        document.querySelector('.dumi-default-header')?.clientHeight ?? 0;

      // 获取当前所有锚点
      const getAnchors = (itmes: MenuItem[]): string[] => {
        let anchors: string[] = [];
        itmes.forEach((item) => {
          if (!item.children) {
            anchors.push(item.key);
          } else {
            anchors = anchors.concat(getAnchors(item.children));
          }
        });
        return anchors;
      };

      const anchors = getAnchors(data);

      // 获取当前滚动条所在锚点
      let currentAnchor: string | null = null;
      for (let i = 0; i < anchors.length; i++) {
        const anchorElement = document.getElementById(anchors[i]);
        if (anchorElement) {
          const top = anchorElement.getBoundingClientRect().top;
          if (top - headerHeight >= -50) {
            currentAnchor = anchors[i];
            break;
          }
        }
      }

      if (currentAnchor) {
        setActiveMenuKey(currentAnchor);
      }
    };
    window.addEventListener('scroll', throttle(handleScroll, 10));
  }, []);

  // 跳转页面锚点
  const onClick: MenuProps['onClick'] = (e) => {
    const { key } = e;
    const anchorElement = document.getElementById(key);
    if (anchorElement) {
      const headerHeight =
        document.querySelector('.dumi-default-header')?.clientHeight ?? 0;
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
      style={{ backgroundColor: 'transparent' }}
      defaultOpenKeys={['case']}
      mode="inline"
      selectedKeys={[activeMenuKey ?? 'bussiness']}
      items={data}
    />
  );
};

export default Sidebar;
