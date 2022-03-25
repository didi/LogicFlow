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
  width: 1000,
  grid: true,
  // edgeType: 'custom-polyline',
  keyboard: {
    enabled: true,
  },
  height: 400
})
registerCondition(lf)
registerExecute(lf)
registerGroup(lf)
registerGroup(lf)
registerStart(lf)
registerTransfer(lf)
registerUser(lf)

lf.render(data)