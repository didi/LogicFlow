import React, { useEffect, useRef } from 'react';
import { Card, Flex, Form, Divider, Slider, ColorPicker, Button } from 'antd';

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
        grid: true,
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
    <Card title="LogicFlow - Color Background">
      <Flex wrap="wrap" gap="middle" align="center" justify="space-between">
        <Form layout="inline">
          <Form.Item>
            <Button
              type="primary"
              onClick={() =>
                lfRef.current?.graphModel.updateBackgroundOptions(false)
              }
            >
              隐藏画布背景
            </Button>
          </Form.Item>
          <Form.Item label="画布背景颜色">
            <ColorPicker
              value={'#ffffff'}
              onChange={(color) => {
                lfRef.current?.graphModel.updateBackgroundOptions({
                  backgroundColor: color.toHexString(),
                });
              }}
            />
          </Form.Item>
          <Form.Item label="画布透明度">
            <div style={{ width: '100px' }}>
              <Slider
                min={0}
                max={1}
                step={0.1}
                defaultValue={1}
                onChange={(value) => {
                  lfRef.current?.graphModel.updateBackgroundOptions({
                    opacity: value,
                  });
                }}
              />
            </div>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={() =>
                lfRef.current?.graphModel.updateBackgroundOptions({
                  backgroundImage:
                    "url('https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/logo-horizontal-blue.png')",
                  backgroundRepeat: 'repeat',
                  backgroundSize: '400px',
                  filter: 'none',
                })
              }
            >
              画布背景图片
            </Button>
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
