import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import { NodeResize } from '@logicflow/extension';
import ExampleHeader from '../../../components/example-header';
import 'antd/lib/button/style/index.css';
import './index.css';

const config = {
  background: {
    color: '#f7f9ff'
  },
  grid: {
    type: 'dot',
    size: 5,
    visible: false,
  },
  keyboard: {
    enabled: true
  },
}

const data = {
  nodes: [
    {
      id: 10,
      type: 'rect',
      x: 100,
      y: 100,
    },
    {
      id: 20,
      type: 'rect',
      x: 400,
      y: 100,
    },
  ],
  edges: [
    {
      type: 'polyline',
      sourceNodeId: 10,
      targetNodeId: 20,
    },
  ],
};

const contentStyle = {
  display: 'flex',
  alignItems: 'center'
}

let lf: LogicFlow;

export default function NodeResizeExample() {

  useEffect(() => {
    NodeResize.style.outline = {
      ...NodeResize.style.outline,
      stroke: '#1E90FF',
      strokeDasharray: '',
    }
    LogicFlow.use(NodeResize);
    lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.render(data)
  }, []);
  const addNode = (type: string) => {
    lf.dnd.startDrag({
      type: type,
    });
  }

  return (
    <>
      <ExampleHeader
        contentStyle={contentStyle}
        githubPath="/extension/NodeResize/index.tsx"
      >
        节点缩放
      </ExampleHeader>
      <div className="node-resize-list">
        <div>拖拽添加节点</div>
        <div className="node-resize-rect" onMouseDown={() => addNode('rect')}></div>
        <div className="node-resize-ellipse" onMouseDown={() => addNode('ellipse')}></div>
        <div className="node-resize-diamond" onMouseDown={() => addNode('diamond')}></div>
      </div>
      <div id="graph" className="viewport" />
    </>
  )
}
