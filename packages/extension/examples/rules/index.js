window.onload = function () {
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    // fixme: grid成为了必传的了
    grid: {
      type: 'dot',
      size: 20,
    },
  });
  registerStart(lf);
  registerUser(lf);
  lf.render(); 
  lf.on('connection:not-allowed', (e) => {
    alert(e.msg);
  })
  // 初始化拖入功能
  document.querySelector('#start-node-pattern').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'start',
      text: '开始',
    });
  });
  document.querySelector('#user-node-pattern').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'user-task',
      text: '用户节点'
    })
  });
}

function registerStart(lf) {
  class StartNode extends CircleNode {
  }
  class StartModel extends CircleNodeModel {
    constructor(data, graphModel) {
      if (data.text && typeof data.text === 'string') {
        data.text = {
          value: data.text,
          x: data.x,
          y: data.y + 35
        }
      }
      super(data, graphModel);
      this.r = 18;
      this.strokeWidth = 2;
      this.stroke = 'rgb(24, 125, 255)';
    }
    getConnectedTargetRules() {
      const rules = super.getConnectedTargetRules();
      const notAsTarget = {
        message: '起始节点不能作为边的终点',
        validate: () => false,
      };
      rules.push(notAsTarget);
      return rules;
    }
  }
  lf.register({
    type: 'start',
    view: StartNode,
    model: StartModel,
  });
}

function registerUser(lf) {
  class UserTaskNode extends RectNode {
  }
  class UserTaskModel extends RectNodeModel {
    constructor(data, graphModel) {
      if (data.text && typeof data.text === 'string') {
        data.text = {
          value: data.text,
          x: data.x,
          y: data.y
        }
      }
      super(data, graphModel);
      this.width = 100;
      this.height = 80;
      this.strokeWidth = 2;
      this.stroke = 'rgb(24, 125, 255)';
      this.radius = 10;
      this.fillOpacity = 0.95;
    }
  }
  lf.register({
    view: UserTaskNode,
    model: UserTaskModel,
    type: 'user-task',
  });
}
