import { Button, Space } from 'antd';
import React, { useEffect, useRef } from 'react';

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
};

class CustomCurvedEdge extends CurvedEdge {}

class CustomCurvedEdgeModel extends CurvedEdgeModel {
  initEdgeData(data: LogicFlow.EdgeData) {
    super.initEdgeData(data);
    this.radius = 20;
  }
  getEdgeStyle() {
    const style = super.getEdgeStyle();
    style.strokeWidth = 3;
    return style;
  }
}

const CustomCurved = {
  type: 'customCurvedEdge',
  model: CustomCurvedEdgeModel,
  view: CustomCurvedEdge,
};

const container = document.querySelector('#container');
const root = createRoot(container);

const App: React.FC = () => {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!lfRef.current && containerRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        grid: {
          size: 10,
        },
      });

      lf.register(CustomCurved);
      lf.setDefaultEdgeType('customCurvedEdge');

      lf.render({
        nodes: [
          {
            id: '1',
            type: 'rect',
            x: 150,
            y: 320,
            properties: {},
          },
          {
            id: '2',
            type: 'rect',
            x: 630,
            y: 320,
            properties: {},
          },
        ],
        edges: [
          {
            id: '1-2',
            type: 'customCurvedEdge',
            sourceNodeId: '1',
            targetNodeId: '2',
            startPoint: {
              x: 200,
              y: 320,
            },
            endPoint: {
              x: 580,
              y: 320,
            },
            properties: {
              textPosition: 'center',
            },
            text: {
              x: 390,
              y: 320,
              value: '边文本3',
            },
            pointsList: [
              {
                x: 200,
                y: 320,
              },
              {
                x: 580,
                y: 320,
              },
            ],
          },
          {
            id: '5b8fb346-eb4e-4627-abfa-463251db21bd',
            type: 'customCurvedEdge',
            sourceNodeId: '1',
            targetNodeId: '2',
            startPoint: {
              x: 150,
              y: 280,
            },
            endPoint: {
              x: 630,
              y: 280,
            },
            properties: {
              textPosition: 'center',
            },
            text: {
              x: 390,
              y: 197,
              value: '边文本2',
            },
            pointsList: [
              {
                x: 150,
                y: 280,
              },
              {
                x: 150,
                y: 197,
              },
              {
                x: 630,
                y: 197,
              },
              {
                x: 630,
                y: 280,
              },
            ],
          },
          {
            id: 'a9df1609-2511-4ffd-8caa-fdb9b76be358',
            type: 'customCurvedEdge',
            sourceNodeId: '2',
            targetNodeId: '1',
            startPoint: {
              x: 630,
              y: 360,
            },
            endPoint: {
              x: 150,
              y: 360,
            },
            properties: {
              textPosition: 'center',
            },
            text: {
              x: 390,
              y: 458,
              value: '边文本4',
            },
            pointsList: [
              {
                x: 630,
                y: 360,
              },
              {
                x: 630,
                y: 458,
              },
              {
                x: 150,
                y: 458,
              },
              {
                x: 150,
                y: 360,
              },
            ],
          },
          {
            id: '9033c248-f068-4a02-a0a2-d0a6f82321f5',
            type: 'customCurvedEdge',
            sourceNodeId: '1',
            targetNodeId: '2',
            startPoint: {
              x: 100,
              y: 320,
            },
            endPoint: {
              x: 680,
              y: 320,
            },
            properties: {
              textPosition: 'center',
            },
            text: {
              x: 390,
              y: 114,
              value: '边文本1',
            },
            pointsList: [
              {
                x: 100,
                y: 320,
              },
              {
                x: 70,
                y: 320,
              },
              {
                x: 70,
                y: 114,
              },
              {
                x: 760,
                y: 114,
              },
              {
                x: 760,
                y: 320,
              },
              {
                x: 680,
                y: 320,
              },
            ],
          },
        ],
      });

      lfRef.current = lf;
    }
  }, []);

  return (
    <>
      <Space className="header">
        <Button
          type="primary"
          onClick={() => {
            if (lfRef.current) {
              const graphData = lfRef.current?.getGraphRawData();
              console.log('graphData --->>>', graphData);
            }
          }}
        >
          获取当前图数据
        </Button>
      </Space>
      <div ref={containerRef} id="graph"></div>
    </>
  );
};

root.render(<App></App>);

insertCss(`
.header {
  height: 50px;
}
#graph{
  width: 100%;
  height: calc(100% - 50px);
}
`);
