import { baseData } from '../data.mjs'
const lf = new LogicFlow({
  container: document.querySelector('#container'),
  grid: {
    type: 'mesh'
  },
})
lf.render(baseData);