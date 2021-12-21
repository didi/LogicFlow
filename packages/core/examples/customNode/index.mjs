import customRect from './customRect.mjs';
import customCircle from './customCircle.mjs';
import customDiamond from './customDiamond.mjs';
import customEllipse from './customEllipse.mjs';
import customPolygon from './customPolygon.mjs';
import customText from './customText.mjs';
import customHtml from './customHtml.mjs';

const lf = new LogicFlow({
  container: document.querySelector('#container'),
  adjustEdgeStartAndEnd: true,
  width: 1000,
  grid: true,
  height: 400,
  // hoverOutline: false
})

lf.register(customRect);
lf.register(customCircle);
lf.register(customDiamond);
lf.register(customEllipse);
lf.register(customPolygon);
lf.register(customText);
lf.register(customHtml);

lf.render({
  nodes: [
    {
      id: 'custom-111',
      type: 'customNode',
      x: 700,
      y: 100
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
      x: 100,
      y: 300
    },
    {
      id: 'custom-117',
      type: 'textNode',
      x: 300,
      y: 300,
      text: '叽叽叽叽',
      properties: {
        isSelected: true
      }
    },
    {
      id: 'custom-118',
      type: 'customHtml',
      x: 500,
      y: 300,
    }
  ]
});

document.querySelector('#select_js').addEventListener('click', () => {
  lf.setProperties('custom-111', {
    isSelected: true
  })
})