import React, { useEffect, useRef } from 'react';

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
};

const theme: Partial<LogicFlow.Theme> = {
  baseNode: {
    fill: 'rgb(255, 230, 204)',
    stroke: '#00796b',
    strokeDasharray: '3,3',
  },
  rect: {
    fill: '#FFFFFF',
    strokeDasharray: '10, 1',
    className: 'custom-cls',
    radius: 30,
  },
  circle: {
    r: 10,
    fill: '#9a9b9c',
  },
  diamond: {
    fill: '#238899',
  },
  ellipse: {
    strokeWidth: 3,
  },
  polygon: {
    strokeDasharray: 'none',
  },
  anchor: {
    r: 3,
    fill: '#9a9312',
    hover: {
      fill: '#d84315',
    },
  },
  nodeText: {
    fontSize: 16,
    color: '#d84315',
    overflowMode: 'autoWrap',
  },
  baseEdge: {
    strokeWidth: 1,
    strokeDasharray: '3,3',
  },
  edgeText: {
    fontSize: 12,
    textWidth: 60,
    overflowMode: 'autoWrap',
    background: {
      fill: '#919810',
    },
  },
  polyline: {
    offset: 20,
    strokeDasharray: 'none',
    strokeWidth: 2,
  },
  bezier: {
    stroke: '#d84315',
    adjustLine: {
      strokeWidth: 2,
      stroke: '#d84315',
    },
    adjustAnchor: {
      stroke: 'blue',
      fill: '#00796b',
    },
  },
  arrow: {
    offset: 10, // 箭头长度
    verticalLength: 3, // 箭头垂直于边的距离
    fill: 'none',
    stroke: '#00796b',
  },
  anchorLine: {
    stroke: '#d84315',
  },
  snapline: {
    stroke: '#d84315',
  },
  edgeAdjust: {
    r: 10,
  },
  outline: {
    stroke: '#d84315',
    hover: {
      stroke: '#00796b',
    },
  },
};

const data = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 150,
      y: 100,
      text: '矩形',
    },
    {
      id: '2',
      type: 'circle',
      x: 350,
      y: 100,
      text: '圆形',
    },
    {
      id: '3',
      type: 'ellipse',
      x: 550,
      y: 100,
      text: '椭圆',
    },
    {
      id: '4',
      type: 'polygon',
      x: 150,
      y: 250,
      text: '多边形',
    },
    {
      id: '5',
      type: 'diamond',
      x: 350,
      y: 250,
      text: '菱形',
    },
    {
      id: '6',
      type: 'text',
      x: 550,
      y: 250,
      text: '纯文本节点',
    },
    {
      id: '7',
      type: 'html',
      x: 150,
      y: 400,
      text: 'html节点',
    },
  ],
  edges: [
    // TODO: 解决线段中间弯折问题
    {
      sourceNodeId: '1',
      targetNodeId: '3',
      startPoint: {
        x: 150,
        y: 60,
      },
      endPoint: {
        x: 550,
        y: 50,
      },
      text: '333',
      type: 'polyline',
    },
    {
      sourceNodeId: '3',
      targetNodeId: '4',
      type: 'line',
    },
    {
      sourceNodeId: '3',
      targetNodeId: '5',
      type: 'bezier',
    },
  ],
};

const container = document.querySelector('#container');
const root = createRoot(container);

const App: React.FC = () => {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        // container: document.querySelector('#graph') as HTMLElement,
        grid: {
          size: 10,
        },
      });
      lf.setTheme(theme);
      lf.render(data);
      lfRef.current = lf;
      lf.translateCenter();
    }
  }, []);

  return <div ref={containerRef} id="graph"></div>;
};

root.render(<App></App>);

insertCss(`
#graph{
  width: 100%;
  height: 100%;
}

.btn {
  margin-top: 10px;
  margin-right: 10px;
}

.select {
  width: 200px;
  margin-top: 10px;
  margin-right: 10px;
}
`);
