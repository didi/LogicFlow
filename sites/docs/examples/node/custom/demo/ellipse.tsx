import { Button } from 'antd';
import React, { useEffect, useRef } from 'react';

type CustomProperties = {
  // 形状属性
  rx?: number;
  ry?: number;

  // 文字位置属性
  refX?: number;
  refY?: number;

  // 样式属性
  style?: LogicFlow.CommonTheme;
  textStyle?: LogicFlow.TextNodeTheme;
};

class CustomEllipseNode extends EllipseNode {}

class CustomEllipseNodeModel extends EllipseNodeModel {
  setAttributes() {
    const { rx, ry } = this.properties as CustomProperties;
    if (rx) {
      this.rx = rx;
    }
    if (ry) {
      this.ry = ry;
    }
  }

  getTextStyle(): LogicFlow.TextNodeTheme {
    // const { x, y, width, height } = this
    const {
      refX = 0,
      refY = 0,
      textStyle,
    } = this.properties as CustomProperties;
    const style = super.getTextStyle();

    // 通过 transform 重新设置 text 的位置
    return {
      ...style,
      ...(structuredClone(textStyle) || {}),
      transform: `matrix(1 0 0 1 ${refX} ${refY})`,
    };
  }

  getNodeStyle(): LogicFlow.CommonTheme {
    const style = super.getNodeStyle();
    const { style: customNodeStyle } = this.properties as CustomProperties;

    return {
      ...style,
      ...(structuredClone(customNodeStyle) || {}),
    };
  }
}

const CustomEllipse = {
  type: 'customEllipse',
  view: CustomEllipseNode,
  model: CustomEllipseNodeModel,
};

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
  style: {
    rect: {
      width: 100,
      height: 50,
      rx: 2,
      ry: 2,
    },
  },
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
        // container: document.querySelector('#graph') as HTMLElement,
        grid: {
          size: 10,
        },
      });

      lf.register(CustomEllipse);
      lf.render({});

      // row 1
      lf.addNode({
        id: '10',
        type: 'customEllipse',
        x: 150,
        y: 70,
        text: 'ellipse',
        properties: {
          rx: 60,
          ry: 30,
        },
      });

      lf.addNode({
        id: '11',
        type: 'customEllipse',
        x: 350,
        y: 70,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          style: {
            fill: '#efdbff',
            stroke: '#9254de',
          },
        },
      });

      lf.addNode({
        id: '12',
        type: 'customEllipse',
        x: 550,
        y: 70,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          style: {
            fill: '#f8cecc',
            stroke: '#b85450',
          },
        },
      });

      lf.addNode({
        id: '13',
        type: 'customEllipse',
        x: 730,
        y: 70,
        text: 'Ellipse',
        properties: {
          rx: 30,
          ry: 30,
          style: {
            fill: '#ffe6cc',
            stroke: '#d79b00',
          },
          textStyle: {
            textAnchor: 'middle',
            dominantBaseline: 'middle',
          },
        },
      });

      // row 2
      lf.addNode({
        id: '20',
        type: 'customEllipse',
        x: 150,
        y: 200,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          refX: -25,
          refY: -10,
        },
      });

      lf.addNode({
        id: '21',
        type: 'customEllipse',
        x: 350,
        y: 200,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          refX: -25,
          style: {
            fill: '#efdbff',
            stroke: '#9254de',
          },
        },
      });

      lf.addNode({
        id: '22',
        type: 'customEllipse',
        x: 550,
        y: 200,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          refX: -25,
          refY: 10,
          style: {
            fill: '#f8cecc',
            stroke: '#b85450',
          },
        },
      });

      lf.addNode({
        id: '23',
        type: 'customEllipse',
        x: 730,
        y: 200,
        text: 'Ellipse',
        properties: {
          rx: 30,
          ry: 30,
          refY: -40,
          style: {
            fill: '#ffe6cc',
            stroke: '#d79b00',
          },
          textStyle: {
            textAnchor: 'middle',
            dominantBaseline: 'middle',
          },
        },
      });

      // row 3
      lf.addNode({
        id: '30',
        type: 'customEllipse',
        x: 150,
        y: 330,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          refY: -10,
        },
      });

      lf.addNode({
        id: '31',
        type: 'customEllipse',
        x: 350,
        y: 330,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          style: {
            fill: '#efdbff',
            stroke: '#9254de',
          },
        },
      });

      lf.addNode({
        id: '32',
        type: 'customEllipse',
        x: 550,
        y: 330,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          refY: 10,
          style: {
            fill: '#f8cecc',
            stroke: '#b85450',
          },
        },
      });

      lf.addNode({
        id: '33',
        type: 'customEllipse',
        x: 730,
        y: 330,
        text: 'Ellipse',
        properties: {
          rx: 30,
          ry: 30,
          refX: 50,
          style: {
            fill: '#ffe6cc',
            stroke: '#d79b00',
          },
          textStyle: {
            textAnchor: 'middle',
            dominantBaseline: 'middle',
          },
        },
      });

      // row 4
      lf.addNode({
        id: '40',
        type: 'customEllipse',
        x: 150,
        y: 460,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          refX: 25,
          refY: -10,
        },
      });

      lf.addNode({
        id: '41',
        type: 'customEllipse',
        x: 350,
        y: 460,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          refX: 25,
          style: {
            fill: '#efdbff',
            stroke: '#9254de',
          },
        },
      });

      lf.addNode({
        id: '42',
        type: 'customEllipse',
        x: 550,
        y: 460,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          refX: 25,
          refY: 10,
          style: {
            fill: '#f8cecc',
            stroke: '#b85450',
          },
        },
      });

      lf.addNode({
        id: '43',
        type: 'customEllipse',
        x: 730,
        y: 460,
        text: 'Ellipse',
        properties: {
          rx: 30,
          ry: 30,
          refY: 40,
          style: {
            fill: '#ffe6cc',
            stroke: '#d79b00',
          },
          textStyle: {
            textAnchor: 'middle',
            dominantBaseline: 'middle',
          },
        },
      });
      lf.translateCenter();
      lfRef.current = lf;
    }
  }, []);

  return (
    <>
      <Button
        className="button"
        onClick={() => {
          if (lfRef.current) {
            const graphData = lfRef.current?.getGraphData();
            console.log('graphData --->>>', graphData);
          }
        }}
      >
        获取当前图数据
      </Button>
      <div ref={containerRef} id="graph"></div>
    </>
  );
};

root.render(<App></App>);

insertCss(`
.button {
  height: 30px;
}
#graph{
  width: 100%;
  height: calc(100% - 30px);
}
`);
