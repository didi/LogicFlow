/**
 * 挂载到全局
 */
const asyncImport = async () => {
  const LogicFlow = await import('@logicflow/core');
  const Extension = await import('@logicflow/extension');
  const ReactNodeRegistry = await import('@logicflow/react-node-registry');

  (window as any).react = await import('react');
  (window as any).reactDom = await import('react-dom');
  (window as any).createRoot = await import('react-dom/client').then(
    (m) => m.createRoot,
  );

  (window as any).insertCSS = await import('insert-css');
  (window as any).antd = await import('antd');
  (window as any).DownOutlined = await import('@ant-design/icons').then(
    (m) => m.DownOutlined,
  );

  (window as any).LogicFlow = LogicFlow.default;
  (window as any).Extension = Extension;

  (window as any).BaseNode = LogicFlow.BaseNode;
  (window as any).BaseNodeModel = LogicFlow.BaseNodeModel;
  (window as any).CircleNodeModel = LogicFlow.CircleNodeModel;
  (window as any).CircleNode = LogicFlow.CircleNode;
  (window as any).h = LogicFlow.h;
  (window as any).RectNode = LogicFlow.RectNode;
  (window as any).RectNodeModel = LogicFlow.RectNodeModel;
  (window as any).PolygonNode = LogicFlow.PolygonNode;
  (window as any).PolygonNodeModel = LogicFlow.PolygonNodeModel;
  (window as any).HtmlNode = LogicFlow.HtmlNode;
  (window as any).EllipseNode = LogicFlow.EllipseNode;
  (window as any).EllipseNodeModel = LogicFlow.EllipseNodeModel;
  (window as any).HtmlNodeModel = LogicFlow.HtmlNodeModel;
  (window as any).PolylineEdge = LogicFlow.PolylineEdge;
  (window as any).PolylineEdgeModel = LogicFlow.PolylineEdgeModel;
  (window as any).BezierEdgeModel = LogicFlow.BezierEdgeModel;
  (window as any).BezierEdge = LogicFlow.BezierEdge;
  (window as any).GraphModel = LogicFlow.GraphModel;

  (window as any).CurvedEdge = Extension.CurvedEdge;
  (window as any).CurvedEdgeModel = Extension.CurvedEdgeModel;
  (window as any).register = ReactNodeRegistry.register;
  (window as any).Portal = ReactNodeRegistry.Portal;
};

if (typeof window !== 'undefined') {
  asyncImport();
}
