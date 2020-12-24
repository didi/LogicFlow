import { assign } from 'lodash-es';
import { DndOptions } from './view/behavior/DnD';
import { GridOptions } from './view/overlay/Grid';
import { BackgroundConfig } from './view/overlay/BackgroundOverlay';
import { ToolConfig } from './tool';
import { MenuConfig, Style } from './type';
import { KeyboardDef } from './keyboard';

// edgeMenuConfig: any;
export type Definition = {
  container: HTMLElement

  width?: number

  height?: number

  background?: false | BackgroundConfig

  grid?: boolean | GridOptions

  tool?: ToolConfig

  textEdit?: boolean

  keyboard?: KeyboardDef

  edgeMenuConfig?: false | MenuConfig[]

  nodeMenuConfig?: false | MenuConfig[]

  graphMenuConfig?: false | MenuConfig[]

  style?: Style

  dndOptions?: DndOptions

  isSilentMode?: boolean

  edgeType?: string,

  snapline?: boolean;

  history?: boolean; // 是否开启redo/undo

  partial?: boolean; // 是否开启局部渲染

  stopScrollGraph?: boolean;

  stopZoomGraph?: boolean;
};

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
  return options;
}

// 默认 options
export const defaults = {
  background: false,
  grid: false,
  textEdit: true,
};
