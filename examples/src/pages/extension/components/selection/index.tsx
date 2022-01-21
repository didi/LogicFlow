import React, { useEffect, useState } from 'react';
import LogicFlow from '@logicflow/core';
import { SelectionSelect } from '@logicflow/extension';
import ExampleHeader from '../../../../components/example-header/index';
import { Switch } from 'antd';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  stopMoveGraph: true,
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
  const [isOpened, setIsOpened] = useState(true);

  useEffect(() => {
    LogicFlow.use(SelectionSelect);
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
    if (isOpened) {
      lf.extension.selectionSelect.closeSelectionSelect();
    } else {
      lf.extension.selectionSelect.openSelectionSelect();
    }
    setIsOpened(!isOpened);
  }

  return (
    <>
      <ExampleHeader
        content="开启多选功能"
        githubPath="/extension/components/selection/index.tsx"
      >
        <Switch defaultChecked onChange={handleSwitch} />
      </ExampleHeader>
      <div id="graph" className="viewport" />
    </>
  );
}
