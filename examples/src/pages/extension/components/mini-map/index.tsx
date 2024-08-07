import React, { useEffect, useState } from 'react';
import LogicFlow from '@logicflow/core';
import { MiniMap } from '@logicflow/extension';
import ExampleHeader from '../../../../components/example-header/index';
import { Switch } from 'antd';
import './index.css';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
};

const data = {
  nodes: [
    {
      id: 10,
      type: 'rect',
      x: 100,
      y: 100,
      text: '你好！'
    },
    {
      id: 20,
      type: 'circle',
      x: 400,
      y: 100,
      text: '你好！'
    }
  ],
  edges: [
    {
      type: 'line',
      sourceNodeId: 10,
      targetNodeId: 20,
      endPoint: {
        id: '150-150',
        x: 350,
        y: 100
      }
    }
  ]
};

let lf: LogicFlow;

export default function DndPanelExample() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // @ts-ignore
    LogicFlow.use(MiniMap);
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

  function handleSwitch() {
    if (show) {
      lf.extension.miniMap.hide();
      setShow(false);
    } else {
      lf.extension.miniMap.show();
      setShow(true);
    }
  }

  return (
    <>
      <ExampleHeader
        content="显示 mini-map"
        githubPath="/extension/components/mini-map/index.tsx"
      >
        <Switch onChange={handleSwitch} />
      </ExampleHeader>
      <div id="graph" className="viewport" />
    </>
  );
}
