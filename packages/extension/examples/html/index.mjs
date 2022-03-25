import data from './data.mjs'
import registerCondition from './condition.mjs'
import registerExecute from './execute.mjs'
import registerGroup from './ivrGroupNode.mjs'
import registerStart from './start.mjs'
import registerTransfer from './transfer.mjs'
import registerUser from './user.mjs'

const lf = new LogicFlow({
  container: document.querySelector('#container'),
  adjustEdgeStartAndEnd: true,
  // width: 1000,
  width: 1800,
  height: 1000,
  grid: true,
  // edgeType: 'custom-polyline',
  keyboard: {
    enabled: true,
  },
  plugins: [Group, SelectionSelect],
})
registerCondition(lf)
registerExecute(lf)
registerGroup(lf)
registerGroup(lf)
registerStart(lf)
registerTransfer(lf)
registerUser(lf)

lf.render(data)
lf.extension.selectionSelect.openSelectionSelect();
lf.on('selection:selected', () => {
  setTimeout(() => {
    const { nodes } = lf.getSelectElements();
    const { startPoint, endPoint } = lf.extension.selectionSelect;
    lf.clearSelectElements();
    if (nodes.some(node => node.type === 'ivrGroupNode')) {
      return;
    }
    // startPoint 和 endPoint 是dom坐标，需要转换成canvas坐标绘制
    const { transformModel } = lf.graphModel;
    const [x1, y1] = transformModel.HtmlPointToCanvasPoint([startPoint.x, startPoint.y]);
    const [x2, y2] = transformModel.HtmlPointToCanvasPoint([endPoint.x, endPoint.y]);
    const width = x2 - x1;
    const height = y2 - y1;
    if (width < 175 && height < 40) {
      // 分组节点太小容易丢失，而且没必要这么小，没法缩小。。。
      return;
    }
    lf.addNode({
      type: 'ivrGroupNode',
      x: x1 + width / 2,
      y: y1 + height / 2,
      width,
      height,
      children: nodes.map(item => item.id),
    });
    // lf.closeSelectionSelect();
  });
});