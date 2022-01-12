import { baseData } from '../data.mjs'

const lf = new LogicFlow({
  container: document.querySelector('#container'),
  adjustEdgeStartAndEnd: true,
  width: 1000,
  grid: true,
  height: 400,
  // hoverOutline: false
})

lf.render(baseData);

document.querySelector('#js_resize').addEventListener('click', () => {
  lf.resize(1200, 600);
})

document.querySelector('#js_show_input').addEventListener('click', () => {
  lf.editText('11')
})

document.querySelector('#js_focus_on').addEventListener('click', () => {
  lf.focusOn({
    id: '2'
  })
})

document.querySelector('#js_change_edge_type').addEventListener('change', (e) => {
  // console.log(this, e.target.value)
  const { edges, nodes } = lf.getGraphData();
  if (edges.length) {
    lf.changeEdgeType(edges[0].id, e.target.value)
  }
})