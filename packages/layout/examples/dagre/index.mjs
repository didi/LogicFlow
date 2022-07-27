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
  lf.render({
    nodes: [
      {
        id: "9d38539c-fd44-40cf-b5fb-b09bdc72758e",
        properties: {},
        type: "circle",
        x: 120,
        y: 120,
      },
      {
        id: "6f3d235e-a6b3-4f6b-b23f-e3af69ec20fe",
        properties: {},
        type: "circle",
        x: 340,
        y: 120
      }
    ],
    edges: [
      {
        type: 'polyline',
        sourceNodeId: '9d38539c-fd44-40cf-b5fb-b09bdc72758e',
        targetNodeId: '6f3d235e-a6b3-4f6b-b23f-e3af69ec20fe'
      }
    ]
  })
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
