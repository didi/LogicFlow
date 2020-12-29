// Node|Edge等model的基类
import { ElementState } from '../constant/constant';
import { TextConfig, AdditionData } from '../type';

interface IBaseModel {
  readonly id: string;
  modelType: string;
  type: string;
  state: ElementState;
  // 状态附加数据，例如显示菜单，菜单的位置信息
  additionStateData: AdditionData;
  text: TextConfig;
  isSelected: boolean;
  zIndex: number;
  move(deltaX: number, deltaY: number): void;
  moveText(deltaX: number, deltaY: number): void;
  updateText(value: string): void;
  setSelected(flag: boolean): void;
  /**
   * 设置Node|Edge等model的状态
   * @param state 状态
   */
  setElementState(state: ElementState, additionStateData?: AdditionData): void;
  // TODO: 补充model的通用函数
}

export {
  IBaseModel,
};
