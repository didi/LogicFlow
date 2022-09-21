// Node|Edge等model的基类
import { ElementState } from '../constant/constant';
import { TextConfig, AdditionData, Point } from '../type';

interface IBaseModel {
  /**
   * 节点或者边的id.
   * 默认情况下，使用uuidv4生成。
   * 如果想要自定义，可以重写createId生成。
   */
  id: string;
  /**
   * 不可自定义
   * model对应的图形外观类型（eg: 圆形、矩形、多边形等）
   * 用于logicflow内部计算使用。
   */
  modelType: string;
  /**
   * 请勿直接修改属性，如果想要将一个节点类型修改为另一个类型。请使用
   * `lf.graphModel.changeEdgeType`和`lf.graphModel.changeNodeType`
   *
   * 流程图元素类型，自定义元素时对应的标识。
   * 在logicflow/core中对应着rect、circle、polyline这种。
   * 在实际项目中，我们会基于业务类型进行自定义type.
   * 例如BPMN应用场景，我们会定义开始节点的类型为bpmn:start-event
   *
   * 和modelType的区别是，type更多的是业务上的类型，而modelType则是外观上的类型。
   * 例如bpmnjs的开始节点和结束节点type分别为'bpmn:start-event'和'bpmn:end-event'。
   * 但是他们的modelType都是circle-node, 因为他们外观都是基于圆形自定义而来。
   */
  type: string;
  /**
   * 元素状态
   * 不同的状态对应着元素显示效果。
   * 请勿直接修改。
   * logicflow内部将元素状态分为5种：
   * DEFAULT = 1 默认显示
   * TEXT_EDIT = 2 此元素正在进行文本编辑
   * SHOW_MENU = 3, 显示菜单，废弃请使用菜单插件
   * ALLOW_CONNECT = 4, 此元素允许作为当前边的目标节点
   * NOT_ALLOW_CONNECT = 5, 此元素不允许作为当前边的目标节点
   */
  state: ElementState;
  /*
   * 状态附加数据，例如显示菜单，菜单的位置信息
   * 请勿使用，即将废弃
   */
  additionStateData: AdditionData;
  /**
   * 元素上的文本
   * logicflow中存在两种文本
   * 一种是脱离边和节点单独存在的文本
   * 一种是必须和边、节点关联的文本。
   * 此属性控制的是第二种。
   * 节点和边删除、调整的时候，其关联的文本也会对应删除、调整。
   */
  text: TextConfig;
  /**
   * 元素是否被选中
   */
  isSelected: boolean;
  /**
   * 节点是否显示
   */
  visible: boolean;
  /**
   * 节点是否可以通过getGraphData获取
   */
  virtual: boolean;
  /**
   * 元素堆叠是层级，默认情况下节点zIndex值为1，边zIndex为0。
   * todo：写完善
   */
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
  moveText(deltaX: number, deltaY: number): void;
  updateText(value: string): void;
  setSelected(flag: boolean): void;
  setZIndex(zIndex?: number): void;
  /**
   * 设置Node|Edge等model的状态
   * @param state 状态
   */
  setElementState(state: ElementState, additionStateData?: AdditionData): void;

  getProperties(): Object;

  setProperties(properties: Object): void;

  updateAttributes(attributes: Object): void;

  getTextStyle(): Record<string, any>;
}

export {
  IBaseModel,
};
