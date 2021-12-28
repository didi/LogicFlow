import { baseData } from '../data.mjs'
import customPolyline from './customPolyline.mjs';
import customLine from './customLine.mjs';
import customBezier from './customBezier.mjs';

const lf = new LogicFlow({
  container: document.querySelector('#container'),
  adjustEdgeStartAndEnd: true,
  width: 1000,
  grid: true,
  edgeType: 'custom-polyline',
  keyboard: {
    enabled: true,
  },
  height: 400
})
lf.register(customPolyline);
lf.register(customLine);
lf.register(customBezier);
lf.setTheme(
  {
    baseNode: {
      fill: 'rgb(255, 230, 204)',
      stroke: 'green',
      strokeDasharray: '3,3'
    },
    rect: {
      fill: '#FFFFFF',
      strokeDasharray: '10, 1',
      className: 'custom-cls',
      radius: 30,
    },
    circle: {
      r: 10,
      fill: '#9a9b9c'
    },
    diamond: {
      fill: '#238899'
    },
    ellipse: {
      strokeWidth: 3
    },
    polygon: {
      strokeDasharray: 'none'
    },
    anchor: {
      r: 3,
      fill: '#9a9312',
      hover: {
        fill: 'red'
      }
    },
    nodeText: {
      // textWidth: 60,
      fontSize: 20,
      color: 'red',
      // overflowMode: 'ellipsis'
      overflowMode: 'autoWrap'
    },
    baseEdge: {
      strokeWidth: 1,
      strokeDasharray: '3,3'
    },
    edgeText: {
      textWidth: 60,
      overflowMode: 'autoWrap',
      background: {
        fill: '#919810'
      }
    },
    polyline: {
      offset: 20,
      strokeDasharray: 'none',
      strokeWidth: 1,
    },
    bezier: {
      stroke: 'red',
      adjustLine: {
        strokeWidth: 2,
        stroke: 'red'
      },
      adjustAnchor: {
        stroke: 'blue',
        fill: 'green'
      }
    },
    arrow: {
      offset: 10, // 箭头长度
      verticalLength: 3, // 箭头垂直于边的距离
      fill: 'none',
      stroke: 'green',
    },
    anchorLine: {
      stroke: 'red'
    },
    snapline: {
      stroke: 'red'
    },
    edgeAdjust: {
      r: 10,
    },
    outline: {
      stroke: 'red',
      hover: {
        stroke: 'green'
      }
    }
  }
);
baseData.edges.push({
  type: 'custom-bezier',
  sourceNodeId: '1',
  targetNodeId: '4',
  properties: {
    isActived: false
  }
});
baseData.edges.push({
  type: 'custom-line',
  sourceNodeId: '2',
  targetNodeId: '4',
  properties: {
    isActived: true
  }
});
lf.render(baseData);