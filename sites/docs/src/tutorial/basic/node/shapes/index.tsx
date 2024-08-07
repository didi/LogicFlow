import React from 'react';
import LogicFlow from '@logicflow/core';
import '@logicflow/core/es/index.css';

import data from './shapesData';
import '../../../index.less';

const SilentConfig = {
  isSilentMode: true, // 仅浏览不可编辑
  stopScrollGraph: true, // 禁止鼠标滚动移动画布
  stopMoveGraph: true, // 禁止拖动画布
  stopZoomGraph: true, // 禁止缩放画布
  adjustNodePosition: true, // 允许拖动节点
};

const styleConfig: Partial<LogicFlow.Options> = {
  style: {
    rect: {
      rx: 5,
      ry: 5,
      strokeWidth: 2,
    },
    circle: {
      fill: '#f5f5f5',
      stroke: '#666',
    },
    ellipse: {
      fill: '#dae8fc',
      stroke: '#6c8ebf',
    },
    polygon: {
      fill: '#d5e8d4',
      stroke: '#82b366',
    },
    diamond: {
      fill: '#ffe6cc',
      stroke: '#d79b00',
    },
    text: {
      color: '#b85450',
      fontSize: 12,
    },
  },
};

export default class Example extends React.Component {
  private container?: HTMLDivElement;

  componentDidMount() {
    const lf = new LogicFlow({
      container: this.container!,
      grid: true,
      ...SilentConfig,
      ...styleConfig,
    });

    lf.render(data);
    lf.translateCenter();
  }

  refContainer = (container: HTMLDivElement) => {
    this.container = container;
  };

  render() {
    return (
      <div className="helloworld-app">
        <div className="app-content" ref={this.refContainer} />
      </div>
    );
  }
}
