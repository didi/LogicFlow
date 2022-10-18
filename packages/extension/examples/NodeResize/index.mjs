import ResizableRect from "./ResizableRect.mjs";
// eslint-disable-next-line import/extensions
import ResizableEllipse from './ResizableEllipse.mjs';
import ResizableDiamond from './ResizableDiamond.mjs';
import ResizableHtml from './ResizableHtml.mjs';
import ResizableHexagon from "./ResizableHexagon.mjs";

window.onload = function () {
  // eslint-disable-next-line no-undef
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    // isSilentMode: true,
    // fixme: grid成为了必传的了
    grid: false,
    keyboard: {
      enabled: true,
    },
  });
  lf.register(ResizableEllipse);
  lf.register(ResizableRect);
  lf.register(ResizableDiamond);
  lf.register(ResizableHtml);
  lf.register(ResizableHexagon);

  lf.extension.menu.setMenuConfig({
    nodeMenu: [
      {
        text: '开启等比例缩放',
        callback(data) {
          const model = lf.getNodeModelById(data.id);
          if (model) {
            try {
              model.enableProportionResize();
              console.log('开启等比例缩放');
            } catch (error) {
              console.log('enableProportionResize() 方法未定义');
            }
          }
        }
      },
      {
        text: '关闭等比例缩放',
        callback(data) {
          const model = lf.getNodeModelById(data.id);
          if (model) {
            try {
              model.enableProportionResize(false);
              console.log('关闭等比例缩放');
            } catch (error) {
              console.log('enableProportionResize() 方法未定义');
            }
          }
        }
      },
    ],
    edgeMenu: [],
    graphMenu: []
  });

  lf.render({
    nodes: [
      {
        id: 'rect_3',
        type: 'resizable-rect',
        x: 150,
        y: 100,
        properties: {
          nodeSize: {
            width: 204,
            height: 74,
          },
        },
      },
      {
        id: 'rect_31',
        type: 'resizable-rect',
        x: 150,
        y: 250,
      },
      {
        id: 'ellipse_3',
        type: 'resizable-ellipse',
        x: 350,
        y: 100,
        properties: {
          nodeSize: {
            rx: 34,
            ry: 73,
          },
        },
      },
      {
        id: 'ellipse_31',
        type: 'resizable-ellipse',
        x: 350,
        y: 250,
      },
      {
        id: 'diamond_31',
        type: 'resizable-diamond',
        x: 500,
        y: 100,
      },
      {
        id: 'diamond_33',
        type: 'resizable-diamond',
        x: 500,
        y: 250,
        properties: {
          nodeSize: {
            rx: 34,
            ry: 73,
          },
        },
      },
      {
        id: 'html_33',
        type: 'resizable-html',
        x: 700,
        y: 100,
        properties: {
          tableName: "Users",
          fields: [
            {
              key: "id",
              type: "string"
            },
            {
              key: "name",
              type: "string"
            },
            {
              key: "age",
              type: "integer"
            }
          ]
        }
      },
      {
        id: 'html_34',
        type: 'resizable-html',
        x: 700,
        y: 250,
        properties: {
          tableName: "Students",
          fields: [
            {
              key: "id",
              type: "string"
            },
            {
              key: "name",
              type: "string"
            },
            {
              key: "age",
              type: "integer"
            }
          ],
          nodeSize: {
            width: 160,
            height: 80
          }
        }
      },
      {
        id: 'diamond_34',
        type: 'resizable-hexagon',
        x: 900,
        y: 100,
      },
      {
        id: 'diamond_36',
        type: 'resizable-hexagon',
        x: 900,
        y: 250,
        properties: {
          nodeSize: {
            width: 260,
            height: 80
          }
        }
      },
    ],
    edges: [
    ],
  });
  lf.on('node:resize', (data) => {
    console.log(data);
  });
  // 初始化拖入功能
  document.querySelector('#rect').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'rect',
    });
  });
  document.querySelector('#circle').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'ellipse',
    });
  });
  document.querySelector('#diamond').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'diamond',
    });
  });
  document.querySelector('#data').addEventListener('mousedown', () => {
    console.log(JSON.stringify(lf.getGraphData()));
  });
};
