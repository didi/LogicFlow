import customNode from "./customNode.mjs";

const lf = new LogicFlow({
  container: document.querySelector('#container'),
  adjustEdgeStartAndEnd: true,
  width: 1000,
  grid: true,
  height: 400,
  // hoverOutline: false
})

lf.register(customNode);

lf.render({
  nodes: [
    {
      id: 'custom-111',
      type: 'button-node',
      x: 300,
      y: 100,
      properties: {
        name: 'hello',
        body: 'world'
      }
    },
    {
      id: 'custom-112',
      type: 'button-node',
      x: 300,
      y: 300,
      properties: {
        name: 'hello',
        body: 'world'
      }
    }
  ]
});

lf.on("custom:button-click", (model) => {
  lf.setProperties(model.id, {
    body: "LogicFlow"
  });
});

document.querySelector('#event-test').addEventListener('click', () => {
  console.log('click')
})
document.querySelector('#event-test-wrapper').addEventListener('mousedown', (ev) => {
  // console.log(ev)
  console.log('mousedown')
  ev.stopPropagation()
  ev.preventDefault()
})
document.querySelector('#event-test').addEventListener('mousedown', (ev) => {
  console.log('mousedown')
})
