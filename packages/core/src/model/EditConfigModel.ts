import { observable, action } from 'mobx';
import { assign, pick } from 'lodash-es';

export interface EditConfigInterface {
  stopZoomGraph?: boolean;
  stopScrollGraph?: boolean;
  stopMoveGraph?: boolean;
  adjustEdge?: boolean;
  adjustNodePosition?: boolean;
  hideAnchors?: boolean;
  nodeTextEdit?: boolean;
  edgeTextEdit?: boolean;
  nodeTextDraggable?: boolean;
  edgeTextDraggable?: boolean;
  extraConf?: Record<string, string | number | object | boolean>;
}

const SilentConfig = {
  stopZoomGraph: false,
  stopScrollGraph: false,
  stopMoveGraph: false,
  adjustEdge: false,
  adjustNodePosition: false,
  hideAnchors: true,
  nodeTextEdit: false,
  edgeTextEdit: false,
  nodeTextDraggable: false,
  edgeTextDraggable: false,
  metaKeyMultipleSelected: false,
};

const keys = [
  'stopZoomGraph',
  'stopScrollGraph',
  'stopMoveGraph',
  'adjustEdge',
  'adjustNodePosition',
  'hideAnchors',
  'hoverOutline',
  'nodeTextEdit',
  'edgeTextEdit',
  'nodeTextDraggable',
  'edgeTextDraggable',
  'metaKeyMultipleSelected',
  'extraConf',
];
/**
 * 页面编辑配置
 */
export default class EditConfigModel {
  @observable stopZoomGraph = false; // 禁止缩放画布
  @observable stopScrollGraph = false; // 禁止鼠标滚动移动画布
  @observable stopMoveGraph = false; // 禁止拖动画布
  @observable adjustEdge = true; // 允许调整连线
  @observable adjustNodePosition = true; // 允许拖动节点
  @observable hideAnchors = false; // 隐藏节点所有锚点
  @observable hoverOutline = false; // 显示节点悬浮时的外框
  @observable nodeSelectedOutline = true; // 节点被选中时是否显示outline
  @observable edgeSelectedOutline = true; // 连线被选中时是否显示outline
  @observable nodeTextEdit = true; // 允许节点文本可以编辑
  @observable edgeTextEdit = true; // 允许连线文本可以编辑
  @observable nodeTextDraggable = false; // 允许节点文本可以拖拽
  @observable edgeTextDraggable = false; // 允许连线文本可以拖拽
  @observable metaKeyMultipleSelected = false; // 允许meta多选元素
  extraConf = {}; // 外部传入的额外配置, 待优化，这里不够易用。
  defaultConfig = {}; // 设置为静默模式之前的配置，在取消静默模式后恢复
  constructor(config) {
    assign(this, this.getConfigDetail(config));
  }
  @action
  updateEditConfig(config) {
    const newConfig = this.getConfigDetail(config);
    assign(this, newConfig);
  }
  getConfigDetail(config) {
    const { isSilentMode, textEdit } = config;
    const conf = {};
    // false表示从静默模式恢复
    if (isSilentMode === false) {
      assign(conf, this.defaultConfig);
    }
    // 如果不传，默认undefined表示非静默模式
    if (isSilentMode === true) {
      const slientConfig = pick(SilentConfig, keys);
      // 在修改之前，
      this.defaultConfig = {
        stopZoomGraph: this.stopZoomGraph,
        stopScrollGraph: this.stopScrollGraph,
        stopMoveGraph: this.stopMoveGraph,
        adjustEdge: this.adjustEdge,
        adjustNodePosition: this.adjustNodePosition,
        hideAnchors: this.hideAnchors,
        hoverOutline: this.hoverOutline,
        nodeSelectedOutline: this.nodeSelectedOutline,
        edgeSelectedOutline: this.edgeSelectedOutline,
        nodeTextEdit: this.nodeTextEdit,
        edgeTextEdit: this.edgeTextEdit,
        nodeTextDraggable: this.nodeTextDraggable,
        edgeTextDraggable: this.edgeTextDraggable,
        metaKeyMultipleSelected: this.metaKeyMultipleSelected,
      };
      assign(conf, slientConfig);
    }
    // 如果不传，默认undefined表示允许文本编辑
    if (textEdit === false) {
      assign(conf, {
        nodeTextEdit: false,
        edgeTextEdit: false,
      });
    }
    const userConfig = pick(config, keys);
    return assign(conf, userConfig);
  }
  getConfig() {
    return pick(this, keys);
  }
}

export { EditConfigModel };
