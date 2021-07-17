const lf = new LogicFlow({
  container: document.querySelector('#container'),
  grid: true,
});
lf.render({
  nodes: [
    {
      type: 'rect',
      x: 100,
      y: 100,
    }
  ]
});
console.log(111);