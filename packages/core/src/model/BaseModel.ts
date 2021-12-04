// Node|Edge等model的基类
import { ElementState } from '../constant/constant';
import { TextConfig, AdditionData, Point } from '../type';

interface IBaseModel {
  id: string;
  modelType: string;
  type: string;
  state: ElementState;
  // 状态附加数据，例如显示菜单，菜单的位置信息
  additionStateData: AdditionData;
  text: TextConfig;
  isSelected: boolean;
  zIndex: number;
  /**
   * 创建节点ID
   * 默认情况下，logicflow内部使用uuidv4生成id。
   * 在自定义节点的时候，可以重写此方法基于自己的规则生成id。
   * 注意，此方法必须是同步的。
   * 如果想要异步修改Id，建议删除此节点后再同一位置创建一个新的节点。
   * @overridable 可以重写
   * @returns string
   */
  createId(): string;
  move(deltaX: number, deltaY: number): void;
  moveText(deltaX: number, deltaY: number): void;
  updateText(value: string): void;
  setSelected(flag: boolean): void;
  setZIndex(zindex?: number): void;
  /**
   * 设置Node|Edge等model的状态
   * @param state 状态
   */
  setElementState(state: ElementState, additionStateData?: AdditionData): void;

  getProperties(): Object;

  setProperties(properties: Object): void;

  updateAttributes(attributes: Object): void;

}

export {
  IBaseModel,
};
