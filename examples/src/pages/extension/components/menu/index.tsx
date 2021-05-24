import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import { Menu } from '@logicflow/extension';
import ExampleHeader from '../../../../components/example-header';
import CustomCircle from './CustomCircle';
import './menu.css';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
};

const data = {
  nodes: [
    {
      id: 10,
      type: 'rect',
      x: 150,
      y: 80,
      text: '右键菜单'
    },
    {
      id: 11,
      type: 'circle',
      x: 550,
      y: 150,
      text: '单一类型菜单'
    },
    {
      id: 12,
      type: 'custom:circle',
      x: 200,
      y: 200,
      text: '业务状态菜单'
    }
  ],
  edges: [
    {
      type: 'bezier',
      text: '连接',
      sourceNodeId: 10,
      targetNodeId: 11
    }
  ]
};

export default function MenuExample() {
  useEffect(() => {
    LogicFlow.use(Menu);
    const lf = new LogicFlow({
      ...config,
      grid: {
        size: 10,
        type: 'dot'
      },
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.register(CustomCircle);
    lf.setMenuByType({
      type: 'circle',
      menu: [
        {
          text: '圆的菜单',
          callback: ()=> {
            alert('callback');
          }
        }
      ]
    });
    lf.render(data);
    lf.on('custom:node:event', (res) => {
      console.log(res);
      alert('接收到自定义节点菜单触发事件')
    })
  }, []);

  return (
    <>
      <ExampleHeader
        content="右键节点展示菜单"
        githubPath="/extension/components/menu/index.tsx"
      />
      <div id="graph" className="viewport" />
    </>
  )
}
