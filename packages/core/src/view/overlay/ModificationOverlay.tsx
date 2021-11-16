import { h, Component } from 'preact';
import GraphModel from '../../model/GraphModel';

type IProps = {
  graphModel: GraphModel;
};

export default class ModificationOverlay extends Component<IProps> {
  render() {
    const {
      graphModel: {
        transformMatrix,
      },
    } = this.props;
    const { transform } = transformMatrix.getTransformStyle();
    const { children } = this.props;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        width="100%"
        height="100%"
        className="modification-overlay"
      >
        <g transform={transform}>
          {children}
        </g>
      </svg>
    );
  }
}
