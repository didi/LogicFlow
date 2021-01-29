/* tslint:disable */
/* eslint:disable */

import { Component, h } from 'preact';
// import { NodeConfig } from '../../src/type';
import './index.less';

type IProps = {
  // gridChange: () => void,
  changeNodeColor: (color) => void;
  // node: NodeConfig;
};

type IState = {
  color: string;
};

export default class NodeProperties extends Component<IProps, IState> {
  constructor(props) {
    super(props);
    const { node: { properties } } = props;
    this.state = {
      color: properties.background || '#FFFFFF',
    };
  }
  handleChangeComplete = (ev) => {
    const color = ev.target.value;
    this.setState({
      color,
    });
    const { changeNodeColor } = this.props;
    changeNodeColor(color);
  };
  render() {
    const { color } = this.state;
    return (
      <div className="node-properties">
        <div>填充和背景: </div>
        <div>
          <input type="color" value={color} onChange={this.handleChangeComplete} />
        </div>
      </div>
    );
  }
}
