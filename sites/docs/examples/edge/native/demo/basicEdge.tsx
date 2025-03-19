import React, { useEffect, useRef, useState } from 'react';
import { Card, Flex, Form, Divider, Slider, Switch, Select } from 'antd';

const container = document.querySelector('#container');
const root = createRoot(container);

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
  adjustEdge: false,
  keyboard: {
    enabled: true,
  },
  height: 500,
  style: {
    rect: {
      rx: 5,
      ry: 5,
      strokeWidth: 2,
    },
    circle: {
      fill: '#f5f5f5',
      stroke: '#666',
    },
    ellipse: {
      fill: '#dae8fc',
      stroke: '#6c8ebf',
    },
    polygon: {
      fill: '#d5e8d4',
      stroke: '#82b366',
    },
    diamond: {
      fill: '#ffe6cc',
      stroke: '#d79b00',
    },
    text: {
      color: '#b85450',
      fontSize: 12,
    },
  },
  edgeGenerator: (sourceNode) => {
    // 限制'rect', 'diamond', 'polygon'节点的连线为贝塞尔曲线
    switch (sourceNode.id) {
      case '1':
      case '2':
        return 'line';
      case '3':
      case '4':
        return 'dynamicOffsetPolyline';
      default:
        return 'dynamicOffsetBezier';
    }
  },
};

class DynamicOffsetPolylineModel extends PolylineEdgeModel {
  setAttributes(): void {
    console.log('DynamicOffsetPolylineModel this.properties', this.properties);
    this.offset = this?.properties?.offset || 30;
    this.updatePoints();
  }
}

class DynamicOffsetBezierModel extends BezierEdgeModel {
  setAttributes(): void {
    super.setAttributes();
    console.log('DynamicOffsetBezierModel this.properties', this.properties);
    this.offset = this?.properties?.offset || 100;
    this.updatePoints();
  }
}

const dynamicOffsetPolyline = {
  type: 'dynamicOffsetPolyline',
  view: PolylineEdge,
  model: DynamicOffsetPolylineModel,
};

const dynamicOffsetBezier = {
  type: 'dynamicOffsetBezier',
  view: BezierEdge,
  model: DynamicOffsetBezierModel,
};

const data = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 160,
      y: 160,
      text: '1',
      properties: {
        width: 50,
        height: 50,
      },
    },
    {
      id: '2',
      type: 'rect',
      x: 400,
      y: 200,
      text: '2',
      properties: {
        width: 50,
        height: 50,
      },
    },
    {
      id: '3',
      type: 'rect',
      x: 160,
      y: 320,
      text: '3',
      properties: {
        width: 50,
        height: 50,
      },
    },
    {
      id: '4',
      type: 'rect',
      x: 400,
      y: 360,
      text: '4',
      properties: {
        width: 50,
        height: 50,
      },
    },
    {
      id: '5',
      type: 'rect',
      x: 160,
      y: 480,
      text: '5',
      properties: {
        width: 50,
        height: 50,
      },
    },
    {
      id: '6',
      type: 'rect',
      x: 400,
      y: 540,
      text: '6',
      properties: {
        width: 50,
        height: 50,
      },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      type: 'line',
      sourceNodeId: '1',
      targetNodeId: '2',
      text: '直线',
    },
    {
      id: 'edge-2',
      type: 'dynamicOffsetPolyline',
      sourceNodeId: '3',
      targetNodeId: '4',
      text: '折线',
    },
    {
      id: 'edge-3',
      type: 'dynamicOffsetBezier',
      sourceNodeId: '5',
      targetNodeId: '6',
      text: '曲线',
    },
  ],
};

const BasicNode: React.FC = () => {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [polylineOffset, setPolylineOffset] = useState(20);
  const [bezierOffset, setBezierOffset] = useState(20);
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
      lf.register(dynamicOffsetPolyline);
      lf.register(dynamicOffsetBezier);
      lf.render(data);
      lf.focusOn('edge-2');
      lfRef.current = lf;
      (window as any).lf = lf;
    }
  }, []);

  return (
    <Card title="LogicFlow - BasicEdge">
      <Flex wrap="wrap" gap="middle" align="center" justify="space-between">
        <Form layout="inline">
          <Form.Item label="支持调整边">
            <div style={{ width: '100px' }}>
              <Switch
                checkedChildren="开启"
                unCheckedChildren="关闭"
                onClick={() => {
                  if (lfRef.current) {
                    const graphData = lfRef.current?.getEditConfig();
                    const { adjustEdge } = graphData;
                    lfRef.current.updateEditConfig({
                      adjustEdge: !adjustEdge,
                    });
                  }
                }}
              />
            </div>
          </Form.Item>
          <Form.Item label="折线边offset">
            <div style={{ width: '100px' }}>
              <Slider
                min={0}
                max={200}
                step={10}
                value={polylineOffset}
                onChange={(value) => {
                  console.log('折线边offset', value);
                  setPolylineOffset(value);
                  lfRef.current?.graphModel.edges.forEach((edge) => {
                    if (edge.type === 'dynamicOffsetPolyline') {
                      edge.setProperties({
                        offset: value,
                      });
                    }
                    console.log('edge', edge);
                  });
                }}
              />
            </div>
          </Form.Item>
          <Form.Item label="曲线边offset">
            <div style={{ width: '100px' }}>
              <Slider
                min={0}
                max={1000}
                step={100}
                value={bezierOffset}
                onChange={(value) => {
                  setBezierOffset(value);
                  lfRef.current?.graphModel.edges.forEach((edge) => {
                    if (edge.type === 'dynamicOffsetBezier') {
                      edge.setProperties({
                        offset: value,
                      });
                    }
                  });
                }}
              />
            </div>
          </Form.Item>
          <Form.Item label="修改选中边的类型">
            <Select
              style={{ width: 120 }}
              options={[
                { value: 'line', label: '直线边' },
                { value: 'dynamicOffsetPolyline', label: '折线边' },
                { value: 'dynamicOffsetBezier', label: '曲线边' },
              ]}
              onChange={(value) => {
                // eslint-disable-next-line no-unsafe-optional-chaining
                const { edges = [] } = lfRef?.current?.getSelectElements();
                edges.map((edge) => {
                  lfRef.current?.changeEdgeType(edge.id, value);
                });
              }}
            />
          </Form.Item>
        </Form>
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph"></div>
    </Card>
  );
};

root.render(<BasicNode></BasicNode>);

insertCss(`
#graph{
  width: 100%;
  height: 100%;
}
`);
