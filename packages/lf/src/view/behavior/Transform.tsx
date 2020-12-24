import { h, Component } from 'preact';

export default class TransfromGraph extends Component {
  render() {
    const { children } = this.props;
    return (
      <g>
        {children}
      </g>
    );
  }
}
