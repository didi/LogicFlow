import React, { useEffect, useState } from 'react';
import LogicFlow from '@logicflow/core';
import RegisteNode from './components/registerNode';
import hoverPanel from './components/hoverPanel';
import { themeApprove, data } from './config';
import './index.css';

const config = {
  grid: {
    size: 10,
    type: 'mesh',
    config: {
      color: '#DCDCDC',  // 设置网格的颜色
    }
  },
  isSilentMode: true,
  keyboard: { enabled: true },
  style: themeApprove,
}

const sideBarWidth = 300; // 示例中左侧导航的宽度

export default function ApproveExample() {
  const [nodeData, setNodeData] = useState();
  const [isShowHoverPanel, setIsShowHoverPanel] = useState(Boolean);
  const [hoverStyle, setHoverStyle] = useState({} as React.CSSProperties);

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    RegisteNode(lf);
    lf.render(data);
    initEvent(lf);
  }, []);
  // lf事件
  const initEvent = (lf: LogicFlow) => {
    lf.on('node:mouseenter', ({e, data}) => {
      setNodeData(data);
      setIsShowHoverPanel(true);
      data.id ? setHoverStyle({ top: e.clientY, left: e.clientX - sideBarWidth}) : setHoverStyle({ display: 'none' });
    });
    lf.on('node:mouseleave', () => {
      setNodeData(undefined);
      setIsShowHoverPanel(true);
    });
    lf.on('blank:mousemove', ({ e }) => {
      setHoverStyle({ top: e.clientY, left: e.clientX })
    });
  }
  return (
    <div className="approve-example-container">
      <div id="graph" className="viewport" />
      {isShowHoverPanel ? hoverPanel(hoverStyle, nodeData) : ''}
    </div>
  )
}

