import React, { useEffect, useState } from 'react';
import LogicFlow, { EdgeType } from '@logicflow/core';
import { CurvedEdge } from '@logicflow/extension';
import ExampleHeader from '../../../components/example-header';

type EdgeTypeUn = EdgeType | 'curved-edge';

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
      y: 100,
      text: '矩形'
    },
    {
      id: 20,
      type: 'circle',
      x: 400,
      y: 100,
      text: '圆形'
    },
    {
      id: 30,
      type: 'diamond',
      x: 300,
      y: 300,
      text: '菱形'
    },
    {
      id: 33,
      type: 'diamond',
      x: 600,
      y: 250,
      text: '菱形2'
    }
  ],
  edges: [
    {
      type: 'polyline',
      sourceNodeId: 10,
      targetNodeId: 20,
      text: '直角折线',
      startPoint: {
        id: '150-60',
        x: 150,
        y: 60
      }
    },
    {
      type: 'line',
      sourceNodeId: 10,
      targetNodeId: 20,
      text: '直线',
      endPoint: {
        id: '150-60',
        x: 350,
        y: 100
      }
    },
    {
      type: 'bezier',
      sourceNodeId: 10,
      targetNodeId: 30,
      text: '曲线',
      endPoint: {
        id: '150-60',
        x: 300,
        y: 250
      }
    },
    {
      type: 'curved-edge',
      sourceNodeId: 30,
      targetNodeId: 33,
      text: '圆角曲线',
    }
  ]
};

export default function EdgeExample() {
  const [type, setType] = useState('折线');
  const [lf, setLf] = useState<LogicFlow>();

  useEffect(() => {
    // @ts-ignore
    LogicFlow.use(CurvedEdge);
    const logicflow = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    logicflow.render(data);
    setLf(logicflow);
  }, []);
  const setEdgeType = (type: EdgeTypeUn, typeName: string): void => {
    const logicflow = lf as LogicFlow;
    logicflow.setDefaultEdgeType(type as EdgeType);
    setType(typeName);
  }

  return (
    <>
      <ExampleHeader
        content="尝试为矩形和圆形手动添加连线"
        githubPath="/basic/edge/index.tsx"
      />
      <div>当前：{type}</div>
      <div>
        <button onClick={() => setEdgeType('line', '直线')}>直线</button>
        <button onClick={() => setEdgeType('polyline', '折线')}>折线</button>
        <button onClick={() => setEdgeType('curved-edge', '圆角折线')}>圆角折线</button>
        <button onClick={() => setEdgeType('bezier', '曲线')}>曲线</button>
      </div>
      <div id="graph" className="viewport" />
    </>
  )
}
