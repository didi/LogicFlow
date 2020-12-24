/* tslint:disable */
/* eslint:disable */

import { Component, h } from 'preact';

type IProps = {
  // gridChange: () => void,
};

type IState = {
};

export default class Setting extends Component<IProps, IState> {
  changeHandle = (e) => {
    console.log(e.target.checked);
    // const { gridChange } = this.props;
    // gridChange(e.target.checked);
  };
  render() {
    return (
      <div className="setting" style={{ display: 'none' }}>
        设置区
        <input
          type="checkbox"
          name="网格"
          onChange={this.changeHandle}
        />
      </div>
    );
  }
}
