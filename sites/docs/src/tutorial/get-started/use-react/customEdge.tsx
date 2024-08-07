import React from 'react';
import ReactDOM from 'react-dom/client';
import { BaseEdgeModel, LineEdge, h } from '@logicflow/core';

const DEFAULT_WIDTH: number = 48;
const DEFAULT_HEIGHT: number = 32;

class CustomEdgeModel extends BaseEdgeModel {
  getEdgeStyle() {
    const edgeStyle = super.getEdgeStyle();
    //可以自己设置线的显示样式，甚至隐藏掉原本的线，自己用react绘制
    edgeStyle.strokeDasharray = '4 4';
    edgeStyle.stroke = '#DDDFE3';
    return edgeStyle;
  }
}

const CustomLine: React.FC = () => {
  return <div className="custom-edge">aaa</div>;
};

class CustomEdgeView extends LineEdge {
  getEdge() {
    const { model } = this.props;
    const {
      customWidth = DEFAULT_WIDTH,
      customHeight = DEFAULT_HEIGHT,
    }: {
      customWidth?: number;
      customHeight?: number;
    } = model.getProperties();
    const id = model.id;
    const edgeStyle = model.getEdgeStyle();
    const { startPoint, endPoint, arrowConfig } = model;
    const lineData = {
      x1: startPoint.x,
      y1: startPoint.y,
      x2: endPoint.x,
      y2: endPoint.y,
    };
    const positionData = {
      x: (startPoint.x + endPoint.x - customWidth) / 2,
      y: (startPoint.y + endPoint.y - customHeight) / 2,
      width: customWidth,
      height: customHeight,
    };
    const wrapperStyle = {
      width: customWidth,
      height: customHeight,
    };

    setTimeout(() => {
      ReactDOM.createRoot(document.querySelector('#' + id)!).render(
        <CustomLine />,
      );
    }, 0);
    return h('g', {}, [
      h('line', { ...lineData, ...edgeStyle, ...arrowConfig }),
      h('foreignObject', { ...positionData }, [
        h('div', {
          id,
          style: wrapperStyle,
          className: 'lf-custom-edge-wrapper',
        }),
      ]),
    ]);
  }

  getAppend() {
    return h('g', {}, []);
  }
}

export default {
  type: 'CustomEdge',
  view: CustomEdgeView,
  model: CustomEdgeModel,
};
