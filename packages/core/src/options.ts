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
import { EditConfigInterface } from './model/EditConfigModel';

export type EdgeType = 'line' | 'polyline' | 'bezier' | any;

export type Definition = {
  /**
   * 画布初始化容器
   */
  container: HTMLElement;
  /**
   * 画布宽度，不传则默认100%
   */
  width?: number;
  /**
   * 画布高度，不传则默认100%
   */
  height?: number;
  /**
   * 背景图
   */
  background?: false | BackgroundConfig;
  /**
   * 网格
   */
  grid?: boolean | GridOptions;

  keyboard?: KeyboardDef;

  style?: Style;

  dndOptions?: DndOptions;

  disabledPlugins?: string[]; // 禁用的插件

  edgeType?: EdgeType;

  snapline?: boolean;

  history?: boolean; // 是否开启redo/undo

  partial?: boolean; // 是否开启局部渲染

  guards?: GuardsTypes;

  idGenerator?: () => number | string; // 元素id生成器
} & EditConfigInterface;

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
