import { h, Component } from 'preact';
// import Dragable from './Dragable';
import NodeHitable from './NodeHitable';
import BaseNodeModel from '../../model/node/BaseNodeModel';
import GraphModel from '../../model/GraphModel';
import EventEmitter from '../../event/eventEmitter';

type IProps = {
  model: BaseNodeModel;
  graphModel?: GraphModel;
  eventCenter: EventEmitter
};

class Behavior extends Component<IProps> {
  render() {
    const {
      children, model, eventCenter,
    } = this.props;
    return (
      // <Dragable model={model} eventCenter={eventCenter} type="NODE">
      <NodeHitable model={model} eventCenter={eventCenter}>
        {children}
      </NodeHitable>
      // </Dragable>
    );
  }
}

export default Behavior;
