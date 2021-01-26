import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import { Dnd } from '@logicflow/extension'

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
};

export default function DndPanleExample() {
  useEffect(() => {
    LogicFlow.use(Dnd);
    const lf = new LogicFlow({
      ...config,
      grid: {
        size: 10,
        type: 'dot'
      },
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.render();
  }, []);

  return <div id="graph" className="viewport" />;
}
