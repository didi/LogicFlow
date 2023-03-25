import customRect from './customRect.mjs';
import customCircle from './customCircle.mjs';
import customDiamond from './customDiamond.mjs';
import customEllipse from './customEllipse.mjs';
import customPolygon from './customPolygon.mjs';
import CusomHexagon from './cusomHexagon.mjs'
import customText from './customText.mjs';
import customHtml from './customHtml.mjs';
import userTask from './userTask.mjs';

const lf = new LogicFlow({
  container: document.querySelector('#container'),
  adjustEdgeStartAndEnd: true,
  width: 1000,
  grid: false,
  height: 600,
  background: {
    // filter: 'grayscale(100%)'
    backgroundImage: 'url(https://cdn.jsdelivr.net/gh/towersxu/cdn@latest/knowledge/animal/horse.png)',
    /* 加入模糊 */
    filter: 'blur(5px)',
    // ['-webkit-backdrop-filter']: 'blur(5px)'
    // backgroundColor: 'red'
    // background: '-webkit-gradient(linear,0 0,0 100%,from(#f00),to(#0000FF))';
    // background: -moz-gradient(linear,0 0,0 100%,from(#f00),to(#0000FF));     
    // background:-webkit-gradient(linear,left top,left bottom,from(#f00),to(#00f)); 
  }
  // hoverOutline: false
})

lf.register(customRect);
lf.register(customCircle);
lf.register(customDiamond);
lf.register(customEllipse);
lf.register(customPolygon);
lf.register(CusomHexagon);
lf.register(customText);
lf.register(customHtml);
lf.register(userTask);

lf.render({
  nodes: [
    {
      id: 'custom-111',
      type: 'UserTask',
      x: 700,
      y: 100,
      properties: {
        disabled: true
      }
    },
    {
      id: 'custom-112',
      type: 'customCircle',
      x: 500,
      y: 100
    },
    {
      id: 'custom-114',
      type: 'diamondNode',
      x: 300,
      y: 100
    },
    {
      id: 'custom-115',
      type: 'ellipseNode',
      x: 100,
      y: 100
    },
    {
      id: 'custom-116',
      type: 'polygonNode',
      x: 900,
      y: 100
    },
    {
      id: 'custom-61',
      type: 'hexagonNode',
      x: 200,
      y: 300,
    },
    {
      id: 'custom-62',
      type: 'hexagonNode',
      x: 500,
      y: 500,
    },
    {
      id: 'custom-117',
      type: 'textNode',
      x: 600,
      y: 300,
      text: '叽叽叽叽',
      properties: {
        isSelected: true
      }
    },
    {
      id: 'custom-118',
      type: 'customHtml',
      x: 800,
      y: 300,
    }
  ],
  edges: [
    {
      type: 'polyline',
      id: 'edge-1',
      sourceNodeId: 'custom-61',
      targetNodeId: 'custom-62',
    }
  ]
});

lf.on('anchor:dragstart', ({ data, nodeModel }) => {
  if (nodeModel.type === 'hexagonNode') {
    lf.graphModel.nodes.forEach(node => {
      if (node.type === 'customCircle') {
        node.setProperties({
          isConnectable: true
        })
      }
    });
  }
})

lf.on('anchor:drop', ({ data, nodeModel }) => {
  if (nodeModel.type === 'hexagonNode') {
    lf.graphModel.nodes.forEach(node => {
      if (node.type === 'customCircle') {
        node.setProperties({
          isConnectable: false
        })
      }
    });
  }
})

lf.on('connection:not-allowed', (data) => {
  console.log(data)
})

document.querySelector('#select_js').addEventListener('click', () => {
  lf.setProperties('custom-111', {
    isSelected: true
  })
})

document.querySelector('#get_data').addEventListener('click', () => {
  console.log(lf.getGraphData())
})

document.body.addEventListener('mousedown', () => {
  console.log('body mouse down')
})

document.body.addEventListener('click', () => {
  console.log('body mouse click')
})