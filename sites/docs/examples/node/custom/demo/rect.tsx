import React, { useEffect, useRef } from 'react';

const container = document.querySelector('#container');
const root = createRoot(container);

type CustomProperties = {
  // 形状属性
  width?: number;
  height?: number;
  radius?: number;

  // 文字位置属性
  refX?: number;
  refY?: number;

  // 样式属性
  style?: LogicFlow.CommonTheme;
  textStyle?: LogicFlow.TextNodeTheme;
};

class CustomRectNode extends RectNode {}

class CustomRectNodeModel extends RectNodeModel {
  setAttributes() {
    console.log('this.properties', this.properties);
    const { width, height, radius } = this.properties as CustomProperties;
    if (width) {
      this.width = width;
    }
    if (height) {
      this.height = height;
    }
    if (radius) {
      this.radius = radius;
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
    const {
      style: customNodeStyle,
      // radius = 0, // 第二种方式，设置圆角
    } = this.properties as CustomProperties;

    return {
      ...style,
      ...(structuredClone(customNodeStyle) || {}),
      // rx: radius,
      // ry: radius,
    };
  }
}

const CustomRect = {
  type: 'customRect',
  view: CustomRectNode,
  model: CustomRectNodeModel,
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

      lf.register(CustomRect);
      lf.render({});

      // row 1
      lf.addNode({
        id: '10',
        type: 'customRect',
        x: 150,
        y: 70,
        text: '矩形',
      });

      lf.addNode({
        id: '11',
        type: 'customRect',
        x: 350,
        y: 70,
        text: '矩形',
        properties: {
          style: {
            fill: '#efdbff',
            stroke: '#9254de',
          },
        },
      });

      lf.addNode({
        id: '12',
        type: 'customRect',
        x: 550,
        y: 70,
        text: '矩形',
        properties: {
          radius: 8,
          style: {
            fill: '#f8cecc',
            stroke: '#b85450',
          },
        },
      });

      lf.addNode({
        id: '13',
        type: 'customRect',
        x: 730,
        y: 70,
        text: '矩形',
        properties: {
          width: 60,
          height: 60,
          radius: 20,
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
        type: 'customRect',
        x: 150,
        y: 200,
        text: '矩形',
        properties: {
          refX: -25,
          refY: -20,
        },
      });

      lf.addNode({
        id: '21',
        type: 'customRect',
        x: 350,
        y: 200,
        text: '矩形',
        properties: {
          refX: -25,
          style: {
            fill: '#efdbff',
            stroke: '#9254de',
          },
        },
      });

      lf.addNode({
        id: '22',
        type: 'customRect',
        x: 550,
        y: 200,
        text: '矩形',
        properties: {
          radius: 8,
          refX: -25,
          refY: 20,
          style: {
            fill: '#f8cecc',
            stroke: '#b85450',
          },
        },
      });

      lf.addNode({
        id: '23',
        type: 'customRect',
        x: 730,
        y: 200,
        text: '矩形',
        properties: {
          width: 60,
          height: 60,
          radius: 20,
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
        type: 'customRect',
        x: 150,
        y: 330,
        text: '矩形',
        properties: {
          refY: -20,
        },
      });

      lf.addNode({
        id: '31',
        type: 'customRect',
        x: 350,
        y: 330,
        text: '矩形',
        properties: {
          style: {
            fill: '#efdbff',
            stroke: '#9254de',
          },
        },
      });

      lf.addNode({
        id: '32',
        type: 'customRect',
        x: 550,
        y: 330,
        text: '矩形',
        properties: {
          radius: 8,
          refY: 20,
          style: {
            fill: '#f8cecc',
            stroke: '#b85450',
          },
        },
      });

      lf.addNode({
        id: '33',
        type: 'customRect',
        x: 730,
        y: 330,
        text: '矩形',
        properties: {
          width: 60,
          height: 60,
          radius: 20,
          refX: 48,
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
        type: 'customRect',
        x: 150,
        y: 460,
        text: '矩形',
        properties: {
          refX: 20,
          refY: -20,
        },
      });

      lf.addNode({
        id: '41',
        type: 'customRect',
        x: 350,
        y: 460,
        text: '矩形',
        properties: {
          refX: 20,
          style: {
            fill: '#efdbff',
            stroke: '#9254de',
          },
        },
      });

      lf.addNode({
        id: '42',
        type: 'customRect',
        x: 550,
        y: 460,
        text: '矩形',
        properties: {
          radius: 8,
          refX: 20,
          refY: 20,
          style: {
            fill: '#f8cecc',
            stroke: '#b85450',
          },
        },
      });

      lf.addNode({
        id: '43',
        type: 'customRect',
        x: 730,
        y: 460,
        text: '矩形',
        properties: {
          width: 60,
          height: 60,
          radius: 20,
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

  return <div ref={containerRef} id="graph"></div>;
};

root.render(<App></App>);

insertCss(`
#graph{
  width: 100%;
  height: 100%;
}
`);
