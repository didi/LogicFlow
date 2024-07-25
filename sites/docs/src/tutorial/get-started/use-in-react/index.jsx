import LogicFlow from '@logicflow/core';
import '@logicflow/core/dist/index.css';
import { useEffect, useRef } from 'react';

export default function App() {
  const refContainer = useRef(null);
  const data = {
    // 节点
    nodes: [
      {
        id: '21',
        type: 'rect',
        x: 300,
        y: 100,
        text: 'rect node',
      },
      {
        id: '50',
        type: 'circle',
        x: 500,
        y: 100,
        text: 'circle node',
      },
    ],
    // 边
    edges: [
      {
        type: 'polyline',
        sourceNodeId: '50',
        targetNodeId: '21',
      },
    ],
  };
  useEffect(() => {
    const lf = new LogicFlow({
      container: refContainer.current,
      grid: true,
      height: 200,
    });
    lf.render(data);
    lf.translateCenter();
  }, []);

  return <div className="App" ref={refContainer}></div>;
}
