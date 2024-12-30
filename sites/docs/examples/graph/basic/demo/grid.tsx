import React, { useEffect, useRef, useState } from 'react';
import { Card, Flex, Form, Divider, Slider, Switch, ColorPicker } from 'antd';

const container = document.querySelector('#container');
const root = createRoot(container);

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
    // 下面的 style 移动到此处，不然会覆盖上面设置的各图形的主题样式
    inputText: {
      background: 'black',
      color: 'white',
    },
  },
};

const customTheme: Partial<LogicFlow.Theme> = {
  baseNode: {
    stroke: '#4E93F5',
  },
  nodeText: {
    overflowMode: 'ellipsis',
    lineHeight: 1.5,
    fontSize: 13,
  },
  edgeText: {
    overflowMode: 'ellipsis',
    lineHeight: 1.5,
    fontSize: 13,
    textWidth: 100,
  }, // 确认 textWidth 是否必传 ❓
  polyline: {
    stroke: 'red',
  },
  rect: {
    width: 200,
    height: 40,
  },
  arrow: {
    offset: 4, // 箭头长度
    verticalLength: 2, // 箭头垂直于边的距离
  },
};

// 画布元素
const graphData = {
  nodes: [
    {
      id: 'node-1',
      type: 'rect',
      x: 100,
      y: 100,
      text: '矩形',
    },
    {
      id: 'node-2',
      type: 'circle',
      x: 300,
      y: 100,
      text: '圆形',
    },
    {
      id: 'node-3',
      type: 'ellipse',
      x: 500,
      y: 100,
      text: '椭圆',
    },
    {
      id: 'node-4',
      type: 'polygon',
      x: 100,
      y: 250,
      text: '多边形',
    },
    {
      id: 'node-5',
      type: 'diamond',
      x: 300,
      y: 250,
      text: '菱形',
    },
    {
      id: 'node-6',
      type: 'text',
      x: 500,
      y: 250,
      text: '文本',
    },
  ],
};

const App: React.FC = () => {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridSize, setGridSize] = useState(20);

  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        height: 400,
        multipleSelectKey: 'shift',
        disabledTools: ['multipleSelect'],
        autoExpand: true,
        adjustEdgeStartAndEnd: true,
        allowRotate: true,
        edgeTextEdit: true,
        keyboard: {
          enabled: true,
        },
        partial: true,
        background: {
          color: '#FFFFFF',
        },
        grid: {
          size: gridSize,
          type: 'dot',
          config: {
            thickness: 1,
            color: '#ababab',
          },
        },
        edgeTextDraggable: true,
        edgeType: 'bezier',
        idGenerator(type) {
          return type + '_' + Math.random();
        },
      });

      lf.setTheme(customTheme);
      lf.render(graphData);
      lfRef.current = lf;
      (window as any).lf = lf;
    }
  }, []);

  return (
    <Card title="LogicFlow - Grid">
      <Flex wrap="wrap" gap="middle" align="center" justify="space-between">
        <Form layout="inline">
          <Form.Item label="网格吸附">
            <div style={{ width: '100px' }}>
              <Switch
                checkedChildren="开启"
                unCheckedChildren="关闭"
                onClick={() => {
                  if (lfRef.current) {
                    const graphData = lfRef.current?.getEditConfig();
                    const { snapGrid } = graphData;
                    lfRef.current.updateEditConfig({
                      snapGrid: !snapGrid,
                    });
                  }
                }}
              />
            </div>
          </Form.Item>
          <Form.Item label="网格可见">
            <div style={{ width: '120px' }}>
              <Switch
                checkedChildren="可见"
                unCheckedChildren="不可见"
                defaultChecked
                onClick={(value) => {
                  if (lfRef.current) {
                    lfRef.current?.graphModel.updateGridOptions({
                      visible: value,
                    });
                  }
                }}
              />
            </div>
          </Form.Item>
          <Form.Item label="修改网格大小">
            <div style={{ width: '100px' }}>
              <Slider
                min={5}
                max={40}
                step={1}
                value={gridSize}
                onChange={(value) => {
                  setGridSize(value);
                  lfRef.current?.graphModel.updateGridOptions({ size: value });
                }}
              />
            </div>
          </Form.Item>
          <Form.Item label="网格类型">
            <div style={{ width: '120px' }}>
              <Switch
                checkedChildren="点状"
                unCheckedChildren="交叉线"
                defaultChecked
                onClick={(value) => {
                  if (lfRef.current) {
                    lfRef.current?.graphModel.updateGridOptions({
                      type: value ? 'dot' : 'mesh',
                    });
                  }
                }}
              />
            </div>
          </Form.Item>
          <Form.Item label="网格宽度">
            <div style={{ width: '100px' }}>
              <Slider
                min={1}
                max={gridSize / 4}
                step={1}
                defaultValue={1}
                onChange={(value) => {
                  lfRef.current?.graphModel.updateGridOptions({
                    config: { thickness: value },
                  });
                }}
              />
            </div>
          </Form.Item>
          <Form.Item label="网格颜色">
            <ColorPicker
              value={'#ababab'}
              onChange={(color) => {
                lfRef.current?.graphModel.updateGridOptions({
                  config: { color: color.toHexString() },
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

root.render(<App></App>);

insertCss(`
#container {
  overflow: auto;
}

*:focus {
  outline: none;
}

.dnd-item {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
}

.wrapper {
  width: 80px;
  height: 50px;
  background: #fff;
  border: 2px solid #000;
}

.uml-wrapper {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  background: rgb(255 242 204);
  border: 1px solid rgb(214 182 86);
  border-radius: 10px;
}

.uml-head {
  font-weight: bold;
  font-size: 16px;
  line-height: 30px;
  text-align: center;
}

.uml-body {
  padding: 5px 10px;
  font-size: 12px;
  border-top: 1px solid rgb(214 182 86);
  border-bottom: 1px solid rgb(214 182 86);
}

.uml-footer {
  padding: 5px 10px;
  font-size: 14px;
}

/* 输入框字体大小和设置的大小保持一致，自动换行输入和展示保持一致 */
.lf-text-input {
  font-size: 12px;
}

.buttons {
  position: absolute;
  z-index: 1;
}

.button-list {
  display: flex;
  align-items: center;
}
`);
