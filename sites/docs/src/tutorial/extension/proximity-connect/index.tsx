import LogicFlow from '@logicflow/core';
import { ProximityConnect } from '@logicflow/extension';

import {
  Space,
  Input,
  Button,
  Card,
  Divider,
  Row,
  Col,
  Form,
  Switch,
} from 'antd';
import { useEffect, useRef, useState } from 'react';

import '@logicflow/core/es/index.css';
import '@logicflow/extension/es/index.css';

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
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
      x: 550,
      y: 100,
      text: '圆形',
    },
    {
      id: '4',
      type: 'polygon',
      x: 150,
      y: 350,
      text: '多边形',
    },
    {
      id: '5',
      type: 'diamond',
      x: 550,
      y: 350,
      text: '菱形',
    },
  ],
};

export default function ProximityConnectExtension() {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState<number>(100);
  const [reverse, setReverse] = useState<boolean>(false);
  const [enable, setEnable] = useState<boolean>(true);
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        // container: document.querySelector('#graph') as HTMLElement,
        grid: {
          size: 10,
        },
        plugins: [ProximityConnect],
        pluginsOptions: {
          proximityConnect: {
            enable,
            distance,
            reverseDirection: reverse,
          },
        },
      });

      lf.render(data);
      lfRef.current = lf;
    }
  }, []);

  return (
    <Card title="LogicFlow Extension - proximity-connect">
      <Row>
        <Col span={24}>
          <Form.Item label="连线阈值：">
            <Input
              value={distance}
              style={{ width: '200px' }}
              onInput={(e) => {
                setDistance(+e.target.value);
              }}
            />
            <Button
              type="primary"
              onClick={() => {
                if (lfRef.current) {
                  (
                    lfRef.current.extension.proximityConnect as ProximityConnect
                  ).setThresholdDistance(distance);
                }
              }}
            >
              Submit
            </Button>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="连线方向：">
            <Switch
              value={reverse}
              checkedChildren="最近节点 → 拖拽节点"
              unCheckedChildren="拖拽节点 → 最近节点"
              onChange={(checked) => {
                setReverse(checked);
                if (lfRef.current) {
                  (
                    lfRef.current.extension.proximityConnect as ProximityConnect
                  ).setReverseDirection(checked);
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="启用状态：">
            <Switch
              value={enable}
              checkedChildren="启用"
              unCheckedChildren="禁用"
              onChange={(checked) => {
                setEnable(checked);
                if (lfRef.current) {
                  (
                    lfRef.current.extension.proximityConnect as ProximityConnect
                  ).setEnable(checked);
                }
              }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Space.Compact style={{ width: '100%' }}></Space.Compact>
      <Divider />
      <div ref={containerRef} id="graph" style={{ height: '500px' }}></div>
    </Card>
  );
}
