const { ProximityConnect } = Extension;

import {
  Space,
  Input,
  InputNumber,
  Button,
  Card,
  Divider,
  Row,
  Col,
  Form,
  Switch,
  Select,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';

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
      id: '3',
      type: 'ellipse',
      x: 950,
      y: 100,
      text: '椭圆',
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
    {
      id: '6',
      type: 'text',
      x: 950,
      y: 350,
      text: '纯文本节点',
    },
    {
      id: '7',
      type: 'html',
      x: 150,
      y: 600,
      text: 'html节点',
    },
  ],
};

const MenuExtension: React.FC = () => {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState<number>(100);
  const [reverse, setReverse] = useState<boolean>(false);
  const [enable, setEnable] = useState<boolean>(true);
  const [mode, setMode] = useState<'node' | 'anchor' | 'default'>('default');
  const [virtualStroke, setVirtualStroke] = useState<string>('#acacac');
  const [virtualDash, setVirtualDash] = useState<string>('10,10');
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        grid: {
          size: 10,
        },
        keyboard: {
          enabled: true,
        },
        plugins: [ProximityConnect],
        pluginsOptions: {
          proximityConnect: {
            enable,
            distance,
            reverseDirection: reverse,
            type: mode,
          },
        },
      });

      lf.render(data);
      lfRef.current = lf;

      // 初始化插件阈值、方向、启用状态、模式与虚拟边样式，确保与 UI 一致
      const pc = lf.extension.proximityConnect;
      pc.setThresholdDistance(distance);
      pc.setReverseDirection(reverse);
      pc.setEnable(enable);
      pc.type = mode;
      pc.setVirtualEdgeStyle({
        stroke: virtualStroke,
        strokeDasharray: virtualDash,
      });
    }
  }, []);

  return (
    <Card title="LogicFlow Extension - ProximityConnect">
      <Row>
        <Col span={8}>
          <Form.Item label="连线阈值：">
            <InputNumber
              value={distance}
              style={{ width: '120px' }}
              min={1}
              onChange={(val) => {
                const next = Number(val || 0);
                setDistance(next);
              }}
            />
            <Button
              type="primary"
              onClick={() => {
                if (lfRef.current) {
                  lfRef.current.extension.proximityConnect.setThresholdDistance(
                    distance,
                  );
                }
              }}
            >
              Submit
            </Button>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="连线方向：">
            <Switch
              checked={reverse}
              checkedChildren="最近节点 → 拖拽节点"
              unCheckedChildren="拖拽节点 → 最近节点"
              onChange={(checked) => {
                setReverse(checked);
                if (lfRef.current) {
                  lfRef.current.extension.proximityConnect.setReverseDirection(
                    checked,
                  );
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="启用状态：">
            <Switch
              checked={enable}
              checkedChildren="启用"
              unCheckedChildren="禁用"
              onChange={(checked) => {
                setEnable(checked);
                if (lfRef.current) {
                  lfRef.current.extension.proximityConnect.setEnable(checked);
                }
              }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <Form.Item label="模式：">
            <Select
              style={{ width: 180 }}
              value={mode}
              options={[
                { value: 'default', label: '混合（节点+锚点）' },
                { value: 'node', label: '仅节点拖拽' },
                { value: 'anchor', label: '仅锚点拖拽' },
              ]}
              onChange={(val) => {
                setMode(val);
                if (lfRef.current) {
                  lfRef.current.extension.proximityConnect.type = val;
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="虚拟边颜色：">
            <Input
              style={{ width: 180 }}
              value={virtualStroke}
              onChange={(e) => setVirtualStroke(e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="虚线样式：">
            <Input
              style={{ width: 180 }}
              value={virtualDash}
              onChange={(e) => setVirtualDash(e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Button
            onClick={() => {
              if (lfRef.current) {
                lfRef.current.extension.proximityConnect.setVirtualEdgeStyle({
                  stroke: virtualStroke,
                  strokeDasharray: virtualDash,
                });
              }
            }}
          >
            应用虚拟边样式
          </Button>
        </Col>
      </Row>
      <Space.Compact style={{ width: '100%' }}></Space.Compact>
      <Divider />
      <div ref={containerRef} id="graph"></div>
    </Card>
  );
};

const container = document.querySelector('#container');
const root = createRoot(container);

root.render(<MenuExtension></MenuExtension>);

insertCss(`
#graph{
  width: 100%;
  height: 550px;
}
`);
