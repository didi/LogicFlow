import LogicFlow from '@logicflow/core';
import { useEffect, useRef } from 'react';
import CustomEdge from './customEdge';
import './index.less';

export default function App() {
  const testData = {
    nodes: [
      {
        type: 'rect',
        x: 100,
        y: 100,
        text: '节点1',
        id: 'node_id_1',
      },
      {
        type: 'rect',
        text: '节点2',
        x: 100,
        y: 300,
        id: 'node_id_2',
      },
    ],
    edges: [
      {
        id: 'edge_id_1',
        type: 'CustomEdge',
        sourceNodeId: 'node_id_1',
        properties: {},
        targetNodeId: 'node_id_2',
      },
    ],
  };
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const lf = new LogicFlow({
      container: containerRef.current as HTMLElement,
      height: 400,
    });
    lf.register(CustomEdge);
    lf.render(testData);
    lf.translateCenter();
  }, []);
  return (
    <div className="App">
      <div ref={containerRef} />
    </div>
  );
}
