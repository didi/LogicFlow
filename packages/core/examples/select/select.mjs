import { baseData } from '../data.mjs'
const lf = new LogicFlow({
  container: document.querySelector('#container'),
  background: {
    backgroundImage: 'url(../img/grid.svg)',
    backgroundRepeat: 'repeat',
  },
  grid: {
    visible: false
  },
})
lf.render(baseData);

document.querySelector('#js_select').addEventListener('click', () => {
  lf.selectElementById(baseData.nodes[0].id);
});

document.querySelector('#js_mutil_select').addEventListener('click', () => {
  lf.updateEditConfig({
    multipleSelectKey: 'meta'
  })
});

