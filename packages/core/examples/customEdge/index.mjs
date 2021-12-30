import { baseData } from '../data.mjs'
import customPolyline from './customPolyline.mjs';
import customLine from './customLine.mjs';
import customBezier from './customBezier.mjs';

const lf = new LogicFlow({
  container: document.querySelector('#container'),
  adjustEdgeStartAndEnd: true,
  width: 1000,
  grid: true,
  // edgeType: 'custom-polyline',
  keyboard: {
    enabled: true,
  },
  height: 400
})
lf.register(customPolyline);
lf.register(customLine);
lf.register(customBezier);
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