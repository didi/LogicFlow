import React, { useEffect, useRef, useState } from 'react';
import LogicFlow from '@logicflow/core';
import '@logicflow/core/dist/index.css';
import StatusButtons from './statusButton';
import { StatusEdge } from './statusEdge';
import { HoverEdge } from './hoverEdge';
const SilentConfig = {
  stopScrollGraph: true,
  stopMoveGraph: true,
  stopZoomGraph: true,
};
const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lf, setLf] = useState<LogicFlow | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const lfInstance = new LogicFlow({
      container: containerRef.current,
      grid: true,
      ...SilentConfig,
    });
    lfInstance.register(StatusEdge);
    lfInstance.register(HoverEdge);
    lfInstance.render({
      nodes: [
        {
          id: 'n1',
          type: 'rect',
          x: 100,
          y: 200,
        },
        {
          id: 'n2',
          type: 'rect',
          x: 500,
          y: 200,
        },
        {
          id: 'n3',
          type: 'rect',
          x: 100,
          y: 300,
        },
        {
          id: 'n4',
          type: 'rect',
          x: 500,
          y: 300,
        },
        {
          id: 'n5',
          type: 'rect',
          x: 100,
          y: 400,
        },
        {
          id: 'n6',
          type: 'rect',
          x: 500,
          y: 400,
        },
      ],
      edges: [
        {
          id: 'e1',
          type: 'status-edge',
          sourceNodeId: 'n1',
          targetNodeId: 'n2',
          text: '根据状态渲染的边颜色，先选中这条边',
          properties: { status: 'todo' },
        },
        {
          id: 'e2',
          type: 'polyline',
          text: '内置样式边',
          sourceNodeId: 'n3',
          targetNodeId: 'n4',
        },
        {
          id: 'e3',
          type: 'hover-edge',
          text: '鼠标移入hover变化',
          sourceNodeId: 'n5',
          targetNodeId: 'n6',
        },
      ],
    });
    lfInstance.translateCenter();
    //直接调用model修改style样式 但是不支持 因为属于直接越权操作了 建议还是继承getEdgeStyle方法
    const edgeModel = lfInstance.graphModel.getEdgeModelById('e2');
    edgeModel?.setStyles({
      stroke: '#722ed1',
      strokeWidth: 2,
      strokeDasharray: '5 5',
    });

    setLf(lfInstance);
  }, []);
  lf?.on('edge:mouseenter', ({ data }) => {
    if (data.type !== 'hover-edge') {
      return;
    }
    lf.setProperties(data.id, {
      isHover: true,
    });
  });

  lf?.on('edge:mouseleave', ({ data }) => {
    if (data.type !== 'hover-edge') {
      return;
    }
    lf.setProperties(data.id, {
      isHover: false,
    });
  });

  return (
    <div style={{ padding: 16 }}>
      {lf && <StatusButtons lf={lf} />}
      <div
        ref={containerRef}
        style={{ height: 600, border: '1px solid #eee', marginTop: 12 }}
      />
    </div>
  );
};

export default App;
