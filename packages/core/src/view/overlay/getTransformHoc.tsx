import { h, Component, ComponentType } from 'preact';
import { GraphTransform } from '../../type';
import GraphModel from '../../model/GraphModel';

type IProps = {
  graphModel: GraphModel,
};

export default function getTransform<P>(WrappedComponent: ComponentType<P>) {
  return class extends Component<IProps & P> {
    getMatrixString(): GraphTransform {
      const { graphModel } = this.props;
      const {
        transformMatrix: {
          SCALE_X,
          SKEW_Y,
          SKEW_X,
          SCALE_Y,
          TRANSLATE_X,
          TRANSLATE_Y,
        },
      } = graphModel;
      const matrixString = `skew(${SKEW_X}deg,${SKEW_Y}deg) translate(${TRANSLATE_X}px, ${TRANSLATE_Y}px) scale(${SCALE_X}, ${SCALE_Y})`;
      return {
        transform: matrixString,
        transformOrigin: 'left top',
      };
    }
    render() {
      return <WrappedComponent {...this.props as P} transformStyle={this.getMatrixString()} />;
    }
  };
}
