/**
 * 菜单工具
 * 目前扩展性不强，需要考虑重新设计。
 */
import { h, Component } from 'preact';
import { observer } from 'mobx-react';
import LogicFlow from '../LogicFlow';
import GraphModel from '../model/GraphModel';
import BaseNodeModel from '../model/node/BaseNodeModel';

type IProps = {
  graphModel: GraphModel;
  logicFlow: LogicFlow;
};

@observer
export default class NodeSelectDecorate extends Component<IProps> {
  getNodeSelectDecorate() {
    const {
      graphModel: {
        selectedNode,
        transformMatrix,
      },
    } = this.props;
    if (selectedNode) {
      const {
        x, y, width, height, outlineColor,
      } = selectedNode as BaseNodeModel;
      const [left, top] = transformMatrix.CanvasPointToHtmlPoint([x, y]);
      const style = {
        left: `${left}px`,
        top: `${top}px`,
        width: `${width * transformMatrix.SCALE_X + 10}px`,
        height: `${height * transformMatrix.SCALE_Y + 10}px`,
        border: `1px dashed ${outlineColor}`,
      };
      return (
        <div className="lf-node-select-decorate" style={style} />
      );
    }
  }
  render() {
    return this.getNodeSelectDecorate();
  }
}
