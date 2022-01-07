import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import { Menu } from '@logicflow/extension';
import ExampleHeader from '../../../../components/example-header';
import '@logicflow/extension/lib/style/index.css';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  textEdit: false,
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
interface MenuLogicFlow extends LogicFlow {
  addMenuConfig(config: any): void
}
let lf: MenuLogicFlow;
export default function CustomMenuExample() {
  useEffect(() => {
    LogicFlow.use(Menu);
    lf = new LogicFlow({
      ...config,
      grid: {
        size: 10,
        type: 'dot'
      },
      container: document.querySelector('#graph') as HTMLElement
    }) as MenuLogicFlow;
    lf.addMenuConfig({
      nodeMenu: [
        {
          text: '分享',
          callback() {
            alert('分享成功！');
          }
        },
        {
          text: '属性',
          callback(node: any) {
            alert(`
              节点id：${node.id}
              节点类型：${node.type}
              节点坐标：(x: ${node.x}, y: ${node.y})`
            );
          },
        }
      ],
      edgeMenu: [
        {
          text: '属性',
          callback(edge: any) {
            
            alert(`
              边id：${edge.id}
              边类型：${edge.type}
              源节点id：${edge.sourceNodeId}
              目标节点id：${edge.targetNodeId}`
            );
          },
        }
      ],
      graphMenu: [
        {
          text: '分享',
          callback() {
            alert('分享成功！');
          }
        }
      ]
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
