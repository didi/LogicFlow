import { BaseNode, BaseNodeModel, Keyboard } from '../src';
import LogicFlow from '../src/LogicFlow';
import Tool from '../src/tool';
/**
 * @jest-environment jsdom
 */
describe('logicflow/initialize', () => {
  test('init', () => {
    const initContainer = jest.fn();
    LogicFlow.prototype.initContainer = initContainer;
    const dom = document.createElement('div');
    dom.id = 'main-graph';
    document.body.appendChild(dom);
    const lf = new LogicFlow({
      container: dom,
    });
    expect(initContainer).toBeCalled();
    expect(lf).toBeDefined();
  });

  test('elements register', () => {
    const defaultRegister = jest.fn();
    LogicFlow.prototype.defaultRegister = defaultRegister;

    const dom = document.createElement('div');
    dom.id = 'main-graph';
    document.body.appendChild(dom);
    const lf = new LogicFlow({
      container: dom,
    });
    lf.register({
      type: 'test',
      view: BaseNode,
      model: BaseNodeModel,
    });

    lf.register('custom', ({ RectNode, RectNodeModel }) => {
      class CustomView extends RectNode {}
      class CustomModel extends RectNodeModel {}
      return {
        view: CustomView,
        model: CustomModel,
      };
    });

    expect(defaultRegister).toBeCalled();
    expect(lf.getView('test')).toBeDefined();
    expect(lf.getView('custom')).toBeDefined();
    expect(lf.graphModel.getModel('test')).toBeDefined();
    expect(lf.graphModel.getModel('custom')).toBeDefined();
  });

  test('register plugin by Logicflow.use', () => {
    class Plugin {
      static pluginName = 'test-use';
      lf: LogicFlow;
      constructor(lf: LogicFlow) {
        this.lf = lf;
      }
      init() {}
    }
    LogicFlow.use(Plugin);
    expect(LogicFlow.extensions.get('test-use')).toBeDefined();
  });

  test('shortcut', () => {
    const initShortcuts = jest.fn();
    const on = jest.fn();
    Keyboard.prototype.initShortcuts = initShortcuts;
    Keyboard.prototype.on = on;
    const dom = document.createElement('div');
    dom.id = 'main-graph';
    document.body.appendChild(dom);
    const lf = new LogicFlow({
      container: dom,
    });
    expect(initShortcuts).toBeCalled();
    expect(on).toBeCalledTimes(5);
  });

  test('not silent mode', () => {
    const initShortcuts = jest.fn();
    Keyboard.prototype.initShortcuts = initShortcuts;
    const dom = document.createElement('div');
    dom.id = 'main-graph';
    document.body.appendChild(dom);
    const lf = new LogicFlow({
      container: dom,
      isSilentMode: false,
    });
    expect(initShortcuts).toBeCalledTimes(1);
  });
});

