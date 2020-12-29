import { observable } from 'mobx';
import { assign, pick } from 'lodash-es';

export interface EditConfigInterface {
  stopZoomGraph: boolean;
  stopScrollGraph: boolean;
  stopMoveGraph: boolean;
  adjustEdge: boolean;
  adjustNodePosition: boolean;
  hideAnchors: boolean;
  nodeTextEdit: boolean;
  edgeTextEdit: boolean;
  nodeTextDraggable: boolean,
  edgeTextDraggable: boolean,
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
};

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
  @observable nodeTextEdit = true; // 允许节点文本可以编辑
  @observable edgeTextEdit = true; // 允许连线文本可以编辑
  @observable nodeTextDraggable = false; // 允许节点文本可以拖拽
  @observable edgeTextDraggable = false; // 允许连线文本可以拖拽
  constructor(data) {
    const keys = [
      'stopZoomGraph',
      'stopScrollGraph',
      'stopMoveGraph',
      'adjustEdge',
      'adjustNodePosition',
      'hideAnchors',
      'nodeTextEdit',
      'edgeTextEdit',
      'nodeTextDraggable',
      'edgeTextDraggable',
    ];
    const { isSilentMode, textEdit } = data;
    if (isSilentMode) {
      assign(this, pick(SilentConfig, keys), pick(data, ['stopZoomGraph', 'stopScrollGraph', 'stopMoveGraph', 'hideAnchors']));
    } else if (!textEdit) {
      // 通过 textEdit API 禁用文本编辑
      assign(this, pick(data, keys), {
        nodeTextEdit: false,
        edgeTextEdit: false,
      });
    } else {
      assign(this, pick(data, keys));
    }
  }
}

export { EditConfigModel };
