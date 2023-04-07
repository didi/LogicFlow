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
  keyboard: {
    enabled: true
  },
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
  "nodes": [
    {
      "id": "93242a5c-c2fd-4837-8f74-bbe08d77c702",
      "type": "customRect",
      "x": 100,
      "y": 100,
      "properties": {},
      "width": 100,
      "height": 80
    },
    {
      "id": "f6ca2ae5-2a28-4881-8d06-4381c1e6d039",
      "type": "customRect",
      "x": 345,
      "y": 100,
      "properties": {},
      "width": 100,
      "height": 80
    },
    {
      "id": "0a7d4f92-e0e9-4855-8dd9-2b78b839be72",
      "type": "customRect",
      "x": 323,
      "y": 250,
      "properties": {},
      "width": 100,
      "height": 80
    },
    {
      "id": "b7c4323b-89fe-4b59-9778-30964b6e5a4b",
      "type": "customRect",
      "x": 610,
      "y": 100,
      "properties": {},
      "width": 100,
      "height": 80
    },
    {
      "id": "793fdbcc-c1b1-4427-9fb1-fad9329d6085",
      "type": "customRect",
      "x": 611,
      "y": 251,
      "properties": {},
      "width": 100,
      "height": 80
    }
  ],
  "edges": [
    {
      "id": "db24c3d7-66cc-4403-af61-693cadcc7576",
      "type": "polyline",
      "sourceNodeId": "93242a5c-c2fd-4837-8f74-bbe08d77c702",
      "targetNodeId": "f6ca2ae5-2a28-4881-8d06-4381c1e6d039",
      "startPoint": {
        "x": 150,
        "y": 100
      },
      "endPoint": {
        "x": 295,
        "y": 100
      },
      "properties": {},
      "pointsList": [
        {
          "x": 150,
          "y": 100
        },
        {
          "x": 295,
          "y": 100
        }
      ]
    },
    {
      "id": "4e1a2827-9afa-4731-b21b-4468975e09f7",
      "type": "polyline",
      "sourceNodeId": "93242a5c-c2fd-4837-8f74-bbe08d77c702",
      "targetNodeId": "0a7d4f92-e0e9-4855-8dd9-2b78b839be72",
      "startPoint": {
        "x": 150,
        "y": 100
      },
      "endPoint": {
        "x": 273,
        "y": 250
      },
      "properties": {},
      "pointsList": [
        {
          "x": 150,
          "y": 100,
        },
        {
          "x": 273,
          "y": 250
        }
      ]
    },
    {
      "id": "e73fc5e7-c1a2-4e7f-8cde-6307cd60c5fb",
      "type": "polyline",
      "sourceNodeId": "f6ca2ae5-2a28-4881-8d06-4381c1e6d039",
      "targetNodeId": "0a7d4f92-e0e9-4855-8dd9-2b78b839be72",
      "startPoint": {
        "x": 395,
        "y": 100
      },
      "endPoint": {
        "x": 273,
        "y": 250
      },
      "properties": {},
      "pointsList": [
        {
          "x": 395,
          "y": 100
        },
        {
          "x": 273,
          "y": 250
        }
      ]
    },
    {
      "id": "9301f104-6ad3-4d4b-83b8-73b2038627bc",
      "type": "polyline",
      "sourceNodeId": "0a7d4f92-e0e9-4855-8dd9-2b78b839be72",
      "targetNodeId": "b7c4323b-89fe-4b59-9778-30964b6e5a4b",
      "startPoint": {
        "x": 373,
        "y": 330
      },
      "endPoint": {
        "x": 610,
        "y": 100
      },
      "properties": {},
      "pointsList": [
        {
          "x": 373,
          "y": 330
        },
        {
          "x": 610,
          "y": 100
        }
      ]
    },
    {
      "id": "2372042b-70f9-4c4a-b4c4-2f30d3254494",
      "type": "polyline",
      "sourceNodeId": "b7c4323b-89fe-4b59-9778-30964b6e5a4b",
      "targetNodeId": "793fdbcc-c1b1-4427-9fb1-fad9329d6085",
      "startPoint": {
        "x": 710,
        "y": 100
      },
      "endPoint": {
        "x": 711,
        "y": 251
      },
      "properties": {},
      "pointsList": [
        {
          "x": 710,
          "y": 100
        },
        {
          "x": 711,
          "y": 251
        }
      ]
    }
  ]
}

);

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
  console.log(JSON.stringify(lf.getGraphData()))
})

document.body.addEventListener('mousedown', () => {
  console.log('body mouse down')
})

document.body.addEventListener('click', () => {
  console.log('body mouse click')
})