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

lf.on('node:drop', ({ data }) => {
  console.log(data)
  setTimeout(() => {
    const d = lf.getNodeModelById(data.id)
    console.log(d)
  }, 100)
})
lf.on('node:click', ({ data }) => {
  console.log('node:click', data)
})
lf.on('node:dbclick', ({ data }) => {
  console.log('node:dbclick', data)
})
lf.on('node:drop', () => {
  console.log('node:drop')
})
lf.on('node:contextmenu', () => {
  console.log('node:contextmenu')
})