import { Button, Select, Space } from 'antd';
import React, { useEffect, useRef } from 'react';

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
};

class CustomPolyline extends PolylineEdge {
  // 自定义边箭头
  // 在自定义连线 view 的时候，可以重写getEndArrow和getStartArrow方法来实现自定义连线两端的图形，这两个方法可以返回的任意svg图形。
  // 这里以通过连线properties属性中的 arrowType 来控制连线不同的外观为例。
  getEndArrow() {
    const { model } = this.props;
    const {
      properties: { arrowType },
    } = model;
    const { stroke, strokeWidth } = model.getArrowStyle();
    const pathAttr = {
      stroke,
      strokeWidth,
    };
    // 空心箭头
    if (arrowType === 'empty') {
      return h('path', {
        ...pathAttr,
        fill: '#FFF',
        d: 'M -10 0  -20 -5 -30 0 -20 5 z',
      });
    } else if (arrowType === 'half') {
      // 半箭头
      return h('path', {
        ...pathAttr,
        d: 'M 0 0 -10 5',
      });
    }
    return h('path', {
      ...pathAttr,
      fill: stroke,
      d: 'M 0 0 -10 -5 -10 5 z',
    });
  }
}

class CustomPolylineModel extends PolylineEdgeModel {
  initEdgeData(data: LogicFlow.EdgeConfig) {
    super.initEdgeData(data);
    this.customTextPosition = true;
  }
  // 自定义边文本位置
  getTextPosition(): LogicFlow.Point {
    const { textPosition = 'center' } = this.properties;
    const position = super.getTextPosition();
    const currentPositionList = this.points.split(' ');
    const pointsList: LogicFlow.Position[] = [];
    currentPositionList &&
      currentPositionList.forEach((item) => {
        const [x, y] = item.split(',');
        pointsList.push({ x: Number(x), y: Number(y) });
      });
    if (textPosition === 'center') {
      return position;
    }
    if (textPosition === 'start') {
      if (pointsList.length > 1) {
        const { x: x1, y: y1 } = pointsList[0];
        const { x: x2, y: y2 } = pointsList[1];
        let distance = 50;
        if (x1 === x2) {
          // 垂直
          if (y2 < y1) {
            distance = -50;
          }
          position.y = y1 + distance;
          position.x = x1;
        } else {
          if (x2 < x1) {
            distance = -50;
          }
          position.x = x1 + distance;
          position.y = y1 - 10;
        }
      }
      return position;
    }
    if (textPosition === 'end') {
      if (pointsList.length > 1) {
        const { x: x1, y: y1 } = pointsList[pointsList.length - 2];
        const { x: x2, y: y2 } = pointsList[pointsList.length - 1];
        let distance = 50;
        if (x1 === x2) {
          // 垂直
          if (y2 > y1) {
            distance = -50;
          }
          position.y = y2 + distance;
          position.x = x2;
        } else {
          if (x2 < x1) {
            distance = -50;
          }
          position.x = x2 - distance;
          position.y = y2 - 10;
        }
      }
      return position;
    }
    return position;
  }
  // 自定义动画
  setAttributes() {
    const { openAnimation } = this.properties;
    this.isAnimation = !!openAnimation;
  }
  // 自定义动画
  getEdgeAnimationStyle() {
    const style = super.getEdgeAnimationStyle();
    style.strokeDasharray = '15 5';
    style.animationDuration = '10s';
    style.stroke = 'rgb(130, 179, 102)';
    return style;
  }
  // 自定义边样式：颜色、宽度、线段类型等
  getEdgeStyle() {
    const style = super.getEdgeStyle();
    const { edgeWeight, highlight } = this.properties;
    style.strokeWidth = edgeWeight ? 5 : 3;
    style.stroke = highlight ? 'red' : 'black';
    return style;
  }
}

const CustomPolylineEdge = {
  type: 'customPolyline',
  model: CustomPolylineModel,
  view: CustomPolyline,
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

      lf.register(CustomPolylineEdge);
      lf.setDefaultEdgeType('customPolyline');

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
            type: 'customPolyline',
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
            type: 'customPolyline',
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
            type: 'customPolyline',
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
            type: 'customPolyline',
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

      lf.translateCenter();

      lfRef.current = lf;
    }
  }, []);

  function setTextPosition(textPosition: string) {
    if (lfRef.current) {
      const { edges } = lfRef.current.getGraphRawData();
      edges.forEach((edge) => {
        const edgeModel =
          lfRef.current && lfRef.current.getEdgeModelById(edge.id);
        if (edgeModel) {
          edgeModel.setProperties({
            textPosition,
          });
          const textNewPosition = edgeModel.getTextPosition();
          edgeModel.text = {
            ...edgeModel.text,
            ...textNewPosition,
          };
        }
      });
    }
  }

  return (
    <>
      <Space className="header">
        <Button
          type="primary"
          className="btn"
          onClick={() => {
            if (lfRef.current) {
              const graphData = lfRef.current?.getGraphRawData();
              console.log('graphData --->>>', graphData);
            }
          }}
        >
          获取当前图数据
        </Button>
        <Button
          type="primary"
          className="btn"
          onClick={() => {
            if (lfRef.current) {
              const { edges } = lfRef.current.getGraphRawData();
              edges.forEach((edge) => {
                const edgeModel =
                  lfRef.current && lfRef.current.getEdgeModelById(edge.id);
                if (edgeModel) {
                  edgeModel.setProperties({
                    edgeWeight: !edge.properties?.edgeWeight,
                  });
                }
              });
            }
          }}
        >
          切换边粗细
        </Button>
        <Button
          type="primary"
          className="btn"
          onClick={() => {
            if (lfRef.current) {
              const { edges } = lfRef.current.getGraphRawData();
              edges.forEach((edge) => {
                const edgeModel =
                  lfRef.current && lfRef.current.getEdgeModelById(edge.id);
                if (edgeModel) {
                  edgeModel.setProperties({
                    highlight: !edge.properties?.highlight,
                  });
                }
              });
            }
          }}
        >
          切换边颜色
        </Button>
        <Button
          type="primary"
          className="btn"
          onClick={() => {
            if (lfRef.current) {
              const { edges } = lfRef.current.getGraphRawData();
              edges.forEach((edge) => {
                const edgeModel =
                  lfRef.current && lfRef.current.getEdgeModelById(edge.id);
                if (edgeModel) {
                  edgeModel.setProperties({
                    openAnimation: !edge.properties?.openAnimation,
                  });
                }
              });
            }
          }}
        >
          开关动画
        </Button>
        <Select
          placeholder="修改边文本位置"
          className="select"
          onChange={(val) => {
            setTextPosition(val);
          }}
          defaultValue="center"
        >
          <Select.Option value="center">默认文本位置</Select.Option>
          <Select.Option value="start">文本位置在边的起点处</Select.Option>
          <Select.Option value="end">文本位置在边的终点处</Select.Option>
        </Select>
        <Select
          placeholder="修改边锚点形状"
          className="select"
          onChange={(val) => {
            if (lfRef.current) {
              const { edges } = lfRef.current.getGraphRawData();
              edges.forEach((edge) => {
                const edgeModel =
                  lfRef.current && lfRef.current.getEdgeModelById(edge.id);
                if (edgeModel) {
                  edgeModel.setProperties({
                    arrowType: val,
                  });
                }
              });
            }
          }}
          defaultValue=""
        >
          <Select.Option value="empty">空心箭头</Select.Option>
          <Select.Option value="half">半箭头</Select.Option>
          <Select.Option value="">默认箭头</Select.Option>
        </Select>
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
