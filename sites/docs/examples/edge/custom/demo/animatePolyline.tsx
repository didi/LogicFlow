import { Card, Select } from 'antd';
import React, { useEffect, useRef } from 'react';

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
};
class CustomAnimateEdge extends PolylineEdge {
  // 重写 getEdge 方法，定义边的渲染
  getEdge() {
    const { model } = this.props;
    const { points, arrowConfig } = model;
    const style = model.getEdgeStyle();
    const animationStyle = model.getEdgeAnimationStyle();
    const {
      strokeDasharray,
      strokeDashoffset,
      animationName,
      animationDuration,
      animationIterationCount,
      animationTimingFunction,
      animationDirection,
    } = animationStyle;

    return h('g', {}, [
      h(
        'linearGradient',
        {
          id: 'linearGradient-1',
          x1: '0%',
          y1: '0%',
          x2: '100%',
          y2: '100%',
          spreadMethod: 'repeat',
        },
        [
          h('stop', {
            offset: '0%',
            stopColor: '#36bbce',
          }),
          h('stop', {
            offset: '100%',
            stopColor: '#e6399b',
          }),
        ],
      ),
      h('defs', {}, [
        h(
          'filter',
          {
            id: 'filter-1',
            x: '-0.2',
            y: '-0.2',
            width: '200%',
            height: '200%',
          },
          [
            h('feOffset', {
              result: 'offOut',
              in: 'SourceGraphic',
              dx: 0,
              dy: 10,
            }),
            h('feGaussianBlur', {
              result: 'blurOut',
              in: 'offOut',
              stdDeviation: 10,
            }),
            h('feBlend', {
              mode: 'normal',
              in: 'SourceGraphic',
              in2: 'blurOut',
            }),
          ],
        ),
      ]),
      h('polyline', {
        points,
        ...style,
        ...arrowConfig,
        strokeDasharray,
        stroke: 'url(#linearGradient-1)',
        filter: 'url(#filter-1)',
        fill: 'none',
        strokeLinecap: 'round',
        style: {
          strokeDashoffset: strokeDashoffset,
          animationName,
          animationDuration,
          animationIterationCount,
          animationTimingFunction,
          animationDirection,
        },
      }),
    ]);
  }
}

class CustomAnimateEdgeModel extends PolylineEdgeModel {
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
  getEdgeAnimationStyle() {
    const style = super.getEdgeAnimationStyle();
    style.strokeDasharray = '40 160';
    style.animationDuration = '10s';
    style.stroke = 'rgb(130, 179, 102)';
    return style;
  }
}

const CustomAnimatePolyline = {
  type: 'customAnimatePolyline',
  model: CustomAnimateEdgeModel,
  view: CustomAnimateEdge,
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
        height: 500,
        grid: {
          size: 10,
        },
      });

      lf.register(CustomAnimatePolyline);
      lf.setDefaultEdgeType('customAnimatePolyline');

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
            id: '1-2-1',
            type: 'customAnimatePolyline',
            sourceNodeId: '1',
            targetNodeId: '2',
            startPoint: { x: 200, y: 320 },
            endPoint: { x: 580, y: 320 },
            properties: {
              textPosition: 'center',
              style: {
                strokeWidth: 10,
              },
            },
            text: { x: 390, y: 320, value: '边文本3' },
            pointsList: [
              { x: 200, y: 320 },
              { x: 580, y: 320 },
            ],
          },
          {
            id: '1-2-2',
            type: 'customAnimatePolyline',
            sourceNodeId: '1',
            targetNodeId: '2',
            startPoint: { x: 150, y: 280 },
            endPoint: { x: 630, y: 280 },
            properties: {
              textPosition: 'center',
              style: {
                strokeWidth: 10,
              },
            },
            text: { x: 390, y: 197, value: '边文本2' },
            pointsList: [
              { x: 150, y: 280 },
              { x: 150, y: 197 },
              { x: 630, y: 197 },
              { x: 630, y: 280 },
            ],
          },
          {
            id: '1-2-3',
            type: 'customAnimatePolyline',
            sourceNodeId: '2',
            targetNodeId: '1',
            startPoint: { x: 630, y: 360 },
            endPoint: { x: 150, y: 360 },
            properties: {
              textPosition: 'center',
              style: {
                strokeWidth: 10,
              },
            },
            text: { x: 390, y: 458, value: '边文本4' },
            pointsList: [
              { x: 630, y: 360 },
              { x: 630, y: 458 },
              { x: 150, y: 458 },
              { x: 150, y: 360 },
            ],
          },
          {
            id: '1-2-4',
            type: 'customAnimatePolyline',
            sourceNodeId: '1',
            targetNodeId: '2',
            startPoint: { x: 100, y: 320 },
            endPoint: { x: 680, y: 320 },
            properties: {
              textPosition: 'center',
              style: {
                strokeWidth: 10,
              },
            },
            text: { x: 390, y: 114, value: '边文本1' },
            pointsList: [
              { x: 100, y: 320 },
              { x: 70, y: 320 },
              { x: 70, y: 114 },
              { x: 760, y: 114 },
              { x: 760, y: 320 },
              { x: 680, y: 320 },
            ],
          },
        ],
      });

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
    <Card title="自定义折线">
      <Select
        placeholder="修改边文本位置"
        onChange={(val) => {
          setTextPosition(val);
        }}
        defaultValue="center"
      >
        <Select.Option value="center">默认文本位置</Select.Option>
        <Select.Option value="start">文本位置在边的起点处</Select.Option>
        <Select.Option value="end">文本位置在边的终点处</Select.Option>
      </Select>
      <div ref={containerRef} id="graph"></div>
    </Card>
  );
};

root.render(<App></App>);

insertCss(`
.header {
  height: 50px;
}
#graph{
  width: 100%;
  height: 100%;
}
`);
