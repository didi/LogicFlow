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
      type: 'customHtml',
      x: 300,
      y: 150,
      properties: {
        name: 'hello',
        body: 'world',
      },
    },
  ],
  edges: [],
};

type CustomProperties = {
  // 形状属性
  width?: number;
  height?: number;
  radius?: number;

  // 样式属性
  style?: LogicFlow.CommonTheme;
  textStyle?: LogicFlow.TextNodeTheme;
};

class CustomHtmlNode extends HtmlNode {
  setHtml(rootEl: HTMLElement) {
    const { properties } = this.props.model;

    const el = document.createElement('div');
    el.className = 'uml-wrapper';
    el.innerHTML = `
      <div>
        <div class="uml-head">Head</div>
        <div class="uml-body">
          <div><button class="uml-btn" onclick="setData()">+</button> ${properties.name}</div>
          <div>${properties.body}</div>
        </div>
        <div class="uml-footer">
          <div>setHead(Head $head)</div>
          <div>setBody(Body $body)</div>
        </div>
      </div>
    `;
    rootEl.innerHTML = '';
    rootEl.appendChild(el);

    // @ts-ignore
    window.setData = () => {
      const { graphModel, model } = this.props;
      graphModel.eventCenter.emit('custom:button-click', model);
    };
  }
}

class CustomHtmlNodeModel extends HtmlNodeModel {
  setAttributes() {
    console.log('this.properties', this.properties);
    const { width, height, radius } = this.properties as CustomProperties;
    this.width = width || 300;
    this.height = height || 150;
    this.text.editable = false;
    if (radius) {
      this.radius = radius;
    }
  }
}

const CustomHtml = {
  type: 'customHtml',
  view: CustomHtmlNode,
  model: CustomHtmlNodeModel,
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

      lf.register(CustomHtml);

      lf.render(data);
      lf.on('custom:button-click', (model: any) => {
        lf.setProperties(model.id, {
          body: 'LogicFlow',
        });
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

.uml-wrapper {
  background: #efdbff;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  border: 2px solid #9254de;
  box-sizing: border-box;
}

.uml-btn {
  width: 32px;
  min-width: 32px;
  color: #fff;
  background-color: #9254de;
  border: 1px solid #1a223f;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}

.uml-btn:hover {
  color: #fff;
  background-color: #a780d7;
}

.uml-head {
  text-align: center;
  line-height: 30px;
  font-size: 16px;
  font-weight: bold;
}

.uml-body {
  border-top: 1px solid #9254de;
  border-bottom: 1px solid #9254de;
  padding: 5px 10px;
  font-size: 12px;
}

.uml-footer {
  padding: 5px 10px;
  font-size: 14px;
}

`);
