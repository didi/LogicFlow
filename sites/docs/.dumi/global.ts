/**
 * 挂载到全局
 */
if (window) {
  (window as any).react = require('react');
  (window as any).reactDom = require('react-dom');
  (window as any).createRoot = require('react-dom/client').createRoot;
  (window as any).antd = require('antd');
  (window as any).insertCSS = require('insert-css');
  (window as any).LogicFlow = require('@logicflow/core').default;
  (window as any).Extension = require('@logicflow/extension');
  (window as any).BaseNode = require('@logicflow/core').BaseNode;
  (window as any).BaseNodeModel = require('@logicflow/core').BaseNodeModel;
  (window as any).CircleNodeModel = require('@logicflow/core').CircleNodeModel;
  (window as any).CircleNode = require('@logicflow/core').CircleNode;
  (window as any).h = require('@logicflow/core').h;
  (window as any).RectNode = require('@logicflow/core').RectNode;
  (window as any).RectNodeModel = require('@logicflow/core').RectNodeModel;
  (window as any).PolygonNode = require('@logicflow/core').PolygonNode;
  (window as any).PolygonNodeModel =
    require('@logicflow/core').PolygonNodeModel;
  (window as any).HtmlNode = require('@logicflow/core').HtmlNode;
  (window as any).EllipseNode = require('@logicflow/core').EllipseNode;
  (window as any).EllipseNodeModel =
    require('@logicflow/core').EllipseNodeModel;
  (window as any).HtmlNodeModel = require('@logicflow/core').HtmlNodeModel;
  (window as any).PolylineEdge = require('@logicflow/core').PolylineEdge;
  (window as any).PolylineEdgeModel =
    require('@logicflow/core').PolylineEdgeModel;
  (window as any).BezierEdgeModel = require('@logicflow/core').BezierEdgeModel;
  (window as any).BezierEdge = require('@logicflow/core').BezierEdge;
  (window as any).GraphModel = require('@logicflow/core').GraphModel;
  (window as any).DownOutlined = require('@ant-design/icons').DownOutlined;
  (window as any).CurvedEdge = require('@logicflow/extension').CurvedEdge;
  (window as any).CurvedEdgeModel =
    require('@logicflow/extension').CurvedEdgeModel;
  (window as any).register = require('@logicflow/react-node-registry').register;
  (window as any).Portal = require('@logicflow/react-node-registry').Portal;
}
