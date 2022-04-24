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
    }
  ]
});

lf.on("custom:button-click", (model) => {
  lf.setProperties(model.id, {
    body: "LogicFlow"
  });
});


document.querySelector('#js_change').addEventListener('click', () => {
  lf.getNodeModelById('custom-111').setProperties({
    name: undefined
  })
})