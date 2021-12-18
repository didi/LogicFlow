import { observable, action } from 'mobx';
import { assign, pick } from 'lodash-es';

export interface EditConfigInterface {
  /**
   * 是否为静默模式
   */
  isSilentMode?: boolean;
  /**
   * 禁止缩放画布
   */
  stopZoomGraph?: boolean;
  /**
   * 禁止鼠标滚动移动画布
   */
  stopScrollGraph?: boolean;
  /**
   * 禁止拖动画布
   */
  stopMoveGraph?: boolean;
  /**
   * 允许调整边
   */
  adjustEdge?: boolean;
  /**
   * 允许调整边起点和终点
   */
  adjustEdgeStartAndEnd?: boolean;
  /**
   * 允许拖动节点
   */
  adjustNodePosition?: boolean;
  /**
   * 隐藏节点所有锚点
   */
  hideAnchors?: boolean;
  /**
   * 显示节点悬浮时的外框
   */
  hoverOutline?: boolean;
  /**
   * 节点被选中时是否显示outline
   */
  nodeSelectedOutline?: boolean;
  /**
   * 边被选中时是否显示outline
   */
  edgeSelectedOutline?: boolean;
  /**
   * 允许节点文本可以编辑
   */
  nodeTextEdit?: boolean;
  /**
   * 允许边文本可以编辑
   */
  edgeTextEdit?: boolean;
  /**
   * 允许文本编辑
   */
  textEdit?: boolean;
  /**
   * 允许节点文本可以拖拽
   */
  nodeTextDraggable?: boolean;
  /**
   * 允许边文本可以拖拽
   */
  edgeTextDraggable?: boolean;
  /**
   * 多选按键, 支持meta(cmd)、shift、alt
   * 不支持ctrl，ctrl会触发contextmenu
   */
  multipleSelectKey?: string;
}

const SilentConfig = {
  stopZoomGraph: false,
  stopScrollGraph: false,
  stopMoveGraph: false,
  adjustEdge: false,
  adjustEdgeStartAndEnd: false,
  adjustNodePosition: false,
  hideAnchors: true,
  nodeTextEdit: false,
  edgeTextEdit: false,
  nodeTextDraggable: false,
  edgeTextDraggable: false,
};

const keys = [
  'stopZoomGraph',
  'stopScrollGraph',
  'stopMoveGraph',
  'adjustEdge',
  'adjustEdgeMiddle',
  'adjustEdgeStartAndEnd',
  'adjustNodePosition',
  'hideAnchors',
  'hoverOutline',
  'nodeTextEdit',
  'edgeTextEdit',
  'nodeTextDraggable',
  'edgeTextDraggable',
  'multipleSelectKey',
];
/**
 * 页面编辑配置
 */
export default class EditConfigModel {
  @observable stopZoomGraph = false;
  @observable stopScrollGraph = false;
  @observable stopMoveGraph = false;
  @observable adjustEdge = true;
  @observable adjustEdgeMiddle = false;
  @observable adjustEdgeStartAndEnd = false;
  @observable adjustNodePosition = true;
  @observable hideAnchors = false;
  @observable hoverOutline = true;
  @observable nodeSelectedOutline = true;
  @observable edgeSelectedOutline = true;
  @observable nodeTextEdit = true;
  @observable edgeTextEdit = true;
  @observable nodeTextDraggable = false;
  @observable edgeTextDraggable = false;
  multipleSelectKey = '';
  defaultConfig = {}; // 设置为静默模式之前的配置，在取消静默模式后恢复
  constructor(config: EditConfigInterface) {
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
        adjustEdgeMiddle: this.adjustEdgeMiddle,
        adjustEdgeStartAndEnd: this.adjustEdgeStartAndEnd,
        adjustNodePosition: this.adjustNodePosition,
        hideAnchors: this.hideAnchors,
        hoverOutline: this.hoverOutline,
        nodeSelectedOutline: this.nodeSelectedOutline,
        edgeSelectedOutline: this.edgeSelectedOutline,
        nodeTextEdit: this.nodeTextEdit,
        edgeTextEdit: this.edgeTextEdit,
        nodeTextDraggable: this.nodeTextDraggable,
        edgeTextDraggable: this.edgeTextDraggable,
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
