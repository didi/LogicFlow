import CustomNode from './CustomNode.mjs'

let lf;
function init () {
  lf = new LogicFlow({
    container: document.querySelector('#app'),
    grid: true,
    keyboard: {
      enabled: true
    },
    plugins: [ Dagre ]
  })
  lf.register(CustomNode)
  lf.render()
}

window.addEventListener('DOMContentLoaded', () => {
  init()
})
document.querySelector('.circle-node').addEventListener('mousedown', () => {
  lf.dnd.startDrag({
    type: 'circle',
  })
})

document.querySelector('.rect-node').addEventListener('mousedown', () => {
  lf.dnd.startDrag({
    type: 'custom-node'
  })
})

document.querySelector('#layout').addEventListener('click', () => {
  lf.extension.dagre.layout()
})
