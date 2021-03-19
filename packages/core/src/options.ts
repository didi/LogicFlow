import { assign } from 'lodash-es';
import { DndOptions } from './view/behavior/DnD';
import { GridOptions } from './view/overlay/Grid';
import { BackgroundConfig } from './view/overlay/BackgroundOverlay';
import {
  Style,
  NodeData,
  EdgeData,
  GraphConfigData,
} from './type';
import { KeyboardDef } from './keyboard';

export type EdgeType = 'line' | 'polyline' | 'bezier';

export type Definition = {
  container: HTMLElement;

  width?: number;

  height?: number;

  background?: false | BackgroundConfig;

  grid?: boolean | GridOptions;

  textEdit?: boolean;

  keyboard?: KeyboardDef;

  style?: Style;

  dndOptions?: DndOptions;

  isSilentMode?: boolean; // 静默模式

  disabledPlugins?: string[]; // 禁用的插件

  edgeType?: EdgeType;

  snapline?: boolean;

  history?: boolean; // 是否开启redo/undo

  partial?: boolean; // 是否开启局部渲染

  stopScrollGraph?: boolean;

  stopZoomGraph?: boolean;

  stopMoveGraph?: boolean;

  guards?: GuardsTypes;

  hideAnchors?: boolean; // 是否隐藏anchor

  hoverOutline?: boolean; // 是否显示节点hover时的outline
};

export interface GuardsTypes {
  beforeClone?: (data: NodeData | GraphConfigData) => boolean;
  beforeDelete?: (data: NodeData | EdgeData) => boolean;
}

// 用来获取用户传入的 options，并做一些容错和异常抛出
export function get(options: Definition) {
  const { container, grid } = options;
  if (!container) {
    throw new Error('请检查 container 参数是否有效');
  }
  if (grid) {
    options.grid = assign({
      size: 20,
      type: 'dot',
      visible: true,
      config: {
        color: '#ababab',
        thickness: 1,
      },
    }, grid);
  }
  return assign({}, defaults, options);
}

// 默认 options
export const defaults = {
  background: false,
  grid: false,
  textEdit: true,
};
