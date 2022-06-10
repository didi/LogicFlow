import { assign, pick } from 'lodash-es';
import { observable, action, makeObservable } from '../util/stateUtil';

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
  /**
   * 拖动节点靠近画布边缘时，
   * 是否自动扩张画布.
   * 默认false。
   */
  autoExpand?: string;
}

const SilentConfig = {
  stopZoomGraph: false,
  stopScrollGraph: false,
  stopMoveGraph: false,
  adjustEdge: false,
  adjustEdgeStartAndEnd: false,
  adjustNodePosition: false,
  hideAnchors: true,
  nodeSelectedOutline: true,
  nodeTextEdit: false,
  edgeTextEdit: false,
  nodeTextDraggable: false,
  edgeTextDraggable: false,
  autoExpand: false,
};

const keys = [
  'isSilentMode',
  'stopZoomGraph',
  'stopScrollGraph',
  'stopMoveGraph',
  'adjustEdge',
  'adjustEdgeMiddle',
  'adjustEdgeStartAndEnd',
  'adjustNodePosition',
  'hideAnchors',
  'hoverOutline',
  'nodeSelectedOutline',
  'edgeSelectedOutline',
  'nodeTextEdit',
  'edgeTextEdit',
  'nodeTextDraggable',
  'edgeTextDraggable',
  'multipleSelectKey',
  'autoExpand',
];
/**
 * 页面编辑配置
 */
export default class EditConfigModel {
  isSilentMode = false;
  stopZoomGraph = false;
  stopScrollGraph = false;
  stopMoveGraph = false;
  adjustEdge = true;
  adjustEdgeMiddle = false;
  adjustEdgeStartAndEnd = false;
  adjustNodePosition = true;
  hideAnchors = false;
  hoverOutline = true;
  nodeSelectedOutline = true;
  edgeSelectedOutline = true;
  nodeTextEdit = true;
  edgeTextEdit = true;
  nodeTextDraggable = false;
  edgeTextDraggable = false;
  autoExpand = false;
  multipleSelectKey = '';
  defaultConfig = {}; // 设置为静默模式之前的配置，在取消静默模式后恢复
  constructor(config: EditConfigInterface) {
    makeObservable(this, {
      isSilentMode: observable,
      stopZoomGraph: observable,
      stopScrollGraph: observable,
      stopMoveGraph: observable,
      adjustEdge: observable,
      adjustEdgeMiddle: observable,
      adjustEdgeStartAndEnd: observable,
      adjustNodePosition: observable,
      hideAnchors: observable,
      hoverOutline: observable,
      nodeSelectedOutline: observable,
      edgeSelectedOutline: observable,
      nodeTextEdit: observable,
      edgeTextEdit: observable,
      nodeTextDraggable: observable,
      edgeTextDraggable: observable,
      autoExpand: observable,
      updateEditConfig: action,
    });

    assign(this, this.getConfigDetail(config));
  }
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
      const silentConfig = pick(SilentConfig, keys);
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
        autoExpand: this.autoExpand,
      };
      assign(conf, silentConfig);
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
