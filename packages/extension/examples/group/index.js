const lf = new LogicFlow({
  container: document.querySelector('#app'),
  grid: true,
  width: 1000,
  keyboard: {
    enabled: true
  },
  plugins: [Group, Control],
  height: 500
})

class MyGroup extends GroupNode.view {
}

class MyGroupModel extends GroupNode.model {
  initNodeData(data) {
    super.initNodeData(data);
    this.isRestrict = true;
    this.resizable = true;
    this.foldable = true;
    this.width = 500;
    this.height = 300;
    this.foldedWidth = 60;
    this.foldedHeight = 60;
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = '#AEAFAE';
    style.strokeDasharray = '3 3';
    style.strokeWidth = 1;
    return style;
  }
}


lf.register({
  type: 'my-group',
  model: MyGroupModel,
  view: MyGroup
})

lf.render({
  nodes: [
    {
      type: 'my-group',
      x: 400,
      y: 400,
      children: [
        'rect_2'
      ]
    },
    {
      id: 'group',
      type: 'group',
      x: 700,
      y: 200
    },
    {
      id: 'rect_2',
      type: 'circle',
      x: 400,
      y: 400
    },
    {
      id: 'rect_3',
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