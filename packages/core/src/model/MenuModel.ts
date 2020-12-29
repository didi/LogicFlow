export default class MenuModel {
  nodeMenu;
  edgeMenu;
  graphMenu;
  constructor(config, graphModel) {
    this.setNodeMenu(config.nodeMenuConfig, graphModel);
    this.setEdgeMenu(config.edgeMenuConfig, graphModel);
    this.setGraphMenu(config.graphMenuConfig);
  }
  setNodeMenu(nodeMenuConfig, graphModel) {
    if (nodeMenuConfig === false) { // 禁用
      this.nodeMenu = [];
    } else if (nodeMenuConfig) { // 自定义
      this.nodeMenu = nodeMenuConfig;
    } else { // 默认, config.nodeMenuConfig === undefined
      this.nodeMenu = [
        {
          text: '删除',
          className: 'lf-menu-item',
          callback(node) {
            graphModel.deleteNode(node.id);
          },
        },
        {
          text: '编辑文本',
          className: 'lf-menu-item',
          callback(node) {
            graphModel.setTextEditable(node.id);
          },
        },
        {
          text: '复制',
          className: 'lf-menu-item',
          callback(node) {
            graphModel.cloneNode(node.id);
          },
        },
      ];
    }
  }
  setEdgeMenu(edgeMenuConfig, graphModel) {
    if (edgeMenuConfig === false) { // 禁用
      this.edgeMenu = [];
    } else if (edgeMenuConfig) { // 自定义
      this.edgeMenu = edgeMenuConfig;
    } else { // 默认, config.nodeMenuConfig === undefined
      this.edgeMenu = [
        {
          text: '删除连线',
          className: 'lf-menu-item',
          callback(edge) {
            graphModel.removeEdgeById(edge.id);
          },
        },
        {
          text: '编辑文本',
          className: 'lf-menu-item',
          callback(edge) {
            graphModel.setTextEditable(edge.id);
          },
        },
      ];
    }
  }
  setGraphMenu(graphMenuConfig) {
    if (graphMenuConfig === false) { // 禁用
      this.graphMenu = [];
    } else if (graphMenuConfig) { // 自定义
      this.graphMenu = graphMenuConfig;
    } else { // 默认, 也是禁用
      this.graphMenu = [];
    }
  }
}

export { MenuModel };
