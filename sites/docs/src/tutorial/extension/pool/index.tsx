import LogicFlow from '@logicflow/core';
import {
  Control,
  DndPanel,
  PoolElements,
  ShapeItem,
} from '@logicflow/extension';

import { Button, Card, Divider, Flex, message } from 'antd';
import { useEffect, useRef } from 'react';
import GraphConfigData = LogicFlow.GraphConfigData;

import '@logicflow/core/es/index.css';
import '@logicflow/extension/es/index.css';
import styles from './index.module.less';

const config: Partial<LogicFlow.Options> = {
  multipleSelectKey: 'alt',
  stopMoveGraph: true,
  grid: {
    size: 10,
  },
  allowResize: true,
  allowRotate: true,
  plugins: [PoolElements, Control, DndPanel],
};

const getDndPanelConfig = (): ShapeItem[] => [
  {
    type: 'pool',
    label: '横向泳池',
    text: 'Pool (H)',
    properties: {
      width: 520,
      height: 360,
      direction: 'horizontal',
      laneConfig: {
        text: '泳道',
      },
    },
  },
  {
    type: 'pool',
    label: '竖向泳池',
    text: 'Pool (V)',
    properties: {
      width: 360,
      height: 520,
      direction: 'vertical',
      laneConfig: {
        text: '泳道',
      },
    },
  },
  { type: 'rect', label: '矩形', text: 'Rect' },
  { type: 'circle', label: '圆形', text: 'Circle' },
  { type: 'diamond', label: '菱形', text: 'Diamond' },
];

export default function PoolDemo() {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
      });

      lf.setPatternItems(getDndPanelConfig());

      const graphData: GraphConfigData = {
        nodes: [
          {
            id: 'pool_1',
            type: 'pool',
            x: 520,
            y: 280,
            text: '横向泳池',
            properties: {
              width: 520,
              height: 360,
              direction: 'horizontal',
              laneConfig: {
                text: '泳道',
              },
            },
          },
          {
            id: 'rect_1',
            type: 'rect',
            x: 860,
            y: 240,
            text: '拖拽到泳道里',
          },
          {
            id: 'circle_1',
            type: 'circle',
            x: 860,
            y: 340,
            text: '拖拽到泳道里',
          },
        ],
        edges: [],
      };

      lf.render(graphData);
      lf.translateCenter();

      lf.on('lane:not-allowed', () => {
        message.warning('该节点不允许加入此泳道');
      });

      lfRef.current = lf;
    }
  }, []);

  const getGraphData = () => {
    const graphData = lfRef.current?.getGraphRawData();
    console.log('graph data:', graphData);
  };

  return (
    <Card title="LogicFlow Extension - Pool" className="control-container">
      <Flex wrap="wrap" gap="small">
        <Button type="primary" key="getData" onClick={getGraphData}>
          获取数据
        </Button>
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  );
}
