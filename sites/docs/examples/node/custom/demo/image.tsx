import React, { useEffect, useRef } from 'react';

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
};

const data = {
  nodes: [
    {
      id: '1',
      type: 'imageCloud',
      x: 150,
      y: 100,
      text: '心形 ❤️',
      properties: {
        width: 80,
        height: 60,
        style: {
          fill: '#d75a4a',
          stroke: '#9254de',
        },
      },
    },
    {
      id: '2',
      type: 'imageCloud',
      x: 350,
      y: 100,
      text: '星星 ✨',
      properties: {
        width: 80,
        height: 60,
        style: {
          fill: '#ed8a19',
          stroke: '#9254de',
        },
      },
    },
    {
      id: '3',
      type: 'imageCloud',
      x: 550,
      y: 100,
      text: '音符 🎵',
      properties: {
        width: 80,
        height: 60,
        style: {
          fill: '#eb2f96',
          stroke: '#9254de',
        },
      },
    },
  ],
};

type CustomProperties = {
  // 形状属性
  width?: number;
  height?: number;
  radius?: number;

  imageHref: string;

  // 样式属性
  style?: LogicFlow.CommonTheme;
  textStyle?: LogicFlow.TextNodeTheme;
};

class CustomImageNode extends RectNode {
  getShape = (): h.JSX.Element => {
    const { model } = this.props;
    const { x, y, width, height, radius } = model;
    const href = this.getImageHref();
    console.log('model.modelType', model.modelType);
    const style = model.getNodeStyle();

    return h('g', {}, [
      h('image', {
        ...style,
        x: x - width / 2,
        y: y - height / 2,
        rx: radius,
        ry: radius,
        width,
        height,
        href,
        // 根据宽高缩放
        preserveAspectRatio: 'none meet',
      }),
    ]);
  };

  getImageHref = (): string => {
    return '';
  };
}

class CustomImageNodeModel extends RectNodeModel {
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
}

const CustomImage = {
  type: 'customImage',
  view: CustomImageNode,
  model: CustomImageNodeModel,
};

// 云形状的图片节点
class CloudImageNode extends CustomImage.view {
  getImageHref = () => {
    return 'https://dpubstatic.udache.com/static/dpubimg/0oqFX1nvbD/cloud.png';
  };
}

const CloudImage = {
  type: 'imageCloud',
  view: CloudImageNode,
  model: CustomImage.model,
};

const container = document.querySelector('#container');
const root = createRoot(container);

const App: React.FC = () => {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        // container: document.querySelector('#graph') as HTMLElement,
        grid: {
          size: 10,
        },
      });

      lf.register(CloudImage);

      lf.render(data);
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
