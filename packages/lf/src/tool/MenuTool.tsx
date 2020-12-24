/**
 * 菜单工具
 * 目前扩展性不强，需要考虑重新设计。
 */
import { h, Component } from 'preact';
import { observer } from 'mobx-react';
import LogicFlow from '../LogicFlow';
import GraphModel from '../model/GraphModel';
import { ModelType, ElementState } from '../constant/constant';
import BaseNodeModel from '../model/node/BaseNodeModel';

type IProps = {
  graphModel: GraphModel;
  logicFlow: LogicFlow;
};

@observer
export default class Menu extends Component<IProps> {
  getElementMenu() {
    const {
      graphModel: {
        menuConfig,
        showMenuElement,
      },
    } = this.props;
    let defaultMenu;
    switch (showMenuElement.modelType) {
      case ModelType.NODE: // todo: 增加elementType,目前看起来ModelType没啥用?
      case ModelType.CIRCLE_NODE:
      case ModelType.POLYGON_NODE:
      case ModelType.RECT_NODE:
      case ModelType.TEXT_NODE:
        defaultMenu = menuConfig.nodeMenu;
        if ((showMenuElement as BaseNodeModel).menu) { // 自定义节点的菜单
          defaultMenu = (showMenuElement as BaseNodeModel).menu;
        }
        break;
      case ModelType.EDGE:
      case ModelType.LINE_EDGE:
      case ModelType.POLYLINE_EDGE:
        defaultMenu = menuConfig.edgeMenu;
        break;
      case ModelType.GRAPH:
        defaultMenu = menuConfig.graphMenu;
        break;
      default:
        defaultMenu = [];
        break;
    }
    if (!defaultMenu || defaultMenu.length === 0) return;
    const menuItems = defaultMenu.map((item) => (
      <li
        className={item.className}
        dangerouslySetInnerHTML={{ __html: item.text }}
        onClick={() => {
          // 将展示菜单的节点状态恢复到默认
          showMenuElement.setElementState(ElementState.DEFAULT);
          item.callback(showMenuElement);
        }}
      >
        {item.text}
      </li>
    ));
    const { x, y } = (showMenuElement as BaseNodeModel).additionStateData;
    const style = {
      left: `${x}px`,
      top: `${y}px`,
      display: 'block',
    };
    return (
      <ul className="lf-menu" style={style}>
        {menuItems}
      </ul>
    );
  }
  render() {
    return this.getElementMenu();
  }
}
