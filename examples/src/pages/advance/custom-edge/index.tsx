import React, { useEffect } from 'react';
import LogicFlow from 'logic-flow';
import { registerCustomPolylineEdge } from './customPolylineEdge';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  tool: {
    menu: false,
    control: false
  }
};

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
      type: 'customPolyline',
      sourceNodeId: 10,
      targetNodeId: 20,
      text: '自定义直角折线和箭头',
      startPoint: {
        id: '150-110',
        x: 150,
        y: 110
      },
      endPoint: {
        id: '150-60',
        x: 400,
        y: 120
      },
      properties: {
        isExecuted: true
      }
    }
  ]
};

export default function CustomEdgeExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.register('customPolyline', registerCustomPolylineEdge);
    lf.render(data);
  }, []);

  return <div id="graph" className="viewport" />;
}
