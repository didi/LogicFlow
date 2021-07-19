import Call from './call.js'

const lf = new LogicFlow({
  container: document.querySelector('#container'),
  grid: true,
});

class UserNode extends HtmlNode {
  shouldUpdate() {
    const { properties } = this.getAttributes();
    if (this.currrentProperties && this.currrentProperties === JSON.stringify(properties)) return false;
    this.currrentProperties = JSON.stringify(properties)
    return true;
  }
  setHtml(rootEl) {
    // todo: 和react不一样，还没有找到合适的利用vue内置的diff算法来计算节点是否需要更新。
    if (!this.shouldUpdate()) return;
    const { properties } = this.getAttributes();
    const { model } = this.props;
    const el = document.createElement('div');
    rootEl.innerHTML = '';
    rootEl.appendChild(el);
    const Profile = Vue.extend({
      render: (h) => {
        return h(Call, {
          props: {
            name: properties.name
          },
          on: {
            'change-name': (pname) => {
              model.setProperties({
                name: pname
              })
            }
          }
        })
      }
    })
    new Profile().$mount(el)
  }
}

class UserNodeModel extends HtmlNodeModel {
  setAttributes() {
    this.text.editable = false;
    const width = 200;
    const height = 100;
    this.width = width;
    this.height = height;

    this.anchorsOffset = [
      [width / 2, 0],
      [0, height / 2],
      [-width / 2, 0],
      [0, -height/2],
    ]
  }
}

lf.register({
  type: 'vue-html',
  view: UserNode,
  model: UserNodeModel,
})

lf.render({
  nodes: [
    {
      type: 'vue-html',
      x: 150,
      y: 150,
    }
  ]
});

console.log(111);