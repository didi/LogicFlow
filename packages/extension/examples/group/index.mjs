const lf = new LogicFlow({
  container: document.querySelector('#app'),
  grid: true,
  width: 1400,
  keyboard: {
    enabled: true
  },
  plugins: [Group, Control, DndPanel, SelectionSelect],
  height: 800
})

lf.extension.control.addItem({
  iconClass: "custom-minimap",
  title: "",
  text: "框选",
  onClick: (lf, ev) => {
    lf.extension.selectionSelect.openSelectionSelect()
  }
})

class MyGroup extends GroupNode.view {}

class MyGroupModel extends GroupNode.model {
  initNodeData(data) {
    super.initNodeData(data);
    this.isRestrict = true;
    this.resizable = true;
    this.width = 480;
    this.height = 280;
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = "#AEAFAE";
    style.strokeWidth = 1;
    return style;
  }
  // isAllowAppendIn(nodeData) {
  //   if (nodeData.type === 'rect') {
  //     return false
  //   }
  //   return true
  // }
}

class MyGroup1 extends GroupNode.view {}

class MyGroupModel1 extends GroupNode.model {
  setAttributes() {
    const size = 80;
    const circleOnlyAsTarget = {
      message: "正方形节点下一个节点只能是圆形节点",
      validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {
        return false;
      },
    };
    this.targetRules.push(circleOnlyAsTarget);
  }
  initNodeData(data) {
    super.initNodeData(data);
    this.foldable = true;
    this.width = 400;
    this.height = 200;
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = "#989891";
    style.strokeWidth = 1;
    style.strokeDasharray = "3 3";
    if (this.isSelected) {
      style.stroke = "rgb(124, 15, 255)";
    }
    if (this.isFolded) {
      style.fill = "#47C769";
    }
    return style;
  }
  // isAllowAppendIn(nodeData) {
  //   return false
  // }
}


