import LogicFlow from '@logicflow/core';
import '@logicflow/core/dist/index.css';
import { useEffect, useRef } from 'react';
import './index.less';

// 图数据
const graphData = {
  nodes: [
    // 节点数据属性：节点1
    {
      id: 'node_id_1',
      type: 'rect',
      x: 50,
      y: 50,
      text: { x: 100, y: 100, value: '节点1' }, // 节点文本
      properties: {}, // 每个节点和边都有properties属性，后续会介绍到
    },
    // 节点2
    {
      id: 'node_id_2',
      type: 'circle',
      x: 200,
      y: 300,
      text: { x: 300, y: 300, value: '节点2' }, // 节点文本
      properties: {},
    },
  ],
  edges: [
    // 边数据属性
    {
      id: 'edge_id',
      type: 'polyline',
      sourceNodeId: 'node_id_1',
      targetNodeId: 'node_id_2',
      text: { x: 139, y: 200, value: '连线' }, // 连线文本
      properties: {},
    },
  ],
};

export default function App() {
  const refContainer = useRef(null);
  useEffect(() => {
    const lf = new LogicFlow({
      container: refContainer.current!,
      grid: true,
      stopScrollGraph: true, // 禁止鼠标滚动画布
      stopZoomGraph: true, // 禁止缩放画布
    });
    lf.render(graphData);
    lf.translateCenter(); // 将图形移动到画布中央
  }, []);
  return <div className="container" ref={refContainer}></div>;
}
