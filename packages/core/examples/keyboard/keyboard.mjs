import { baseData } from '../data.mjs'

const lf = new LogicFlow({
  container: document.querySelector('#container'),
  adjustEdgeStartAndEnd: true,
  width: 1000,
  grid: true,
  height: 400,
  keyboard: {
    enabled: true,
    shortcuts: [
      {
        keys: ["backspace"],
        callback: () => {
          const r = confirm('确定要删除吗？')
          if (r) {
            const elements = lf.getSelectElements(true);
            lf.clearSelectElements();
            elements.edges.forEach(edge => lf.deleteEdge(edge.id));
            elements.nodes.forEach(node => lf.deleteNode(node.id));
          }
        }
      }
    ]
  }
  // hoverOutline: false
})

lf.render(baseData);
