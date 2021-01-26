import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import { Snapshot } from '@logicflow/extension';
import ExampleHeader from '../../../components/example-header';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import 'antd/lib/button/style/index.css';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
}

const data = {
  nodes: [
    {
      id: 10,
      type: 'rect',
      x: 150,
      y: 70,
      text: '矩形'
    },
    {
      id: 20,
      type: 'circle',
      x: 400,
      y: 70,
      text: '圆形'
    }
  ],
  edges: [
    {
      type: 'line',
      sourceNodeId: 10,
      targetNodeId: 20,
      text: '直线',
      endPoint: {
        id: '150-60',
        x: 350,
        y: 70
      }
    }
  ]
};

const contentStyle = {
  display: 'flex',
  alignItems: 'center'
}

let lf: LogicFlow;

export default function SnapshotExample() {

  useEffect(() => {
    LogicFlow.use(Snapshot);
    lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.render(data)
  }, []);

  const handleDoenload = () => {
    lf.getSnapshot();
  }

  return (
    <>
      <ExampleHeader contentStyle={contentStyle}>
        导出图片：
        <Button
          shape="round"
          icon={<DownloadOutlined />}
          onClick={handleDoenload}
        />
      </ExampleHeader>
      <div id="graph" className="viewport" />
    </>
  )
}
