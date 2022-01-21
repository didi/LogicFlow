const lf = new LogicFlow({
  container: document.querySelector('#app'),
  grid: true,
  width: 1000,
  plugins: [Group,Control],
  height: 500
})

lf.render({
  nodes: [
    {
      type: 'group',
      x: 400,
      y: 400,
      children: [
        'rect_1'
      ]
    },
    {
      id: 'rect_1',
      type: 'rect',
      x: 400,
      y: 400
    },
    {
      id: 'rect_2',
      type: 'circle',
      x: 200,
      y: 200
    }
  ]
});

document.querySelector('#getData').addEventListener('click', () => {
  const data = lf.getGraphData();
  console.log(data);
})
document.querySelector('#render').addEventListener('click', () => {
  lf.render({
    nodes: [
      {
        type: 'circle',
        x: 300,
        y: 100
      }
    ]
  })
})