import React, { useEffect } from 'react';
import LogicFlow from 'logic-flow';
import ExampleHeader from '../../../../components/example-header';
import '../../../../assets/iconfont/iconfont.css';
import './index.css';

const item = `<i class='iconfont icon-info'></i>属性`;

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  textEdit: false,
  tool: {
    menu: true,
    control: false,
  },
  nodeMenuConfig: [
    {
      text: item,
      className: 'lf-menu-item',
      callback(nodeModel: any) {
        console.log(nodeModel);
        alert(`
          节点id：${nodeModel.id}
          节点类型：${nodeModel.type}
          节点坐标：(x: ${nodeModel.x}, y: ${nodeModel.y})`
        );
      },
    }
  ],
  edgeMenuConfig: [],
  graphMenuConfig: [
    {
      text: '分享',
      className: 'lf-menu-item',
      callback(graphModel: any) {
        alert('分享成功！');
      },
    }
  ]
};

const data = {
  nodes: [
    {
      id: 10,
      type: 'rect',
      x: 150,
      y: 80,
      text: '右键节点'
    },
    {
      id: 20,
      type: 'rect',
      x: 400,
      y: 80,
      text: '右键节点'
    }
  ],
  edges: [
    {
      type: 'line',
      sourceNodeId: 10,
      targetNodeId: 20,
      text: '右键连线',
      endPoint: {
        id: '150-60',
        x: 350,
        y: 80
      }
    }
  ]
};

let lf: LogicFlow;

export default function CustomMenuExample() {

  useEffect(() => {
    lf = new LogicFlow({
      ...config,
      grid: {
        size: 10,
        type: 'dot'
      },
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.render(data);
  }, []);

  return (
    <>
      <ExampleHeader content="分别右键节点和画布来展示菜单" />
      <div id="graph" className="viewport" />
    </>
  )
}
