import LogicFlow from '../../src/index'

import NodeConfig = LogicFlow.NodeConfig
import TextConfig = LogicFlow.TextConfig

type NodeConfigTextObj = NodeConfig & {
  text: TextConfig
}
describe('#1545', () => {
  const dom = document.createElement('div')
  dom.id = 'main-graph'
  document.body.appendChild(dom)
  const lf = new LogicFlow({
    container: dom,
    width: 1000,
    height: 1000,
    grid: true,
  })

  it('clone node text pos should snap to grid', () => {
    lf.render({
      nodes: [
        {
          id: 'node_id_1',
          type: 'rect',
          x: 300,
          y: 300,
          text: {
            x: 32,
            y: 19,
            value: '文本1',
          },
        },
      ],
    })
    const originNode = lf.getDataById('node_id_1') as NodeConfigTextObj
    const newNode = lf.cloneNode('node_id_1') as NodeConfigTextObj
    expect(originNode.x - originNode.text.x).toEqual(newNode.x - newNode.text.x)
    expect(originNode.y - originNode.text.y).toEqual(newNode.y - newNode.text.y)
    expect(originNode.text.value).toEqual(newNode.text.value)
  })
})