describe('logicflow/apis', () => {
  const rawData = {
    nodes: [
      {
        id: 'node1',
        type: 'circle',
        x: 100,
        y: 100,
        text: 'node1',
      },
      {
        id: 'node2',
        type: 'rect',
        x: 200,
        y: 200,
        text: 'node2',
      },
      {
        id: 'node3',
        type: 'ellipse',
        x: 300,
        y: 300,
        rx: 10,
        ry: 5,
        text: 'node3',
      },
      {
        id: 'node4',
        type: 'polygon',
        x: 400,
        y: 400,
        text: 'node4',
      },
    ],
    edges: [
      {
        id: 'edge1',
        type: 'line',
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
      },
      {
        id: 'edge2',
        type: 'polyline',
        sourceNodeId: 'node2',
        targetNodeId: 'node3',
      },
      {
        id: 'edge3',
        type: 'bezier',
        sourceNodeId: 'node2',
        targetNodeId: 'node4',
      },
    ],
  };

  describe('operations on node/edge model ', () => {
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
      grid: {
        size: 10,
        type: 'dot',
      },
      snapline: true,
      guards: {
        beforeClone: (data: any) => !['node1'].includes(data.id),
        beforeDelete: (data: any) => !['node1', 'edge1'].includes(data.id),
      },
    });

    test('render', () => {
      lf.render(rawData);
      expect(lf.graphModel.nodes.length).toBe(4);
      expect(lf.graphModel.edges.length).toBe(3);
    });

    test('set default edge type', () => {
      lf.setDefaultEdgeType('line');
      expect(lf.graphModel.edgeType).toBe('line');
    });

    test('delete elements with guards', () => {
      lf.render(rawData);
      expect(lf.deleteElement('node1')).toBeFalsy();
      expect(lf.deleteElement('node2')).toBeTruthy();
      expect(lf.deleteElement('node5')).toBeFalsy();

      expect(lf.graphModel.nodes.length).toBe(3);
    });

    test('add elements', () => {
      lf.render(rawData);
      lf.addElements({
        nodes: [
          {
            id: 'node_1_1',
            type: 'rect',
            x: 100,
            y: 100,
          },
          {
            id: 'node_2_1',
            type: 'rect',
            x: 200,
            y: 300,
          },
        ],
        edges: [
          {
            id: 'edge_3_1',
            type: 'polyline',
            sourceNodeId: 'node_1_1',
            targetNodeId: 'node_2_1',
          },
        ],
      });
      expect(lf.graphModel.nodes.length).toBe(6);
      expect(lf.graphModel.edges.length).toBe(4);
    });

    test('add node', () => {
      lf.render(rawData);
      lf.addNode({
        id: 'node5',
        type: 'text',
        x: 100,
        y: 100,
        text: 'node5',
      });
      expect(lf.graphModel.nodes.length).toBe(5);
      lf.updateText('node5', 'node5_1');
      lf.updateText('edge1', 'edge1');
      expect(lf.getNodeModelById('node5').text.value).toBe('node5_1');
      expect(lf.getEdgeModelById('edge1').text.value).toBe('edge1');
    });

    test('change node id', () => {
      lf.render(rawData);
      expect(lf.changeNodeId('node1', 'node1_1')).toBe('node1_1');
      expect(lf.changeNodeId('node1_1', 'node2')).toBeFalsy();
      expect(lf.changeNodeId('node1_1_1', 'node1_1_2')).toBeFalsy();
    });

    test('clone node with guards', () => {
      lf.render(rawData);
      expect(lf.cloneNode('node1')).toBeFalsy();
      expect(lf.cloneNode('node2')).toBeTruthy();
      expect(lf.graphModel.nodes.length).toBe(5);
    });

    test('get data by id', () => {
      lf.render(rawData);
      expect(lf.getDataById('node1')).toBeDefined();
      expect(lf.getDataById('edge1')).toBeDefined();
    });

    test('get node data by id', () => {
      lf.render(rawData);
      expect(lf.getNodeDataById('node1')).toBeDefined();
      expect(lf.getNodeDataById('node6')).toBeUndefined();
    });

    test('get edge data by id', () => {
      lf.render(rawData);
      expect(lf.getEdgeDataById('edge1')).toBeDefined();
      expect(lf.getEdgeDataById('edge4')).toBeUndefined();
    });

    test('add edge', () => {
      lf.render(rawData);
      lf.addEdge({
        id: 'edge4',
        type: 'polyline',
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
      });
      expect(lf.graphModel.edges.length).toBe(4);
    });

    test('delete edge with guards', () => {
      lf.render(rawData);
      expect(lf.deleteEdge('edge1')).toBeFalsy();
      expect(lf.deleteEdge('edge2')).toBeTruthy();
      expect(lf.graphModel.edges.length).toBe(2);
    });

    test('delete edge by nodeId', () => {
      lf.render({
        nodes: [
          {
            id: 'node1',
            type: 'rect',
            x: 100,
            y: 100,
            text: 'node1',
          },
          {
            id: 'node2',
            type: 'rect',
            x: 200,
            y: 200,
            text: 'node2',
          },
          {
            id: 'node3',
            type: 'rect',
            x: 300,
            y: 300,
            text: 'node3',
          },
          {
            id: 'node4',
            type: 'diamond',
            x: 400,
            y: 400,
            text: 'node4',
          },
          {
            id: 'node5',
            type: 'diamond',
            x: 500,
            y: 500,
            text: 'node5',
          },
        ],
        edges: [
          {
            id: 'edge1',
            type: 'polyline',
            sourceNodeId: 'node1',
            targetNodeId: 'node2',
          },
          {
            id: 'edge2',
            type: 'polyline',
            sourceNodeId: 'node2',
            targetNodeId: 'node3',
          },
          {
            id: 'edge3',
            type: 'polyline',
            sourceNodeId: 'node2',
            targetNodeId: 'node4',
          },
          {
            id: 'edge4',
            type: 'polyline',
            sourceNodeId: 'node2',
            targetNodeId: 'node5',
          },
        ],
      });

      lf.deleteEdgeByNodeId({
        targetNodeId: 'node3',
      });
      expect(lf.graphModel.edges.length).toBe(3);
      lf.deleteEdgeByNodeId({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
      });
      expect(lf.graphModel.edges.length).toBe(2);
      lf.deleteEdgeByNodeId({
        sourceNodeId: 'node2',
      });
      expect(lf.graphModel.edges.length).toBe(0);
    });

    test('change node type', () => {
      lf.render(rawData);
      lf.changeNodeType('node1', 'circle');
      expect(lf.getNodeModelById('node1').type).toBe('circle');
    });

    test('change edge type', () => {
      lf.render(rawData);
      lf.changeEdgeType('edge1', 'line');
      expect(lf.getEdgeModelById('edge1').type).toBe('line');
    });

    test('get incoming and outgoing edges of node', () => {
      lf.render(rawData);
      expect(lf.getNodeEdges('node2').length).toBe(3);
    });

    test('get incoming edges', () => {
      lf.render(rawData);
      expect(lf.getNodeIncomingEdge('node2').length).toBe(1);
    });

    test('get outgoing edges', () => {
      lf.renderRawData(rawData);
      expect(lf.getNodeOutgoingEdge('node2').length).toBe(2);
    });

    test('get incoming node', () => {
      lf.renderRawData(rawData);
      expect(lf.getNodeIncomingNode('node2').length).toBe(1);
    });

    test('get outgoing node', () => {
      lf.renderRawData(rawData);
      expect(lf.getNodeOutgoingNode('node2').length).toBe(2);
    });

    test('get edge model by filter', () => {
      lf.render(rawData);
      expect(
        lf.getEdgeModels({
          sourceNodeId: 'node2',
        }).length,
      ).toBe(2);

      expect(
        lf.getEdgeModels({
          targetNodeId: 'node2',
        }).length,
      ).toBe(1);

      expect(
        lf.getEdgeModels({
          sourceNodeId: 'node2',
          targetNodeId: 'node3',
        }).length,
      ).toBe(1);
    });

    test('get elements in certain area', () => {
      lf.render(rawData);
      expect(lf.getAreaElement([0, 0], [1000, 1000]).length).toBe(7);
    });

    test('set properties', () => {
      lf.renderRawData(rawData);
      lf.setProperties('node1', {
        a: {
          b: undefined,
          c: [],
          d: {
            e: 1,
            f: null,
          },
        },
      });
      expect((lf.getProperties('node1') as any).a).toEqual({
        b: undefined,
        c: [],
        d: {
          e: 1,
          f: null,
        },
      });
    });

    test('delete properties', () => {
      lf.renderRawData(rawData);
      lf.deleteProperty('node1', 'a');
      expect(lf.getNodeModelById('node1').properties.a).toBeUndefined();
    });

    test('select and to front in overlapMode 0', () => {
      lf.render(rawData);
      lf.selectElementById('node1');
      lf.selectElementById('node2', true);
      const selectElements = lf.getSelectElements();
      expect(selectElements.nodes.length).toBe(2);
      expect(selectElements.nodes[0].id).toBe('node1');
      expect(lf.getNodeModelById('node1').zIndex).toBe(9999);
      lf.clearSelectElements();
      expect(lf.getNodeModelById('node1').zIndex).toBe(1);
    });

    test('to front in overlapMode 0', () => {
      lf.render(rawData);
      lf.toFront('node1');
      expect(lf.getNodeModelById('node1').zIndex).toBe(9999);
    });

    test('get graph data', () => {
      lf.render(rawData);
      const graphData = lf.getGraphData();
      expect(lf.getGraphData()).toBeDefined();
      expect(graphData.nodes.length).toBe(4);
      expect(graphData.edges.length).toBe(3);
    });

    test('clear graph data', () => {
      lf.render(rawData);
      lf.clearData();
      expect(lf.getGraphData()).toEqual({
        nodes: [],
        edges: [],
      });
    });
  });

  describe('transform', () => {
    const resize = jest.fn();
    const dom = document.createElement('div');
    dom.id = 'main-graph';
    document.body.appendChild(dom);
    const lf = new LogicFlow({
      container: dom,
      stopScrollGraph: true,
      stopZoomGraph: true,
      metaKeyMultipleSelected: true,
      width: 1000,
      height: 1000,
      overlapMode: 1,
    });
    lf.graphModel.resize = resize;

    test('get transform information', () => {
      expect(lf.getTransform()).toEqual({
        SCALE_X: 1,
        SCALE_Y: 1,
        TRANSLATE_X: 0,
        TRANSLATE_Y: 0,
      });
    });

    test('resize', () => {
      lf.resize(100, 100);
      expect(resize).toBeCalled();
      setTimeout(() => {
        expect(lf.graphModel.width).toBe(100);
        expect(lf.graphModel.height).toBe(100);
      });
    });

    test('zoom', () => {
      lf.zoom(0.5);
      expect(lf.graphModel.transformModel.SCALE_X).toBe(0.5);
      expect(lf.graphModel.transformModel.SCALE_Y).toBe(0.5);
      lf.resetZoom();
      expect(lf.graphModel.transformModel.SCALE_X).toBe(1);
      expect(lf.graphModel.transformModel.SCALE_Y).toBe(1);
    });

    test('translate', () => {
      lf.translate(100, 100);
      expect(lf.graphModel.transformModel.TRANSLATE_X).toBe(100);
      expect(lf.graphModel.transformModel.TRANSLATE_Y).toBe(100);
      lf.resetTranslate();
      expect(lf.graphModel.transformModel.TRANSLATE_X).toBe(0);
      expect(lf.graphModel.transformModel.TRANSLATE_Y).toBe(0);
    });

    test('select and to front in overlapMode 1', () => {
      lf.render(rawData);
      lf.selectElementById('node1');
      expect(lf.getNodeModelById('node1').zIndex).toBe(1008);
      lf.clearSelectElements();
      expect(lf.getNodeModelById('node1').zIndex).toBe(1008);
    });

    test('to front in overlapMode 1', () => {
      lf.render(rawData);
      lf.toFront('node1');
      expect(lf.getNodeModelById('node1').zIndex).toBe(1016);
    });
  });
});
