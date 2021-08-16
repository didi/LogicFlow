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
  @observable nodeTextEdit = true; // 允许节点文本可以编辑
  @observable edgeTextEdit = true; // 允许连线文本可以编辑
  @observable nodeTextDraggable = false; // 允许节点文本可以拖拽
  @observable edgeTextDraggable = false; // 允许连线文本可以拖拽
  @observable metaKeyMultipleSelected = false; // 允许meta多选元素
  extraConf = {}; // 外部传入的额外配置, 待优化，这里不够易用。
  constructor(config) {
    assign(this, this.getConfigDetail(config));
  }
  @action
  updateEditConfig(config) {
    assign(this, this.getConfigDetail(config));
  }
  getConfigDetail(config) {
    const { isSilentMode, textEdit } = config;
    const userConfig = pick(config, keys);
    if (isSilentMode) {
      const slientConfig = pick(SilentConfig, keys);
      assign(userConfig, slientConfig);
    }
    if (!textEdit) {
      assign(userConfig, {
        nodeTextEdit: false,
        edgeTextEdit: false,
      });
    }
    return userConfig;
  }
  getConfig() {
    return pick(this, keys);
  }
}

export { EditConfigModel };
