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