const rect = {
  type: 'rect',
  label: 'rect',
  icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAAHeEJUAAAAABGdBTUEAALGPC/xhBQAAAvVJREFUOBGNVEFrE0EU/mY3bQoiFlOkaUJrQUQoWMGePLX24EH0IIoHKQiCV0G8iE1covgLiqA/QTzVm1JPogc9tIJYFaQtlhQxqYjSpunu+L7JvmUTU3AgmTfvffPNN++9WSA1DO182f6xwILzD5btfAoQmwL5KJEwiQyVbSVZ0IgRyV6PTpIJ81E5ZvqfHQR0HUOBHW4L5Et2kQ6Zf7iAOhTFAA8s0pEP7AXO1uAA52SbqGk6h/6J45LaLhO64ByfcUzM39V7ZiAdS2yCePPEIQYvTUHqM/n7dgQNfBKWPjpF4ISk8q3J4nB11qw6X8l+FsF3EhlkEMfrjIer3wJTLwS2aCNcj4DbGxXTw00JmAuO+Ni6bBxVUCvS5d9aa04+so4pHW5jLTywuXAL7jJ+D06sl82Sgl2JuVBQn498zkc2bGKxULHjCnSMadBKYDYYHAtsby1EQ5lNGrQd4Y3v4Zo0XdGEmDno46yCM9Tk+RiJmUYHS/aXHPNTcjxcbTFna000PFJHIVZ5lFRqRpJWk9/+QtlOUYJj9HG5pVFEU7zqIYDVsw2s+AJaD8wTd2umgSCCyUxgGsS1Y6TBwXQQTFuZaHcd8gAGioE90hlsY+wMcs30RduYtxanjMGal8H5dMW67dmT1JFtYUEe8LiQLRsPZ6IIc7A4J5tqco3T0pnv/4u0kyzrYUq7gASuEyI8VXKvB9Odytv6jS/PNaZBln0nioJG/AVQRZvApOdhjj3Jt8QC8Im09SafwdBdvIpztpxWxpeKCC+EsFdS8DCyuCn2munFpL7ctHKp+Xc5cMybeIyMAN33SPL3ZR9QV1XVwLyzHm6Iv0/yeUuUb7PPlZC4D4HZkeu6dpF4v9j9MreGtMbxMMRLIcjJic9yHi7WQ3yVKzZVWUr5UrViJvn1FfUlwe/KYVfYyWRLSGNu16hR01U9IacajXPei0wx/5BqgInvJN+MMNtNme7ReU9SBbgntovn0kKHpFg7UogZvaZiOue/q1SBo9ktHzQAAAAASUVORK5CYII=',
}
const circle = {
  type: 'circle',
  label: 'circle',
  icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAA1BJREFUOBFtVE1IVUEYPXOf+tq40Y3vPcmFIdSjIorWoRG0ERWUgnb5FwVhYQSl72oUoZAboxKNFtWiwKRN0M+jpfSzqJAQclHo001tKkjl3emc8V69igP3znzfnO/M9zcDcKT67azmjYWTwl9Vn7Vumeqzj1DVb6cleQY4oAVnIOPb+mKAGxQmKI5CWNJ2aLPatxWa3aB9K7/fB+/Z0jUF6TmMlFLQqrkECWQzOZxYGjTlOl8eeKaIY5yHnFn486xBustDjWT6dG7pmjHOJd+33t0iitTPkK6tEvjxq4h2MozQ6WFSX/LkDUGfFwfhEZj1Auz/U4pyAi5Sznd7uKzznXeVHlI/Aywmk6j7fsUsEuCGADrWARXXwjxWQsUbIupDHJI7kF5dRktg0eN81IbiZXiTESic50iwS+t1oJgL83jAiBupLDCQqwziaWSoAFSeIR3P5Xv5az00wyIn35QRYTwdSYbz8pH8fxUUAtxnFvYmEmgI0wYXUXcCCSpeEVpXlsRhBnCEATxWylL9+EKCAYhe1NGstUa6356kS9NVvt3DU2fd+Wtbm/+lSbylJqsqkSm9CRhvoJVlvKPvF1RKY/FcPn5j4UfIMLn8D4UYb54BNsilTDXKnF4CfTobA0FpoW/LSp306wkXM+XaOJhZaFkcNM82ASNAWMrhrUbRfmyeI1FvRBTpN06WKxa9BK0o2E4Pd3zfBBEwPsv9sQBnmLVbLEIZ/Xe9LYwJu/Er17W6HYVBc7vmuk0xUQ+pqxdom5Fnp55SiytXLPYoMXNM4u4SNSCFWnrVIzKG3EGyMXo6n/BQOe+bX3FClY4PwydVhthOZ9NnS+ntiLh0fxtlUJHAuGaFoVmttpVMeum0p3WEXbcll94l1wM/gZ0Ccczop77VvN2I7TlsZCsuXf1WHvWEhjO8DPtyOVg2/mvK9QqboEth+7pD6NUQC1HN/TwvydGBARi9MZSzLE4b8Ru3XhX2PBxf8E1er2A6516o0w4sIA+lwURhAON82Kwe2iDAC1Watq4XHaGQ7skLcFOtI5lDxuM2gZe6WFIotPAhbaeYlU4to5cuarF1QrcZ/lwrLaCJl66JBocYZnrNlvm2+MBCTmUymPrYZVbjdlr/BxlMjmNmNI3SAAAAAElFTkSuQmCC',
};
console.log(lf.extension)
lf.extension.dndPanel.setPatternItems([
  rect,
  circle,
]);

lf.register({
  type: 'my-group',
  model: MyGroupModel,
  view: MyGroup
})
lf.register({
  type: "sub-process",
  model: MyGroupModel1,
  view: MyGroup1
});


lf.render({
  nodes: [
    {
      type: "my-group",
      x: 400,
      y: 400,
      children: ["rect_2"]
    },
    {
      id: "rect_2",
      type: "circle",
      x: 400,
      y: 400
    },
    {
      id: "rect_3",
      type: "rect",
      x: 200,
      y: 100
    },
    {
      id: "circle_4",
      type: "circle",
      x: 800,
      y: 140
    },
    {
      id: "group_2",
      type: "sub-process",
      x: 300,
      y: 120,
      children: ["rect_3"],
      properties: {
        isFolded: true
      }
    },
    {
      id: "group_4",
      type: "sub-process",
      x: 800,
      y: 120,
      children: ["circle_4"],
      properties: {
        isFolded: true
      }
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
lf.on('group:not-allowed', (data) => {
  console.log('此节点不允许添加到分组中', data)
})