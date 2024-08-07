import { Button, Divider, Flex } from 'antd';
import React, { useEffect, useRef } from 'react';

import '@logicflow/core/es/index.css';
import '@logicflow/extension/es/index.css';

const { Label } = Extension;

const theme: Partial<LogicFlow.Theme> = {
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
};

const config: Partial<LogicFlow.Options> = {
  allowResize: true,
  allowRotate: true,

  // draggable 相关配置
  textDraggable: true,
  edgeTextDraggable: false,
  nodeTextDraggable: true,

  // editable 相关配置
  textEdit: true,
  // nodeTextEdit: true,
  // edgeTextEdit: true,

  isSilentMode: false,
  stopZoomGraph: true,
  stopScrollGraph: false,
  // overlapMode: OverlapMode.INCREASE,
  style: theme,
};

const data = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 150,
      y: 100,
      text: '锄禾日当午，汗滴禾下土；谁知盘中餐，粒粒皆辛苦。',
      draggable: true,
      properties: {
        _label: [
          {
            x: 150,
            y: 100,
            value: '锄禾日当午，汗滴禾下土；谁知盘中餐，粒粒皆辛苦。',
            content: '锄禾日当午，汗滴禾下土；谁知盘中餐，粒粒皆辛苦。',
            draggable: true,
            style: { color: 'blue' },
            textOverflowMode: 'ellipsis',
          },
          {
            x: 100,
            y: 50,
            value: 'abcdefghijklmnopqrstuvwxyz',
            content: 'abcdefghijklmnopqrstuvwxyz',
            editable: false,
            draggable: true,
          },
        ],
        _labelOption: {
          isMultiple: true,
          maxCount: 4,
        },
      },
    },
    {
      id: '2',
      type: 'circle',
      x: 350,
      y: 100,
      properties: {},
      text: {
        x: 350,
        y: 100,
        value: '圆形',
      },
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
    {
      sourceNodeId: '3',
      targetNodeId: '2',
      type: 'polyline',
      text: 'edge 1',
    },
  ],
};

export default function LabelExtension() {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        // container: document.querySelector('#graph') as HTMLElement,
        plugins: [Label],
        pluginsOptions: {
          label: {
            isMultiple: true,
            maxCount: 3,
            labelWidth: 80,
            // textOverflowMode -> 'ellipsis' | 'wrap' | 'clip' | 'nowrap' | 'default'
            textOverflowMode: 'wrap',
          },
        },
        grid: {
          size: 5,
        },
      });

      lf.render(data);
      lfRef.current = lf;
    }
  }, []);

  return (
    <>
      <Flex wrap="wrap" gap="small">
        <Button
          key="getData"
          type="primary"
          onClick={() => console.log(lfRef?.current?.getGraphData())}
        >
          获取数据
        </Button>
        <Button
          key="getTools"
          type="primary"
          onClick={() => console.log(lfRef?.current?.tool?.getTools())}
        >
          获取当前工具
        </Button>
        <Button
          key="text"
          type="primary"
          onClick={() => {
            const nextLabel = lfRef?.current?.extension?.label as Label;
            nextLabel.updateTextMode('text');
          }}
        >
          使用 Text 渲染
        </Button>
        <Button
          key="label"
          type="primary"
          onClick={() => {
            const nextLabel = lfRef?.current?.extension?.label as Label;
            nextLabel.updateTextMode('label');
          }}
        >
          使用 Label 渲染
        </Button>
      </Flex>
      <Divider orientation="left" orientationMargin="5" plain></Divider>

      <div ref={containerRef} id="graph" className="viewport"></div>
    </>
  );
}

const container = document.querySelector('#container');
const root = createRoot(container);
root.render(<LabelExtension></LabelExtension>);
