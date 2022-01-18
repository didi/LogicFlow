import { assign } from 'lodash-es';
import { GridOptions } from './view/overlay/Grid';
import { BackgroundConfig } from './view/overlay/BackgroundOverlay';
import {
  NodeData,
  EdgeData,
  Extension,
  GraphConfigData,
} from './type';
import { KeyboardDef } from './keyboard';
import { EditConfigInterface } from './model/EditConfigModel';
import { Theme } from './constant/DefaultTheme';

export type EdgeType = 'line' | 'polyline' | 'bezier' | any;

type DefaultOverlapMode = 0;
type IncreaseOverlapMode = 1;
/**
 * 元素重叠处理方式
 * 0：表示节点在上，边在下，点击元素时选择元素显示在最顶部。
 * 1：表示安装元素创建顺序排序，点击元素也不会将其置顶。要置顶需要调用置顶API。
 */
export type OverlapMode = DefaultOverlapMode | IncreaseOverlapMode;

export type Definition = {
  /**
   * 画布初始化容器
   * 注意，在不传入width和height的情况下，container元素本身应该存在高度和高度。
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
  /**
   * 键盘快捷操作
   */
  keyboard?: KeyboardDef;
  /**
   * 主题配置
   */
  style?: Theme;
  /**
   * 禁止初始化的插件名称
   */
  disabledPlugins?: string[];
  /**
   * 默认边类型
   */
  edgeType?: EdgeType;
  /**
   * 是否开启对齐线，默认开启
   */
  snapline?: boolean;
  /**
   * 是否开启历史记录功能，默认开启
   */
  history?: boolean;
  /**
   * 是否开启局部渲染，默认不开启
   */
  partial?: boolean;
  /**
   * 删除和克隆之前的判断函数
   * todo: 目前不完善，仅支持同步
   */
  guards?: GuardsTypes;
  /**
   * 表示节点在上，边在下，点击元素时选择元素显示在最顶部。
   * 表示安装元素创建顺序排序，点击元素也不会将其置顶。要置顶需要调用置顶API。
   */
  overlapMode?: OverlapMode;
  /**
   * 自定义创建节点、连线时生成id规则。
   * @param type 节点、连线类型
   */
  idGenerator?: (type?: string) => string;
  /**
   * 禁止启用的内置工具
   * 有些场景下，需要自定义多选效果或者文本编辑效果，则需要禁用这些内置的工具
   * multipleSelect和textEdit
   * todo: 将multipleSelect放到插件中
   */
  disabledTools?: string[];
  /**
   * 是否配置个性插件，覆盖全局配置的插件
   */
  plugins?: Extension[];
  [key: string]: any;
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
  if (!options.width) {
    options.width = container.getBoundingClientRect().width;
  }
  if (!options.height) {
    options.height = container.getBoundingClientRect().height;
  }
  return assign({}, defaults, options);
}

// 默认 options
export const defaults = {
  background: false,
  grid: false,
  textEdit: true,
  disabledTools: [],
};
