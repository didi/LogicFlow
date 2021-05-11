var lf;

function getInitData() {
  const data = {
    nodes: [
      {
        id: '1',
        x: 100,
        y: 100,
        type: 'rect'
      },
      {
        id: '2',
        x: 300,
        y: 400,
        type: 'circle'
      }
    ],
    edges: [
      {
        id: 'edge3',
        type: 'polyline',
        sourceNodeId: '1',
        targetNodeId: '2',
        text: '3331',
      }
    ],
  }
  return data;
}

function initEvent() {
  document.querySelector('#getData').addEventListener('click', function() {
    console.log(lf.getData());
  })
}

function init() {
  lf = new LogicFlow({
    container: document.querySelector('#app'),
  });
  lf.render(getInitData());
}

init();