import type { NodeConfig, TextConfig } from '../../src/index';
import { LogicFlow } from '../../src/index';

type NodeConfigTextObj = NodeConfig & { text: TextConfig };
describe('graphmodel', () => {
  const dom = document.createElement('div');
  dom.id = 'main-graph';
  document.body.appendChild(dom);
  const lf = new LogicFlow({
    container: dom,
    width: 1000,
    height: 1000,
    keyboard: {
      enabled: true,
    },
    allowRotation: true,
    metaKeyMultipleSelected: true,
    grid: true,
    snapline: true,
  });

  // 将node节点位置进行grid修正，同时处理node内文字的偏移量，返回一个位置修正过的复制节点NodeModel
  test('getModelAfterSnapToGrid', () => {
    const rawData = {
      nodes: [
        {
          id: 'node1',
          type: 'rect',
          x: 111,
          y: 123,
          text: {
            x: 32,
            y: 19,
            value: '文本1',
          },
        },
      ],
    };
    lf.render(rawData);

    const originNode = lf.getDataById('node1') as NodeConfigTextObj;

    // grid=true 默认 gridSize=20
    const newNode = lf.graphModel.getModelAfterSnapToGrid(originNode) as NodeConfigTextObj;
    expect(originNode.x - originNode.text.x).toEqual(newNode.x - newNode.text.x);
    expect(originNode.y - originNode.text.y).toEqual(newNode.y - newNode.text.y);
    expect(originNode.text.value).toEqual(newNode.text.value);

    lf.graphModel.gridSize = 40;
    const newNode1 = lf.graphModel.getModelAfterSnapToGrid(originNode) as NodeConfigTextObj;
    expect(originNode.x - originNode.text.x).toEqual(newNode1.x - newNode1.text.x);
    expect(originNode.y - originNode.text.y).toEqual(newNode1.y - newNode1.text.y);
    expect(originNode.text.value).toEqual(newNode1.text.value);

    lf.graphModel.gridSize = 1;
    const newNode2 = lf.graphModel.getModelAfterSnapToGrid(originNode) as NodeConfigTextObj;
    expect(originNode.x - originNode.text.x).toEqual(newNode2.x - newNode2.text.x);
    expect(originNode.y - originNode.text.y).toEqual(newNode2.y - newNode2.text.y);
    expect(originNode.text.value).toEqual(newNode2.text.value);

    lf.graphModel.gridSize = 17;
    const newNode3 = lf.graphModel.getModelAfterSnapToGrid(originNode) as NodeConfigTextObj;
    expect(originNode.x - originNode.text.x).toEqual(newNode3.x - newNode3.text.x);
    expect(originNode.y - originNode.text.y).toEqual(newNode3.y - newNode3.text.y);
    expect(originNode.text.value).toEqual(newNode3.text.value);
  });
});
