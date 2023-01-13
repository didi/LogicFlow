import { h, Component } from 'preact';

export default class TransformGraph extends Component {
  render() {
    const { children } = this.props;
    return (
      <g>
        {children}
      </g>
    );
  }
}
