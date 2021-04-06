import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  textEdit: false,
  grid: {
    size: 10,
    type: 'mesh'
  },
  tool: {
    menu: false,
    control: false,
  },
  style: {
    rect: {
      width: 100,
      height: 50,
      radius: 6,
      fill: '#3eaf7c',
      strokeWidth: 2
    },
    circle: {
      r: 40,
      fill: '#3eaf7c',
      strokeWidth: 2
    },
    nodeText: {
      fontSize: 16,
      color: '#000000'
    },
    edgeText: {
      fontSize: 16,
      color: '#000000'
    }
  }
};

const data = {
  nodes: [
    {
      id: 10,
      type: 'circle',
      x: 250,
      y: 100,
      text: 'circle'
    },
    {
      id: 20,
      type: 'rect',
      x: 180,
      y: 260,
      text: 'rect'
    },
    {
      id: 30,
      type: 'rect',
      x: 320,
      y: 260,
      text: 'rect'
    }
  ],
  edges: [
    {
      type: 'line',
      sourceNodeId: 10,
      targetNodeId: 20,
      startPoint: {
        id: '250-140',
        x: 250,
        y: 140
      }
    },
    {
      type: 'line',
      sourceNodeId: 10,
      targetNodeId: 30,
      startPoint: {
        id: '250-140',
        x: 250,
        y: 140
      }
    }
  ]
};

export default function ThemeExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.render(data);
  }, []);

  return <div id="graph" className="viewport" />;
}
